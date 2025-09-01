/**
 * 环境管理类型定义
 * 包含环境信息、管理器等相关类型
 */

import type { Environment, EnvironmentInfo } from './base'

// 环境管理器接口
export interface EnvironmentManager {
  get: () => Environment
  set: (env: Environment) => void
  is: (env: Environment) => boolean
  isDevelopment: () => boolean
  isProduction: () => boolean
  isTest: () => boolean
  isStaging: () => boolean
  getInfo: () => EnvironmentInfo
  getConfig: () => EnvironmentConfig
  setConfig: (config: Partial<EnvironmentConfig>) => void
  detect: () => Environment
}

// 环境配置
export interface EnvironmentConfig {
  name: Environment
  debug: boolean
  verbose: boolean
  strict: boolean
  features: Record<string, boolean>
  variables: Record<string, string>
  overrides: Record<string, unknown>
}

// 环境检测器接口
export interface EnvironmentDetector {
  detect: () => Environment
  detectBrowser: () => BrowserInfo
  detectOS: () => OSInfo
  detectDevice: () => DeviceInfo
  detectNetwork: () => NetworkInfo
  detectCapabilities: () => CapabilityInfo
}

// 浏览器信息
export interface BrowserInfo {
  name: string
  version: string
  engine: string
  engineVersion: string
  userAgent: string
  language: string
  languages: string[]
  cookieEnabled: boolean
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
  webGL: boolean
  webRTC: boolean
  serviceWorker: boolean
  pushManager: boolean
}

// 操作系统信息
export interface OSInfo {
  name: string
  version: string
  architecture: string
  platform: string
  family: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  isRetina: boolean
  pixelRatio: number
}

// 设备信息
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'console' | 'unknown'
  brand?: string
  model?: string
  screen: ScreenInfo
  orientation: OrientationInfo
  battery?: BatteryInfo
  connection?: ConnectionInfo
  memory?: MemoryInfo
  storage?: StorageInfo
}

// 屏幕信息
export interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelDepth: number
  orientation: ScreenOrientation
}

// 屏幕方向
export interface ScreenOrientation {
  type:
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary'
  angle: number
}

// 方向信息
export interface OrientationInfo {
  alpha: number | null
  beta: number | null
  gamma: number | null
  absolute: boolean
}

// 电池信息
export interface BatteryInfo {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

// 连接信息
export interface ConnectionInfo {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
  downlink: number
  rtt: number
  saveData: boolean
}

// 内存信息
export interface MemoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

// 存储信息
export interface StorageInfo {
  quota: number
  usage: number
  available: number
}

// 网络信息
export interface NetworkInfo {
  type: string
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
  online: boolean
  connectionType: string
}

// 能力信息
export interface CapabilityInfo {
  webGL: boolean
  webRTC: boolean
  serviceWorker: boolean
  pushManager: boolean
  notifications: boolean
  geolocation: boolean
  camera: boolean
  microphone: boolean
  bluetooth: boolean
  nfc: boolean
  vibration: boolean
  deviceMotion: boolean
  deviceOrientation: boolean
  touch: boolean
  pointer: boolean
  mediaSession: boolean
  webAudio: boolean
  webAnimations: boolean
  intersectionObserver: boolean
  resizeObserver: boolean
  mutationObserver: boolean
}

// 环境变量管理器
export interface EnvironmentVariableManager {
  get: (key: string) => string | undefined
  set: (key: string, value: string) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  getAll: () => Record<string, string>
  load: (env: Environment) => void
  export: () => Record<string, string>
  import: (variables: Record<string, string>) => void
}

// 环境特性管理器
export interface EnvironmentFeatureManager {
  enable: (feature: string) => void
  disable: (feature: string) => void
  isEnabled: (feature: string) => boolean
  getEnabled: () => string[]
  getDisabled: () => string[]
  getAll: () => Record<string, boolean>
  setFeatures: (features: Record<string, boolean>) => void
  reset: () => void
}

// 环境覆盖管理器
export interface EnvironmentOverrideManager {
  set: (key: string, value: unknown) => void
  get: (key: string) => unknown
  has: (key: string) => boolean
  delete: (key: string) => boolean
  getAll: () => Record<string, unknown>
  clear: () => void
  apply: (target: Record<string, unknown>) => void
}

// 环境验证器
export interface EnvironmentValidator {
  validate: (env: Environment) => EnvironmentValidationResult
  validateConfig: (config: EnvironmentConfig) => EnvironmentValidationResult
  validateFeatures: (
    features: Record<string, boolean>
  ) => EnvironmentValidationResult
  validateVariables: (
    variables: Record<string, string>
  ) => EnvironmentValidationResult
  getSchema: () => unknown
  setSchema: (schema: unknown) => void
}

// 环境验证结果
export interface EnvironmentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}
