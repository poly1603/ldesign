/**
 * DateUtils 工具类测试
 */

import { describe, it, expect } from 'vitest';
import { DateUtils } from '../../src/utils/DateUtils';

describe('DateUtils', () => {
  describe('format', () => {
    it('应该正确格式化日期', () => {
      const date = new Date(2023, 11, 25); // 2023-12-25
      expect(DateUtils.format(date, 'YYYY-MM-DD')).toBe('2023-12-25');
      expect(DateUtils.format(date, 'YYYY/MM/DD')).toBe('2023/12/25');
      expect(DateUtils.format(date, 'MM-DD-YYYY')).toBe('12-25-2023');
    });

    it('应该处理字符串日期', () => {
      expect(DateUtils.format('2023-12-25', 'YYYY-MM-DD')).toBe('2023-12-25');
    });

    it('应该处理时间戳', () => {
      const timestamp = new Date(2023, 11, 25).getTime();
      expect(DateUtils.format(timestamp, 'YYYY-MM-DD')).toBe('2023-12-25');
    });

    it('应该处理无效日期', () => {
      expect(DateUtils.format(null, 'YYYY-MM-DD')).toBe('');
      expect(DateUtils.format(undefined, 'YYYY-MM-DD')).toBe('');
      expect(DateUtils.format('invalid', 'YYYY-MM-DD')).toBe('');
    });
  });

  describe('parse', () => {
    it('应该正确解析日期字符串', () => {
      const result = DateUtils.parse('2023-12-25', 'YYYY-MM-DD');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(11); // 月份从0开始
      expect(result?.getDate()).toBe(25);
    });

    it('应该处理不同格式', () => {
      const result1 = DateUtils.parse('2023/12/25', 'YYYY/MM/DD');
      const result2 = DateUtils.parse('12-25-2023', 'MM-DD-YYYY');
      
      expect(result1?.getFullYear()).toBe(2023);
      expect(result2?.getFullYear()).toBe(2023);
    });

    it('应该处理无效格式', () => {
      expect(DateUtils.parse('invalid', 'YYYY-MM-DD')).toBeNull();
      expect(DateUtils.parse('2023-13-25', 'YYYY-MM-DD')).toBeNull();
    });
  });

  describe('isValid', () => {
    it('应该正确验证有效日期', () => {
      expect(DateUtils.isValid(new Date())).toBe(true);
      expect(DateUtils.isValid('2023-12-25')).toBe(true);
      expect(DateUtils.isValid(Date.now())).toBe(true);
    });

    it('应该正确验证无效日期', () => {
      expect(DateUtils.isValid(null)).toBe(false);
      expect(DateUtils.isValid(undefined)).toBe(false);
      expect(DateUtils.isValid('invalid')).toBe(false);
      expect(DateUtils.isValid(new Date('invalid'))).toBe(false);
    });
  });

  describe('compare', () => {
    it('应该正确比较日期', () => {
      const date1 = new Date(2023, 11, 25);
      const date2 = new Date(2023, 11, 26);
      const date3 = new Date(2023, 11, 25);

      expect(DateUtils.compare(date1, date2)).toBe(-1);
      expect(DateUtils.compare(date2, date1)).toBe(1);
      expect(DateUtils.compare(date1, date3)).toBe(0);
    });

    it('应该处理字符串日期', () => {
      expect(DateUtils.compare('2023-12-25', '2023-12-26')).toBe(-1);
      expect(DateUtils.compare('2023-12-26', '2023-12-25')).toBe(1);
      expect(DateUtils.compare('2023-12-25', '2023-12-25')).toBe(0);
    });
  });

  describe('add', () => {
    it('应该正确添加天数', () => {
      const date = new Date(2023, 11, 25);
      const result = DateUtils.add(date, 5, 'day');
      expect(result?.getDate()).toBe(30);
    });

    it('应该正确添加月份', () => {
      const date = new Date(2023, 11, 25);
      const result = DateUtils.add(date, 1, 'month');
      expect(result?.getMonth()).toBe(0); // 下一年的1月
      expect(result?.getFullYear()).toBe(2024);
    });

    it('应该正确添加年份', () => {
      const date = new Date(2023, 11, 25);
      const result = DateUtils.add(date, 1, 'year');
      expect(result?.getFullYear()).toBe(2024);
    });
  });

  describe('subtract', () => {
    it('应该正确减去天数', () => {
      const date = new Date(2023, 11, 25);
      const result = DateUtils.subtract(date, 5, 'day');
      expect(result?.getDate()).toBe(20);
    });

    it('应该正确减去月份', () => {
      const date = new Date(2023, 0, 25); // 1月
      const result = DateUtils.subtract(date, 1, 'month');
      expect(result?.getMonth()).toBe(11); // 上一年的12月
      expect(result?.getFullYear()).toBe(2022);
    });
  });

  describe('startOf', () => {
    it('应该正确获取日期开始', () => {
      const date = new Date(2023, 11, 25, 15, 30, 45);
      
      const dayStart = DateUtils.startOf(date, 'day');
      expect(dayStart?.getHours()).toBe(0);
      expect(dayStart?.getMinutes()).toBe(0);
      expect(dayStart?.getSeconds()).toBe(0);

      const monthStart = DateUtils.startOf(date, 'month');
      expect(monthStart?.getDate()).toBe(1);
      expect(monthStart?.getHours()).toBe(0);

      const yearStart = DateUtils.startOf(date, 'year');
      expect(yearStart?.getMonth()).toBe(0);
      expect(yearStart?.getDate()).toBe(1);
    });
  });

  describe('endOf', () => {
    it('应该正确获取日期结束', () => {
      const date = new Date(2023, 11, 25, 15, 30, 45);
      
      const dayEnd = DateUtils.endOf(date, 'day');
      expect(dayEnd?.getHours()).toBe(23);
      expect(dayEnd?.getMinutes()).toBe(59);
      expect(dayEnd?.getSeconds()).toBe(59);

      const monthEnd = DateUtils.endOf(date, 'month');
      expect(monthEnd?.getDate()).toBe(31); // 12月有31天
    });
  });

  describe('isToday', () => {
    it('应该正确判断是否为今天', () => {
      const today = new Date();
      const yesterday = DateUtils.subtract(today, 1, 'day');
      const tomorrow = DateUtils.add(today, 1, 'day');

      expect(DateUtils.isToday(today)).toBe(true);
      expect(DateUtils.isToday(yesterday!)).toBe(false);
      expect(DateUtils.isToday(tomorrow!)).toBe(false);
    });
  });

  describe('isWeekend', () => {
    it('应该正确判断是否为周末', () => {
      // 2023-12-23 是周六，2023-12-24 是周日
      const saturday = new Date(2023, 11, 23);
      const sunday = new Date(2023, 11, 24);
      const monday = new Date(2023, 11, 25);

      expect(DateUtils.isWeekend(saturday)).toBe(true);
      expect(DateUtils.isWeekend(sunday)).toBe(true);
      expect(DateUtils.isWeekend(monday)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('应该正确获取月份天数', () => {
      expect(DateUtils.getDaysInMonth(2023, 0)).toBe(31); // 1月
      expect(DateUtils.getDaysInMonth(2023, 1)).toBe(28); // 2月（非闰年）
      expect(DateUtils.getDaysInMonth(2024, 1)).toBe(29); // 2月（闰年）
      expect(DateUtils.getDaysInMonth(2023, 3)).toBe(30); // 4月
    });
  });

  describe('isLeapYear', () => {
    it('应该正确判断闰年', () => {
      expect(DateUtils.isLeapYear(2024)).toBe(true);
      expect(DateUtils.isLeapYear(2023)).toBe(false);
      expect(DateUtils.isLeapYear(2000)).toBe(true);
      expect(DateUtils.isLeapYear(1900)).toBe(false);
    });
  });

  describe('getWeekOfYear', () => {
    it('应该正确获取年中第几周', () => {
      const date = new Date(2023, 0, 1); // 2023年1月1日
      const week = DateUtils.getWeekOfYear(date);
      expect(typeof week).toBe('number');
      expect(week).toBeGreaterThan(0);
      expect(week).toBeLessThanOrEqual(53);
    });
  });

  describe('isInRange', () => {
    it('应该正确判断日期是否在范围内', () => {
      const date = new Date(2023, 11, 25);
      const start = new Date(2023, 11, 20);
      const end = new Date(2023, 11, 30);
      const before = new Date(2023, 11, 15);
      const after = new Date(2024, 0, 5);

      expect(DateUtils.isInRange(date, start, end)).toBe(true);
      expect(DateUtils.isInRange(before, start, end)).toBe(false);
      expect(DateUtils.isInRange(after, start, end)).toBe(false);
    });

    it('应该处理边界情况', () => {
      const start = new Date(2023, 11, 20);
      const end = new Date(2023, 11, 30);

      expect(DateUtils.isInRange(start, start, end)).toBe(true);
      expect(DateUtils.isInRange(end, start, end)).toBe(true);
    });

    it('应该处理 null 值', () => {
      const date = new Date(2023, 11, 25);
      expect(DateUtils.isInRange(date, null, null)).toBe(true);
      expect(DateUtils.isInRange(date, new Date(2023, 11, 20), null)).toBe(true);
      expect(DateUtils.isInRange(date, null, new Date(2023, 11, 30))).toBe(true);
    });
  });
});
