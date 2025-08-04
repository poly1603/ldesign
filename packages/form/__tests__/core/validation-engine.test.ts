import type { ValidationRule } from '../../src/types'
import { describe, expect, it, vi } from 'vitest'
import { BuiltinValidators, createValidationEngine, ValidationEngine } from '../../src/core/validation-engine'

describe('validationEngine', () => {
  describe('constructor and basic setup', () => {
    it('should create validation engine', () => {
      const engine = new ValidationEngine()
      expect(engine).toBeInstanceOf(ValidationEngine)
    })

    it('should create validation engine with helper function', () => {
      const engine = createValidationEngine()
      expect(engine).toBeInstanceOf(ValidationEngine)
    })
  })

  describe('rule management', () => {
    it('should add and get rules', () => {
      const engine = new ValidationEngine()
      const rule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }

      engine.addRule('name', rule)
      const rules = engine.getRules('name')

      expect(rules).toHaveLength(1)
      expect(rules[0]).toEqual(rule)
    })

    it('should update existing rule with same id', () => {
      const engine = new ValidationEngine()
      const rule1: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      const rule2: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required (updated)',
      }

      engine.addRule('name', rule1)
      engine.addRule('name', rule2)
      const rules = engine.getRules('name')

      expect(rules).toHaveLength(1)
      expect(rules[0].message).toBe('Name is required (updated)')
    })

    it('should remove specific rule', () => {
      const engine = new ValidationEngine()
      const rule1: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      const rule2: ValidationRule = {
        id: 'length-name',
        type: 'length',
        message: 'Name length invalid',
        value: { min: 2, max: 50 },
      }

      engine.addRule('name', rule1)
      engine.addRule('name', rule2)
      engine.removeRule('name', 'required-name')

      const rules = engine.getRules('name')
      expect(rules).toHaveLength(1)
      expect(rules[0].id).toBe('length-name')
    })

    it('should remove all rules for field', () => {
      const engine = new ValidationEngine()
      const rule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }

      engine.addRule('name', rule)
      engine.removeRule('name')

      expect(engine.getRules('name')).toHaveLength(0)
      expect(engine.hasRules('name')).toBe(false)
    })

    it('should clear all rules', () => {
      const engine = new ValidationEngine()
      const rule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }

      engine.addRule('name', rule)
      engine.addRule('email', rule)
      engine.clearRules()

      expect(engine.getAllRules()).toEqual({})
    })

    it('should get all rules', () => {
      const engine = new ValidationEngine()
      const nameRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      const emailRule: ValidationRule = {
        id: 'required-email',
        type: 'required',
        message: 'Email is required',
      }

      engine.addRule('name', nameRule)
      engine.addRule('email', emailRule)

      const allRules = engine.getAllRules()
      expect(allRules.name).toHaveLength(1)
      expect(allRules.email).toHaveLength(1)
    })
  })

  describe('builtin validators', () => {
    it('should validate required fields', async () => {
      expect(BuiltinValidators.required('')).toBe(false)
      expect(BuiltinValidators.required('  ')).toBe(false)
      expect(BuiltinValidators.required(null)).toBe(false)
      expect(BuiltinValidators.required(undefined)).toBe(false)
      expect(BuiltinValidators.required([])).toBe(false)
      expect(BuiltinValidators.required('hello')).toBe(true)
      expect(BuiltinValidators.required(['item'])).toBe(true)
      expect(BuiltinValidators.required(0)).toBe(true)
    })

    it('should validate pattern', async () => {
      const rule: ValidationRule = {
        id: 'pattern-test',
        type: 'pattern',
        message: 'Invalid pattern',
        value: '^[a-zA-Z]+$',
      }

      expect(BuiltinValidators.pattern('hello', rule)).toBe(true)
      expect(BuiltinValidators.pattern('hello123', rule)).toBe(false)
      expect(BuiltinValidators.pattern('', rule)).toBe(true) // 空值通过
    })

    it('should validate length', async () => {
      const rule: ValidationRule = {
        id: 'length-test',
        type: 'length',
        message: 'Invalid length',
        value: { min: 2, max: 10 },
      }

      expect(BuiltinValidators.length('a', rule)).toBe(false) // 太短
      expect(BuiltinValidators.length('ab', rule)).toBe(true)
      expect(BuiltinValidators.length('1234567890', rule)).toBe(true)
      expect(BuiltinValidators.length('12345678901', rule)).toBe(false) // 太长
    })

    it('should validate range', async () => {
      const rule: ValidationRule = {
        id: 'range-test',
        type: 'range',
        message: 'Invalid range',
        value: { min: 1, max: 100 },
      }

      expect(BuiltinValidators.range(0, rule)).toBe(false)
      expect(BuiltinValidators.range(1, rule)).toBe(true)
      expect(BuiltinValidators.range(50, rule)).toBe(true)
      expect(BuiltinValidators.range(100, rule)).toBe(true)
      expect(BuiltinValidators.range(101, rule)).toBe(false)
      expect(BuiltinValidators.range('abc', rule)).toBe(false)
    })

    it('should validate email', async () => {
      expect(BuiltinValidators.email('test@example.com')).toBe(true)
      expect(BuiltinValidators.email('invalid-email')).toBe(false)
      expect(BuiltinValidators.email('')).toBe(true) // 空值通过
    })

    it('should validate URL', async () => {
      expect(BuiltinValidators.url('https://example.com')).toBe(true)
      expect(BuiltinValidators.url('http://example.com')).toBe(true)
      expect(BuiltinValidators.url('invalid-url')).toBe(false)
      expect(BuiltinValidators.url('')).toBe(true) // 空值通过
    })

    it('should validate phone', async () => {
      expect(BuiltinValidators.phone('13812345678')).toBe(true)
      expect(BuiltinValidators.phone('15987654321')).toBe(true)
      expect(BuiltinValidators.phone('12345678901')).toBe(false) // 不是1开头的手机号
      expect(BuiltinValidators.phone('1381234567')).toBe(false) // 位数不够
    })

    it('should validate ID card', async () => {
      expect(BuiltinValidators.idCard('123456789012345')).toBe(true) // 15位
      expect(BuiltinValidators.idCard('123456789012345678')).toBe(true) // 18位
      expect(BuiltinValidators.idCard('12345678901234567X')).toBe(true) // 18位带X
      expect(BuiltinValidators.idCard('1234567890123456789')).toBe(false) // 19位
    })
  })

  describe('validation execution', () => {
    it('should validate single field', async () => {
      const engine = new ValidationEngine()
      const rule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }

      engine.addRule('name', rule)

      const result1 = await engine.validate('name', '')
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('Name is required')

      const result2 = await engine.validate('name', 'John')
      expect(result2.valid).toBe(true)
      expect(result2.errors).toHaveLength(0)
    })

    it('should validate with multiple rules', async () => {
      const engine = new ValidationEngine()
      const requiredRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      const lengthRule: ValidationRule = {
        id: 'length-name',
        type: 'length',
        message: 'Name must be 2-50 characters',
        value: { min: 2, max: 50 },
      }

      engine.addRule('name', requiredRule)
      engine.addRule('name', lengthRule)

      const result1 = await engine.validate('name', '')
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('Name is required')

      const result2 = await engine.validate('name', 'a')
      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('Name must be 2-50 characters')

      const result3 = await engine.validate('name', 'John')
      expect(result3.valid).toBe(true)
    })

    it('should validate with custom validator', async () => {
      const engine = new ValidationEngine()
      const customRule: ValidationRule = {
        id: 'custom-name',
        type: 'custom',
        message: 'Name must start with uppercase',
        validator: (value) => {
          return typeof value === 'string' && value.length > 0 && value[0] === value[0].toUpperCase()
        },
      }

      engine.addRule('name', customRule)

      const result1 = await engine.validate('name', 'john')
      expect(result1.valid).toBe(false)

      const result2 = await engine.validate('name', 'John')
      expect(result2.valid).toBe(true)
    })

    it('should validate all fields', async () => {
      const engine = new ValidationEngine()
      const nameRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      const emailRule: ValidationRule = {
        id: 'email-format',
        type: 'email',
        message: 'Invalid email format',
      }

      engine.addRule('name', nameRule)
      engine.addRule('email', emailRule)

      const result = await engine.validateAll({
        name: '',
        email: 'invalid-email',
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
    })

    it('should register custom validator', async () => {
      const engine = new ValidationEngine()

      engine.registerValidator('custom-even', (value) => {
        const num = Number(value)
        return !isNaN(num) && num % 2 === 0
      })

      const rule: ValidationRule = {
        id: 'even-number',
        type: 'custom-even',
        message: 'Must be even number',
      }

      engine.addRule('number', rule)

      const result1 = await engine.validate('number', '3')
      expect(result1.valid).toBe(false)

      const result2 = await engine.validate('number', '4')
      expect(result2.valid).toBe(true)
    })
  })

  describe('caching', () => {
    it('should cache validation results', async () => {
      const engine = new ValidationEngine()
      const mockValidator = vi.fn().mockReturnValue(true)

      engine.registerValidator('mock', mockValidator)

      const rule: ValidationRule = {
        id: 'mock-rule',
        type: 'mock',
        message: 'Mock validation',
      }

      engine.addRule('test', rule)

      // 第一次验证
      await engine.validate('test', 'value')
      expect(mockValidator).toHaveBeenCalledTimes(1)

      // 第二次验证相同值，应该使用缓存
      await engine.validate('test', 'value')
      expect(mockValidator).toHaveBeenCalledTimes(1)

      // 验证不同值，应该重新执行
      await engine.validate('test', 'different')
      expect(mockValidator).toHaveBeenCalledTimes(2)
    })

    it('should clear cache when rules change', async () => {
      const engine = new ValidationEngine()
      const mockValidator = vi.fn().mockReturnValue(true)

      engine.registerValidator('mock', mockValidator)

      const rule: ValidationRule = {
        id: 'mock-rule',
        type: 'mock',
        message: 'Mock validation',
      }

      engine.addRule('test', rule)
      await engine.validate('test', 'value')

      // 修改规则应该清除缓存
      engine.addRule('test', { ...rule, message: 'Updated message' })
      await engine.validate('test', 'value')

      expect(mockValidator).toHaveBeenCalledTimes(2)
    })

    it('should manually clear cache', async () => {
      const engine = new ValidationEngine()
      const mockValidator = vi.fn().mockReturnValue(true)

      engine.registerValidator('mock', mockValidator)

      const rule: ValidationRule = {
        id: 'mock-rule',
        type: 'mock',
        message: 'Mock validation',
      }

      engine.addRule('test', rule)
      await engine.validate('test', 'value')

      engine.clearCache('test')
      await engine.validate('test', 'value')

      expect(mockValidator).toHaveBeenCalledTimes(2)
    })
  })

  describe('events', () => {
    it('should emit validation events', async () => {
      const engine = new ValidationEngine()
      const eventCallback = vi.fn()

      engine.onValidation(eventCallback)

      const rule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }

      engine.addRule('name', rule)
      await engine.validate('name', '')

      expect(eventCallback).toHaveBeenCalledWith({
        key: 'name',
        result: {
          valid: false,
          errors: ['Name is required'],
          warnings: [],
        },
        context: expect.any(Object),
      })
    })
  })

  describe('error handling', () => {
    it('should handle validator errors gracefully', async () => {
      const engine = new ValidationEngine()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      const errorRule: ValidationRule = {
        id: 'error-rule',
        type: 'custom',
        message: 'This will error',
        validator: () => {
          throw new Error('Validator error')
        },
      }

      engine.addRule('test', errorRule)
      const result = await engine.validate('test', 'value')

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('验证规则执行失败')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should handle unknown validator types', async () => {
      const engine = new ValidationEngine()
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const unknownRule: ValidationRule = {
        id: 'unknown-rule',
        type: 'unknown-type' as any,
        message: 'Unknown validator',
      }

      engine.addRule('test', unknownRule)
      const result = await engine.validate('test', 'value')

      expect(result.valid).toBe(true) // 未知验证器返回true
      expect(consoleSpy).toHaveBeenCalledWith('Unknown validator type: unknown-type')

      consoleSpy.mockRestore()
    })
  })

  describe('async validation', () => {
    it('should handle async validators', async () => {
      const engine = new ValidationEngine()

      engine.registerValidator('async-test', async (value) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return value === 'valid'
      })

      const rule: ValidationRule = {
        id: 'async-rule',
        type: 'async-test',
        message: 'Async validation failed',
      }

      engine.addRule('test', rule)

      const result1 = await engine.validate('test', 'invalid')
      expect(result1.valid).toBe(false)

      const result2 = await engine.validate('test', 'valid')
      expect(result2.valid).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should destroy properly', () => {
      const engine = new ValidationEngine()
      const rule: ValidationRule = {
        id: 'test-rule',
        type: 'required',
        message: 'Required',
      }

      engine.addRule('test', rule)
      expect(engine.hasRules('test')).toBe(true)

      engine.destroy()
      expect(engine.getAllRules()).toEqual({})
    })
  })
})
