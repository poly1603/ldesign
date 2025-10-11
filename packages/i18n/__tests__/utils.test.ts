/**
 * 工具函数测试
 * 测试插值、路径处理、复数化、验证等工具函数
 */

import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatNumber } from '../src/utils/formatters'
import { hasInterpolation, interpolate } from '../src/utils/interpolation'
import { flattenObject, getNestedValue, setNestedValue, unflattenObject } from '../src/utils/path'
import { getPluralRule, hasPluralExpression, processPluralization } from '../src/utils/pluralization'
import { isValidLocale, validateLanguageCode, validateTranslationKey } from '../src/utils/validation'

describe('插值工具', () => {
  describe('interpolate', () => {
    it('应该正确处理简单插值', () => {
      const result = interpolate('Hello {name}', { name: 'World' })
      expect(result).toBe('Hello World')
    })

    it('应该正确处理多个插值', () => {
      const result = interpolate('Hello {name}, you are {age} years old', {
        name: 'John',
        age: 25,
      })
      expect(result).toBe('Hello John, you are 25 years old')
    })

    it('应该正确处理嵌套对象插值', () => {
      const result = interpolate('Hello {user.name}', {
        user: { name: 'John' },
      })
      expect(result).toBe('Hello John')
    })

    it('应该在参数缺失时替换为空字符串', () => {
      const result = interpolate('Hello {name}', {})
      expect(result).toBe('Hello ')
    })

    it('应该正确转义 HTML', () => {
      const result = interpolate('Hello {name}', { name: '<script>' }, { escapeValue: true })
      expect(result).toBe('Hello &lt;script&gt;')
    })
  })

  describe('hasInterpolation', () => {
    it('应该正确检测插值表达式', () => {
      expect(hasInterpolation('Hello {name}')).toBe(true)
      expect(hasInterpolation('Hello world')).toBe(false)
      expect(hasInterpolation('Hello {user.name}')).toBe(true)
    })
  })
})

describe('路径处理工具', () => {
  const testObject = {
    user: {
      name: 'John',
      profile: {
        age: '25', // 改为字符串，因为 getNestedValue 只返回字符串
        email: 'john@example.com',
      },
    },
    items: ['item1', 'item2'],
  }

  describe('getNestedValue', () => {
    it('应该正确获取嵌套值', () => {
      expect(getNestedValue(testObject, 'user.name')).toBe('John')
      expect(getNestedValue(testObject, 'user.profile.age')).toBe('25')
      expect(getNestedValue(testObject, 'user.profile.email')).toBe('john@example.com')
    })

    it('应该在路径不存在时返回 undefined', () => {
      expect(getNestedValue(testObject, 'user.nonexistent')).toBeUndefined()
      expect(getNestedValue(testObject, 'nonexistent.path')).toBeUndefined()
    })
  })

  describe('setNestedValue', () => {
    it('应该正确设置嵌套值', () => {
      const obj = {}
      setNestedValue(obj, 'user.name', 'John')
      expect(obj).toEqual({ user: { name: 'John' } })
    })

    it('应该正确设置深层嵌套值', () => {
      const obj = {}
      setNestedValue(obj, 'user.profile.age', 25)
      expect(obj).toEqual({ user: { profile: { age: 25 } } })
    })
  })

  describe('flattenObject', () => {
    it('应该正确扁平化对象', () => {
      const nested = {
        user: {
          name: 'John',
          profile: { age: '25' },
        },
      }

      const flattened = flattenObject(nested)
      expect(flattened).toEqual({
        'user.name': 'John',
        'user.profile.age': '25',
      })
    })
  })

  describe('unflattenObject', () => {
    it('应该正确反扁平化对象', () => {
      const flattened = {
        'user.name': 'John',
        'user.profile.age': 25,
      }

      const nested = unflattenObject(flattened)
      expect(nested).toEqual({
        user: {
          name: 'John',
          profile: { age: 25 },
        },
      })
    })
  })
})

