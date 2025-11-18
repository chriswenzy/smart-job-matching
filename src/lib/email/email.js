// lib/email.js
import nodemailer from "nodemailer";

// Create transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
  },
});

export async function sendEmail({ to, subject, html, text }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@smartjobmatch.com",
      to,
      subject,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name) => ({
    subject: "Welcome to Smart Job Match!",
    html: `
      <h2>Welcome to Smart Job Match, ${name}!</h2>
      <p>Thank you for joining our platform. We're excited to help you find the perfect job match.</p>
      <p>Get started by completing your profile to get better job recommendations.</p>
      <p>Best regards,<br>The Smart Job Match Team</p>
    `,
  }),
  passwordReset: (resetUrl) => ({
    subject: "Password Reset Request - Smart Job Match",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your Smart Job Match account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `,
  }),
};
