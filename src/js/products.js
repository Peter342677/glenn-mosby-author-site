// Client-side display catalog — mirrors server/products.js for rendering
// only. The server independently re-prices everything at checkout, so
// nothing here is trusted for payment.
export const PRODUCTS = [
  {
    id: 'gift-box',
    name: 'Old Farmer John Gift Box',
    price: 3000,
    regularPrice: 5000,
    value: 6000,
    image: '/assets/img/merch/gift-box.jpg',
    badge: 'Christmas Sale',
    description:
      'A ready-to-gift box packed with fun for young readers, inspired by Old Farmer John Had a Farm. A perfect Christmas present.',
  },
  {
    id: 'merch-package',
    name: 'Old Farmer John Had a Farm — Gift Package',
    price: 4000,
    image: '/assets/img/merch/gift-set.jpg',
    badge: 'Best Value',
    description:
      'The coloring book with a 24-count Crayola crayon set, a canvas & paints set, and a Farmer John traveler\'s cup, packaged together as a gift.',
  },
  {
    id: 'coloring-crayons',
    name: 'Coloring Book & Crayons Set',
    price: 1000,
    image: '/assets/img/merch/coloring-book-crayons.jpg',
    description:
      'A full coloring book of Old Farmer John\'s animals paired with a 24-count box of Crayola crayons — ready to color right out of the box.',
  },
  {
    id: 'canvas-paint-set',
    name: 'Canvas & Paints Set',
    price: 2000,
    image: '/assets/img/merch/canvas-paint-set.jpg',
    description:
      'A pre-sketched farm scene canvas featuring Farmer John and friends, paired with a set of acrylic paints — a fun paint-your-own-masterpiece afternoon.',
  },
  {
    id: 'travel-cup',
    name: "Old Farmer John Traveler's Cup",
    price: 500,
    image: '/assets/img/merch/travel-cup.jpg',
    description:
      'An insulated travel cup featuring Farmer John artwork — pick a black or purple lid.',
    variations: [
      { id: 'black', label: 'Black Lid' },
      { id: 'purple', label: 'Purple Lid' },
    ],
  },
];

// Christmas raffle: sold from the raffle section on shop.html, so it stays out
// of PRODUCTS (which drives the merch grid). Closes at the end of Dec 25, 2026
// US Eastern; after that it resolves to null so it can't be bought or shown
// in a saved cart.
const RAFFLE_ENDS_AT = Date.parse('2026-12-26T04:59:59Z');
const RAFFLE_ENTRY = {
  id: 'christmas-raffle',
  name: '2-Year Anniversary Christmas Raffle Entry',
  price: 200,
  image: '/assets/img/merch/christmas-raffle-prize.jpg',
};

export function isRaffleOpen() {
  return Date.now() <= RAFFLE_ENDS_AT;
}

export function getProductById(id) {
  if (id === RAFFLE_ENTRY.id) return isRaffleOpen() ? RAFFLE_ENTRY : null;
  return PRODUCTS.find((p) => p.id === id) || null;
}
