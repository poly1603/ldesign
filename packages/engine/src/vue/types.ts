import type { ComputedRef, Ref } from 'vue'
import type { Engine } from '../types'

/**
 * Vue应用增强类型
 */
declare module 'vue' {
  interface ComponentCustomProperties {
    $engine: Engine
  }

  interface App {
    engine?: Engine
  }
}

/**
 * 全局属性增强
 */
declare global {
  interface Window {
    __LDESIGN_ENGINE__?: Engine
  }
}

/**
 * 组合式函数返回类型
 */
export interface UseEngineReturn {
  engine: Engine
  config: Engine['config']
  state: Engine['state']
  events: Engine['events']
  plugins: Engine['plugins']
  middleware: Engine['middleware']
  notifications: Engine['notifications']
  cache: Engine['cache']
  performance: Engine['performance']
  errors: Engine['errors']
  logger: Engine['logger']
}

/**
 * 状态管理返回类型
 */
export interface UseStateReturn<T> {
  value: Ref<T>
  setValue: (newValue: T) => void
  reset: () => void
}

/**
 * 异步操作返回类型
 */
export interface UseAsyncReturn<T, Args extends unknown[] = []> {
  data: ComputedRef<T | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  success: ComputedRef<boolean>
  execute: (...args: Args) => Promise<T | null>
  reset: () => void
  cancel: () => void
}

/**
 * 性能监控返回类型
 */
export interface UsePerformanceReturn {
  metrics: ComputedRef<Record<string, number>>
  fps: ComputedRef<number>
  memoryUsage: ComputedRef<{ used: number; total: number }>
  startMeasure: (name: string) => void
  endMeasure: (name: string) => void
  getReport: () => unknown
  clearMeasures: () => void
}

/**
 * 表单管理返回类型
 */
export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T
  errors: ComputedRef<Record<keyof T, string | null>>
  touched: ComputedRef<Record<keyof T, boolean>>
  dirty: ComputedRef<Record<keyof T, boolean>>
  submitting: ComputedRef<boolean>
  valid: ComputedRef<boolean>
  hasErrors: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>
  isTouched: ComputedRef<boolean>
  setFieldValue: (fieldName: keyof T, value: T[keyof T]) => void
  setFieldTouched: (fieldName: keyof T, isTouched?: boolean) => void
  setFieldError: (fieldName: keyof T, error: string | null) => void
  validateField: (fieldName: keyof T) => Promise<string | null>
  validate: () => Promise<boolean>
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (event?: Event) => Promise<void>
  reset: () => void
}

/**
 * 通知管理返回类型
 */
export interface UseNotificationsReturn {
  notifications: ComputedRef<unknown[]>
  show: (message: string, options?: unknown) => string
  success: (message: string, options?: unknown) => string
  error: (message: string, options?: unknown) => string
  warning: (message: string, options?: unknown) => string
  info: (message: string, options?: unknown) => string
  remove: (id: string) => void
  clear: () => void
}

/**
 * 对话框管理返回类型
 */
export interface UseDialogReturn {
  dialogs: ComputedRef<unknown[]>
  show: (component: unknown, props?: Record<string, unknown>, options?: unknown) => Promise<unknown>
  confirm: (message: string, options?: unknown) => Promise<boolean>
  alert: (message: string, options?: unknown) => Promise<void>
  close: (id: string) => void
  closeAll: () => void
}

/**
 * 主题管理返回类型
 */
export interface UseThemeReturn {
  currentTheme: ComputedRef<string>
  themes: ComputedRef<string[]>
  setTheme: (themeName: string) => void
  toggleDarkMode: () => void
  isDark: ComputedRef<boolean>
}

/**
 * 缓存管理返回类型
 */
export interface UseCacheReturn {
  stats: ComputedRef<unknown>
  get: <T>(key: string, factory?: () => Promise<T> | T) => Promise<T | undefined>
  set: <T>(key: string, value: T, ttl?: number) => void
  has: (key: string) => boolean
  remove: (key: string) => void
  clear: () => void
}

