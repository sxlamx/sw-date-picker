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
