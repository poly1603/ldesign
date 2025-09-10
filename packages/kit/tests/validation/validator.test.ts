/**
 * Validator 测试
 */


import { vi } from 'vitest'
import { ValidationRules } from '../../src/validation/validation-rules'
import { Validator } from '../../src/validation/validator'

describe('validator', () => {
  let validator: Validator

  beforeEach(() => {
    validator = new Validator({
      stopOnFirstError: false,
      allowUnknownFields: true,
      stripUnknownFields: false,
    })
  })

  describe('基本验证', () => {
    it('应该验证有效数据', async () => {
      validator.addRule('name', ValidationRules.required())
      validator.addRule('email', ValidationRules.email())

      const result = await validator.validate({
        name: 'John Doe',
        email: 'john@example.com',
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测验证错�?, async () => {
      validator.addRule('name', ValidationRules.required())
      validator.addRule('email', ValidationRules.email())

      const result = await validator.validate({
        name: '',
        email: 'invalid-email',
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors[0].field).toBe('name')
      expect(result.errors[1].field).toBe('email')
    })

    it('应该支持嵌套字段验证', async () => {
      validator.addRule('user.name', ValidationRules.required())
      validator.addRule('user.email', ValidationRules.email())

      const result = await validator.validate({
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('规则管理', () => {
    it('应该添加单个规则', () => {
      const rule = ValidationRules.required()
      validator.addRule('name', rule)

      const rules = validator.getRules('name')
      expect(rules).toHaveLength(1)
      expect(rules![0]).toBe(rule)
    })

    it('应该批量添加规则', () => {
      validator.addRules({
        name: ValidationRules.required(),
        email: [ValidationRules.required(), ValidationRules.email()],
        age: ValidationRules.range(0, 120),
      })

      expect(validator.getRules('name')).toHaveLength(1)
      expect(validator.getRules('email')).toHaveLength(2)
      expect(validator.getRules('age')).toHaveLength(1)
    })

    it('应该移除规则', () => {
      const rule = ValidationRules.required()
      validator.addRule('name', rule)

      validator.removeRule('name', rule)

      expect(validator.getRules('name')).toHaveLength(0)
    })

    it('应该移除字段的所有规�?, () => {
      validator.addRule('name', ValidationRules.required())
      validator.addRule('name', ValidationRules.minLength(2))

      validator.removeRule('name')

      expect(validator.getRules('name')).toBeUndefined()
    })

    it('应该检查字段是否有规则', () => {
      expect(validator.hasRules('name')).toBe(false)

      validator.addRule('name', ValidationRules.required())

      expect(validator.hasRules('name')).toBe(true)
    })
  })

  describe('验证选项', () => {
    it('应该在第一个错误时停止', async () => {
      validator = new Validator({ stopOnFirstError: true })

      validator.addRule('name', ValidationRules.required())
      validator.addRule('name', ValidationRules.minLength(5))
      validator.addRule('email', ValidationRules.required())

      const result = await validator.validate({
        name: '',
        email: '',
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1) // 只有第一个错�?    })

    it('应该拒绝未知字段', async () => {
      validator = new Validator({ allowUnknownFields: false })

      validator.addRule('name', ValidationRules.required())

      const result = await validator.validate({
        name: 'John',
        unknownField: 'value',
      })

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.code === 'UNKNOWN_FIELD')).toBe(true)
    })

    it('应该移除未知字段', async () => {
      validator = new Validator({ stripUnknownFields: true })

      validator.addRule('name', ValidationRules.required())

      const result = await validator.validate({
        name: 'John',
        unknownField: 'value',
      })

      expect(result.valid).toBe(true)
      expect(result.data).toEqual({ name: 'John' })
      expect(result.data).not.toHaveProperty('unknownField')
    })
  })

  describe('数据转换', () => {
    it('应该应用转换�?, async () => {
      validator.addRule('name', {
        code: 'TRANSFORM',
        validator: () => true,
        transformer: value => value.trim().toLowerCase(),
      })

      const result = await validator.validate({
        name: '  JOHN DOE  ',
      })

      expect(result.valid).toBe(true)
      expect(result.data.name).toBe('john doe')
    })

    it('应该处理转换器错�?, async () => {
      validator.addRule('name', {
        code: 'TRANSFORM',
        validator: () => true,
        transformer: () => {
          throw new Error('Transform error')
        },
      })

      const result = await validator.validate({
        name: 'John',
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0].code).toBe('TRANSFORM_ERROR')
    })
  })

  describe('条件验证', () => {
    it('应该根据条件跳过验证', async () => {
      validator.addRule('confirmPassword', {
        code: 'CONFIRM',
        condition: (value, data) => !!data.password,
        validator: (value, data) => value === data.password,
      })

      // 没有密码时应该跳过确认密码验�?      const result1 = await validator.validate({
        confirmPassword: 'wrong',
      })
      expect(result1.valid).toBe(true)

      // 有密码时应该验证确认密码
      const result2 = await validator.validate({
        password: 'secret',
        confirmPassword: 'wrong',
      })
      expect(result2.valid).toBe(false)
    })
  })

  describe('异步验证', () => {
    it('应该支持异步验证�?, async () => {
      validator.addRule('username', {
        code: 'UNIQUE',
        async: true,
        validator: async (value) => {
          await global.testUtils.sleep(10)
          return value !== 'taken'
        },
      })

      const result1 = await validator.validate({ username: 'available' })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({ username: 'taken' })
      expect(result2.valid).toBe(false)
    })

    it('应该处理异步验证器错�?, async () => {
      validator.addRule('field', {
        code: 'ASYNC_ERROR',
        async: true,
        validator: async () => {
          throw new Error('Async validation error')
        },
      })

      const result = await validator.validate({ field: 'value' })

      expect(result.valid).toBe(false)
      expect(result.errors[0].code).toBe('RULE_ERROR')
    })
  })

  describe('自定义消�?, () => {
    it('应该使用自定义错误消�?, async () => {
      validator = new Validator({ enableCustomMessages: true })

      validator.addRule('name', {
        code: 'REQUIRED',
        message: 'Name is required!',
        validator: value => !!value,
      })

      const result = await validator.validate({ name: '' })

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toBe('Name is required!')
    })

    it('应该使用函数形式的自定义消息', async () => {
      validator = new Validator({ enableCustomMessages: true })

      validator.addRule('age', {
        code: 'RANGE',
        message: (field, value) => `${field} must be between 0 and 120, got ${value}`,
        validator: value => value >= 0 && value <= 120,
      })

      const result = await validator.validate({ age: 150 })

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toBe('age must be between 0 and 120, got 150')
    })
  })

  describe('复杂验证结果', () => {
    it('应该处理复杂验证结果', async () => {
      validator.addRule('field', {
        code: 'COMPLEX',
        validator: value => ({
          valid: false,
          message: 'Custom validation failed',
          code: 'CUSTOM_ERROR',
          transformedValue: value.toUpperCase(),
          warning: 'This is a warning',
        }),
      })

      const result = await validator.validate({ field: 'test' })

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toBe('Custom validation failed')
      expect(result.errors[0].code).toBe('CUSTOM_ERROR')
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].message).toBe('This is a warning')
      expect(result.data.field).toBe('TEST')
    })
  })

  describe('工具方法', () => {
    it('应该获取所有字段名', () => {
      validator.addRule('name', ValidationRules.required())
      validator.addRule('email', ValidationRules.email())
      validator.addRule('age', ValidationRules.numeric())

      const fields = validator.getFields()

      expect(fields).toContain('name')
      expect(fields).toContain('email')
      expect(fields).toContain('age')
      expect(fields).toHaveLength(3)
    })

    it('应该清空所有规�?, () => {
      validator.addRule('name', ValidationRules.required())
      validator.addRule('email', ValidationRules.email())

      validator.clear()

      expect(validator.getFields()).toHaveLength(0)
    })

    it('应该克隆验证�?, () => {
      validator.addRule('name', ValidationRules.required())
      validator.addRule('email', ValidationRules.email())

      const cloned = validator.clone()

      expect(cloned.getFields()).toEqual(validator.getFields())
      expect(cloned.getRules('name')).toHaveLength(1)
      expect(cloned.getRules('email')).toHaveLength(1)
    })

    it('应该合并验证�?, () => {
      const other = new Validator()
      other.addRule('age', ValidationRules.numeric())
      other.addRule('phone', ValidationRules.phone())

      validator.addRule('name', ValidationRules.required())
      validator.merge(other)

      expect(validator.getFields()).toContain('name')
      expect(validator.getFields()).toContain('age')
      expect(validator.getFields()).toContain('phone')
    })
  })

  describe('事件', () => {
    it('应该发出规则添加事件', () => {
      const spy = vi.fn()
      validator.on('ruleAdded', spy)

      const rule = ValidationRules.required()
      validator.addRule('name', rule)

      expect(spy).toHaveBeenCalledWith({ field: 'name', rule })
    })

    it('应该发出规则移除事件', () => {
      const spy = vi.fn()
      validator.on('ruleRemoved', spy)

      const rule = ValidationRules.required()
      validator.addRule('name', rule)
      validator.removeRule('name', rule)

      expect(spy).toHaveBeenCalledWith({ field: 'name', rule })
    })

    it('应该发出字段规则清除事件', () => {
      const spy = vi.fn()
      validator.on('fieldRulesRemoved', spy)

      validator.addRule('name', ValidationRules.required())
      validator.removeRule('name')

      expect(spy).toHaveBeenCalledWith('name')
    })

    it('应该发出规则清空事件', () => {
      const spy = vi.fn()
      validator.on('rulesCleared', spy)

      validator.addRule('name', ValidationRules.required())
      validator.clear()

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('静态方�?, () => {
    it('应该创建验证器实�?, () => {
      const instance = Validator.create({ stopOnFirstError: true })

      expect(instance).toBeInstanceOf(Validator)
    })

    it('应该创建带规则的验证�?, () => {
      const instance = Validator.createWithRules({
        name: ValidationRules.required(),
        email: [ValidationRules.required(), ValidationRules.email()],
      })

      expect(instance.hasRules('name')).toBe(true)
      expect(instance.hasRules('email')).toBe(true)
      expect(instance.getRules('email')).toHaveLength(2)
    })
  })

  describe('边界情况', () => {
    it('应该处理空数�?, async () => {
      validator.addRule('name', ValidationRules.required())

      const result = await validator.validate({})

      expect(result.valid).toBe(false)
      expect(result.errors[0].field).toBe('name')
    })

    it('应该处理null和undefined�?, async () => {
      validator.addRule('nullable', {
        code: 'NULLABLE',
        validator: value => value === null || value === undefined || typeof value === 'string',
      })

      const result1 = await validator.validate({ nullable: null })
      const result2 = await validator.validate({ nullable: undefined })
      const result3 = await validator.validate({ nullable: 'string' })

      expect(result1.valid).toBe(true)
      expect(result2.valid).toBe(true)
      expect(result3.valid).toBe(true)
    })

    it('应该处理深度嵌套的对�?, async () => {
      validator.addRule('user.profile.settings.theme', ValidationRules.oneOf(['light', 'dark']))

      const result = await validator.validate({
        user: {
          profile: {
            settings: {
              theme: 'light',
            },
          },
        },
      })

      expect(result.valid).toBe(true)
    })

    it('应该处理数组索引路径', async () => {
      validator.addRule('users.0.name', ValidationRules.required())
      validator.addRule('users.1.email', ValidationRules.email())

      const result = await validator.validate({
        users: [{ name: 'John' }, { email: 'jane@example.com' }],
      })

      expect(result.valid).toBe(true)
    })
  })
})



