/**
 * 日期工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  getDaysInMonth,
  isLeapYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  addDays,
  addMonths,
  addYears,
  formatDate,
  getQuarter,
  getWeekNumber,
} from '../date';

describe('Date Utils', () => {
  describe('getDaysInMonth', () => {
    it('should return correct days for regular months', () => {
      expect(getDaysInMonth(2024, 0)).toBe(31); // January
      expect(getDaysInMonth(2024, 3)).toBe(30); // April
    });

    it('should handle leap year February', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29); // 2024 is leap year
      expect(getDaysInMonth(2023, 1)).toBe(28); // 2023 is not
    });
  });

  describe('isLeapYear', () => {
    it('should identify leap years correctly', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should compare dates correctly', () => {
      const date1 = new Date(2024, 0, 1, 10, 0, 0);
      const date2 = new Date(2024, 0, 1, 20, 0, 0);
      const date3 = new Date(2024, 0, 2, 10, 0, 0);

      expect(isSameDay(date1, date2)).toBe(true);
      expect(isSameDay(date1, date3)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      const date = new Date(2024, 0, 1);
      const result = addDays(date, 5);

      expect(result.getDate()).toBe(6);
      expect(result.getMonth()).toBe(0);
    });

    it('should handle month overflow', () => {
      const date = new Date(2024, 0, 30);
      const result = addDays(date, 5);

      expect(result.getDate()).toBe(4);
      expect(result.getMonth()).toBe(1);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 0, 5, 14, 30, 15);

      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-05');
      expect(formatDate(date, 'YYYY/MM/DD HH:mm:ss')).toBe('2024/01/05 14:30:15');
      expect(formatDate(date, 'YY-M-D')).toBe('24-1-5');
    });
  });

  describe('getQuarter', () => {
    it('should return correct quarter', () => {
      expect(getQuarter(new Date(2024, 0, 1))).toBe(1); // January
      expect(getQuarter(new Date(2024, 3, 1))).toBe(2); // April
      expect(getQuarter(new Date(2024, 6, 1))).toBe(3); // July
      expect(getQuarter(new Date(2024, 9, 1))).toBe(4); // October
    });
  });
});





