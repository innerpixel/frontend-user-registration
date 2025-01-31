import nodemailer from 'nodemailer';
import { createLogger } from './logger.js';

const logger = createLogger('emailService');

// Create reusable transporter for local Postfix
const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

export const sendVerificationEmail = async ({ to, token, username, displayName }) => {
    try {
        logger.info(`Sending verification email to: ${to}`);

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject: 'Verify Your Email - Cosmic User Registration',
            html: `
                <h2>Welcome to the Cosmic User Registration System</h2>
                <p>Hello ${displayName},</p>
                <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
                <p>
                    <a href="${verificationUrl}" style="
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    ">Verify Email</a>
                </p>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <h3>Your Account Details:</h3>
                <ul>
                    <li>Username: ${username}</li>
                    <li>Display Name: ${displayName}</li>
                    <li>System Email: ${username}@ld-csmlmail.test</li>
                </ul>
                <p>If you did not create this account, please ignore this email.</p>
                <p>Best regards,<br>Cosmic Registration Team</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        logger.info(`Verification email sent successfully to: ${to}`);
    } catch (error) {
        logger.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }
};
