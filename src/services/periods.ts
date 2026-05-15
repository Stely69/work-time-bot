import { nowInColombia } from '../utils/date';

export interface QuincenaPeriod {
  start: Date;
  end: Date;
  label: string;
}

export function getCurrentPeriod(date: Date = nowInColombia()): QuincenaPeriod {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let start: Date;
  let end: Date;

  if (day >= 11 && day <= 25) {
    start = new Date(year, month, 11);
    end = new Date(year, month, 25);
  } else if (day >= 26) {
    start = new Date(year, month, 26);
    end = new Date(year, month + 1, 10);
  } else {
    start = new Date(year, month - 1, 26);
    end = new Date(year, month, 10);
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const label = `${start.getDate()} ${monthNames[start.getMonth()]} → ${end.getDate()} ${monthNames[end.getMonth()]}`;

  return { start, end, label };
}

export function isInCurrentPeriod(date: Date, period: QuincenaPeriod): boolean {
  const d = date.getTime();
  const s = new Date(period.start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(period.end);
  e.setHours(23, 59, 59, 999);
  return d >= s.getTime() && d <= e.getTime();
}
