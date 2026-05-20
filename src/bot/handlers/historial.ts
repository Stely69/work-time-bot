import type { BotContext } from '#/bot/client';
import { users, shifts } from '#/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { historialResponse } from '#/utils/messages';

export function registerHistorialHandler(bot: any) {
  bot.command('historial', async (ctx: BotContext) => {
    const telegramId = String(ctx.from!.id);

    const user = await ctx.db.select().from(users).where(eq(users.telegramId, telegramId)).get();

    if (!user) {
      await ctx.reply('❌ No hay datos registrados. Envía "entrada" para comenzar.');
      return;
    }

    const recentShifts = await ctx.db.select()
      .from(shifts)
      .where(and(eq(shifts.userId, user.id), eq(shifts.status, 'completed')))
      .orderBy(desc(shifts.startTime))
      .limit(10)
      .all();

    const formatted = recentShifts.map((s) => {
      const datePart = s.startTime.slice(0, 10);
      const parts = datePart.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dateStr = `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]}`;

      const start = s.startTime.slice(11, 16);
      const end = s.endTime ? s.endTime.slice(11, 16) : '—';

      const totalH = (
        (s.regularHours ?? 0) + (s.nightHours ?? 0) +
        (s.overtimeHours ?? 0) + (s.nightOvertimeHours ?? 0) +
        (s.holidayHours ?? 0) + (s.holidayOvertimeHours ?? 0) +
        (s.holidayNightOvertimeHours ?? 0) +
        (s.sundayHours ?? 0) + (s.sundayOvertimeHours ?? 0) +
        (s.sundayNightOvertimeHours ?? 0)
      );
      const totalMin = Math.round(totalH * 60);

      return {
        date: dateStr,
        start,
        end,
        total: totalMin,
        payment: s.estimatedPayment ?? 0,
      };
    });

    await ctx.reply(historialResponse(formatted));
  });
}
