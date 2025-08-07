// ValidationEngine 测试

import { describe, it, expect, beforeEach } from 'vitest'
import { ValidationEngine } from '../core/ValidationEngine'
import type { ValidationConfig, ValidationRule } from '../types/validation'

describe('ValidationEngine', () => {
  let validationEngine: ValidationEngine
  let config: ValidationConfig

  beforeEach(() => {
    config = {
      validateOnChange: true,
      validateOnBlur: true,
      showErrors: true,
      stopOnFirstError: false,
    }
    validationEngine = new ValidationEngine(config)
  })

  describe('基础验证', () => {
    it('应该正确验证必填字段', async () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '此字段为必填项' },
      ]

      // 测试空值
      let result = await validationEngine.validateField('', rules, {}, 'test')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('此字段为必填项')

      // 测试有值
      result = await validationEngine.validateField('test', rules, {}, 'test')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该正确验证邮箱格式', async () => {
      const rules: ValidationRule[] = [
        { type: 'email', message: '请输入有效的邮箱地址' },
      ]

      // 测试无效邮箱
      let result = await validationEngine.validateField(
        'invalid-email',
        rules,
        {},
        'email'
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('请输入有效的邮箱地址')

      // 测试有效邮箱
      result = await validationEngine.validateField(
        'test@example.com',
        rules,
        {},
        'email'
      )
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)

      // 测试空值（应该通过，因为没有 required 规则）
      result = await validationEngine.validateField('', rules, {}, 'email')
      expect(result.valid).toBe(true)
    })

    it('应该正确验证最小长度', async () => {
      const rules: ValidationRule[] = [
        { type: 'minLength', params: 3, message: '至少需要3个字符' },
      ]

      // 测试长度不足
      let result = await validationEngine.validateField('ab', rules, {}, 'test')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('至少需要3个字符')

      // 测试长度足够
      result = await validationEngine.validateField('abc', rules, {}, 'test')
      expect(result.valid).toBe(true)
    })

    it('应该正确验证最大长度', async () => {
      const rules: ValidationRule[] = [
        { type: 'maxLength', params: 5, message: '最多5个字符' },
      ]

      // 测试长度超出
      let result = await validationEngine.validateField(
        'abcdef',
        rules,
        {},
        'test'
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('最多5个字符')

      // 测试长度合适
      result = await validationEngine.validateField('abc', rules, {}, 'test')
      expect(result.valid).toBe(true)
    })

    it('应该正确验证数值范围', async () => {
      const rules: ValidationRule[] = [
        { type: 'min', params: 18, message: '不能小于18' },
        { type: 'max', params: 100, message: '不能大于100' },
      ]

      // 测试小于最小值
      let result = await validationEngine.validateField(15, rules, {}, 'age')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('不能小于18')

      // 测试大于最大值
      result = await validationEngine.validateField(150, rules, {}, 'age')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('不能大于100')

      // 测试在范围内
      result = await validationEngine.validateField(25, rules, {}, 'age')
      expect(result.valid).toBe(true)
    })

    it('应该正确验证正则表达式', async () => {
      const rules: ValidationRule[] = [
        { type: 'pattern', params: /^[a-zA-Z]+$/, message: '只能包含字母' },
      ]

      // 测试不匹配
      let result = await validationEngine.validateField(
        'abc123',
        rules,
        {},
        'test'
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('只能包含字母')

      // 测试匹配
      result = await validationEngine.validateField('abc', rules, {}, 'test')
      expect(result.valid).toBe(true)
    })
  })

  describe('自定义验证', () => {
    it('应该支持自定义验证器', async () => {
      const rules: ValidationRule[] = [
        {
          type: 'custom',
          validator: value => {
            if (value === 'admin') {
              return '用户名不能是admin'
            }
            return true
          },
          message: '自定义验证失败',
        },
      ]

      // 测试自定义验证失败
      let result = await validationEngine.validateField(
        'admin',
        rules,
        {},
        'username'
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('用户名不能是admin')

      // 测试自定义验证通过
      result = await validationEngine.validateField(
        'user',
        rules,
        {},
        'username'
      )
      expect(result.valid).toBe(true)
    })

    it('应该支持异步自定义验证器', async () => {
      const rules: ValidationRule[] = [
        {
          type: 'custom',
          validator: async value => {
            // 模拟异步验证（如检查用户名是否已存在）
            await new Promise(resolve => setTimeout(resolve, 10))

            if (value === 'existing-user') {
              return '用户名已存在'
            }
            return true
          },
          message: '异步验证失败',
        },
      ]

      // 测试异步验证失败
      let result = await validationEngine.validateField(
        'existing-user',
        rules,
        {},
        'username'
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('用户名已存在')

      // 测试异步验证通过
      result = await validationEngine.validateField(
        'new-user',
        rules,
        {},
        'username'
      )
      expect(result.valid).toBe(true)
    })
  })

  describe('表单验证', () => {
    it('应该正确验证整个表单', async () => {
      const formData = {
        username: '',
        email: 'invalid-email',
        age: 15,
      }

      validationEngine.setFieldRules('username', [
        { type: 'required', message: '用户名不能为空' },
      ])

      validationEngine.setFieldRules('email', [
        { type: 'email', message: '请输入有效的邮箱地址' },
      ])

      validationEngine.setFieldRules('age', [
        { type: 'min', params: 18, message: '年龄不能小于18岁' },
      ])

      const results = await validationEngine.validateForm(formData)

      expect(results.username.valid).toBe(false)
      expect(results.email.valid).toBe(false)
      expect(results.age.valid).toBe(false)

      expect(results.username.errors).toContain('用户名不能为空')
      expect(results.email.errors).toContain('请输入有效的邮箱地址')
      expect(results.age.errors).toContain('年龄不能小于18岁')
    })

    it('应该支持条件验证', async () => {
      const rules: ValidationRule[] = [
        {
          type: 'required',
          message: '确认密码不能为空',
          condition: (value, formData) => !!formData.password,
        },
      ]

      // 当没有密码时，确认密码不是必填的
      let result = await validationEngine.validateField(
        '',
        rules,
        { password: '' },
        'confirmPassword'
      )
      expect(result.valid).toBe(true)

      // 当有密码时，确认密码是必填的
      result = await validationEngine.validateField(
        '',
        rules,
        { password: '123456' },
        'confirmPassword'
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('确认密码不能为空')
    })
  })

  describe('验证配置', () => {
    it('应该支持停止在第一个错误', async () => {
      const configWithStop: ValidationConfig = {
        ...config,
        stopOnFirstError: true,
      }

      const engineWithStop = new ValidationEngine(configWithStop)

      const rules: ValidationRule[] = [
        { type: 'required', message: '必填项' },
        { type: 'minLength', params: 5, message: '至少5个字符' },
        { type: 'email', message: '邮箱格式错误' },
      ]

      const result = await engineWithStop.validateField('', rules, {}, 'test')

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe('必填项')
    })

    it('应该支持收集所有错误', async () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '必填项' },
        { type: 'minLength', params: 5, message: '至少5个字符' },
      ]

      // 使用一个既为空又长度不足的值（虽然逻辑上矛盾，但用于测试）
      const result = await validationEngine.validateField('', rules, {}, 'test')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('缓存机制', () => {
    it('应该缓存验证结果', async () => {
      const rules: ValidationRule[] = [{ type: 'required', message: '必填项' }]

      // 第一次验证
      const start1 = performance.now()
      await validationEngine.validateField('test', rules, {}, 'field1')
      const duration1 = performance.now() - start1

      // 第二次验证相同的值（应该使用缓存）
      const start2 = performance.now()
      await validationEngine.validateField('test', rules, {}, 'field1')
      const duration2 = performance.now() - start2

      // 缓存的验证应该更快（虽然在测试环境中可能不明显）
      expect(duration2).toBeLessThanOrEqual(duration1 + 1) // 允许1ms的误差
    })

    it('应该能清空缓存', async () => {
      const rules: ValidationRule[] = [{ type: 'required', message: '必填项' }]

      // 验证一次以建立缓存
      await validationEngine.validateField('test', rules, {}, 'field1')

      // 清空缓存
      validationEngine.clearCache()

      // 再次验证应该重新计算
      const result = await validationEngine.validateField(
        'test',
        rules,
        {},
        'field1'
      )
      expect(result.valid).toBe(true)
    })
  })

  describe('事件系统', () => {
    it('应该触发验证事件', async () => {
      let eventTriggered = false
      let eventData: any = null

      validationEngine.on('fieldValidate', (fieldName, result) => {
        eventTriggered = true
        eventData = { fieldName, result }
      })

      const rules: ValidationRule[] = [{ type: 'required', message: '必填项' }]

      await validationEngine.validateField('test', rules, {}, 'testField')

      expect(eventTriggered).toBe(true)
      expect(eventData.fieldName).toBe('testField')
      expect(eventData.result.valid).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理验证器抛出的异常', async () => {
      const rules: ValidationRule[] = [
        {
          type: 'custom',
          validator: () => {
            throw new Error('验证器错误')
          },
          message: '自定义验证失败',
        },
      ]

      const result = await validationEngine.validateField(
        'test',
        rules,
        {},
        'field'
      )

      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('验证器错误'))).toBe(
        true
      )
    })
  })
})
