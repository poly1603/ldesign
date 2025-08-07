/**
 * Vue3 集成模块入口文件
 */

// 组件
export { default as Watermark } from './components/Watermark.vue'

export { default as WatermarkProvider } from './components/WatermarkProvider.vue'
// 组合式API
export { useWatermark } from './composables/useWatermark'

// 指令
export { vWatermark } from './directives/watermark'

// 插件
export { WatermarkPlugin } from './plugin'
export type { WatermarkPluginOptions } from './plugin'

// 默认导出插件
export { WatermarkPlugin as default } from './plugin'

// Vue特定类型
export type {
  UseWatermarkOptions,
  UseWatermarkReturn,
  WatermarkComponentProps,
  WatermarkDirectiveModifiers,
  WatermarkDirectiveValue,
  WatermarkProviderProps,
} from './types'
