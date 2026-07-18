const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONFETTI_COLORS = ['#dc5446', '#fdcd04', '#322c2d', '#ffffff'];

function fireConfetti() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const count = 36;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.left = `${x}px`;
    piece.style.top = `${window.innerHeight * 0.35}px`;
    piece.style.background = color;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 260}px`);
    piece.style.setProperty('--spin', `${360 * (Math.random() > 0.5 ? 1 : -1) * 2}deg`);
    piece.style.setProperty('--fall-duration', `${1.8 + Math.random() * 1.2}s`);
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  function setError(field, message) {
    const input = form.querySelector(`#${field}`);
    if (!input) return;
    const wrapper = input.closest('.form-field');
    const errorEl = form.querySelector(`[data-error-for="${field}"]`);
    if (message) {
      wrapper.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
    } else {
      wrapper.classList.remove('has-error');
      if (errorEl) errorEl.hidden = true;
    }
  }

  function validateClient(data) {
    let valid = true;
    if (!data.name.trim()) {
      setError('name', 'Please enter your name.');
      valid = false;
    } else setError('name', null);

    if (!EMAIL_RE.test(data.email)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    } else setError('email', null);

    if (!data.message.trim() || data.message.trim().length < 10) {
      setError('message', 'Message must be at least 10 characters.');
      valid = false;
    } else setError('message', null);

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!validateClient(data)) {
      statusEl.textContent = 'Please fix the errors above.';
      statusEl.classList.add('error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, msg]) => setError(field, msg));
        }
        throw new Error(result.error || 'Please fix the errors above.');
      }

      form.reset();
      statusEl.textContent = "Thank you — your message has been sent. We'll be in touch soon.";
      statusEl.classList.add('success');
      fireConfetti();
    } catch (err) {
      statusEl.textContent = `${err.message || 'Something went wrong. Please try again.'} You can also email us directly at blackmantisprints@gmail.com.`;
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}
