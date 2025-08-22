/**
 * LDesign Template System - 重构版本
 *
 * 一个简洁高效的 Vue 3 模板管理系统，提供：
 * - 🎨 多设备响应式模板支持
 * - 🚀 智能缓存和性能优化（基于 @ldesign/cache）
 * - 📱 自动设备检测和适配（基于 @ldesign/device）
 * - 🔧 灵活的模板扫描和加载
 * - 🎪 丰富的 Vue 组件和组合式函数
 *
 * @packageDocumentation
 */

import { TemplateLoader } from './core/loader'
// ============ 核心模块 ============
/** 模板管理器 - 核心管理类，提供模板的加载、缓存、切换等功能 */
// ============ 默认导出 ============
import { TemplateManager } from './core/manager'
import { TemplateScanner } from './core/scanner'
import { createTemplateEnginePlugin } from './engine/plugin'
import { TemplateProvider } from './vue/components/TemplateProvider'
import { TemplateRenderer } from './vue/components/TemplateRenderer'
import { TemplateSelector } from './vue/components/TemplateSelector'
import { useTemplate } from './vue/composables/useTemplate'
import { useTemplateProvider } from './vue/composables/useTemplateProvider'
import { useTemplateSelector } from './vue/composables/useTemplateSelector'
import { TemplatePlugin } from './vue/plugin'

/** 模板加载器 - 动态加载模板组件 */
export { TemplateLoader } from './core/loader'

export { TemplateManager } from './core/manager'

/** 模板扫描器 - 自动发现和解析项目中的模板文件 */
export { TemplateScanner } from './core/scanner'

// ============ Engine 插件支持 ============
/** Engine 插件创建函数 */
export { createDefaultTemplateEnginePlugin, createTemplateEnginePlugin } from './engine/plugin'

// ============ 模板组件 ============
/** 内置模板组件 - 现在通过自动扫描发现，无需手动导出 */
// 模板组件现在通过 TemplateScanner 自动发现，无需手动导出

// ============ 类型定义 ============
export type * from './types'

// ============ 工具函数 ============
/** 模板路径解析和处理工具 */
export {
  buildTemplatePath,
  extractTemplatePathFromModulePath,
  getComponentPathFromConfigPath,
  getConfigPathFromComponentPath,
  getStylePathFromConfigPath,
  isTemplateComponentPath,
  isTemplateConfigPath,
  normalizeTemplatePath,
  parseTemplatePath,
  validateTemplatePath,
} from './utils/path'

export { TemplateProvider } from './vue/components/TemplateProvider'
// ============ Vue 集成 ============
/** Vue 组件 */
export { TemplateRenderer } from './vue/components/TemplateRenderer'
export { TemplateSelector } from './vue/components/TemplateSelector'

/** Vue 组合式函数 */
export { useTemplate } from './vue/composables/useTemplate'
export { useTemplateProvider } from './vue/composables/useTemplateProvider'
export { useTemplateSelector } from './vue/composables/useTemplateSelector'

/** Vue 插件 */
export {
  createTemplatePlugin,
  destroyGlobalTemplateManager,
  getGlobalTemplateManager,
  TemplatePlugin,
  useTemplateManager,
} from './vue/plugin'

// ============ 服务层导出 ============
/** 错误处理服务 */
export { ErrorHandler, TemplateError, TemplateErrorType } from './services/error-handler'

/** 事件系统服务 */
export { EventEmitter, TemplateEventType } from './services/event-emitter'

/** 性能监控服务 */
export { PerformanceMonitor } from './services/performance-monitor'

/** 缓存服务 */
export { CacheService } from './services/cache-service'

/** 存储服务 */
export { StorageService } from './services/storage-service'

/** 设备检测服务 */
export { DeviceService } from './services/device-service'

/** 日志服务 */
export { Logger, LogLevel, logger } from './services/logger'

// ============ 外部依赖重新导出 ============
// TODO: 稍后启用这些导出
// export { DeviceDetector } from '@ldesign/device'
// export { createCache } from '@ldesign/cache'

// ============ 便捷函数 ============

/**
 * 创建模板管理器实例
 */
export function createTemplateManager(config?: import('./types').TemplateManagerConfig) {
  return new TemplateManager(config)
}

/**
 * 创建模板扫描器实例
 */
export function createTemplateScanner() {
  return new TemplateScanner()
}

/**
 * 创建模板加载器实例
 */
export function createTemplateLoader() {
  return new TemplateLoader()
}

export default {
  TemplateManager,
  TemplateScanner,
  TemplateLoader,
  createTemplateManager,
  createTemplateScanner,
  createTemplateLoader,
  // Vue 支持
  TemplateRenderer,
  TemplateSelector,
  TemplateProvider,
  TemplatePlugin,
  useTemplate,
  useTemplateSelector,
  useTemplateProvider,
  // Engine 支持
  createTemplateEnginePlugin,
}

// ============ 版本信息 ============
export const version = '0.1.0'
