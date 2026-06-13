import { describe, it, expect } from 'vitest';
import { escapeText, setText } from '../../src/security/sanitizer.js';

describe('escapeText', () => {
  it('escapes &<>"\' and /', () => {
    expect(escapeText('<script>"&\'</script>')).toBe('&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
  });
  it('passes through safe strings unchanged', () => {
    expect(escapeText('Hello, world')).toBe('Hello, world');
  });
});

describe('setText', () => {
  it('uses textContent (never innerHTML)', () => {
    const el = document.createElement('div');
    setText(el, '<img onerror=1>');
    expect(el.textContent).toBe('<img onerror=1>');
    expect(el.children.length).toBe(0);
    expect(el.innerHTML).toBe('&lt;img onerror=1&gt;');
  });
});
