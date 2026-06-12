export function formatDate(isoDate, locale = 'en-US') {
  if (!isoDate || !isoDate.y || !isoDate.m || !isoDate.d) return '';
  const utc = new Date(Date.UTC(isoDate.y, isoDate.m - 1, isoDate.d));
  try {
    const fmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
    return fmt.format(utc);
  } catch {
    return '';
  }
}

export function formatISODate(isoDate) {
  if (!isoDate) return '';
  return `${String(isoDate.y).padStart(4, '0')}-${String(isoDate.m).padStart(2, '0')}-${String(isoDate.d).padStart(2, '0')}`;
}
