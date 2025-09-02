/**
 * Vue I18n 组件导出
 * 
 * 提供所有 Vue I18n 组件的统一导出
 */

// 导入所有组件
import I18nT from './I18nT.vue'
import I18nN from './I18nN.vue'
import I18nD from './I18nD.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import TranslationProvider from './TranslationProvider.vue'
import TranslationMissing from './TranslationMissing.vue'

// 组件类型定义
export type { default as I18nTComponent } from './I18nT.vue'
export type { default as I18nNComponent } from './I18nN.vue'
export type { default as I18nDComponent } from './I18nD.vue'
export type { default as LanguageSwitcherComponent } from './LanguageSwitcher.vue'
export type { default as TranslationProviderComponent } from './TranslationProvider.vue'
export type { default as TranslationMissingComponent } from './TranslationMissing.vue'

/**
 * 所有组件的映射
 */
export const components = {
  I18nT,
  I18nN,
  I18nD,
  LanguageSwitcher,
  TranslationProvider,
  TranslationMissing
} as const

/**
 * 组件安装函数
 * 
 * @param app Vue 应用实例
 */
export function installComponents(app: any) {
  // 注册所有组件
  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component)
  })
}

/**
 * 单独导出所有组件
 */
export {
  I18nT,
  I18nN,
  I18nD,
  LanguageSwitcher,
  TranslationProvider,
  TranslationMissing
}

/**
 * 默认导出组件集合
 */
export default components
