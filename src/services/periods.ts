import { colombiaDateParts, colombiaNowUTC } from '#/utils/date';

export interface QuincenaPeriod {
  startColombia: { year: number; month: number; day: number };
  endColombia: { year: number; month: number; day: number };
  label: string;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function getCurrentPeriod(now?: Date): QuincenaPeriod {
  const { year, month, day } = colombiaDateParts(now ?? colombiaNowUTC());

  let startYear: number, startMonth: number, startDay: number;
  let endYear: number, endMonth: number, endDay: number;

  if (day >= 11 && day <= 25) {
    startYear = year; startMonth = month; startDay = 11;
    endYear = year; endMonth = month; endDay = 25;
  } else if (day >= 26) {
    startYear = year; startMonth = month; startDay = 26;
    endYear = year; endMonth = month + 1; endDay = 10;
    if (endMonth > 11) { endYear++; endMonth -= 12; }
  } else {
    startYear = year; startMonth = month - 1; startDay = 26;
    if (startMonth < 0) { startYear--; startMonth += 12; }
    endYear = year; endMonth = month; endDay = 10;
  }

  const label = `${startDay} ${monthNames[startMonth]} → ${endDay} ${monthNames[endMonth]}`;

  return {
    startColombia: { year: startYear, month: startMonth, day: startDay },
    endColombia: { year: endYear, month: endMonth, day: endDay },
    label,
  };
}
