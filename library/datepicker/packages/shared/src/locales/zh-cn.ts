/**
 * 简体中文语言包
 */

import type { Locale } from '../types';

export const zhCN: Locale = {
  name: 'zh-cn',
  weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysMin: ['日', '一', '二', '三', '四', '五', '六'],
  months: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
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
  firstDayOfWeek: 1,
  formats: {
    date: 'YYYY-MM-DD',
    datetime: 'YYYY-MM-DD HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'YYYY-MM',
    year: 'YYYY',
    quarter: 'YYYY-[Q]Q',
  },
  meridiem: {
    am: '上午',
    pm: '下午',
  },
};





