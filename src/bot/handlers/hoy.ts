import type { BotContext } from '../client';
import { nowInColombia, formatDate, toISOLocal } from '../../utils/date';
import { hoyResponse } from '../../utils/messages';
import { users, shifts, config as configTable } from '../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { calculateShift } from '../../services/calculator';
import { calculatePayment } from '../../services/payment';

export function registerHoyHandler(bot: any) {
  bot.command('hoy', async (ctx: BotContext) => {
    const telegramId = String(ctx.from!.id);

    const user = await ctx.db.select().from(users).where(eq(users.telegramId, telegramId)).get();

    if (!user) {
      await ctx.reply('❌ No hay datos registrados. Envía "entrada" para comenzar.');
      return;
    }

    const today = nowInColombia();
    const todayStr = toISOLocal(today).slice(0, 10);

    const dayShifts = await ctx.db.select()
      .from(shifts)
      .where(
        and(
          eq(shifts.userId, user.id),
          eq(shifts.status, 'completed'),
          gte(shifts.startTime, todayStr + 'T00:00:00'),
          lte(shifts.startTime, todayStr + 'T23:59:59')
        )
      )
      .all();

    if (dayShifts.length === 0) {
      await ctx.reply('📅 Hoy no hay turnos registrados.');
      return;
    }

    let totalRegular = 0;
    let totalOvertime = 0;
    let totalNight = 0;
    let totalHoliday = 0;
    let totalSunday = 0;
    let totalPayment = 0;
    let totalMinutes = 0;

    for (const s of dayShifts) {
      totalRegular += (s.regularHours ?? 0) * 60;
      totalOvertime += (s.overtimeHours ?? 0) * 60;
      totalNight += (s.nightHours ?? 0) * 60;
      totalHoliday += (s.holidayHours ?? 0) * 60;
      totalSunday += (s.sundayHours ?? 0) * 60;
      totalPayment += (s.estimatedPayment ?? 0);
      totalMinutes += ((s.regularHours ?? 0) + (s.overtimeHours ?? 0) + (s.nightHours ?? 0) + (s.holidayHours ?? 0) + (s.sundayHours ?? 0)) * 60;
    }

    await ctx.reply(
      hoyResponse({
        date: formatDate(today),
        startTime: today,
        endTime: today,
        totalMinutes,
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
