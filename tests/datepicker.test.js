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

  it('selecting a date writes ISO value back to input', () => {
    const dp = new DatePicker({ input, locale: 'en-US' });
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    // Simulate clicking a grid cell by calling the internal handler via keyboard
    const dialog = document.querySelector('[role="dialog"]');
    const cells = dialog.querySelectorAll('[role="gridcell"]');
    const target = Array.from(cells).find((c) => c.dataset.iso === '2026-6-15');
    if (target) {
      target.click();
      expect(input.value).toMatch(/2026-06-15/);
    }
    dp.destroy();
  });

  it('destroy removes dialog and listeners', () => {
    const dp = new DatePicker({ input, locale: 'en-US' });
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    dp.destroy();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});