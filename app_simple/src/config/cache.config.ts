/**
 * Cache 插件配置
 */
import type { Ref } from 'vue'
import type { CacheOptions } from '@ldesign/cache'

export const createCacheConfig = (localeRef: Ref<string>) => ({
  globalPropertyName: '$cache',
  defaultEngine: 'localStorage',
  defaultTTL: 24 * 60 * 60 * 1000, // 24小时
  namespace: 'ldesign-app',
  security: {
    encryption: {
      enabled: false
    },
    obfuscation: {
      enabled: false
    },
  },
  engines: {
    memory: {
      maxSize: 10 * 1024 * 1024 // 10MB
    },
    localStorage: {
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  },
  // 启用版本管理
  version: {
    current: '1.0.0',
    compatibleVersions: ['1.0.0']
  }
} as CacheOptions & { globalPropertyName: string })

