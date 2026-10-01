/**
 * Shared formatting + client-side export helpers (dossier printing, calendar
 * invites for confirmed departures, CSV ledgers for the ops console).
 */

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    timeZone: 'UTC',
  });
}

export function nightsFor(durationDays: number): number {
  return Math.max(0, durationDays - 1);
}

export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function truncate(text: string, max = 120): string {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/* -----------------------------------------------------------------------------
 * Clipboard
 * -------------------------------------------------------------------------- */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/* -----------------------------------------------------------------------------
 * ICS calendar invite for a confirmed departure
 * -------------------------------------------------------------------------- */
function icsDate(dateStr: string, end = false): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (end && !isNaN(d.getTime())) d.setUTCDate(d.getUTCDate() + 1);
  if (isNaN(d.getTime())) return `${dateStr.replace(/-/g, '')}T060000Z`;
  return `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

export function buildIcs(params: {
  uid: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jabali Trails Africa//Expedition Departures//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${params.uid}@jabalitrails.africa`,
    `DTSTAMP:${icsDate(params.startDate)}`,
    `DTSTART;VALUE=DATE:${icsDate(params.startDate).slice(0, 8)}`,
    `DTEND;VALUE=DATE:${icsDate(params.endDate, true).slice(0, 8)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    params.location ? `LOCATION:${params.location}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P14D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Permit documents & packing checklist due',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return lines.join('\r\n');
}

/* -----------------------------------------------------------------------------
 * Generic file download (ICS, CSV, TXT dossiers)
 * -------------------------------------------------------------------------- */
export function downloadFile(filename: string, contents: string, mime = 'text/plain') {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const escape = (value: unknown) => {
    const str = value == null ? '' : Array.isArray(value) ? value.join(' | ') : String(value);
    return `"${str.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  };
  return [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\r\n');
}
