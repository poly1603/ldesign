/**
 * 对象工具模块
 * 提供对象操作、深度克隆、合并等工具函数
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

/**
 * 对象操作工具类
 * 提供对象的深度操作、路径访问等功能
 */
export class ObjectUtils {
  /**
   * 深度合并多个对象
   * @param target 目标对象
   * @param sources 源对象数组
   * @returns 合并后的对象
   * @example
   * ```typescript
   * const obj1 = { a: 1, b: { c: 2 } }
   * const obj2 = { b: { d: 3 }, e: 4 }
   * const result = ObjectUtils.deepMerge(obj1, obj2)
   * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
   * ```
   */
  static deepMerge<T extends Record<string, unknown>>(target: T, ...sources: unknown[]): T {
    if (!sources.length) return target
    const source = sources.shift()

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source as Record<string, unknown>) {
        const sourceValue = (source as Record<string, unknown>)[key]
        const targetValue = target[key]

        if (this.isObject(sourceValue)) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} })
          }
          this.deepMerge(targetValue as Record<string, unknown>, sourceValue)
        } else {
          Object.assign(target, { [key]: sourceValue })
        }
      }
    }

    return this.deepMerge(target, ...sources)
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆的对象
   * @example
   * ```typescript
   * const original = { a: 1, b: { c: [1, 2, 3] }, d: new Date() }
   * const cloned = ObjectUtils.deepClone(original)
   * cloned.b.c.push(4) // 不会影响原对象
   * ```
   */
  static deepClone<T>(obj: T): T {
    // 处理基本类型和 null
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    // 处理日期对象
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }

    // 处理正则表达式
    if (obj instanceof RegExp) {
      return new RegExp(obj) as unknown as T
    }

    // 处理数组
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T
    }

    // 处理普通对象
    if (this.isObject(obj)) {
      const cloned = {} as T
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key])
        }
      }
      return cloned
    }

    return obj
  }

  /**
   * 检查值是否为纯对象
   * @param item 要检查的值
   * @returns 是否为纯对象
   * @example
   * ```typescript
   * ObjectUtils.isObject({}) // true
   * ObjectUtils.isObject([]) // false
   * ObjectUtils.isObject(null) // false
   * ObjectUtils.isObject(new Date()) // false
   * ```
   */
  static isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date) && !(item instanceof RegExp)
  }

  /**
   * 使用点号路径获取对象属性值
   * @param obj 目标对象
   * @param path 属性路径，支持点号分隔
   * @param defaultValue 默认值
   * @returns 属性值
   * @example
   * ```typescript
   * const obj = { user: { profile: { name: 'Alice', age: 25 } } }
   * ObjectUtils.get(obj, 'user.profile.name') // 'Alice'
   * ObjectUtils.get(obj, 'user.profile.city', 'Unknown') // 'Unknown'
   * ObjectUtils.get(obj, 'user.settings.theme') // undefined
   * ```
   */
  static get(obj: unknown, path: string, defaultValue?: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return defaultValue
    }

    const keys = path.split('.')
    let result: unknown = obj

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue
      }
      
      if (typeof result === 'object' && key in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[key]
      } else {
        return defaultValue
      }
    }

    return result !== undefined ? result : defaultValue
  }

  /**
   * 使用点号路径设置对象属性值
   * @param obj 目标对象
   * @param path 属性路径，支持点号分隔
   * @param value 要设置的值
   * @example
   * ```typescript
   * const obj = {}
   * ObjectUtils.set(obj, 'user.profile.name', 'Alice')
   * ObjectUtils.set(obj, 'user.profile.age', 25)
   * // obj = { user: { profile: { name: 'Alice', age: 25 } } }
   * ```
   */
  static set(obj: Record<string, unknown>, path: string, value: unknown): void {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Target must be an object')
    }

    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {}
      }
      
      current = current[key] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 检查对象是否包含指定路径
   * @param obj 目标对象
   * @param path 属性路径
   * @returns 是否包含路径
   * @example
   * ```typescript
   * const obj = { user: { profile: { name: 'Alice' } } }
   * ObjectUtils.has(obj, 'user.profile.name') // true
   * ObjectUtils.has(obj, 'user.profile.age') // false
   * ObjectUtils.has(obj, 'user.settings') // false
   * ```
   */
  static has(obj: unknown, path: string): boolean {
    if (!obj || typeof obj !== 'object') {
      return false
    }

    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return false
      }
      
      if (!(key in (current as Record<string, unknown>))) {
        return false
      }
      
      current = (current as Record<string, unknown>)[key]
    }

    return true
  }

  /**
   * 删除对象中的指定路径
   * @param obj 目标对象
   * @param path 要删除的属性路径
   * @returns 是否成功删除
   * @example
   * ```typescript
   * const obj = { user: { profile: { name: 'Alice', age: 25 } } }
   * ObjectUtils.unset(obj, 'user.profile.age') // true
   * // obj = { user: { profile: { name: 'Alice' } } }
   * ```
   */
  static unset(obj: Record<string, unknown>, path: string): boolean {
    if (!obj || typeof obj !== 'object') {
      return false
    }

    const keys = path.split('.')
    const lastKey = keys.pop()
    
    if (!lastKey) {
      return false
    }

    let current = obj
    for (const key of keys) {
      if (!this.isObject(current[key])) {
        return false
      }
      current = current[key] as Record<string, unknown>
    }

    if (lastKey in current) {
      delete current[lastKey]
      return true
    }

    return false
  }

  /**
   * 获取对象的所有键路径
   * @param obj 目标对象
   * @param prefix 路径前缀
   * @returns 所有路径数组
   * @example
   * ```typescript
   * const obj = { 
   *   user: { 
   *     profile: { name: 'Alice', age: 25 },
   *     settings: { theme: 'dark' }
   *   }
   * }
   * ObjectUtils.getPaths(obj)
   * // ['user.profile.name', 'user.profile.age', 'user.settings.theme']
   * ```
   */
  static getPaths(obj: Record<string, unknown>, prefix: string = ''): string[] {
    const paths: string[] = []

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = prefix ? `${prefix}.${key}` : key
        const value = obj[key]

        if (this.isObject(value)) {
          paths.push(...this.getPaths(value, currentPath))
        } else {
          paths.push(currentPath)
        }
      }
    }

    return paths
  }

  /**
   * 扁平化对象，将嵌套对象转换为单层对象
   * @param obj 目标对象
   * @param separator 分隔符
   * @returns 扁平化后的对象
   * @example
   * ```typescript
   * const obj = { 
   *   user: { 
   *     profile: { name: 'Alice', age: 25 },
   *     active: true
   *   }
   * }
   * ObjectUtils.flatten(obj)
   * // { 'user.profile.name': 'Alice', 'user.profile.age': 25, 'user.active': true }
   * ```
   */
  static flatten(obj: Record<string, unknown>, separator: string = '.'): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    function flattenRecursive(current: Record<string, unknown>, prefix: string = '') {
      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          const newKey = prefix ? `${prefix}${separator}${key}` : key
          const value = current[key]

          if (ObjectUtils.isObject(value)) {
            flattenRecursive(value, newKey)
          } else {
            result[newKey] = value
          }
        }
      }
    }

    flattenRecursive(obj)
    return result
  }

  /**
   * 反扁平化对象，将单层对象转换为嵌套对象
   * @param obj 扁平化的对象
   * @param separator 分隔符
   * @returns 嵌套对象
   * @example
   * ```typescript
   * const flatObj = { 
   *   'user.profile.name': 'Alice', 
   *   'user.profile.age': 25, 
   *   'user.active': true 
   * }
   * ObjectUtils.unflatten(flatObj)
   * // { user: { profile: { name: 'Alice', age: 25 }, active: true } }
   * ```
   */
  static unflatten(obj: Record<string, unknown>, separator: string = '.'): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.set(result, key.replace(new RegExp('\\' + separator, 'g'), '.'), obj[key])
      }
    }

    return result
  }

  /**
   * 过滤对象属性
   * @param obj 目标对象
   * @param predicate 过滤函数
   * @returns 过滤后的对象
   * @example
   * ```typescript
   * const obj = { a: 1, b: 2, c: 3, d: 4 }
   * const result = ObjectUtils.filter(obj, (value, key) => value > 2)
   * // { c: 3, d: 4 }
   * ```
   */
  static filter<T extends Record<string, unknown>>(
    obj: T,
    predicate: (value: unknown, key: string) => boolean
  ): Partial<T> {
    const result: Partial<T> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
        result[key] = obj[key]
      }
    }

    return result
  }

  /**
   * 映射对象属性值
   * @param obj 目标对象
   * @param mapper 映射函数
   * @returns 映射后的对象
   * @example
   * ```typescript
   * const obj = { a: 1, b: 2, c: 3 }
   * const result = ObjectUtils.map(obj, (value, key) => value * 2)
   * // { a: 2, b: 4, c: 6 }
   * ```
   */
  static map<T extends Record<string, unknown>, U>(
    obj: T,
    mapper: (value: unknown, key: string) => U
  ): Record<string, U> {
    const result: Record<string, U> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = mapper(obj[key], key)
      }
    }

    return result
  }
}

// 导出便捷函数
export const {
  deepMerge,
  deepClone,
  isObject,
  get,
  set,
  has,
  unset,
  getPaths,
  flatten,
  unflatten,
  filter,
  map,
} = ObjectUtils