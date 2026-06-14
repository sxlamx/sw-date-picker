import { todayISO, addDays, parseISODate } from './core/date-engine.js';
import { resolveLocale, firstDayOfWeek, weekdayNames } from './core/locale-engine.js';
import { renderMonthGrid } from './ui/calendar.js';
import { Popup } from './ui/popup.js';
import { shiftView } from './ui/navigation.js';
import { keyToAction, ACTION } from './ui/keyboard.js';
import { announce } from './ui/accessibility.js';
import { SelectionState, DateRangeState } from './ui/selection.js';
import { assertSafeConfig } from './security/validator.js';
import { parseUserInput, parseNaturalInput } from './core/parser.js';
import { formatDate } from './core/formatter.js';

export class DatePicker {
  constructor(options = {}) {
    assertSafeConfig(options);
    this.input = options.input ?? document.createElement('input');
    this.locale = resolveLocale(options.locale ?? 'en-US');
    this.minYear = options.minYear ?? 1900;
    this.maxYear = options.maxYear ?? 2100;
    this.mode = options.mode ?? 'single';
    if (this.mode === 'date') this.mode = 'single';
    this.inline = options.inline ?? false;
    this._onSelect = options.onSelect ?? (() => {});
    
    const now = new Date();
    this._view = { y: now.getUTCFullYear(), m: now.getUTCMonth() + 1 };
    this._today = parseISODate(todayISO());
    this._selection = this.mode === 'range' ? new DateRangeState() : new SelectionState();
    this._focusedDate = null;
    this._popup = null;
    this._calendarRoot = null;
    
    this._openFocus = this._openFocus.bind(this);
    this._keyHandler = this._keyHandler.bind(this);
    this._clickHandler = this._clickHandler.bind(this);
    this._changeHandler = this._changeHandler.bind(this);
    this._inputHandler = this._inputHandler.bind(this);
    this._render = this._render.bind(this);

    if (!this.inline) {
      this.input.addEventListener('focus', this._openFocus);
      this.input.addEventListener('click', this._openFocus);
    }
    this.input.addEventListener('change', this._inputHandler);

    if (this.inline) {
      this._calendarRoot = document.createElement('div');
      this._calendarRoot.addEventListener('keydown', this._keyHandler);
      this._calendarRoot.addEventListener('click', this._clickHandler);
      this._calendarRoot.addEventListener('change', this._changeHandler);
      this.input.appendChild(this._calendarRoot);
      this._render();
    }
  }

  _isOpen() {
    return !!this._popup?.dialog;
  }

  _openFocus() {
    this.open();
  }

  open() {
    if (this.inline) return;
    if (this._popup) return;
    this._popup = new Popup({
      trigger: this.input,
      onClose: () => {
        this._popup = null;
        this._calendarRoot = null;
      }
    });
    this._calendarRoot = document.createElement('div');
    this._calendarRoot.addEventListener('keydown', this._keyHandler);
    this._calendarRoot.addEventListener('click', this._clickHandler);
    this._calendarRoot.addEventListener('change', this._changeHandler);
    this._popup.open(this._calendarRoot);
    this._render();
    const firstCell = this._calendarRoot.querySelector('[role="gridcell"]');
    if (firstCell) firstCell.focus();
  }

  _render() {
    if (!this._calendarRoot) return;
    const fday = firstDayOfWeek(this.locale);
    const names = weekdayNames(this.locale, 'short');
    
    let focused = this._focusedDate;
    if (!focused || focused.m !== this._view.m || focused.y !== this._view.y) {
      focused = { ...this._view, d: 1 };
    }

    const selectedVal = this.mode === 'range'
      ? { start: this._selection.getStart(), end: this._selection.getEnd() }
      : this._selection.get();

    renderMonthGrid(this._calendarRoot, {
      view: this._view,
      firstDayOfWeek: fday,
      today: this._today,
      selected: selectedVal,
      locale: this.locale,
      weekdayNames: names,
      mode: this.mode,
      minYear: this.minYear,
      maxYear: this.maxYear,
      focusedDate: focused,
    });
    
    const label = `${this._view.y}-${String(this._view.m).padStart(2, '0')}`;
    announce(`Showing ${label}`);
  }

