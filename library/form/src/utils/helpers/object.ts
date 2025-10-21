/**
 * @ldesign/form - Object Manipulation Utilities
 * 对象操作工具函数
 */

import { isObject, isArray, isPlainObject, isDate, isRegExp } from './type'

/**
 * 深度克隆对象
 */
export function deepClone<T>(value: T): T {
  // 处理基本类型和 null
  if (value === null || typeof value !== 'object') {
    return value
  }

  // 处理日期
  if (isDate(value)) {
    return new Date(value.getTime()) as any
  }

  // 处理正则表达式
  if (isRegExp(value)) {
    return new RegExp(value.source, value.flags) as any
  }

  // 处理数组
  if (isArray(value)) {
    return value.map(item => deepClone(item)) as any
  }

  // 处理普通对象
  if (isPlainObject(value)) {
    const cloned: any = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        cloned[key] = deepClone((value as any)[key])
      }
    }
    return cloned
  }

  // 其他对象类型直接返回
  return value
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key]
        const targetValue = (target as any)[key]

        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
          ;(target as any)[key] = deepMerge(
            { ...targetValue },
            sourceValue as any
          )
        } else if (isArray(sourceValue) && isArray(targetValue)) {
          ;(target as any)[key] = [...targetValue, ...sourceValue]
        } else {
          ;(target as any)[key] = deepClone(sourceValue)
        }
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 深度比较两个值是否相等
 */
export function deepEqual(value1: any, value2: any): boolean {
  // 相同引用
  if (value1 === value2) return true

  // 类型不同
  if (typeof value1 !== typeof value2) return false

  // null 检查
  if (value1 === null || value2 === null) return value1 === value2

  // 日期比较
  if (isDate(value1) && isDate(value2)) {
    return value1.getTime() === value2.getTime()
  }

  // 正则表达式比较
  if (isRegExp(value1) && isRegExp(value2)) {
    return value1.toString() === value2.toString()
  }

  // 数组比较
  if (isArray(value1) && isArray(value2)) {
    if (value1.length !== value2.length) return false
    return value1.every((item, index) => deepEqual(item, value2[index]))
  }

  // 对象比较
  if (isPlainObject(value1) && isPlainObject(value2)) {
    const keys1 = Object.keys(value1)
    const keys2 = Object.keys(value2)

    if (keys1.length !== keys2.length) return false

    return keys1.every(key => {
      return (
        Object.prototype.hasOwnProperty.call(value2, key) &&
        deepEqual(value1[key], value2[key])
      )
    })
  }

  // 其他情况
  return false
}

/**
 * 从对象中选取指定的键
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 从对象中排除指定的键
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result as Omit<T, K>
}

/**
 * 对象键值对调
 */
export function invert<T extends Record<string, string | number>>(
  obj: T
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[String(obj[key])] = key
    }
  }
  return result
}

/**
 * 扁平化对象
 */
export function flatten(
  obj: Record<string, any>,
  prefix = '',
  result: Record<string, any> = {}
): Record<string, any> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (isPlainObject(value)) {
        flatten(value, fullKey, result)
      } else {
        result[fullKey] = value
      }
    }
  }
  return result
}

/**
 * 反扁平化对象
 */
export function unflatten(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const keys = key.split('.')
      let current = result

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i]
        if (!current[k] || !isPlainObject(current[k])) {
          current[k] = {}
        }
        current = current[k]
      }

      current[keys[keys.length - 1]] = obj[key]
    }
  }

  return result
}




