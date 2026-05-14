import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mechanic1quickresq@gmail.com",
    pass: "uwtqqrqxexqdmjnj"
  }
});

const sendEmail = async (to, subject, html, attachmentPath = null) => {
  try {

    const mailOptions = {
      from: `"Quick-ResQ" <mechanic1quickresq@gmail.com>`,
      to,
      subject,
      html
    };

    // ✅ Attachment support
    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: "invoice.pdf",
          path: attachmentPath
        }
      ];
    }

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent to:", to);

  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

export default sendEmail;