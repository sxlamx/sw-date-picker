import { safeParseISODate } from '../security/safe-parser.js';
import { daysInMonth, addDays } from './date-engine.js';

const SEPARATORS = ['/', '.', '-', ' '];

function splitParts(str) {
  for (const sep of SEPARATORS) {
    if (str.includes(sep)) {
      const parts = str.split(sep).map((p) => p.trim());
      if (parts.every((p) => /^\d{1,4}$/.test(p))) return parts.map((p) => Number(p));
    }
  }
  return null;
}

function dayMonthYearOrder(locale) {
  const base = String(locale).split('-')[0].toLowerCase();
  if (base === 'en' && locale.toLowerCase().includes('gb')) return ['d', 'm', 'y'];
  if (base === 'en') return ['m', 'd', 'y'];
  if (base === 'ja' || base === 'ko' || base === 'zh' || base === 'hu') return ['y', 'm', 'd'];
  if (base === 'de' || base === 'fr' || base === 'it' || base === 'es' || base === 'nl' || base === 'pl' || base === 'pt' || base === 'ru') {
    return ['d', 'm', 'y'];
  }
  return ['m', 'd', 'y'];
}

function orderToObject(parts, order) {
  if (parts.length !== 3) return null;
  const obj = { y: NaN, m: NaN, d: NaN };
  parts.forEach((p, i) => { obj[order[i][0]] = p; });
  if (!Number.isInteger(obj.y) || obj.y < 1900 || obj.y > 2100) return null;
  if (obj.m < 1 || obj.m > 12) return null;
  if (obj.d < 1 || obj.d > daysInMonth(obj.y, obj.m)) return null;
  return { y: obj.y, m: obj.m, d: obj.d };
}

export function parseUserInput(input, locale) {
  if (typeof input !== 'string' || input.length > 50) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const iso = safeParseISODate(trimmed);
  if (iso) return iso;
  const parts = splitParts(trimmed);
  if (!parts) return null;
  return orderToObject(parts, dayMonthYearOrder(locale));
}

const WEEKDAY_BY_NAME = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function dayOfWeekFromISO({ y, m, d }) {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function parseNaturalInput(input, refISO) {
  if (typeof input !== 'string' || input.length > 50) return null;
  const text = input.trim().toLowerCase();
  if (!text) return null;
  if (text === 'today') return { ...refISO };
  if (text === 'tomorrow') return addDays(refISO, 1);
  if (text === 'yesterday') return addDays(refISO, -1);
  const nextMatch = /^next\s+([a-z]+)$/.exec(text);
  if (nextMatch) {
    const target = WEEKDAY_BY_NAME[nextMatch[1]];
    if (target == null) return null;
    const todayDow = dayOfWeekFromISO(refISO);
    let delta = (target - todayDow + 7) % 7;
    if (delta === 0) delta = 7; // "next friday" on a Friday is 7 days ahead.
    return addDays(refISO, delta);
  }
  return null;
}
