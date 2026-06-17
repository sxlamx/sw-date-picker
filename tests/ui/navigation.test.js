import { describe, it, expect } from 'vitest';
import { clampView, shiftView } from '../../src/ui/navigation.js';

describe('navigation', () => {
  it('clampView enforces year bounds', () => {
    expect(clampView({ y: 2099, m: 12 }, 1900, 2100)).toEqual({ y: 2099, m: 12 });
    expect(clampView({ y: 2101, m: 1 }, 1900, 2100)).toEqual({ y: 2100, m: 1 });
    expect(clampView({ y: 1899, m: 1 }, 1900, 2100)).toEqual({ y: 1900, m: 1 });
  });
  it('shiftView advances by months/years', () => {
    expect(shiftView({ y: 2026, m: 12 }, 1, 0)).toEqual({ y: 2027, m: 1 });
    expect(shiftView({ y: 2026, m: 1 }, -1, 0)).toEqual({ y: 2025, m: 12 });
    expect(shiftView({ y: 2026, m: 6 }, 0, 1)).toEqual({ y: 2027, m: 6 });
    expect(shiftView({ y: 2026, m: 6 }, 0, -1)).toEqual({ y: 2025, m: 6 });
  });
  it('shiftView applies year clamp', () => {
    expect(shiftView({ y: 2100, m: 6 }, 12, 0, 1900, 2100)).toEqual({ y: 2100, m: 6 });
  });
});
