/**
 * 对象处理工具类
 * 提供对象深拷贝、合并、路径访问等功能
 */

/**
 * 对象处理工具
 */
export class ObjectUtils {
  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags) as unknown as T
    }

    if (obj instanceof Map) {
      const cloned = new Map()
      for (const [key, value] of obj) {
        cloned.set(ObjectUtils.deepClone(key), ObjectUtils.deepClone(value))
      }
      return cloned as unknown as T
    }

    if (obj instanceof Set) {
      const cloned = new Set()
      for (const value of obj) {
        cloned.add(ObjectUtils.deepClone(value))
      }
      return cloned as unknown as T
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ObjectUtils.deepClone(item)) as unknown as T
    }

    if (typeof obj === 'object') {
      const cloned = {} as T
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = ObjectUtils.deepClone((obj as Record<string, any>)[key])
        }
      }
      return cloned
    }

    return obj
  }

  /**
   * 深度合并对象
   * @param target 目标对象
   * @param sources 源对象
   * @returns 合并后的对象
   */
  static deepMerge<T extends Record<string, any>>(target: T, ...sources: any[]): T {
    if (!sources.length)
      return target
    const source = sources.shift()

    if (ObjectUtils.isObject(target) && ObjectUtils.isObject(source)) {
      for (const key in source) {
        if (ObjectUtils.isObject(source[key])) {
          if (!target[key])
            Object.assign(target, { [key]: {} })
          ObjectUtils.deepMerge(target[key] as Record<string, any>, source[key])
        }
        else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }

    return ObjectUtils.deepMerge(target, ...sources)
  }

  /**
   * 浅合并对象
   * @param target 目标对象
   * @param sources 源对象
   * @returns 合并后的对象
   */
  static merge<T extends Record<string, any>>(target: T, ...sources: any[]): T {
    return Object.assign(target, ...sources)
  }

  /**
   * 检查是否为对象
   * @param obj 要检查的值
   * @returns 是否为对象
   */
  static isObject(obj: any): obj is Record<string, any> {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
  }

  /**
   * 检查是否为空对象
   * @param obj 要检查的对象
   * @returns 是否为空对象
   */
  static isEmpty(obj: Record<string, any>): boolean {
    return Object.keys(obj).length === 0
  }

  /**
   * 获取对象的深度路径值
   * @param obj 对象
   * @param path 路径（如 'a.b.c' 或 ['a', 'b', 'c']）
   * @param defaultValue 默认值
   * @returns 路径对应的值
   */
  static get<T = any>(obj: Record<string, any>, path: string | string[], defaultValue?: T): T {
    const keys = Array.isArray(path) ? path : path.split('.')
    let result = obj

    for (const key of keys) {
      if (result === null || result === undefined || !(key in result)) {
        return defaultValue as T
      }
      result = result[key]
    }

    return result as T
  }

  /**
   * 设置对象的深度路径值
   * @param obj 对象
   * @param path 路径（如 'a.b.c' 或 ['a', 'b', 'c']）
   * @param value 要设置的值
   * @returns 修改后的对象
   */
  static set<T extends Record<string, any>>(obj: T, path: string | string[], value: any): T {
    const keys = Array.isArray(path) ? path : path.split('.')
    let current: any = obj as any

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]!
      if (!(key in current) || !ObjectUtils.isObject(current[key])) {
        current[key] = {}
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]!
    current[lastKey] = value
    return obj
  }

  /**
   * 检查对象是否有指定路径
   * @param obj 对象
   * @param path 路径
   * @returns 是否有该路径
   */
  static has(obj: Record<string, any>, path: string | string[]): boolean {
    const keys = Array.isArray(path) ? path : path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false
      }
      current = current[key]
    }

    return true
  }

  /**
   * 删除对象的指定路径
   * @param obj 对象
   * @param path 路径
   * @returns 是否删除成功
   */
  static unset<T extends Record<string, any>>(obj: T, path: string | string[]): boolean {
    const keys = Array.isArray(path) ? path : path.split('.')
    let current: any = obj as any

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]!
      if (!(key in current) || !ObjectUtils.isObject(current[key])) {
        return false
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]!
    if (lastKey in current) {
      delete current[lastKey]
      return true
    }

    return false
  }

  /**
   * 获取对象的所有键路径
   * @param obj 对象
   * @param prefix 路径前缀
   * @returns 所有键路径数组
   */
  static paths(obj: Record<string, any>, prefix = ''): string[] {
    const result: string[] = []

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const currentPath = prefix ? `${prefix}.${key}` : key

        if (ObjectUtils.isObject(obj[key])) {
          result.push(...ObjectUtils.paths(obj[key], currentPath))
        }
        else {
          result.push(currentPath)
        }
      }
    }

    return result
  }

  /**
   * 扁平化对象
   * @param obj 对象
   * @param separator 分隔符
   * @returns 扁平化后的对象
   */
  static flatten(obj: Record<string, any>, separator = '.'): Record<string, any> {
    const result: Record<string, any> = {}

    function flattenRecursive(current: any, prefix = '') {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          const newKey = prefix ? `${prefix}${separator}${key}` : key

          if (ObjectUtils.isObject(current[key])) {
            flattenRecursive(current[key], newKey)
          }
          else {
            result[newKey] = current[key]
          }
        }
      }
    }

    flattenRecursive(obj)
    return result
  }

  /**
   * 反扁平化对象
   * @param obj 扁平化的对象
   * @param separator 分隔符
   * @returns 反扁平化后的对象
   */
  static unflatten(obj: Record<string, any>, separator = '.'): Record<string, any> {
    const result: Record<string, any> = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        ObjectUtils.set(result, key.split(separator), obj[key])
      }
    }

    return result
  }

  /**
   * 选择对象的指定键
   * @param obj 对象
   * @param keys 要选择的键
   * @returns 新对象
   */
  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>

    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key]
      }
    }

    return result
  }

  /**
   * 排除对象的指定键
   * @param obj 对象
   * @param keys 要排除的键
   * @returns 新对象
   */
  static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj } as Omit<T, K>

    for (const key of keys) {
      delete (result as any)[key]
    }

    return result
  }

  /**
   * 转换对象的键
   * @param obj 对象
   * @param transformer 键转换函数
   * @returns 新对象
   */
  static mapKeys<T extends Record<string, any>>(
    obj: T,
    transformer: (key: string, value: any) => string,
  ): Record<string, any> {
    const result: Record<string, any> = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = transformer(key, obj[key])
        result[newKey] = obj[key]
      }
    }

    return result
  }

  /**
   * 转换对象的值
   * @param obj 对象
   * @param transformer 值转换函数
   * @returns 新对象
   */
  static mapValues<T extends Record<string, any>, R>(
    obj: T,
    transformer: (value: any, key: string) => R,
  ): Record<keyof T, R> {
    const result = {} as Record<keyof T, R>

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = transformer(obj[key], key)
      }
    }

    return result
  }

  /**
   * 反转对象的键值
   * @param obj 对象
   * @returns 反转后的对象
   */
  static invert(obj: Record<string, string | number>): Record<string, string> {
    const result: Record<string, string> = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[String(obj[key])] = key
      }
    }

    return result
  }

  /**
   * 过滤对象
   * @param obj 对象
   * @param predicate 过滤函数
   * @returns 过滤后的对象
   */
  static filter<T extends Record<string, any>>(
    obj: T,
    predicate: (value: any, key: string) => boolean,
  ): Partial<T> {
    const result: Partial<T> = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && predicate(obj[key], key)) {
        result[key] = obj[key]
      }
    }

    return result
  }

  /**
   * 对象比较
   * @param obj1 对象1
   * @param obj2 对象2
   * @returns 是否相等
   */
  static isEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2)
      return true

    if (obj1 === null || obj2 === null)
      return false
    if (typeof obj1 !== typeof obj2)
      return false

    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime()
    }

    if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
      return obj1.toString() === obj2.toString()
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length)
        return false
      return obj1.every((item, index) => ObjectUtils.isEqual(item, obj2[index]))
    }

    if (ObjectUtils.isObject(obj1) && ObjectUtils.isObject(obj2)) {
      const keys1 = Object.keys(obj1)
      const keys2 = Object.keys(obj2)

      if (keys1.length !== keys2.length)
        return false

      return keys1.every(key => keys2.includes(key) && ObjectUtils.isEqual(obj1[key], obj2[key]))
    }

    return false
  }
}