  _keyHandler(e) {
    const activeDate = this._focusedDate || (this.mode === 'range' ? (this._selection.getStart() || { ...this._view, d: 1 }) : (this._selection.get() || { ...this._view, d: 1 }));
    const action = keyToAction(e.key, e.shiftKey, activeDate);
    if (!action) return;
    e.preventDefault();
    let cursor = { ...activeDate };
    switch (action.type) {
      case ACTION.MOVE_DAY: {
        cursor = addDays(cursor, action.delta);
        break;
      }
      case ACTION.SHIFT_MONTH: {
        this._view = shiftView(this._view, action.delta, 0, this.minYear, this.maxYear);
        this._focusedDate = { ...cursor, y: this._view.y, m: this._view.m };
        this._render();
        this._focusDate(this._focusedDate);
        return;
      }
      case ACTION.SHIFT_YEAR: {
        this._view = shiftView(this._view, 0, action.delta, this.minYear, this.maxYear);
        this._focusedDate = { ...cursor, y: this._view.y, m: this._view.m };
        this._render();
        this._focusDate(this._focusedDate);
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
        if (this.mode === 'range') {
          const start = this._selection.getStart();
          const end = this._selection.getEnd();
          if (!start || (start && end)) {
            this._selection.clear();
            this._selection.setStart(cursor);
          } else {
            this._selection.setEnd(cursor);
          }
          this._commitRange();
        } else {
          this._selection.set(cursor);
          this._commit(cursor);
        }
        return;
      }
    }
    
    cursor.y = Math.min(Math.max(cursor.y, this.minYear), this.maxYear);
    this._focusedDate = cursor;

    if (this.mode !== 'range') {
      this._selection.set(cursor);
    }
    
    if (cursor.m !== this._view.m || cursor.y !== this._view.y) {
      this._view = { y: cursor.y, m: cursor.m };
    }
    this._render();
    this._focusDate(cursor);
  }

  _focusDate(iso) {
    const cell = this._calendarRoot.querySelector(`[data-iso="${iso.y}-${iso.m}-${iso.d}"]`);
    if (cell) cell.focus();
  }

  _clickHandler(e) {
    const prevBtn = e.target.closest('.sw-datepicker-prev');
    if (prevBtn) {
      this._view = shiftView(this._view, -1, 0, this.minYear, this.maxYear);
      this._render();
      return;
    }
    const nextBtn = e.target.closest('.sw-datepicker-next');
    if (nextBtn) {
      this._view = shiftView(this._view, 1, 0, this.minYear, this.maxYear);
      this._render();
      return;
    }

    const cell = e.target.closest('[role="gridcell"]');
    if (!cell) return;
    const [y, m, d] = cell.dataset.iso.split('-').map(Number);
    const iso = { y, m, d };
    this._focusedDate = iso;

    if (this.mode === 'range') {
      const start = this._selection.getStart();
      const end = this._selection.getEnd();
      if (!start || (start && end)) {
        this._selection.clear();
        this._selection.setStart(iso);
      } else {
        this._selection.setEnd(iso);
      }
      this._commitRange();
    } else {
      this._selection.set(iso);
      this._commit(iso);
    }
  }

  _changeHandler(e) {
    if (e.target.classList.contains('sw-datepicker-month-select')) {
      this._view.m = Number(e.target.value);
      this._render();
    } else if (e.target.classList.contains('sw-datepicker-year-select')) {
      this._view.y = Number(e.target.value);
      this._render();
    }
  }

