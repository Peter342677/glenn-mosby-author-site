/** Slowly cross-fades through a product's variation photos. Static on the
 * first image under prefers-reduced-motion. */
export function initMerchGallery() {
  const galleries = document.querySelectorAll('.merch-gallery');
  if (!galleries.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  galleries.forEach((gallery) => {
    const photos = gallery.querySelectorAll('.merch-photo');
    if (photos.length < 2) return;

    let index = 0;
    setInterval(() => {
      photos[index].classList.remove('is-active');
      index = (index + 1) % photos.length;
      photos[index].classList.add('is-active');
    }, 3200);
  });
}
