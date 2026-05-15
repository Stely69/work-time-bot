interface PaymentConfig {
  hourlyRate: number;
  overtimeRate: number;
  nightSurcharge: number;
  holidaySurcharge: number;
  sundaySurcharge: number;
}

interface HoursBreakdown {
  regularMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  holidayMinutes: number;
  sundayMinutes: number;
}

export function calculatePayment(
  hours: HoursBreakdown,
  config: PaymentConfig
): number {
  const toHours = (m: number) => m / 60;

  const base = config.hourlyRate;

  const regular = toHours(hours.regularMinutes) * base;
  const overtime = toHours(hours.overtimeMinutes) * base * config.overtimeRate;
  const night = toHours(hours.nightMinutes) * base * config.nightSurcharge;
  const holiday = toHours(hours.holidayMinutes) * base * config.holidaySurcharge;
  const sunday = toHours(hours.sundayMinutes) * base * config.sundaySurcharge;

  return regular + overtime + night + holiday + sunday;
}
