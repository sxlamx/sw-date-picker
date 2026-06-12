import { describe, it, expect } from 'vitest';
import { safeParseISODate, safeParseDateTime } from '../../src/security/safe-parser.js';
import { isValidISODateString, isValidISODateTimeString } from '../../src/security/validator.js';

describe('safe parser', () => {
  it('parses strict ISO date', () => {
    expect(safeParseISODate('2026-12-25')).toEqual({ y: 2026, m: 12, d: 25 });
  });
  it('returns null for invalid date strings', () => {
    expect(safeParseISODate('not a date')).toBeNull();
    expect(safeParseISODate('2026-13-01')).toBeNull();
    expect(safeParseISODate('Mon Jan 01 2026')).toBeNull();
  });
  it('parses strict ISO datetime UTC', () => {
    expect(safeParseDateTime('2026-12-25T12:30:00Z')).toEqual({
      y: 2026, mo: 12, d: 25, h: 12, mi: 30, s: 0,
    });
  });
  it('rejects non-UTC datetimes (no implicit conversion)', () => {
    expect(safeParseDateTime('2026-12-25T12:30:00+02:00')).toBeNull();
    expect(safeParseDateTime('2026-12-25 12:30:00')).toBeNull();
  });
  it('uses validator helpers', () => {
    expect(isValidISODateString('2026-12-25')).toBe(true);
    expect(isValidISODateTimeString('2026-12-25T12:30:00Z')).toBe(true);
  });
});
