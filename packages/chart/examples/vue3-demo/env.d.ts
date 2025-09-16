/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@ldesign/chart' {
  export * from '../../src'
}

declare module '@ldesign/chart/vue' {
  export * from '../../src/vue'
}
