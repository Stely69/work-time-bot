import {
  formatDateColombia,
  formatTimeColombia,
  formatDuration,
} from "#/utils/date";
import { formatCOP } from "#/utils/numbers";

interface ShiftSummary {
  date: string;
  startTime: Date;
  endTime: Date;
  totalMinutes: number;
  regularMinutes: number;
  nightMinutes: number;
  overtimeMinutes: number;
  nightOvertimeMinutes: number;
  holidayMinutes: number;
  holidayOvertimeMinutes: number;
  holidayNightOvertimeMinutes: number;
  sundayMinutes: number;
  sundayOvertimeMinutes: number;
  sundayNightOvertimeMinutes: number;
  payment: number;
}

export function entradaResponse(date: Date): string {
  return [
    `✅ Entrada registrada`,
    ``,
    `📅 Fecha:`,
    `  ${formatDateColombia(date)}`,
    ``,
    `🕒 Hora de inicio:`,
    `  ${formatTimeColombia(date)}`,
  ].join("\n");
}

export function salidaResponse(s: ShiftSummary): string {
  const lines = [
    `✅ Turno finalizado`,
    ``,
    `📅 Fecha:`,
    `  ${s.date}`,
    ``,
    `🕒 Entrada:`,
    `  ${formatTimeColombia(s.startTime)}`,
    ``,
    `🕘 Salida:`,
    `  ${formatTimeColombia(s.endTime)}`,
    ``,
    `⏱️ Total trabajado:`,
    `  ${formatDuration(s.totalMinutes)}`,
    ``,
    `📊 Resumen:`,

    `  - Ordinarias diurnas: ${formatDuration(s.regularMinutes)}`,
    `  - Ordinarias nocturnas: ${formatDuration(s.nightMinutes)}`,

    `  ───────────────────────────`,

    `  - Extras diurnas: ${formatDuration(s.overtimeMinutes)}`,
    `  - Extras nocturnas: ${formatDuration(s.nightOvertimeMinutes)}`,

    `  ───────────────────────────`,

    `  - Festivas: ${formatDuration(s.holidayMinutes)}`,
    `  - Extras festivas diurnas: ${formatDuration(s.holidayOvertimeMinutes)}`,
    `  - Extras festivas nocturnas: ${formatDuration(s.holidayNightOvertimeMinutes)}`,

    `  ───────────────────────────`,

    `  - Dominicales: ${formatDuration(s.sundayMinutes)}`,
    `  - Extras dominicales diurnas: ${formatDuration(s.sundayOvertimeMinutes)}`,
    `  - Extras dominicales nocturnas: ${formatDuration(s.sundayNightOvertimeMinutes)}`,
    ``,
    `💰 Ganancia aproximada:`,
    `  ${formatCOP(s.payment)}`,
  ];
  return lines.join("\n");
}

interface PeriodSummary {
  periodLabel: string;
  regularMinutes: number;
  nightMinutes: number;
  overtimeMinutes: number;
  nightOvertimeMinutes: number;
  holidayMinutes: number;
  holidayOvertimeMinutes: number;
  holidayNightOvertimeMinutes: number;
  sundayMinutes: number;
  sundayOvertimeMinutes: number;
  sundayNightOvertimeMinutes: number;
  payment: number;
}

export function quincenaResponse(p: PeriodSummary): string {
  const lines = [
    `📅 Corte actual:`,
    `  ${p.periodLabel}`,

    ``,

    `⏱️ Resumen:`,

    `  - Ordinarias diurnas: ${formatDuration(p.regularMinutes)}`,
    `  - Ordinarias nocturnas: ${formatDuration(p.nightMinutes)}`,

    `  ───────────────────────────`,

    `  - Extras diurnas: ${formatDuration(p.overtimeMinutes)}`,
    `  - Extras nocturnas: ${formatDuration(p.nightOvertimeMinutes)}`,

    `  ───────────────────────────`,

    `  - Festivas: ${formatDuration(p.holidayMinutes)}`,
    `  - Extras festivas diurnas: ${formatDuration(p.holidayOvertimeMinutes)}`,
    `  - Extras festivas nocturnas: ${formatDuration(p.holidayNightOvertimeMinutes)}`,

    `  ───────────────────────────`,

    `  - Dominicales: ${formatDuration(p.sundayMinutes)}`,
    `  - Extras dominicales diurnas: ${formatDuration(p.sundayOvertimeMinutes)}`,
    `  - Extras dominicales nocturnas: ${formatDuration(p.sundayNightOvertimeMinutes)}`,

    ``,

    `💰 Pago aproximado:`,
    `  ${formatCOP(p.payment)}`,
  ];
  return lines.join("\n");
}

export function hoyResponse(s: ShiftSummary): string {
  const lines = [
    `📅 Hoy: ${s.date}`,

    ``,

    `⏱️ Total trabajado: ${formatDuration(s.totalMinutes)}`,

    ``,

    `📊 Resumen:`,

    `  - Ordinarias diurnas: ${formatDuration(s.regularMinutes)}`,
    `  - Ordinarias nocturnas: ${formatDuration(s.nightMinutes)}`,

    `  ───────────────────────────`,

    `  - Extras diurnas: ${formatDuration(s.overtimeMinutes)}`,
    `  - Extras nocturnas: ${formatDuration(s.nightOvertimeMinutes)}`,

    `  ───────────────────────────`,

    `  - Festivas: ${formatDuration(s.holidayMinutes)}`,
    `  - Extras festivas diurnas: ${formatDuration(s.holidayOvertimeMinutes)}`,
    `  - Extras festivas nocturnas: ${formatDuration(s.holidayNightOvertimeMinutes)}`,

    `  ───────────────────────────`,

    `  - Dominicales: ${formatDuration(s.sundayMinutes)}`,
    `  - Extras dominicales diurnas: ${formatDuration(s.sundayOvertimeMinutes)}`,
    `  - Extras dominicales nocturnas: ${formatDuration(s.sundayNightOvertimeMinutes)}`,

    ``,

    `💰 Pago aproximado:`,
    `  ${formatCOP(s.payment)}`,
  ];
  return lines.join("\n");
}

export function historialResponse(
  shifts: {
    date: string;
    start: string;
    end: string;
    total: number;
    payment: number;
  }[],
): string {
  if (shifts.length === 0) return "📋 No hay turnos registrados.";

  const lines = ["📋 Últimos turnos:", ""];
  for (const s of shifts) {
    lines.push(
      `  ${s.date} → ${s.start} - ${s.end} (${formatDuration(s.total)}) ${formatCOP(s.payment)}`,
    );
  }
  return lines.join("\n");
}

export function tarifaResponse(rate: number): string {
  return `✅ Tarifa actualizada: ${formatCOP(rate)}/hora`;
}

export function startResponse(): string {
  return [
    `👋 ¡Bienvenido al WorkTime Bot!`,
    ``,
    `Este bot te ayuda a registrar tu jornada laboral y calcular tu pago aproximado según las normas colombianas.`,
    ``,
    `📌 Comandos disponibles:`,
    ``,
    `  • Entrada  —  Registrar inicio de turno`,
    `  • Salida   —  Finalizar turno y ver resumen`,
    `  • Quincena —  Ver resumen del periodo actual`,
    ``,
    `💡 Los botones están siempre visibles. ¡Solo presiona "Entrada" para empezar!`,
  ].join('\n');
}

export function errorMessage(msg: string): string {
  return `❌ ${msg}`;
}
