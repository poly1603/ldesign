/**
 * 日本語ロケール
 */

import type { Locale } from '../types';

export const jaJP: Locale = {
  name: 'ja-jp',
  weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  weekdaysShort: ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'],
  weekdaysMin: ['日', '月', '火', '水', '木', '金', '土'],
  months: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthsShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  firstDayOfWeek: 0,
  formats: {
    date: 'YYYY年MM月DD日',
    datetime: 'YYYY年MM月DD日 HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'YYYY年MM月',
    year: 'YYYY年',
    quarter: 'YYYY年[第]Q[四半期]',
  },
  meridiem: {
    am: '午前',
    pm: '午後',
  },
};





