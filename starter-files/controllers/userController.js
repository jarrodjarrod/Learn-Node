const { body, validationResult } = require('express-validator');
const User = require('../models/User');

exports.loginForm = (_, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (_, res) => {
  res.render('register', { title: 'Register' });
};

exports.registerValidations = [
  body('name', 'Please provide a name').notEmpty(),

  body('email')
    .isEmail()
    .withMessage("That's not a valid email")
    .normalizeEmail({
      remove_dots: false,
      remove_extension: false,
      gmail_remove_subaddress: false,
    }),

  body('password').notEmpty().withMessage('Password cannot be blank'),

  body('password-confirm')
    .notEmpty()
    .withMessage('Confirm Password cannot be blank'),

  body('password-confirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage(
      'Password confirmation field must have the same value as the password field'
    ),
];

exports.validateRegister = (req, res, next) => {
  const { errors } = validationResult(req);

  if (!errors.length) return next();

  req.flash(
    'error',
    errors.map((err) => err.msg)
  );

  res.render('register', {
    title: 'Register',
    body: req.body,
    flashes: req.flash(),
  });
};

exports.register = async (req, res, next) => {
  const user = new User(req.body);
  await User.register(user, req.body.password);
  next();
};

exports.getAccount = (req, res) => {
  res.render('account', { title: 'Account Details' });
};

exports.updateAccountValidations = [
  body('name', 'Please provide a name').notEmpty(),

  body('email')
    .isEmail()
    .withMessage("That's not a valid email")
    .normalizeEmail({
      remove_dots: false,
      remove_extension: false,
      gmail_remove_subaddress: false,
    }),
];

exports.validateAccountUpdate = (req, res, next) => {
  const { errors } = validationResult(req);

  if (!errors.length) return next();

  req.flash(
    'error',
    errors.map((err) => err.msg)
  );

  res.render('account', {
    title: 'Account Details',
    flashes: req.flash(),
  });
};

exports.updateAccount = async (req, res) => {
  const updates = { email: req.body.email, name: req.body.name };
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  if (req.user.email !== req.body.email) await req.login(user);
  req.flash('success', 'Account updated');
  res.redirect('/account');
};
