import type { BotContext } from '../client';
import { nowInColombia, toISOLocal, formatDate } from '../../utils/date';
import { salidaResponse } from '../../utils/messages';
import { users, shifts, config as configTable } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { mainKeyboard } from '../keyboards';
import { calculateShift } from '../../services/calculator';
import { calculatePayment } from '../../services/payment';

export function registerSalidaHandler(bot: any) {
  bot.hears('salida', async (ctx: BotContext) => {
    const telegramId = String(ctx.from!.id);

    const user = await ctx.db.select().from(users).where(eq(users.telegramId, telegramId)).get();

    if (!user) {
      await ctx.reply('❌ No tienes turnos registrados. Envía "entrada" para comenzar.', { reply_markup: mainKeyboard });
      return;
    }

    const activeShift = await ctx.db.select()
      .from(shifts)
      .where(and(eq(shifts.userId, user.id), eq(shifts.status, 'active')))
      .get();

    if (!activeShift) {
      await ctx.reply('❌ No hay un turno activo. Envía "entrada" para comenzar uno.', { reply_markup: mainKeyboard });
      return;
    }

    const endTime = nowInColombia();
    const startTime = new Date(activeShift.startTime + 'Z');
    startTime.setHours(startTime.getHours() - 5);

    const result = calculateShift(startTime, endTime);

    let cfg = await ctx.db.select().from(configTable).where(eq(configTable.userId, user.id)).get();

    if (!cfg) {
      const inserted = await ctx.db.insert(configTable).values({ userId: user.id }).returning().get();
      cfg = inserted;
    }

    const payment = calculatePayment(
      {
        regularMinutes: result.regularMinutes,
        overtimeMinutes: result.overtimeMinutes,
        nightMinutes: result.nightMinutes,
        holidayMinutes: result.holidayMinutes,
        sundayMinutes: result.sundayMinutes,
      },
      {
        hourlyRate: cfg.hourlyRate ?? 7000,
        overtimeRate: cfg.overtimeRate ?? 1.25,
        nightSurcharge: cfg.nightSurcharge ?? 1.35,
        holidaySurcharge: cfg.holidaySurcharge ?? 1.75,
        sundaySurcharge: cfg.sundaySurcharge ?? 1.75,
      }
    );

    await ctx.db.update(shifts)
      .set({
        endTime: toISOLocal(endTime),
        regularHours: Math.round(result.regularMinutes / 60 * 100) / 100,
        overtimeHours: Math.round(result.overtimeMinutes / 60 * 100) / 100,
        nightHours: Math.round(result.nightMinutes / 60 * 100) / 100,
        holidayHours: Math.round(result.holidayMinutes / 60 * 100) / 100,
        sundayHours: Math.round(result.sundayMinutes / 60 * 100) / 100,
        estimatedPayment: Math.round(payment),
        status: 'completed',
      })
      .where(eq(shifts.id, activeShift.id))
      .run();

    await ctx.reply(
      salidaResponse({
        date: formatDate(endTime),
        startTime,
        endTime,
        totalMinutes: result.totalMinutes,
        regularMinutes: result.regularMinutes,
        overtimeMinutes: result.overtimeMinutes,
        nightMinutes: result.nightMinutes,
        holidayMinutes: result.holidayMinutes,
        sundayMinutes: result.sundayMinutes,
        payment,
      }),
      { reply_markup: mainKeyboard }
    );
  });
}
