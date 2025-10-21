/**
 * i18n 配置
 * 使用 @ldesign/i18n 包
 */

import {
  createI18nEnginePlugin as createPackageI18nPlugin,
  useVueI18n  // 这是 Vue adapter 的 useI18n，已经重命名为 useVueI18n
} from '@ldesign/i18n'
import type { I18nEnginePluginOptions } from '@ldesign/i18n'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

// 导出 Vue 专用的 useI18n
export const useI18n = useVueI18n

// 创建 Engine 插件，封装包中的插件并添加应用消息
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  // 合并应用的消息与传入的消息
  const appMessages = {
    'zh-CN': zhCN,
    'en-US': enUS,
  }

  const mergedMessages = {
    ...appMessages,
    ...(options.messages || {}),
  }

  // 使用包中的插件创建函数
  return createPackageI18nPlugin({
    ...options,
    messages: mergedMessages,
    storageKey: 'app-locale', // 使用应用特定的存储键
  })
}

// 导出默认
export default {
  useI18n: useVueI18n,
  createI18nEnginePlugin
}
