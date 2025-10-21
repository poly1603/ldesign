/**
 * 插件初始化模块
 * 统一管理所有插件的创建和配置
 */

import { watch } from 'vue'
import type { Ref } from 'vue'
import { createI18nEnginePlugin } from '../i18n'
import { createCacheVuePlugin } from '../plugins/cache'
import { createColorPlugin } from '@ldesign/color/plugin'
import { createSizePlugin } from '@ldesign/size/plugin'
import { createTemplatePlugin } from '@ldesign/template'
import { i18nConfig } from '../config/i18n.config'
import { createCacheConfig } from '../config/cache.config'
import { createColorConfig } from '../config/color.config'
import { createSizeConfig } from '../config/size.config'
import { templateConfig } from '../config/template.config'

export interface PluginsResult {
  i18nPlugin: any
  cachePlugin: any
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

  // 监听语言变化并广播事件 - 使用 { flush: 'post' } 优化性能
  watch(localeRef, (newLocale, oldLocale) => {
    // 广播全局事件（支持动态加载的组件）
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:locale-changed', {
        detail: { locale: newLocale, oldLocale }
      }))
    }
  }, { flush: 'post' })

  // 创建 Cache 插件（使用 Vue 插件）
  const cachePlugin = createCacheVuePlugin(createCacheConfig(localeRef))

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
    cachePlugin,
    colorPlugin,
    sizePlugin,
    templatePlugin,
    localeRef
  }
}
