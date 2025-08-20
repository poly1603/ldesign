import type { NestedObject } from '../src/core/types'

import { describe, expect, it } from 'vitest'
import {
  extractInterpolationKeys,
  hasInterpolation,
  interpolate,
  validateInterpolationParams,
} from '../src/utils/interpolation'
import {
  deepMerge,
  flattenObject,
  getNestedValue,
  hasNestedPath,
  setNestedValue,
  unflattenObject,
} from '../src/utils/path'
import {
  getPluralRule,
  hasPluralExpression,
  parsePluralExpression,
  processPluralization,
} from '../src/utils/pluralization'

describe('path Utils', () => {
  const createTestObject = () => ({
    level1: {
      level2: {
        value: 'nested value',
      },
      simple: 'simple value',
    },
    root: 'root value',
  })

  describe('getNestedValue', () => {
    it('应该获取嵌套值', () => {
      const testObject = createTestObject()
      expect(getNestedValue(testObject, 'level1.level2.value')).toBe(
        'nested value',
      )
      expect(getNestedValue(testObject, 'level1.simple')).toBe('simple value')
      expect(getNestedValue(testObject, 'root')).toBe('root value')
    })

    it('应该处理不存在的路径', () => {
      const testObject = createTestObject()
      expect(getNestedValue(testObject, 'nonexistent.path')).toBeUndefined()
      expect(getNestedValue(testObject, 'level1.nonexistent')).toBeUndefined()
    })

    it('应该处理空值', () => {
      const testObject = createTestObject()
      expect(
        getNestedValue(null as unknown as NestedObject, 'path'),
      ).toBeUndefined()
      expect(getNestedValue(testObject, '')).toBeUndefined()
    })
  })

  describe('setNestedValue', () => {
    it('应该设置嵌套值', () => {
      const obj = {}
      setNestedValue(obj, 'level1.level2.value', 'new value')
      expect(getNestedValue(obj, 'level1.level2.value')).toBe('new value')
    })

    it('应该覆盖现有值', () => {
      const obj = createTestObject()
      setNestedValue(obj, 'level1.simple', 'updated value')
      expect(getNestedValue(obj, 'level1.simple')).toBe('updated value')
    })
  })

  describe('hasNestedPath', () => {
    it('应该正确检查路径存在性', () => {
      const testObject = createTestObject()
      expect(hasNestedPath(testObject, 'level1.level2.value')).toBe(true)
      expect(hasNestedPath(testObject, 'root')).toBe(true)
      expect(hasNestedPath(testObject, 'nonexistent.path')).toBe(false)
    })
  })

  describe('deepMerge', () => {
    it('应该深度合并对象', () => {
      const obj1: NestedObject = { a: { b: '1', c: '2' }, d: '3' }
      const obj2: NestedObject = { a: { b: '4', e: '5' }, f: '6' }

      const result = deepMerge(obj1, obj2)

      expect(result).toEqual({
        a: { b: '4', c: '2', e: '5' },
        d: '3',
        f: '6',
      })
    })
  })

  describe('flattenObject', () => {
    it('应该扁平化对象', () => {
      const testObject = createTestObject()
      const result = flattenObject(testObject)

      expect(result).toEqual({
        'level1.level2.value': 'nested value',
        'level1.simple': 'simple value',
        'root': 'root value',
      })
    })
  })

  describe('unflattenObject', () => {
    it('应该重建嵌套对象', () => {
      const flattened = {
        'level1.level2.value': 'nested value',
        'level1.simple': 'simple value',
        'root': 'root value',
      }

      const result = unflattenObject(flattened)
      const expected = createTestObject()

      expect(result).toEqual(expected)
    })
  })
})

