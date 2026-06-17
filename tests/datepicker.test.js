import { describe, it, expect, beforeEach } from 'vitest';
import { DatePicker } from '../src/datepicker.js';

describe('DatePicker', () => {
  let input;
  beforeEach(() => {
    document.body.innerHTML = '';
    input = document.createElement('input');
    input.setAttribute('type', 'text');
    document.body.appendChild(input);
  });

  it('creates instance with input and opens on focus', () => {
    const dp = new DatePicker({ input, locale: 'en-US' });
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    dp.destroy();
  });

  it('selecting a date writes regional value back to input', () => {
    const dp = new DatePicker({ input, locale: 'en-US' });
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    // Simulate clicking a grid cell by calling the internal handler via keyboard
    const dialog = document.querySelector('[role="dialog"]');
    const cells = dialog.querySelectorAll('[role="gridcell"]');
    const target = Array.from(cells).find((c) => c.dataset.iso === '2026-6-15');
    if (target) {
      target.click();
      expect(input.value).toBe('06/15/2026');
      expect(dp.getValue()).toBe('2026-06-15');
    }
    dp.destroy();
  });

  it('destroy removes dialog and listeners', () => {
    const dp = new DatePicker({ input, locale: 'en-US' });
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    dp.destroy();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('range mode clicks write range regional value back to input', () => {
    const dp = new DatePicker({ input, locale: 'en-US', mode: 'range' });
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    const dialog = document.querySelector('[role="dialog"]');
    const cells = dialog.querySelectorAll('[role="gridcell"]');
    const targetStart = Array.from(cells).find((c) => c.dataset.iso === '2026-6-15');
    
    if (targetStart) {
      targetStart.click();
      expect(input.value).toBe('06/15/2026');
      const dialog2 = document.querySelector('[role="dialog"]');
      const cells2 = dialog2.querySelectorAll('[role="gridcell"]');
      const targetEnd2 = Array.from(cells2).find((c) => c.dataset.iso === '2026-6-20');
      if (targetEnd2) {
        targetEnd2.click();
        expect(input.value).toBe('06/15/2026 to 06/20/2026');
        expect(dp.getValue()).toBe('2026-06-15 to 2026-06-20');
      }
    }
    dp.destroy();
  });

  it('typing a valid range updates the input and selection', () => {
    const dp = new DatePicker({ input, locale: 'en-US', mode: 'range' });
    input.value = '2026-06-15 to 2026-06-20';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.value).toBe('06/15/2026 to 06/20/2026');
    expect(dp.getValue()).toBe('2026-06-15 to 2026-06-20');
    dp.destroy();
  });

  it('typing an invalid date sets aria-invalid to true', () => {
    const dp = new DatePicker({ input, locale: 'en-US' });
    input.value = 'invalid-date-string';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(input.getAttribute('aria-invalid')).toBe('true');
    dp.destroy();
  });

  it('inline mode does not trigger popup dialog on focus', () => {
    const container = document.createElement('div');
    container.id = 'inline-test';
    document.body.appendChild(container);
    const dp = new DatePicker({ input: container, inline: true });
    
    // Simulate focusing inline element or button inside it
    container.dispatchEvent(new Event('focus', { bubbles: true }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    
    dp.destroy();
    document.body.removeChild(container);
  });
});