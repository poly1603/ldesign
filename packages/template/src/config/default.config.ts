/**
 * 默认配置文件
 * 提供模板系统的默认配置，支持环境变量覆盖
 */

import type { TemplateSystemConfig } from '../types/config'

/**
 * 获取环境变量值，支持类型转换
 */
function getEnvValue<T>(key: string, defaultValue: T, parser?: (value: string) => T): T {
  // 安全地访问环境变量，避免在浏览器环境中出错
  let envValue: string | undefined
  try {
    envValue = (typeof process !== 'undefined' && process.env ? process.env[key] : undefined)
      || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : undefined)
  }
  catch {
    envValue = undefined
  }

  if (!envValue)
    return defaultValue

  if (parser) {
    try {
      return parser(envValue)
    }
    catch {
      return defaultValue
    }
  }

  return envValue as T
}

/**
 * 解析JSON环境变量
 */
function parseJsonEnv<T>(value: string): T {
  return JSON.parse(value) as T
}

/**
 * 解析布尔值环境变量
 */
function parseBooleanEnv(value: string): boolean {
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * 解析数字环境变量
 */
function parseNumberEnv(value: string): number {
  const num = Number(value)
  if (isNaN(num))
    throw new Error(`Invalid number: ${value}`)
  return num
}

/**
 * 解析数组环境变量（逗号分隔）
 */
function parseArrayEnv(value: string): string[] {
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

/**
 * 默认模板系统配置
 * 支持通过环境变量覆盖所有配置项
 */
export const defaultConfig: TemplateSystemConfig = {
  // 基础配置
  templatesDir: getEnvValue('TEMPLATE_TEMPLATES_DIR', 'src/templates'),
  autoScan: getEnvValue('TEMPLATE_AUTO_SCAN', true, parseBooleanEnv),
  enableHMR: getEnvValue('TEMPLATE_ENABLE_HMR', import.meta.env?.DEV ?? false, parseBooleanEnv),
  defaultDevice: getEnvValue('TEMPLATE_DEFAULT_DEVICE', 'desktop' as const),
  enablePerformanceMonitor: getEnvValue('TEMPLATE_PERFORMANCE_MONITOR', false, parseBooleanEnv),
  debug: getEnvValue('TEMPLATE_DEBUG', import.meta.env?.DEV ?? false, parseBooleanEnv),

  // 扫描器配置
  scanner: {
    maxDepth: getEnvValue('TEMPLATE_SCANNER_MAX_DEPTH', 5, parseNumberEnv),
    includeExtensions: getEnvValue('TEMPLATE_SCANNER_EXTENSIONS', ['.vue', '.tsx', '.js', '.ts'], parseJsonEnv as (v: string) => string[]),
    excludePatterns: getEnvValue('TEMPLATE_SCANNER_EXCLUDE', ['node_modules', '.git', 'dist', 'coverage'], parseJsonEnv as (v: string) => string[]),
    enableCache: getEnvValue('TEMPLATE_SCANNER_CACHE', true, parseBooleanEnv),
    watchMode: getEnvValue('TEMPLATE_SCANNER_WATCH', import.meta.env?.DEV ?? false, parseBooleanEnv),
    debounceDelay: getEnvValue('TEMPLATE_SCANNER_DEBOUNCE', 300, parseNumberEnv),
    batchSize: getEnvValue('TEMPLATE_SCANNER_BATCH_SIZE', 10, parseNumberEnv),
  },

  // 缓存配置
  cache: {
    enabled: getEnvValue('TEMPLATE_CACHE_ENABLED', true, parseBooleanEnv),
    strategy: getEnvValue('TEMPLATE_CACHE_STRATEGY', 'lru' as const),
    maxSize: getEnvValue('TEMPLATE_CACHE_MAX_SIZE', 50, parseNumberEnv),
    ttl: getEnvValue('TEMPLATE_CACHE_TTL', 30 * 60 * 1000, parseNumberEnv), // 30分钟
    checkPeriod: getEnvValue('TEMPLATE_CACHE_CHECK_PERIOD', 5 * 60 * 1000, parseNumberEnv), // 5分钟
    enableCompression: getEnvValue('TEMPLATE_CACHE_COMPRESSION', false, parseBooleanEnv),
    enablePersistence: getEnvValue('TEMPLATE_CACHE_PERSISTENCE', false, parseBooleanEnv),
    persistenceKey: getEnvValue('TEMPLATE_CACHE_PERSISTENCE_KEY', 'ldesign_template_cache'),
  },

  // 设备检测配置
  deviceDetection: {
    breakpoints: {
      mobile: getEnvValue('TEMPLATE_BREAKPOINT_MOBILE', 768, parseNumberEnv),
      tablet: getEnvValue('TEMPLATE_BREAKPOINT_TABLET', 992, parseNumberEnv),
      desktop: getEnvValue('TEMPLATE_BREAKPOINT_DESKTOP', 1200, parseNumberEnv),
    },
    debounceDelay: getEnvValue('TEMPLATE_DEVICE_DEBOUNCE', 300, parseNumberEnv),
    enableResize: getEnvValue('TEMPLATE_DEVICE_RESIZE', true, parseBooleanEnv),
    enableOrientation: getEnvValue('TEMPLATE_DEVICE_ORIENTATION', true, parseBooleanEnv),
    customDetector: undefined as any, // 运行时设置
  },

  // 预加载策略配置
  preloadStrategy: {
    enabled: getEnvValue('TEMPLATE_PRELOAD_ENABLED', true, parseBooleanEnv),
    mode: getEnvValue('TEMPLATE_PRELOAD_MODE', 'lazy' as const),
    limit: getEnvValue('TEMPLATE_PRELOAD_LIMIT', 5, parseNumberEnv),
    priority: getEnvValue('TEMPLATE_PRELOAD_PRIORITY', [], parseJsonEnv as (v: string) => string[]),
    intersection: {
      rootMargin: getEnvValue('TEMPLATE_PRELOAD_ROOT_MARGIN', '50px'),
      threshold: getEnvValue('TEMPLATE_PRELOAD_THRESHOLD', 0.1, parseNumberEnv),
    },
    delay: getEnvValue('TEMPLATE_PRELOAD_DELAY', 1000, parseNumberEnv),
  },

  // 加载器配置
  loader: {
    timeout: getEnvValue('TEMPLATE_LOADER_TIMEOUT', 10000, parseNumberEnv), // 10秒
    retryCount: getEnvValue('TEMPLATE_LOADER_RETRY_COUNT', 3, parseNumberEnv),
    retryDelay: getEnvValue('TEMPLATE_LOADER_RETRY_DELAY', 1000, parseNumberEnv),
    enableParallel: getEnvValue('TEMPLATE_LOADER_PARALLEL', true, parseBooleanEnv),
    maxConcurrent: getEnvValue('TEMPLATE_LOADER_MAX_CONCURRENT', 5, parseNumberEnv),
  },

  // 模板文件命名约定
  fileNaming: {
    componentFile: getEnvValue('TEMPLATE_COMPONENT_FILE', 'index.vue'),
    configFile: getEnvValue('TEMPLATE_CONFIG_FILE', 'config.{js,ts}'),
    styleFile: getEnvValue('TEMPLATE_STYLE_FILE', 'style.{css,less,scss}'),
    previewFile: getEnvValue('TEMPLATE_PREVIEW_FILE', 'preview.{png,jpg,jpeg,webp}'),
    allowedConfigExtensions: getEnvValue('TEMPLATE_CONFIG_EXTENSIONS', ['.js', '.ts'], parseJsonEnv as (v: string) => string[]),
    allowedStyleExtensions: getEnvValue('TEMPLATE_STYLE_EXTENSIONS', ['.css', '.less', '.scss'], parseJsonEnv as (v: string) => string[]),
  },

  // 性能优化配置
  performance: {
    enableLazyLoading: getEnvValue('TEMPLATE_LAZY_LOADING', true, parseBooleanEnv),
    enableVirtualScroll: getEnvValue('TEMPLATE_VIRTUAL_SCROLL', false, parseBooleanEnv),
    chunkSize: getEnvValue('TEMPLATE_CHUNK_SIZE', 20, parseNumberEnv),
    enableMetrics: getEnvValue('TEMPLATE_METRICS', import.meta.env?.DEV ?? false, parseBooleanEnv),
    metricsInterval: getEnvValue('TEMPLATE_METRICS_INTERVAL', 5000, parseNumberEnv),
  },

  // 错误处理配置
  errorHandling: {
    enableGlobalHandler: getEnvValue('TEMPLATE_GLOBAL_ERROR_HANDLER', true, parseBooleanEnv),
    enableRetry: getEnvValue('TEMPLATE_ERROR_RETRY', true, parseBooleanEnv),
    maxRetries: getEnvValue('TEMPLATE_ERROR_MAX_RETRIES', 3, parseNumberEnv),
    enableFallback: getEnvValue('TEMPLATE_ERROR_FALLBACK', true, parseBooleanEnv),
    fallbackTemplate: getEnvValue('TEMPLATE_ERROR_FALLBACK_TEMPLATE', 'error'),
    enableReporting: getEnvValue('TEMPLATE_ERROR_REPORTING', false, parseBooleanEnv),
  },

  // 开发工具配置
  devtools: {
    enabled: getEnvValue('TEMPLATE_DEVTOOLS', import.meta.env?.DEV ?? false, parseBooleanEnv),
    enableInspector: getEnvValue('TEMPLATE_INSPECTOR', import.meta.env?.DEV ?? false, parseBooleanEnv),
    enableLogger: getEnvValue('TEMPLATE_LOGGER', import.meta.env?.DEV ?? false, parseBooleanEnv),
    logLevel: getEnvValue('TEMPLATE_LOG_LEVEL', 'info' as const),
    enableTimeline: getEnvValue('TEMPLATE_TIMELINE', import.meta.env?.DEV ?? false, parseBooleanEnv),
  },
}

/**
 * 获取默认配置
 */
export function getDefaultConfig(): TemplateSystemConfig {
  return defaultConfig
}

/**
 * 合并用户配置与默认配置
 */
export function mergeConfig(userConfig: Partial<TemplateSystemConfig>): TemplateSystemConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    scanner: {
      ...defaultConfig.scanner,
      ...userConfig.scanner,
    },
    cache: {
      ...defaultConfig.cache,
      ...userConfig.cache,
    },
    deviceDetection: {
      ...defaultConfig.deviceDetection,
      ...userConfig.deviceDetection,
      breakpoints: {
        ...defaultConfig.deviceDetection.breakpoints,
        ...userConfig.deviceDetection?.breakpoints,
      },
    },
    preloadStrategy: {
      ...defaultConfig.preloadStrategy,
      ...userConfig.preloadStrategy,
      intersection: {
        ...defaultConfig.preloadStrategy.intersection,
        ...userConfig.preloadStrategy?.intersection,
      },
    },
    loader: {
      ...defaultConfig.loader,
      ...userConfig.loader,
    },
    fileNaming: {
      ...defaultConfig.fileNaming,
      ...userConfig.fileNaming,
    },
    performance: {
      ...defaultConfig.performance,
      ...userConfig.performance,
    },
    errorHandling: {
      ...defaultConfig.errorHandling,
      ...userConfig.errorHandling,
    },
    devtools: {
      ...defaultConfig.devtools,
      ...userConfig.devtools,
    },
  }
}
