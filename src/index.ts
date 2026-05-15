import { Hono } from 'hono';
import { webhookCallback } from 'grammy';
import { createBot } from './bot/client';
import { createDb } from './db';
import { registerEntradaHandler } from './bot/handlers/entrada';
import { registerSalidaHandler } from './bot/handlers/salida';
import { registerHoyHandler } from './bot/handlers/hoy';
import { registerQuincenaHandler } from './bot/handlers/quincena';
import { registerHistorialHandler } from './bot/handlers/historial';
import { registerTarifaHandler } from './bot/handlers/tarifa';

export type Env = {
  DB: D1Database;
  BOT_TOKEN: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('WorkTime Bot is running!'));

app.post('/webhook', async (c) => {
  const db = createDb(c.env.DB);
  const bot = createBot(c.env.BOT_TOKEN, db);

  registerEntradaHandler(bot);
  registerSalidaHandler(bot);
  registerHoyHandler(bot);
  registerQuincenaHandler(bot);
  registerHistorialHandler(bot);
  registerTarifaHandler(bot);

  return webhookCallback(bot, 'hono')(c);
});

export default app;
