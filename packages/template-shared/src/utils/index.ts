/**
 * 共享工具函数
 * 跨框架共享的工具函数
 */

/**
 * 类名组合工具
 */
export function classNames(...args: any[]): string {
  const classes: string[] = []
  
  for (const arg of args) {
    if (!arg) continue
    
    const argType = typeof arg
    
    if (argType === 'string' || argType === 'number') {
      classes.push(String(arg))
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg)
      if (inner) {
        classes.push(inner)
      }
    } else if (argType === 'object') {
      for (const key in arg) {
        if (arg[key]) {
          classes.push(key)
        }
      }
    }
  }
  
  return classes.join(' ')
}

/**
 * 获取设备类型
 */
export function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') {
    return 'desktop'
  }
  
  const width = window.innerWidth
  
  if (width < 768) {
    return 'mobile'
  } else if (width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 检测是否支持触摸
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

/**
 * 获取滚动条宽度
 */
export function getScrollbarWidth(): number {
  if (typeof document === 'undefined') {
    return 0
  }
  
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll'
  document.body.appendChild(outer)
  
  const inner = document.createElement('div')
  outer.appendChild(inner)
  
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
  
  outer.parentNode?.removeChild(outer)
  
  return scrollbarWidth
}

/**
 * 锁定滚动
 */
export function lockScroll(): void {
  if (typeof document === 'undefined') return
  
  const scrollbarWidth = getScrollbarWidth()
  const originalPaddingRight = document.body.style.paddingRight
  const originalOverflow = document.body.style.overflow
  
  document.body.style.paddingRight = `${scrollbarWidth}px`
  document.body.style.overflow = 'hidden'
  
  // 存储原始值以便恢复
  ;(document.body as any).__originalStyles = {
    paddingRight: originalPaddingRight,
    overflow: originalOverflow,
  }
}

/**
 * 解锁滚动
 */
export function unlockScroll(): void {
  if (typeof document === 'undefined') return
  
  const originalStyles = (document.body as any).__originalStyles
  
  if (originalStyles) {
    document.body.style.paddingRight = originalStyles.paddingRight
    document.body.style.overflow = originalStyles.overflow
    delete (document.body as any).__originalStyles
  }
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') {
    return false
  }
  
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
  } catch {
    return false
  }
}

/**
 * 下载文件
 */
export function downloadFile(url: string, filename?: string): void {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || url.split('/').pop() || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 生成唯一ID（跨框架版本）
 */
let idCounter = 0
export function generateUniqueId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = date instanceof Date ? date : new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 解析查询字符串
 */
export function parseQueryString(query: string): Record<string, string> {
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(query)
  
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

/**
 * 检测是否在浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * 检测是否在服务器环境
 */
export function isServer(): boolean {
  return !isBrowser()
}

/**
 * 获取环境变量
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || defaultValue
  }
  
  return defaultValue
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T = any>(
  json: string,
  fallback?: T
): T | undefined {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * 深度冻结对象
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj)
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop]
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })
  
  return obj
}

/**
 * 创建事件发射器（跨框架）
 */
export class EventEmitter {
  private events = new Map<string, Set<Function>>()
  
  on(event: string, handler: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
  }
  
  off(event: string, handler: Function): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.events.delete(event)
      }
    }
  }
  
  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(...args))
    }
  }
  
  once(event: string, handler: Function): void {
    const wrapper = (...args: any[]) => {
      handler(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
  
  clear(event?: string): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
}

/**
 * Promise超时包装
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeout)
    ),
  ])
}

/**
 * 批处理函数
 */
export function batch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const batches: T[][] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  
  return Promise.all(batches.map(processor)).then(results =>
    results.flat()
  )
}

export default {}
