export class FocusTrap {
  constructor(container) {
    this.container = container;
  }
  _focusables() {
    return Array.from(this.container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((el) => !el.disabled && el.offsetParent !== null);
  }
  next() {
    const els = this._focusables();
    if (!els.length) return;
    const idx = els.indexOf(document.activeElement);
    const next = els[(idx + 1) % els.length];
    next.focus();
  }
  prev() {
    const els = this._focusables();
    if (!els.length) return;
    const idx = els.indexOf(document.activeElement);
    const prev = els[(idx - 1 + els.length) % els.length];
    prev.focus();
  }
}

let _liveRegion = null;
export function announce(message) {
  if (!_liveRegion) {
    const el = document.createElement('div');
    el.setAttribute('aria-live', 'assertive');
    el.setAttribute('aria-atomic', 'true');
    el.style.position = 'absolute';
    el.style.left = '-10000px';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.overflow = 'hidden';
    document.body.appendChild(el);
    _liveRegion = el;
  }
  _liveRegion.textContent = message;
}
