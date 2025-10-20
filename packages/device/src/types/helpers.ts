/**
 * 辅助类型定义
 */

// Navigator 扩展类型
export type ExtendedNavigator = Navigator & {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
  getBattery?: () => Promise<any>
  battery?: any
  mozBattery?: any
  webkitBattery?: any
  deviceMemory?: number
  hardwareConcurrency?: number
}

// Network Information API
export interface NetworkInformation {
  type?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  addEventListener?: (type: string, listener: () => void) => void
  removeEventListener?: (type: string, listener: () => void) => void
}

// Battery Manager API
export interface BatteryManager {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

// Performance 扩展类型
export interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

// Window 扩展类型
export type ExtendedWindow = Window & {
  ononline?: (() => void) | null
  onoffline?: (() => void) | null
}

// Engine Context 类型
export interface EngineContext {
  engine?: {
    getApp: () => unknown
    state?: {
      set: (key: string, value: unknown) => void
      get: (key: string) => unknown
      delete: (key: string) => void
    }
    events?: {
      on: (event: string, handler: () => void) => void
      once: (event: string, handler: () => void) => void
    }
    logger?: {
      info: (message: string, data?: unknown) => void
      error: (message: string, data?: unknown) => void
      warn: (message: string, data?: unknown) => void
    }
  }
}

// 通用函数类型
export type AnyFunction = (...args: unknown[]) => unknown
export type AnyAsyncFunction = (...args: unknown[]) => Promise<unknown>

// 通用对象类型
export type AnyObject = Record<string, unknown>

// Vue Directive Binding 类型
export interface DirectiveBinding<T = unknown> {
  value: T
  oldValue: T | undefined
  arg?: string
  modifiers: Record<string, boolean>
  instance: unknown
  dir: unknown
}

// HTML Element 扩展类型
export type ExtendedHTMLElement = HTMLElement & Record<string, unknown>