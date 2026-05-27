import type { HoursBreakdown } from '#/types';

interface PaymentConfig {
  hourlyRate: number;
  overtimeRate: number;
  nightSurcharge: number;
  nightOvertimeRate: number;
  holidaySurcharge: number;
  holidayOvertimeRate: number;
  holidayNightOvertimeRate: number;
  sundaySurcharge: number;
  sundayOvertimeRate: number;
  sundayNightOvertimeRate: number;
}

export function calculatePayment(
  hours: HoursBreakdown,
  config: PaymentConfig
): number {
  const toHours = (m: number) => m / 60;
  const base = config.hourlyRate;

  const regular = toHours(hours.regularMinutes) * base;
  const night = toHours(hours.nightMinutes) * base * config.nightSurcharge;
  const overtime = toHours(hours.overtimeMinutes) * base * config.overtimeRate;
  const nightOvertime = toHours(hours.nightOvertimeMinutes) * base * config.nightOvertimeRate;

  const holiday = toHours(hours.holidayMinutes) * base * config.holidaySurcharge;
  const holidayOvertime = toHours(hours.holidayOvertimeMinutes) * base * config.holidayOvertimeRate;
  const holidayNightOvertime = toHours(hours.holidayNightOvertimeMinutes) * base * config.holidayNightOvertimeRate;

  const sunday = toHours(hours.sundayMinutes) * base * config.sundaySurcharge;
  const sundayOvertime = toHours(hours.sundayOvertimeMinutes) * base * config.sundayOvertimeRate;
  const sundayNightOvertime = toHours(hours.sundayNightOvertimeMinutes) * base * config.sundayNightOvertimeRate;

  return Math.round(
    regular + night + overtime + nightOvertime +
    holiday + holidayOvertime + holidayNightOvertime +
    sunday + sundayOvertime + sundayNightOvertime
  );
}
