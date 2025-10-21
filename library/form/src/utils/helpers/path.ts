/**
 * @ldesign/form - Path Manipulation Utilities
 * 路径操作工具函数
 */

import { isObject, isArray, isNumber } from './type'

/**
 * 将路径字符串转换为路径数组
 * 支持：'a.b.c', 'a[0].b', 'a.b[0][1].c'
 */
export function parsePath(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
}

/**
 * 根据路径获取对象的值
 */
export function getValue<T = any>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T {
  if (!obj) return defaultValue as T

  const keys = typeof path === 'string' ? parsePath(path) : path

  let result = obj
  for (const key of keys) {
    if (result == null) {
      return defaultValue as T
    }
    result = result[key]
  }

  return result === undefined ? (defaultValue as T) : result
}

/**
 * 根据路径设置对象的值
 */
export function setValue(obj: any, path: string | string[], value: any): void {
  if (!obj) return

  const keys = typeof path === 'string' ? parsePath(path) : path
  if (keys.length === 0) return

  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const nextKey = keys[i + 1]

    // 如果当前键不存在或不是对象，则创建
    if (!current[key] || typeof current[key] !== 'object') {
      // 如果下一个键是数字，创建数组，否则创建对象
      current[key] = isNumber(Number(nextKey)) && !isNaN(Number(nextKey)) ? [] : {}
    }

    current = current[key]
  }

  // 设置最后一个键的值
  const lastKey = keys[keys.length - 1]
  current[lastKey] = value
}

/**
 * 根据路径删除对象的值
 */
export function deletePath(obj: any, path: string | string[]): boolean {
  if (!obj) return false

  const keys = typeof path === 'string' ? parsePath(path) : path
  if (keys.length === 0) return false

  let current = obj

  // 遍历到倒数第二个键
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || typeof current[key] !== 'object') {
      return false
    }
    current = current[key]
  }

  // 删除最后一个键
  const lastKey = keys[keys.length - 1]
  if (isArray(current)) {
    const index = Number(lastKey)
    if (!isNaN(index) && index >= 0 && index < current.length) {
      current.splice(index, 1)
      return true
    }
    return false
  } else if (isObject(current)) {
    if (lastKey in current) {
      delete current[lastKey]
      return true
    }
    return false
  }

  return false
}

/**
 * 检查路径是否存在
 */
export function hasPath(obj: any, path: string | string[]): boolean {
  if (!obj) return false

  const keys = typeof path === 'string' ? parsePath(path) : path
  let current = obj

  for (const key of keys) {
    if (!current || !(key in current)) {
      return false
    }
    current = current[key]
  }

  return true
}

/**
 * 获取所有路径
 */
export function getAllPaths(
  obj: any,
  prefix = '',
  result: string[] = []
): string[] {
  if (!isObject(obj) && !isArray(obj)) {
    return result
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key
      result.push(fullPath)

      const value = obj[key]
      if (isObject(value) || isArray(value)) {
        getAllPaths(value, fullPath, result)
      }
    }
  }

  return result
}

/**
 * 匹配路径（支持通配符 *）
 */
export function matchPath(pattern: string, path: string): boolean {
  const patternParts = parsePath(pattern)
  const pathParts = parsePath(path)

  if (patternParts.length !== pathParts.length) {
    return false
  }

  return patternParts.every((part, index) => {
    return part === '*' || part === pathParts[index]
  })
}




