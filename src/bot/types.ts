import { Context } from 'grammy';
import type { DbInstance } from '#/db';

export interface BotContext extends Context {
  db: DbInstance;
}
