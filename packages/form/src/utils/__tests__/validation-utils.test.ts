/**
 * 验证工具函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  builtinValidators,
  validateValue,
  validateFields,
  createValidationRule,
  required,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  email,
  phone,
  idCard,
  url,
  number,
  integer,
  custom,
  rules,
  when,
  asyncValidator
} from '../validation-utils'
import type { ValidationRule } from '../../types'

describe('validation-utils', () => {
  describe('builtinValidators', () => {
    describe('required', () => {
      const rule: ValidationRule = { type: 'required', message: '此字段为必填项' }

      it('空值应该验证失败', () => {
        expect(builtinValidators.required('', rule, {})).toBe('此字段为必填项')
        expect(builtinValidators.required(null, rule, {})).toBe('此字段为必填项')
        expect(builtinValidators.required(undefined, rule, {})).toBe('此字段为必填项')
      })

      it('空数组应该验证失败', () => {
        expect(builtinValidators.required([], rule, {})).toBe('请至少选择一项')
      })

      it('有效值应该验证通过', () => {
        expect(builtinValidators.required('value', rule, {})).toBe(true)
        expect(builtinValidators.required(0, rule, {})).toBe(true)
        expect(builtinValidators.required(false, rule, {})).toBe(true)
        expect(builtinValidators.required(['item'], rule, {})).toBe(true)
      })
    })

    describe('minLength', () => {
      const rule: ValidationRule = { type: 'minLength', value: 3, message: '最少需要3个字符' }

      it('长度不足应该验证失败', () => {
        expect(builtinValidators.minLength('ab', rule, {})).toBe('最少需要3个字符')
      })

      it('长度足够应该验证通过', () => {
        expect(builtinValidators.minLength('abc', rule, {})).toBe(true)
        expect(builtinValidators.minLength('abcd', rule, {})).toBe(true)
      })

      it('空值应该验证通过', () => {
        expect(builtinValidators.minLength('', rule, {})).toBe(true)
        expect(builtinValidators.minLength(null, rule, {})).toBe(true)
      })
    })

    describe('maxLength', () => {
      const rule: ValidationRule = { type: 'maxLength', value: 5, message: '最多允许5个字符' }

      it('长度超出应该验证失败', () => {
        expect(builtinValidators.maxLength('abcdef', rule, {})).toBe('最多允许5个字符')
      })

      it('长度合适应该验证通过', () => {
        expect(builtinValidators.maxLength('abc', rule, {})).toBe(true)
        expect(builtinValidators.maxLength('abcde', rule, {})).toBe(true)
      })
    })

    describe('min', () => {
      const rule: ValidationRule = { type: 'min', value: 10, message: '值不能小于10' }

      it('小于最小值应该验证失败', () => {
        expect(builtinValidators.min(5, rule, {})).toBe('值不能小于10')
        expect(builtinValidators.min('5', rule, {})).toBe('值不能小于10')
      })

      it('大于等于最小值应该验证通过', () => {
        expect(builtinValidators.min(10, rule, {})).toBe(true)
        expect(builtinValidators.min(15, rule, {})).toBe(true)
        expect(builtinValidators.min('15', rule, {})).toBe(true)
      })

      it('非数字应该验证失败', () => {
        expect(builtinValidators.min('abc', rule, {})).toBe('值不能小于10')
      })
    })

    describe('max', () => {
      const rule: ValidationRule = { type: 'max', value: 100, message: '值不能大于100' }

      it('大于最大值应该验证失败', () => {
        expect(builtinValidators.max(150, rule, {})).toBe('值不能大于100')
        expect(builtinValidators.max('150', rule, {})).toBe('值不能大于100')
      })

      it('小于等于最大值应该验证通过', () => {
        expect(builtinValidators.max(100, rule, {})).toBe(true)
        expect(builtinValidators.max(50, rule, {})).toBe(true)
      })
    })

    describe('pattern', () => {
      const rule: ValidationRule = { 
        type: 'pattern', 
        value: /^\d+$/, 
        message: '只能输入数字' 
      }

      it('不匹配模式应该验证失败', () => {
        expect(builtinValidators.pattern('abc', rule, {})).toBe('只能输入数字')
        expect(builtinValidators.pattern('123abc', rule, {})).toBe('只能输入数字')
      })

      it('匹配模式应该验证通过', () => {
        expect(builtinValidators.pattern('123', rule, {})).toBe(true)
        expect(builtinValidators.pattern('0', rule, {})).toBe(true)
      })

      it('应该支持字符串正则', () => {
        const stringRule: ValidationRule = { 
          type: 'pattern', 
          value: '^\\d+$', 
          message: '只能输入数字' 
        }
        expect(builtinValidators.pattern('123', stringRule, {})).toBe(true)
        expect(builtinValidators.pattern('abc', stringRule, {})).toBe('只能输入数字')
      })
    })

    describe('email', () => {
      const rule: ValidationRule = { type: 'email', message: '请输入有效的邮箱地址' }

      it('无效邮箱应该验证失败', () => {
        expect(builtinValidators.email('invalid', rule, {})).toBe('请输入有效的邮箱地址')
        expect(builtinValidators.email('test@', rule, {})).toBe('请输入有效的邮箱地址')
        expect(builtinValidators.email('@example.com', rule, {})).toBe('请输入有效的邮箱地址')
      })

      it('有效邮箱应该验证通过', () => {
        expect(builtinValidators.email('test@example.com', rule, {})).toBe(true)
        expect(builtinValidators.email('user.name@domain.co.uk', rule, {})).toBe(true)
      })
    })

    describe('phone', () => {
      const rule: ValidationRule = { type: 'phone', message: '请输入有效的手机号码' }

      it('无效手机号应该验证失败', () => {
        expect(builtinValidators.phone('123', rule, {})).toBe('请输入有效的手机号码')
        expect(builtinValidators.phone('12345678901', rule, {})).toBe('请输入有效的手机号码')
        expect(builtinValidators.phone('02012345678', rule, {})).toBe('请输入有效的手机号码')
      })

      it('有效手机号应该验证通过', () => {
        expect(builtinValidators.phone('13812345678', rule, {})).toBe(true)
        expect(builtinValidators.phone('15987654321', rule, {})).toBe(true)
        expect(builtinValidators.phone('18888888888', rule, {})).toBe(true)
      })
    })

    describe('url', () => {
      const rule: ValidationRule = { type: 'url', message: '请输入有效的URL地址' }

      it('无效URL应该验证失败', () => {
        expect(builtinValidators.url('invalid', rule, {})).toBe('请输入有效的URL地址')
        expect(builtinValidators.url('http://', rule, {})).toBe('请输入有效的URL地址')
      })

      it('有效URL应该验证通过', () => {
        expect(builtinValidators.url('https://example.com', rule, {})).toBe(true)
        expect(builtinValidators.url('http://localhost:3000', rule, {})).toBe(true)
        expect(builtinValidators.url('ftp://files.example.com', rule, {})).toBe(true)
      })
    })

    describe('number', () => {
      const rule: ValidationRule = { type: 'number', message: '请输入有效的数字' }

      it('非数字应该验证失败', () => {
        expect(builtinValidators.number('abc', rule, {})).toBe('请输入有效的数字')
        expect(builtinValidators.number('12abc', rule, {})).toBe('请输入有效的数字')
      })

      it('有效数字应该验证通过', () => {
        expect(builtinValidators.number('123', rule, {})).toBe(true)
        expect(builtinValidators.number('123.45', rule, {})).toBe(true)
        expect(builtinValidators.number('-123', rule, {})).toBe(true)
        expect(builtinValidators.number(123, rule, {})).toBe(true)
      })
    })

    describe('integer', () => {
      const rule: ValidationRule = { type: 'integer', message: '请输入整数' }

      it('非整数应该验证失败', () => {
        expect(builtinValidators.integer('123.45', rule, {})).toBe('请输入整数')
        expect(builtinValidators.integer('abc', rule, {})).toBe('请输入整数')
      })

      it('有效整数应该验证通过', () => {
        expect(builtinValidators.integer('123', rule, {})).toBe(true)
        expect(builtinValidators.integer('-123', rule, {})).toBe(true)
        expect(builtinValidators.integer(123, rule, {})).toBe(true)
      })
    })

    describe('custom', () => {
      it('应该调用自定义验证器', () => {
        const customRule: ValidationRule = {
          type: 'custom',
          validator: (value: any) => value === 'valid' ? true : '自定义错误'
        }

        expect(builtinValidators.custom('valid', customRule, {})).toBe(true)
        expect(builtinValidators.custom('invalid', customRule, {})).toBe('自定义错误')
      })

      it('没有验证器应该验证通过', () => {
        const rule: ValidationRule = { type: 'custom' }
        expect(builtinValidators.custom('any', rule, {})).toBe(true)
      })
    })
  })

  describe('validateValue', () => {
    it('应该正确验证单个值', () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '必填' },
        { type: 'minLength', value: 3, message: '至少3个字符' }
      ]

      const result1 = validateValue('', rules)
      expect(result1.valid).toBe(false)
      expect(result1.message).toBe('必填')

      const result2 = validateValue('ab', rules)
      expect(result2.valid).toBe(false)
      expect(result2.message).toBe('至少3个字符')

      const result3 = validateValue('abc', rules)
      expect(result3.valid).toBe(true)
    })

    it('应该在第一个错误处停止', () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '必填' },
        { type: 'email', message: '邮箱格式错误' }
      ]

      const result = validateValue('', rules)
      expect(result.valid).toBe(false)
      expect(result.message).toBe('必填') // 不会检查email规则
    })
  })

  describe('validateFields', () => {
    it('应该正确验证多个字段', () => {
      const data = {
        username: 'ab',
        email: 'invalid-email',
        age: 25
      }

      const fieldRules = {
        username: [{ type: 'minLength', value: 3, message: '用户名至少3个字符' }],
        email: [{ type: 'email', message: '邮箱格式错误' }],
        age: [{ type: 'min', value: 18, message: '年龄不能小于18' }]
      }

      const result = validateFields(data, fieldRules)
      
      expect(result.valid).toBe(false)
      expect(result.fields.username.valid).toBe(false)
      expect(result.fields.email.valid).toBe(false)
      expect(result.fields.age.valid).toBe(true)
    })
  })

  describe('验证规则创建函数', () => {
    it('required应该创建正确的规则', () => {
      const rule = required('自定义消息')
      expect(rule).toEqual({
        type: 'required',
        value: undefined,
        message: '自定义消息',
        validator: undefined
      })
    })

    it('minLength应该创建正确的规则', () => {
      const rule = minLength(5, '至少5个字符')
      expect(rule).toEqual({
        type: 'minLength',
        value: 5,
        message: '至少5个字符',
        validator: undefined
      })
    })

    it('pattern应该创建正确的规则', () => {
      const regex = /^\d+$/
      const rule = pattern(regex, '只能输入数字')
      expect(rule).toEqual({
        type: 'pattern',
        value: regex,
        message: '只能输入数字',
        validator: undefined
      })
    })

    it('custom应该创建正确的规则', () => {
      const validator = (value: any) => value === 'valid'
      const rule = custom(validator, '自定义错误')
      expect(rule).toEqual({
        type: 'custom',
        value: undefined,
        message: '自定义错误',
        validator
      })
    })
  })

  describe('rules组合函数', () => {
    it('应该正确组合多个规则', () => {
      const combinedRules = rules(
        required('必填'),
        minLength(3, '至少3个字符'),
        email('邮箱格式错误')
      )

      expect(combinedRules).toHaveLength(3)
      expect(combinedRules[0].type).toBe('required')
      expect(combinedRules[1].type).toBe('minLength')
      expect(combinedRules[2].type).toBe('email')
    })
  })

  describe('when条件验证', () => {
    it('应该根据条件应用不同规则', () => {
      const conditionalRule = when(
        (data) => data.needsValidation,
        [required('条件必填')],
        []
      )

      // 条件为true时应用规则
      const result1 = validateValue('', [conditionalRule], { needsValidation: true })
      expect(result1.valid).toBe(false)

      // 条件为false时不应用规则
      const result2 = validateValue('', [conditionalRule], { needsValidation: false })
      expect(result2.valid).toBe(true)
    })
  })

  describe('asyncValidator', () => {
    it('应该创建异步验证规则', () => {
      const asyncValidatorFn = async (value: any) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return value === 'valid'
      }

      const rule = asyncValidator(asyncValidatorFn, '异步验证失败')
      expect(rule.type).toBe('custom')
      expect(rule.validator).toBe(asyncValidatorFn)
      expect(rule.message).toBe('异步验证失败')
    })
  })
})
