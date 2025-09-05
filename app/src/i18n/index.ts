/**
 * 国际化插件配置
 *
 * 使用 @ldesign/i18n 的 createI18nEnginePlugin 创建 Engine 插件
 * 支持动态语言列表和翻译合并功能
 */

import { createI18nEnginePlugin } from '@ldesign/i18n/vue'
import { messages, getAvailableLocales, defaultLocale, fallbackLocale } from './locales'

/**
 * 创建国际化引擎插件
 *
 * 配置了完整的国际化功能，包括语言包、缓存、自动检测、
 * 性能优化和错误处理等特性，支持语言状态持久化
 */
export const i18nPlugin = createI18nEnginePlugin({
  // 基础配置
  locale: defaultLocale, // 默认语言
  fallbackLocale: fallbackLocale, // 回退语言
  messages, // 语言包

  // 存储配置 - 持久化语言偏好
  storage: 'localStorage', // 使用 localStorage 存储
  storageKey: 'ldesign-app-locale', // 存储键名

  // 自动检测配置
  autoDetect: true, // 启用自动语言检测

  // 缓存配置 - 优化性能
  cache: {
    enabled: true, // 启用缓存
    maxSize: 500, // 缓存最大条目数
    maxMemory: 10 * 1024 * 1024, // 最大内存使用 10MB
    defaultTTL: 60 * 60 * 1000, // 默认缓存时间 1小时
    enableTTL: true, // 启用 TTL
    cleanupInterval: 5 * 60 * 1000, // 清理间隔 5分钟
    memoryPressureThreshold: 0.8 // 内存压力阈值
  },

  // 预加载配置
  preload: [defaultLocale, fallbackLocale], // 预加载语言

  // 性能配置
  performance: false, // 关闭性能监控减少开销

  // 开发工具配置
  devtools: false, // 关闭开发工具

  // 生命周期回调
  onLanguageChanged: (locale: string) => {
    // 语言切换时的回调
    document.documentElement.lang = locale

    // 可以在这里添加其他语言切换后的处理逻辑
    // 已禁用调试日志输出
  },

  onLoadError: (error: Error) => {
    // 语言包加载错误时的回调
    console.error(`[I18n] Failed to load locale:`, error)
  }
})

/**
 * 导出插件实例
 */
export default i18nPlugin
