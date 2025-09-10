/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@ldesign/editor' {
  export * from '../src/index'
}

declare module '@ldesign/editor/*' {
  const content: any
  export default content
}
