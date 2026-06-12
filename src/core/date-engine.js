export function todayInUTC() {
  const now = new Date();
  return formatISO(now);
}

export function formatISO(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isLeapYear(year) {
  if (!Number.isInteger(year)) {
    throw new TypeError('year must be an integer');
  }
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('month must be 1..12');
  }
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return 31;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return isLeapYear(year) ? 29 : 28;
}

const ISO_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

export function parseISODate(str) {
  if (typeof str !== 'string') throw new TypeError('expected string');
  const m = ISO_RE.exec(str);
  if (!m) throw new RangeError('not ISO YYYY-MM-DD');
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) throw new RangeError('invalid month');
  if (d < 1 || d > daysInMonth(y, mo)) throw new RangeError('invalid day');
  return { y, m: mo, d };
}
