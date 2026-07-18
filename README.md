# Old Farmer John Had a Farm — Author Website

A modern, animated rebuild of [authorglennmosby.com](https://authorglennmosby.com/) for Glenn Mosby's children's book *Old Farmer John Had a Farm*. Node/Express + a vanilla Vite frontend, GSAP/ScrollTrigger for scroll choreography, Lenis for smooth scroll, and a hand-built CSS 3D book, compass, and custom cursor as the signature interactions.

## Stack

- **Server**: Node 20+, Express, Nodemailer (contact form), Helmet, compression, rate limiting
- **Frontend build**: Vite (vanilla — no framework)
- **Animation**: GSAP 3 + ScrollTrigger + SplitText, Lenis smooth scroll
- **Styles**: hand-written CSS with custom properties (no Tailwind/Bootstrap)

## Project structure

```
server/index.js           Express server + static hosting (prod) + /api routes
server/products.js         Authoritative product/price catalog (server-trusted)
server/routes/contact.js   Contact form handler (Nodemailer, console fallback)
server/routes/checkout.js  Creates a Stripe Checkout Session (503s gracefully if Stripe isn't configured)
server/routes/webhook.js   Stripe webhook — on checkout.session.completed, appends to server/data/orders.json
server/data/orders.json    Fulfilled-order log written by the webhook (gitignored)
src/index.html              Home
src/book.html                The Book
src/author.html              About the Author
src/shop.html                 Merchandise
src/product-coloring-book.html  Coloring book + crayons product page
src/product-canvas-kit.html     Canvas kit product page (scene variations)
src/cart.html                    Cart
src/checkout.html                Checkout (shipping form → Stripe)
src/checkout-success.html        Stripe success_url target
src/contact.html              Contact
src/css/                      tokens.css, base.css, components.css, animations.css
src/js/                        main.js (entry) + cursor.js, hero.js, bookflip.js,
                                compass.js, scroll.js, nav.js, smoothScroll.js,
                                loader.js, pageTransitions.js, contact.js,
                                products.js (client catalog), cart.js (localStorage cart),
                                productPage.js, cartPage.js, checkoutPage.js, merchGallery.js
src/assets/                    images, hero video, favicons
public/                         robots.txt, sitemap.xml (served at site root)
```

## Setup

```bash
npm install
cp .env.example .env   # optional — see Environment variables below
npm run dev             # Vite dev server (5175) + API server (3120) concurrently
```

Open http://localhost:5175.

### Build & run in production

```bash
npm run build   # outputs to dist/
npm start        # NODE_ENV=production node server/index.js — serves dist/ + API
```

## Environment variables

Copy `.env.example` to `.env` and fill in as needed:

| Variable | Purpose |
|---|---|
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | SMTP credentials for the contact form. **Leave `SMTP_HOST` unset in development** — submissions are logged to the console instead of sent. |
| `CONTACT_TO` | Inbox that receives contact-form submissions. |
| `CONTACT_FROM_EMAIL` | From-address used when sending. |
| `API_PORT` | Port for the Express API in dev (default `3120`). |
| `STRIPE_SECRET_KEY` | Stripe secret key. **Leave unset to run with checkout disabled** — the checkout form shows a friendly "not available yet" message and the attempted order is logged to the console. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `/api/stripe/webhook` endpoint (from the Stripe CLI or Dashboard webhook config). Required for orders to be marked fulfilled. |

## E-commerce flow

- **Cart** is client-side only, persisted in `localStorage` (`src/js/cart.js`) — no server round-trip until checkout.
- **Checkout** (`src/js/checkoutPage.js`) posts `{ items, customer }` to `POST /api/checkout`. The server independently re-prices every line item from `server/products.js` — client-submitted prices are never trusted — then creates a Stripe Checkout Session and returns its `url` for the browser to redirect to.
- **Fulfillment**: Stripe redirects back to `checkout-success.html` and separately fires a `checkout.session.completed` webhook at `/api/stripe/webhook`, which appends the order to `server/data/orders.json`. This file-based log is a lightweight default for this project's scale — swap in a real database before this goes to meaningful volume.
- **To wire up real payments**: set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env` (or your host's env config), and point a Stripe webhook at `https://yourdomain.com/api/stripe/webhook` listening for `checkout.session.completed`. For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3120/api/stripe/webhook`.
- To add/change products or prices, edit **both** `src/js/products.js` (display) and `server/products.js` (authoritative pricing) — they're intentionally kept separate so a tampered client request can never change what's actually charged.

## Adding the real social links

The footer's Instagram and Facebook icons are placeholders — the live site has none configured. Update the `href="#"` on the two `data-social="instagram"` / `data-social="facebook"` links in each page's footer (`src/index.html`, `src/book.html`, `src/author.html`, `src/shop.html`, `src/contact.html`) once you have the real profile URLs.

## Notes

- The hero video was sourced from the live site (`0_Blue_Sky_White_Clouds_1920x1080.mp4`), compressed with ffmpeg to ~3.5MB h264 with no audio track, with a poster frame generated from the first video frame.
- The "Merchandise" page lists two real products (coloring book + crayon set, paint-your-own canvas kit) linking to their own product pages, cart, and Stripe-backed checkout — see "E-commerce flow" above.
- The Ingram Spark link is a `#` placeholder, matching the live site (no URL was published there either).
- All motion respects `prefers-reduced-motion: reduce` — video, cursor, compass, and bookflip effects collapse to simple/static states.
