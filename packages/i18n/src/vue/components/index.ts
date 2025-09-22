/**
 * Vue I18n 组件导出
 * 
 * 提供所有 Vue I18n 组件的统一导出
 */

// 导入所有组件
import I18nT from './I18nT.vue'
import I18nN from './I18nN.vue'
import I18nD from './I18nD.vue'
import I18nP from './I18nP.vue'
import I18nR from './I18nR.vue'
import I18nL from './I18nL.vue'
import I18nC from './I18nC.vue'
import I18nDT from './I18nDT.vue'
import I18nIf from './I18nIf.vue'
import I18nChain from './I18nChain.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import TranslationProvider from './TranslationProvider.vue'
import TranslationMissing from './TranslationMissing.vue'

// 注意：不再重新导出 .vue 组件的类型，以避免私有 Props 类型泄漏导致的 TS 声明错误

/**
 * 所有组件的映射
 */
export const components = {
  I18nT,
  I18nN,
  I18nD,
  I18nP,
  I18nR,
  I18nL,
  I18nC,
  I18nDT,
  I18nIf,
  I18nChain,
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
  // 检查 app 是否有 component 方法
  if (!app || typeof app.component !== 'function') {
    console.warn('installComponents: Invalid app instance provided, skipping component registration')
    return
  }

  // 注册所有组件
  Object.entries(components).forEach(([name, component]) => {
    try {
      app.component(name, component)
    } catch (error) {
      console.warn(`Failed to register component ${name}:`, error)
    }
  })
}

/**
 * 单独导出所有组件
 */
export {
  I18nT,
  I18nN,
  I18nD,
  I18nP,
  I18nR,
  I18nL,
  I18nC,
  I18nDT,
  I18nIf,
  I18nChain,
  LanguageSwitcher,
  TranslationProvider,
  TranslationMissing
}

/**
 * 默认导出组件集合
 */
export default components
