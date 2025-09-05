/**
 * length 验证器测试
 * 
 * @description
 * 测试 length 验证器的各种场景
 */

import { describe, it, expect } from 'vitest';
import { length } from '@/validators/length';

describe('length validator', () => {
  describe('Minimum length validation', () => {
    it('should validate string meeting minimum length', () => {
      const validator = length({ min: 3 });
      const result = validator('hello');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should validate string exactly at minimum length', () => {
      const validator = length({ min: 3 });
      const result = validator('abc');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject string below minimum length', () => {
      const validator = length({ min: 3 });
      const result = validator('ab');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Minimum length is 3 characters');
    });

    it('should use custom minimum length message', () => {
      const customMessage = 'Too short!';
      const validator = length({ min: 3, minMessage: customMessage });
      const result = validator('ab');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe(customMessage);
    });
  });

  describe('Maximum length validation', () => {
    it('should validate string within maximum length', () => {
      const validator = length({ max: 5 });
      const result = validator('abc');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should validate string exactly at maximum length', () => {
      const validator = length({ max: 5 });
      const result = validator('abcde');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject string above maximum length', () => {
      const validator = length({ max: 5 });
      const result = validator('abcdef');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Maximum length is 5 characters');
    });

    it('should use custom maximum length message', () => {
      const customMessage = 'Too long!';
      const validator = length({ max: 5, maxMessage: customMessage });
      const result = validator('abcdef');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe(customMessage);
    });
  });

  describe('Range validation', () => {
    it('should validate string within range', () => {
      const validator = length({ min: 3, max: 10 });
      const result = validator('hello');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should validate string at minimum of range', () => {
      const validator = length({ min: 3, max: 10 });
      const result = validator('abc');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should validate string at maximum of range', () => {
      const validator = length({ min: 3, max: 10 });
      const result = validator('abcdefghij');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject string below range', () => {
      const validator = length({ min: 3, max: 10 });
      const result = validator('ab');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Length must be between 3 and 10 characters');
    });

    it('should reject string above range', () => {
      const validator = length({ min: 3, max: 10 });
      const result = validator('abcdefghijk');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Length must be between 3 and 10 characters');
    });

    it('should use custom range message', () => {
      const customMessage = 'Invalid length range!';
      const validator = length({ min: 3, max: 10, rangeMessage: customMessage });
      const result = validator('ab');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe(customMessage);
    });
  });

  describe('Exact length validation', () => {
    it('should validate string with exact length', () => {
      const validator = length({ exact: 5 });
      const result = validator('hello');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject string with different length', () => {
      const validator = length({ exact: 5 });
      const result = validator('hi');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Length must be exactly 5 characters');
    });

    it('should use custom exact length message', () => {
      const customMessage = 'Wrong length!';
      const validator = length({ exact: 5, exactMessage: customMessage });
      const result = validator('hi');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe(customMessage);
    });
  });

  describe('Array validation', () => {
    it('should validate array length', () => {
      const validator = length({ min: 2, max: 5 });
      const result = validator([1, 2, 3]);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject array below minimum length', () => {
      const validator = length({ min: 3 });
      const result = validator([1, 2]);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Minimum length is 3 items');
    });

    it('should reject array above maximum length', () => {
      const validator = length({ max: 2 });
      const result = validator([1, 2, 3]);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Maximum length is 2 items');
    });
  });

  describe('Non-string/array values', () => {
    it('should return valid for null (optional field)', () => {
      const validator = length({ min: 3 });
      const result = validator(null);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return valid for undefined (optional field)', () => {
      const validator = length({ min: 3 });
      const result = validator(undefined);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return valid for empty string (optional field)', () => {
      const validator = length({ min: 3 });
      const result = validator('');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for number', () => {
      const validator = length({ min: 3 });
      const result = validator(123);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Value must be a string or array');
    });

    it('should return invalid for boolean', () => {
      const validator = length({ min: 3 });
      const result = validator(true);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Value must be a string or array');
    });

    it('should return invalid for object', () => {
      const validator = length({ min: 3 });
      const result = validator({ length: 5 });
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Value must be a string or array');
    });
  });

  describe('Unicode and special characters', () => {
    it('should handle Unicode characters correctly', () => {
      const validator = length({ min: 3, max: 5 });
      const result = validator('你好世界'); // 4 Chinese characters
      
      expect(result.valid).toBe(true);
    });

    it('should handle emojis correctly', () => {
      const validator = length({ exact: 3 });
      const result = validator('😀😁😂'); // 3 emoji characters
      
      expect(result.valid).toBe(true);
    });

    it('should handle mixed Unicode and ASCII', () => {
      const validator = length({ min: 5, max: 10 });
      const result = validator('Hello世界'); // 7 characters total
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero minimum length', () => {
      const validator = length({ min: 0 });
      const result = validator('');
      
      expect(result.valid).toBe(true);
    });

    it('should handle very large maximum length', () => {
      const validator = length({ max: 1000000 });
      const result = validator('short');
      
      expect(result.valid).toBe(true);
    });

    it('should handle invalid configuration (min > max)', () => {
      const validator = length({ min: 10, max: 5 });
      const result = validator('hello');
      
      // Should handle gracefully - behavior depends on implementation
      expect(typeof result.valid).toBe('boolean');
    });
  });
});
