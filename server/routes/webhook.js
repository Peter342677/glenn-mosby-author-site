import { Router } from 'express';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { getTransporter, getNotifyEmail, getFromEmail } from '../mailer.js';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const ordersFile = join(__dirname, '..', 'data', 'orders.json');

let cachedStripe = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (cachedStripe) return cachedStripe;
  cachedStripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return cachedStripe;
}

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
    console.log('[webhook] SMTP not configured — order notification not sent:', order);
    return;
  }
  try {
    await transporter.sendMail({
      from: getFromEmail(),
      to: getNotifyEmail(),
      subject: `New order — ${order.itemSummary || order.sessionId}`,
      text: `A new order was placed.\n\nSession: ${order.sessionId}\nAmount: $${(order.amountTotal / 100).toFixed(2)}\nCustomer: ${order.customerName || '—'} <${order.customerEmail || '—'}>\nAddress: ${order.address || '—'}, ${order.city || '—'} ${order.zip || '—'}\nItems: ${order.itemSummary || '—'}`,
    });
  } catch (err) {
    console.error('[webhook] order notification email failed:', err);
  }
}

router.post('/', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured.' });
  }

  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`[webhook] signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = {
      sessionId: session.id,
      amountTotal: session.amount_total,
      customerName: session.metadata?.customerName,
      customerEmail: session.customer_email || session.customer_details?.email,
      address: session.metadata?.address,
      city: session.metadata?.city,
      zip: session.metadata?.zip,
      itemSummary: session.metadata?.itemSummary,
      createdAt: new Date().toISOString(),
    };

    try {
      await appendOrder(order);
    } catch (err) {
      console.error('[webhook] failed to persist order:', err);
    }

    // Email failure must never block order persistence — it already
    // happened above, this is a best-effort notification only.
    await notifyOrder(order);
  }

  res.json({ received: true });
});

export default router;
