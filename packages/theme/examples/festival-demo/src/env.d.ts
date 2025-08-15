/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@ldesign/theme' {
  export * from '@ldesign/theme/src'
}

declare module '@ldesign/theme/*' {
  export * from '@ldesign/theme/src/*'
}

declare module '@ldesign/color' {
  export * from '@ldesign/color/src'
}

declare module '@ldesign/color/*' {
  export * from '@ldesign/color/src/*'
}
