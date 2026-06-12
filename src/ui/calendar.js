import { addDays, compareISODate, isSameISODate } from '../core/date-engine.js';

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
