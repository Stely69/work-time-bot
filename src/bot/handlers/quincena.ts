import { Bot } from 'grammy';
import type { BotContext } from '#/bot/types';
import { colombiaDayToUTCRange } from '#/utils/date';
import { quincenaResponse } from '#/utils/messages';
import { users, shifts } from '#/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getCurrentPeriod } from '#/services/periods';
import { aggregateShifts } from '#/services/aggregator';

export function registerQuincenaHandler(bot: Bot<BotContext>) {
  bot.hears(/^(quincena)$/i, async (ctx) => {
    const telegramId = String(ctx.from!.id);

    const user = await ctx.db.select().from(users).where(eq(users.telegramId, telegramId)).get();

    if (!user) {
      await ctx.reply('❌ No hay datos registrados. Envía "entrada" para comenzar.');
      return;
    }

    const period = getCurrentPeriod();
    const { startUTC } = colombiaDayToUTCRange(
      period.startColombia.year, period.startColombia.month, period.startColombia.day
    );
    const { endUTC } = colombiaDayToUTCRange(
      period.endColombia.year, period.endColombia.month, period.endColombia.day
    );

    const periodShifts = await ctx.db.select()
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

    const a = aggregateShifts(periodShifts);

    await ctx.reply(
      quincenaResponse({
        periodLabel: period.label,
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
