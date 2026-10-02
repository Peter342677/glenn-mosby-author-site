// Site-wide accessibility toolbar: text size, contrast, link underlining,
// and reduced motion. Preferences persist per-browser via localStorage.
const STORAGE_KEY = 'ofjhaf-a11y-prefs';
const FONT_SCALES = [1, 1.125, 1.25, 1.4];

// Each toggle maps a pref key to a class on <html> (styled in accessibility.css).
const TOGGLE_GROUPS = [
  {
    title: 'Text',
    toggles: [
      { key: 'readableFont', label: 'Readable Font', className: 'a11y-readable-font' },
      { key: 'textSpacing', label: 'Text Spacing', className: 'a11y-text-spacing' },
    ],
  },
  {
    title: 'Display',
    toggles: [
      { key: 'highContrast', label: 'High Contrast', className: 'a11y-high-contrast' },
      { key: 'grayscale', label: 'Grayscale', className: 'a11y-grayscale' },
      { key: 'reduceMotion', label: 'Reduce Motion', className: 'a11y-reduce-motion' },
    ],
  },
  {
    title: 'Navigation',
    toggles: [
      { key: 'underlineLinks', label: 'Underline Links', className: 'a11y-underline-links' },
      { key: 'focusHighlight', label: 'Highlight Focus', className: 'a11y-focus-highlight' },
      { key: 'bigCursor', label: 'Big Cursor', className: 'a11y-big-cursor' },
      { key: 'hideCursorFx', label: 'Hide Cursor Effects', className: 'a11y-no-cursor-fx' },
      { key: 'readingGuide', label: 'Reading Guide', className: 'a11y-reading-guide-on' },
    ],
  },
];
const ALL_TOGGLES = TOGGLE_GROUPS.flatMap((g) => g.toggles);
const DEFAULT_PREFS = {
  fontScaleIndex: 0,
  ...Object.fromEntries(ALL_TOGGLES.map((t) => [t.key, false])),
};

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
  ALL_TOGGLES.forEach((t) => root.classList.toggle(t.className, !!prefs[t.key]));

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
    ${TOGGLE_GROUPS.map(
      (g) => `
    <h3 class="a11y-group-title">${g.title}</h3>
    ${g.toggles
      .map(
        (t) => `
    <label class="a11y-switch-row">
      <span>${t.label}</span>
      <input type="checkbox" data-a11y-toggle="${t.key}" />
    </label>`
      )
      .join('')}`
    ).join('')}
    <button type="button" class="a11y-reset-all" data-a11y-action="reset-all">Reset All</button>
  `;

  // Horizontal band that follows the pointer to help track lines of text.
  const guide = document.createElement('div');
  guide.className = 'a11y-reading-guide';
  guide.setAttribute('aria-hidden', 'true');
  window.addEventListener(
    'pointermove',
    (e) => {
      if (prefs.readingGuide) guide.style.transform = `translateY(${e.clientY - 22}px)`;
    },
    { passive: true }
  );

  document.body.append(toggleBtn, panel, guide);

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

// Small badge linking to our own real DMCA/copyright notice page — not a
// third-party verification seal, just a visible pointer to the actual policy.
export function initDmcaBadge() {
  const badge = document.createElement('a');
  badge.href = '/dmca.html';
  badge.className = 'dmca-badge';
  badge.setAttribute('aria-label', 'DMCA Protected — view our Copyright & DMCA Notice');
  badge.title = 'DMCA Protected — view our Copyright & DMCA Notice';
  badge.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2 3 6v6c0 5 3.8 8.6 9 10 5.2-1.4 9-5 9-10V6l-9-4z"/><path d="m9 12 2 2 4-4"/></svg>' +
    '<span>DMCA Protected</span>';
  document.body.append(badge);
}
