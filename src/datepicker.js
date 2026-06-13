import { todayISO, addDays, isSameISODate } from './core/date-engine.js';
import { resolveLocale, firstDayOfWeek, weekdayNames } from './core/locale-engine.js';
import { buildMonthMatrix, renderMonthGrid } from './ui/calendar.js';
import { Popup } from './ui/popup.js';
import { shiftView } from './ui/navigation.js';
import { keyToAction, ACTION } from './ui/keyboard.js';
import { announce } from './ui/accessibility.js';
import { SelectionState } from './ui/selection.js';

export class DatePicker {
  constructor(options = {}) {
    this.input = options.input ?? document.createElement('input');
    this.locale = resolveLocale(options.locale ?? 'en-US');
    this.minYear = options.minYear ?? 1900;
    this.maxYear = options.maxYear ?? 2100;
    this.mode = options.mode ?? 'date';
    this._onSelect = options.onSelect ?? (() => {});
    this._view = { y: new Date().getUTCFullYear(), m: new Date().getUTCMonth() + 1 };
    this._today = todayISO();
    this._selection = new SelectionState();
    this._popup = null;
    this._calendarRoot = null;
    this._openFocus = this._openFocus.bind(this);
    this._keyHandler = this._keyHandler.bind(this);
    this._clickHandler = this._clickHandler.bind(this);
    this._render = this._render.bind(this);

    this.input.addEventListener('focus', this._openFocus);
  }

  _openFocus() {
    this.open();
  }

  open() {
    if (this._popup) return;
    this._popup = new Popup({ trigger: this.input, onClose: () => this.destroy() });
    this._calendarRoot = document.createElement('div');
    this._calendarRoot.addEventListener('keydown', this._keyHandler);
    this._calendarRoot.addEventListener('click', this._clickHandler);
    this._popup.open(this._calendarRoot);
    this._render();
    const firstCell = this._calendarRoot.querySelector('[role="gridcell"]');
    if (firstCell) firstCell.focus();
  }

  _render() {
    const fday = firstDayOfWeek(this.locale);
    const names = weekdayNames(this.locale, 'short');
    renderMonthGrid(this._calendarRoot, {
      view: this._view,
      firstDayOfWeek: fday,
      today: this._today,
      selected: this._selection.get(),
      locale: this.locale,
      weekdayNames: names,
    });
    const label = `${this._view.y}-${String(this._view.m).padStart(2, '0')}`;
    announce(`Showing ${label}`);
  }

  _keyHandler(e) {
    const action = keyToAction(e.key, e.shiftKey, this._selection.get());
    if (!action) return;
    e.preventDefault();
    const selected = this._selection.get();
    let cursor = selected ? { ...selected } : { ...this._view, d: 1 };
    switch (action.type) {
      case ACTION.MOVE_DAY: {
        cursor = addDays(cursor, action.delta);
        break;
      }
      case ACTION.SHIFT_MONTH: {
        this._view = shiftView(this._view, action.delta, 0, this.minYear, this.maxYear);
        this._render();
        return;
      }
      case ACTION.SHIFT_YEAR: {
        this._view = shiftView(this._view, 0, action.delta, this.minYear, this.maxYear);
        this._render();
        return;
      }
      case ACTION.JUMP_START_OF_MONTH: {
        cursor = { ...this._view, d: 1 };
        break;
      }
      case ACTION.JUMP_END_OF_MONTH: {
        const dim = new Date(Date.UTC(this._view.y, this._view.m, 0)).getUTCDate();
        cursor = { ...this._view, d: dim };
        break;
      }
      case ACTION.SELECT: {
        if (selected) this._commit(selected);
        return;
      }
    }
    // Clamp year
    cursor.y = Math.min(Math.max(cursor.y, this.minYear), this.maxYear);
    this._selection.set(cursor);
    // Adjust view if cursor moved out of visible month
    if (cursor.m !== this._view.m || cursor.y !== this._view.y) {
      this._view = { y: cursor.y, m: cursor.m };
    }
    this._render();
    const cell = this._calendarRoot.querySelector(`[data-iso="${cursor.y}-${cursor.m}-${cursor.d}"]`);
    if (cell) cell.focus();
  }

  _clickHandler(e) {
    const cell = e.target.closest('[role="gridcell"]');
    if (!cell) return;
    const [y, m, d] = cell.dataset.iso.split('-').map(Number);
    const iso = { y, m, d };
    this._selection.set(iso);
    this._commit(iso);
  }

  _commit(iso) {
    const val = `${String(iso.y).padStart(4, '0')}-${String(iso.m).padStart(2, '0')}-${String(iso.d).padStart(2, '0')}`;
    this.input.value = val;
    this._onSelect({ ...iso });
    if (this._popup) this._popup.close();
  }

  destroy() {
    this.input.removeEventListener('focus', this._openFocus);
    if (this._popup) this._popup.destroy();
    this._popup = null;
    this._calendarRoot = null;
  }
}
