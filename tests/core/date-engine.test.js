import { describe, it, expect } from 'vitest';
import { isLeapYear, daysInMonth } from '../../src/core/date-engine.js';
import { parseISODate, formatISO } from '../../src/core/date-engine.js';
import { addDays, addMonths, addYears } from '../../src/core/date-engine.js';

describe('isLeapYear', () => {
  it('handles century rules', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
  });
});

describe('daysInMonth', () => {
  it('returns 29 for Feb of leap year, 28 otherwise', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
  });
  it('returns 31/30 correctly', () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
  it('throws on invalid month', () => {
    expect(() => daysInMonth(2026, 0)).toThrow();
    expect(() => daysInMonth(2026, 13)).toThrow();
  });
});

describe('parseISODate', () => {
  it('parses YYYY-MM-DD', () => {
    expect(parseISODate('2026-12-25')).toEqual({ y: 2026, m: 12, d: 25 });
  });
  it('rejects malformed input', () => {
    expect(() => parseISODate('2026/12/25')).toThrow();
    expect(() => parseISODate('abcd')).toThrow();
    expect(() => parseISODate('2026-13-01')).toThrow();
    expect(() => parseISODate('2026-02-30')).toThrow();
    expect(() => parseISODate('2024-2-29')).not.toThrow(); // single-digit tolerated, normalised
    expect(parseISODate('2026-2-9')).toEqual({ y: 2026, m: 2, d: 9 });
  });
  it('accepts 31/02/2026 as invalid (no auto-correction)', () => {
    expect(() => parseISODate('2026-02-31')).toThrow();
  });
});

describe('date arithmetic', () => {
  it('addDays cross-month', () => {
    expect(addDays({ y: 2026, m: 1, d: 31 }, 1)).toEqual({ y: 2026, m: 2, d: 1 });
    expect(addDays({ y: 2024, m: 2, d: 28 }, 2)).toEqual({ y: 2024, m: 3, d: 1 });
  });
  it('addDays negative', () => {
    expect(addDays({ y: 2026, m: 1, d: 1 }, -1)).toEqual({ y: 2025, m: 12, d: 31 });
  });
  it('addMonths clamps day to month length', () => {
    expect(addMonths({ y: 2026, m: 1, d: 31 }, 1)).toEqual({ y: 2026, m: 2, d: 28 });
    expect(addMonths({ y: 2024, m: 1, d: 31 }, 1)).toEqual({ y: 2024, m: 2, d: 29 });
  });
  it('addYears handles Feb 29', () => {
    expect(addYears({ y: 2024, m: 2, d: 29 }, 1)).toEqual({ y: 2025, m: 2, d: 28 });
  });
});
