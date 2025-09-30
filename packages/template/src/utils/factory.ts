/**
 * 工厂函数模块
 * 
 * 提供统一的对象创建工厂函数，消除重复代码
 */

import { TemplateScanner } from '../scanner'
import type { ScannerOptions, ScannerEventCallbacks, ScanResult, ScanError } from '../scanner/types'
import type { TemplateSystemConfig } from '../types/config'

/**
 * 默认扫描器配置
 */
const DEFAULT_SCANNER_CONFIG: Partial<ScannerOptions> = {
  maxDepth: 5,
  includeExtensions: ['.vue', '.tsx', '.js', '.ts'],
  excludePatterns: ['node_modules', '.git', 'dist', 'coverage'],
  watchMode: false,
  debounceDelay: 300,
  batchSize: 10,
}

/**
 * 创建模板扫描器实例
 * 
 * @param config 系统配置
 * @param callbacks 回调函数
 * @returns TemplateScanner实例
 */
export function createTemplateScanner(
  config: TemplateSystemConfig,
  callbacks?: ScannerEventCallbacks
): TemplateScanner {
  const scannerOptions: ScannerOptions = {
    templatesDir: config.templatesDir,
    enableCache: config.scanner.enableCache,
    enableHMR: config.enableHMR,
    maxDepth: config.scanner.maxDepth || DEFAULT_SCANNER_CONFIG.maxDepth!,
    includeExtensions: config.scanner.includeExtensions || DEFAULT_SCANNER_CONFIG.includeExtensions!,
    excludePatterns: config.scanner.excludePatterns || DEFAULT_SCANNER_CONFIG.excludePatterns!,
    watchMode: config.scanner.watchMode ?? DEFAULT_SCANNER_CONFIG.watchMode!,
    debounceDelay: config.scanner.debounceDelay || DEFAULT_SCANNER_CONFIG.debounceDelay!,
    batchSize: config.scanner.batchSize || DEFAULT_SCANNER_CONFIG.batchSize!,
  }

  // 创建默认回调函数
  const defaultCallbacks: ScannerEventCallbacks = {
    onScanComplete: (result: ScanResult) => {
      if (config.debug && (config.enablePerformanceMonitor || config.devtools.enableLogger)) {
        console.info('[TemplateScanner] Scan completed:', result.stats)
      }
    },
    onScanError: (error: ScanError) => {
      console.error('[TemplateScanner] Scan error:', error)
      if (config.errorHandling.enableReporting) {
        // 这里可以添加错误报告逻辑
      }
    },
    ...callbacks
  }

  return new TemplateScanner(scannerOptions, defaultCallbacks)
}

/**
 * 创建简化的模板扫描器实例（用于模板管理器）
 * 
 * @param templatesDir 模板目录
 * @param enableCache 是否启用缓存
 * @param enableHMR 是否启用热更新
 * @returns TemplateScanner实例
 */
export function createSimpleTemplateScanner(
  templatesDir: string,
  enableCache: boolean = true,
  enableHMR: boolean = true
): TemplateScanner {
  const scannerOptions: ScannerOptions = {
    templatesDir,
    enableCache,
    enableHMR,
    ...DEFAULT_SCANNER_CONFIG
  }

  return new TemplateScanner(scannerOptions)
}

/**
 * 创建缓存配置对象
 * 
 * @param enabled 是否启用缓存
 * @param strategy 缓存策略
 * @param maxSize 最大缓存大小
 * @param ttl 缓存过期时间
 * @param checkPeriod 检查周期
 * @returns 缓存配置对象
 */
export function createCacheConfig(
  enabled: boolean = true,
  strategy: 'lru' | 'fifo' = 'lru',
  maxSize: number = 50,
  ttl: number = 0,
  checkPeriod: number = 5 * 60 * 1000
) {
  return {
    enabled,
    strategy,
    maxSize,
    ttl,
    checkPeriod,
  }
}

/**
 * 创建设备检测配置
 * 
 * @param mobile 移动端断点
 * @param tablet 平板端断点
 * @param desktop 桌面端断点
 * @returns 设备检测配置
 */
export function createDeviceConfig(
  mobile: number = 768,
  tablet: number = 1024,
  desktop: number = 1200
) {
  return {
    breakpoints: {
      mobile,
      tablet,
      desktop,
    },
  }
}
