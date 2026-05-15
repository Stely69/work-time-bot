import { Hono } from 'hono';
import { webhookCallback } from 'grammy';
import { createBot } from '#/bot/client';
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

function setupBot(token: string, db: ReturnType<typeof createDb>) {
  const bot = createBot(token, db);

  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  registerEntradaHandler(bot);
  registerSalidaHandler(bot);
  registerHoyHandler(bot);
  registerQuincenaHandler(bot);
  registerHistorialHandler(bot);
  registerTarifaHandler(bot);

  return bot;
}

app.post('/webhook', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const bot = setupBot(c.env.BOT_TOKEN, db);
    return await webhookCallback(bot, 'hono')(c);
  } catch (err) {
    console.error('Webhook error:', err);
    return c.text('Error', 500);
  }
});

export default app;
