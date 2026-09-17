// Client-side display catalog — mirrors server/products.js for rendering
// only. The server independently re-prices everything at checkout, so
// nothing here is trusted for payment.
//
// Books are not sold as merchandise — the hardcover and paperback are
// consolation prizes in the anniversary raffle only (see shop.html), not
// their own product card here.
export const PRODUCTS = [
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

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}
