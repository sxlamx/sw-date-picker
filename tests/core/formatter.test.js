import { describe, it, expect } from 'vitest';
import { formatDate } from '../../src/core/formatter.js';

describe('formatDate', () => {
  it('formats en-US default as M/D/YYYY', () => {
    const out = formatDate({ y: 2026, m: 12, d: 25 }, 'en-US');
    expect(out).toMatch(/12\/25\/2026/);
  });
  it('formats en-GB default as dd/mm/yyyy', () => {
    expect(formatDate({ y: 2026, m: 12, d: 25 }, 'en-GB')).toMatch(/25\/12\/2026/);
  });
  it('formats de-DE as dd.mm.yyyy', () => {
    expect(formatDate({ y: 2026, m: 12, d: 25 }, 'de-DE')).toMatch(/25\.12\.2026/);
  });
  it('uses Intl with year/month/day parts only (no time)', () => {
    const out = formatDate({ y: 2026, m: 1, d: 5 }, 'en-US');
    expect(out).not.toMatch(/AM|PM|\d{2}:\d{2}/);
  });
  it('handles invalid input by returning empty string', () => {
    expect(formatDate(null, 'en-US')).toBe('');
  });
});
