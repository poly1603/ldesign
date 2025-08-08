// Vue组件类型声明

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 全局类型扩展
declare global {
  interface Window {
    // 可以在这里添加全局类型扩展
  }
}

export {}
