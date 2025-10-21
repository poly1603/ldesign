/**
 * Deutsch (Deutschland)
 */

import type { Locale } from '../types';

export const deDE: Locale = {
  name: 'de-de',
  weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  months: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  firstDayOfWeek: 1,
  formats: {
    date: 'DD.MM.YYYY',
    datetime: 'DD.MM.YYYY HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'MM.YYYY',
    year: 'YYYY',
    quarter: '[Q]Q YYYY',
  },
  meridiem: {
    am: 'AM',
    pm: 'PM',
  },
};





