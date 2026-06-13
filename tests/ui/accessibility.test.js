import { describe, it, expect, vi } from 'vitest';
import { FocusTrap } from '../../src/ui/accessibility.js';

describe('FocusTrap', () => {
  it('cycles focus forward: last -> first', () => {
    const container = document.createElement('div');
    const a = document.createElement('button'); a.textContent = 'A';
    const b = document.createElement('button'); b.textContent = 'B';
    container.append(a, b);
    document.body.append(container);
    const ft = new FocusTrap(container);
    b.focus();
    ft.next();
    expect(document.activeElement).toBe(a);
    container.remove();
  });
  it('cycles focus backward: first -> last', () => {
    const container = document.createElement('div');
    const a = document.createElement('button'); a.textContent = 'A';
    const b = document.createElement('button'); b.textContent = 'B';
    container.append(a, b);
    document.body.append(container);
    const ft = new FocusTrap(container);
    a.focus();
    ft.prev();
    expect(document.activeElement).toBe(b);
    container.remove();
  });
});

import { announce } from '../../src/ui/accessibility.js';

describe('announce', () => {
  it('creates an aria-live region and sets text', () => {
    announce('December 2026');
    const live = document.querySelector('[aria-live="assertive"]');
    expect(live).toBeTruthy();
    expect(live.textContent).toBe('December 2026');
  });
});
