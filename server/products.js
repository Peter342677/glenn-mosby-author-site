// Authoritative product/price catalog for the server. Never trust prices
// submitted by the client — always look up the amount to charge from here
// when creating a Stripe Checkout Session.
export const PRODUCTS = {
  'coloring-book': {
    name: 'Old Farmer John Had a Farm Coloring Book + 24-Piece Crayon Set',
    price: 2500,
    image: '/assets/img/merch/coloring-book.webp',
    variations: null,
  },
  'canvas-kit': {
    name: 'Paint Your Own Canvas Kit',
    price: 2500,
    image: '/assets/img/merch/canvas-kit-1.webp',
    variations: {
      'farm-fun': 'Farm Fun',
      'fun-on-the-farm': 'Fun on the Farm',
      'farm-friends': 'Farm Friends',
      'safari-adventure': 'Safari Adventure',
    },
  },
};

export function getProduct(id) {
  return PRODUCTS[id] || null;
}
