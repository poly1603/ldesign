import type { CacheOptions } from './types'
import { CacheManager } from './core/cache-manager'

/**
 * 所有支持的缓存预设类型
 */
export type CachePreset = 'browser' | 'ssr' | 'node' | 'offline' | 'memory' | 'session'

/**
 * 预设配置映射表
 * 统一管理所有预设配置，避免重复定义
 */
const PRESET_CONFIG_MAP: Record<CachePreset, CacheOptions> = {
  // 浏览器环境预设 - 使用localStorage作为主存储
  browser: {
    defaultEngine: 'localStorage',
    debug: false,
    engines: {
      memory: { enabled: true },
      localStorage: { enabled: true },
    },
    strategy: {
      enabled: true,
      enginePriority: ['localStorage', 'sessionStorage', 'indexedDB', 'memory', 'cookie'],
      sizeThresholds: { small: 8 * 1024, medium: 64 * 1024, large: 512 * 1024 },
      ttlThresholds: { short: 60_000, medium: 3_600_000, long: 86_400_000 },
    },
    cleanupInterval: 60_000,
  },

  // SSR环境预设 - 仅使用内存存储
  ssr: {
    defaultEngine: 'memory',
    debug: false,
    strategy: { enabled: false },
    cleanupInterval: 0,
  },

  // Node.js环境预设 - 仅使用内存存储
  node: {
    defaultEngine: 'memory',
    debug: false,
    strategy: { enabled: false },
    cleanupInterval: 60_000,
  },

  // 离线优先预设 - 使用IndexedDB作为主存储
  offline: {
    defaultEngine: 'indexedDB',
    debug: false,
    strategy: {
      enabled: true,
      enginePriority: ['indexedDB', 'localStorage', 'sessionStorage', 'memory', 'cookie'],
      sizeThresholds: { small: 16 * 1024, medium: 128 * 1024, large: 1024 * 1024 },
      ttlThresholds: { short: 5 * 60_000, medium: 12 * 60_000, long: 7 * 24 * 60_000 },
    },
    cleanupInterval: 120_000,
  },

  // 纯内存预设 - 仅使用内存存储（最快）
  memory: {
    defaultEngine: 'memory',
    engines: {
      memory: { enabled: true },
    },
    strategy: { enabled: false },
    cleanupInterval: 30_000,
  },

  // 会话存储预设 - 使用sessionStorage
  session: {
    defaultEngine: 'sessionStorage',
    engines: {
      memory: { enabled: true },
      sessionStorage: { enabled: true },
    },
    strategy: { enabled: false },
    cleanupInterval: 60_000,
  },
}

/**
 * 获取预设配置选项
 *
 * @param preset - 预设类型
 * @returns 缓存配置选项
 */
export function getPresetOptions(preset: CachePreset): CacheOptions {
  const config = PRESET_CONFIG_MAP[preset]
  if (!config) {
    throw new Error(`Unknown preset: ${preset}`)
  }
  // 返回深拷贝以避免修改原始配置
  return JSON.parse(JSON.stringify(config))
}

export function createBrowserCache(overrides?: Partial<CacheOptions>) {
  return new CacheManager({ ...getPresetOptions('browser'), ...overrides })
}

export function createSSRCache(overrides?: Partial<CacheOptions>) {
  return new CacheManager({ ...getPresetOptions('ssr'), ...overrides })
}

export function createNodeCache(overrides?: Partial<CacheOptions>) {
  return new CacheManager({ ...getPresetOptions('node'), ...overrides })
}

export function createOfflineCache(overrides?: Partial<CacheOptions>) {
  return new CacheManager({ ...getPresetOptions('offline'), ...overrides })
}

