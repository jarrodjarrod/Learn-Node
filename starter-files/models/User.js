const mongoose = require('mongoose');
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Please provide an email address'],
    trim: true,
    validate: [validator.isEmail, 'Invalid email address'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  resetToken: String,
  resetTokenExpiry: Date,
  hearts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
});

User.virtual('gravatar').get(function () {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

User.plugin(passportLocalMongoose, { usernameField: 'email' });
User.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', User);