  _inputHandler() {
    const val = this.input.value.trim();
    if (!val) {
      this._selection.clear();
      this._render();
      this.input.removeAttribute('aria-invalid');
      return;
    }
    if (this.mode === 'range') {
      const parts = val.split(/\s*(?:to|→)\s*|\s+-\s+/i);
      if (parts.length === 2) {
        const start = parseUserInput(parts[0], this.locale);
        const end = parseUserInput(parts[1], this.locale);
        if (start && end) {
          this._selection.setStart(start);
          this._selection.setEnd(end);
          this._view = { y: start.y, m: start.m };
          this._focusedDate = start;
          this.input.removeAttribute('aria-invalid');
          this.input.value = `${formatDate(start, this.locale)} to ${formatDate(end, this.locale)}`;
          this._render();
          return;
        }
      }
    } else {
      const parsed = parseUserInput(val, this.locale) || parseNaturalInput(val, this._today);
      if (parsed) {
        this._selection.set(parsed);
        this._view = { y: parsed.y, m: parsed.m };
        this._focusedDate = parsed;
        this.input.removeAttribute('aria-invalid');
        this.input.value = formatDate(parsed, this.locale);
        this._render();
        return;
      }
    }
    this.input.setAttribute('aria-invalid', 'true');
  }

  _commit(iso) {
    const val = formatDate(iso, this.locale);
    this.input.value = val;
    this.input.removeAttribute('aria-invalid');
    this._onSelect({ ...iso });
    if (this._popup) this._popup.close();
  }

  _commitRange() {
    const start = this._selection.getStart();
    const end = this._selection.getEnd();
    let val = '';
    if (start) {
      val = formatDate(start, this.locale);
      if (end) {
        val += ` to ${formatDate(end, this.locale)}`;
      }
    }
    this.input.value = val;
    this.input.removeAttribute('aria-invalid');
    this._onSelect({ start, end });
    
    if (this._selection.isComplete()) {
      this._render();
      if (this._popup) this._popup.close();
    } else {
      this._render();
    }
  }

  getValue() {
    if (this.mode === 'range') {
      const start = this._selection.getStart();
      const end = this._selection.getEnd();
      if (!start) return null;
      const startStr = `${String(start.y).padStart(4, '0')}-${String(start.m).padStart(2, '0')}-${String(start.d).padStart(2, '0')}`;
      if (!end) return startStr;
      const endStr = `${String(end.y).padStart(4, '0')}-${String(end.m).padStart(2, '0')}-${String(end.d).padStart(2, '0')}`;
      return `${startStr} to ${endStr}`;
    } else {
      const sel = this._selection.get();
      if (!sel) return null;
      return `${String(sel.y).padStart(4, '0')}-${String(sel.m).padStart(2, '0')}-${String(sel.d).padStart(2, '0')}`;
    }
  }

  setValue(val) {
    if (!val) {
      this._selection.clear();
      this.input.value = '';
      this._render();
      return;
    }
    if (this.mode === 'range') {
      const parts = val.split(/\s*(?:to|→)\s*|\s+-\s+/i);
      if (parts.length === 2) {
        const start = parseUserInput(parts[0], this.locale);
        const end = parseUserInput(parts[1], this.locale);
        if (start && end) {
          this._selection.setStart(start);
          this._selection.setEnd(end);
          this._view = { y: start.y, m: start.m };
          this._focusedDate = start;
          this.input.value = `${formatDate(start, this.locale)} to ${formatDate(end, this.locale)}`;
          this.input.removeAttribute('aria-invalid');
          this._render();
        }
      }
    } else {
      const parsed = parseUserInput(val, this.locale) || parseNaturalInput(val, this._today);
      if (parsed) {
        this._selection.set(parsed);
        this._view = { y: parsed.y, m: parsed.m };
        this._focusedDate = parsed;
        this.input.value = formatDate(parsed, this.locale);
        this.input.removeAttribute('aria-invalid');
        this._render();
      }
    }
  }

  destroy() {
    this.input.removeEventListener('focus', this._openFocus);
    this.input.removeEventListener('click', this._openFocus);
    this.input.removeEventListener('change', this._inputHandler);
    if (this._popup) this._popup.destroy();
    this._popup = null;
    this._calendarRoot = null;
  }
}
