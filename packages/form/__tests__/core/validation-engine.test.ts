/**
 * ValidationEngine 验证引擎测试
 * 
 * 测试验证引擎的各项功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ValidationEngine } from '../../src/core/validation-engine'
import type { ValidationRule, ValidationContext, ValidatorFunction } from '../../src/types'

describe('ValidationEngine', () => {
  let validationEngine: ValidationEngine

  beforeEach(() => {
    validationEngine = new ValidationEngine({
      enableCache: true,
      cacheTimeout: 1000
    })
  })

  describe('验证器注册', () => {
    it('应该能够注册自定义验证器', () => {
      const customValidator: ValidatorFunction = ({ value }) => ({
        valid: value === 'test',
        message: value === 'test' ? '' : 'Value must be "test"',
        field: undefined
      })

      validationEngine.registerValidator('custom', customValidator)

      const registeredValidator = validationEngine.getValidator('custom')
      expect(registeredValidator).toBe(customValidator)
    })

    it('应该能够注销验证器', () => {
      const customValidator: ValidatorFunction = ({ value }) => ({
        valid: true,
        message: '',
        field: undefined
      })

      validationEngine.registerValidator('custom', customValidator)
      expect(validationEngine.getValidator('custom')).toBe(customValidator)

      validationEngine.unregisterValidator('custom')
      expect(validationEngine.getValidator('custom')).toBeUndefined()
    })
  })

  describe('字段验证', () => {
    beforeEach(() => {
      // 注册测试验证器
      validationEngine.registerValidator('required', ({ value }) => ({
        valid: value != null && value !== '',
        message: value != null && value !== '' ? '' : 'This field is required',
        field: undefined
      }))

      validationEngine.registerValidator('minLength', ({ value, rule }) => {
        const min = rule.params?.min || 0
        const isValid = !value || String(value).length >= min
        return {
          valid: isValid,
          message: isValid ? '' : `Minimum length is ${min}`,
          field: undefined
        }
      })
    })

    it('应该能够验证单个字段', async () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: 'Name is required' }
      ]

      // 测试空值
      const result1 = await validationEngine.validateField('name', '', rules)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('Name is required')

      // 测试有效值
      const result2 = await validationEngine.validateField('name', 'John', rules)
      expect(result2.valid).toBe(true)
      expect(result2.errors).toHaveLength(0)
    })

    it('应该能够验证多个规则', async () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: 'Name is required' },
        { type: 'minLength', params: { min: 2 }, message: 'Minimum 2 characters' }
      ]

      // 测试空值（应该只显示第一个错误）
      const result1 = await validationEngine.validateField('name', '', rules)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('Name is required')

      // 测试长度不足
      const result2 = await validationEngine.validateField('name', 'J', rules)
      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('Minimum 2 characters')

      // 测试有效值
      const result3 = await validationEngine.validateField('name', 'John', rules)
      expect(result3.valid).toBe(true)
    })

    it('应该支持条件验证', async () => {
      const rules: ValidationRule[] = [
        {
          type: 'required',
          condition: (formData) => formData.enableValidation,
          message: 'This field is required when validation is enabled'
        }
      ]

      // 条件不满足时应该跳过验证
      const result1 = await validationEngine.validateField(
        'name',
        '',
        rules,
        { enableValidation: false }
      )
      expect(result1.valid).toBe(true)

      // 条件满足时应该执行验证
      const result2 = await validationEngine.validateField(
        'name',
        '',
        rules,
        { enableValidation: true }
      )
      expect(result2.valid).toBe(false)
    })
  })

  describe('表单验证', () => {
    beforeEach(() => {
      validationEngine.registerValidator('required', ({ value }) => ({
        valid: value != null && value !== '',
        message: value != null && value !== '' ? '' : 'This field is required',
        field: undefined
      }))

      validationEngine.registerValidator('email', ({ value }) => {
        if (!value) return { valid: true, message: '', field: undefined }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isValid = emailRegex.test(value)
        return {
          valid: isValid,
          message: isValid ? '' : 'Invalid email format',
          field: undefined
        }
      })
    })

    it('应该能够验证整个表单', async () => {
      const formData = {
        name: '',
        email: 'invalid-email'
      }

      const fieldRules = {
        name: [{ type: 'required', message: 'Name is required' }],
        email: [
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Invalid email format' }
        ]
      }

      const result = await validationEngine.validateForm(formData, fieldRules)

      expect(result.valid).toBe(false)
      expect(result.fieldErrors).toHaveProperty('name')
      expect(result.fieldErrors).toHaveProperty('email')
      expect(result.fieldErrors!.name).toContain('Name is required')
      expect(result.fieldErrors!.email).toContain('Invalid email format')
    })

    it('应该在所有字段都有效时返回有效结果', async () => {
      const formData = {
        name: 'John',
        email: 'john@example.com'
      }

      const fieldRules = {
        name: [{ type: 'required', message: 'Name is required' }],
        email: [
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Invalid email format' }
        ]
      }

      const result = await validationEngine.validateForm(formData, fieldRules)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('异步验证', () => {
    it('应该支持异步验证器', async () => {
      const asyncValidator: ValidatorFunction = async ({ value }) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              valid: value === 'async-test',
              message: value === 'async-test' ? '' : 'Async validation failed',
              field: undefined
            })
          }, 100)
        })
      }

      validationEngine.registerValidator('async', asyncValidator)

      const rules: ValidationRule[] = [
        { type: 'async', message: 'Async validation failed' }
      ]

      const result1 = await validationEngine.validateField('test', 'wrong-value', rules)
      expect(result1.valid).toBe(false)

      const result2 = await validationEngine.validateField('test', 'async-test', rules)
      expect(result2.valid).toBe(true)
    })
  })

  describe('验证缓存', () => {
    it('应该能够缓存验证结果', async () => {
      const mockValidator = vi.fn(({ value }) => ({
        valid: value === 'test',
        message: value === 'test' ? '' : 'Invalid value',
        field: undefined
      }))

      validationEngine.registerValidator('mock', mockValidator)

      const rules: ValidationRule[] = [
        { type: 'mock', message: 'Mock validation failed' }
      ]

      // 第一次验证
      await validationEngine.validateField('test', 'test', rules)
      expect(mockValidator).toHaveBeenCalledTimes(1)

      // 第二次验证相同的值应该使用缓存
      await validationEngine.validateField('test', 'test', rules)
      expect(mockValidator).toHaveBeenCalledTimes(1) // 不应该再次调用
    })

    it('应该能够清除验证缓存', async () => {
      const mockValidator = vi.fn(({ value }) => ({
        valid: value === 'test',
        message: value === 'test' ? '' : 'Invalid value',
        field: undefined
      }))

      validationEngine.registerValidator('mock', mockValidator)

      const rules: ValidationRule[] = [
        { type: 'mock', message: 'Mock validation failed' }
      ]

      // 第一次验证
      await validationEngine.validateField('test', 'test', rules)
      expect(mockValidator).toHaveBeenCalledTimes(1)

      // 清除缓存
      validationEngine.clearCache()

      // 再次验证应该重新执行
      await validationEngine.validateField('test', 'test', rules)
      expect(mockValidator).toHaveBeenCalledTimes(2)
    })
  })

  describe('错误处理', () => {
    it('应该处理验证器执行错误', async () => {
      const errorValidator: ValidatorFunction = () => {
        throw new Error('Validator error')
      }

      validationEngine.registerValidator('error', errorValidator)

      const rules: ValidationRule[] = [
        { type: 'error', message: 'Error validation' }
      ]

      const result = await validationEngine.validateField('test', 'value', rules)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('验证规则执行错误: Validator error')
    })

    it('应该处理未知验证器类型', async () => {
      const rules: ValidationRule[] = [
        { type: 'unknown', message: 'Unknown validator' }
      ]

      await expect(
        validationEngine.validateField('test', 'value', rules)
      ).rejects.toThrow('Unknown validator type: unknown')
    })
  })

  describe('销毁功能', () => {
    it('应该能够销毁验证引擎', () => {
      expect(() => validationEngine.destroy()).not.toThrow()

      // 销毁后应该无法操作
      expect(() => validationEngine.registerValidator('test', () => ({ valid: true, message: '', field: undefined }))).toThrow()
    })
  })

  afterEach(() => {
    if (validationEngine && !validationEngine.isDestroyed?.()) {
      validationEngine.destroy()
    }
  })
})
