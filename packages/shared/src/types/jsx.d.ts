/**
 * Vue JSX 和 Vue 文件类型声明
 */

import type { VNode, DefineComponent } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass {
      $props: {}
    }
    interface ElementAttributesProperty {
      $props: {}
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface IntrinsicAttributes {
      key?: string | number
      ref?: any
    }
  }
}

// Vue 单文件组件类型声明
declare module '*.vue' {
  const component: DefineComponent<{}, {}, any>
  export default component
}

// ==================== Vue 相关类型增强 ====================

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // 全局属性类型定义
    $message: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
    $confirm: (message: string, title?: string) => Promise<boolean>
    $loading: {
      show: (message?: string) => void
      hide: () => void
    }
  }

  interface ComponentCustomProps {
    // 自定义组件 props 类型
    class?: string | string[] | Record<string, boolean>
    style?: string | Record<string, any>
  }
}

// Vue 组件实例类型
export type VueComponent<T = any> = import('vue').ComponentPublicInstance<T>

// Vue 组件选项类型
export type VueComponentOptions<T = any> = import('vue').ComponentOptionsBase<T>

// Vue 插件类型
export type VuePlugin = import('vue').Plugin

// Vue 应用实例类型
export type VueApp = import('vue').App

// Composition API 相关类型
export type ComputedRef<T> = import('vue').ComputedRef<T>
export type WritableComputedRef<T> = import('vue').WritableComputedRef<T>
export type WatchSource<T> = import('vue').WatchSource<T>
export type WatchCallback<T> = import('vue').WatchCallback<T>
export type WatchOptions = import('vue').WatchOptions
export type WatchStopHandle = import('vue').WatchStopHandle

// 响应式类型
export type Reactive<T> = import('vue').UnwrapNestedRefs<T>
export type Ref<T> = import('vue').Ref<T>
export type MaybeRef<T> = T | Ref<T>
export type MaybeRefOrGetter<T> = T | Ref<T> | (() => T)

// 组件 Props 类型
export type ComponentProps<T> = T extends new (...args: any) => any
  ? Omit<InstanceType<T>['$props'], keyof import('vue').VNodeProps>
  : never

// 组件 Emits 类型
export type ComponentEmits<T> = T extends new (...args: any) => { $emit: infer E }
  ? E
  : never

// 组件 Slots 类型
export type ComponentSlots<T> = T extends new (...args: any) => { $slots: infer S }
  ? NonNullable<S>
  : never

// 组件 Expose 类型
export type ComponentExpose<T> = T extends new (...args: any) => infer E
  ? E
  : never

export {}
