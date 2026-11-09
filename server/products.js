// Authoritative product/price catalog for the server. Never trust prices
// submitted by the client — always look up the amount to charge from here
// when creating a Stripe Checkout Session.
export const PRODUCTS = {
  'gift-box': {
    name: 'Old Farmer John Gift Box',
    price: 3000,
    image: '/assets/img/merch/gift-box.jpg',
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
  'travel-cup': {
    name: "Old Farmer John Traveler's Cup",
    price: 500,
    image: '/assets/img/merch/travel-cup.jpg',
    variations: {
      black: 'Black Lid',
      purple: 'Purple Lid',
    },
  },
  // Closes at the end of Dec 25, 2026 US Eastern; checkout rejects it after.
  'christmas-raffle': {
    name: '2-Year Anniversary Christmas Raffle Entry',
    price: 200,
    image: '/assets/img/merch/christmas-raffle-prize.jpg',
    variations: null,
    endsAt: Date.parse('2026-12-26T04:59:59Z'),
  },
};

export function getProduct(id) {
  return PRODUCTS[id] || null;
}
