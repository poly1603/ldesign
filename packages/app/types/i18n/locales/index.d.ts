import { LanguagePackage } from '../../packages/i18n/types/core/types.d.js'
import '../../packages/i18n/types/node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.d.js'

/**
 * 应用自定义语言包
 *
 * 这里定义了应用特有的翻译内容，会与 @ldesign/i18n 的内置语言包合并
 */

declare const appLocales: {
  'zh-CN': LanguagePackage
  en: LanguagePackage
  ja: LanguagePackage
}

export { appLocales }
