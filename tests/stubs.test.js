import { describe, it, expect } from 'vitest';
import { MODES, KEY, RESERVED_KEYS } from '../src/constants.js';
import { todayInUTC, formatISO } from '../src/core/date-engine.js';

describe('phase-0 stubs', () => {
  it('exports constants', () => {
    expect(MODES.SINGLE).toBe('single');
    expect(KEY.Enter).toBe('Enter');
    expect(RESERVED_KEYS).toContain('__proto__');
  });
  it('formats ISO from a date', () => {
    expect(formatISO(new Date(Date.UTC(2026, 11, 25)))).toBe('2026-12-25');
  });
  it('todayInUTC returns YYYY-MM-DD', () => {
    expect(todayInUTC()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
