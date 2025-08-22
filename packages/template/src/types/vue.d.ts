/**
 * Vue 3 类型声明文件
 *
 * 解决 Vue 3 导入问题
 */

declare module 'vue' {
  export * from '@vue/runtime-core'
  export * from '@vue/runtime-dom'
  export * from '@vue/reactivity'
  export * from '@vue/shared'

  // 确保这些常用的导出可用
  export const createApp: typeof import('@vue/runtime-dom').createApp
  export const defineComponent: typeof import('@vue/runtime-core').defineComponent
  export const ref: typeof import('@vue/reactivity').ref
  export const computed: typeof import('@vue/reactivity').computed
  export const watch: typeof import('@vue/runtime-core').watch
  export const onMounted: typeof import('@vue/runtime-core').onMounted
  export const onUnmounted: typeof import('@vue/runtime-core').onUnmounted
  export const defineAsyncComponent: typeof import('@vue/runtime-core').defineAsyncComponent

  // 类型导出
  export type App = import('@vue/runtime-core').App
  export type Component = import('@vue/runtime-core').Component
  export type PropType<T = any> = import('@vue/runtime-core').PropType<T>
  export type Directive = import('@vue/runtime-core').Directive
  export type DirectiveBinding<T = any> = import('@vue/runtime-core').DirectiveBinding<T>
  export type Plugin = import('@vue/runtime-core').Plugin
}
