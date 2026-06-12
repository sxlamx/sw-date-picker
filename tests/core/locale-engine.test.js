import { describe, it, expect } from 'vitest';
import { resolveLocale, firstDayOfWeek, monthNames, weekdayNames, isRTL, resolveRTL, dayPeriodLabels } from '../../src/core/locale-engine.js';

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

describe('monthNames', () => {
  it('en-US yields English month names', () => {
    const months = monthNames('en-US', 'long');
    expect(months[0]).toBe('January');
    expect(months[11]).toBe('December');
  });
  it('fr-FR yields French month names', () => {
    const months = monthNames('fr-FR', 'long');
    expect(months[0]).toMatch(/janvier/i);
  });
  it('short variant', () => {
    expect(monthNames('en-US', 'short')[0]).toBe('Jan');
  });
});

describe('weekdayNames', () => {
  it('en-US starts with Sunday in long form', () => {
    const wd = weekdayNames('en-US', 'short');
    expect(wd).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });
  it('en-GB long form starts with Monday', () => {
    const wd = weekdayNames('en-GB', 'long');
    expect(wd[0]).toBe('Monday');
  });
});

describe('rtl', () => {
  it('detects Arabic as RTL', () => {
    expect(isRTL('ar-SA')).toBe(true);
  });
  it('English is LTR', () => {
    expect(isRTL('en-US')).toBe(false);
  });
  it('resolveRTL honors explicit true/false', () => {
    expect(resolveRTL('en-US', true)).toBe(true);
    expect(resolveRTL('ar-SA', false)).toBe(false);
  });
  it('resolveRTL auto from locale', () => {
    expect(resolveRTL('ar-SA', 'auto')).toBe(true);
    expect(resolveRTL('en-US', 'auto')).toBe(false);
  });
  it('returns false for az-Latn (script distinguishes RTL forms)', () => {
    expect(isRTL('az-Latn')).toBe(false);
  });
  it('returns true for az-Arab', () => {
    expect(isRTL('az-Arab')).toBe(true);
  });
});

describe('dayPeriodLabels', () => {
  it('returns AM/PM in en-US', () => {
    const labels = dayPeriodLabels('en-US');
    expect(labels.am.toLowerCase()).toBe('am');
    expect(labels.pm.toLowerCase()).toBe('pm');
  });
});
