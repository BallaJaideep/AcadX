import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  console.log("Testing Nodemailer...");
  console.log("Email User:", process.env.EMAIL_USER);
  console.log("Email Pass set?", !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to self to test
      subject: "Test Email from Node.js",
      text: "This is a test email to verify Nodemailer configuration.",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send email.");
    console.error("Error Message:", err.message);
    console.error("Full Error:", err);
  }
}

testEmail();
