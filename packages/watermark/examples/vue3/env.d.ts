/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  // eslint-disable-next-line ts/no-explicit-any
  const component: DefineComponent<object, object, any>
  export default component
}

declare module '@ldesign/watermark' {
  export * from '@ldesign/watermark/dist/index.d.ts'
}
