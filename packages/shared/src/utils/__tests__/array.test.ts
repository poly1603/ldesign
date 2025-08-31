/**
 * 数组工具函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  unique,
  uniqueBy,
  chunk,
  groupBy,
  flatten,
  flattenDeep,
  intersection,
  union,
  difference,
  shuffle,
  sample,
  compact,
  sum,
  average,
  max,
  min,
} from '../array'

describe('数组工具函数', () => {
  describe('unique', () => {
    it('应该移除重复元素', () => {
      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4])
      expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('应该处理空数组', () => {
      expect(unique([])).toEqual([])
    })

    it('应该处理没有重复元素的数组', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('uniqueBy', () => {
    it('应该根据指定属性去重', () => {
      const users = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'John Doe' },
      ]
      const result = uniqueBy(users, 'id')
      expect(result).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ])
    })

    it('应该处理空数组', () => {
      expect(uniqueBy([], 'id')).toEqual([])
    })
  })

  describe('chunk', () => {
    it('应该将数组分割成指定大小的块', () => {
      expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]])
      expect(chunk([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]])
    })

    it('应该处理大小为0或负数的情况', () => {
      expect(chunk([1, 2, 3], 0)).toEqual([])
      expect(chunk([1, 2, 3], -1)).toEqual([])
    })

    it('应该处理空数组', () => {
      expect(chunk([], 2)).toEqual([])
    })
  })

  describe('groupBy', () => {
    it('应该根据属性分组', () => {
      const users = [
        { name: 'John', age: 25, city: 'New York' },
        { name: 'Jane', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'London' },
      ]
      
      const result = groupBy(users, 'city')
      expect(result).toEqual({
        'New York': [
          { name: 'John', age: 25, city: 'New York' },
          { name: 'Jane', age: 30, city: 'New York' },
        ],
        'London': [
          { name: 'Bob', age: 25, city: 'London' },
        ],
      })
    })

    it('应该支持函数分组', () => {
      const users = [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 },
        { name: 'Bob', age: 20 },
      ]
      
      const result = groupBy(users, user => user.age > 25 ? 'senior' : 'junior')
      expect(result).toEqual({
        'junior': [
          { name: 'John', age: 25 },
          { name: 'Bob', age: 20 },
        ],
        'senior': [
          { name: 'Jane', age: 30 },
        ],
      })
    })
  })

  describe('flatten', () => {
    it('应该扁平化一层嵌套', () => {
      expect(flatten([1, [2, 3], [4, [5, 6]]])).toEqual([1, 2, 3, 4, [5, 6]])
    })

    it('应该支持指定深度', () => {
      expect(flatten([1, [2, 3], [4, [5, 6]]], 2)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('应该处理空数组', () => {
      expect(flatten([])).toEqual([])
    })
  })

  describe('flattenDeep', () => {
    it('应该完全扁平化数组', () => {
      expect(flattenDeep([1, [2, [3, [4, 5]]]])).toEqual([1, 2, 3, 4, 5])
    })

    it('应该处理混合类型', () => {
      expect(flattenDeep([1, ['a', [true, [null]]]])).toEqual([1, 'a', true, null])
    })
  })

  describe('intersection', () => {
    it('应该返回数组交集', () => {
      expect(intersection([1, 2, 3], [2, 3, 4], [3, 4, 5])).toEqual([3])
      expect(intersection([1, 2], [2, 3], [2, 4])).toEqual([2])
    })

    it('应该处理没有交集的情况', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([])
    })

    it('应该处理空数组', () => {
      expect(intersection()).toEqual([])
      expect(intersection([])).toEqual([])
    })
  })

  describe('union', () => {
    it('应该返回数组并集', () => {
      expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4])
    })

    it('应该处理空数组', () => {
      expect(union()).toEqual([])
      expect(union([], [])).toEqual([])
    })
  })

  describe('difference', () => {
    it('应该返回数组差集', () => {
      expect(difference([1, 2, 3, 4], [2, 3], [4])).toEqual([1])
      expect(difference([1, 2, 3], [2], [3])).toEqual([1])
    })

    it('应该处理空数组', () => {
      expect(difference([], [1, 2])).toEqual([])
      expect(difference([1, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('shuffle', () => {
    it('应该打乱数组顺序', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffle(original)
      
      // 确保长度相同
      expect(shuffled).toHaveLength(original.length)
      
      // 确保包含所有原始元素
      expect(shuffled.sort()).toEqual(original.sort())
      
      // 确保原数组未被修改
      expect(original).toEqual([1, 2, 3, 4, 5])
    })

    it('应该处理空数组', () => {
      expect(shuffle([])).toEqual([])
    })

    it('应该处理单元素数组', () => {
      expect(shuffle([1])).toEqual([1])
    })
  })

  describe('sample', () => {
    it('应该随机选择指定数量的元素', () => {
      const array = [1, 2, 3, 4, 5]
      const sampled = sample(array, 3)
      
      expect(sampled).toHaveLength(3)
      sampled.forEach(item => {
        expect(array).toContain(item)
      })
    })

    it('应该处理选择数量大于数组长度的情况', () => {
      const array = [1, 2, 3]
      const sampled = sample(array, 5)
      
      expect(sampled).toHaveLength(3)
      expect(sampled.sort()).toEqual([1, 2, 3])
    })

    it('应该处理空数组', () => {
      expect(sample([], 3)).toEqual([])
    })
  })

  describe('compact', () => {
    it('应该移除假值', () => {
      expect(compact([0, 1, false, 2, '', 3, null, undefined, 4, NaN, 5]))
        .toEqual([1, 2, 3, 4, 5])
    })

    it('应该处理空数组', () => {
      expect(compact([])).toEqual([])
    })

    it('应该处理全是假值的数组', () => {
      expect(compact([false, null, undefined, 0, ''])).toEqual([])
    })
  })

  describe('sum', () => {
    it('应该计算数组总和', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15)
      expect(sum([10, -5, 3])).toBe(8)
    })

    it('应该处理空数组', () => {
      expect(sum([])).toBe(0)
    })

    it('应该处理包含小数的数组', () => {
      expect(sum([1.5, 2.5, 3])).toBe(7)
    })
  })

  describe('average', () => {
    it('应该计算平均值', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3)
      expect(average([10, 20])).toBe(15)
    })

    it('应该处理空数组', () => {
      expect(average([])).toBe(0)
    })

    it('应该处理包含小数的数组', () => {
      expect(average([1, 2, 3])).toBe(2)
    })
  })

  describe('max', () => {
    it('应该找到最大值', () => {
      expect(max([1, 5, 3, 9, 2])).toBe(9)
      expect(max([-1, -5, -3])).toBe(-1)
    })

    it('应该处理单元素数组', () => {
      expect(max([42])).toBe(42)
    })
  })

  describe('min', () => {
    it('应该找到最小值', () => {
      expect(min([1, 5, 3, 9, 2])).toBe(1)
      expect(min([-1, -5, -3])).toBe(-5)
    })

    it('应该处理单元素数组', () => {
      expect(min([42])).toBe(42)
    })
  })
})
