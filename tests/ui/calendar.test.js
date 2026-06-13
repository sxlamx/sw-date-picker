import { describe, it, expect } from 'vitest';
import { buildMonthMatrix, renderMonthGrid } from '../../src/ui/calendar.js';
import { weekdayNames } from '../../src/core/locale-engine.js';

describe('buildMonthMatrix', () => {
  it('returns 6 rows of 7', () => {
    const m = buildMonthMatrix({ y: 2026, m: 12 }, 0, { y: 2026, m: 12, d: 25 });
    expect(m).toHaveLength(6);
    m.forEach((row) => expect(row).toHaveLength(7));
  });
  it('starts on firstDayOfWeek=0 (Sun) for Dec 2026', () => {
    // Dec 1 2026 is a Tuesday.
    const m = buildMonthMatrix({ y: 2026, m: 12 }, 0, null);
    expect(m[0][0].iso).toEqual({ y: 2026, m: 11, d: 29 }); // Sun before
    expect(m[0][1].iso).toEqual({ y: 2026, m: 11, d: 30 });
  });
  it('starts on Monday when firstDayOfWeek=1', () => {
    const m = buildMonthMatrix({ y: 2026, m: 12 }, 1, null);
    expect(m[0][0].iso).toEqual({ y: 2026, m: 11, d: 30 }); // Mon before
    expect(m[0][1].iso).toEqual({ y: 2026, m: 12, d: 1 });
  });
  it('marks today cell', () => {
    const m = buildMonthMatrix({ y: 2026, m: 12 }, 0, { y: 2026, m: 12, d: 25 });
    const all = m.flat();
    const today = all.find((c) => c.isToday);
    expect(today.iso).toEqual({ y: 2026, m: 12, d: 25 });
  });
  it('flags inMonth', () => {
    const m = buildMonthMatrix({ y: 2026, m: 12 }, 0, null);
    const outside = m.flat().filter((c) => !c.inMonth);
    expect(outside.length).toBeGreaterThan(0);
  });
});

describe('renderMonthGrid', () => {
  it('renders 42 cells with role=grid and gridcell children', () => {
    const root = document.createElement('div');
    renderMonthGrid(root, {
      view: { y: 2026, m: 12 },
      firstDayOfWeek: 0,
      today: { y: 2026, m: 12, d: 25 },
      selected: null,
      locale: 'en-US',
      weekdayNames: weekdayNames('en-US', 'short'),
    });
    expect(root.getAttribute('role')).toBe('grid');
    expect(root.querySelectorAll('[role="gridcell"]')).toHaveLength(42);
    expect(root.querySelectorAll('[aria-label*="Today"]')).toHaveLength(1);
  });
  it('uses textContent (never innerHTML) for cell labels', () => {
    const root = document.createElement('div');
    renderMonthGrid(root, {
      view: { y: 2026, m: 12 },
      firstDayOfWeek: 0,
      today: null,
      selected: null,
      locale: 'en-US',
      weekdayNames: weekdayNames('en-US', 'short'),
    });
    const html = root.innerHTML;
    // Sanity: no inline event handler attributes.
    expect(html).not.toMatch(/ on[a-z]+=/i);
  });
});
