/**
 * Vue 模块导出
 */

// 插件
export { VueSizePlugin, createVueSizePlugin, VueSizeSymbol } from './plugin'

// Composition API
export {
  useSize,
  useGlobalSize,
  useSizeSwitcher,
  useSizeResponsive,
  useSizeWatcher,
  type UseSizeOptions,
  type UseSizeReturn,
} from './composables'

// 组件
export {
  SizeSwitcher,
  SizeIndicator,
  SizeControlPanel,
} from './SizeSwitcher'

// 默认导出插件
export { VueSizePlugin as default } from './plugin'
