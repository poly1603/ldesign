/**
 * @ldesign/form - Validation Rules Tests
 * 验证规则测试
 */

import { describe, it, expect } from 'vitest'
import {
  required,
  email,
  url,
  phone,
  number,
  integer,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  range,
  confirm
} from '../../utils/validation-rules'

describe('Validation Rules', () => {
  describe('required', () => {
    it('应该验证必填字段', () => {
      expect(required('test', {})).toEqual({ valid: true, message: '' })
      expect(required('', {})).toEqual({ valid: false, message: '此字段为必填项' })
      expect(required(null, {})).toEqual({ valid: false, message: '此字段为必填项' })
      expect(required(undefined, {})).toEqual({ valid: false, message: '此字段为必填项' })
    })
  })

  describe('email', () => {
    it('应该验证邮箱格式', () => {
      expect(email('test@example.com', {})).toEqual({ valid: true })
      expect(email('invalid-email', {})).toEqual({ 
        valid: false, 
        message: '请输入有效的邮箱地址' 
      })
      expect(email('', {})).toEqual({ valid: true }) // 空值通过
    })
  })

  describe('url', () => {
    it('应该验证URL格式', () => {
      expect(url('https://example.com', {})).toEqual({ valid: true })
      expect(url('invalid-url', {})).toEqual({ 
        valid: false, 
        message: '请输入有效的URL地址' 
      })
      expect(url('', {})).toEqual({ valid: true }) // 空值通过
    })
  })

  describe('phone', () => {
    it('应该验证手机号格式', () => {
      expect(phone('13800138000', {})).toEqual({ valid: true })
      expect(phone('12345678901', {})).toEqual({ 
        valid: false, 
        message: '请输入有效的手机号码' 
      })
      expect(phone('', {})).toEqual({ valid: true }) // 空值通过
    })
  })

  describe('number', () => {
    it('应该验证数字', () => {
      expect(number(123, {})).toEqual({ valid: true })
      expect(number('123.45', {})).toEqual({ valid: true })
      expect(number('abc', {})).toEqual({ 
        valid: false, 
        message: '请输入有效的数字' 
      })
    })
  })

  describe('integer', () => {
    it('应该验证整数', () => {
      expect(integer(123, {})).toEqual({ valid: true })
      expect(integer('123', {})).toEqual({ valid: true })
      expect(integer(123.45, {})).toEqual({ 
        valid: false, 
        message: '请输入有效的整数' 
      })
    })
  })

  describe('min', () => {
    it('应该验证最小值', () => {
      const validator = min(10)
      expect(validator(15, {})).toEqual({ valid: true })
      expect(validator(5, {})).toEqual({ 
        valid: false, 
        message: '值不能小于 10' 
      })
    })
  })

  describe('max', () => {
    it('应该验证最大值', () => {
      const validator = max(10)
      expect(validator(5, {})).toEqual({ valid: true })
      expect(validator(15, {})).toEqual({ 
        valid: false, 
        message: '值不能大于 10' 
      })
    })
  })

  describe('minLength', () => {
    it('应该验证最小长度', () => {
      const validator = minLength(3)
      expect(validator('test', {})).toEqual({ valid: true })
      expect(validator('ab', {})).toEqual({ 
        valid: false, 
        message: '长度不能少于 3 个字符' 
      })
    })
  })

  describe('maxLength', () => {
    it('应该验证最大长度', () => {
      const validator = maxLength(5)
      expect(validator('test', {})).toEqual({ valid: true })
      expect(validator('toolong', {})).toEqual({ 
        valid: false, 
        message: '长度不能超过 5 个字符' 
      })
    })
  })

  describe('pattern', () => {
    it('应该验证正则表达式', () => {
      const validator = pattern(/^[a-z]+$/, '只能包含小写字母')
      expect(validator('abc', {})).toEqual({ valid: true })
      expect(validator('ABC', {})).toEqual({ 
        valid: false, 
        message: '只能包含小写字母' 
      })
    })
  })

  describe('range', () => {
    it('应该验证范围', () => {
      const validator = range(1, 10)
      expect(validator(5, {})).toEqual({ valid: true })
      expect(validator(0, {})).toEqual({ 
        valid: false, 
        message: '值必须在 1 到 10 之间' 
      })
      expect(validator(15, {})).toEqual({ 
        valid: false, 
        message: '值必须在 1 到 10 之间' 
      })
    })
  })

  describe('confirm', () => {
    it('应该验证确认字段', () => {
      const validator = confirm('password')
      expect(validator('123456', { password: '123456' })).toEqual({ valid: true })
      expect(validator('123456', { password: 'different' })).toEqual({ 
        valid: false, 
        message: '两次输入不一致' 
      })
    })
  })
})



