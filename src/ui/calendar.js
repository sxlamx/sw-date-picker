import { addDays, compareISODate, isSameISODate } from '../core/date-engine.js';
import { setText } from '../security/sanitizer.js';

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
    view, firstDayOfWeek, today, selected, locale, weekdayNames,
  } = opts;
  // Clear root
  while (root.firstChild) root.removeChild(root.firstChild);
  root.setAttribute('role', 'grid');
  root.setAttribute('aria-label', 'Calendar');

  // Header row of weekday names
  const header = document.createElement('div');
  header.setAttribute('role', 'row');
  for (let i = 0; i < 7; i++) {
    const cell = document.createElement('span');
    cell.setAttribute('role', 'columnheader');
    setText(cell, weekdayNames[(i + firstDayOfWeek) % 7]);
    header.appendChild(cell);
  }
  root.appendChild(header);

  const matrix = buildMonthMatrix(view, firstDayOfWeek, today);

  for (const row of matrix) {
    const rowEl = document.createElement('div');
    rowEl.setAttribute('role', 'row');
    for (const cell of row) {
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.setAttribute('role', 'gridcell');
      const labelDate = new Date(Date.UTC(cell.iso.y, cell.iso.m - 1, cell.iso.d));
      const ariaLabel = new Intl.DateTimeFormat(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      }).format(labelDate);
      const parts = [ariaLabel];
      if (cell.isToday) parts.push('Today');
      if (selected && isSameISODate(cell.iso, selected)) parts.push('Selected');
      if (!cell.inMonth) parts.push('Outside month');
      cellEl.setAttribute('aria-label', parts.join(', '));
      cellEl.setAttribute('aria-selected', selected && isSameISODate(cell.iso, selected) ? 'true' : 'false');
      cellEl.tabIndex = -1;
      cellEl.dataset.iso = `${cell.iso.y}-${cell.iso.m}-${cell.iso.d}`;
      if (!cell.inMonth) cellEl.dataset.outside = '1';
      if (cell.isToday) cellEl.dataset.today = '1';
      if (selected && isSameISODate(cell.iso, selected)) cellEl.dataset.selected = '1';
      setText(cellEl, String(cell.iso.d));
      rowEl.appendChild(cellEl);
    }
    root.appendChild(rowEl);
  }
}
