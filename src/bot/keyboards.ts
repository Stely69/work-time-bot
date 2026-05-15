import { Keyboard } from 'grammy';

export const mainKeyboard = new Keyboard()
  .text('Entrada')
  .text('Salida')
  .row()
  .text('Quincena')
  .resized()
  .persistent();
