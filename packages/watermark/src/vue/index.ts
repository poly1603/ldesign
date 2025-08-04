/**
 * Vue3 集成模块入口文件
 */

// 组合式API
export { useWatermark } from './composables/useWatermark'

// 组件
export { default as Watermark } from './components/Watermark.vue'
export { default as WatermarkProvider } from './components/WatermarkProvider.vue'

// 指令
export { vWatermark } from './directives/watermark'

// 插件
export { WatermarkPlugin } from './plugin'
export type { WatermarkPluginOptions } from './plugin'

// Vue特定类型
export type {
  UseWatermarkOptions,
  UseWatermarkReturn,
  WatermarkComponentProps,
  WatermarkProviderProps,
  WatermarkDirectiveValue,
  WatermarkDirectiveModifiers
} from './types'

// 默认导出插件
export default WatermarkPlugin