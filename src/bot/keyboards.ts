import { Keyboard } from 'grammy';

export const mainKeyboard = new Keyboard()
  .text('entrada')
  .text('salida')
  .resized()
  .persistent();
