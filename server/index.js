import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import contactRouter from './routes/contact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
// In dev, a shared launch harness may inject a generic PORT matching the Vite
// port — never honor it here, or the API server collides with the Vite dev
// server. In prod (no Vite process), hosting platforms set PORT, so honor it.
const PORT = isProd ? process.env.PORT || process.env.API_PORT || 3120 : process.env.API_PORT || 3120;
const distDir = join(__dirname, '..', 'dist');

const app = express();

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

app.use(express.json({ limit: '20kb' }));

app.use('/api/contact', contactRouter);

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
