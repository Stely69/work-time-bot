import { colombiaMinutes, colombiaDateStr, colombiaIsSunday } from '#/utils/date';
import { isHoliday } from '#/services/colombian-holidays';
import type { HoursBreakdown } from '#/types';

const NIGHT_START = 21 * 60;
const MAX_REGULAR_MINUTES = 8 * 60;

export interface ShiftResult extends HoursBreakdown {
  date: string;
  totalMinutes: number;
}

export function calculateShift(startTime: Date, endTime: Date): ShiftResult {
  const startMinutes = colombiaMinutes(startTime);
  const endMinutes = colombiaMinutes(endTime);

  const startDay = colombiaDateStr(startTime);
  const endDay = colombiaDateStr(endTime);

  const sameDay = startDay === endDay;
  const isHol = isHoliday(startTime);
  const isSun = colombiaIsSunday(startTime);

  function stepMinute(m: number) {
    return m >= NIGHT_START || m < 6 * 60;
  }

  const totalMinutes = sameDay
    ? endMinutes - startMinutes
    : (24 * 60 - startMinutes) + endMinutes;

  let workedMinutes = 0;
  let regularMinutes = 0;
  let nightMinutes = 0;
  let overtimeMinutes = 0;
  let nightOvertimeMinutes = 0;
  let holidayMinutes = 0;
  let holidayOvertimeMinutes = 0;
  let holidayNightOvertimeMinutes = 0;
  let sundayMinutes = 0;
  let sundayOvertimeMinutes = 0;
  let sundayNightOvertimeMinutes = 0;

  function classifyMinute(m: number) {
    workedMinutes++;
    const isNight = stepMinute(m);
    const isOvertime = workedMinutes > MAX_REGULAR_MINUTES;

    if (isHol) {
      if (isNight && isOvertime) holidayNightOvertimeMinutes++;
      else if (isOvertime) holidayOvertimeMinutes++;
      else holidayMinutes++;
    } else if (isSun) {
      if (isNight && isOvertime) sundayNightOvertimeMinutes++;
      else if (isOvertime) sundayOvertimeMinutes++;
      else sundayMinutes++;
    } else if (isNight && isOvertime) {
      nightOvertimeMinutes++;
    } else if (isNight) {
      nightMinutes++;
    } else if (isOvertime) {
      overtimeMinutes++;
    } else {
      regularMinutes++;
    }
  }

  if (sameDay) {
    for (let m = startMinutes; m < endMinutes; m++) {
      classifyMinute(m);
    }
  } else {
    for (let m = startMinutes; m < 24 * 60; m++) {
      classifyMinute(m);
    }
    for (let m = 0; m < endMinutes; m++) {
      classifyMinute(m);
    }
  }

  return {
    date: startDay,
    totalMinutes,
    regularMinutes,
    nightMinutes,
    overtimeMinutes,
    nightOvertimeMinutes,
    holidayMinutes,
    holidayOvertimeMinutes,
    holidayNightOvertimeMinutes,
    sundayMinutes,
    sundayOvertimeMinutes,
    sundayNightOvertimeMinutes,
  };
}
