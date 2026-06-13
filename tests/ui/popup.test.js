import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Popup } from '../../src/ui/popup.js';

describe('Popup', () => {
  let trigger;
  beforeEach(() => {
    document.body.innerHTML = '';
    trigger = document.createElement('input');
    document.body.appendChild(trigger);
  });

  it('opens anchored to trigger with role=dialog', () => {
    const popup = new Popup({ trigger, onClose: vi.fn() });
    popup.open(document.createElement('div'));
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    popup.destroy();
  });
  it('click outside closes', () => {
    const onClose = vi.fn();
    const popup = new Popup({ trigger, onClose });
    popup.open(document.createElement('div'));
    document.body.click();
    expect(onClose).toHaveBeenCalled();
    popup.destroy();
  });
  it('Escape closes', () => {
    const onClose = vi.fn();
    const popup = new Popup({ trigger, onClose });
    popup.open(document.createElement('div'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).toHaveBeenCalled();
    popup.destroy();
  });
  it('destroy removes listeners and DOM', () => {
    const popup = new Popup({ trigger, onClose: vi.fn() });
    popup.open(document.createElement('div'));
    popup.destroy();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
