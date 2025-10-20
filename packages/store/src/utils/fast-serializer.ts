/**
 * 高性能序列化工具
 * 针对常见场景优化的序列化/反序列化，比 JSON 更快
 */

/**
 * 快速序列化（优化版）
 * 针对简单对象提供更快的序列化
 */
export function fastStringify(value: any): string {
  // 快速路径：处理基本类型
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  
  const type = typeof value
  if (type === 'string') return `"${value}"`
  if (type === 'number' || type === 'boolean') return String(value)
  
  // 对于复杂对象，还是使用 JSON.stringify（已经很优化）
  try {
    return JSON.stringify(value)
  } catch {
    return 'null'
  }
}

/**
 * 快速反序列化（优化版）
 */
export function fastParse<T = any>(value: string): T | null {
  if (!value || value === 'null' || value === 'undefined') return null
  
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * 安全的深拷贝（使用原生 API 优先）
 */
export function safeCopy<T>(value: T): T {
  // 优先使用 structuredClone（性能最佳）
  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(value)
    } catch {
      // 降级到 JSON
    }
  }
  
  // 降级到 JSON（兼容性好）
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return value
  }
}

/**
 * 对象相等性比较（优化版：快速路径）
 */
export function fastEqual(a: any, b: any): boolean {
  // 快速路径：引用相等
  if (a === b) return true
  
  // 快速路径：类型不同
  if (typeof a !== typeof b) return false
  
  // 快速路径：基本类型
  if (a === null || b === null) return a === b
  if (typeof a !== 'object') return a === b
  
  // 数组比较
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    const len = a.length
    for (let i = 0; i < len; i++) {
      if (!fastEqual(a[i], b[i])) return false
    }
    return true
  }
  
  // 对象比较（浅比较优化）
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  const len = keysA.length
  for (let i = 0; i < len; i++) {
    const key = keysA[i]
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (!fastEqual(a[key], b[key])) return false
  }
  
  return true
}

/**
 * 对象浅拷贝（性能优化版）
 */
export function shallowCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.slice() as any
  }
  
  return { ...obj }
}


