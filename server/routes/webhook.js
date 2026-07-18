import { Router } from 'express';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { getTransporter, getNotifyEmail, getFromEmail } from '../mailer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ordersFile = join(__dirname, '..', 'data', 'orders.json');

const router = Router();

async function appendOrder(order) {
  await mkdir(dirname(ordersFile), { recursive: true });
  let orders = [];
  try {
    orders = JSON.parse(await readFile(ordersFile, 'utf-8'));
  } catch {
    orders = [];
  }
  orders.push(order);
  await writeFile(ordersFile, JSON.stringify(orders, null, 2));
}

async function notifyOrder(order) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[webhook] SMTP not configured — order notification not sent.');
    return;
  }

  const amount = ((order.amountTotal || 0) / 100).toFixed(2);
  const meta = order.metadata || {};

  await transporter.sendMail({
    from: getFromEmail(),
    to: getNotifyEmail(),
    replyTo: order.customerEmail || undefined,
    subject: `New order — $${amount} (${order.id})`,
    text: [
      `A new order was placed on the website.`,
      ``,
      `Order ID: ${order.id}`,
      `Amount: $${amount} ${(order.currency || 'usd').toUpperCase()}`,
      `Customer email: ${order.customerEmail || '—'}`,
      `Customer name: ${meta.customerName || '—'}`,
      `Shipping address: ${meta.address || '—'}, ${meta.city || '—'} ${meta.zip || ''}`.trim(),
      `Items: ${meta.itemSummary || '—'}`,
    ].join('\n'),
  });
}

// Mounted with express.raw() in server/index.js — req.body here is a
// Buffer, required for Stripe's signature verification.
router.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeKey) {
    console.log('[webhook] Stripe not configured — ignoring incoming webhook.');
    return res.status(503).send('Stripe not configured');
  }

  const stripe = new Stripe(stripeKey);
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = {
      id: session.id,
      createdAt: new Date(session.created * 1000).toISOString(),
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email || session.customer_details?.email || null,
      metadata: session.metadata,
    };
    console.log('[webhook] order fulfilled:', order);
    try {
      await appendOrder(order);
    } catch (err) {
      console.error('[webhook] failed to persist order:', err);
    }
    try {
      await notifyOrder(order);
    } catch (err) {
      console.error('[webhook] order notification email failed:', err);
    }
  }

  res.status(200).json({ received: true });
});

export default router;
