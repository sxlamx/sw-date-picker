export const MODES = Object.freeze({
  SINGLE: 'single',
  RANGE: 'range',
  MULTIPLE: 'multiple',
  MONTH: 'month',
  YEAR: 'year',
  DATETIME: 'datetime',
});

export const DEFAULT_YEAR_MIN = 1900;
export const DEFAULT_YEAR_MAX = 2100;

export const KEY = Object.freeze({
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Tab: 'Tab',
});

export const RESERVED_KEYS = Object.freeze(['__proto__', 'constructor', 'prototype']);
