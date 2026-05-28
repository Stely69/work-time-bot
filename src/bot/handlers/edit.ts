import { Bot, InlineKeyboard } from 'grammy';
import type { BotContext } from '#/bot/types';
import { eq } from 'drizzle-orm';
import { shifts, users, config as configTable } from '#/db/schema';
import { colombiaTimeToUTC, formatDateColombia } from '#/utils/date';
import { calculateShift } from '#/services/calculator';
import { calculatePayment } from '#/services/payment';
import { salidaResponse, entradaResponse } from '#/utils/messages';
import { mainKeyboard } from '#/bot/keyboards';

interface PendingEdit {
  shiftId: number;
  type: 'entrada' | 'salida';
  chatId: number;
  messageId: number;
}

const pendingEdits = new Map<string, PendingEdit>();

const TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/;

function parseTime12h(text: string): { hours: number; minutes: number } | null {
  const match = text.trim().match(TIME_PATTERN);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3].toUpperCase();

  if (hours < 1 || hours > 12) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (meridian === 'PM' && hours !== 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function roundHours(minutes: number): number {
  return Math.round(minutes / 60 * 100) / 100;
}

async function recalculateShift(
  db: BotContext['db'],
  shiftId: number,
  startTime: Date,
  endTime: Date,
  telegramId: string,
) {
  const result = calculateShift(startTime, endTime);

  const user = await db.select().from(users).where(eq(users.telegramId, telegramId)).get();
  if (!user) throw new Error('User not found');

  let cfg = await db.select().from(configTable).where(eq(configTable.userId, user.id)).get();
  if (!cfg) {
    const inserted = await db.insert(configTable).values({ userId: user.id }).returning().get();
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
  });

  await db.update(shifts)
    .set({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      regularHours: roundHours(result.regularMinutes),
      overtimeHours: roundHours(result.overtimeMinutes),
      nightHours: roundHours(result.nightMinutes),
      nightOvertimeHours: roundHours(result.nightOvertimeMinutes),
      holidayHours: roundHours(result.holidayMinutes),
      holidayOvertimeHours: roundHours(result.holidayOvertimeMinutes),
      holidayNightOvertimeHours: roundHours(result.holidayNightOvertimeMinutes),
      sundayHours: roundHours(result.sundayMinutes),
      sundayOvertimeHours: roundHours(result.sundayOvertimeMinutes),
      sundayNightOvertimeHours: roundHours(result.sundayNightOvertimeMinutes),
      estimatedPayment: Math.round(payment),
    })
    .where(eq(shifts.id, shiftId))
    .run();

  return { result, payment };
}

export function registerEditHandler(bot: Bot<BotContext>) {
  bot.on('message:text', async (ctx, next) => {
    const telegramId = String(ctx.from!.id);
    const pending = pendingEdits.get(telegramId);

    if (!pending) return next();

    const parsed = parseTime12h(ctx.message.text);
    if (!parsed) {
      await ctx.reply(
        '❌ Formato inválido. Usa HH:MM AM/PM (ej: 7:45 AM o 2:30 PM)',
        { reply_markup: mainKeyboard },
      );
      return;
    }

    try {
      const shift = await ctx.db.select().from(shifts).where(eq(shifts.id, pending.shiftId)).get();

      if (!shift) {
        pendingEdits.delete(telegramId);
        await ctx.reply('❌ Turno no encontrado.', { reply_markup: mainKeyboard });
        return;
      }

      const existingStart = new Date(shift.startTime);

      if (pending.type === 'entrada') {
        const newStart = colombiaTimeToUTC(existingStart, parsed.hours, parsed.minutes);

        if (shift.status === 'active') {
          await ctx.db.update(shifts)
            .set({ startTime: newStart.toISOString() })
            .where(eq(shifts.id, pending.shiftId))
            .run();

          await ctx.api.editMessageText(
            pending.chatId,
            pending.messageId,
            entradaResponse(newStart),
            { reply_markup: editEntradaKeyboard(pending.shiftId) },
          );
        } else {
          const endTime = new Date(shift.endTime!);
          const { result, payment } = await recalculateShift(
            ctx.db, pending.shiftId, newStart, endTime, telegramId,
          );

          await ctx.api.editMessageText(
            pending.chatId,
            pending.messageId,
            salidaResponse({
              date: formatDateColombia(endTime),
              startTime: newStart,
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
            { reply_markup: editSalidaKeyboard(pending.shiftId) },
          );
        }
      } else {
        if (shift.status === 'active') {
          pendingEdits.delete(telegramId);
          await ctx.reply('❌ El turno aún está activo. Finalízalo con "salida" primero.', { reply_markup: mainKeyboard });
          return;
        }

        const existingEnd = new Date(shift.endTime!);
        const newEnd = colombiaTimeToUTC(existingEnd, parsed.hours, parsed.minutes);
        const { result, payment } = await recalculateShift(
          ctx.db, pending.shiftId, existingStart, newEnd, telegramId,
        );

        await ctx.api.editMessageText(
          pending.chatId,
          pending.messageId,
          salidaResponse({
            date: formatDateColombia(newEnd),
            startTime: existingStart,
            endTime: newEnd,
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
          { reply_markup: editSalidaKeyboard(pending.shiftId) },
        );
      }

      pendingEdits.delete(telegramId);
      await ctx.reply('✅ Hora actualizada', { reply_markup: mainKeyboard });
    } catch (err) {
      pendingEdits.delete(telegramId);
      console.error('Edit error:', err);
      await ctx.reply('❌ Error al actualizar la hora.', { reply_markup: mainKeyboard });
    }
  });

  bot.callbackQuery(/^edit_(entrada|salida):(\d+)$/, async (ctx) => {
    const match = ctx.callbackQuery.data.match(/^edit_(entrada|salida):(\d+)$/)!;
    const type = match[1] as 'entrada' | 'salida';
    const shiftId = parseInt(match[2], 10);
    const telegramId = String(ctx.from!.id);

    if (!ctx.callbackQuery.message) {
      await ctx.answerCallbackQuery({ text: 'Error: mensaje no encontrado' });
      return;
    }

    await ctx.answerCallbackQuery({
      text: '✏️ Envía la hora corregida en formato HH:MM AM/PM (ej: 7:45 AM)',
    });

    pendingEdits.set(telegramId, {
      shiftId,
      type,
      chatId: ctx.callbackQuery.message.chat.id,
      messageId: ctx.callbackQuery.message.message_id,
    });
  });
}

export function editEntradaKeyboard(shiftId: number): InlineKeyboard {
  return new InlineKeyboard().text('✏️ Editar hora de entrada', `edit_entrada:${shiftId}`);
}

export function editSalidaKeyboard(shiftId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('✏️ Editar entrada', `edit_entrada:${shiftId}`)
    .text('✏️ Editar salida', `edit_salida:${shiftId}`);
}
