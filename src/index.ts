import { Hono } from 'hono';
import { Bot } from 'grammy';
import type { Update } from 'grammy/types';
import type { BotContext } from '#/bot/types';
import type { DbInstance } from '#/db';
import { createDb } from '#/db';
import { registerEntradaHandler } from '#/bot/handlers/entrada';
import { registerSalidaHandler } from '#/bot/handlers/salida';
import { registerHoyHandler } from '#/bot/handlers/hoy';
import { registerQuincenaHandler } from '#/bot/handlers/quincena';
import { registerHistorialHandler } from '#/bot/handlers/historial';
import { registerTarifaHandler } from '#/bot/handlers/tarifa';

export type Env = {
  DB: D1Database;
  BOT_TOKEN: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('WorkTime Bot is running!'));

function setupBot(token: string, db: DbInstance) {
  const bot = new Bot<BotContext>(token);

  bot.use(async (ctx, next) => {
    ctx.db = db;
    await next();
  });

  bot.catch((err) => {
    console.error('Bot error:', err.message, err.error);
  });

  registerEntradaHandler(bot);
  registerSalidaHandler(bot);
  registerHoyHandler(bot);
  registerQuincenaHandler(bot);
  registerHistorialHandler(bot);
  registerTarifaHandler(bot);

  return bot;
}

let botInstance: Bot<BotContext> | null = null;
let botInit: Promise<void> | null = null;

app.post('/webhook', async (c) => {
  try {
    const db = createDb(c.env.DB);

    if (!botInstance) {
      botInstance = setupBot(c.env.BOT_TOKEN, db);
      botInit = botInstance.init();
    }

    const update: Update = await c.req.json();
    console.log('Update received:', JSON.stringify({ update_id: update.update_id, text: (update.message as any)?.text }));

    await botInit;
    await botInstance.handleUpdate(update);

    return c.text('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    return c.text('Error', 500);
  }
});

export default app;
