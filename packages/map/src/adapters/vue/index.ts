/**
 * Vue 3 适配器
 * 提供Vue 3的组合式API和组件，实现响应式的地图集成
 */

export { useLDesignMap } from './composables/useLDesignMap'
export { default as LDesignMapComponent } from './components/LDesignMapComponent.vue'
export type {
  VueMapOptions,
  VueMapInstance,
  VueMapEvents
} from './types'
