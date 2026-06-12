import { describe, it, expect } from 'vitest';
import { resolveLocale, firstDayOfWeek } from '../../src/core/locale-engine.js';

describe('resolveLocale', () => {
  it('returns provided valid locale', () => {
    expect(resolveLocale('en-US')).toBe('en-US');
  });
  it('returns "en-US" for "auto" when navigator is missing', () => {
    expect(resolveLocale('auto', undefined)).toBe('en-US');
  });
  it('uses navigator.language when "auto"', () => {
    expect(resolveLocale('auto', 'fr-FR')).toBe('fr-FR');
  });
  it('falls back to "en-US" for invalid input', () => {
    expect(resolveLocale('xx-NOPE')).toBe('en-US');
    expect(resolveLocale('auto', 'garbage')).toBe('en-US');
  });
});

describe('firstDayOfWeek', () => {
  it('returns 0 (Sun) for en-US', () => {
    expect(firstDayOfWeek('en-US')).toBe(0);
  });
  it('returns 1 (Mon) for en-GB, fr-FR, de-DE', () => {
    expect(firstDayOfWeek('en-GB')).toBe(1);
    expect(firstDayOfWeek('fr-FR')).toBe(1);
    expect(firstDayOfWeek('de-DE')).toBe(1);
  });
  it('returns 6 (Sat) for ar-SA', () => {
    expect(firstDayOfWeek('ar-SA')).toBe(6);
  });
  it('falls back to 0 for unknown', () => {
    expect(firstDayOfWeek('xx-NOPE')).toBe(0);
  });
});
