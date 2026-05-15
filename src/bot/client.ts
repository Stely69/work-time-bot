import { Bot, Context } from 'grammy';
import type { DbInstance } from '../db';

export interface BotContext extends Context {
  db: DbInstance;
}

export function createBot(token: string, db: DbInstance): Bot<BotContext> {
  const bot = new Bot<BotContext>(token);

  bot.use(async (ctx, next) => {
    ctx.db = db;
    await next();
  });

  return bot;
}
