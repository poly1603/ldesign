/**
 * Vue 单文件组件类型声明
 * 
 * 这个文件为 .vue 文件提供 TypeScript 类型支持
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, any>, Record<string, any>, any>
  export default component
}

// 确保这个文件被当作模块处理
export {}

