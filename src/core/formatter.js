export function formatDate(isoDate, locale = 'en-US', formatFn = null) {
  if (!isoDate || !isoDate.y || !isoDate.m || !isoDate.d) return '';
  if (formatFn) return formatFn(isoDate);
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

export function formatDateTime(dt, locale = 'en-US', hour12 = false) {
  if (!dt) return '';
  try {
    const utc = new Date(Date.UTC(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi, dt.s));
    const fmt = new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12, timeZone: 'UTC',
    });
    return fmt.format(utc);
  } catch {
    return '';
  }
}
