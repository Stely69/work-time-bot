import { minutesSinceMidnight, dateOnly } from '../utils/date';
import { isHoliday } from './colombian-holidays';
import { isSunday } from '../utils/date';

const NIGHT_START = 21 * 60;
const NIGHT_END = 6 * 60 + 24 * 60;

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
  const startMinutes = minutesSinceMidnight(startTime);
  const endMinutes = minutesSinceMidnight(endTime);

  const startDay = dateOnly(startTime);
  const endDay = dateOnly(endTime);

  const sameDay = startDay === endDay;

  const isHol = isHoliday(startTime);
  const isSun = !isHol && isSunday(startTime);

  let totalMinutes = 0;
  let regularMinutes = 0;
  let overtimeMinutes = 0;
  let nightMinutes = 0;
  let holidayMinutes = 0;
  let sundayMinutes = 0;

  if (sameDay) {
    totalMinutes = endMinutes - startMinutes;

    if (isHol) {
      holidayMinutes = totalMinutes;
    } else if (isSun) {
      sundayMinutes = totalMinutes;
    } else {
      for (let m = startMinutes; m < endMinutes; m++) {
        const inNight = m >= NIGHT_START || m < NIGHT_END - 24 * 60;
        if (inNight) {
          nightMinutes++;
        } else {
          regularMinutes++;
        }
      }
    }
  } else {
    const minutesToMidnight = (24 * 60) - startMinutes;
    const minutesFromMidnight = endMinutes;

    totalMinutes = minutesToMidnight + minutesFromMidnight;

    if (isHol) {
      holidayMinutes = totalMinutes;
    } else if (isSun) {
      sundayMinutes = totalMinutes;
    } else {
      for (let m = startMinutes; m < 24 * 60; m++) {
        if (m >= NIGHT_START || m < NIGHT_END - 24 * 60) {
          nightMinutes++;
        } else {
          regularMinutes++;
        }
      }
      for (let m = 0; m < endMinutes; m++) {
        if (m >= NIGHT_START || m < NIGHT_END - 24 * 60) {
          nightMinutes++;
        } else {
          regularMinutes++;
        }
      }
    }
  }

  if (!isHol && !isSun) {
    if (regularMinutes + nightMinutes > MAX_REGULAR_MINUTES) {
      const excess = (regularMinutes + nightMinutes) - MAX_REGULAR_MINUTES;

      const nightOvertime = Math.min(excess, nightMinutes);
      nightMinutes -= nightOvertime;
      const regularOvertime = excess - nightOvertime;
      regularMinutes -= regularOvertime;

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
