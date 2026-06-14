import { addDays, compareISODate, isSameISODate } from '../core/date-engine.js';
import { setText } from '../security/sanitizer.js';
import { monthNames } from '../core/locale-engine.js';

export function buildMonthMatrix(viewMonth, firstDayOfWeek, today) {
  const firstOfMonth = { y: viewMonth.y, m: viewMonth.m, d: 1 };
  const firstWeekday = new Date(Date.UTC(viewMonth.y, viewMonth.m - 1, 1)).getUTCDay();
  const lead = (firstWeekday - firstDayOfWeek + 7) % 7;
  const gridStart = addDays(firstOfMonth, -lead);
  const rows = [];
  let cursor = gridStart;
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      row.push({
        iso: { ...cursor },
        inMonth: cursor.m === viewMonth.m,
        isToday: today ? isSameISODate(cursor, today) : false,
      });
      cursor = addDays(cursor, 1);
    }
    rows.push(row);
  }
  return rows;
}

export function isInRange(iso, start, end) {
  if (!start || !end) return false;
  return compareISODate(iso, start) >= 0 && compareISODate(iso, end) <= 0;
}

export function renderMonthGrid(root, opts) {
  const {
    view, firstDayOfWeek, today, selected, locale, weekdayNames, mode, minYear, maxYear,
  } = opts;
  // Clear root
  while (root.firstChild) root.removeChild(root.firstChild);
  root.setAttribute('role', 'grid');
  root.setAttribute('aria-label', 'Calendar');
  
  // Navigation header section
  const navHeader = document.createElement('div');
  navHeader.className = 'sw-datepicker-header';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'sw-datepicker-prev';
  prevBtn.setAttribute('aria-label', 'Previous month');
  setText(prevBtn, '‹');
  navHeader.appendChild(prevBtn);

  const titleEl = document.createElement('div');
  titleEl.className = 'sw-datepicker-title';

  // Month select
  const monthSelect = document.createElement('select');
  monthSelect.className = 'sw-datepicker-month-select';
  monthSelect.setAttribute('aria-label', 'Select month');
  const allMonths = monthNames(locale, 'long');
  allMonths.forEach((mName, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx + 1);
    setText(opt, mName);
    if (idx + 1 === view.m) opt.selected = true;
    monthSelect.appendChild(opt);
  });
  titleEl.appendChild(monthSelect);

  // Year select
  const yearSelect = document.createElement('select');
  yearSelect.className = 'sw-datepicker-year-select';
  yearSelect.setAttribute('aria-label', 'Select year');
  const minY = minYear ?? 1900;
  const maxY = maxYear ?? 2100;
  for (let y = minY; y <= maxY; y++) {
    const opt = document.createElement('option');
    opt.value = String(y);
    setText(opt, String(y));
    if (y === view.y) opt.selected = true;
    yearSelect.appendChild(opt);
  }
  titleEl.appendChild(yearSelect);

  navHeader.appendChild(titleEl);

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'sw-datepicker-next';
  nextBtn.setAttribute('aria-label', 'Next month');
  setText(nextBtn, '›');
  navHeader.appendChild(nextBtn);

  root.appendChild(navHeader);

  // Header row of weekday names
  const header = document.createElement('div');
  header.setAttribute('role', 'row');
  header.className = 'sw-datepicker-weekdays';
  for (let i = 0; i < 7; i++) {
    const cell = document.createElement('span');
    cell.setAttribute('role', 'columnheader');
    cell.className = 'sw-datepicker-weekday';
    // Fix: weekdayNames is already rotated starting at firstDayOfWeek
    setText(cell, weekdayNames[i]);
    header.appendChild(cell);
  }
  root.appendChild(header);

  const matrix = buildMonthMatrix(view, firstDayOfWeek, today);

  for (const row of matrix) {
    const rowEl = document.createElement('div');
    rowEl.setAttribute('role', 'row');
    rowEl.className = 'sw-datepicker-row';
    for (const cell of row) {
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.setAttribute('role', 'gridcell');
      
      const labelDate = new Date(Date.UTC(cell.iso.y, cell.iso.m - 1, cell.iso.d));
      const ariaLabel = new Intl.DateTimeFormat(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      }).format(labelDate);
      
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRangeVal = false;

      if (mode === 'range' && selected) {
        const start = selected.start;
        const end = selected.end;
        if (start && isSameISODate(cell.iso, start)) {
          isRangeStart = true;
          isSelected = true;
        }
        if (end && isSameISODate(cell.iso, end)) {
          isRangeEnd = true;
          isSelected = true;
        }
        if (start && end && isInRange(cell.iso, start, end)) {
          isInRangeVal = true;
          isSelected = true;
        }
      } else {
        if (selected && isSameISODate(cell.iso, selected)) {
          isSelected = true;
        }
      }

      const parts = [ariaLabel];
      if (cell.isToday) parts.push('Today');
      if (isRangeStart) parts.push('Range start');
      if (isRangeEnd) parts.push('Range end');
      if (isInRangeVal && !isRangeStart && !isRangeEnd) parts.push('In range');
      if (isSelected && mode !== 'range') parts.push('Selected');
      if (!cell.inMonth) parts.push('Outside month');

      cellEl.setAttribute('aria-label', parts.join(', '));
      cellEl.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      const isFocused = opts.focusedDate ? isSameISODate(cell.iso, opts.focusedDate) : (cell.iso.d === 1 && cell.inMonth);
      cellEl.tabIndex = isFocused ? 0 : -1;
      cellEl.dataset.iso = `${cell.iso.y}-${cell.iso.m}-${cell.iso.d}`;
      
      if (!cell.inMonth) cellEl.dataset.outside = '1';
      if (cell.isToday) cellEl.dataset.today = '1';
      if (isSelected) cellEl.dataset.selected = '1';
      if (isRangeStart) cellEl.dataset.rangeStart = '1';
      if (isRangeEnd) cellEl.dataset.rangeEnd = '1';
      if (isInRangeVal) cellEl.dataset.inRange = '1';
      
      setText(cellEl, String(cell.iso.d));
      rowEl.appendChild(cellEl);
    }
    root.appendChild(rowEl);
  }
}

