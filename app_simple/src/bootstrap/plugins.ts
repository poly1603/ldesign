/**
 * 插件初始化模块
 * 统一管理所有插件的创建和配置
 */

import { watch } from 'vue'
import type { Ref } from 'vue'
import { createI18nEnginePlugin } from '@/i18n'
import { createColorPlugin } from '@ldesign/color/plugin'
import { createSizePlugin } from '@ldesign/size/plugin'
import { createTemplatePlugin } from '@ldesign/template'
import { i18nConfig } from '@/config/i18n.config'
import { createColorConfig } from '@/config/color.config'
import { createSizeConfig } from '@/config/size.config'
import { templateConfig } from '@/config/template.config'

export interface PluginsResult {
  i18nPlugin: any
  colorPlugin: any
  sizePlugin: any
  templatePlugin: any
  localeRef: Ref<string>
}

/**
 * 初始化所有插件（兼容现有代码）
 */
export function initializePlugins(): PluginsResult {
  // 创建 i18n 插件（使用旧的 Engine 插件）
  const i18nPlugin = createI18nEnginePlugin(i18nConfig)
  
  // 获取响应式 locale（从 Engine 插件）
  const localeRef = i18nPlugin.localeRef
  
  // 监听语言变化（开发环境）
  if (import.meta.env.DEV) {
    watch(localeRef, (newLocale) => {
      console.log('[locale] changed:', newLocale)
    })
  }

  // 创建模板插件
  const templatePlugin = createTemplatePlugin(templateConfig)

  // 创建 Color 插件（使用新的优化版本，传入共享的 locale）
  const colorPlugin = createColorPlugin({
    ...createColorConfig(localeRef),
    locale: localeRef  // 传入共享的 ref
  })
  
  // 创建 Size 插件（使用新的优化版本，传入共享的 locale）
  const sizePlugin = createSizePlugin({
    ...createSizeConfig(localeRef),
    locale: localeRef  // 传入共享的 ref
  })

  return {
    i18nPlugin,
    colorPlugin,
    sizePlugin,
    templatePlugin,
    localeRef
  }
}