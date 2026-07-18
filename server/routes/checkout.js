import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
import { getProduct } from '../products.js';

const router = Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many checkout attempts. Please try again later.' },
});

let cachedStripe = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (cachedStripe) return cachedStripe;
  cachedStripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return cachedStripe;
}

function sanitize(value, maxLen) {
  return String(value ?? '').trim().replace(/[<>]/g, '').slice(0, maxLen);
}

router.post('/', checkoutLimiter, async (req, res) => {
  const { items, customer } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  // Recompute every line item from the server's own catalog — never trust
  // a price or product name submitted by the client.
  const lineItems = [];
  for (const item of items) {
    const product = getProduct(item.productId);
    if (!product) {
      return res.status(400).json({ error: `Unknown product: ${item.productId}` });
    }
    const qty = Math.min(20, Math.max(1, Number(item.qty) || 1));

    let variationLabel = null;
    if (product.variations) {
      variationLabel = product.variations[item.variationId];
      if (!variationLabel) {
        return res.status(400).json({ error: `Unknown variation for ${product.name}.` });
      }
    }

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: variationLabel ? `${product.name} — ${variationLabel}` : product.name,
          images: [`${req.protocol}://${req.get('host')}${product.image}`],
        },
        unit_amount: product.price,
      },
      quantity: qty,
    });
  }

  const customerName = sanitize(customer?.name, 100);
  const customerEmail = sanitize(customer?.email, 150);
  const address = sanitize(customer?.address, 200);
  const city = sanitize(customer?.city, 100);
  const zip = sanitize(customer?.zip, 20);

  const stripe = getStripe();

  if (!stripe) {
    console.log('[checkout] Stripe not configured — order not placed. Details:', {
      items,
      customerName,
      customerEmail,
      address,
      city,
      zip,
    });
    return res.status(503).json({
      error:
        'Online payment isn’t available yet. Please check back soon, or contact us directly to place your order.',
    });
  }

  const origin = `${req.protocol}://${req.get('host')}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      success_url: `${origin}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout.html`,
      metadata: {
        customerName,
        address,
        city,
        zip,
        itemSummary: items
          .map((i) => `${i.productId}${i.variationId ? `:${i.variationId}` : ''} x${i.qty}`)
          .join(', ')
          .slice(0, 490),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe session creation failed:', err);
    res.status(502).json({ error: 'Could not start checkout right now. Please try again shortly.' });
  }
});

export default router;
