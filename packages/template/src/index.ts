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

// ============ 核心模块 ============
/** 模板管理器 - 核心管理类，提供模板的加载、缓存、切换等功能 */
export { TemplateManager } from './core/manager'

/** 模板扫描器 - 自动发现和解析项目中的模板文件 */
export { TemplateScanner } from './core/scanner'

/** 模板加载器 - 动态加载模板组件 */
export { TemplateLoader } from './core/loader'

// ============ 工具函数 ============
/** 模板路径解析和处理工具 */
export {
  parseTemplatePath,
  buildTemplatePath,
  validateTemplatePath,
  extractTemplatePathFromModulePath,
  normalizeTemplatePath,
  isTemplateConfigPath,
  isTemplateComponentPath,
  getComponentPathFromConfigPath,
  getConfigPathFromComponentPath,
  getStylePathFromConfigPath,
} from './utils/path'

// ============ 类型定义 ============
export type * from './types'

// ============ Engine 插件支持 ============
/** Engine 插件创建函数 */
export { createTemplateEnginePlugin, createDefaultTemplateEnginePlugin } from './engine/plugin'

// ============ Vue 集成 ============
/** Vue 组件 */
export { TemplateRenderer } from './vue/components/TemplateRenderer'

/** Vue 插件 */
export {
  TemplatePlugin,
  createTemplatePlugin,
  getGlobalTemplateManager,
  destroyGlobalTemplateManager,
  useTemplateManager,
} from './vue/plugin'

/** Vue 组合式函数 */
export { useTemplate } from './vue/composables/useTemplate'

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

// ============ 默认导出 ============
import { TemplateManager } from './core/manager'
import { TemplateScanner } from './core/scanner'
import { TemplateLoader } from './core/loader'
import { TemplateRenderer } from './vue/components/TemplateRenderer'
import { TemplatePlugin } from './vue/plugin'
import { useTemplate } from './vue/composables/useTemplate'
import { createTemplateEnginePlugin } from './engine/plugin'

export default {
  TemplateManager,
  TemplateScanner,
  TemplateLoader,
  createTemplateManager,
  createTemplateScanner,
  createTemplateLoader,
  // Vue 支持
  TemplateRenderer,
  TemplatePlugin,
  useTemplate,
  // Engine 支持
  createTemplateEnginePlugin,
}

// ============ 版本信息 ============
export const version = '0.1.0'
