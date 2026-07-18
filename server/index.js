import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import contactRouter from './routes/contact.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
// In dev, a shared launch harness may inject a generic PORT matching the Vite
// port — never honor it here, or the API server collides with the Vite dev
// server. In prod (no Vite process), hosting platforms set PORT, so honor it.
const PORT = isProd ? process.env.PORT || process.env.API_PORT || 3120 : process.env.API_PORT || 3120;
const distDir = join(__dirname, '..', 'dist');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(compression());

// Stripe webhook signature verification needs the raw request body, so it
// must be mounted with express.raw() ahead of the global express.json()
// parser below — otherwise the body would already be parsed/consumed.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookRouter);

app.use(express.json({ limit: '20kb' }));

app.use('/api/contact', contactRouter);
app.use('/api/checkout', checkoutRouter);

if (isProd) {
  app.use(
    express.static(distDir, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    })
  );

  const pages = {
    '/': 'index.html',
    '/book': 'book.html',
    '/author': 'author.html',
    '/shop': 'shop.html',
    '/contact': 'contact.html',
    '/cart': 'cart.html',
    '/checkout': 'checkout.html',
    '/checkout-success': 'checkout-success.html',
    '/product-coloring-book': 'product-coloring-book.html',
    '/product-canvas-kit': 'product-canvas-kit.html',
  };

  Object.entries(pages).forEach(([route, file]) => {
    app.get(route, (req, res) => res.sendFile(join(distDir, file)));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: isProd ? 'Something went wrong. Please try again.' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT} (${isProd ? 'production' : 'development'})`);
});
