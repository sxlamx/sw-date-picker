const NAMESPACE = 'sw-datepicker';

export class Popup {
  constructor({ trigger, onClose }) {
    this.trigger = trigger;
    this.onClose = onClose ?? (() => {});
    this._docClick = null;
    this._esc = null;
    this.dialog = null;
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
    // Capture-phase listeners; trigger containment check guards against re-entry
    // when open() is called from a click handler on the trigger.
    document.addEventListener('click', this._docClick, true);
    document.addEventListener('keydown', this._esc, true);
  }

  close() {
    const wasOpen = !!this.dialog;
    if (this._docClick) {
      document.removeEventListener('click', this._docClick, true);
      this._docClick = null;
    }
    if (this._esc) {
      document.removeEventListener('keydown', this._esc, true);
      this._esc = null;
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
