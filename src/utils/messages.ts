import { formatDate, formatTime, formatDuration } from '#/utils/date';
import { formatCOP } from '#/utils/numbers';

interface ShiftSummary {
  date: string;
  startTime: Date;
  endTime: Date;
  totalMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  holidayMinutes: number;
  sundayMinutes: number;
  payment: number;
}

export function entradaResponse(date: Date): string {
  return [
    `✅ Entrada registrada`,
    ``,
    `📅 Fecha:`,
    `  ${formatDate(date)}`,
    ``,
    `🕒 Hora de inicio:`,
    `  ${formatTime(date)}`,
  ].join('\n');
}

export function salidaResponse(s: ShiftSummary): string {
  const lines = [
    `✅ Turno finalizado`,
    ``,
    `📅 Fecha:`,
    `  ${s.date}`,
    ``,
    `🕒 Entrada:`,
    `  ${formatTime(s.startTime)}`,
    ``,
    `🕘 Salida:`,
    `  ${formatTime(s.endTime)}`,
    ``,
    `⏱️ Total trabajado:`,
    `  ${formatDuration(s.totalMinutes)}`,
    ``,
    `📊 Resumen:`,
    `  - Ordinarias: ${formatDuration(s.regularMinutes)}`,
    `  - Extras: ${formatDuration(s.overtimeMinutes)}`,
    `  - Nocturnas: ${formatDuration(s.nightMinutes)}`,
    `  - Festivas: ${formatDuration(s.holidayMinutes)}`,
    `  - Dominicales: ${formatDuration(s.sundayMinutes)}`,
    ``,
    `💰 Ganancia aproximada:`,
    `  ${formatCOP(s.payment)}`,
  ];
  return lines.join('\n');
}

interface PeriodSummary {
  periodLabel: string;
  regularMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  holidayMinutes: number;
  sundayMinutes: number;
  payment: number;
}

export function quincenaResponse(p: PeriodSummary): string {
  const lines = [
    `📅 Corte actual:`,
    `  ${p.periodLabel}`,
    ``,
    `⏱️ Resumen:`,
    `  - Ordinarias: ${formatDuration(p.regularMinutes)}`,
    `  - Extras: ${formatDuration(p.overtimeMinutes)}`,
    `  - Nocturnas: ${formatDuration(p.nightMinutes)}`,
    `  - Festivas: ${formatDuration(p.holidayMinutes)}`,
    `  - Dominicales: ${formatDuration(p.sundayMinutes)}`,
    ``,
    `💰 Pago aproximado:`,
    `  ${formatCOP(p.payment)}`,
  ];
  return lines.join('\n');
}

export function hoyResponse(s: ShiftSummary): string {
  const lines = [
    `📅 Hoy: ${s.date}`,
    ``,
    `⏱️ Total: ${formatDuration(s.totalMinutes)}`,
    ``,
    `📊 Resumen:`,
    `  - Ordinarias: ${formatDuration(s.regularMinutes)}`,
    `  - Extras: ${formatDuration(s.overtimeMinutes)}`,
    `  - Nocturnas: ${formatDuration(s.nightMinutes)}`,
    `  - Festivas: ${formatDuration(s.holidayMinutes)}`,
    `  - Dominicales: ${formatDuration(s.sundayMinutes)}`,
    ``,
    `💰 ${formatCOP(s.payment)}`,
  ];
  return lines.join('\n');
}

export function historialResponse(
  shifts: { date: string; start: string; end: string; total: number; payment: number }[]
): string {
  if (shifts.length === 0) return '📋 No hay turnos registrados.';

  const lines = ['📋 Últimos turnos:', ''];
  for (const s of shifts) {
    lines.push(`  ${s.date} → ${s.start} - ${s.end} (${formatDuration(s.total)}) ${formatCOP(s.payment)}`);
  }
  return lines.join('\n');
}

export function tarifaResponse(rate: number): string {
  return `✅ Tarifa actualizada: ${formatCOP(rate)}/hora`;
}

export function errorMessage(msg: string): string {
  return `❌ ${msg}`;
}
