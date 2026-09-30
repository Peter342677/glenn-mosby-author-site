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

// TEMPORARY site-wide maintenance mode. Flip to false and redeploy to bring
// the site back — kept as a hardcoded flag rather than an env var because
// Hostinger auto-deploys have been observed to silently wipe env vars.
const MAINTENANCE_MODE = true;
const MAINTENANCE_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Temporarily Unavailable</title>
<style>
  html, body { height: 100%; margin: 0; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #faf6ef;
    color: #2b2420;
    text-align: center;
    padding: 24px;
  }
  .card { max-width: 480px; }
  h1 { font-size: 1.5rem; margin: 0 0 12px; }
  p { font-size: 1.05rem; line-height: 1.5; color: #5a5148; margin: 0; }
</style>
</head>
<body>
  <div class="card">
    <h1>This site is temporarily unavailable.</h1>
    <p>Please contact your administrator.</p>
  </div>
</body>
</html>`;

if (MAINTENANCE_MODE) {
  app.use((req, res) => {
    res.status(503).set('Retry-After', '3600').type('html').send(MAINTENANCE_PAGE);
  });
}

// Hostinger's edge/CDN sits in front of the app as a single reverse proxy
// hop, so express-rate-limit needs `trust proxy` set to read the real
// client IP from X-Forwarded-For instead of throwing a ValidationError.
if (isProd) {
  app.set('trust proxy', 1);
}

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
    '/contact': 'contact.html',
    '/shop': 'shop.html',
    '/cart': 'cart.html',
    '/checkout': 'checkout.html',
    '/checkout-success': 'checkout-success.html',
    '/dmca': 'dmca.html',
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
