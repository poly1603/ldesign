export {
  BorderRadiusConfig,
  CSSVariableConfig,
  ComponentSizeConfig,
  FontSizeConfig,
  ShadowConfig,
  SizeChangeEvent,
  SizeConfig,
  SizeManager,
  SizeManagerOptions,
  SizeMode,
  SpacingConfig,
  VueSizeComponentProps,
  VueSizePluginOptions,
} from './types/index.js'
export {
  extraLargeSizeConfig,
  getAvailableModes,
  getSizeConfig,
  largeSizeConfig,
  mediumSizeConfig,
  sizeConfigs,
  smallSizeConfig,
} from './core/presets.js'
export {
  CSSVariableGenerator,
  createCSSVariableGenerator,
  defaultCSSVariableGenerator,
} from './core/css-generator.js'
export {
  CSSInjectionOptions,
  CSSInjector,
  createCSSInjector,
  getCSSVariableValue,
  globalCSSInjector,
  injectGlobalVariables,
  isVariablesInjected,
  removeGlobalVariables,
  setCSSVariableValue,
} from './core/css-injector.js'
export {
  SizeManagerImpl,
  createSizeManager,
  globalSizeManager as default,
  getGlobalSizeMode,
  globalSizeManager,
  onGlobalSizeChange,
  setGlobalSizeMode,
} from './core/size-manager.js'
export {
  calculateSizeScale,
  compareSizeModes,
  debounce,
  deepMergeConfig,
  formatCSSValue,
  getNextSizeMode,
  getPreviousSizeMode,
  getSizeModeDisplayName,
  isValidInput,
  isValidSizeMode,
  parseCSSValue,
  parseSizeMode,
  throttle,
} from './utils/index.js'
import * as vue_index from './vue/index.js'
export { vue_index as Vue }
