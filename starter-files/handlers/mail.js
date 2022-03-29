const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const { convert } = require('html-to-text');

const {
  MAIL_HOST: host,
  MAIL_PORT: port,
  MAIL_USER: user,
  MAIL_PASS: pass,
} = process.env;

const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass },
});

const generateHtml = (filename, options = {}) =>
  juice(pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options));

exports.send = async (options) => {
  const html = generateHtml(options.filename, options);
  const text = convert(html);
  transport.sendMail({
    from: `Jarrod Membrey <noreply@devleg.com`,
    subject: options.subject,
    to: options.user.email,
    html,
    text,
  });
};
