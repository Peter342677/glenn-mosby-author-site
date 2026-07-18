import nodemailer from 'nodemailer';

let cachedTransporter = null;

/** Returns a shared Nodemailer transporter, or null if SMTP isn't
 * configured — callers should fall back to logging in that case. */
export function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  return cachedTransporter;
}

export function getNotifyEmail() {
  return process.env.CONTACT_TO || 'info@authorglennmosby.com';
}

export function getFromEmail() {
  return process.env.CONTACT_FROM_EMAIL || `"Old Farmer John Had a Farm" <no-reply@authorglennmosby.com>`;
}