describe('复数化工具', () => {
  describe('processPluralization', () => {
    it('应该正确处理英文复数', () => {
      const template = '{count, plural, =0{no items} =1{one item} other{# items}}'

      expect(processPluralization(template, { count: 0 }, 'en')).toBe('no items')
      expect(processPluralization(template, { count: 1 }, 'en')).toBe('one item')
      expect(processPluralization(template, { count: 5 }, 'en')).toBe('5 items')
    })

    it('应该正确处理中文复数（无变化）', () => {
      const template = '{count, plural, =0{没有项目} other{# 个项目}}'

      expect(processPluralization(template, { count: 0 }, 'zh-CN')).toBe('没有项目')
      expect(processPluralization(template, { count: 1 }, 'zh-CN')).toBe('1 个项目')
      expect(processPluralization(template, { count: 5 }, 'zh-CN')).toBe('5 个项目')
    })
  })

  describe('hasPluralExpression', () => {
    it('应该正确检测复数表达式', () => {
      expect(hasPluralExpression('{count, plural, other{# items}}')).toBe(true)
      expect(hasPluralExpression('Hello world')).toBe(false)
    })
  })

  describe('getPluralRule', () => {
    it('应该返回正确的复数规则函数', () => {
      const enRule = getPluralRule('en')
      expect(enRule(1)).toBe(0) // one
      expect(enRule(2)).toBe(1) // other

      const zhRule = getPluralRule('zh-CN')
      expect(zhRule(1)).toBe(0) // 中文无复数变化
      expect(zhRule(2)).toBe(0)
    })
  })
})

describe('验证工具', () => {
  describe('validateLanguageCode', () => {
    it('应该验证有效的语言代码', () => {
      expect(validateLanguageCode('en')).toBe(true)
      expect(validateLanguageCode('zh-CN')).toBe(true)
      expect(validateLanguageCode('en-US')).toBe(true)
    })

    it('应该拒绝无效的语言代码', () => {
      expect(validateLanguageCode('')).toBe(false)
      expect(validateLanguageCode('invalid-code-format')).toBe(false)
      expect(validateLanguageCode('123')).toBe(false)
    })
  })

  describe('validateTranslationKey', () => {
    it('应该验证有效的翻译键', () => {
      expect(validateTranslationKey('hello')).toBe(true)
      expect(validateTranslationKey('user.name')).toBe(true)
      expect(validateTranslationKey('nested.deep.value')).toBe(true)
    })

    it('应该拒绝无效的翻译键', () => {
      expect(validateTranslationKey('')).toBe(false)
      expect(validateTranslationKey('.invalid')).toBe(false)
      expect(validateTranslationKey('invalid.')).toBe(false)
    })
  })

  describe('isValidLocale', () => {
    it('应该验证有效的区域设置', () => {
      expect(isValidLocale('en')).toBe(true)
      expect(isValidLocale('zh-CN')).toBe(true)
      expect(isValidLocale('en-US')).toBe(true)
    })

    it('应该拒绝无效的区域设置', () => {
      expect(isValidLocale('')).toBe(false)
      expect(isValidLocale('invalid')).toBe(false)
    })
  })
})

describe('格式化工具', () => {
  describe('formatNumber', () => {
    it('应该正确格式化数字', () => {
      const result = formatNumber(1234.56, 'en-US')
      expect(result).toBe('1,234.56')
    })

    it('应该正确格式化中文数字', () => {
      const result = formatNumber(1234.56, 'zh-CN')
      expect(result).toBe('1,234.56')
    })
  })

  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2023-12-25')
      const result = formatDate(date, 'en-US')
      expect(result).toMatch(/12\/25\/2023|Dec 25, 2023/)
    })
  })

  describe('formatCurrency', () => {
    it('应该正确格式化货币', () => {
      const result = formatCurrency(1234.56, { locale: 'en-US', currency: 'USD' })
      expect(result).toMatch(/\$1,234\.56/)
    })

    it('应该正确格式化人民币', () => {
      const result = formatCurrency(1234.56, { locale: 'zh-CN', currency: 'CNY' })
      expect(result).toMatch(/¥1,234\.56|CN¥1,234\.56/)
    })
  })
})
