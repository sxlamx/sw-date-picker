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

function _compareISODate(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  if (a.m !== b.m) return a.m - b.m;
  return a.d - b.d;
}

export class DateRangeState {
  constructor() {
    this._start = null;
    this._end = null;
  }
  setStart(iso) {
    this._start = iso ? { ...iso } : null;
    this._normalize();
  }
  setEnd(iso) {
    this._end = iso ? { ...iso } : null;
    this._normalize();
  }
  _normalize() {
    if (this._start && this._end && _compareISODate(this._start, this._end) > 0) {
      [this._start, this._end] = [this._end, this._start];
    }
  }
  getStart() {
    return this._start ? { ...this._start } : null;
  }
  getEnd() {
    return this._end ? { ...this._end } : null;
  }
  isComplete() {
    return !!(this._start && this._end);
  }
  clear() {
    this._start = null;
    this._end = null;
  }
}
