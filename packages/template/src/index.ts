/**
 * LDesign Template System
 *
 * 一个功能强大的 Vue 3 模板管理系统，提供：
 * - 🎨 多设备响应式模板支持
 * - 🚀 智能缓存和性能优化
 * - 📱 自动设备检测和适配
 * - 🔧 灵活的模板扫描和加载
 * - 🎪 丰富的 Vue 组件和组合式函数
 *
 * @packageDocumentation
 */

// ============ 缓存管理 ============
/** 缓存系统 - 提供 LRU 缓存和模板专用缓存功能 */
export { LRUCache, TemplateCache } from './core/cache/index'

// ============ 核心设备检测 ============
/** 核心设备检测功能 - 基础的设备类型识别 */
export { detectDeviceType, getDeviceInfo as getDeviceInfoCore, watchDeviceChange } from './core/device'

// ============ 核心模块 ============
/** 模板管理器 - 核心管理类，提供模板的加载、缓存、切换等功能 */
export { TemplateManager } from './core/TemplateManager'

// ============ 类型定义 ============
export type * from './types'

// ============ 扩展设备检测工具 ============
/** 扩展设备检测功能 - 提供更多设备检测工具和配置选项 */
export {
  checkDeviceSupport,
  createDeviceWatcher,
  DEFAULT_BREAKPOINTS,
  DEFAULT_DEVICE_CONFIG,
  detectDevice,
  detectDeviceByUserAgent,
  detectDeviceByViewport,
  getDeviceInfo,
  getViewportHeight,
  getViewportWidth,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
} from './utils/device'

// ============ 模板扫描和渲染 ============
/** 模板扫描器 - 自动发现和注册项目中的模板文件 */
export { TemplateScanner } from './utils/scanner'

/** 模板渲染器组件 - Vue 组件，用于渲染动态模板 */
export { TemplateRenderer } from './vue/components/TemplateRenderer'

// ============ Vue 集成 ============
/** Vue 组合式函数 - 提供响应式的模板管理功能 */
export { createTemplateManager, useTemplate } from './vue/composables/useTemplate'

/** Vue 指令 - 提供模板相关的自定义指令 */
export { registerTemplateDirective, templateDirective } from './vue/directives/template'

/** Vue 插件 - 全局模板管理器和插件系统 */
export { getGlobalTemplateManager, TemplatePlugin } from './vue/plugins'

// ============ 默认导出 ============
/** 默认导出 Vue 插件，支持 app.use() 方式安装 */
export { TemplatePlugin as default } from './vue/plugins'
