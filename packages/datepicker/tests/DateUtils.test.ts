/**
 * DateUtils 单元测试
 */

import { DateUtils } from '../src/utils/DateUtils';

describe('DateUtils', () => {
  describe('format', () => {
    it('应该正确格式化日期', () => {
      const date = new Date(2024, 0, 15, 14, 30, 45); // 2024-01-15 14:30:45
      
      expect(DateUtils.format(date, 'YYYY-MM-DD')).toBe('2024-01-15');
      expect(DateUtils.format(date, 'YYYY/MM/DD')).toBe('2024/01/15');
      expect(DateUtils.format(date, 'MM-DD-YYYY')).toBe('01-15-2024');
      expect(DateUtils.format(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 14:30:45');
    });
    
    it('应该处理无效日期', () => {
      const invalidDate = new Date('invalid');
      expect(DateUtils.format(invalidDate, 'YYYY-MM-DD')).toBe('');
    });
  });
  
  describe('parse', () => {
    it('应该正确解析日期字符串', () => {
      const dateStr = '2024-01-15';
      const parsed = DateUtils.parse(dateStr, 'YYYY-MM-DD');
      
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getFullYear()).toBe(2024);
      expect(parsed?.getMonth()).toBe(0); // 0-based month
      expect(parsed?.getDate()).toBe(15);
    });
    
    it('应该处理无效格式', () => {
      const invalidStr = 'invalid-date';
      const parsed = DateUtils.parse(invalidStr, 'YYYY-MM-DD');
      
      expect(parsed).toBeNull();
    });
  });
  
  describe('isValid', () => {
    it('应该正确验证有效日期', () => {
      const validDate = new Date(2024, 0, 15);
      expect(DateUtils.isValid(validDate)).toBe(true);
    });
    
    it('应该正确验证无效日期', () => {
      const invalidDate = new Date('invalid');
      expect(DateUtils.isValid(invalidDate)).toBe(false);
    });
  });
  
  describe('isSameDay', () => {
    it('应该正确比较同一天的日期', () => {
      const date1 = new Date(2024, 0, 15, 10, 30);
      const date2 = new Date(2024, 0, 15, 20, 45);
      
      expect(DateUtils.isSameDay(date1, date2)).toBe(true);
    });
    
    it('应该正确比较不同天的日期', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 16);
      
      expect(DateUtils.isSameDay(date1, date2)).toBe(false);
    });
  });
  
  describe('isSameMonth', () => {
    it('应该正确比较同一月的日期', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 25);
      
      expect(DateUtils.isSameMonth(date1, date2)).toBe(true);
    });
    
    it('应该正确比较不同月的日期', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 1, 15);
      
      expect(DateUtils.isSameMonth(date1, date2)).toBe(false);
    });
  });
  
  describe('isSameYear', () => {
    it('应该正确比较同一年的日期', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 11, 25);
      
      expect(DateUtils.isSameYear(date1, date2)).toBe(true);
    });
    
    it('应该正确比较不同年的日期', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2025, 0, 15);
      
      expect(DateUtils.isSameYear(date1, date2)).toBe(false);
    });
  });
  
  describe('addDays', () => {
    it('应该正确添加天数', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.addDays(date, 5);
      
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(0);
      expect(result.getFullYear()).toBe(2024);
    });
    
    it('应该正确处理跨月添加', () => {
      const date = new Date(2024, 0, 30);
      const result = DateUtils.addDays(date, 5);
      
      expect(result.getDate()).toBe(4);
      expect(result.getMonth()).toBe(1);
      expect(result.getFullYear()).toBe(2024);
    });
    
    it('应该正确处理负数天数', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.addDays(date, -5);
      
      expect(result.getDate()).toBe(10);
      expect(result.getMonth()).toBe(0);
      expect(result.getFullYear()).toBe(2024);
    });
  });
  
  describe('addMonths', () => {
    it('应该正确添加月数', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.addMonths(date, 3);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(3);
      expect(result.getFullYear()).toBe(2024);
    });
    
    it('应该正确处理跨年添加', () => {
      const date = new Date(2024, 10, 15);
      const result = DateUtils.addMonths(date, 3);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(1);
      expect(result.getFullYear()).toBe(2025);
    });
  });
  
  describe('addYears', () => {
    it('应该正确添加年数', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.addYears(date, 2);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(0);
      expect(result.getFullYear()).toBe(2026);
    });
    
    it('应该正确处理闰年', () => {
      const date = new Date(2024, 1, 29); // 2024年2月29日（闰年）
      const result = DateUtils.addYears(date, 1);
      
      // 2025年没有2月29日，应该调整为2月28日
      expect(result.getDate()).toBe(28);
      expect(result.getMonth()).toBe(1);
      expect(result.getFullYear()).toBe(2025);
    });
  });
  
  describe('diffInDays', () => {
    it('应该正确计算日期差', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 20);
      
      expect(DateUtils.diffInDays(date2, date1)).toBe(5);
      expect(DateUtils.diffInDays(date1, date2)).toBe(-5);
    });
    
    it('应该正确处理跨月日期差', () => {
      const date1 = new Date(2024, 0, 30);
      const date2 = new Date(2024, 1, 5);
      
      expect(DateUtils.diffInDays(date2, date1)).toBe(6);
    });
  });
  
  describe('startOfDay', () => {
    it('应该返回一天的开始时间', () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const result = DateUtils.startOfDay(date);
      
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });
  
  describe('endOfDay', () => {
    it('应该返回一天的结束时间', () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const result = DateUtils.endOfDay(date);
      
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });
  
  describe('startOfMonth', () => {
    it('应该返回月份的第一天', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.startOfMonth(date);
      
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(0);
      expect(result.getFullYear()).toBe(2024);
    });
  });
  
  describe('endOfMonth', () => {
    it('应该返回月份的最后一天', () => {
      const date = new Date(2024, 0, 15); // 2024年1月
      const result = DateUtils.endOfMonth(date);
      
      expect(result.getDate()).toBe(31);
      expect(result.getMonth()).toBe(0);
      expect(result.getFullYear()).toBe(2024);
    });
    
    it('应该正确处理2月', () => {
      const date = new Date(2024, 1, 15); // 2024年2月（闰年）
      const result = DateUtils.endOfMonth(date);
      
      expect(result.getDate()).toBe(29);
      expect(result.getMonth()).toBe(1);
      expect(result.getFullYear()).toBe(2024);
    });
  });
  
  describe('getWeekdays', () => {
    it('应该返回正确的星期名称', () => {
      const weekdays = DateUtils.getWeekdays('zh-CN');
      
      expect(weekdays).toEqual(['日', '一', '二', '三', '四', '五', '六']);
    });
    
    it('应该支持英文', () => {
      const weekdays = DateUtils.getWeekdays('en-US');
      
      expect(weekdays).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });
  });
  
  describe('getMonthNames', () => {
    it('应该返回正确的月份名称', () => {
      const months = DateUtils.getMonthNames('zh-CN');
      
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('1月');
      expect(months[11]).toBe('12月');
    });
    
    it('应该支持英文', () => {
      const months = DateUtils.getMonthNames('en-US');
      
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('January');
      expect(months[11]).toBe('December');
    });
  });
  
  describe('toDate', () => {
    it('应该正确转换Date对象', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.toDate(date);
      
      expect(result).toBe(date);
    });
    
    it('应该正确转换字符串', () => {
      const dateStr = '2024-01-15';
      const result = DateUtils.toDate(dateStr);
      
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });
    
    it('应该正确转换时间戳', () => {
      const timestamp = new Date(2024, 0, 15).getTime();
      const result = DateUtils.toDate(timestamp);
      
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });
    
    it('应该处理null和undefined', () => {
      expect(DateUtils.toDate(null)).toBeNull();
      expect(DateUtils.toDate(undefined)).toBeNull();
    });
  });
});
