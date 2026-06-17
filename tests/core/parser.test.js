import { describe, it, expect } from 'vitest';
import { parseUserInput, parseNaturalInput } from '../../src/core/parser.js';

describe('parseUserInput', () => {
  it('parses ISO YYYY-MM-DD regardless of locale', () => {
    expect(parseUserInput('2026-12-25', 'en-US')).toEqual({ y: 2026, m: 12, d: 25 });
  });
  it('parses en-US MM/DD/YYYY', () => {
    expect(parseUserInput('12/25/2026', 'en-US')).toEqual({ y: 2026, m: 12, d: 25 });
    expect(parseUserInput('1/5/2026', 'en-US')).toEqual({ y: 2026, m: 1, d: 5 });
  });
  it('parses en-GB DD/MM/YYYY', () => {
    expect(parseUserInput('25/12/2026', 'en-GB')).toEqual({ y: 2026, m: 12, d: 25 });
    expect(parseUserInput('5/1/2026', 'en-GB')).toEqual({ y: 2026, m: 1, d: 5 });
  });
  it('parses de-DE DD.MM.YYYY', () => {
    expect(parseUserInput('25.12.2026', 'de-DE')).toEqual({ y: 2026, m: 12, d: 25 });
  });
  it('parses ja-JP YYYY/MM/DD', () => {
    expect(parseUserInput('2026/12/25', 'ja-JP')).toEqual({ y: 2026, m: 12, d: 25 });
  });
  it('rejects ambiguous two-digit years by requiring 4 digits', () => {
    expect(parseUserInput('25/12/26', 'en-US')).toBeNull();
  });
  it('returns null for invalid', () => {
    expect(parseUserInput('99/99/9999', 'en-US')).toBeNull();
    expect(parseUserInput('abcd', 'en-US')).toBeNull();
    expect(parseUserInput('', 'en-US')).toBeNull();
    expect(parseUserInput('31/02/2026', 'en-GB')).toBeNull();
  });
});

describe('parseNaturalInput', () => {
  it('parses today, tomorrow, yesterday', () => {
    const ref = { y: 2026, m: 6, d: 12 };
    expect(parseNaturalInput('today', ref)).toEqual({ y: 2026, m: 6, d: 12 });
    expect(parseNaturalInput('tomorrow', ref)).toEqual({ y: 2026, m: 6, d: 13 });
    expect(parseNaturalInput('yesterday', ref)).toEqual({ y: 2026, m: 6, d: 11 });
  });
  it('parses "next friday" (always forward)', () => {
    // 2026-06-12 is a Friday -> next friday is 2026-06-19.
    const ref = { y: 2026, m: 6, d: 12 };
    expect(parseNaturalInput('next friday', ref)).toEqual({ y: 2026, m: 6, d: 19 });
  });
  it('parses "next monday" from a Friday ref', () => {
    const ref = { y: 2026, m: 6, d: 12 };
    expect(parseNaturalInput('next monday', ref)).toEqual({ y: 2026, m: 6, d: 15 });
  });
  it('returns null for unrecognized phrases', () => {
    expect(parseNaturalInput('quokka tomorrow', { y: 2026, m: 6, d: 12 })).toBeNull();
  });
});
