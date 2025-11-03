/**
 * 高性能深拷贝工具
 * 
 * 提供多种克隆策略,支持循环引用检测和深度限制
 * 
 * @packageDocumentation
 */

/**
 * 深拷贝选项
 */
export interface DeepCloneOptions {
  /** 最大深度限制 */
  maxDepth?: number
  /** 是否忽略循环引用 (忽略时返回 undefined) */
  ignoreCircular?: boolean
  /** 是否使用原生 structuredClone (如果可用) */
  useNative?: boolean
}

/**
 * 高性能深拷贝
 * 
 * 优先使用原生 structuredClone API (性能提升 3-5x)
 * 回退到自定义实现,支持循环引用和深度限制
 * 
 * @param value - 要克隆的值
 * @param options - 克隆选项
 * @returns 克隆后的值
 * 
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } }
 * const cloned = deepClone(original)
 * 
 * // 带选项
 * const cloned2 = deepClone(original, {
 *   maxDepth: 5,
 *   ignoreCircular: true
 * })
 * ```
 */
export function deepClone<T>(value: T, options: DeepCloneOptions = {}): T {
  const {
    maxDepth = 10,
    ignoreCircular = false,
    useNative = true,
  } = options

  // 1. 优先使用原生 API (性能最优)
  if (useNative && typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(value)
    } catch (error) {
      // 回退到自定义实现
      // 某些类型 (如函数) 不支持 structuredClone
    }
  }

  // 2. 自定义实现 (处理循环引用和深度限制)
  const seen = new WeakMap<object, any>()

  function clone(obj: any, depth: number): any {
    // 原始类型
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    // 深度限制 (在检查类型之后)
    if (depth >= maxDepth) {
      throw new Error(`深拷贝深度超过限制: ${maxDepth}`)
    }

    // 循环引用检测
    if (seen.has(obj)) {
      if (ignoreCircular) {
        return undefined
      }
      return seen.get(obj)
    }

    // 特殊对象类型
    if (obj instanceof Date) {
      return new Date(obj.getTime())
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags)
    }

    if (obj instanceof Map) {
      const map = new Map()
      seen.set(obj, map)
      obj.forEach((value, key) => {
        map.set(key, clone(value, depth + 1))
      })
      return map
    }

    if (obj instanceof Set) {
      const set = new Set()
      seen.set(obj, set)
      obj.forEach((value) => {
        set.add(clone(value, depth + 1))
      })
      return set
    }

    // 数组
    if (Array.isArray(obj)) {
      const arr: any[] = []
      seen.set(obj, arr)
      for (let i = 0; i < obj.length; i++) {
        arr[i] = clone(obj[i], depth + 1)
      }
      return arr
    }

    // 普通对象
    const cloned: any = Object.create(Object.getPrototypeOf(obj))
    seen.set(obj, cloned)

    // 复制所有可枚举属性
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      cloned[key] = clone(obj[key], depth + 1)
    }

    return cloned
  }

  return clone(value, 0)
}

/**
 * 浅拷贝
 * 
 * 只复制第一层属性,性能最优
 * 
 * @param value - 要克隆的值
 * @returns 克隆后的值
 * 
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } }
 * const cloned = shallowClone(original)
 * // cloned.b === original.b (引用相同)
 * ```
 */
export function shallowClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    return [...value] as any
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as any
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as any
  }

  if (value instanceof Map) {
    return new Map(value) as any
  }

  if (value instanceof Set) {
    return new Set(value) as any
  }

  return { ...value }
}

/**
 * 检测循环引用
 * 
 * @param obj - 要检测的对象
 * @returns 是否存在循环引用
 * 
 * @example
 * ```typescript
 * const obj: any = { a: 1 }
 * obj.self = obj
 * 
 * hasCircularReference(obj) // true
 * ```
 */
export function hasCircularReference(obj: any): boolean {
  const seen = new WeakSet<object>()

  function detect(value: any): boolean {
    if (value === null || typeof value !== 'object') {
      return false
    }

    if (seen.has(value)) {
      return true
    }

    seen.add(value)

    if (Array.isArray(value)) {
      return value.some(item => detect(item))
    }

    return Object.values(value).some(val => detect(val))
  }

  return detect(obj)
}

/**
 * 计算对象深度
 *
 * @param obj - 要计算的对象
 * @returns 对象深度
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 1 } } }
 * getObjectDepth(obj) // 3
 * ```
 */
export function getObjectDepth(obj: any): number {
  if (obj === null || typeof obj !== 'object') {
    return 0
  }

  const seen = new WeakSet<object>()

  function getDepth(value: any): number {
    if (value === null || typeof value !== 'object') {
      return 0
    }

    if (seen.has(value)) {
      return 0
    }

    seen.add(value)

    let maxDepth = 0

    if (Array.isArray(value)) {
      for (const item of value) {
        maxDepth = Math.max(maxDepth, getDepth(item))
      }
    } else {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          maxDepth = Math.max(maxDepth, getDepth(value[key]))
        }
      }
    }

    return maxDepth + 1
  }

  return getDepth(obj)
}

/**
 * 冻结对象 (深度冻结)
 * 
 * @param obj - 要冻结的对象
 * @returns 冻结后的对象
 * 
 * @example
 * ```typescript
 * const obj = { a: { b: 1 } }
 * const frozen = deepFreeze(obj)
 * frozen.a.b = 2 // 抛出错误 (严格模式)
 * ```
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const seen = new WeakSet<object>()

  function freeze(value: any): void {
    if (value === null || typeof value !== 'object') {
      return
    }

    if (seen.has(value)) {
      return
    }

    seen.add(value)
    Object.freeze(value)

    if (Array.isArray(value)) {
      value.forEach(item => freeze(item))
    } else {
      Object.values(value).forEach(val => freeze(val))
    }
  }

  freeze(obj)
  return obj as Readonly<T>
}

