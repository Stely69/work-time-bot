import { Bot } from 'grammy';
import type { BotContext } from '#/bot/types';
import { colombiaNowUTC, formatDateColombia } from '#/utils/date';
import { salidaResponse } from '#/utils/messages';
import { users, shifts, config as configTable } from '#/db/schema';
import { eq, and } from 'drizzle-orm';
import { mainKeyboard } from '#/bot/keyboards';
import { calculateShift } from '#/services/calculator';
import { calculatePayment } from '#/services/payment';

export function registerSalidaHandler(bot: Bot<BotContext>) {
  bot.hears(/^(salida)$/i, async (ctx) => {
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

    const endTime = colombiaNowUTC();
    const startTime = new Date(activeShift.startTime);

    const result = calculateShift(startTime, endTime);

    let cfg = await ctx.db.select().from(configTable).where(eq(configTable.userId, user.id)).get();

    if (!cfg) {
      const inserted = await ctx.db.insert(configTable).values({ userId: user.id }).returning().get();
      cfg = inserted;
    }

    const payment = calculatePayment(result, {
        hourlyRate: cfg.hourlyRate ?? 8000,
        overtimeRate: cfg.overtimeRate ?? 1.25,
        nightSurcharge: cfg.nightSurcharge ?? 1.35,
        nightOvertimeRate: cfg.nightOvertimeRate ?? 1.75,
        holidaySurcharge: cfg.holidaySurcharge ?? 1.80,
        holidayOvertimeRate: cfg.holidayOvertimeRate ?? 2.05,
        holidayNightOvertimeRate: cfg.holidayNightOvertimeRate ?? 2.55,
        sundaySurcharge: cfg.sundaySurcharge ?? 1.80,
        sundayOvertimeRate: cfg.sundayOvertimeRate ?? 2.05,
        sundayNightOvertimeRate: cfg.sundayNightOvertimeRate ?? 2.55,
      }
    );

    await ctx.db.update(shifts)
      .set({
        endTime: endTime.toISOString(),
        regularHours: Math.round(result.regularMinutes / 60 * 100) / 100,
        overtimeHours: Math.round(result.overtimeMinutes / 60 * 100) / 100,
        nightHours: Math.round(result.nightMinutes / 60 * 100) / 100,
        nightOvertimeHours: Math.round(result.nightOvertimeMinutes / 60 * 100) / 100,
        holidayHours: Math.round(result.holidayMinutes / 60 * 100) / 100,
        holidayOvertimeHours: Math.round(result.holidayOvertimeMinutes / 60 * 100) / 100,
        holidayNightOvertimeHours: Math.round(result.holidayNightOvertimeMinutes / 60 * 100) / 100,
        sundayHours: Math.round(result.sundayMinutes / 60 * 100) / 100,
        sundayOvertimeHours: Math.round(result.sundayOvertimeMinutes / 60 * 100) / 100,
        sundayNightOvertimeHours: Math.round(result.sundayNightOvertimeMinutes / 60 * 100) / 100,
        estimatedPayment: Math.round(payment),
        status: 'completed',
      })
      .where(eq(shifts.id, activeShift.id))
      .run();

    await ctx.reply(
      salidaResponse({
        date: formatDateColombia(endTime),
        startTime,
        endTime,
        totalMinutes: result.totalMinutes,
        regularMinutes: result.regularMinutes,
        nightMinutes: result.nightMinutes,
        overtimeMinutes: result.overtimeMinutes,
        nightOvertimeMinutes: result.nightOvertimeMinutes,
        holidayMinutes: result.holidayMinutes,
        holidayOvertimeMinutes: result.holidayOvertimeMinutes,
        holidayNightOvertimeMinutes: result.holidayNightOvertimeMinutes,
        sundayMinutes: result.sundayMinutes,
        sundayOvertimeMinutes: result.sundayOvertimeMinutes,
        sundayNightOvertimeMinutes: result.sundayNightOvertimeMinutes,
        payment,
      }),
      { reply_markup: mainKeyboard }
    );
  });
}
