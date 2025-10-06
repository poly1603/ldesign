/**
 * Vue 模块导出
 */

// Composition API
export {
  useGlobalSize,
  useSize,
  useSizeAnimation,
  type UseSizeOptions,
  useSizeResponsive,
  type UseSizeReturn,
  useSizeState,
  useSizeSwitcher,
  useSizeWatcher,
  useSmartSize,
} from './composables'

// 插件
export { createVueSizePlugin, VueSizePlugin, VueSizeSymbol } from './plugin'

// 默认导出插件
export { VueSizePlugin as default } from './plugin'
export { SizeControlPanel } from './SizeControlPanel'
export { SizeIndicator } from './SizeIndicator'

// 组件
export { SizeSwitcher } from './SizeSwitcher'

// 便捷工具函数
export {
  createSizeApp,
  installSizePlugin,
  installWithPreset,
  registerSizeComponents,
  SizeComponents,
  sizePresets,
} from './utils'
