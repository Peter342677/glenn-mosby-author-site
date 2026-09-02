// Authoritative product/price catalog for the server. Never trust prices
// submitted by the client — always look up the amount to charge from here
// when creating a Stripe Checkout Session.
export const PRODUCTS = {
  'hardback-book': {
    name: 'Old Farmer John Had a Farm — Hardcover Book',
    price: 2500,
    image: '/assets/img/merch/book-hardback.jpg',
    variations: null,
  },
  'paperback-book': {
    name: 'Old Farmer John Had a Farm — Paperback Book',
    price: 1500,
    image: '/assets/img/merch/book-paperback.jpg',
    variations: null,
  },
  'coloring-crayons': {
    name: 'Coloring Book & Crayons Set',
    price: 1000,
    image: '/assets/img/merch/coloring-book-crayons.jpg',
    variations: null,
  },
  'canvas-paint-set': {
    name: 'Canvas & Paints Set',
    price: 2000,
    image: '/assets/img/merch/canvas-paint-set.jpg',
    variations: null,
  },
  canvas: {
    name: 'Farm Scene Canvas (Unpainted)',
    price: 1000,
    image: '/assets/img/merch/canvas-paint-set.jpg',
    variations: null,
  },
  'travel-cup': {
    name: "Old Farmer John Traveler's Cup",
    price: 500,
    image: '/assets/img/merch/travel-cup.jpg',
    variations: {
      black: 'Black Lid',
      purple: 'Purple Lid',
    },
  },
  'book-package': {
    name: 'Old Farmer John Had a Farm — Book Package',
    price: 4000,
    image: '/assets/img/merch/gift-set.jpg',
    variations: null,
  },
  'gift-set': {
    name: 'Old Farmer John Had a Farm — Gift Set',
    price: 5000,
    image: '/assets/img/merch/gift-set.jpg',
    variations: null,
  },
  'anniversary-raffle': {
    name: '2-Year Anniversary Raffle Entry',
    price: 200,
    image: '/assets/img/merch/anniversary-gift-set.jpg',
    variations: null,
  },
};

export function getProduct(id) {
  return PRODUCTS[id] || null;
}
