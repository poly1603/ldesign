/**
 * required 验证器测试
 * 
 * @description
 * 测试 required 验证器的各种场景
 */

import { describe, it, expect } from 'vitest';
import { required } from '@/validators/required';

describe('required validator', () => {
  describe('Basic functionality', () => {
    it('should return valid for non-empty string', () => {
      const validator = required();
      const context = {
        fieldName: 'testField',
        fieldConfig: { name: 'testField', label: 'Test Field' }
      };
      const result = validator('hello', context);

      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for empty string', () => {
      const validator = required();
      const result = validator('');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');
    });

    it('should return invalid for null', () => {
      const validator = required();
      const result = validator(null);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');
    });

    it('should return invalid for undefined', () => {
      const validator = required();
      const result = validator(undefined);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('This field is required');
    });
  });

  describe('Custom message', () => {
    it('should use custom message when provided', () => {
      const customMessage = 'Custom required message';
      const validator = required(customMessage);
      const result = validator('');

      expect(result.valid).toBe(false);
      expect(result.message).toBe(customMessage);
    });
  });

  describe('Different data types', () => {
    it('should return valid for non-zero number', () => {
      const validator = required();
      const result = validator(42);

      expect(result.valid).toBe(true);
    });

    it('should return valid for zero', () => {
      const validator = required();
      const result = validator(0);

      expect(result.valid).toBe(true);
    });

    it('should return valid for false boolean', () => {
      const validator = required();
      const result = validator(false);

      expect(result.valid).toBe(true);
    });

    it('should return valid for true boolean', () => {
      const validator = required();
      const result = validator(true);

      expect(result.valid).toBe(true);
    });

    it('should return valid for non-empty array', () => {
      const validator = required();
      const result = validator([1, 2, 3]);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for empty array', () => {
      const validator = required();
      const result = validator([]);

      expect(result.valid).toBe(false);
    });

    it('should return valid for non-empty object', () => {
      const validator = required();
      const result = validator({ key: 'value' });

      expect(result.valid).toBe(true);
    });

    it('should return invalid for empty object', () => {
      const validator = required();
      const result = validator({});

      expect(result.valid).toBe(false);
    });
  });

  describe('Whitespace handling', () => {
    it('should return invalid for whitespace-only string', () => {
      const validator = required();
      const result = validator('   ');

      expect(result.valid).toBe(false);
    });

    it('should return valid for string with content and whitespace', () => {
      const validator = required();
      const result = validator('  hello  ');

      expect(result.valid).toBe(true);
    });

    it('should return invalid for tab and newline characters', () => {
      const validator = required();
      const result = validator('\t\n\r');

      expect(result.valid).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle Date objects', () => {
      const validator = required();
      const result = validator(new Date());

      expect(result.valid).toBe(true);
    });

    it('should handle functions', () => {
      const validator = required();
      const result = validator(() => { });

      expect(result.valid).toBe(true);
    });

    it('should handle symbols', () => {
      const validator = required();
      const result = validator(Symbol('test'));

      expect(result.valid).toBe(true);
    });
  });
});
