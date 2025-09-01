/**
 * 数据验证工具测试
 */

import { describe, expect, it } from 'vitest'
import {
  Validator,
  ValidationError,
  validateKey,
  validateValue,
  validateTTL,
  validateEngine,
  validateSetOptions,
  validateSetInput
} from '../../src/utils/validator'

describe('Validator', () => {
  describe('validateKey', () => {
    it('应该接受有效的字符串键', () => {
      expect(() => Validator.validateKey('valid-key')).not.toThrow()
      expect(() => Validator.validateKey('user:123')).not.toThrow()
      expect(() => Validator.validateKey('cache_item')).not.toThrow()
    })

    it('应该拒绝非字符串键', () => {
      expect(() => Validator.validateKey(123)).toThrow(ValidationError)
      expect(() => Validator.validateKey(null)).toThrow(ValidationError)
      expect(() => Validator.validateKey(undefined)).toThrow(ValidationError)
      expect(() => Validator.validateKey({})).toThrow(ValidationError)
    })

    it('应该拒绝空字符串键', () => {
      expect(() => Validator.validateKey('')).toThrow(ValidationError)
      expect(() => Validator.validateKey('   ')).toThrow(ValidationError)
    })

    it('应该拒绝过长的键', () => {
      const longKey = 'a'.repeat(251)
      expect(() => Validator.validateKey(longKey)).toThrow(ValidationError)
    })

    it('应该拒绝包含控制字符的键', () => {
      expect(() => Validator.validateKey('key\x00')).toThrow(ValidationError)
      expect(() => Validator.validateKey('key\x1f')).toThrow(ValidationError)
      expect(() => Validator.validateKey('key\x7f')).toThrow(ValidationError)
    })
  })

  describe('validateValue', () => {
    it('应该接受有效的值', () => {
      expect(() => Validator.validateValue('string')).not.toThrow()
      expect(() => Validator.validateValue(123)).not.toThrow()
      expect(() => Validator.validateValue(true)).not.toThrow()
      expect(() => Validator.validateValue({ key: 'value' })).not.toThrow()
      expect(() => Validator.validateValue([1, 2, 3])).not.toThrow()
      expect(() => Validator.validateValue(null)).not.toThrow()
    })

    it('应该拒绝undefined值', () => {
      expect(() => Validator.validateValue(undefined)).toThrow(ValidationError)
    })

    it('应该处理循环引用对象', () => {
      const circular: any = { name: 'test' }
      circular.self = circular

      // 应该发出警告但不抛出错误
      expect(() => Validator.validateValue(circular)).not.toThrow()
    })

    it('应该拒绝不可序列化的值', () => {
      // 创建一个真正不可序列化的值（包含BigInt）
      const unserializable = { bigint: BigInt(123) }
      expect(() => Validator.validateValue(unserializable)).toThrow(ValidationError)
    })
  })

  describe('validateTTL', () => {
    it('应该接受有效的TTL值', () => {
      expect(() => Validator.validateTTL(1000)).not.toThrow()
      expect(() => Validator.validateTTL(0)).not.toThrow()
      expect(() => Validator.validateTTL(3600000)).not.toThrow()
    })

    it('应该接受undefined TTL', () => {
      expect(() => Validator.validateTTL(undefined)).not.toThrow()
    })

    it('应该拒绝非数字TTL', () => {
      expect(() => Validator.validateTTL('1000')).toThrow(ValidationError)
      expect(() => Validator.validateTTL(null)).toThrow(ValidationError)
      expect(() => Validator.validateTTL({})).toThrow(ValidationError)
    })

    it('应该拒绝负数TTL', () => {
      expect(() => Validator.validateTTL(-1)).toThrow(ValidationError)
      expect(() => Validator.validateTTL(-1000)).toThrow(ValidationError)
    })

    it('应该拒绝无限大TTL', () => {
      expect(() => Validator.validateTTL(Infinity)).toThrow(ValidationError)
      expect(() => Validator.validateTTL(-Infinity)).toThrow(ValidationError)
      expect(() => Validator.validateTTL(NaN)).toThrow(ValidationError)
    })
  })

  describe('validateEngine', () => {
    it('应该接受有效的存储引擎', () => {
      expect(() => Validator.validateEngine('localStorage')).not.toThrow()
      expect(() => Validator.validateEngine('sessionStorage')).not.toThrow()
      expect(() => Validator.validateEngine('cookie')).not.toThrow()
      expect(() => Validator.validateEngine('indexedDB')).not.toThrow()
      expect(() => Validator.validateEngine('memory')).not.toThrow()
    })

    it('应该接受undefined引擎', () => {
      expect(() => Validator.validateEngine(undefined)).not.toThrow()
    })

    it('应该拒绝无效的存储引擎', () => {
      expect(() => Validator.validateEngine('invalid')).toThrow(ValidationError)
      expect(() => Validator.validateEngine('redis')).toThrow(ValidationError)
      expect(() => Validator.validateEngine(123)).toThrow(ValidationError)
    })
  })

  describe('validateSetOptions', () => {
    it('应该接受有效的选项', () => {
      expect(() => Validator.validateSetOptions({
        ttl: 1000,
        engine: 'localStorage',
        encrypt: true,
        obfuscateKey: false
      })).not.toThrow()
    })

    it('应该接受undefined选项', () => {
      expect(() => Validator.validateSetOptions(undefined)).not.toThrow()
    })

    it('应该拒绝非对象选项', () => {
      expect(() => Validator.validateSetOptions('invalid')).toThrow(ValidationError)
      expect(() => Validator.validateSetOptions(123)).toThrow(ValidationError)
      expect(() => Validator.validateSetOptions(null)).toThrow(ValidationError)
    })

    it('应该验证选项中的各个字段', () => {
      expect(() => Validator.validateSetOptions({ ttl: -1 })).toThrow(ValidationError)
      expect(() => Validator.validateSetOptions({ engine: 'invalid' })).toThrow(ValidationError)
      expect(() => Validator.validateSetOptions({ encrypt: 'true' })).toThrow(ValidationError)
      expect(() => Validator.validateSetOptions({ obfuscateKey: 1 })).toThrow(ValidationError)
    })
  })

  describe('validateSetInput', () => {
    it('应该验证完整的输入', () => {
      expect(() => Validator.validateSetInput('key', 'value', { ttl: 1000 })).not.toThrow()
    })

    it('应该在任何参数无效时抛出错误', () => {
      expect(() => Validator.validateSetInput('', 'value')).toThrow(ValidationError)
      expect(() => Validator.validateSetInput('key', undefined)).toThrow(ValidationError)
      expect(() => Validator.validateSetInput('key', 'value', { ttl: -1 })).toThrow(ValidationError)
    })
  })

  describe('createValidator', () => {
    it('应该创建自定义验证器', () => {
      const rules = [
        {
          validate: (value: string) => value.length > 0,
          message: 'Value must not be empty'
        },
        {
          validate: (value: string) => value.includes('@'),
          message: 'Value must contain @'
        }
      ]

      const validator = Validator.createValidator(rules)

      expect(() => validator('test@example.com')).not.toThrow()
      expect(() => validator('')).toThrow(ValidationError)
      expect(() => validator('test')).toThrow(ValidationError)
    })
  })

  describe('预定义规则', () => {
    it('nonEmptyString规则应该工作', () => {
      const rule = Validator.rules.nonEmptyString

      expect(rule.validate('test')).toBe(true)
      expect(rule.validate('')).toBe(false)
      expect(rule.validate('   ')).toBe(false)
      expect(rule.validate(123)).toBe(false)
    })

    it('positiveInteger规则应该工作', () => {
      const rule = Validator.rules.positiveInteger

      expect(rule.validate(1)).toBe(true)
      expect(rule.validate(100)).toBe(true)
      expect(rule.validate(0)).toBe(false)
      expect(rule.validate(-1)).toBe(false)
      expect(rule.validate(1.5)).toBe(false)
      expect(rule.validate('1')).toBe(false)
    })

    it('nonNegativeNumber规则应该工作', () => {
      const rule = Validator.rules.nonNegativeNumber

      expect(rule.validate(0)).toBe(true)
      expect(rule.validate(1)).toBe(true)
      expect(rule.validate(1.5)).toBe(true)
      expect(rule.validate(-1)).toBe(false)
      expect(rule.validate(Infinity)).toBe(false)
      expect(rule.validate('1')).toBe(false)
    })

    it('boolean规则应该工作', () => {
      const rule = Validator.rules.boolean

      expect(rule.validate(true)).toBe(true)
      expect(rule.validate(false)).toBe(true)
      expect(rule.validate(1)).toBe(false)
      expect(rule.validate('true')).toBe(false)
    })

    it('object规则应该工作', () => {
      const rule = Validator.rules.object

      expect(rule.validate({})).toBe(true)
      expect(rule.validate({ key: 'value' })).toBe(true)
      expect(rule.validate(null)).toBe(false)
      expect(rule.validate('object')).toBe(false)
    })

    it('array规则应该工作', () => {
      const rule = Validator.rules.array

      expect(rule.validate([])).toBe(true)
      expect(rule.validate([1, 2, 3])).toBe(true)
      expect(rule.validate({})).toBe(false)
      expect(rule.validate('array')).toBe(false)
    })
  })

  describe('快捷函数', () => {
    it('所有快捷函数应该工作', () => {
      expect(() => validateKey('test')).not.toThrow()
      expect(() => validateValue('test')).not.toThrow()
      expect(() => validateTTL(1000)).not.toThrow()
      expect(() => validateEngine('memory')).not.toThrow()
      expect(() => validateSetOptions({})).not.toThrow()
      expect(() => validateSetInput('key', 'value')).not.toThrow()
    })
  })
})
