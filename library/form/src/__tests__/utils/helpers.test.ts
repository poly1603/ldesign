/**
 * @ldesign/form - Helper Functions Tests
 * 辅助函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  isString,
  isNumber,
  isObject,
  isArray,
  isEmpty,
  deepClone,
  deepMerge,
  deepEqual,
  getValue,
  setValue,
  deletePath,
  hasPath
} from '../../utils/helpers'

describe('Type Checking', () => {
  it('isString 应该正确判断字符串', () => {
    expect(isString('test')).toBe(true)
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
  })

  it('isNumber 应该正确判断数字', () => {
    expect(isNumber(123)).toBe(true)
    expect(isNumber('123')).toBe(false)
    expect(isNumber(NaN)).toBe(false)
  })

  it('isObject 应该正确判断对象', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject(null)).toBe(false)
  })

  it('isArray 应该正确判断数组', () => {
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
  })

  it('isEmpty 应该正确判断空值', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('  ')).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty('test')).toBe(false)
    expect(isEmpty([1])).toBe(false)
  })
})

describe('Object Operations', () => {
  it('deepClone 应该正确克隆对象', () => {
    const obj = { a: 1, b: { c: 2 }, d: [3, 4] }
    const cloned = deepClone(obj)

    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
    expect(cloned.b).not.toBe(obj.b)
    expect(cloned.d).not.toBe(obj.d)
  })

  it('deepMerge 应该正确合并对象', () => {
    const obj1 = { a: 1, b: { c: 2 } }
    const obj2 = { b: { d: 3 }, e: 4 }
    const merged = deepMerge(obj1, obj2)

    expect(merged).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 })
  })

  it('deepEqual 应该正确比较对象', () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
  })
})

describe('Path Operations', () => {
  it('getValue 应该正确获取路径值', () => {
    const obj = {
      user: {
        name: 'John',
        profile: {
          age: 30
        }
      },
      items: [{ id: 1 }, { id: 2 }]
    }

    expect(getValue(obj, 'user.name')).toBe('John')
    expect(getValue(obj, 'user.profile.age')).toBe(30)
    expect(getValue(obj, 'items[0].id')).toBe(1)
    expect(getValue(obj, 'notexist', 'default')).toBe('default')
  })

  it('setValue 应该正确设置路径值', () => {
    const obj: any = {}

    setValue(obj, 'user.name', 'John')
    expect(obj.user.name).toBe('John')

    setValue(obj, 'items[0].id', 1)
    expect(obj.items[0].id).toBe(1)
  })

  it('deletePath 应该正确删除路径值', () => {
    const obj = {
      user: { name: 'John', age: 30 },
      items: [1, 2, 3]
    }

    expect(deletePath(obj, 'user.age')).toBe(true)
    expect(obj.user.age).toBeUndefined()

    expect(deletePath(obj, 'items[1]')).toBe(true)
    expect(obj.items).toEqual([1, 3])
  })

  it('hasPath 应该正确检查路径是否存在', () => {
    const obj = {
      user: { name: 'John' }
    }

    expect(hasPath(obj, 'user.name')).toBe(true)
    expect(hasPath(obj, 'user.age')).toBe(false)
    expect(hasPath(obj, 'notexist')).toBe(false)
  })
})



