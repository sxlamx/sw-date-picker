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

export function addDays(isoDate, n) {
  const utc = new Date(Date.UTC(isoDate.y, isoDate.m - 1, isoDate.d));
  utc.setUTCDate(utc.getUTCDate() + n);
  return { y: utc.getUTCFullYear(), m: utc.getUTCMonth() + 1, d: utc.getUTCDate() };
}

export function addMonths(isoDate, n) {
  const utc = new Date(Date.UTC(isoDate.y, isoDate.m - 1 + n, 1));
  const y = utc.getUTCFullYear();
  const m = utc.getUTCMonth() + 1;
  const d = Math.min(isoDate.d, daysInMonth(y, m));
  return { y, m, d };
}

export function addYears(isoDate, n) {
  return addMonths(isoDate, n * 12);
}

export function compareISODate(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  if (a.m !== b.m) return a.m - b.m;
  return a.d - b.d;
}

export function isSameISODate(a, b) {
  return compareISODate(a, b) === 0;
}

export function isBetween(target, start, end) {
  return compareISODate(target, start) >= 0 && compareISODate(target, end) <= 0;
}

export function diffInDays(a, b) {
  const ua = Date.UTC(a.y, a.m - 1, a.d);
  const ub = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((ub - ua) / 86_400_000);
}
