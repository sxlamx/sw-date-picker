import { isValidLocale } from '../security/validator.js';

const FALLBACK = 'en-US';

export function resolveLocale(locale, navigatorLanguage) {
  if (locale === 'auto' || locale == null) {
    const guess = typeof navigatorLanguage === 'string' ? navigatorLanguage : '';
    return isValidLocale(guess) ? guess : FALLBACK;
  }
  return isValidLocale(locale) ? locale : FALLBACK;
}

export function firstDayOfWeek(locale) {
  if (!isValidLocale(locale)) return 0;
  // Curated overrides for locales whose first-day convention differs from
  // the runtime ICU data (e.g. ar-SA is Saturday-first in CLDR pre-2024,
  // Sunday-first in newer ICU builds). Keep this list small and explicit.
  const OVERRIDES = {
    'ar-SA': 6,
  };
  if (Object.prototype.hasOwnProperty.call(OVERRIDES, locale)) {
    return OVERRIDES[locale];
  }
  try {
    // Intl.Locale.getWeekInfo().firstDay uses ISO numbering (1=Mon..7=Sun).
    // Convert to 0-based getDay() convention (0=Sun..6=Sat).
    const wi = new Intl.Locale(locale).getWeekInfo();
    if (!wi || !Number.isInteger(wi.firstDay)) return 0;
    return wi.firstDay === 7 ? 0 : wi.firstDay;
  } catch {
    return 0;
  }
}

function getName(locale, type, style) {
  const fmt = new Intl.DateTimeFormat(locale, { [type]: style, timeZone: 'UTC' });
  // 2026-01-04 is a Sunday; iterate forward to get all 7 weekdays.
  const jan4 = new Date(Date.UTC(2026, 0, 4));
  if (type === 'month') {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Date.UTC(2026, i, 15));
      return fmt.format(d);
    });
  }
  // weekday — build the Sun-first list, then rotate so the locale's first
  // day is at index 0.
  const sunFirst = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(jan4);
    d.setUTCDate(jan4.getUTCDate() + i);
    return fmt.format(d);
  });
  const offset = firstDayOfWeek(locale);
  return [...sunFirst.slice(offset), ...sunFirst.slice(0, offset)];
}

export function monthNames(locale, style = 'long') {
  try {
    return getName(locale, 'month', style);
  } catch {
    return monthNames('en-US', style);
  }
}

export function weekdayNames(locale, style = 'short') {
  try {
    return getName(locale, 'weekday', style);
  } catch {
    return weekdayNames('en-US', style);
  }
}

const RTL_LOCALES = new Set([
  'ar', 'arc', 'az-Arab', 'dv', 'fa', 'he', 'ku', 'ks', 'mzn', 'nqo', 'pnb', 'ps', 'sd', 'sd-Arab', 'ug', 'ur', 'yi',
]);

export function isRTL(locale) {
  const tag = String(locale);
  const base = tag.split('-')[0].toLowerCase();
  if (RTL_LOCALES.has(tag)) return true;
  return RTL_LOCALES.has(base);
}

export function resolveRTL(locale, rtl) {
  if (rtl === true || rtl === false) return rtl;
  return isRTL(locale);
}

export function dayPeriodLabels(locale) {
  const fmt = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true, timeZone: 'UTC' });
  const am = fmt.formatToParts(new Date(Date.UTC(2026, 0, 1, 9))).find((p) => p.type === 'dayPeriod')?.value ?? 'AM';
  const pm = fmt.formatToParts(new Date(Date.UTC(2026, 0, 1, 21))).find((p) => p.type === 'dayPeriod')?.value ?? 'PM';
  return { am, pm };
}
