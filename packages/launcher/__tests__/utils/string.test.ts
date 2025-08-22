/**
 * StringUtils 单元测试
 * 测试字符串处理工具类的所有功能
 */

import { describe, expect, it } from 'vitest'
import { StringUtils } from '@/utils/string'

describe('StringUtils', () => {
  describe('toCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(StringUtils.toCamelCase('hello-world')).toBe('helloWorld')
      expect(StringUtils.toCamelCase('my-project-name')).toBe('myProjectName')
    })

    it('should convert snake_case to camelCase', () => {
      expect(StringUtils.toCamelCase('user_name')).toBe('userName')
      expect(StringUtils.toCamelCase('file_system_utils')).toBe('fileSystemUtils')
    })

    it('should handle mixed separators', () => {
      expect(StringUtils.toCamelCase('hello-world_test case')).toBe('helloWorldTestCase')
    })

    it('should handle empty string', () => {
      expect(StringUtils.toCamelCase('')).toBe('')
    })

    it('should handle single word', () => {
      expect(StringUtils.toCamelCase('hello')).toBe('hello')
    })

    it('should handle already camelCase string', () => {
      expect(StringUtils.toCamelCase('alreadyCamelCase')).toBe('alreadyCamelCase')
    })
  })

  describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(StringUtils.toKebabCase('helloWorld')).toBe('hello-world')
      expect(StringUtils.toKebabCase('myProjectName')).toBe('my-project-name')
    })

    it('should convert PascalCase to kebab-case', () => {
      expect(StringUtils.toKebabCase('HelloWorld')).toBe('hello-world')
      expect(StringUtils.toKebabCase('MyProjectName')).toBe('my-project-name')
    })

    it('should handle spaces and underscores', () => {
      expect(StringUtils.toKebabCase('hello world')).toBe('hello-world')
      expect(StringUtils.toKebabCase('user_name')).toBe('user-name')
    })

    it('should handle empty string', () => {
      expect(StringUtils.toKebabCase('')).toBe('')
    })

    it('should handle single word', () => {
      expect(StringUtils.toKebabCase('hello')).toBe('hello')
    })
  })

  describe('toPascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      expect(StringUtils.toPascalCase('hello-world')).toBe('HelloWorld')
      expect(StringUtils.toPascalCase('my-project')).toBe('MyProject')
    })

    it('should convert camelCase to PascalCase', () => {
      expect(StringUtils.toPascalCase('helloWorld')).toBe('HelloWorld')
      expect(StringUtils.toPascalCase('userName')).toBe('UserName')
    })

    it('should handle empty string', () => {
      expect(StringUtils.toPascalCase('')).toBe('')
    })

    it('should handle single word', () => {
      expect(StringUtils.toPascalCase('hello')).toBe('Hello')
    })
  })

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(StringUtils.toSnakeCase('helloWorld')).toBe('hello_world')
      expect(StringUtils.toSnakeCase('myProjectName')).toBe('my_project_name')
    })

    it('should convert PascalCase to snake_case', () => {
      expect(StringUtils.toSnakeCase('HelloWorld')).toBe('hello_world')
      expect(StringUtils.toSnakeCase('UserName')).toBe('user_name')
    })

    it('should handle kebab-case', () => {
      expect(StringUtils.toSnakeCase('hello-world')).toBe('hello_world')
      expect(StringUtils.toSnakeCase('my-project')).toBe('my_project')
    })

    it('should handle spaces', () => {
      expect(StringUtils.toSnakeCase('hello world')).toBe('hello_world')
    })

    it('should handle empty string', () => {
      expect(StringUtils.toSnakeCase('')).toBe('')
    })
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(StringUtils.formatBytes(0)).toBe('0 Bytes')
      expect(StringUtils.formatBytes(1024)).toBe('1.00 KB')
      expect(StringUtils.formatBytes(1536)).toBe('1.50 KB')
      expect(StringUtils.formatBytes(1048576)).toBe('1.00 MB')
      expect(StringUtils.formatBytes(1073741824)).toBe('1.00 GB')
    })

    it('should respect decimal places', () => {
      expect(StringUtils.formatBytes(1536, 1)).toBe('1.5 KB')
      expect(StringUtils.formatBytes(1536, 0)).toBe('2 KB')
      expect(StringUtils.formatBytes(1536, 3)).toBe('1.500 KB')
    })

    it('should handle negative decimals', () => {
      expect(StringUtils.formatBytes(1536, -1)).toBe('2 KB')
    })
  })

  describe('formatTime', () => {
    it('should format milliseconds', () => {
      expect(StringUtils.formatTime(500)).toBe('500ms')
      expect(StringUtils.formatTime(999)).toBe('999ms')
    })

    it('should format seconds', () => {
      expect(StringUtils.formatTime(1000)).toBe('1.0s')
      expect(StringUtils.formatTime(1500)).toBe('1.5s')
      expect(StringUtils.formatTime(59000)).toBe('59.0s')
    })

    it('should format minutes', () => {
      expect(StringUtils.formatTime(60000)).toBe('1.0m')
      expect(StringUtils.formatTime(90000)).toBe('1.5m')
      expect(StringUtils.formatTime(3540000)).toBe('59.0m')
    })

    it('should format hours', () => {
      expect(StringUtils.formatTime(3600000)).toBe('1.0h')
      expect(StringUtils.formatTime(5400000)).toBe('1.5h')
    })
  })

  describe('randomString', () => {
    it('should generate string of correct length', () => {
      expect(StringUtils.randomString(8)).toHaveLength(8)
      expect(StringUtils.randomString(16)).toHaveLength(16)
      expect(StringUtils.randomString(0)).toHaveLength(0)
    })

    it('should use custom charset', () => {
      const result = StringUtils.randomString(10, '0123456789')
      expect(/^\d+$/.test(result)).toBe(true)
      expect(result).toHaveLength(10)
    })

    it('should generate different strings', () => {
      const str1 = StringUtils.randomString(20)
      const str2 = StringUtils.randomString(20)
      expect(str1).not.toBe(str2)
    })

    it('should use default length', () => {
      expect(StringUtils.randomString()).toHaveLength(8)
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(StringUtils.truncate('Hello World!', 8)).toBe('Hello...')
      expect(StringUtils.truncate('Very long text here', 10)).toBe('Very lo...')
    })

    it('should not truncate short strings', () => {
      expect(StringUtils.truncate('Short', 10)).toBe('Short')
      expect(StringUtils.truncate('Hello', 5)).toBe('Hello')
    })

    it('should use custom suffix', () => {
      expect(StringUtils.truncate('Long text here', 8, ' (more)')).toBe('L (more)')
      expect(StringUtils.truncate('Hello World', 8, '…')).toBe('Hello W…')
    })

    it('should handle edge cases', () => {
      expect(StringUtils.truncate('Hello', 2)).toBe('..')
      expect(StringUtils.truncate('', 5)).toBe('')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello')
      expect(StringUtils.capitalize('world')).toBe('World')
    })

    it('should not change already capitalized strings', () => {
      expect(StringUtils.capitalize('Hello')).toBe('Hello')
      expect(StringUtils.capitalize('WORLD')).toBe('WORLD')
    })

    it('should handle empty string', () => {
      expect(StringUtils.capitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(StringUtils.capitalize('a')).toBe('A')
      expect(StringUtils.capitalize('A')).toBe('A')
    })
  })

  describe('trim', () => {
    it('should trim whitespace by default', () => {
      expect(StringUtils.trim('  hello  ')).toBe('hello')
      expect(StringUtils.trim('\t\n hello \r\n')).toBe('hello')
    })

    it('should trim custom characters', () => {
      expect(StringUtils.trim('--hello--', '-')).toBe('hello')
      expect(StringUtils.trim('___test___', '_')).toBe('test')
    })

    it('should handle multiple custom characters', () => {
      expect(StringUtils.trim('.-+hello+--.', '.-+')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(StringUtils.trim('')).toBe('')
      expect(StringUtils.trim('', '-')).toBe('')
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(StringUtils.isEmpty('')).toBe(true)
      expect(StringUtils.isEmpty('   ')).toBe(true)
      expect(StringUtils.isEmpty('\t\n\r')).toBe(true)
    })

    it('should return true for null and undefined', () => {
      expect(StringUtils.isEmpty(null)).toBe(true)
      expect(StringUtils.isEmpty(undefined)).toBe(true)
    })

    it('should return false for non-empty strings', () => {
      expect(StringUtils.isEmpty('hello')).toBe(false)
      expect(StringUtils.isEmpty('0')).toBe(false)
      expect(StringUtils.isEmpty(' a ')).toBe(false)
    })
  })

  describe('reverse', () => {
    it('should reverse strings correctly', () => {
      expect(StringUtils.reverse('hello')).toBe('olleh')
      expect(StringUtils.reverse('12345')).toBe('54321')
      expect(StringUtils.reverse('a')).toBe('a')
    })

    it('should handle empty string', () => {
      expect(StringUtils.reverse('')).toBe('')
    })

    it('should handle palindromes', () => {
      expect(StringUtils.reverse('level')).toBe('level')
      expect(StringUtils.reverse('racecar')).toBe('racecar')
    })
  })

  describe('repeat', () => {
    it('should repeat strings correctly', () => {
      expect(StringUtils.repeat('abc', 3)).toBe('abcabcabc')
      expect(StringUtils.repeat('x', 5)).toBe('xxxxx')
      expect(StringUtils.repeat('hello', 1)).toBe('hello')
    })

    it('should handle zero repetitions', () => {
      expect(StringUtils.repeat('test', 0)).toBe('')
    })

    it('should handle negative repetitions', () => {
      expect(StringUtils.repeat('test', -1)).toBe('')
      expect(StringUtils.repeat('test', -5)).toBe('')
    })

    it('should handle empty string', () => {
      expect(StringUtils.repeat('', 5)).toBe('')
    })
  })

  describe('template', () => {
    it('should replace template variables', () => {
      const template = 'Hello {{name}}, you have {{count}} messages'
      const values = { name: 'Alice', count: 5 }
      const result = StringUtils.template(template, values)
      
      expect(result).toBe('Hello Alice, you have 5 messages')
    })

    it('should handle missing variables', () => {
      const template = 'Hello {{name}}, your age is {{age}}'
      const values = { name: 'Bob' }
      const result = StringUtils.template(template, values)
      
      expect(result).toBe('Hello Bob, your age is {{age}}')
    })

    it('should handle empty template', () => {
      expect(StringUtils.template('', { name: 'test' })).toBe('')
    })

    it('should handle template without variables', () => {
      expect(StringUtils.template('Hello World', { name: 'test' })).toBe('Hello World')
    })

    it('should handle numeric values', () => {
      const template = 'Price: ${{price}}'
      const values = { price: 19.99 }
      const result = StringUtils.template(template, values)
      
      expect(result).toBe('Price: $19.99')
    })
  })

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(StringUtils.slugify('Hello World!')).toBe('hello-world')
      expect(StringUtils.slugify('My Awesome Project')).toBe('my-awesome-project')
    })

    it('should handle special characters', () => {
      expect(StringUtils.slugify('Vue.js & React')).toBe('vue-js-react')
      expect(StringUtils.slugify('C++ Programming')).toBe('c-programming')
    })

    it('should handle multiple spaces and separators', () => {
      expect(StringUtils.slugify('  Hello   World  ')).toBe('hello-world')
      expect(StringUtils.slugify('test--slug___here')).toBe('test-slug-here')
    })

    it('should handle numbers', () => {
      expect(StringUtils.slugify('Version 2.0')).toBe('version-2-0')
      expect(StringUtils.slugify('Top 10 Tips')).toBe('top-10-tips')
    })

    it('should handle empty string', () => {
      expect(StringUtils.slugify('')).toBe('')
    })

    it('should handle only special characters', () => {
      expect(StringUtils.slugify('!@#$%^&*()')).toBe('')
    })

    it('should handle unicode characters', () => {
      expect(StringUtils.slugify('Café & 餐厅')).toBe('caf')
    })
  })
})