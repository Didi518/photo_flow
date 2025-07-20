const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PhotoFlow - Partagez Votre Imagination" <${process.env.EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new AppError(
      "Une erreur s'est produite lors de l'envoi de l'email. Veuillez réessayer plus tard.",
      500
    );
  }
};
module.exports = sendEmail;
