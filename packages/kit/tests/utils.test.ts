/**
 * Utils 模块测试
 */

import { describe, expect, it } from 'vitest'
import {
  ArrayUtils,
  DateUtils,
  NumberUtils,
  ObjectUtils,
  RandomUtils,
  StringUtils,
  ValidationUtils,
} from '../src/utils'

describe('stringUtils', () => {
  describe('基本操作', () => {
    it('应该能够转换为驼峰命�?, () => {
      expect(StringUtils.toCamelCase('hello-world')).toBe('helloWorld')
      expect(StringUtils.toCamelCase('hello_world')).toBe('helloWorld')
      expect(StringUtils.toCamelCase('hello world')).toBe('helloWorld')
    })

    it('应该能够转换为短横线命名', () => {
      expect(StringUtils.toKebabCase('helloWorld')).toBe('hello-world')
      expect(StringUtils.toKebabCase('HelloWorld')).toBe('hello-world')
    })

    it('应该能够转换为下划线命名', () => {
      expect(StringUtils.toSnakeCase('helloWorld')).toBe('hello_world')
      expect(StringUtils.toSnakeCase('HelloWorld')).toBe('hello_world')
    })

    it('应该能够首字母大�?, () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello')
      expect(StringUtils.capitalize('HELLO')).toBe('Hello')
    })

    it('应该能够截断字符�?, () => {
      expect(StringUtils.truncate('Hello World', 5)).toBe('Hello...')
      expect(StringUtils.truncate('Hi', 5)).toBe('Hi')
    })
  })

  describe('字符串验�?, () => {
    it('应该能够检查是否为空字符串', () => {
      expect(StringUtils.isEmpty('')).toBe(true)
      expect(StringUtils.isEmpty('  ')).toBe(true)
      expect(StringUtils.isEmpty('hello')).toBe(false)
    })

    it('应该能够检查是否为邮箱', () => {
      expect(StringUtils.isEmail('test@example.com')).toBe(true)
      expect(StringUtils.isEmail('invalid-email')).toBe(false)
    })

    it('应该能够检查是否为URL', () => {
      expect(StringUtils.isUrl('https://example.com')).toBe(true)
      expect(StringUtils.isUrl('invalid-url')).toBe(false)
    })
  })

  describe('字符串处�?, () => {
    it('应该能够计算编辑距离', () => {
      expect(StringUtils.levenshteinDistance('kitten', 'sitting')).toBe(3)
      expect(StringUtils.levenshteinDistance('hello', 'hello')).toBe(0)
    })

    it('应该能够转义HTML', () => {
      expect(StringUtils.escapeHtml('<div>Hello & "World"</div>')).toBe(
        '&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;',
      )
    })

    it('应该能够反转义HTML', () => {
      expect(StringUtils.unescapeHtml('&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;')).toBe(
        '<div>Hello & "World"</div>',
      )
    })
  })
})

describe('numberUtils', () => {
  describe('数字格式�?, () => {
    it('应该能够格式化数�?, () => {
      expect(NumberUtils.format(1234.567, 2)).toBe('1,234.57')
      expect(NumberUtils.format(1000)).toBe('1,000')
    })

    it('应该能够格式化文件大�?, () => {
      expect(NumberUtils.formatBytes(1024)).toBe('1.00 KB')
      expect(NumberUtils.formatBytes(1048576)).toBe('1.00 MB')
      expect(NumberUtils.formatBytes(1073741824)).toBe('1.00 GB')
    })

    it('应该能够解析文件大小', () => {
      expect(NumberUtils.parseBytes('1 KB')).toBe(1024)
      expect(NumberUtils.parseBytes('1 MB')).toBe(1048576)
      expect(NumberUtils.parseBytes('1 GB')).toBe(1073741824)
    })
  })

  describe('数学运算', () => {
    it('应该能够限制数字范围', () => {
      expect(NumberUtils.clamp(5, 1, 10)).toBe(5)
      expect(NumberUtils.clamp(-5, 1, 10)).toBe(1)
      expect(NumberUtils.clamp(15, 1, 10)).toBe(10)
    })

    it('应该能够计算平均�?, () => {
      expect(NumberUtils.average([1, 2, 3, 4, 5])).toBe(3)
      expect(NumberUtils.average([10, 20])).toBe(15)
    })

    it('应该能够计算中位�?, () => {
      expect(NumberUtils.median([1, 2, 3, 4, 5])).toBe(3)
      expect(NumberUtils.median([1, 2, 3, 4])).toBe(2.5)
    })
  })

  describe('数字验证', () => {
    it('应该能够检查是否为偶数', () => {
      expect(NumberUtils.isEven(2)).toBe(true)
      expect(NumberUtils.isEven(3)).toBe(false)
    })

    it('应该能够检查是否为奇数', () => {
      expect(NumberUtils.isOdd(3)).toBe(true)
      expect(NumberUtils.isOdd(2)).toBe(false)
    })

    it('应该能够检查是否为质数', () => {
      expect(NumberUtils.isPrime(2)).toBe(true)
      expect(NumberUtils.isPrime(3)).toBe(true)
      expect(NumberUtils.isPrime(4)).toBe(false)
      expect(NumberUtils.isPrime(17)).toBe(true)
    })
  })
})

