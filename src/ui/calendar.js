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

function buildCustomSelect(className, options, selectedValue, ariaLabel) {
  const wrapper = document.createElement('div');
  wrapper.className = `sw-datepicker-custom-select ${className}`;
  wrapper.setAttribute('role', 'combobox');
  wrapper.setAttribute('aria-haspopup', 'listbox');
  wrapper.setAttribute('aria-expanded', 'false');
  wrapper.setAttribute('aria-label', ariaLabel);
  wrapper.tabIndex = 0;

  const trigger = document.createElement('span');
  trigger.className = 'sw-datepicker-select-trigger';
  const selected = options.find(o => o.value === selectedValue) ?? options[0];
  setText(trigger, selected.label);
  wrapper.appendChild(trigger);

  const listbox = document.createElement('ul');
  listbox.className = 'sw-datepicker-select-listbox';
  listbox.setAttribute('role', 'listbox');
  listbox.setAttribute('aria-label', ariaLabel);
  listbox.hidden = true;

  options.forEach(opt => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', opt.value === selectedValue ? 'true' : 'false');
    li.dataset.value = opt.value;
    li.className = 'sw-datepicker-select-option';
    if (opt.value === selectedValue) li.classList.add('sw-datepicker-select-option--selected');
    setText(li, opt.label);
    listbox.appendChild(li);
  });

  wrapper.appendChild(listbox);

  let highlightedIdx = options.findIndex(o => o.value === selectedValue);

  function open() {
    listbox.hidden = false;
    wrapper.setAttribute('aria-expanded', 'true');
    // scroll selected into view
    const selEl = listbox.querySelector('[aria-selected="true"]');
    if (selEl) selEl.scrollIntoView({ block: 'nearest' });
  }

  function close() {
    listbox.hidden = true;
    wrapper.setAttribute('aria-expanded', 'false');
  }

  function selectIdx(idx) {
    const opt = options[idx];
    if (!opt) return;
    setText(trigger, opt.label);
    listbox.querySelectorAll('[role="option"]').forEach((el, i) => {
      const isSel = i === idx;
      el.setAttribute('aria-selected', isSel ? 'true' : 'false');
      el.classList.toggle('sw-datepicker-select-option--selected', isSel);
    });
    highlightedIdx = idx;
    wrapper.dataset.value = opt.value;
    close();
    wrapper.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function highlight(idx) {
    const items = listbox.querySelectorAll('[role="option"]');
    items.forEach((el, i) => el.classList.toggle('sw-datepicker-select-option--highlighted', i === idx));
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
    highlightedIdx = idx;
  }

  wrapper.addEventListener('click', e => {
    const opt = e.target.closest('[role="option"]');
    if (opt) {
      const idx = options.findIndex(o => o.value === opt.dataset.value);
      selectIdx(idx);
      return;
    }
    if (listbox.hidden) {
      open();
      highlight(highlightedIdx);
    } else {
      close();
    }
  });

  wrapper.addEventListener('keydown', e => {
    if (listbox.hidden) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        open();
        highlight(highlightedIdx);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlight(Math.min(highlightedIdx + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlight(Math.max(highlightedIdx - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectIdx(highlightedIdx);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });

  listbox.addEventListener('mousedown', e => e.preventDefault());

  wrapper.addEventListener('blur', e => {
    if (!wrapper.contains(e.relatedTarget)) close();
  });

  wrapper.dataset.value = selectedValue;
  return wrapper;
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
  const allMonths = monthNames(locale, 'long');
  const monthOptions = allMonths.map((mName, idx) => ({ label: mName, value: String(idx + 1) }));
  const monthSelect = buildCustomSelect('sw-datepicker-month-select', monthOptions, String(view.m), 'Select month');
  titleEl.appendChild(monthSelect);

  // Year select
  const minY = minYear ?? 1900;
  const maxY = maxYear ?? 2100;
  const yearOptions = [];
  for (let y = minY; y <= maxY; y++) yearOptions.push({ label: String(y), value: String(y) });
  const yearSelect = buildCustomSelect('sw-datepicker-year-select', yearOptions, String(view.y), 'Select year');
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

