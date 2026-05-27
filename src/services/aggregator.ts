import type { HoursBreakdown } from '#/types';

interface ShiftRow {
  regularHours: number | null;
  nightHours: number | null;
  overtimeHours: number | null;
  nightOvertimeHours: number | null;
  holidayHours: number | null;
  holidayOvertimeHours: number | null;
  holidayNightOvertimeHours: number | null;
  sundayHours: number | null;
  sundayOvertimeHours: number | null;
  sundayNightOvertimeHours: number | null;
  estimatedPayment: number | null;
}

export interface AggregatedResult extends HoursBreakdown {
  totalMinutes: number;
  payment: number;
}

export function aggregateShifts(shifts: ShiftRow[]): AggregatedResult {
  const result = {
    regularMinutes: 0,
    nightMinutes: 0,
    overtimeMinutes: 0,
    nightOvertimeMinutes: 0,
    holidayMinutes: 0,
    holidayOvertimeMinutes: 0,
    holidayNightOvertimeMinutes: 0,
    sundayMinutes: 0,
    sundayOvertimeMinutes: 0,
    sundayNightOvertimeMinutes: 0,
    payment: 0,
  };

  for (const s of shifts) {
    result.regularMinutes += (s.regularHours ?? 0) * 60;
    result.nightMinutes += (s.nightHours ?? 0) * 60;
    result.overtimeMinutes += (s.overtimeHours ?? 0) * 60;
    result.nightOvertimeMinutes += (s.nightOvertimeHours ?? 0) * 60;
    result.holidayMinutes += (s.holidayHours ?? 0) * 60;
    result.holidayOvertimeMinutes += (s.holidayOvertimeHours ?? 0) * 60;
    result.holidayNightOvertimeMinutes += (s.holidayNightOvertimeHours ?? 0) * 60;
    result.sundayMinutes += (s.sundayHours ?? 0) * 60;
    result.sundayOvertimeMinutes += (s.sundayOvertimeHours ?? 0) * 60;
    result.sundayNightOvertimeMinutes += (s.sundayNightOvertimeHours ?? 0) * 60;
    result.payment += (s.estimatedPayment ?? 0);
  }

  const totalMinutes =
    result.regularMinutes + result.nightMinutes +
    result.overtimeMinutes + result.nightOvertimeMinutes +
    result.holidayMinutes + result.holidayOvertimeMinutes +
    result.holidayNightOvertimeMinutes +
    result.sundayMinutes + result.sundayOvertimeMinutes +
    result.sundayNightOvertimeMinutes;

  return { ...result, totalMinutes };
}
