/**
 * Français (France)
 */

import type { Locale } from '../types';

export const frFR: Locale = {
  name: 'fr-fr',
  weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  weekdaysShort: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
  weekdaysMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
  months: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
  monthsShort: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],
  firstDayOfWeek: 1,
  formats: {
    date: 'DD/MM/YYYY',
    datetime: 'DD/MM/YYYY HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'MM/YYYY',
    year: 'YYYY',
    quarter: '[T]Q YYYY',
  },
  meridiem: {
    am: 'AM',
    pm: 'PM',
  },
};





