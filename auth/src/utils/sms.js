import twilio from 'twilio';
import { createLogger } from './logger.js';

const logger = createLogger('sms.utils');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendVerificationSMS = async (phoneNumber, code) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Development mode: SMS code for ${phoneNumber} is ${code}`);
      return;
    }

    await client.messages.create({
      body: `Your CSMCL verification code is: ${code}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    logger.info(`Verification SMS sent to ${phoneNumber}`);
  } catch (error) {
    logger.error('Failed to send verification SMS:', error);
    throw error;
  }
};
