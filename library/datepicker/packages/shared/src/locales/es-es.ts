/**
 * Español (España)
 */

import type { Locale } from '../types';

export const esES: Locale = {
  name: 'es-es',
  weekdays: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  weekdaysShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  weekdaysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
  months: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  firstDayOfWeek: 1,
  formats: {
    date: 'DD/MM/YYYY',
    datetime: 'DD/MM/YYYY HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'MM/YYYY',
    year: 'YYYY',
    quarter: '[Q]Q YYYY',
  },
  meridiem: {
    am: 'a.m.',
    pm: 'p.m.',
  },
};





