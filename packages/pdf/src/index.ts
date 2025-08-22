/**
 * PDF预览组件包主入口文件
 * 导出所有核心模块和API
 */

// 适配器模块（跨框架支持）
export {
  BaseAdapter,
  createAdapter,
  createReactAdapter,
  createVanillaAdapter,
  createVueAdapter,
  FrameworkType,
} from './adapters'

// 核心API
export * from './api/pdf-api'

// 默认实例导出
export {
  defaultPdfApi,
} from './api/pdf-api'

// 便捷函数导出
export {
  getTextContent,
  loadPdf,
  renderPage,
} from './api/pdf-api'

// 创建函数导出
export {
  createDefaultCache,
  createEventEmitter,
  createPdfApi,
  createPdfError,
  createPerformanceMonitor,
  createWorkerManager,
} from './api/pdf-api'

// 缓存系统
export { createLRUCache, defaultCacheOptions, LRUCacheImpl as LRUCache } from './cache/lru-cache'

// PDF引擎
export { createPdfEngine, PdfEngine } from './engine/pdf-engine'

// 核心类型定义
export * from './types'

// 工具函数 - 显式导出避免命名冲突
export {
  asyncUtils,
  cacheUtils,
  dataUtils,
  debugUtils,
  domUtils,
  formatUtils,
  mathUtils,
  typeUtils,
} from './utils'

// WebWorker支持
export * from './worker/worker-manager'

/**
 * 包版本信息
 */
export const VERSION = '1.0.0'

/**
 * 包名称
 */
export const PACKAGE_NAME = '@ldesign/pdf'

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  // 缓存配置
  cache: {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxItems: 1000,
    ttl: 30 * 60 * 1000, // 30分钟
  },

  // 渲染配置
  render: {
    scale: 1.0,
    rotation: 0,
    enableAnnotations: true,
    enableTextSelection: true,
  },

  // Worker配置
  worker: {
    maxWorkers: navigator.hardwareConcurrency || 4,
    taskTimeout: 30000, // 30秒
    enableWorker: typeof Worker !== 'undefined',
  },

  // 性能配置
  performance: {
    enableMonitoring: false,
    preloadPages: 3,
    lazyLoadThreshold: 5,
  },
} as const

/**
 * 初始化PDF预览组件包
 * @param config 配置选项
 */
export function initializePdfPackage(config?: Partial<typeof DEFAULT_CONFIG>) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  // 这里可以添加全局初始化逻辑
  console.warn(`[${PACKAGE_NAME}] Initialized with config:`, finalConfig)

  return finalConfig
}

/**
 * 检查浏览器兼容性
 */
export function checkBrowserCompatibility() {
  const features = {
    canvas: typeof HTMLCanvasElement !== 'undefined',
    webWorker: typeof Worker !== 'undefined',
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    arrayBuffer: typeof ArrayBuffer !== 'undefined',
    uint8Array: typeof Uint8Array !== 'undefined',
    blob: typeof Blob !== 'undefined',
    fileReader: typeof FileReader !== 'undefined',
    fetch: typeof fetch !== 'undefined',
  }

  const unsupported = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature)

  if (unsupported.length > 0) {
    console.error(`[${PACKAGE_NAME}] Unsupported features:`, unsupported)
    return false
  }

  return true
}

/**
 * 获取包信息
 */
export function getPackageInfo() {
  return {
    name: PACKAGE_NAME,
    version: VERSION,
    compatible: checkBrowserCompatibility(),
    features: {
      webWorker: typeof Worker !== 'undefined',
      offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    },
  }
}
