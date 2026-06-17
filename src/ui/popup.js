const NAMESPACE = 'sw-datepicker';

export class Popup {
  constructor({ trigger, onClose, placement = 'auto' }) {
    this.trigger = trigger;
    this.onClose = onClose ?? (() => {});
    this.placement = placement;
    this._docClick = null;
    this._docClickTimer = null;
    this._esc = null;
    this._reposition = null;
    this.dialog = null;
  }

  position() {
    if (!this.dialog || !this.trigger) return;
    const rect = this.trigger.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    this.dialog.style.position = 'absolute';
    this.dialog.style.left = `${rect.left + scrollLeft}px`;

    let showAbove;
    if (this.placement === 'above') {
      showAbove = true;
    } else if (this.placement === 'below') {
      showAbove = false;
    } else {
      // auto: flip above if not enough space below
      const dialogHeight = this.dialog.offsetHeight;
      showAbove = (window.innerHeight - rect.bottom) < dialogHeight && rect.top >= dialogHeight;
    }

    this.dialog.style.top = showAbove
      ? `${rect.top + scrollTop - this.dialog.offsetHeight}px`
      : `${rect.bottom + scrollTop}px`;
  }

  open(content) {
    this.close();
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.dataset.namespace = NAMESPACE;
    dialog.appendChild(content);
    document.body.appendChild(dialog);
    this.dialog = dialog;

    // force layout so offsetHeight is available for 'above' placement
    void dialog.offsetHeight;
    this.position();

    this._docClick = (e) => {
      if (
        this.dialog &&
        !this.dialog.contains(e.target) &&
        e.target !== this.trigger &&
        !this.trigger.contains(e.target)
      ) {
        this.close();
      }
    };
    this._esc = (e) => {
      if (e.key === 'Escape') this.close();
    };
    this._reposition = () => this.position();

    // defer so the opening click doesn't immediately trigger close
    this._docClickTimer = setTimeout(() => {
      this._docClickTimer = null;
      if (!this.dialog) return;
      document.addEventListener('click', this._docClick, true);
    }, 0);
    document.addEventListener('keydown', this._esc, true);
    window.addEventListener('resize', this._reposition);
    window.addEventListener('scroll', this._reposition, true);
  }

  close() {
    const wasOpen = !!this.dialog;
    if (this._docClickTimer) {
      clearTimeout(this._docClickTimer);
      this._docClickTimer = null;
    }
    if (this._docClick) {
      document.removeEventListener('click', this._docClick, true);
      this._docClick = null;
    }
    if (this._esc) {
      document.removeEventListener('keydown', this._esc, true);
      this._esc = null;
    }
    if (this._reposition) {
      window.removeEventListener('resize', this._reposition);
      window.removeEventListener('scroll', this._reposition, true);
      this._reposition = null;
    }
    if (this.dialog && this.dialog.parentNode) {
      this.dialog.parentNode.removeChild(this.dialog);
    }
    this.dialog = null;
    if (wasOpen) this.onClose();
  }

  destroy() {
    this.close();
  }
}
