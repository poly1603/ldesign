/**
 * 预设快捷选项
 */

import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from '../utils/date';

/**
 * 创建快捷选项
 */
export function createShortcuts() {
  const now = new Date();

  return {
    // 今天
    today: {
      text: '今天',
      value: () => now,
    },

    // 昨天
    yesterday: {
      text: '昨天',
      value: () => addDays(now, -1),
    },

    // 明天
    tomorrow: {
      text: '明天',
      value: () => addDays(now, 1),
    },

    // 本周
    thisWeek: {
      text: '本周',
      value: () => [startOfWeek(now, 1), endOfWeek(now, 1)] as [Date, Date],
    },

    // 上周
    lastWeek: {
      text: '上周',
      value: () => {
        const lastWeekStart = addDays(startOfWeek(now, 1), -7);
        const lastWeekEnd = addDays(endOfWeek(now, 1), -7);
        return [lastWeekStart, lastWeekEnd] as [Date, Date];
      },
    },

    // 最近一周
    last7Days: {
      text: '最近一周',
      value: () => [addDays(now, -7), now] as [Date, Date],
    },

    // 最近两周
    last14Days: {
      text: '最近两周',
      value: () => [addDays(now, -14), now] as [Date, Date],
    },

    // 最近一月
    last30Days: {
      text: '最近一月',
      value: () => [addDays(now, -30), now] as [Date, Date],
    },

    // 本月
    thisMonth: {
      text: '本月',
      value: () => [startOfMonth(now), endOfMonth(now)] as [Date, Date],
    },

    // 上月
    lastMonth: {
      text: '上月',
      value: () => {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return [startOfMonth(lastMonthDate), endOfMonth(lastMonthDate)] as [Date, Date];
      },
    },

    // 最近三月
    last90Days: {
      text: '最近三月',
      value: () => [addDays(now, -90), now] as [Date, Date],
    },

    // 本季度
    thisQuarter: {
      text: '本季度',
      value: () => [startOfQuarter(now), endOfQuarter(now)] as [Date, Date],
    },

    // 本年
    thisYear: {
      text: '本年',
      value: () => [startOfYear(now), endOfYear(now)] as [Date, Date],
    },

    // 去年
    lastYear: {
      text: '去年',
      value: () => {
        const lastYearDate = new Date(now.getFullYear() - 1, 0, 1);
        return [startOfYear(lastYearDate), endOfYear(lastYearDate)] as [Date, Date];
      },
    },
  };
}




