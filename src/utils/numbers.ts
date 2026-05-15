export function formatCOP(amount: number): string {
  return '$' + Math.round(amount).toLocaleString('es-CO') + ' COP';
}
