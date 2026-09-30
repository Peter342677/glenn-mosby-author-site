// Site-wide accessibility toolbar: text size, contrast, link underlining,
// and reduced motion. Preferences persist per-browser via localStorage.
const STORAGE_KEY = 'ofjhaf-a11y-prefs';
const FONT_SCALES = [1, 1.125, 1.25, 1.4];
const DEFAULT_PREFS = { fontScaleIndex: 0, highContrast: false, underlineLinks: false, reduceMotion: false };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Private browsing or blocked storage — preference still applies for this page load.
  }
}

function applyPrefs(prefs) {
  const root = document.documentElement;
  root.style.setProperty('--a11y-font-scale', String(FONT_SCALES[prefs.fontScaleIndex] ?? 1));
  root.classList.toggle('a11y-high-contrast', !!prefs.highContrast);
  root.classList.toggle('a11y-underline-links', !!prefs.underlineLinks);
  root.classList.toggle('a11y-reduce-motion', !!prefs.reduceMotion);

  document.querySelectorAll('video[autoplay]').forEach((video) => {
    if (prefs.reduceMotion) video.pause();
    else video.play().catch(() => {});
  });
}

export function initAccessibilityToolbar() {
  let prefs = { ...DEFAULT_PREFS, ...(loadPrefs() || {}) };
  applyPrefs(prefs);

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'a11y-toggle';
  toggleBtn.setAttribute('aria-label', 'Accessibility options');
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', 'a11y-panel');
  toggleBtn.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="7.2" r="1.4" fill="currentColor" stroke="none"/><path d="M6.2 10.3c2-.75 3.9-1.1 5.8-1.1s3.8.35 5.8 1.1M12 9.2V17M9.2 20l2.8-3 2.8 3"/></svg>';

  const panel = document.createElement('div');
  panel.id = 'a11y-panel';
  panel.className = 'a11y-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Accessibility settings');
  panel.innerHTML = `
    <h2>Accessibility</h2>
    <div class="a11y-row">
      <span id="a11y-font-label">Text Size</span>
      <div class="a11y-btn-group" role="group" aria-labelledby="a11y-font-label">
        <button type="button" data-a11y-action="font-dec" aria-label="Decrease text size">A&minus;</button>
        <button type="button" data-a11y-action="font-reset" aria-label="Reset text size">A</button>
        <button type="button" data-a11y-action="font-inc" aria-label="Increase text size">A+</button>
      </div>
    </div>
    <label class="a11y-switch-row">
      <span>High Contrast</span>
      <input type="checkbox" data-a11y-toggle="highContrast" />
    </label>
    <label class="a11y-switch-row">
      <span>Underline Links</span>
      <input type="checkbox" data-a11y-toggle="underlineLinks" />
    </label>
    <label class="a11y-switch-row">
      <span>Reduce Motion</span>
      <input type="checkbox" data-a11y-toggle="reduceMotion" />
    </label>
    <button type="button" class="a11y-reset-all" data-a11y-action="reset-all">Reset All</button>
  `;

  document.body.append(toggleBtn, panel);

  const syncControls = () => {
    panel.querySelectorAll('[data-a11y-toggle]').forEach((input) => {
      input.checked = !!prefs[input.dataset.a11yToggle];
    });
  };
  syncControls();

  const update = (partial) => {
    prefs = { ...prefs, ...partial };
    applyPrefs(prefs);
    savePrefs(prefs);
    syncControls();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') closePanel({ focusToggle: true });
  };
  const onOutsideClick = (e) => {
    if (!panel.contains(e.target) && e.target !== toggleBtn) closePanel();
  };

  function openPanel() {
    panel.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onOutsideClick, true);
  }
  function closePanel({ focusToggle = false } = {}) {
    panel.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onOutsideClick, true);
    if (focusToggle) toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  panel.addEventListener('click', (e) => {
    const action = e.target.closest('[data-a11y-action]')?.dataset.a11yAction;
    if (!action) return;
    if (action === 'font-inc') update({ fontScaleIndex: Math.min(prefs.fontScaleIndex + 1, FONT_SCALES.length - 1) });
    else if (action === 'font-dec') update({ fontScaleIndex: Math.max(prefs.fontScaleIndex - 1, 0) });
    else if (action === 'font-reset') update({ fontScaleIndex: 0 });
    else if (action === 'reset-all') update({ ...DEFAULT_PREFS });
  });

  panel.addEventListener('change', (e) => {
    const key = e.target.dataset?.a11yToggle;
    if (key) update({ [key]: e.target.checked });
  });
}
