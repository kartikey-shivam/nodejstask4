const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  const tranporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    message: options.message,
  };
  await tranporter.sendMail(mailOptions);
};

module.exports = sendEmail;
