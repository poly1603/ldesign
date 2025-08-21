/**
 * I18n Web Components 统一导出
 *
 * 基于Lit框架的国际化Web Components组件库
 * 提供开箱即用的多语言组件支持
 */

export { I18nButton } from './components/i18n-button'
export { I18nInput } from './components/i18n-input'
export { I18nLanguageSwitcher } from './components/i18n-language-switcher'
// 导出组件
export { I18nText } from './components/i18n-text'

// 导出样式
export {
  baseStyles,
  buttonStyles,
  cssVariables,
  darkThemeVariables,
  dropdownStyles,
  inputStyles,
  resetStyles,
  utilityStyles,
} from './styles/shared-styles'
// 导出工具
export {
  changeLanguage,
  getAvailableLanguages,
  getCurrentLanguage,
  getI18nConnector,
  I18nConnector,
  t,
} from './utils/i18n-connector'

// 导入 getI18nConnector 用于内部使用
import { getI18nConnector } from './utils/i18n-connector'

export type {
  I18nConnectorConfig,
  I18nConnectorEvents,
} from './utils/i18n-connector'

/**
 * 注册所有Web Components
 *
 * 这个函数会自动注册所有i18n相关的Web Components
 * 通常在应用启动时调用一次即可
 *
 * @example
 * ```typescript
 * import { registerI18nComponents } from '@ldesign/i18n/web-components'
 *
 * // 注册所有组件
 * registerI18nComponents()
 *
 * // 现在可以在HTML中使用组件了
 * // <i18n-text key="common.ok"></i18n-text>
 * // <i18n-language-switcher></i18n-language-switcher>
 * ```
 */
export function registerI18nComponents(): void {
  // 组件会在导入时自动注册，这里只是确保所有组件都被导入
  // 实际的注册通过 @customElement 装饰器完成

  console.log('[I18n Web Components] All components registered successfully')
  console.log('[I18n Web Components] Available components:')
  console.log('  - <i18n-text key="..."></i18n-text>')
  console.log('  - <i18n-input placeholder-key="..."></i18n-input>')
  console.log('  - <i18n-button text-key="..."></i18n-button>')
  console.log('  - <i18n-language-switcher></i18n-language-switcher>')
}

/**
 * 初始化i18n Web Components
 *
 * 这个函数会注册所有组件并设置全局i18n实例
 *
 * @param i18n - i18n实例
 * @param options - 初始化选项
 *
 * @example
 * ```typescript
 * import { createI18n } from '@ldesign/i18n'
 * import { initI18nComponents } from '@ldesign/i18n/web-components'
 *
 * const i18n = await createI18n()
 * initI18nComponents(i18n, { debug: true })
 * ```
 */
export function initI18nComponents(
  i18n: any,
  options: {
    debug?: boolean
    autoRetry?: boolean
    retryInterval?: number
    maxRetries?: number
  } = {},
): void {
  // 设置全局i18n实例
  if (typeof window !== 'undefined') {
    (window as any).i18n = i18n

      // 暴露 getI18nConnector 函数到全局作用域，以便 WebComponent 可以访问
      (window as any).getI18nConnector = getI18nConnector

    // 发出i18n实例就绪事件
    const event = new CustomEvent('i18n-instance-ready', {
      detail: { i18n },
      bubbles: true,
    })
    window.dispatchEvent(event)
  }

  // 注册组件
  registerI18nComponents()

  if (options.debug) {
    console.log('[I18n Web Components] Initialized successfully with i18n instance')
    console.log('[I18n Web Components] getI18nConnector function exposed to global scope')
  }
}

/**
 * 检查Web Components支持
 *
 * @returns 是否支持Web Components
 */
export function isWebComponentsSupported(): boolean {
  return (
    typeof window !== 'undefined'
    && 'customElements' in window
    && 'attachShadow' in Element.prototype
    && 'getRootNode' in Element.prototype
    && 'addEventListener' in Element.prototype
    && 'removeEventListener' in Element.prototype
  )
}

/**
 * 获取Web Components兼容性信息
 *
 * @returns 兼容性信息对象
 */
export function getWebComponentsCompatibility(): {
  supported: boolean
  features: {
    customElements: boolean
    shadowDOM: boolean
    templates: boolean
    esModules: boolean
  }
  recommendations: string[]
} {
  const features = {
    customElements: typeof window !== 'undefined' && 'customElements' in window,
    shadowDOM: typeof Element !== 'undefined' && 'attachShadow' in Element.prototype,
    templates: typeof HTMLTemplateElement !== 'undefined',
    esModules: typeof window !== 'undefined' && 'noModule' in HTMLScriptElement.prototype,
  }

  const supported = Object.values(features).every(Boolean)
  const recommendations: string[] = []

  if (!features.customElements) {
    recommendations.push('Consider using a Custom Elements polyfill')
  }
  if (!features.shadowDOM) {
    recommendations.push('Consider using a Shadow DOM polyfill')
  }
  if (!features.templates) {
    recommendations.push('Consider using a HTML Templates polyfill')
  }
  if (!features.esModules) {
    recommendations.push('Consider using a module bundler or transpiler')
  }

  return {
    supported,
    features,
    recommendations,
  }
}

/**
 * 默认导出
 */
export default {
  registerI18nComponents,
  initI18nComponents,
  isWebComponentsSupported,
  getWebComponentsCompatibility,
}

/**
 * 版本信息
 */
export const VERSION = '1.0.0'

/**
 * 组件信息
 */
export const COMPONENTS = [
  {
    name: 'i18n-text',
    description: 'Translatable text component',
    attributes: ['key', 'params', 'default', 'block', 'html', 'options'],
    events: ['translated', 'translation-error'],
  },
  {
    name: 'i18n-input',
    description: 'Translatable input component',
    attributes: [
      'label-key',
      'placeholder-key',
      'help-key',
      'error-key',
      'type',
      'value',
      'name',
      'required',
      'disabled',
      'readonly',
      'minlength',
      'maxlength',
      'inputmode',
      'autocomplete',
      'size',
      'invalid',
      'loading',
    ],
    events: ['input', 'change', 'focus', 'blur'],
  },
  {
    name: 'i18n-button',
    description: 'Translatable button component',
    attributes: [
      'text-key',
      'variant',
      'size',
      'disabled',
      'loading',
      'block',
      'type',
      'name',
      'value',
      'icon',
      'icon-position',
      'params',
    ],
    events: ['click'],
  },
  {
    name: 'i18n-language-switcher',
    description: 'Language switcher component',
    attributes: [
      'theme',
      'position',
      'show-flags',
      'compact',
      'borderless',
      'disabled',
      'languages',
      'show-native-name',
    ],
    events: ['language-changed', 'language-change-error'],
  },
] as const
