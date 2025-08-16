/**
 * 核心工具函数
 */

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach(key => {
      ;(cloned as any)[key] = deepClone((obj as any)[key])
    })
    return cloned
  }

  return obj
}

/**
 * 检查两个值是否深度相等
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a == null || b == null) return false

  if (typeof a !== typeof b) return false

  if (typeof a !== 'object') return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }

  return true
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 获取对象的嵌套属性值
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

/**
 * 设置对象的嵌套属性值
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!

  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)

  target[lastKey] = value
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * 类型守卫：检查是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

/**
 * 类型守卫：检查是否为对象
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object'
}

/**
 * 类型守卫：检查是否为 Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return value && typeof value.then === 'function'
}
