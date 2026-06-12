import { describe, it, expect } from 'vitest';
import { SelectionState } from '../../src/ui/selection.js';

describe('SelectionState', () => {
  it('stores a selected ISO date', () => {
    const s = new SelectionState();
    expect(s.get()).toBeNull();
    s.set({ y: 2026, m: 12, d: 25 });
    expect(s.get()).toEqual({ y: 2026, m: 12, d: 25 });
  });
  it('clones value on get to prevent mutation', () => {
    const s = new SelectionState();
    const iso = { y: 2026, m: 12, d: 25 };
    s.set(iso);
    const got = s.get();
    got.d = 99;
    expect(s.get().d).toBe(25);
  });
  it('clear resets to null', () => {
    const s = new SelectionState();
    s.set({ y: 2026, m: 12, d: 25 });
    s.clear();
    expect(s.get()).toBeNull();
  });
});
