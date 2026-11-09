import { PRODUCTS, isRaffleOpen } from './products.js';
import { addToCart } from './cart.js';

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function renderCard(product) {
  const card = document.createElement('article');
  card.className = 'merch-card';

  const variationHtml = product.variations
    ? `<div class="variation-grid" data-variations>
        ${product.variations
          .map(
            (v, i) =>
              `<label class="variation-option${i === 0 ? ' is-selected' : ''}">
                <input type="radio" name="variation-${product.id}" value="${v.id}" ${i === 0 ? 'checked' : ''} hidden />
                ${v.label}
              </label>`
          )
          .join('')}
      </div>`
    : '';

  const gallery = product.gallery;
  const galleryHtml = gallery
    ? `<button type="button" class="merch-nav merch-prev" aria-label="Previous photo">&lsaquo;</button>
       <button type="button" class="merch-nav merch-next" aria-label="Next photo">&rsaquo;</button>
       <span class="merch-counter" aria-live="polite">1 / ${gallery.length}</span>`
    : '';
  const includesHtml = product.includes
    ? `<div class="merch-includes">
        <h4>What&rsquo;s inside</h4>
        <ul>${product.includes.map((item) => `<li>${item}</li>`).join('')}</ul>
      </div>`
    : '';

  card.innerHTML = `
    <div class="merch-media${gallery ? ' merch-media-gallery' : ''}">
      <img class="merch-photo is-active" src="${product.image}" alt="${product.name}" loading="lazy" />
      ${galleryHtml}
    </div>
    <div class="merch-body">
      ${product.badge ? `<span class="merch-badge">${product.badge}</span>` : ''}
      <h3>${product.name}</h3>
      <p class="product-price">${product.regularPrice ? `<s class="product-regular-price">${formatPrice(product.regularPrice)}</s> ` : ''}${formatPrice(product.price)}</p>
      ${product.value ? `<p class="product-value">Valued at ${formatPrice(product.value)}</p>` : ''}
      <p>${product.description}</p>
      ${includesHtml}
      ${variationHtml}
      <button type="button" class="btn btn-primary" data-add-to-cart data-cursor-label="Add">Add to Cart</button>
      <p class="add-to-cart-status" role="status" aria-live="polite"></p>
    </div>
  `;

  const variationInputs = card.querySelectorAll(`input[name="variation-${product.id}"]`);
  variationInputs.forEach((input) => {
    input.addEventListener('change', () => {
      card.querySelectorAll('.variation-option').forEach((opt) => opt.classList.remove('is-selected'));
      input.closest('.variation-option').classList.add('is-selected');
    });
  });

  if (gallery) {
    const photo = card.querySelector('.merch-photo');
    const counter = card.querySelector('.merch-counter');
    let index = 0;
    const show = (i) => {
      index = (i + gallery.length) % gallery.length;
      photo.src = gallery[index].src;
      photo.alt = gallery[index].alt;
      counter.textContent = `${index + 1} / ${gallery.length}`;
    };
    card.querySelector('.merch-prev').addEventListener('click', () => show(index - 1));
    card.querySelector('.merch-next').addEventListener('click', () => show(index + 1));
    card.addEventListener(
      'pointerenter',
      () => gallery.forEach((g) => { new Image().src = g.src; }),
      { once: true }
    );
  }

  const addBtn = card.querySelector('[data-add-to-cart]');
  const status = card.querySelector('.add-to-cart-status');
  addBtn.addEventListener('click', () => {
    const selectedVariation = card.querySelector(`input[name="variation-${product.id}"]:checked`);
    addToCart(product.id, selectedVariation ? selectedVariation.value : null, 1);
    status.textContent = 'Added to cart!';
    status.classList.add('success');
    setTimeout(() => {
      status.textContent = '';
      status.classList.remove('success');
    }, 2000);
  });

  return card;
}

export function initMerchGallery() {
  const grid = document.querySelector('[data-merch-grid]');
  if (grid) {
    PRODUCTS.forEach((product) => grid.appendChild(renderCard(product)));
  }

  const raffleSection = document.querySelector('[data-raffle-section]');
  if (raffleSection && !isRaffleOpen()) raffleSection.hidden = true;

  const raffleBtn = document.querySelector('[data-add-to-cart="christmas-raffle"]');
  if (raffleBtn) {
    raffleBtn.addEventListener('click', () => {
      addToCart('christmas-raffle', null, 1);
      const status = document.querySelector('[data-raffle-status]');
      if (status) {
        status.textContent = 'Raffle entry added to cart!';
        status.classList.add('success');
        setTimeout(() => {
          status.textContent = '';
          status.classList.remove('success');
        }, 2000);
      }
    });
  }
}
