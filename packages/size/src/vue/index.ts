/**
 * Vue 模块导出
 */

// Composition API
export {
  useGlobalSize,
  useSize,
  type UseSizeOptions,
  useSizeResponsive,
  type UseSizeReturn,
  useSizeSwitcher,
  useSizeWatcher,
  useSmartSize,
  useSizeAnimation,
  useSizeState,
} from './composables'

// 插件
export { createVueSizePlugin, VueSizePlugin, VueSizeSymbol } from './plugin'

// 组件
export { SizeSwitcher } from './SizeSwitcher'
export { SizeIndicator } from './SizeIndicator'
export { SizeControlPanel } from './SizeControlPanel'

// 便捷工具函数
export {
  installSizePlugin,
  installWithPreset,
  createSizeApp,
  registerSizeComponents,
  sizePresets,
  SizeComponents
} from './utils'

// 默认导出插件
export { VueSizePlugin as default } from './plugin'
