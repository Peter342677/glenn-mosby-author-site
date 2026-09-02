const CART_KEY = 'ofjhaf-cart';

export function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadges();
}

export function addToCart(productId, variationId, qty) {
  const items = readCart();
  const existing = items.find((i) => i.productId === productId && i.variationId === variationId);
  if (existing) {
    existing.qty = Math.min(20, existing.qty + qty);
  } else {
    items.push({ productId, variationId: variationId || null, qty: Math.min(20, Math.max(1, qty)) });
  }
  writeCart(items);
}

export function updateQty(productId, variationId, qty) {
  const items = readCart();
  const item = items.find((i) => i.productId === productId && i.variationId === variationId);
  if (!item) return;
  item.qty = Math.min(20, Math.max(1, qty));
  writeCart(items);
}

export function removeFromCart(productId, variationId) {
  const items = readCart().filter((i) => !(i.productId === productId && i.variationId === variationId));
  writeCart(items);
}

export function cartCount() {
  return readCart().reduce((sum, i) => sum + i.qty, 0);
}

export function updateCartBadges() {
  const count = cartCount();
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
}

export function initCartBadge() {
  updateCartBadges();
}
