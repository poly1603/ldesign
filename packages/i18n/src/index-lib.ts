/**
 * UMD 构建入口文件
 * 用于浏览器环境的全局变量导出
 */

// 导出所有核心功能
export * from './core'
export * from './types'
export * from './utils'
export * from './plugins'
// 只导出 Vue adapter
export { createVueI18n, useI18n as useVueI18n } from './adapters/vue'

// 导出默认实例
import { OptimizedI18n as I18n } from './core/i18n-optimized'
import { createDefaultPlugins } from './plugins'

// 创建带默认插件的实例
const defaultI18n = new I18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {},
  plugins: createDefaultPlugins()
})

// UMD 导出
export default defaultI18n

// 为了兼容性，也导出构造函数
export { I18n }