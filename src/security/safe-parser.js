import { isValidISODateString, isValidISODateTimeString } from './validator.js';

export function safeParseISODate(str) {
  if (!isValidISODateString(str)) return null;
  const [y, m, d] = str.split('-').map(Number);
  return { y, m, d };
}

export function safeParseDateTime(str) {
  if (!isValidISODateTimeString(str)) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?Z$/.exec(str);
  if (!m) return null;
  return {
    y: Number(m[1]),
    mo: Number(m[2]),
    d: Number(m[3]),
    h: Number(m[4]),
    mi: Number(m[5]),
    s: m[6] ? Number(m[6]) : 0,
  };
}
