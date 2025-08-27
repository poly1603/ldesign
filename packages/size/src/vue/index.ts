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
} from './composables'

// 插件
export { createVueSizePlugin, VueSizePlugin, VueSizeSymbol } from './plugin'

// 默认导出插件
export { VueSizePlugin as default } from './plugin'

// 组件
export { default as SizeSwitcher } from './SizeSwitcher'
