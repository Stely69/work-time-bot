import type { BotContext } from '#/bot/client';
import { colombiaDayToUTCRange, colombiaNowUTC } from '#/utils/date';
import { quincenaResponse } from '#/utils/messages';
import { users, shifts } from '#/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getCurrentPeriod } from '#/services/periods';

export function registerQuincenaHandler(bot: any) {
  bot.hears(/^(quincena)$/i, async (ctx: BotContext) => {
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

    let totalRegular = 0;
    let totalOvertime = 0;
    let totalNight = 0;
    let totalHoliday = 0;
    let totalSunday = 0;
    let totalPayment = 0;

    for (const s of periodShifts) {
      totalRegular += (s.regularHours ?? 0) * 60;
      totalOvertime += (s.overtimeHours ?? 0) * 60;
      totalNight += (s.nightHours ?? 0) * 60;
      totalHoliday += (s.holidayHours ?? 0) * 60;
      totalSunday += (s.sundayHours ?? 0) * 60;
      totalPayment += (s.estimatedPayment ?? 0);
    }

    await ctx.reply(
      quincenaResponse({
        periodLabel: period.label,
        regularMinutes: Math.round(totalRegular),
        overtimeMinutes: Math.round(totalOvertime),
        nightMinutes: Math.round(totalNight),
        holidayMinutes: Math.round(totalHoliday),
        sundayMinutes: Math.round(totalSunday),
        payment: Math.round(totalPayment),
      })
    );
  });
}
