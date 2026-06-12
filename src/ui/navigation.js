import { addMonths } from '../core/date-engine.js';

export function clampView(view, minYear, maxYear) {
  const y = Math.min(Math.max(view.y, minYear), maxYear);
  return { y, m: view.m };
}

export function shiftView(view, months, years, minYear = 1900, maxYear = 2100) {
  const next = addMonths({ y: view.y, m: view.m, d: 1 }, months + years * 12);
  return clampView({ y: next.y, m: next.m }, minYear, maxYear);
}
