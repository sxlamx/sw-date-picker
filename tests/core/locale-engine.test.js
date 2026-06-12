import { describe, it, expect } from 'vitest';
import { resolveLocale } from '../../src/core/locale-engine.js';

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
