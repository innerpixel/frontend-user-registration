import nodemailer from 'nodemailer';
import { createLogger } from './logger.js';

const logger = createLogger('emailService');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
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
                    <li>System Email: ${username}@local.domain</li>
                </ul>
                <p>If you did not create this account, please ignore this email.</p>
                <p>Best regards,<br>Cosmic Registration Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Verification email sent to: ${to}`);

    } catch (error) {
        logger.error(`Failed to send verification email: ${error.message}`);
        throw new Error('Failed to send verification email');
    }
};
