/**
 * Vue I18n 集成
 * 提供完整的 Vue 3 国际化解决方案
 *
 * @example
 * ```typescript
 * // main.ts
 * import { createApp } from 'vue'
 * import { createI18nPlugin } from '@ldesign/i18n/vue'
 * import App from './App.vue'
 *
 * const app = createApp(App)
 *
 * // 安装 I18n 插件
 * app.use(createI18nPlugin({
 *   locale: 'zh-CN',
 *   fallbackLocale: 'en',
 *   messages: {
 *     'zh-CN': {
 *       hello: '你好',
 *       welcome: '欢迎 {name}'
 *     },
 *     'en': {
 *       hello: 'Hello',
 *       welcome: 'Welcome {name}'
 *     }
 *   }
 * }))
 *
 * app.mount('#app')
 * ```
 *
 * @example
 * ```vue
 * <!-- App.vue -->
 * <template>
 *   <div>
 *     <!-- 使用组合式 API -->
 *     <p>{{ t('hello') }}</p>
 *     <p>{{ t('welcome', { name: 'Vue' }) }}</p>
 *
 *     <!-- 使用组件 -->
 *     <I18nT keypath="hello" />
 *     <I18nT keypath="welcome" :params="{ name: 'Vue' }" />
 *
 *     <!-- 使用指令 -->
 *     <p v-t="'hello'"></p>
 *     <p v-t="{ key: 'welcome', params: { name: 'Vue' } }"></p>
 *
 *     <!-- 语言切换 -->
 *     <select @change="setLocale($event.target.value)">
 *       <option v-for="locale in availableLocales" :key="locale" :value="locale">
 *         {{ locale }}
 *       </option>
 *     </select>
 *   </div>
 * </template>
 *
 * <script setup>
 * import { useI18n } from '@ldesign/i18n/vue'
 *
 * const { t, locale, availableLocales, setLocale } = useI18n()
 * </script>
 * ```
 */

import { installComponents } from './components/index'
import { installDirectives } from './directives'
// 导出插件相关
/**
 * 安装所有 Vue I18n 功能的便捷函数
 *
 * @param app Vue 应用实例
 * @param options I18n 配置选项
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { installI18n } from '@ldesign/i18n/vue'
 * import App from './App.vue'
 *
 * const app = createApp(App)
 *
 * installI18n(app, {
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   }
 * })
 *
 * app.mount('#app')
 * ```
 */
import { createI18nPlugin } from './plugin'

// 导出核心类型
export type {
  CreateI18nOptions,
} from '../core/createI18n'
export type {
  I18nOptions,
  LanguagePackage,
} from '../types'

// 导出组件
export {
  components,
  I18nC,
  I18nChain,
  I18nD,
  I18nDT,
  I18nIf,
  I18nL,
  I18nN,
  I18nP,
  I18nR,
  I18nT,
  installComponents,
  LanguageSwitcher,
  TranslationMissing,
  TranslationProvider,
} from './components/index'

// 导出增强的组合式 API
export {
  type TranslationOptions,
  type TranslationResult,
  useI18nEnhanced,
} from './composables/useI18nEnhanced'

export {
  type LocalPerformanceMetrics,
  type PerformanceOptions,
  useI18nPerformance,
} from './composables/useI18nPerformance'

export {
  type BreadcrumbItem,
  type RouteConfig,
  type RouterI18nOptions,
  useI18nRouter,
} from './composables/useI18nRouter'

export {
  createCommonScopes,
  type ScopeOptions,
  useI18nScope,
  type UseI18nScopeReturn,
} from './composables/useI18nScope'

export {
  type FieldConfig,
  useI18nValidation,
  type ValidationError,
  type ValidationOptions,
  type ValidationRule,
} from './composables/useI18nValidation'

// 导出开发工具
export {
  type DevToolsOptions,
  getI18nDevTools,
  installI18nDevTools,
} from './devtools'

// 导出指令
export {
  directives,
  installDirectives,
  vT,
  vTHtml,
  vTPlural,
  vTTitle,
} from './directives'

// 导出 Engine 插件
export {
  createAdminI18n,
  createBlogI18n,
  createDesktopI18n,
  createEcommerceI18n,
  createI18nEnginePlugin,
  createMobileI18n,
  createSimpleI18n,
  createSPAI18n,
  getI18nInstance,
  getI18nPluginOptions,
  getI18nPluginState,
  i18nPlugin,
  validateI18nConfig,
} from './engine-plugin'

export {
  createI18nPlugin,
  createVueI18n,
  I18nInjectionKey,
  useI18n,
} from './plugin'

export type { VueI18n } from './types'

// 导出 Vue 特定类型
export type {
  DirectiveBinding,
  I18nEnginePluginOptions,
  I18nPluginOptions,
  I18nPluginState,
  I18nPreset,
  LanguageInfo,
  TranslationContext,
  UseI18nReturn,
} from './types'

export function installI18n(app: any, options: any) {
  // 安装插件
  app.use(createI18nPlugin(options))

  // 注册所有组件
  installComponents(app)

  // 注册所有指令
  installDirectives(app)
}

/**
 * 默认导出
 */
export default {
  install: installI18n,
}
