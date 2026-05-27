import { Bot } from 'grammy';
import type { BotContext } from '#/bot/types';
import { colombiaNowUTC } from '#/utils/date';
import { entradaResponse } from '#/utils/messages';
import { users, shifts } from '#/db/schema';
import { eq, and } from 'drizzle-orm';
import { mainKeyboard } from '#/bot/keyboards';

export function registerEntradaHandler(bot: Bot<BotContext>) {
  bot.hears(/^(entrada)$/i, async (ctx) => {
    const telegramId = String(ctx.from!.id);
    const now = colombiaNowUTC();

    let user = await ctx.db.select().from(users).where(eq(users.telegramId, telegramId)).get();

    if (!user) {
      const result = await ctx.db.insert(users).values({
        telegramId,
        name: ctx.from!.first_name,
      }).returning().get();
      user = result;
    }

    const activeShift = await ctx.db.select()
      .from(shifts)
      .where(and(eq(shifts.userId, user.id), eq(shifts.status, 'active')))
      .get();

    if (activeShift) {
      await ctx.reply('❌ Ya tienes un turno activo. Envía "salida" para finalizarlo.', { reply_markup: mainKeyboard });
      return;
    }

    await ctx.db.insert(shifts).values({
      userId: user.id,
      startTime: now.toISOString(),
      status: 'active',
    }).run();

    await ctx.reply(entradaResponse(now), { reply_markup: mainKeyboard });
  });
}
