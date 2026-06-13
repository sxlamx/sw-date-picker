import { describe, it, expect } from 'vitest';
import { keyToAction, ACTION } from '../../src/ui/keyboard.js';

describe('keyToAction', () => {
  const sel = { y: 2026, m: 6, d: 12 }; // Friday
  it('ArrowRight moves +1 day', () => {
    expect(keyToAction('ArrowRight', false, sel)).toEqual({ type: ACTION.MOVE_DAY, delta: 1 });
  });
  it('ArrowLeft moves -1 day', () => {
    expect(keyToAction('ArrowLeft', false, sel)).toEqual({ type: ACTION.MOVE_DAY, delta: -1 });
  });
  it('ArrowUp/Down move by week', () => {
    expect(keyToAction('ArrowUp', false, sel).delta).toBe(-7);
    expect(keyToAction('ArrowDown', false, sel).delta).toBe(7);
  });
  it('PageUp/Down move by month', () => {
    expect(keyToAction('PageUp', false, sel)).toEqual({ type: ACTION.SHIFT_MONTH, delta: -1 });
    expect(keyToAction('PageDown', false, sel)).toEqual({ type: ACTION.SHIFT_MONTH, delta: 1 });
  });
  it('Shift+PageUp/Down move by year', () => {
    expect(keyToAction('PageUp', true, sel)).toEqual({ type: ACTION.SHIFT_YEAR, delta: -1 });
    expect(keyToAction('PageDown', true, sel)).toEqual({ type: ACTION.SHIFT_YEAR, delta: 1 });
  });
  it('Home/End jump to start/end of month', () => {
    expect(keyToAction('Home', false, sel).type).toBe(ACTION.JUMP_START_OF_MONTH);
    expect(keyToAction('End', false, sel).type).toBe(ACTION.JUMP_END_OF_MONTH);
  });
  it('Enter/Space select', () => {
    expect(keyToAction('Enter', false, sel).type).toBe(ACTION.SELECT);
    expect(keyToAction(' ', false, sel).type).toBe(ACTION.SELECT);
  });
  it('Escape returns null (handled by popup)', () => {
    expect(keyToAction('Escape', false, sel)).toBeNull();
  });
});
