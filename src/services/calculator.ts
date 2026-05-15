import { colombiaMinutes, colombiaDateStr, colombiaIsSunday } from '#/utils/date';
import { isHoliday } from '#/services/colombian-holidays';

const NIGHT_START = 19 * 60;
const MAX_REGULAR_MINUTES = 8 * 60;

export interface ShiftResult {
  date: string;
  isHoliday: boolean;
  isSunday: boolean;
  totalMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  holidayMinutes: number;
  sundayMinutes: number;
}

export function calculateShift(startTime: Date, endTime: Date): ShiftResult {
  const startMinutes = colombiaMinutes(startTime);
  const endMinutes = colombiaMinutes(endTime);

  const startDay = colombiaDateStr(startTime);
  const endDay = colombiaDateStr(endTime);

  const sameDay = startDay === endDay;
  const isHol = isHoliday(startTime);
  const isSun = isHoliday(startTime) ? false : colombiaIsSunday(startTime);

  let totalMinutes = 0;
  let regularMinutes = 0;
  let overtimeMinutes = 0;
  let nightMinutes = 0;
  let holidayMinutes = 0;
  let sundayMinutes = 0;

  function stepMinute(m: number) {
    return m >= NIGHT_START || m < 6 * 60;
  }

  if (sameDay) {
    totalMinutes = endMinutes - startMinutes;

    if (isHol) {
      holidayMinutes = totalMinutes;
    } else if (isSun) {
      sundayMinutes = totalMinutes;
    } else {
      for (let m = startMinutes; m < endMinutes; m++) {
        if (stepMinute(m)) nightMinutes++;
        else regularMinutes++;
      }
    }
  } else {
    totalMinutes = (24 * 60 - startMinutes) + endMinutes;

    if (isHol) {
      holidayMinutes = totalMinutes;
    } else if (isSun) {
      sundayMinutes = totalMinutes;
    } else {
      for (let m = startMinutes; m < 24 * 60; m++) {
        if (stepMinute(m)) nightMinutes++;
        else regularMinutes++;
      }
      for (let m = 0; m < endMinutes; m++) {
        if (stepMinute(m)) nightMinutes++;
        else regularMinutes++;
      }
    }
  }

  if (!isHol && !isSun) {
    if (regularMinutes + nightMinutes > MAX_REGULAR_MINUTES) {
      const excess = regularMinutes + nightMinutes - MAX_REGULAR_MINUTES;
      const nightOvertime = Math.min(excess, nightMinutes);
      nightMinutes -= nightOvertime;
      regularMinutes -= excess - nightOvertime;
      overtimeMinutes = excess;
    }
  }

  return {
    date: startDay,
    isHoliday: isHol,
    isSunday: isSun,
    totalMinutes,
    regularMinutes,
    overtimeMinutes,
    nightMinutes,
    holidayMinutes,
    sundayMinutes,
  };
}
