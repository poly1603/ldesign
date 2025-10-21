/**
 * English (US) locale
 */

import type { Locale } from '../types';

export const enUS: Locale = {
  name: 'en-us',
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  firstDayOfWeek: 0,
  formats: {
    date: 'MM/DD/YYYY',
    datetime: 'MM/DD/YYYY hh:mm:ss A',
    time: 'hh:mm:ss A',
    month: 'MM/YYYY',
    year: 'YYYY',
    quarter: '[Q]Q YYYY',
  },
  meridiem: {
    am: 'AM',
    pm: 'PM',
  },
  ordinal: (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0] || 'th');
  },
};



