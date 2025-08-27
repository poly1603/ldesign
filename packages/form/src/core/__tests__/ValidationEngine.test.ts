/**
 * ValidationEngine 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ValidationEngine } from '../ValidationEngine'
import { EventBus } from '../EventBus'
import type { ValidationRule } from '../../types'

describe('ValidationEngine', () => {
  let validationEngine: ValidationEngine
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
    validationEngine = new ValidationEngine(eventBus)
  })

  describe('初始化', () => {
    it('应该正确创建ValidationEngine实例', () => {
      expect(validationEngine).toBeInstanceOf(ValidationEngine)
    })

    it('应该包含内置验证器', () => {
      const validators = validationEngine.getValidators()
      expect(validators).toHaveProperty('required')
      expect(validators).toHaveProperty('minLength')
      expect(validators).toHaveProperty('maxLength')
      expect(validators).toHaveProperty('email')
      expect(validators).toHaveProperty('pattern')
    })
  })

  describe('验证器管理', () => {
    it('应该正确注册自定义验证器', () => {
      const customValidator = {
        name: 'custom',
        validator: (value: any) => value === 'valid',
        description: '自定义验证器'
      }

      validationEngine.registerValidator(customValidator)
      
      const validators = validationEngine.getValidators()
      expect(validators).toHaveProperty('custom')
    })

    it('应该正确注销验证器', () => {
      const customValidator = {
        name: 'custom',
        validator: (value: any) => value === 'valid',
        description: '自定义验证器'
      }

      validationEngine.registerValidator(customValidator)
      validationEngine.unregisterValidator('custom')
      
      const validators = validationEngine.getValidators()
      expect(validators).not.toHaveProperty('custom')
    })

    it('重复注册验证器应该覆盖原有验证器', () => {
      const validator1 = {
        name: 'test',
        validator: () => true,
        description: '测试验证器1'
      }
      const validator2 = {
        name: 'test',
        validator: () => false,
        description: '测试验证器2'
      }

      validationEngine.registerValidator(validator1)
      validationEngine.registerValidator(validator2)
      
      const validators = validationEngine.getValidators()
      expect(validators.test.description).toBe('测试验证器2')
    })
  })

  describe('字段验证', () => {
    it('应该正确验证必填字段', async () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '此字段为必填项' }
      ]

      const result1 = await validationEngine.validateField('test', '', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('此字段为必填项')

      const result2 = await validationEngine.validateField('test', 'value', rules, {})
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证最小长度', async () => {
      const rules: ValidationRule[] = [
        { type: 'minLength', value: 3, message: '最少需要3个字符' }
      ]

      const result1 = await validationEngine.validateField('test', 'ab', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('最少需要3个字符')

      const result2 = await validationEngine.validateField('test', 'abc', rules, {})
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证最大长度', async () => {
      const rules: ValidationRule[] = [
        { type: 'maxLength', value: 5, message: '最多允许5个字符' }
      ]

      const result1 = await validationEngine.validateField('test', 'abcdef', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('最多允许5个字符')

      const result2 = await validationEngine.validateField('test', 'abc', rules, {})
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证邮箱格式', async () => {
      const rules: ValidationRule[] = [
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]

      const result1 = await validationEngine.validateField('test', 'invalid-email', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('请输入有效的邮箱地址')

      const result2 = await validationEngine.validateField('test', 'test@example.com', rules, {})
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证正则表达式', async () => {
      const rules: ValidationRule[] = [
        { type: 'pattern', value: /^\d+$/, message: '只能输入数字' }
      ]

      const result1 = await validationEngine.validateField('test', 'abc123', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('只能输入数字')

      const result2 = await validationEngine.validateField('test', '123', rules, {})
      expect(result2.valid).toBe(true)
    })

    it('应该正确验证自定义验证器', async () => {
      const customValidator = {
        name: 'custom',
        validator: (value: any) => value === 'valid' ? true : '值必须为valid',
        description: '自定义验证器'
      }

      validationEngine.registerValidator(customValidator)

      const rules: ValidationRule[] = [
        { type: 'custom' }
      ]

      const result1 = await validationEngine.validateField('test', 'invalid', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('值必须为valid')

      const result2 = await validationEngine.validateField('test', 'valid', rules, {})
      expect(result2.valid).toBe(true)
    })

    it('应该按顺序执行多个验证规则', async () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '此字段为必填项' },
        { type: 'minLength', value: 3, message: '最少需要3个字符' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]

      // 空值应该在required规则失败
      const result1 = await validationEngine.validateField('test', '', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('此字段为必填项')

      // 短值应该在minLength规则失败
      const result2 = await validationEngine.validateField('test', 'ab', rules, {})
      expect(result2.valid).toBe(false)
      expect(result2.message).toBe('最少需要3个字符')

      // 无效邮箱应该在email规则失败
      const result3 = await validationEngine.validateField('test', 'abc', rules, {})
      expect(result3.valid).toBe(false)
      expect(result3.message).toBe('请输入有效的邮箱地址')

      // 有效邮箱应该通过所有验证
      const result4 = await validationEngine.validateField('test', 'test@example.com', rules, {})
      expect(result4.valid).toBe(true)
    })

    it('空值应该跳过非必填验证', async () => {
      const rules: ValidationRule[] = [
        { type: 'minLength', value: 3, message: '最少需要3个字符' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]

      const result = await validationEngine.validateField('test', '', rules, {})
      expect(result.valid).toBe(true)
    })
  })

  describe('表单验证', () => {
    it('应该正确验证整个表单', async () => {
      const formData = {
        username: 'ab',
        email: 'invalid-email',
        age: 25
      }

      const fieldRules = {
        username: [
          { type: 'required', message: '用户名不能为空' },
          { type: 'minLength', value: 3, message: '用户名至少3个字符' }
        ],
        email: [
          { type: 'email', message: '请输入有效的邮箱地址' }
        ],
        age: [
          { type: 'min', value: 18, message: '年龄不能小于18岁' }
        ]
      }

      const result = await validationEngine.validateForm(formData, fieldRules)
      
      expect(result.valid).toBe(false)
      expect(result.fields).toBeDefined()
      expect(result.fields!.username.valid).toBe(false)
      expect(result.fields!.email.valid).toBe(false)
      expect(result.fields!.age.valid).toBe(true)
    })

    it('有效表单数据应该通过验证', async () => {
      const formData = {
        username: 'testuser',
        email: 'test@example.com',
        age: 25
      }

      const fieldRules = {
        username: [
          { type: 'required', message: '用户名不能为空' },
          { type: 'minLength', value: 3, message: '用户名至少3个字符' }
        ],
        email: [
          { type: 'email', message: '请输入有效的邮箱地址' }
        ],
        age: [
          { type: 'min', value: 18, message: '年龄不能小于18岁' }
        ]
      }

      const result = await validationEngine.validateForm(formData, fieldRules)
      
      expect(result.valid).toBe(true)
      expect(result.fields!.username.valid).toBe(true)
      expect(result.fields!.email.valid).toBe(true)
      expect(result.fields!.age.valid).toBe(true)
    })
  })

  describe('异步验证', () => {
    it('应该正确处理异步验证器', async () => {
      const asyncValidator = {
        name: 'async',
        validator: async (value: any) => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return value === 'async-valid' ? true : '异步验证失败'
        },
        description: '异步验证器'
      }

      validationEngine.registerValidator(asyncValidator)

      const rules: ValidationRule[] = [
        { type: 'async' }
      ]

      const result1 = await validationEngine.validateField('test', 'invalid', rules, {})
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('异步验证失败')

      const result2 = await validationEngine.validateField('test', 'async-valid', rules, {})
      expect(result2.valid).toBe(true)
    })

    it('应该正确处理异步验证超时', async () => {
      const slowValidator = {
        name: 'slow',
        validator: async () => {
          await new Promise(resolve => setTimeout(resolve, 6000)) // 超过5秒超时
          return true
        },
        description: '慢验证器'
      }

      validationEngine.registerValidator(slowValidator)

      const rules: ValidationRule[] = [
        { type: 'slow' }
      ]

      const result = await validationEngine.validateField('test', 'value', rules, {})
      expect(result.valid).toBe(false)
      expect(result.message).toContain('验证超时')
    })
  })

  describe('验证缓存', () => {
    it('应该正确缓存验证结果', async () => {
      const expensiveValidator = {
        name: 'expensive',
        validator: vi.fn().mockReturnValue(true),
        description: '昂贵的验证器'
      }

      validationEngine.registerValidator(expensiveValidator)

      const rules: ValidationRule[] = [
        { type: 'expensive' }
      ]

      // 第一次验证
      await validationEngine.validateField('test', 'value', rules, {})
      expect(expensiveValidator.validator).toHaveBeenCalledTimes(1)

      // 第二次验证相同值应该使用缓存
      await validationEngine.validateField('test', 'value', rules, {})
      expect(expensiveValidator.validator).toHaveBeenCalledTimes(1)

      // 验证不同值应该重新执行
      await validationEngine.validateField('test', 'different', rules, {})
      expect(expensiveValidator.validator).toHaveBeenCalledTimes(2)
    })

    it('应该正确清除验证缓存', async () => {
      const validator = vi.fn().mockReturnValue(true)
      const expensiveValidator = {
        name: 'expensive',
        validator,
        description: '昂贵的验证器'
      }

      validationEngine.registerValidator(expensiveValidator)

      const rules: ValidationRule[] = [
        { type: 'expensive' }
      ]

      // 验证并缓存
      await validationEngine.validateField('test', 'value', rules, {})
      expect(validator).toHaveBeenCalledTimes(1)

      // 清除缓存
      validationEngine.clearCache()

      // 再次验证应该重新执行
      await validationEngine.validateField('test', 'value', rules, {})
      expect(validator).toHaveBeenCalledTimes(2)
    })
  })

  describe('事件触发', () => {
    it('验证开始应该触发事件', async () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      const rules: ValidationRule[] = [
        { type: 'required' }
      ]

      await validationEngine.validateField('test', 'value', rules, {})
      
      expect(eventSpy).toHaveBeenCalledWith('validation:start', expect.any(Object))
    })

    it('验证完成应该触发事件', async () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      const rules: ValidationRule[] = [
        { type: 'required' }
      ]

      await validationEngine.validateField('test', 'value', rules, {})
      
      expect(eventSpy).toHaveBeenCalledWith('validation:complete', expect.any(Object))
    })

    it('验证错误应该触发事件', async () => {
      const errorValidator = {
        name: 'error',
        validator: () => { throw new Error('验证器错误') },
        description: '错误验证器'
      }

      validationEngine.registerValidator(errorValidator)

      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      const rules: ValidationRule[] = [
        { type: 'error' }
      ]

      await validationEngine.validateField('test', 'value', rules, {})
      
      expect(eventSpy).toHaveBeenCalledWith('validation:error', expect.any(Object))
    })
  })
})
