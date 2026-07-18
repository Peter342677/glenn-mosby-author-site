import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getTransporter, getNotifyEmail, getFromEmail } from '../mailer.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value, maxLen) {
  return String(value ?? '')
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, maxLen);
}

function validate(body) {
  const errors = {};
  const name = sanitize(body.name, 100);
  const email = sanitize(body.email, 150);
  const subject = sanitize(body.subject, 150);
  const message = sanitize(body.message, 2000);

  if (!name) errors.name = 'Name is required.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'A valid email is required.';
  if (!message || message.length < 10) errors.message = 'Message must be at least 10 characters.';

  return { errors, data: { name, email, subject, message } };
}

router.post('/', contactLimiter, async (req, res) => {
  // Honeypot: bots fill hidden fields, real users leave it blank.
  if (req.body.company) {
    return res.status(200).json({ success: true });
  }

  const { errors, data } = validate(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const transporter = getTransporter();
  const to = getNotifyEmail();

  if (!transporter) {
    console.log('[contact] SMTP not configured — logging submission instead:', data);
    return res.status(200).json({ success: true });
  }

  try {
    await transporter.sendMail({
      from: getFromEmail(),
      to,
      replyTo: data.email,
      subject: data.subject ? `[Website] ${data.subject}` : `New message from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject || '—'}\n\n${data.message}`,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[contact] send failed:', err);
    res.status(502).json({ error: 'Could not send your message right now. Please try again shortly.' });
  }
});

export default router;
