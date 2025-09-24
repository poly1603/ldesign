/**
 * CSS 集成功能导出模块
 * 包含 CSS 变量注入、样式管理等功能
 */

// CSS 注入器
export {
  createCSSInjector,
  createCSSVariableGenerator,
  CSSInjectorImpl,
  CSSVariableGenerator,
  defaultCSSInjector,
  defaultCSSVariableGenerator,
  injectScaleVariables,
  removeAllColorVariables,
} from '../utils/css-injector'

export type { CSSInjectionOptions } from '../utils/css-injector'

// CSS 变量工具
export {
  CSSVariableInjector,
  getCSSVariableValue,
  globalCSSInjector,
  globalThemeApplier,
  globalThemeCacheManager,
  injectThemeVariables,
  setCSSVariableValue,
  toggleThemeMode,
} from '../utils/css-variables'
