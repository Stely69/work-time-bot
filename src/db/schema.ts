import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  telegramId: text('telegram_id').unique().notNull(),
  name: text('name'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const shifts = sqliteTable('shifts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  regularHours: real('regular_hours').default(0),
  overtimeHours: real('overtime_hours').default(0),
  nightHours: real('night_hours').default(0),
  nightOvertimeHours: real('night_overtime_hours').default(0),
  holidayHours: real('holiday_hours').default(0),
  sundayHours: real('sunday_hours').default(0),
  estimatedPayment: real('estimated_payment').default(0),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const config = sqliteTable('config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  hourlyRate: real('hourly_rate').default(8000),
  overtimeRate: real('overtime_rate').default(1.25),
  nightSurcharge: real('night_surcharge').default(1.35),
  nightOvertimeRate: real('night_overtime_rate').default(1.75),
  holidaySurcharge: real('holiday_surcharge').default(1.75),
  sundaySurcharge: real('sunday_surcharge').default(1.75),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const migrations = sqliteTable('__drizzle_migrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hash: text('hash').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});
