import { describe, expect, it } from 'vitest'
import { QRDataValidator, ValidatorPresets } from '../../src/features/validation'

describe('QRDataValidator', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const validator = new QRDataValidator()
      expect(validator).toBeDefined()
    })

    it('should create with custom options', () => {
      const validator = new QRDataValidator({
        maxLength: 500,
        checkUrl: false
      })
      expect(validator).toBeDefined()
    })
  })

  describe('validate', () => {
    let validator: QRDataValidator

    beforeEach(() => {
      validator = new QRDataValidator()
    })

    it('should validate basic text', () => {
      const result = validator.validate('Hello World')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.metadata?.dataType).toBe('text')
      expect(result.metadata?.complexity).toBe('low')
    })

    it('should validate URL', () => {
      const result = validator.validate('https://example.com')
      expect(result.isValid).toBe(true)
      expect(result.metadata?.dataType).toBe('url')
    })

    it('should validate email', () => {
      const result = validator.validate('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.metadata?.dataType).toBe('email')
    })

    it('should validate phone number', () => {
      const result = validator.validate('+1234567890')
      expect(result.isValid).toBe(true)
      expect(result.metadata?.dataType).toBe('phone')
    })

    it('should validate JSON', () => {
      const result = validator.validate('{"name":"test","value":123}')
      expect(result.isValid).toBe(true)
      expect(result.metadata?.dataType).toBe('json')
    })

    it('should reject empty data', () => {
      const result = validator.validate('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data must be a non-empty string')
    })

    it('should reject data that is too long', () => {
      const longData = 'a'.repeat(3000)
      const result = validator.validate(longData)
      console.log('Long data errors:', result.errors)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('exceeds maximum limit'))
    })

    it('should warn about large data', () => {
      const largeData = 'a'.repeat(1500)
      const result = validator.validate(largeData)
      console.log('Large data warnings:', result.warnings)
      expect(result.warnings).toContain(expect.stringContaining('hard to scan'))
    })

    it('should detect high complexity', () => {
      const complexData = 'Test with unicode 中文字符 and special chars !@#$%^&*()'.repeat(50)
      const result = validator.validate(complexData)
      console.log('Complex data warnings:', result.warnings)
      expect(result.metadata?.complexity).toBe('high')
      expect(result.warnings).toContain(expect.stringContaining('difficult to scan on some devices'))
    })

    it('should validate invalid URL protocol', () => {
      const validator = new QRDataValidator({
        allowedProtocols: ['https:']
      })
      const result = validator.validate('http://example.com')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Protocol http: is not allowed')
    })

    it('should run custom validators', () => {
      const validator = new QRDataValidator({
        customValidators: [
          (data) => data.includes('test') || 'Must contain "test"',
          (data) => data.length > 5
        ]
      })

      const result1 = validator.validate('hello')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('Must contain "test"')

      const result2 = validator.validate('test')
      expect(result2.isValid).toBe(false)
      expect(result2.errors).toContain('Custom validation failed')

      const result3 = validator.validate('test data')
      expect(result3.isValid).toBe(true)
    })
  })

  describe('getOptimizationSuggestions', () => {
    let validator: QRDataValidator

    beforeEach(() => {
      validator = new QRDataValidator()
    })

    it('should suggest shortening long text', () => {
      const longData = 'a'.repeat(1000)
      const suggestions = validator.getOptimizationSuggestions(longData)
      console.log('Long text suggestions:', suggestions)
      expect(suggestions).toContain(expect.stringContaining('Consider shortening the text'))
    })

    it('should suggest simplifying complex data', () => {
      const complexData = 'Test 中文'.repeat(200)
      const suggestions = validator.getOptimizationSuggestions(complexData)
      expect(suggestions.some(s => s.includes('complexity') || s.includes('Non-ASCII'))).toBe(true)
    })

    it('should suggest optimizing spaces', () => {
      const spacyData = 'test   with   many   spaces'
      const suggestions = validator.getOptimizationSuggestions(spacyData)
      console.log('Space suggestions:', suggestions)
      expect(suggestions).toContain(expect.stringContaining('Multiple consecutive spaces'))
    })
  })

  describe('validateBatch', () => {
    it('should validate multiple data items', () => {
      const validator = new QRDataValidator()
      const data = ['Hello', 'https://example.com', 'test@email.com']
      const results = validator.validateBatch(data)
      
      expect(results).toHaveLength(3)
      expect(results[0].metadata?.dataType).toBe('text')
      expect(results[1].metadata?.dataType).toBe('url')
      expect(results[2].metadata?.dataType).toBe('email')
    })
  })

  describe('updateOptions', () => {
    it('should update validation options', () => {
      const validator = new QRDataValidator({ maxLength: 100 })
      
      let result = validator.validate('a'.repeat(150))
      expect(result.isValid).toBe(false)
      
      validator.updateOptions({ maxLength: 200 })
      result = validator.validate('a'.repeat(150))
      expect(result.isValid).toBe(true)
    })
  })
})

describe('ValidatorPresets', () => {
  describe('strict', () => {
    it('should create strict validator', () => {
      const validator = ValidatorPresets.strict()
      expect(validator).toBeInstanceOf(QRDataValidator)
      
      // Should reject HTTP URLs (only HTTPS allowed)
      const result = validator.validate('http://example.com')
      expect(result.isValid).toBe(false)
    })

    it('should reject empty/whitespace data', () => {
      const validator = ValidatorPresets.strict()
      const result = validator.validate('   ')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data cannot be empty or only whitespace')
    })

    it('should reject multiple spaces', () => {
      const validator = ValidatorPresets.strict()
      const result = validator.validate('test   data')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Avoid multiple consecutive spaces')
    })
  })

  describe('lenient', () => {
    it('should create lenient validator', () => {
      const validator = ValidatorPresets.lenient()
      expect(validator).toBeInstanceOf(QRDataValidator)
      
      // Should accept HTTP URLs
      const result = validator.validate('http://example.com')
      expect(result.isValid).toBe(true)
    })
  })

  describe('urlOnly', () => {
    it('should create URL-only validator', () => {
      const validator = ValidatorPresets.urlOnly()
      expect(validator).toBeInstanceOf(QRDataValidator)
      
      // Should accept URLs
      const result1 = validator.validate('https://example.com')
      expect(result1.isValid).toBe(true)
      
      // Should reject non-URLs
      const result2 = validator.validate('just text')
      expect(result2.isValid).toBe(false)
      expect(result2.errors).toContain('Must be a valid URL')
    })
  })
})
