import type { CacheOptions } from './types'
import { CacheManager } from './core/cache-manager'

export type CachePreset = 'browser' | 'ssr' | 'node' | 'offline'

export function getPresetOptions(preset: CachePreset): CacheOptions {
  switch (preset) {
    case 'browser':
      return {
        defaultEngine: 'localStorage',
        debug: false,
        strategy: {
          enabled: true,
          enginePriority: ['localStorage', 'sessionStorage', 'indexedDB', 'memory', 'cookie'],
          sizeThresholds: { small: 8 * 1024, medium: 64 * 1024, large: 512 * 1024 },
          ttlThresholds: { short: 60_000, medium: 3_600_000, long: 86_400_000 },
        },
        cleanupInterval: 60_000,
      }
    case 'ssr':
      return {
        defaultEngine: 'memory',
        debug: false,
        strategy: { enabled: false },
        cleanupInterval: 0,
      }
    case 'node':
      return {
        defaultEngine: 'memory',
        debug: false,
        strategy: { enabled: false },
        cleanupInterval: 60_000,
      }
    case 'offline':
      return {
        defaultEngine: 'indexedDB',
        debug: false,
        strategy: {
          enabled: true,
          enginePriority: ['indexedDB', 'localStorage', 'sessionStorage', 'memory', 'cookie'],
          sizeThresholds: { small: 16 * 1024, medium: 128 * 1024, large: 1024 * 1024 },
          ttlThresholds: { short: 5 * 60_000, medium: 12 * 60_000, long: 7 * 24 * 60_000 },
        },
        cleanupInterval: 120_000,
      }
  }
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

