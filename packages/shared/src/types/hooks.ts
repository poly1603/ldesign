/**
 * Hook 相关类型定义
 */

import type { Ref, ComputedRef } from 'vue'
import type {
  HttpMethod,
  PaginationParams,
  PaginationResponse,
  FormRule,
  UserInfo,
  GeolocationPosition
} from './common'

// ==================== 通用 Hook 类型 ====================

/**
 * Hook 返回值基础类型
 */
export interface UseHookReturn<T = any> {
  data: Ref<T>
  loading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * 异步 Hook 配置类型
 */
export interface UseAsyncOptions<T = any> {
  immediate?: boolean
  resetOnExecute?: boolean
  shallow?: boolean
  throwOnFailed?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

/**
 * 异步 Hook 返回值类型
 */
export interface UseAsyncReturn<T = any> extends UseHookReturn<T> {
  execute: (...args: any[]) => Promise<T>
  cancel: () => void
  refresh: () => Promise<T>
  reset: () => void
}

// ==================== 数据获取 Hook 类型 ====================

/**
 * Fetch Hook 配置类型
 */
export interface UseFetchOptions extends UseAsyncOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retry?: number
  retryDelay?: number
  cache?: boolean
  refetch?: boolean
}

/**
 * Fetch Hook 返回值类型
 */
export interface UseFetchReturn<T = any> extends UseAsyncReturn<T> {
  response: Ref<Response | null>
  status: ComputedRef<number | null>
  statusText: ComputedRef<string | null>
  isFinished: ComputedRef<boolean>
  canAbort: ComputedRef<boolean>
  isCanceled: ComputedRef<boolean>
  abort: () => void
  get: () => Promise<T>
  post: (payload?: any) => Promise<T>
  put: (payload?: any) => Promise<T>
  delete: () => Promise<T>
  patch: (payload?: any) => Promise<T>
}

// ==================== 表单 Hook 类型 ====================

/**
 * 表单字段状态类型
 */
export interface FormFieldState<T = any> {
  value: T
  error: string | null
  touched: boolean
  dirty: boolean
  valid: boolean
}

/**
 * 表单验证规则类型（Hook专用）
 */
export interface FormValidationRule<T = any> extends FormRule {
  validator?: (value: T) => boolean | string | Promise<boolean | string>
}

/**
 * 表单配置类型
 */
export interface UseFormOptions<T = Record<string, any>> {
  initialValues?: Partial<T>
  validationRules?: Partial<Record<keyof T, FormValidationRule[]>>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  resetOnSubmit?: boolean
}

/**
 * 表单 Hook 返回值类型
 */
export interface UseFormReturn<T = Record<string, any>> {
  values: Ref<T>
  errors: Ref<Partial<Record<keyof T, string>>>
  touched: Ref<Partial<Record<keyof T, boolean>>>
  dirty: Ref<boolean>
  valid: Ref<boolean>
  isSubmitting: Ref<boolean>
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  setError: <K extends keyof T>(field: K, error: string) => void
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void
  validate: (field?: keyof T) => Promise<boolean>
  reset: (values?: Partial<T>) => void
  submit: (onSubmit: (values: T) => void | Promise<void>) => Promise<void>
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (event?: Event) => Promise<void>
}

// ==================== 存储 Hook 类型 ====================

/**
 * 存储 Hook 配置类型（通用）
 */
export interface UseStorageOptionsBase<T> {
  onError?: (error: Error) => void
  syncAcrossTabs?: boolean
  writeDefaults?: boolean
}

/**
 * 存储 Hook 返回值类型
 */
export interface UseStorageReturn<T> {
  value: Ref<T>
  remove: () => void
  clear: () => void
}

// ==================== 网络 Hook 类型 ====================

/**
 * 网络状态类型
 */
export interface NetworkState {
  online: boolean
  downlink?: number
  downlinkMax?: number
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  rtt?: number
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
}

/**
 * 网络 Hook 返回值类型
 */
export interface UseNetworkReturn extends NetworkState {
  isOnline: Ref<boolean>
  isOffline: ComputedRef<boolean>
  connection: Ref<NetworkState>
}

// ==================== 设备 Hook 类型 ====================

/**
 * 设备方向类型
 */
export interface DeviceOrientation {
  alpha: number | null
  beta: number | null
  gamma: number | null
  absolute: boolean
}

/**
 * 设备运动类型
 */
export interface DeviceMotion {
  acceleration: {
    x: number | null
    y: number | null
    z: number | null
  } | null
  accelerationIncludingGravity: {
    x: number | null
    y: number | null
    z: number | null
  } | null
  rotationRate: {
    alpha: number | null
    beta: number | null
    gamma: number | null
  } | null
  interval: number
}

// ==================== 媒体 Hook 类型 ====================

/**
 * 媒体查询 Hook 返回值类型
 */
export interface UseMediaQueryReturn {
  matches: Ref<boolean>
  media: string
}

/**
 * 暗黑模式 Hook 返回值类型
 */
export interface UseDarkModeReturn {
  isDark: Ref<boolean>
  toggle: () => void
  enable: () => void
  disable: () => void
  auto: () => void
}

// ==================== 工具 Hook 类型 ====================

/**
 * 防抖 Hook 配置类型
 */
export interface UseDebounceOptions {
  delay?: number
  immediate?: boolean
  maxWait?: number
}

/**
 * 防抖 Hook 返回值类型
 */
export interface UseDebounceReturn<T extends (...args: any[]) => any> {
  debouncedFn: T
  cancel: () => void
  flush: () => void
  pending: Ref<boolean>
}

/**
 * 节流 Hook 配置类型
 */
export interface UseThrottleOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
}

/**
 * 节流 Hook 返回值类型
 */
export interface UseThrottleReturn<T extends (...args: any[]) => any> {
  throttledFn: T
  cancel: () => void
  flush: () => void
}

/**
 * 剪贴板 Hook 返回值类型
 */
export interface UseClipboardReturn {
  text: Ref<string>
  isSupported: boolean
  copy: (text: string) => Promise<void>
  read: () => Promise<string>
}

/**
 * 全屏 Hook 返回值类型
 */
export interface UseFullscreenReturn {
  isFullscreen: Ref<boolean>
  isSupported: boolean
  enter: (element?: HTMLElement) => Promise<void>
  exit: () => Promise<void>
  toggle: (element?: HTMLElement) => Promise<void>
}

/**
 * 地理位置 Hook 配置类型
 */
export interface UseGeolocationOptions extends PositionOptions {
  immediate?: boolean
}

/**
 * 地理位置 Hook 返回值类型
 */
export interface UseGeolocationReturn {
  coords: Ref<GeolocationCoordinates | null>
  position: Ref<GeolocationPosition | null>
  error: Ref<GeolocationPositionError | null>
  isSupported: boolean
  resume: () => void
  pause: () => void
}
