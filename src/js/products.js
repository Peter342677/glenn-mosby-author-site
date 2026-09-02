// Client-side display catalog — mirrors server/products.js for rendering
// only. The server independently re-prices everything at checkout, so
// nothing here is trusted for payment.
export const PRODUCTS = [
  {
    id: 'gift-set',
    name: 'Old Farmer John Had a Farm — Gift Set',
    price: 5000,
    image: '/assets/img/merch/gift-set.jpg',
    badge: 'Best Value',
    description:
      'The complete farmyard bundle: the picture book, the coloring book with a 24-count Crayola crayon set, a canvas & paints set, and a Farmer John traveler\'s cup — everything in one gift.',
  },
  {
    id: 'book-package',
    name: 'Old Farmer John Had a Farm — Book Package',
    price: 4000,
    image: '/assets/img/merch/gift-set.jpg',
    description:
      'The paperback book, coloring book & crayons set, and a traveler\'s cup — a smaller bundle for gifting or read-aloud time on the go.',
  },
  {
    id: 'hardback-book',
    name: 'Old Farmer John Had a Farm — Hardcover Book',
    price: 2500,
    image: '/assets/img/merch/book-hardback.jpg',
    description:
      'The full story of Old Farmer John and his unforgettable animals, in a durable hardcover edition built to last through many read-alouds.',
  },
  {
    id: 'paperback-book',
    name: 'Old Farmer John Had a Farm — Paperback Book',
    price: 1500,
    image: '/assets/img/merch/book-paperback.jpg',
    description:
      'The same joyful farm adventure in a lightweight paperback — easy to toss in a bag for storytime anywhere.',
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
    id: 'canvas',
    name: 'Farm Scene Canvas (Unpainted)',
    price: 1000,
    image: '/assets/img/merch/canvas-paint-set.jpg',
    description:
      'Just the pre-sketched farm scene canvas, for families who already have paints at home.',
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
