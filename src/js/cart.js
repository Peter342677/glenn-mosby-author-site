import { getProduct, formatPrice } from './products.js';

const STORAGE_KEY = 'ofj-cart';

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  updateCartBadge();
  window.dispatchEvent(new CustomEvent('cart:change', { detail: { items } }));
}

function lineKey(productId, variationId) {
  return variationId ? `${productId}::${variationId}` : productId;
}

export function getCart() {
  return readCart();
}

export function addToCart(productId, variationId, qty = 1) {
  const product = getProduct(productId);
  if (!product) return;
  const variation = product.variations?.find((v) => v.id === variationId) || null;

  const items = readCart();
  const key = lineKey(productId, variationId);
  const existing = items.find((item) => lineKey(item.productId, item.variationId) === key);

  if (existing) {
    existing.qty += qty;
  } else {
    items.push({
      productId,
      variationId: variation?.id || null,
      variationLabel: variation?.label || null,
      qty,
    });
  }
  writeCart(items);
}

export function updateQty(productId, variationId, qty) {
  const items = readCart();
  const key = lineKey(productId, variationId);
  const next = items
    .map((item) => (lineKey(item.productId, item.variationId) === key ? { ...item, qty } : item))
    .filter((item) => item.qty > 0);
  writeCart(next);
}

export function removeFromCart(productId, variationId) {
  const items = readCart().filter(
    (item) => lineKey(item.productId, item.variationId) !== lineKey(productId, variationId)
  );
  writeCart(items);
}

export function clearCart() {
  writeCart([]);
}

/** Cart items enriched with live product data (name/price/image), skipping
 * any line whose product no longer exists in the catalog. */
export function getEnrichedCart() {
  return readCart()
    .map((item) => {
      const product = getProduct(item.productId);
      if (!product) return null;
      const variation = product.variations?.find((v) => v.id === item.variationId) || null;
      return {
        ...item,
        name: product.name,
        price: product.price,
        image: variation?.image || product.image,
        variationLabel: variation?.label || null,
      };
    })
    .filter(Boolean);
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal() {
  return getEnrichedCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = String(count);
  badge.hidden = count === 0;
}

export { formatPrice };

export function initCartBadge() {
  updateCartBadge();
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) updateCartBadge();
  });
}
