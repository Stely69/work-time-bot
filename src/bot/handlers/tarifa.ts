import type { BotContext } from '#/bot/client';
import { users, config as configTable } from '#/db/schema';
import { eq } from 'drizzle-orm';
import { tarifaResponse, errorMessage } from '#/utils/messages';

export function registerTarifaHandler(bot: any) {
  bot.command('tarifa', async (ctx: BotContext) => {
    const telegramId = String(ctx.from!.id);
    const text = ctx.message?.text ?? '';
    const parts = text.split(' ');

    if (parts.length < 2) {
      await ctx.reply(errorMessage('Debes escribir: /tarifa <valor>\nEjemplo: /tarifa 7000'));
      return;
    }

    const rate = parseInt(parts[1], 10);
    if (isNaN(rate) || rate <= 0) {
      await ctx.reply(errorMessage('El valor debe ser un número válido mayor a 0.'));
      return;
    }

    const user = await ctx.db.select().from(users).where(eq(users.telegramId, telegramId)).get();

    if (!user) {
      const result = await ctx.db.insert(users).values({
        telegramId,
        name: ctx.from!.first_name,
      }).returning().get();

      await ctx.db.insert(configTable).values({ userId: result.id, hourlyRate: rate }).run();
    } else {
      const existing = await ctx.db.select().from(configTable).where(eq(configTable.userId, user.id)).get();

      if (existing) {
        await ctx.db.update(configTable)
          .set({ hourlyRate: rate })
          .where(eq(configTable.userId, user.id))
          .run();
      } else {
        await ctx.db.insert(configTable).values({ userId: user.id, hourlyRate: rate }).run();
      }
    }

    await ctx.reply(tarifaResponse(rate));
  });
}
