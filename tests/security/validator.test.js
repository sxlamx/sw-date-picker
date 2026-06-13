import { describe, it, expect } from 'vitest';
import {
  isValidLocale,
  isValidTimeZone,
  isValidYear,
  isValidISODateString,
  isValidISODateTimeString,
  assertSafeConfig,
} from '../../src/security/validator.js';

describe('validator', () => {
  it('isValidLocale', () => {
    expect(isValidLocale('en-US')).toBe(true);
    expect(isValidLocale('de')).toBe(true);
    expect(isValidLocale('xx-NOPE')).toBe(false);
    expect(isValidLocale('__proto__')).toBe(false);
  });
  it('isValidTimeZone', () => {
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('America/Los_Angeles')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
  });
  it('isValidYear', () => {
    expect(isValidYear(1900, 1900, 2100)).toBe(true);
    expect(isValidYear(2100, 1900, 2100)).toBe(true);
    expect(isValidYear(1899, 1900, 2100)).toBe(false);
    expect(isValidYear(2101, 1900, 2100)).toBe(false);
  });
  it('isValidISODateString', () => {
    expect(isValidISODateString('2026-12-25')).toBe(true);
    expect(isValidISODateString('2026-13-01')).toBe(false);
    expect(isValidISODateString('not a date')).toBe(false);
  });
  it('isValidISODateTimeString', () => {
    expect(isValidISODateTimeString('2026-12-25T12:30:00Z')).toBe(true);
    expect(isValidISODateTimeString('2026-13-01T00:00:00Z')).toBe(false);
    expect(isValidISODateTimeString('2026-02-30T12:00:00Z')).toBe(false);
    expect(isValidISODateTimeString('2026-12-25T12:30:00+02:00')).toBe(false);
    expect(isValidISODateTimeString('2026-12-25')).toBe(false);
  });
  it('assertSafeConfig rejects prototype pollution', () => {
    expect(() => assertSafeConfig({ __proto__: { polluted: true } })).toThrow();
    expect(() => assertSafeConfig({ constructor: 'x' })).toThrow();
    expect(() => assertSafeConfig({ prototype: 'x' })).toThrow();
    expect(() => assertSafeConfig({ locale: 'en-US' })).not.toThrow();
  });
});
