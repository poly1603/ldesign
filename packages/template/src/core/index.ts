/**
 * 核心模块导出
 *
 * 这个文件导出所有核心功能模块，主要供内部使用。
 * 外部使用者应该通过 src/index.ts 导入公共 API。
 *
 * @internal
 */

// ============ 缓存系统 ============
/** 缓存相关的所有功能，包括 LRU 缓存和模板专用缓存 */
export * from './cache'

// ============ 设备检测 ============
/** 设备检测核心功能，提供基础的设备类型识别 */
export * from './device'

// ============ 模板扫描 ============
/** 模板扫描核心功能，自动发现和解析模板文件 */
export * from './scanner'

// ============ 模板加载和注册 ============
/** 模板加载器 - 负责动态加载模板组件和配置 */
export { templateLoader } from './template-loader'

/** 模板注册表 - 全局模板注册和管理 */
export { templateRegistry } from './template-registry'

// ============ 模板管理器 ============
/** 模板管理器 - 核心管理类，协调所有模板相关功能 */
export * from './TemplateManager'