describe('interpolation Utils', () => {
  describe('interpolate', () => {
    it('应该正确插值', () => {
      expect(interpolate('Hello {{name}}!', { name: 'John' })).toBe(
        'Hello John!',
      )
      expect(
        interpolate('{{greeting}} {{name}}!', { greeting: 'Hi', name: 'Jane' }),
      ).toBe('Hi Jane!')
    })

    it('应该处理缺失的参数', () => {
      expect(interpolate('Hello {{name}}!', {})).toBe('Hello !')
    })

    it('应该支持嵌套属性', () => {
      expect(
        interpolate('Hello {{user.name}}!', { user: { name: 'John' } }),
      ).toBe('Hello John!')
    })

    it('应该转义HTML', () => {
      expect(
        interpolate('Content: {{content}}', {
          content: '<script>alert("xss")</script>',
        }),
      ).toBe(
        'Content: &lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
      )
    })

    it('应该支持禁用转义', () => {
      expect(
        interpolate(
          'Content: {{content}}',
          { content: '<strong>Bold</strong>' },
          { escapeValue: false },
        ),
      ).toBe('Content: <strong>Bold</strong>')
    })
  })

  describe('hasInterpolation', () => {
    it('应该正确检测插值标记', () => {
      expect(hasInterpolation('Hello {{name}}!')).toBe(true)
      expect(hasInterpolation('Hello world!')).toBe(false)
      expect(hasInterpolation('{{greeting}} {{name}}!')).toBe(true)
    })
  })

  describe('extractInterpolationKeys', () => {
    it('应该提取插值键', () => {
      expect(extractInterpolationKeys('Hello {{name}}!')).toEqual(['name'])
      expect(extractInterpolationKeys('{{greeting}} {{name}}!')).toEqual([
        'greeting',
        'name',
      ])
      expect(
        extractInterpolationKeys('{{user.name}} is {{user.age}} years old'),
      ).toEqual(['user.name', 'user.age'])
    })
  })

  describe('validateInterpolationParams', () => {
    it('应该验证插值参数', () => {
      const result1 = validateInterpolationParams('Hello {{name}}!', {
        name: 'John',
      })
      expect(result1.valid).toBe(true)
      expect(result1.missingKeys).toEqual([])

      const result2 = validateInterpolationParams('Hello {{name}}!', {})
      expect(result2.valid).toBe(false)
      expect(result2.missingKeys).toEqual(['name'])
    })
  })
})

describe('pluralization Utils', () => {
  describe('getPluralRule', () => {
    it('应该返回正确的复数规则', () => {
      const enRule = getPluralRule('en')
      expect(enRule(1)).toBe(0) // singular
      expect(enRule(2)).toBe(1) // plural

      const zhRule = getPluralRule('zh-CN')
      expect(zhRule(1)).toBe(0) // no plural in Chinese
      expect(zhRule(2)).toBe(0)
    })
  })

  describe('hasPluralExpression', () => {
    it('应该正确检测复数表达式', () => {
      expect(
        hasPluralExpression('{count, plural, =0{no items} other{# items}}'),
      ).toBe(true)
      expect(hasPluralExpression('Simple text')).toBe(false)
      expect(hasPluralExpression('Hello {{name}}')).toBe(false)
    })
  })

  describe('parsePluralExpression', () => {
    it('应该解析复数表达式', () => {
      const expression
        = '{count, plural, =0{no items} =1{one item} other{# items}}'

      expect(parsePluralExpression(expression, { count: 0 }, 'en')).toBe(
        'no items',
      )
      expect(parsePluralExpression(expression, { count: 1 }, 'en')).toBe(
        'one item',
      )
      expect(parsePluralExpression(expression, { count: 5 }, 'en')).toBe(
        '5 items',
      )
    })

    it('应该处理不同语言的复数规则', () => {
      const expression = '{count, plural, other{# items}}'

      expect(parsePluralExpression(expression, { count: 1 }, 'zh-CN')).toBe(
        '1 items',
      )
      expect(parsePluralExpression(expression, { count: 5 }, 'zh-CN')).toBe(
        '5 items',
      )
    })
  })

  describe('processPluralization', () => {
    it('应该处理包含复数的文本', () => {
      const text
        = 'You have {count, plural, =0{no items} =1{one item} other{# items}} in your cart.'

      expect(processPluralization(text, { count: 0 }, 'en')).toBe(
        'You have no items in your cart.',
      )
      expect(processPluralization(text, { count: 1 }, 'en')).toBe(
        'You have one item in your cart.',
      )
      expect(processPluralization(text, { count: 3 }, 'en')).toBe(
        'You have 3 items in your cart.',
      )
    })

    it('应该处理没有复数的文本', () => {
      const text = 'Simple text without pluralization'
      expect(processPluralization(text, {}, 'en')).toBe(text)
    })
  })
})
