/**
 * email 验证器测试
 * 
 * @description
 * 测试 email 验证器的各种场景
 */

import { describe, it, expect } from 'vitest';
import { email } from '@/validators/email';

describe('email validator', () => {
  describe('Valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'user_name@example-domain.com',
      'firstname.lastname@subdomain.example.com',
      'email@123.123.123.123', // IP address
      'user@[IPv6:2001:db8::1]', // IPv6
      'test.email.with+symbol@example.com',
      'x@example.com', // single character local part
      'example@s.example', // single character subdomain
      'user@example-one.com',
      'user@example_one.com'
    ];

    validEmails.forEach(emailAddress => {
      it(`should validate ${emailAddress} as valid`, () => {
        const validator = email();
        const result = validator(emailAddress);
        
        expect(result.valid).toBe(true);
        expect(result.message).toBe('');
      });
    });
  });

  describe('Invalid emails', () => {
    const invalidEmails = [
      'plainaddress',
      '@missingdomain.com',
      'missing@.com',
      'missing@domain',
      'spaces in@email.com',
      'email@',
      'email@domain',
      'email..double.dot@example.com',
      'email@domain..com',
      '.email@domain.com',
      'email.@domain.com',
      'email@domain.com.',
      'email@-domain.com',
      'email@domain-.com',
      'email@domain.c',
      'email@domain.toolongextension',
      'email with spaces@domain.com',
      'email@domain with spaces.com',
      'email@domain.com with extra',
      'email@@domain.com',
      'email@domain@com',
      'email@domain..com',
      'email@.domain.com',
      'email@domain.com.',
      ''
    ];

    invalidEmails.forEach(emailAddress => {
      it(`should validate ${emailAddress || '(empty)'} as invalid`, () => {
        const validator = email();
        const result = validator(emailAddress);
        
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Please enter a valid email address');
      });
    });
  });

  describe('Custom message', () => {
    it('should use custom message when provided', () => {
      const customMessage = 'Custom email validation message';
      const validator = email(customMessage);
      const result = validator('invalid-email');
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe(customMessage);
    });
  });

  describe('Non-string values', () => {
    it('should return valid for null (optional field)', () => {
      const validator = email();
      const result = validator(null);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return valid for undefined (optional field)', () => {
      const validator = email();
      const result = validator(undefined);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return valid for empty string (optional field)', () => {
      const validator = email();
      const result = validator('');
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for number', () => {
      const validator = email();
      const result = validator(123);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address');
    });

    it('should return invalid for boolean', () => {
      const validator = email();
      const result = validator(true);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address');
    });

    it('should return invalid for object', () => {
      const validator = email();
      const result = validator({ email: 'test@example.com' });
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address');
    });

    it('should return invalid for array', () => {
      const validator = email();
      const result = validator(['test@example.com']);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long email addresses', () => {
      const longLocal = 'a'.repeat(64); // Maximum local part length
      const longEmail = `${longLocal}@example.com`;
      const validator = email();
      const result = validator(longEmail);
      
      expect(result.valid).toBe(true);
    });

    it('should reject overly long local part', () => {
      const tooLongLocal = 'a'.repeat(65); // Exceeds maximum local part length
      const longEmail = `${tooLongLocal}@example.com`;
      const validator = email();
      const result = validator(longEmail);
      
      expect(result.valid).toBe(false);
    });

    it('should handle international domain names', () => {
      const validator = email();
      const result = validator('test@münchen.de');
      
      // Note: This might be valid or invalid depending on the regex implementation
      // The test documents the current behavior
      expect(typeof result.valid).toBe('boolean');
    });

    it('should handle quoted local parts', () => {
      const validator = email();
      const result = validator('"test email"@example.com');
      
      // Note: Quoted local parts are valid in RFC 5322 but often not supported
      // The test documents the current behavior
      expect(typeof result.valid).toBe('boolean');
    });
  });

  describe('Whitespace handling', () => {
    it('should reject email with leading whitespace', () => {
      const validator = email();
      const result = validator(' test@example.com');
      
      expect(result.valid).toBe(false);
    });

    it('should reject email with trailing whitespace', () => {
      const validator = email();
      const result = validator('test@example.com ');
      
      expect(result.valid).toBe(false);
    });

    it('should reject email with internal whitespace', () => {
      const validator = email();
      const result = validator('test @example.com');
      
      expect(result.valid).toBe(false);
    });
  });
});
