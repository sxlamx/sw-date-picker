export class SelectionState {
  constructor() {
    this._sel = null;
  }
  set(iso) {
    this._sel = iso ? { ...iso } : null;
  }
  get() {
    return this._sel ? { ...this._sel } : null;
  }
  clear() {
    this._sel = null;
  }
}