describe('arrayUtils', () => {
  describe('数组操作', () => {
    it('应该能够去重', () => {
      expect(ArrayUtils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(ArrayUtils.unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('应该能够打乱数组', () => {
      const arr = [1, 2, 3, 4, 5]
      const shuffled = ArrayUtils.shuffle([...arr])

      expect(shuffled).toHaveLength(arr.length)
      expect(shuffled.sort()).toEqual(arr.sort())
    })

    it('应该能够分块', () => {
      expect(ArrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
      expect(ArrayUtils.chunk([1, 2, 3, 4], 2)).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('应该能够扁平�?, () => {
      expect(ArrayUtils.flatten([1, [2, 3], [4, [5, 6]]])).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('数组查找', () => {
    it('应该能够查找交集', () => {
      expect(ArrayUtils.intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
    })

    it('应该能够查找差集', () => {
      expect(ArrayUtils.difference([1, 2, 3], [2, 3, 4])).toEqual([1])
    })

    it('应该能够查找并集', () => {
      expect(ArrayUtils.union([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4])
    })
  })
})

describe('objectUtils', () => {
  describe('对象操作', () => {
    it('应该能够深度克隆', () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = ObjectUtils.deepClone(obj)

      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('应该能够深度合并', () => {
      const obj1 = { a: 1, b: { c: 2 } }
      const obj2 = { b: { d: 3 }, e: 4 }

      expect(ObjectUtils.deepMerge(obj1, obj2)).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4,
      })
    })

    it('应该能够获取嵌套�?, () => {
      const obj = { a: { b: { c: 'value' } } }

      expect(ObjectUtils.get(obj, 'a.b.c')).toBe('value')
      expect(ObjectUtils.get(obj, 'a.b.d', 'default')).toBe('default')
    })

    it('应该能够设置嵌套�?, () => {
      const obj = {}
      ObjectUtils.set(obj, 'a.b.c', 'value')

      expect(obj).toEqual({ a: { b: { c: 'value' } } })
    })
  })

  describe('对象验证', () => {
    it('应该能够检查是否为空对�?, () => {
      expect(ObjectUtils.isEmpty({})).toBe(true)
      expect(ObjectUtils.isEmpty({ a: 1 })).toBe(false)
    })

    it('应该能够检查是否为对象', () => {
      expect(ObjectUtils.isObject({})).toBe(true)
      expect(ObjectUtils.isObject([])).toBe(false)
      expect(ObjectUtils.isObject(null)).toBe(false)
    })
  })
})

describe('dateUtils', () => {
  describe('日期格式�?, () => {
    it('应该能够格式化日�?, () => {
      const date = new Date('2023-12-25T10:30:00')

      expect(DateUtils.format(date, 'YYYY-MM-DD')).toBe('2023-12-25')
      expect(DateUtils.format(date, 'HH:mm:ss')).toBe('10:30:00')
    })

    it('应该能够解析日期字符�?, () => {
      const date = DateUtils.parse('2023-12-25', 'YYYY-MM-DD')

      expect(date.getFullYear()).toBe(2023)
      expect(date.getMonth()).toBe(11) // 0-based
      expect(date.getDate()).toBe(25)
    })
  })

  describe('日期计算', () => {
    it('应该能够添加时间', () => {
      const date = new Date('2023-12-25')
      const result = DateUtils.add(date, 1, 'day')

      expect(result.getDate()).toBe(26)
    })

    it('应该能够计算时间�?, () => {
      const date1 = new Date('2023-12-25')
      const date2 = new Date('2023-12-26')

      expect(DateUtils.diff(date2, date1, 'day')).toBe(1)
    })
  })
})

describe('validationUtils', () => {
  describe('基本验证', () => {
    it('应该能够验证邮箱', () => {
      expect(ValidationUtils.isEmail('test@example.com')).toBe(true)
      expect(ValidationUtils.isEmail('invalid-email')).toBe(false)
    })

    it('应该能够验证URL', () => {
      expect(ValidationUtils.isUrl('https://example.com')).toBe(true)
      expect(ValidationUtils.isUrl('invalid-url')).toBe(false)
    })

    it('应该能够验证手机�?, () => {
      expect(ValidationUtils.isMobilePhone('13800138000')).toBe(true)
      expect(ValidationUtils.isMobilePhone('12345')).toBe(false)
    })

    it('应该能够验证身份证号', () => {
      expect(ValidationUtils.isIdCard('110101199003077777')).toBe(true)
      expect(ValidationUtils.isIdCard('123456')).toBe(false)
    })
  })
})

describe('randomUtils', () => {
  describe('随机生成', () => {
    it('应该能够生成随机整数', () => {
      const num = RandomUtils.int(1, 10)
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(10)
      expect(Number.isInteger(num)).toBe(true)
    })

    it('应该能够生成随机浮点�?, () => {
      const num = RandomUtils.float(1, 10)
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThan(10)
    })

    it('应该能够生成随机字符�?, () => {
      const str = RandomUtils.string(10)
      expect(str).toHaveLength(10)
      expect(/^[a-z0-9]+$/i.test(str)).toBe(true)
    })

    it('应该能够从数组中随机选择', () => {
      const arr = [1, 2, 3, 4, 5]
      const item = RandomUtils.choice(arr)
      expect(arr).toContain(item)
    })
  })
})


