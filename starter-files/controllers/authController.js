const passport = require('passport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Login failed ☠️',
  successRedirect: '/',
  successFlash: 'Login successful ✅',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Logged out 👋');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Oops! You need to be logged in to do that');
  res.redirect('/login');
};

exports.forgotPassword = (req, res) => res.render('forgot');

exports.emailPasswordReset = async (req, res) => {
  const { errors } = validationResult(req);
  if (errors.length) {
    req.flash(
      'error',
      errors.map((error) => error.msg)
    );

    res.render('forgot', {
      flashes: req.flash(),
    });
  }
  // 1. see if a user exists with that email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists.');
    res.redirect('back');
  }
  // 2. set reset token and expiry on their account
  user.resetToken = crypto.randomBytes(20).toString('hex');
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 60;
  await user.save();
  // 3. send them an email with the reset token
  await mail.send({
    user,
    subject: 'Password Reset',
    resetURL: `http://${req.headers.host}/account/reset/${user.resetToken}`,
    filename: 'password-reset',
  });

  req.flash(
    'success',
    `You've been sent an email with a link to reset your password.`
  );
  // // 4. redirect them to the login page once they've reset their password
  res.redirect('/login');
};

exports.checkToken = async (req, res, next) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired');
    res.redirect('/login/forgot');
  }
  res.locals.userForPasswordReset = user;
  next();
};

exports.checkPasswords = async (req, res, next) => {
  if (req.body['new-password'] !== req.body['confirm-password']) {
    req.flash('error', 'Passwords do not match');
    res.redirect('back');
  }
  next();
};

exports.setNewPassword = async (req, res) => {
  const { userForPasswordReset: user } = res.locals;
  await user.setPassword(req.body['new-password']);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await req.login(await user.save());
  req.flash('success', 'Your password has been reset! 🥳');
  res.redirect('/');
};
