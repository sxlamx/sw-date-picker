import { RESERVED_KEYS } from '../constants.js';

const LOCALE_RE = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
const ALL_CAPS_RE = /^[A-Z]{4,}$/;
const TZ_RE = /^[A-Za-z_]+(?:\/[A-Za-z_\-+0-9]+)*$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?Z$/;

export function isValidLocale(locale) {
  if (typeof locale !== 'string' || locale.length > 35) return false;
  if (!LOCALE_RE.test(locale)) return false;
  for (const part of locale.split('-')) {
    if (ALL_CAPS_RE.test(part)) return false;
  }
  try {
    new Intl.DateTimeFormat(locale);
    return true;
  } catch {
    return false;
  }
}

export function isValidTimeZone(tz) {
  if (typeof tz !== 'string' || tz.length > 64) return false;
  if (!TZ_RE.test(tz)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function isValidYear(year, min, max) {
  return Number.isInteger(year) && year >= min && year <= max;
}

export function isValidISODateString(str) {
  if (typeof str !== 'string' || !ISO_RE.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  const dim = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d >= 1 && d <= dim[m - 1];
}

export function isValidISODateTimeString(str) {
  return typeof str === 'string' && ISO_DT_RE.test(str);
}

export function assertSafeConfig(obj) {
  if (obj == null) return;
  if (typeof obj !== 'object') return;
  const proto = Object.getPrototypeOf(obj);
  if (proto !== Object.prototype && proto !== null) {
    throw new Error(`Unsafe config prototype: ${String(proto)}`);
  }
  for (const k of Object.getOwnPropertyNames(obj)) {
    if (RESERVED_KEYS.includes(k)) {
      throw new Error(`Unsafe config key: ${k}`);
    }
  }
}
