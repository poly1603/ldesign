/**
 * StringUtils 测试
 */

import { vi } from 'vitest'
import { StringUtils } from '../../src/utils/string-utils'

describe('stringUtils', () => {
  describe('camelCase', () => {
    it('应该将连字符分隔的字符串转换为驼峰命名', () => {
      expect(StringUtils.camelCase('hello-world')).toBe('helloWorld')
      expect(StringUtils.camelCase('foo-bar-baz')).toBe('fooBarBaz')
    })

    it('应该将下划线分隔的字符串转换为驼峰命名', () => {
      expect(StringUtils.camelCase('hello_world')).toBe('helloWorld')
      expect(StringUtils.camelCase('foo_bar_baz')).toBe('fooBarBaz')
    })

    it('应该处理空格分隔的字符串', () => {
      expect(StringUtils.camelCase('hello world')).toBe('helloWorld')
      expect(StringUtils.camelCase('foo bar baz')).toBe('fooBarBaz')
    })

    it('应该处理已经是驼峰命名的字符串', () => {
      expect(StringUtils.camelCase('helloWorld')).toBe('helloWorld')
      expect(StringUtils.camelCase('fooBarBaz')).toBe('fooBarBaz')
    })

    it('应该处理空字符串', () => {
      expect(StringUtils.camelCase('')).toBe('')
    })
  })

  describe('pascalCase', () => {
    it('应该将字符串转换为帕斯卡命名', () => {
      expect(StringUtils.pascalCase('hello-world')).toBe('HelloWorld')
      expect(StringUtils.pascalCase('foo_bar_baz')).toBe('FooBarBaz')
      expect(StringUtils.pascalCase('hello world')).toBe('HelloWorld')
    })
  })

  describe('kebabCase', () => {
    it('应该将驼峰命名转换为连字符分隔', () => {
      expect(StringUtils.kebabCase('helloWorld')).toBe('hello-world')
      expect(StringUtils.kebabCase('fooBarBaz')).toBe('foo-bar-baz')
    })

    it('应该将帕斯卡命名转换为连字符分隔', () => {
      expect(StringUtils.kebabCase('HelloWorld')).toBe('hello-world')
      expect(StringUtils.kebabCase('FooBarBaz')).toBe('foo-bar-baz')
    })

    it('应该处理下划线分隔的字符串', () => {
      expect(StringUtils.kebabCase('hello_world')).toBe('hello-world')
    })
  })

  describe('snakeCase', () => {
    it('应该将驼峰命名转换为下划线分隔', () => {
      expect(StringUtils.snakeCase('helloWorld')).toBe('hello_world')
      expect(StringUtils.snakeCase('fooBarBaz')).toBe('foo_bar_baz')
    })

    it('应该将连字符分隔转换为下划线分隔', () => {
      expect(StringUtils.snakeCase('hello-world')).toBe('hello_world')
    })
  })

  describe('capitalize', () => {
    it('应该将首字母大写', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello')
      expect(StringUtils.capitalize('world')).toBe('World')
    })

    it('应该处理空字符串', () => {
      expect(StringUtils.capitalize('')).toBe('')
    })

    it('应该只将第一个字母大写', () => {
      expect(StringUtils.capitalize('hello world')).toBe('Hello world')
    })
  })

  describe('truncate', () => {
    it('应该截断长字符串', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(StringUtils.truncate(longText, 20)).toBe('This is a very lo...')
    })

    it('应该不截断短字符串', () => {
      const shortText = 'Short text'
      expect(StringUtils.truncate(shortText, 20)).toBe('Short text')
    })

    it('应该使用自定义省略符', () => {
      const text = 'This is a long text'
      expect(StringUtils.truncate(text, 10, '---')).toBe('This is---')
    })

    it('应该处理边界情况', () => {
      expect(StringUtils.truncate('', 10)).toBe('')
      expect(StringUtils.truncate('Hello', 0)).toBe('...')
    })
  })

  describe('slugify', () => {
    it('应该创建URL友好的slug', () => {
      expect(StringUtils.slugify('Hello World')).toBe('hello-world')
      expect(StringUtils.slugify('This is a Test!')).toBe('this-is-a-test')
    })

    it('应该处理特殊字符', () => {
      expect(StringUtils.slugify('Hello & World @ 2024')).toBe('hello-world-2024')
      expect(StringUtils.slugify('Test/Path\\Name')).toBe('test-path-name')
    })

    it('应该处理中文字符', () => {
      expect(StringUtils.slugify('你好世界')).toBe('你好世界')
      expect(StringUtils.slugify('测试 文章 标题')).toBe('测试-文章-标题')
    })

    it('应该移除多余的连字符', () => {
      expect(StringUtils.slugify('Hello   World')).toBe('hello-world')
      expect(StringUtils.slugify('--Test--')).toBe('test')
    })
  })

  describe('padStart', () => {
    it('应该在字符串开头填充', () => {
      expect(StringUtils.padStart('5', 3, '0')).toBe('005')
      expect(StringUtils.padStart('hello', 10, '*')).toBe('*****hello')
    })

    it('应该不填充已经足够长的字符串', () => {
      expect(StringUtils.padStart('hello', 3, '0')).toBe('hello')
    })
  })

  describe('padEnd', () => {
    it('应该在字符串末尾填充', () => {
      expect(StringUtils.padEnd('5', 3, '0')).toBe('500')
      expect(StringUtils.padEnd('hello', 10, '*')).toBe('hello*****')
    })
  })

  describe('reverse', () => {
    it('应该反转字符串', () => {
      expect(StringUtils.reverse('hello')).toBe('olleh')
      expect(StringUtils.reverse('world')).toBe('dlrow')
    })

    it('应该处理空字符串', () => {
      expect(StringUtils.reverse('')).toBe('')
    })

    it('应该处理单字符', () => {
      expect(StringUtils.reverse('a')).toBe('a')
    })
  })

  describe('isEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      expect(StringUtils.isEmail('test@example.com')).toBe(true)
      expect(StringUtils.isEmail('user.name@domain.co.uk')).toBe(true)
      expect(StringUtils.isEmail('user+tag@example.org')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(StringUtils.isEmail('invalid-email')).toBe(false)
      expect(StringUtils.isEmail('test@')).toBe(false)
      expect(StringUtils.isEmail('@example.com')).toBe(false)
      expect(StringUtils.isEmail('test..test@example.com')).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('应该验证有效的URL', () => {
      expect(StringUtils.isUrl('https://example.com')).toBe(true)
      expect(StringUtils.isUrl('http://localhost:3000')).toBe(true)
      expect(StringUtils.isUrl('ftp://files.example.com')).toBe(true)
    })

    it('应该拒绝无效的URL', () => {
      expect(StringUtils.isUrl('not-a-url')).toBe(false)
      expect(StringUtils.isUrl('http://')).toBe(false)
      expect(StringUtils.isUrl('://example.com')).toBe(false)
    })
  })

  describe('template', () => {
    it('应该替换模板变量', () => {
      const template = 'Hello {{name}}, welcome to {{site}}!'
      const data = { name: 'John', site: 'our website' }
      expect(StringUtils.template(template, data)).toBe('Hello John, welcome to our website!')
    })

    it('应该处理缺失的变量', () => {
      const template = 'Hello {{name}}, your age is {{age}}'
      const data = { name: 'John' }
      expect(StringUtils.template(template, data)).toBe('Hello John, your age is ')
    })

    it('应该处理嵌套对象', () => {
      const template = 'User: {{user.name}}, Email: {{user.email}}'
      const data = { user: { name: 'John', email: 'john@example.com' } }
      expect(StringUtils.template(template, data)).toBe('User: John, Email: john@example.com')
    })
  })

  describe('levenshteinDistance', () => {
    it('应该计算编辑距离', () => {
      expect(StringUtils.levenshteinDistance('kitten', 'sitting')).toBe(3)
      expect(StringUtils.levenshteinDistance('hello', 'hello')).toBe(0)
      expect(StringUtils.levenshteinDistance('', 'hello')).toBe(5)
      expect(StringUtils.levenshteinDistance('hello', '')).toBe(5)
    })
  })

  describe('similarity', () => {
    it('应该计算字符串相似度', () => {
      expect(StringUtils.similarity('hello', 'hello')).toBe(1)
      expect(StringUtils.similarity('hello', 'world')).toBeLessThan(0.5)
      expect(StringUtils.similarity('', '')).toBe(1)
    })

    it('应该返回0到1之间的值', () => {
      const sim = StringUtils.similarity('test', 'best')
      expect(sim).toBeGreaterThanOrEqual(0)
      expect(sim).toBeLessThanOrEqual(1)
    })
  })

  describe('escapeHtml', () => {
    it('应该转义HTML特殊字符', () => {
      expect(StringUtils.escapeHtml('<div>Hello & "World"</div>')).toBe(
        '&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;',
      )
    })

    it('应该处理单引号', () => {
      expect(StringUtils.escapeHtml('It\'s a test')).toBe('It&#39;s a test')
    })
  })

  describe('unescapeHtml', () => {
    it('应该反转义HTML特殊字符', () => {
      expect(StringUtils.unescapeHtml('&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;')).toBe(
        '<div>Hello & "World"</div>',
      )
    })
  })

  describe('wordCount', () => {
    it('应该计算单词数量', () => {
      expect(StringUtils.wordCount('Hello world')).toBe(2)
      expect(StringUtils.wordCount('This is a test sentence')).toBe(5)
      expect(StringUtils.wordCount('')).toBe(0)
      expect(StringUtils.wordCount('   ')).toBe(0)
    })

    it('应该处理中文', () => {
      expect(StringUtils.wordCount('你好世界')).toBe(4)
      expect(StringUtils.wordCount('这是一个测试')).toBe(6)
    })
  })

  describe('removeAccents', () => {
    it('应该移除重音符号', () => {
      expect(StringUtils.removeAccents('café')).toBe('cafe')
      expect(StringUtils.removeAccents('naïve')).toBe('naive')
      expect(StringUtils.removeAccents('résumé')).toBe('resume')
    })
  })
})


