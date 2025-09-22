/**
 * 全局类型声明
 */

import type { DefineComponent } from 'vue'

// Vue 单文件组件类型声明
declare module '*.vue' {
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 确保这个文件被当作模块处理
export {}
