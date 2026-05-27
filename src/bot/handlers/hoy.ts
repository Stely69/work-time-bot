import { Bot } from 'grammy';
import type { BotContext } from '#/bot/types';
import { colombiaDateParts, colombiaNowUTC, formatDateColombia, colombiaDayToUTCRange } from '#/utils/date';
import { hoyResponse } from '#/utils/messages';
import { users, shifts } from '#/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { aggregateShifts } from '#/services/aggregator';

export function registerHoyHandler(bot: Bot<BotContext>) {
  bot.command('hoy', async (ctx) => {
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

    const a = aggregateShifts(dayShifts);

    await ctx.reply(
      hoyResponse({
        date: formatDateColombia(today),
        startTime: today,
        endTime: today,
        totalMinutes: Math.round(a.totalMinutes),
        regularMinutes: Math.round(a.regularMinutes),
        nightMinutes: Math.round(a.nightMinutes),
        overtimeMinutes: Math.round(a.overtimeMinutes),
        nightOvertimeMinutes: Math.round(a.nightOvertimeMinutes),
        holidayMinutes: Math.round(a.holidayMinutes),
        holidayOvertimeMinutes: Math.round(a.holidayOvertimeMinutes),
        holidayNightOvertimeMinutes: Math.round(a.holidayNightOvertimeMinutes),
        sundayMinutes: Math.round(a.sundayMinutes),
        sundayOvertimeMinutes: Math.round(a.sundayOvertimeMinutes),
        sundayNightOvertimeMinutes: Math.round(a.sundayNightOvertimeMinutes),
        payment: Math.round(a.payment),
      })
    );
  });
}
