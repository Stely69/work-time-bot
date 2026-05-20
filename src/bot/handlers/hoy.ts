import type { BotContext } from '#/bot/client';
import { colombiaDateParts, colombiaNowUTC, formatDateColombia, colombiaDayToUTCRange } from '#/utils/date';
import { hoyResponse } from '#/utils/messages';
import { users, shifts } from '#/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export function registerHoyHandler(bot: any) {
  bot.command('hoy', async (ctx: BotContext) => {
    const telegramId = String(ctx.from!.id);

    const user = await ctx.db.select().from(users).where(eq(users.telegramId, telegramId)).get();

    if (!user) {
      await ctx.reply('❌ No hay datos registrados. Envía "entrada" para comenzar.');
      return;
    }

    const today = colombiaNowUTC();
    const { year, month, day } = colombiaDateParts(today);
    const { startUTC, endUTC } = colombiaDayToUTCRange(year, month, day);

    const dayShifts = await ctx.db.select()
      .from(shifts)
      .where(
        and(
          eq(shifts.userId, user.id),
          eq(shifts.status, 'completed'),
          gte(shifts.startTime, startUTC),
          lte(shifts.startTime, endUTC)
        )
      )
      .all();

    if (dayShifts.length === 0) {
      await ctx.reply('📅 Hoy no hay turnos registrados.');
      return;
    }

    let totalRegular = 0;
    let totalNight = 0;
    let totalOvertime = 0;
    let totalNightOvertime = 0;
    let totalHoliday = 0;
    let totalHolidayOvertime = 0;
    let totalHolidayNightOvertime = 0;
    let totalSunday = 0;
    let totalSundayOvertime = 0;
    let totalSundayNightOvertime = 0;
    let totalPayment = 0;
    let totalMinutes = 0;

    for (const s of dayShifts) {
      totalRegular += (s.regularHours ?? 0) * 60;
      totalNight += (s.nightHours ?? 0) * 60;
      totalOvertime += (s.overtimeHours ?? 0) * 60;
      totalNightOvertime += (s.nightOvertimeHours ?? 0) * 60;
      totalHoliday += (s.holidayHours ?? 0) * 60;
      totalHolidayOvertime += (s.holidayOvertimeHours ?? 0) * 60;
      totalHolidayNightOvertime += (s.holidayNightOvertimeHours ?? 0) * 60;
      totalSunday += (s.sundayHours ?? 0) * 60;
      totalSundayOvertime += (s.sundayOvertimeHours ?? 0) * 60;
      totalSundayNightOvertime += (s.sundayNightOvertimeHours ?? 0) * 60;
      totalPayment += (s.estimatedPayment ?? 0);
      totalMinutes += (
        (s.regularHours ?? 0) + (s.nightHours ?? 0) + (s.overtimeHours ?? 0) +
        (s.nightOvertimeHours ?? 0) + (s.holidayHours ?? 0) +
        (s.holidayOvertimeHours ?? 0) + (s.holidayNightOvertimeHours ?? 0) +
        (s.sundayHours ?? 0) + (s.sundayOvertimeHours ?? 0) +
        (s.sundayNightOvertimeHours ?? 0)
      ) * 60;
    }

    await ctx.reply(
      hoyResponse({
        date: formatDateColombia(today),
        startTime: today,
        endTime: today,
        totalMinutes: Math.round(totalMinutes),
        regularMinutes: Math.round(totalRegular),
        nightMinutes: Math.round(totalNight),
        overtimeMinutes: Math.round(totalOvertime),
        nightOvertimeMinutes: Math.round(totalNightOvertime),
        holidayMinutes: Math.round(totalHoliday),
        holidayOvertimeMinutes: Math.round(totalHolidayOvertime),
        holidayNightOvertimeMinutes: Math.round(totalHolidayNightOvertime),
        sundayMinutes: Math.round(totalSunday),
        sundayOvertimeMinutes: Math.round(totalSundayOvertime),
        sundayNightOvertimeMinutes: Math.round(totalSundayNightOvertime),
        payment: Math.round(totalPayment),
      })
    );
  });
}
