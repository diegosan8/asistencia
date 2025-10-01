
import type { DayOfWeekIndex } from './types';

export const DAYS_OF_WEEK_CONFIG: { index: DayOfWeekIndex; name: string; short: string }[] = [
  { index: 1, name: 'Lunes', short: 'L' },
  { index: 2, name: 'Martes', short: 'M' },
  { index: 3, name: 'Miércoles', short: 'X' },
  { index: 4, name: 'Jueves', short: 'J' },
  { index: 5, name: 'Viernes', short: 'V' },
  { index: 6, name: 'Sábado', short: 'S' },
  { index: 0, name: 'Domingo', short: 'D' },
];

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
