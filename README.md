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
server/routes/contact.js   Contact form handler (Nodemailer, console fallback)
src/index.html              Home
src/book.html                The Book
src/author.html              About the Author
src/contact.html              Contact
src/css/                      tokens.css, base.css, components.css, animations.css
src/js/                        main.js (entry) + cursor.js, hero.js, bookflip.js,
                                compass.js, scroll.js, nav.js, smoothScroll.js,
                                loader.js, pageTransitions.js, contact.js
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

## Adding the real social links

The footer's Instagram and Facebook icons are placeholders — the live site has none configured. Update the `href="#"` on the two `data-social="instagram"` / `data-social="facebook"` links in each page's footer (`src/index.html`, `src/book.html`, `src/author.html`, `src/contact.html`) once you have the real profile URLs.

## Notes

- The hero video was sourced from the live site (`0_Blue_Sky_White_Clouds_1920x1080.mp4`), compressed with ffmpeg to ~3.5MB h264 with no audio track, with a poster frame generated from the first video frame.
- The Ingram Spark link is a `#` placeholder, matching the live site (no URL was published there either).
- All motion respects `prefers-reduced-motion: reduce` — video, cursor, compass, and bookflip effects collapse to simple/static states.
