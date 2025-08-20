/**
 * PDF预览组件包主入口文件
 * 导出所有核心模块和API
 */

// 核心类型定义
export * from './types'

// 核心API
export * from './api/pdf-api'

// PDF引擎
export { PdfEngine, createPdfEngine } from './engine/pdf-engine'

// 缓存系统
export { LRUCacheImpl as LRUCache, createLRUCache, defaultCacheOptions } from './cache/lru-cache'

// WebWorker支持
export * from './worker/worker-manager'

// 工具函数 - 显式导出避免命名冲突
export {
  typeUtils,
  dataUtils,
  cacheUtils,
  asyncUtils,
  domUtils,
  mathUtils,
  formatUtils,
  debugUtils
} from './utils'

// 适配器模块（跨框架支持）
export {
  BaseAdapter,
  createReactAdapter,
  createVueAdapter,
  createVanillaAdapter,
  createAdapter,
  FrameworkType
} from './adapters'

// 默认实例导出
export {
  defaultPdfApi
} from './api/pdf-api'

// 便捷函数导出
export {
  loadPdf,
  renderPage,
  getTextContent
} from './api/pdf-api'

// 创建函数导出
export {
  createPdfApi,
  createDefaultCache,
  createWorkerManager,
  createEventEmitter,
  createPerformanceMonitor,
  createPdfError
} from './api/pdf-api'

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
    ttl: 30 * 60 * 1000 // 30分钟
  },
  
  // 渲染配置
  render: {
    scale: 1.0,
    rotation: 0,
    enableAnnotations: true,
    enableTextSelection: true
  },
  
  // Worker配置
  worker: {
    maxWorkers: navigator.hardwareConcurrency || 4,
    taskTimeout: 30000, // 30秒
    enableWorker: typeof Worker !== 'undefined'
  },
  
  // 性能配置
  performance: {
    enableMonitoring: false,
    preloadPages: 3,
    lazyLoadThreshold: 5
  }
} as const

/**
 * 初始化PDF预览组件包
 * @param config 配置选项
 */
export function initializePdfPackage(config?: Partial<typeof DEFAULT_CONFIG>) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config
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
    fetch: typeof fetch !== 'undefined'
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
      offscreenCanvas: typeof OffscreenCanvas !== 'undefined'
    }
  }
}