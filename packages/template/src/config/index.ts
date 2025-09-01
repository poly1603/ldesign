/**
 * 配置系统导出文件
 * 提供统一的配置管理接口
 */

// 导出配置管理器
// 重新导出类型以便于使用
import type { TemplateSystemConfig } from '../types/config'

// 导出配置类型
export type {
  CacheConfig,
  CacheStrategy,
  ConfigListener,
  ConfigManager,
  ConfigUpdateEvent,
  ConfigValidationResult,
  DeviceDetectionConfig,
  DevtoolsConfig,
  ErrorHandlingConfig,
  FileNamingConfig,
  LoaderConfig,
  LogLevel,
  PerformanceConfig,
  PreloadMode,
  PreloadStrategyConfig,
  ScannerConfig,
  TemplateSystemConfig,
} from '../types/config'

export { getConfigManager, resetConfigManager, TemplateConfigManager } from './config-manager'

// 导出默认配置
export { defaultConfig, getDefaultConfig, mergeConfig } from './default.config'

/**
 * 创建配置管理器的便捷函数
 */
export function createConfigManager(initialConfig?: Partial<TemplateSystemConfig>) {
  return getConfigManager(initialConfig)
}

/**
 * 配置预设
 */
export const configPresets = {
  /**
   * 开发环境预设
   */
  development: {
    debug: true,
    enableHMR: true,
    enablePerformanceMonitor: true,
    devtools: {
      enabled: true,
      enableInspector: true,
      enableLogger: true,
      logLevel: 'debug' as const,
      enableTimeline: true,
    },
    cache: {
      enabled: true,
      strategy: 'lru' as const,
      maxSize: 20, // 开发环境较小的缓存
      ttl: 10 * 60 * 1000, // 10分钟
      enableCompression: false,
      enablePersistence: false,
    },
    scanner: {
      watchMode: true,
      debounceDelay: 150, // 更快的响应
      batchSize: 5,
    },
    performance: {
      enableMetrics: true,
      metricsInterval: 3000, // 更频繁的监控
    },
  },

  /**
   * 生产环境预设
   */
  production: {
    debug: false,
    enableHMR: false,
    enablePerformanceMonitor: false,
    devtools: {
      enabled: false,
      enableInspector: false,
      enableLogger: false,
      logLevel: 'error' as const,
      enableTimeline: false,
    },
    cache: {
      enabled: true,
      strategy: 'lru' as const,
      maxSize: 100, // 生产环境较大的缓存
      ttl: 60 * 60 * 1000, // 1小时
      enableCompression: true,
      enablePersistence: true,
    },
    scanner: {
      watchMode: false,
      debounceDelay: 500,
      batchSize: 20,
    },
    performance: {
      enableMetrics: false,
      enableLazyLoading: true,
      enableVirtualScroll: true,
    },
    preloadStrategy: {
      enabled: true,
      mode: 'intersection' as const,
      limit: 10,
    },
  },

  /**
   * 测试环境预设
   */
  testing: {
    debug: false,
    enableHMR: false,
    enablePerformanceMonitor: false,
    devtools: {
      enabled: false,
      enableInspector: false,
      enableLogger: false,
      logLevel: 'silent' as const,
      enableTimeline: false,
    },
    cache: {
      enabled: false, // 测试环境禁用缓存
      strategy: 'lru' as const,
      maxSize: 10,
      ttl: 1000,
    },
    scanner: {
      watchMode: false,
      debounceDelay: 0, // 测试环境无延迟
      batchSize: 1,
    },
    performance: {
      enableMetrics: false,
      enableLazyLoading: false,
      enableVirtualScroll: false,
    },
    preloadStrategy: {
      enabled: false,
    },
  },

  /**
   * 移动端优化预设
   */
  mobile: {
    defaultDevice: 'mobile' as const,
    deviceDetection: {
      breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
      },
      debounceDelay: 200,
    },
    cache: {
      enabled: true,
      strategy: 'lru' as const,
      maxSize: 30, // 移动端较小的缓存
      ttl: 30 * 60 * 1000,
      enableCompression: true,
    },
    performance: {
      enableLazyLoading: true,
      enableVirtualScroll: true,
      chunkSize: 10, // 移动端较小的分块
    },
    preloadStrategy: {
      enabled: true,
      mode: 'intersection' as const,
      limit: 3, // 移动端较少的预加载
      intersection: {
        rootMargin: '20px',
        threshold: 0.2,
      },
    },
  },
}

/**
 * 根据环境获取预设配置
 */
export function getPresetConfig(preset: keyof typeof configPresets) {
  return configPresets[preset]
}

/**
 * 合并预设配置
 */
export function mergePresetConfig(
  preset: keyof typeof configPresets,
  customConfig?: Partial<TemplateSystemConfig>,
): TemplateSystemConfig {
  const presetConfig = getPresetConfig(preset)
  return mergeConfig({ ...presetConfig, ...customConfig })
}

/**
 * 自动检测环境并应用预设
 */
export function getAutoPresetConfig(customConfig?: Partial<TemplateSystemConfig>): TemplateSystemConfig {
  // 检测环境
  let preset: keyof typeof configPresets = 'development'

  if (typeof process !== 'undefined') {
    // Node.js 环境
    if (process.env.NODE_ENV === 'production') {
      preset = 'production'
    }
    else if (process.env.NODE_ENV === 'test') {
      preset = 'testing'
    }
  }
  else if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Vite 环境
    if (import.meta.env.PROD) {
      preset = 'production'
    }
    else if (import.meta.env.MODE === 'test') {
      preset = 'testing'
    }
  }

  // 检测移动端
  if (typeof navigator !== 'undefined') {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile && preset === 'production') {
      preset = 'mobile'
    }
  }

  return mergePresetConfig(preset, customConfig)
}

/**
 * 配置验证工具
 */
export function validateConfig(config: Partial<TemplateSystemConfig>) {
  const manager = createConfigManager()
  return manager.validateConfig(config)
}

/**
 * 配置调试工具
 */
export function debugConfig(config: TemplateSystemConfig) {
  console.group('🔧 Template System Configuration')
  console.log('📊 Basic Config:', {
    templatesDir: config.templatesDir,
    defaultDevice: config.defaultDevice,
    debug: config.debug,
  })
  console.log('💾 Cache Config:', config.cache)
  console.log('📱 Device Detection:', config.deviceDetection)
  console.log('🚀 Performance Config:', config.performance)
  console.log('🔍 Scanner Config:', config.scanner)
  console.groupEnd()
}
export type { TemplateSystemConfig }
