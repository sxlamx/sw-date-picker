import { isValidLocale } from '../security/validator.js';

const FALLBACK = 'en-US';

export function resolveLocale(locale, navigatorLanguage) {
  if (locale === 'auto' || locale == null) {
    const guess = typeof navigatorLanguage === 'string' ? navigatorLanguage : '';
    return isValidLocale(guess) ? guess : FALLBACK;
  }
  return isValidLocale(locale) ? locale : FALLBACK;
}
