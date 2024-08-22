const nodemailer = require("nodemailer");

const sendEmail = async (email, emailType, verificationCode) => { 
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.email_ID_CODE,
      pass: process.env.emailPassword,
    },
  });

  let mailOptions;

  if (emailType === "VERIFY") {
    mailOptions = {
      from: process.env.EMAIL_ID_CODE,
      to: email,
      subject: "Email Verification",
      text: `Your verification code is: ${verificationCode}`,
    };
  } else if (emailType === "RESET") {
    mailOptions = {
      from: process.env.EMAIL_ID_CODE,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is: ${verificationCode}`,
    };
  } else if (emailType === "FEEDBACK") {
    mailOptions = {
      from: "Connect@codesaarthi.com",
      to: `${email}`,
      subject: "Thank you for your feedback",
      html: `<p><b>Dear User,</b></p>
        <p>We apologize for any inconvenience you may have faced on our website. Your feedback is valuable to us, and we assure you that we are working to resolve the issue as soon as possible.</p>
        <p>Thank you for bringing this to our attention, and we appreciate your patience.</p>
        <p>Best regards,<br>Your Codesaarthi Team</p>`,
    };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