/**
 * 内存管理返回类型
 */
export interface UseMemoryManagerReturn {
  stats: ComputedRef<unknown>
  registerResource: (name: string, resource: unknown) => string
  cleanup: (resourceId?: string) => void
  setTimeout: (callback: () => void, delay: number) => string
  addEventListener: (
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => string
}

/**
 * 工具函数返回类型
 */
export interface UseCounterReturn {
  count: ComputedRef<number>
  increment: (delta?: number) => void
  decrement: (delta?: number) => void
  set: (value: number) => void
  reset: () => void
}

export interface UseToggleReturn {
  0: ComputedRef<boolean>
  1: () => void
  2: (value: boolean) => void
}

export interface UseArrayReturn<T> {
  array: ComputedRef<T[]>
  push: (...items: T[]) => void
  pop: () => T | undefined
  shift: () => T | undefined
  unshift: (...items: T[]) => void
  remove: (item: T) => void
  removeAt: (index: number) => void
  insert: (index: number, ...items: T[]) => void
  clear: () => void
  filter: (predicate: (item: T, index: number) => boolean) => void
  find: (predicate: (item: T, index: number) => boolean) => T | undefined
  findIndex: (predicate: (item: T, index: number) => boolean) => number
  sort: (compareFn?: (a: T, b: T) => number) => void
  reverse: () => void
}

/**
 * 剪贴板返回类型
 */
export interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>
  paste: () => Promise<string | null>
  copied: ComputedRef<boolean>
  isSupported: ComputedRef<boolean>
}

/**
 * 本地存储返回类型
 */
export interface UseLocalStorageReturn<T> {
  0: Ref<T>
  1: (value: T) => void
  2: () => void
}

/**
 * 组件性能监控返回类型
 */
export interface UseComponentPerformanceReturn {
  renderTime: ComputedRef<number>
  updateCount: ComputedRef<number>
  trackUpdate: () => void
}

/**
 * Promise管理返回类型
 */
export interface UsePromiseManagerReturn {
  createManagedPromise: <T>(promise: Promise<T>, timeout?: number) => Promise<T>
  cancelAll: () => void
  activeCount: ComputedRef<number>
}

/**
 * 重试机制返回类型
 */
export interface UseRetryReturn<T, Args extends unknown[] = []> extends UseAsyncReturn<T, Args> {
  retryCount: ComputedRef<number>
  isRetrying: ComputedRef<boolean>
  maxRetries: number
}

/**
 * 并发控制返回类型
 */
export interface UseConcurrentAsyncReturn<T, Args extends unknown[] = []> {
  execute: (...args: Args) => Promise<T>
  queue: ComputedRef<number>
  activeCount: ComputedRef<number>
}

/**
 * 表单字段返回类型
 */
export interface UseFormFieldReturn<T> {
  value: Ref<T>
  error: ComputedRef<string | null>
  touched: ComputedRef<boolean>
  dirty: ComputedRef<boolean>
  valid: ComputedRef<boolean>
  setValue: (newValue: T) => void
  setTouched: (isTouched?: boolean) => void
  validate: () => Promise<boolean>
  reset: () => void
}

/**
 * 时间格式化返回类型
 */
export type UseTimeFormatReturn = ComputedRef<string>

/**
 * 相对时间返回类型
 */
export type UseRelativeTimeReturn = ComputedRef<string>

/**
 * 防抖返回类型
 */
export type UseDebounceReturn<T> = ComputedRef<T>

/**
 * 节流返回类型
 */
export type UseThrottleReturn<T> = ComputedRef<T>

/**
 * 防抖函数返回类型
 */
export type UseDebounceFnReturn<T extends (...args: unknown[]) => unknown> = (...args: Parameters<T>) => void

/**
 * 节流函数返回类型
 */
export type UseThrottleFnReturn<T extends (...args: unknown[]) => unknown> = (...args: Parameters<T>) => void
