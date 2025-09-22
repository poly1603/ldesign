/**
 * 字符串工具函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  capitalize,
  truncate,
  stripHtml,
  escapeHtml,
  unescapeHtml,
  randomString,
  interpolate,
} from '../string'
import { isValidEmail, isValidUrl } from '../validate'
import { formatFileSize } from '../format'

describe('字符串工具函数', () => {
  describe('toCamelCase', () => {
    it('应该将短横线分隔的字符串转换为驼峰命名', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld')
      expect(toCamelCase('my-component-name')).toBe('myComponentName')
    })

    it('应该将下划线分隔的字符串转换为驼峰命名', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld')
      expect(toCamelCase('my_component_name')).toBe('myComponentName')
    })

    it('应该将空格分隔的字符串转换为驼峰命名', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld')
      expect(toCamelCase('my component name')).toBe('myComponentName')
    })

    it('应该处理已经是驼峰命名的字符串', () => {
      expect(toCamelCase('helloWorld')).toBe('helloWorld')
    })

    it('应该处理空字符串', () => {
      expect(toCamelCase('')).toBe('')
    })
  })

  describe('toPascalCase', () => {
    it('应该将字符串转换为帕斯卡命名', () => {
      expect(toPascalCase('hello-world')).toBe('HelloWorld')
      expect(toPascalCase('my_component')).toBe('MyComponent')
      expect(toPascalCase('hello world')).toBe('HelloWorld')
    })

    it('应该处理已经是帕斯卡命名的字符串', () => {
      expect(toPascalCase('HelloWorld')).toBe('HelloWorld')
    })
  })

  describe('toKebabCase', () => {
    it('应该将驼峰命名转换为短横线命名', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world')
      expect(toKebabCase('myComponentName')).toBe('my-component-name')
    })

    it('应该将帕斯卡命名转换为短横线命名', () => {
      expect(toKebabCase('HelloWorld')).toBe('hello-world')
      expect(toKebabCase('MyComponentName')).toBe('my-component-name')
    })

    it('应该处理空格和下划线', () => {
      expect(toKebabCase('hello world')).toBe('hello-world')
      expect(toKebabCase('hello_world')).toBe('hello-world')
    })
  })

  describe('toSnakeCase', () => {
    it('应该将驼峰命名转换为下划线命名', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world')
      expect(toSnakeCase('myComponentName')).toBe('my_component_name')
    })

    it('应该将帕斯卡命名转换为下划线命名', () => {
      expect(toSnakeCase('HelloWorld')).toBe('hello_world')
    })

    it('应该处理空格和短横线', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world')
      expect(toSnakeCase('hello-world')).toBe('hello_world')
    })
  })

  describe('capitalize', () => {
    it('应该首字母大写', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('world')).toBe('World')
    })

    it('应该处理全大写字符串', () => {
      expect(capitalize('HELLO')).toBe('Hello')
    })

    it('应该处理空字符串', () => {
      expect(capitalize('')).toBe('')
    })

    it('应该处理单个字符', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('truncate', () => {
    it('应该截断长字符串', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
      expect(truncate('This is a long string', 10)).toBe('This is...')
    })

    it('应该使用自定义后缀', () => {
      expect(truncate('Hello World', 8, '***')).toBe('Hello***')
    })

    it('不应该截断短字符串', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('应该处理空字符串', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('stripHtml', () => {
    it('应该移除 HTML 标签', () => {
      expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test')
    })

    it('应该处理自闭合标签', () => {
      expect(stripHtml('Hello <br/> World')).toBe('Hello  World')
    })

    it('应该处理没有 HTML 标签的字符串', () => {
      expect(stripHtml('Hello World')).toBe('Hello World')
    })
  })

  describe('escapeHtml', () => {
    it('应该转义 HTML 特殊字符', () => {
      expect(escapeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
      expect(escapeHtml("It's a test")).toBe('It&#39;s a test')
    })

    it('应该处理没有特殊字符的字符串', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World')
    })
  })

  describe('unescapeHtml', () => {
    it('应该反转义 HTML 特殊字符', () => {
      expect(unescapeHtml('&lt;div&gt;Hello&lt;/div&gt;')).toBe('<div>Hello</div>')
      expect(unescapeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry')
      expect(unescapeHtml('It&#39;s a test')).toBe("It's a test")
    })

    it('应该处理没有转义字符的字符串', () => {
      expect(unescapeHtml('Hello World')).toBe('Hello World')
    })
  })

  describe('randomString', () => {
    it('应该生成指定长度的随机字符串', () => {
      const result = randomString(8)
      expect(result).toHaveLength(8)
      expect(typeof result).toBe('string')
    })

    it('应该使用自定义字符集', () => {
      const result = randomString(6, 'ABCDEF0123456789')
      expect(result).toHaveLength(6)
      expect(/^[ABCDEF0123456789]+$/.test(result)).toBe(true)
    })

    it('应该生成不同的随机字符串', () => {
      const result1 = randomString(10)
      const result2 = randomString(10)
      expect(result1).not.toBe(result2)
    })
  })

  describe('isValidEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.email@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('应该验证有效的 URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
    })

    it('应该拒绝无效的 URL', () => {
      expect(isValidUrl('invalid-url')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('应该格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(1048576)).toBe('1.00 MB')
      expect(formatFileSize(1073741824)).toBe('1.00 GB')
    })

    it('应该支持自定义小数位数', () => {
      expect(formatFileSize(1073741824, { decimals: 1 })).toBe('1.0 GB')
      expect(formatFileSize(1536, { decimals: 0 })).toBe('2 KB')
    })
  })

  describe('interpolate', () => {
    it('应该替换模板中的变量', () => {
      const template = 'Hello {{name}}, you have {{count}} messages'
      const data = { name: 'John', count: 5 }
      expect(interpolate(template, data)).toBe('Hello John, you have 5 messages')
    })

    it('应该保留未找到的变量', () => {
      const template = 'Hello {{name}}, {{unknown}} variable'
      const data = { name: 'John' }
      expect(interpolate(template, data)).toBe('Hello John, {{unknown}} variable')
    })

    it('应该处理没有变量的模板', () => {
      const template = 'Hello World'
      const data = { name: 'John' }
      expect(interpolate(template, data)).toBe('Hello World')
    })
  })
})
