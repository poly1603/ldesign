/**
 * UMD 构建入口文件
 * 用于浏览器环境的全局变量导出
 */

// 导出所有核心功能
export * from './core'
export * from './types'
export * from './utils'

// 只导出 Vue adapter
export { createVueI18n, useI18n as useVueI18n } from './adapters/vue'

// 导出核心 i18n 类
import { OptimizedI18n } from './core/i18n-optimized'
export { OptimizedI18n, OptimizedI18n as I18n }

// 创建默认实例
const defaultI18n = new OptimizedI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {}
})

// UMD 导出
export default defaultI18n
