/**
 * @ldesign/form 验证引擎测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ValidationEngine } from '../../../src/core/validation/engine'
import type { FieldConfig, ValidationRule } from '../../../src/types/core'

describe('ValidationEngine', () => {
  let engine: ValidationEngine

  beforeEach(() => {
    engine = new ValidationEngine()
  })

  describe('基础验证规则', () => {
    it('应该正确验证必填字段', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{ type: 'required', message: '此字段为必填项' }]
      }

      // 空值应该验证失败
      const result1 = await engine.validateField('test', '', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('此字段为必填项')

      // 有值应该验证成功
      const result2 = await engine.validateField('test', 'value', {}, fieldConfig)
      expect(result2.valid).toBe(true)
      expect(result2.errors).toHaveLength(0)
    })

    it('应该正确验证最小值', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'number',
        rules: [{ type: 'min', value: 10, message: '值不能小于10' }]
      }

      const result1 = await engine.validateField('test', 5, {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('值不能小于10')

      const result2 = await engine.validateField('test', 15, {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证最大值', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'number',
        rules: [{ type: 'max', value: 100, message: '值不能大于100' }]
      }

      const result1 = await engine.validateField('test', 150, {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('值不能大于100')

      const result2 = await engine.validateField('test', 50, {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证最小长度', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{ type: 'minLength', value: 5, message: '长度不能少于5个字符' }]
      }

      const result1 = await engine.validateField('test', 'abc', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('长度不能少于5个字符')

      const result2 = await engine.validateField('test', 'abcdef', {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证最大长度', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{ type: 'maxLength', value: 10, message: '长度不能超过10个字符' }]
      }

      const result1 = await engine.validateField('test', 'abcdefghijk', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('长度不能超过10个字符')

      const result2 = await engine.validateField('test', 'abcde', {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证正则表达式', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{ type: 'pattern', value: /^\d+$/, message: '只能输入数字' }]
      }

      const result1 = await engine.validateField('test', 'abc123', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('只能输入数字')

      const result2 = await engine.validateField('test', '123456', {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证邮箱格式', async () => {
      const fieldConfig: FieldConfig = {
        name: 'email',
        type: 'email',
        rules: [{ type: 'email', message: '邮箱格式不正确' }]
      }

      const result1 = await engine.validateField('email', 'invalid-email', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('邮箱格式不正确')

      const result2 = await engine.validateField('email', 'test@example.com', {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证URL格式', async () => {
      const fieldConfig: FieldConfig = {
        name: 'url',
        type: 'url',
        rules: [{ type: 'url', message: 'URL格式不正确' }]
      }

      const result1 = await engine.validateField('url', 'invalid-url', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('URL格式不正确')

      const result2 = await engine.validateField('url', 'https://example.com', {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })
  })

  describe('自定义验证', () => {
    it('应该支持自定义验证器', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{
          type: 'custom',
          validator: (value) => value === 'valid',
          message: '值必须为"valid"'
        }]
      }

      const result1 = await engine.validateField('test', 'invalid', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('值必须为"valid"')

      const result2 = await engine.validateField('test', 'valid', {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })

    it('应该支持异步自定义验证器', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{
          type: 'custom',
          validator: async (value) => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return value === 'async-valid'
          },
          message: '异步验证失败'
        }]
      }

      const result1 = await engine.validateField('test', 'invalid', {}, fieldConfig)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('异步验证失败')

      const result2 = await engine.validateField('test', 'async-valid', {}, fieldConfig)
      expect(result2.valid).toBe(true)
    })
  })

  describe('异步验证器', () => {
    it('应该支持注册和使用异步验证器', async () => {
      const asyncValidator = {
        name: 'unique-check',
        validate: vi.fn().mockResolvedValue(true)
      }

      engine.registerAsyncValidator(asyncValidator)

      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{
          type: 'async',
          asyncValidator: 'unique-check',
          message: '值不唯一'
        }]
      }

      const result = await engine.validateField('test', 'test-value', {}, fieldConfig)
      expect(result.valid).toBe(true)
      expect(asyncValidator.validate).toHaveBeenCalled()
    })

    it('应该处理异步验证器超时', async () => {
      const asyncValidator = {
        name: 'timeout-test',
        validate: () => new Promise(() => { }), // 永不resolve
        timeout: 100
      }

      engine.registerAsyncValidator(asyncValidator)

      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{
          type: 'async',
          asyncValidator: 'timeout-test',
          timeout: 50,
          message: '验证超时'
        }]
      }

      const result = await engine.validateField('test', 'test-value', {}, fieldConfig)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('验证超时')
    })
  })

  describe('条件验证', () => {
    it('应该支持条件验证', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{
          type: 'required',
          condition: (formValues) => formValues.enableRequired === true,
          message: '此字段为必填项'
        }]
      }

      // 条件不满足时，不应该验证
      const result1 = await engine.validateField('test', '', { enableRequired: false }, fieldConfig)
      expect(result1.valid).toBe(true)

      // 清除缓存以确保重新验证
      engine.clearCache()

      // 条件满足时，应该验证
      const result2 = await engine.validateField('test', '', { enableRequired: true }, fieldConfig)
      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('此字段为必填项')
    })
  })

  describe('验证优先级', () => {
    it('应该按优先级顺序执行验证', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [
          { type: 'maxLength', value: 5, priority: 2, message: '长度不能超过5' },
          { type: 'required', priority: 1, message: '此字段为必填项' },
          { type: 'minLength', value: 3, priority: 3, message: '长度不能少于3' }
        ]
      }

      const result = await engine.validateField('test', '', {}, fieldConfig)
      expect(result.valid).toBe(false)
      // 应该先执行优先级最高的规则（required）
      expect(result.errors[0]).toBe('此字段为必填项')
    })
  })

  describe('缓存机制', () => {
    it('应该缓存验证结果', async () => {
      const validator = vi.fn().mockResolvedValue(true)
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{
          type: 'custom',
          validator,
          message: '验证失败'
        }]
      }

      // 第一次验证
      await engine.validateField('test', 'value', {}, fieldConfig)
      expect(validator).toHaveBeenCalledTimes(1)

      // 第二次验证相同值，应该使用缓存
      await engine.validateField('test', 'value', {}, fieldConfig)
      expect(validator).toHaveBeenCalledTimes(1)

      // 验证不同值，应该重新执行
      await engine.validateField('test', 'different-value', {}, fieldConfig)
      expect(validator).toHaveBeenCalledTimes(2)
    })

    it('应该能清除缓存', async () => {
      const validator = vi.fn().mockResolvedValue(true)
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [{
          type: 'custom',
          validator,
          message: '验证失败'
        }]
      }

      await engine.validateField('test', 'value', {}, fieldConfig)
      expect(validator).toHaveBeenCalledTimes(1)

      engine.clearCache()

      await engine.validateField('test', 'value', {}, fieldConfig)
      expect(validator).toHaveBeenCalledTimes(2)
    })
  })

  describe('警告级别验证', () => {
    it('应该支持警告级别的验证规则', async () => {
      const fieldConfig: FieldConfig = {
        name: 'test',
        type: 'input',
        rules: [
          { type: 'required', message: '此字段为必填项' },
          { type: 'minLength', value: 10, level: 'warning', message: '建议长度至少10个字符' }
        ]
      }

      const result = await engine.validateField('test', 'short', {}, fieldConfig)
      expect(result.valid).toBe(true) // 只有警告，验证仍然通过
      expect(result.warnings).toContain('建议长度至少10个字符')
    })
  })
})
