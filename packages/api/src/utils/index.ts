/**
 * 工具函数
 */

/**
 * 检查输入是否有效
 */
export function isValidInput(input: unknown): boolean {
  return input != null
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        )
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 检查是否为对象
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxAttempts) {
        throw lastError
      }

      // 指数退避
      const backoffDelay = delay * 2 ** (attempt - 1)
      await sleep(backoffDelay)
    }
  }

  throw new Error(lastError?.message || 'All retry attempts failed')
}

/**
 * 睡眠函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 格式化错误信息
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    return (
      (errorObj.message as string) ||
      (errorObj.msg as string) ||
      JSON.stringify(error)
    )
  }

  return String(error)
}

/**
 * 检查是否为空值
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T = unknown>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

/**
 * 安全的 JSON 字符串化
 */
export function safeJsonStringify(obj: unknown, defaultValue = '{}'): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return defaultValue
  }
}

/**
 * 获取嵌套对象属性值
 */
export function get(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown
): unknown {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * 设置嵌套对象属性值
 */
export function set(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[lastKey] = value
}
