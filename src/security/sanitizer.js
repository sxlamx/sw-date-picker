const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeText(value) {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

export function setText(el, value) {
  el.textContent = value == null ? '' : String(value);
}
