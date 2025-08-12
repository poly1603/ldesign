import {
  I18nInstance,
  LanguageInfo,
} from '../packages/i18n/types/core/types.d.js'
import '../packages/i18n/types/node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.d.js'
import { App } from 'vue'

/**
 * 创建 i18n 实例
 */
declare function createAppI18n(): Promise<I18nInstance>
/**
 * 获取 i18n 实例
 */
declare function getI18nInstance(): I18nInstance | null
/**
 * 安装 i18n Vue 插件
 */
declare function installI18nPlugin(app: App): Promise<void>
/**
 * 语言切换函数
 */
declare function changeLanguage(locale: string): Promise<void>
/**
 * 获取可用语言列表
 */
declare function getAvailableLanguages(): LanguageInfo[]
/**
 * 获取当前语言
 */
declare function getCurrentLanguage(): string

export {
  I18nInstance,
  changeLanguage,
  createAppI18n,
  getAvailableLanguages,
  getCurrentLanguage,
  getI18nInstance,
  installI18nPlugin,
}
