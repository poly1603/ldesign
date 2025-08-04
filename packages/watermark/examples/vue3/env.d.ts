/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@ldesign/watermark' {
  export * from '@ldesign/watermark/dist/index.d.ts'
}
