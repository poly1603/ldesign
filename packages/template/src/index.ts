/**
 * @ldesign/template - Vue3模板管理和渲染功能库
 *
 * 功能强大、性能卓越的 Vue3 模板管理和渲染功能库
 * 支持智能预加载、懒加载、虚拟滚动等性能优化功能
 *
 * @author ldesign
 * @version 1.0.0
 */

// 导出组件
export * from './components'

// 导出Hook函数
export * from './composables'

// 导出配置系统
export * from './config'

// 导出Vue3插件
export { createTemplateEnginePlugin, getConfigManager, getPluginOptions, getPluginState, getScanner, default as TemplatePlugin } from './plugin'

// 默认导出插件
export { default } from './plugin'

// 导出扫描器
export * from './scanner'

// 导出核心类型
export * from './types'

// 导出工具函数
export * from './utils'

// 版本信息
export const version = '1.0.0'
