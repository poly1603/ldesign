import type { NestedObject } from '@/core/types'

/**
 * 通过点分隔的路径获取嵌套对象的值
 * @param obj 嵌套对象
 * @param path 点分隔的路径，如 'menu.user.profile'
 * @returns 找到的值或 undefined
 */
export function getNestedValue(obj: NestedObject, path: string): string | undefined {
  if (!obj || !path) {
    return undefined
  }

  const keys = path.split('.')
  let current: any = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }

    if (typeof current !== 'object') {
      return undefined
    }

    current = current[key]
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * 通过点分隔的路径设置嵌套对象的值
 * @param obj 嵌套对象
 * @param path 点分隔的路径
 * @param value 要设置的值
 */
export function setNestedValue(obj: NestedObject, path: string, value: string): void {
  if (!obj || !path) {
    return
  }

  const keys = path.split('.')
  let current: any = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    
    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  current[lastKey] = value
}

/**
 * 检查路径是否存在于嵌套对象中
 * @param obj 嵌套对象
 * @param path 点分隔的路径
 * @returns 是否存在
 */
export function hasNestedPath(obj: NestedObject, path: string): boolean {
  return getNestedValue(obj, path) !== undefined
}

/**
 * 获取嵌套对象的所有路径
 * @param obj 嵌套对象
 * @param prefix 路径前缀
 * @returns 所有路径的数组
 */
export function getAllPaths(obj: NestedObject, prefix = ''): string[] {
  const paths: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      paths.push(currentPath)
    } else if (typeof value === 'object' && value !== null) {
      paths.push(...getAllPaths(value, currentPath))
    }
  }

  return paths
}

/**
 * 深度合并两个嵌套对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export function deepMerge(target: NestedObject, source: NestedObject): NestedObject {
  const result = { ...target }

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') {
      result[key] = value
    } else if (typeof value === 'object' && value !== null) {
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = deepMerge(result[key] as NestedObject, value)
      } else {
        result[key] = deepMerge({}, value)
      }
    }
  }

  return result
}

/**
 * 扁平化嵌套对象为点分隔的键值对
 * @param obj 嵌套对象
 * @param prefix 路径前缀
 * @returns 扁平化的对象
 */
export function flattenObject(obj: NestedObject, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      flattened[currentPath] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value, currentPath))
    }
  }

  return flattened
}

/**
 * 从扁平化对象重建嵌套对象
 * @param flattened 扁平化的对象
 * @returns 嵌套对象
 */
export function unflattenObject(flattened: Record<string, string>): NestedObject {
  const result: NestedObject = {}

  for (const [path, value] of Object.entries(flattened)) {
    setNestedValue(result, path, value)
  }

  return result
}
