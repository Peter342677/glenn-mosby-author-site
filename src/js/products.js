// Single source of truth for product display data on the client. Prices
// shown here are for rendering only — the server independently looks up
// authoritative prices in server/products.js before creating a Stripe
// Checkout Session, so a tampered client price can never affect what's
// actually charged.
export const PRODUCTS = [
  {
    id: 'coloring-book',
    name: 'Old Farmer John Had a Farm Coloring Book + 24-Piece Crayon Set',
    price: 2500,
    image: '/assets/img/merch/coloring-book.webp',
    gallery: ['/assets/img/merch/coloring-book.webp'],
    description:
      "A full coloring book starring Old Farmer John and his farmyard friends, bundled with a 24-count box of non-toxic crayons — ready to color, play and imagine.",
    details: [
      'Full-length coloring book, illustrated farm scenes throughout',
      '24-piece non-toxic crayon set included',
      'Perfect for young fans of Old Farmer John Had a Farm',
    ],
    variations: null,
  },
  {
    id: 'canvas-kit',
    name: 'Paint Your Own Canvas Kit',
    price: 2500,
    image: '/assets/img/merch/canvas-kit-1.webp',
    gallery: [
      '/assets/img/merch/canvas-kit-1.webp',
      '/assets/img/merch/canvas-kit-2.webp',
      '/assets/img/merch/canvas-kit-3.webp',
      '/assets/img/merch/canvas-kit-4.webp',
    ],
    description:
      'A pre-printed farm-scene canvas with acrylic paints, three brushes and an easy-to-follow guide.',
    details: ['1 pre-printed canvas', 'Acrylic paints', '3 paint brushes', 'Easy-to-follow guide'],
    variations: [
      { id: 'farm-fun', label: 'Farm Fun', image: '/assets/img/merch/canvas-kit-1.webp' },
      { id: 'fun-on-the-farm', label: 'Fun on the Farm', image: '/assets/img/merch/canvas-kit-2.webp' },
      { id: 'farm-friends', label: 'Farm Friends', image: '/assets/img/merch/canvas-kit-3.webp' },
      { id: 'safari-adventure', label: 'Safari Adventure', image: '/assets/img/merch/canvas-kit-4.webp' },
    ],
  },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
