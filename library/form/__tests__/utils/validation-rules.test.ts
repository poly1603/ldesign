/**
 * 验证规则测试
 * 
 * 测试内置验证规则的各项功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { describe, it, expect } from 'vitest'
import {
  required,
  email,
  url,
  phone,
  pattern,
  minLength,
  maxLength,
  length,
  min,
  max,
  range,
  integer,
  number,
  positive,
  enumValidator,
  custom
} from '../../src/utils/validation-rules'
import type { ValidationContext } from '../../src/types'

// 创建测试上下文的辅助函数
function createContext(value: any, formData: Record<string, any> = {}): ValidationContext {
  return {
    field: 'test',
    value,
    rule: { type: 'test' },
    formData,
    allValues: formData
  }
}

describe('验证规则', () => {
  describe('required - 必填验证', () => {
    const validator = required()

    it('应该验证非空值为有效', async () => {
      const result = await validator(createContext('test'))
      expect(result.valid).toBe(true)
    })

    it('应该验证空字符串为无效', async () => {
      const result = await validator(createContext(''))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('此字段为必填项')
    })

    it('应该验证null为无效', async () => {
      const result = await validator(createContext(null))
      expect(result.valid).toBe(false)
    })

    it('应该验证undefined为无效', async () => {
      const result = await validator(createContext(undefined))
      expect(result.valid).toBe(false)
    })

    it('应该支持自定义错误消息', async () => {
      const customValidator = required('请输入内容')
      const result = await customValidator(createContext(''))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('请输入内容')
    })
  })

  describe('email - 邮箱验证', () => {
    const validator = email()

    it('应该验证有效邮箱', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]

      for (const email of validEmails) {
        const result = await validator(createContext(email))
        expect(result.valid).toBe(true)
      }
    })

    it('应该验证无效邮箱', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com'
      ]

      for (const email of invalidEmails) {
        const result = await validator(createContext(email))
        expect(result.valid).toBe(false)
        expect(result.message).toBe('请输入有效的邮箱地址')
      }
    })

    it('应该允许空值', async () => {
      const result = await validator(createContext(''))
      expect(result.valid).toBe(true)
    })
  })

  describe('url - URL验证', () => {
    const validator = url()

    it('应该验证有效URL', async () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://sub.domain.com/path?query=1'
      ]

      for (const url of validUrls) {
        const result = await validator(createContext(url))
        expect(result.valid).toBe(true)
      }
    })

    it('应该验证无效URL', async () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://invalid',
        'just-text'
      ]

      for (const url of invalidUrls) {
        const result = await validator(createContext(url))
        expect(result.valid).toBe(false)
        expect(result.message).toBe('请输入有效的URL地址')
      }
    })
  })

  describe('phone - 手机号验证', () => {
    const validator = phone()

    it('应该验证有效手机号', async () => {
      const validPhones = [
        '13812345678',
        '15987654321',
        '18612345678'
      ]

      for (const phone of validPhones) {
        const result = await validator(createContext(phone))
        expect(result.valid).toBe(true)
      }
    })

    it('应该验证无效手机号', async () => {
      const invalidPhones = [
        '12345678901',
        '1381234567',
        '21812345678'
      ]

      for (const phone of invalidPhones) {
        const result = await validator(createContext(phone))
        expect(result.valid).toBe(false)
        expect(result.message).toBe('请输入有效的手机号码')
      }
    })
  })

  describe('pattern - 正则验证', () => {
    it('应该验证匹配的模式', async () => {
      const validator = pattern(/^\d{4}$/)

      const result1 = await validator(createContext('1234'))
      expect(result1.valid).toBe(true)

      const result2 = await validator(createContext('12345'))
      expect(result2.valid).toBe(false)
    })
  })

  describe('minLength - 最小长度验证', () => {
    const validator = minLength(3)

    it('应该验证长度足够的字符串', async () => {
      const result = await validator(createContext('test'))
      expect(result.valid).toBe(true)
    })

    it('应该验证长度不足的字符串', async () => {
      const result = await validator(createContext('ab'))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('长度不能少于 3 个字符')
    })
  })

  describe('maxLength - 最大长度验证', () => {
    const validator = maxLength(5)

    it('应该验证长度合适的字符串', async () => {
      const result = await validator(createContext('test'))
      expect(result.valid).toBe(true)
    })

    it('应该验证长度超出的字符串', async () => {
      const result = await validator(createContext('toolong'))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('长度不能超过 5 个字符')
    })
  })

  describe('length - 长度范围验证', () => {
    const validator = length(3, 8)

    it('应该验证长度在范围内的字符串', async () => {
      const result = await validator(createContext('test'))
      expect(result.valid).toBe(true)
    })

    it('应该验证长度超出范围的字符串', async () => {
      const result1 = await validator(createContext('ab'))
      expect(result1.valid).toBe(false)

      const result2 = await validator(createContext('toolongstring'))
      expect(result2.valid).toBe(false)
    })
  })

  describe('min - 最小值验证', () => {
    const validator = min(10)

    it('应该验证大于等于最小值的数字', async () => {
      const result = await validator(createContext(15))
      expect(result.valid).toBe(true)
    })

    it('应该验证小于最小值的数字', async () => {
      const result = await validator(createContext(5))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('值不能小于 10')
    })

    it('应该验证非数字值', async () => {
      const result = await validator(createContext('not-a-number'))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('请输入数字')
    })
  })

  describe('max - 最大值验证', () => {
    const validator = max(100)

    it('应该验证小于等于最大值的数字', async () => {
      const result = await validator(createContext(50))
      expect(result.valid).toBe(true)
    })

    it('应该验证大于最大值的数字', async () => {
      const result = await validator(createContext(150))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('值不能大于 100')
    })
  })

  describe('range - 数值范围验证', () => {
    const validator = range(10, 100)

    it('应该验证在范围内的数字', async () => {
      const result = await validator(createContext(50))
      expect(result.valid).toBe(true)
    })

    it('应该验证超出范围的数字', async () => {
      const result1 = await validator(createContext(5))
      expect(result1.valid).toBe(false)

      const result2 = await validator(createContext(150))
      expect(result2.valid).toBe(false)
    })
  })

  describe('integer - 整数验证', () => {
    const validator = integer()

    it('应该验证整数', async () => {
      const result = await validator(createContext(42))
      expect(result.valid).toBe(true)
    })

    it('应该验证小数', async () => {
      const result = await validator(createContext(3.14))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('请输入整数')
    })
  })

  describe('number - 数字验证', () => {
    const validator = number()

    it('应该验证有效数字', async () => {
      const validNumbers = [42, 3.14, '123', '45.67']

      for (const num of validNumbers) {
        const result = await validator(createContext(num))
        expect(result.valid).toBe(true)
      }
    })

    it('应该验证无效数字', async () => {
      const invalidNumbers = ['not-a-number', 'abc', Infinity, NaN]

      for (const num of invalidNumbers) {
        const result = await validator(createContext(num))
        expect(result.valid).toBe(false)
      }
    })
  })

  describe('positive - 正数验证', () => {
    const validator = positive()

    it('应该验证正数', async () => {
      const result = await validator(createContext(5))
      expect(result.valid).toBe(true)
    })

    it('应该验证负数和零', async () => {
      const result1 = await validator(createContext(-5))
      expect(result1.valid).toBe(false)

      const result2 = await validator(createContext(0))
      expect(result2.valid).toBe(false)
    })
  })

  describe('enumValidator - 枚举验证', () => {
    const validator = enumValidator(['red', 'green', 'blue'])

    it('应该验证有效的枚举值', async () => {
      const result = await validator(createContext('red'))
      expect(result.valid).toBe(true)
    })

    it('应该验证无效的枚举值', async () => {
      const result = await validator(createContext('yellow'))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('请选择有效的选项')
    })
  })

  describe('custom - 自定义验证', () => {
    it('应该支持同步自定义验证', async () => {
      const validator = custom((value) => value === 'test')

      const result1 = await validator(createContext('test'))
      expect(result1.valid).toBe(true)

      const result2 = await validator(createContext('other'))
      expect(result2.valid).toBe(false)
    })

    it('应该支持返回错误消息的自定义验证', async () => {
      const validator = custom((value) => {
        return value === 'test' ? true : '值必须是 "test"'
      })

      const result = await validator(createContext('other'))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('值必须是 "test"')
    })

    it('应该支持异步自定义验证', async () => {
      const validator = custom(async (value) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(value === 'async-test')
          }, 10)
        })
      })

      const result1 = await validator(createContext('async-test'))
      expect(result1.valid).toBe(true)

      const result2 = await validator(createContext('other'))
      expect(result2.valid).toBe(false)
    })

    it('应该处理自定义验证器抛出的错误', async () => {
      const validator = custom(() => {
        throw new Error('Custom error')
      })

      const result = await validator(createContext('test'))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Custom error')
    })
  })
})
