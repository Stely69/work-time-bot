const COLOMBIA_OFFSET_MS = -5 * 3600 * 1000;

export function toColombia(utcDate: Date): Date {
  return new Date(utcDate.getTime() + COLOMBIA_OFFSET_MS);
}

function cp(utcDate: Date) {
  const d = toColombia(utcDate);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
    weekday: d.getUTCDay(),
  };
}

export function colombiaMinutes(utcDate: Date): number {
  const { hours, minutes } = cp(utcDate);
  return hours * 60 + minutes;
}

export function colombiaDateStr(utcDate: Date): string {
  const { year, month, day } = cp(utcDate);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function colombiaDayOfWeek(utcDate: Date): number {
  return cp(utcDate).weekday;
}

export function colombiaIsSunday(utcDate: Date): boolean {
  return colombiaDayOfWeek(utcDate) === 0;
}

export function colombiaDateParts(utcDate: Date) {
  return cp(utcDate);
}

export function formatDateColombia(utcDate: Date): string {
  const { year, month, day } = cp(utcDate);
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return `${day} ${months[month]} ${year}`;
}

export function formatTimeColombia(utcDate: Date): string {
  const { hours, minutes } = cp(utcDate);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTimeColon(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function colombiaDayToUTCRange(year: number, month: number, day: number) {
  const start = new Date(Date.UTC(year, month, day, 5, 0, 0)).toISOString();
  const end = new Date(Date.UTC(year, month, day + 1, 4, 59, 59, 999)).toISOString();
  return { startUTC: start, endUTC: end };
}

export function colombiaNowUTC(): Date {
  return new Date();
}

export function colombiaTimeToUTC(utcDate: Date, hours: number, minutes: number): Date {
  const { year, month, day } = colombiaDateParts(utcDate);
  return new Date(Date.UTC(year, month, day, hours + 5, minutes, 0));
}
