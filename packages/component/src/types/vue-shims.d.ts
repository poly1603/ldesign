/**
 * Vue 文件类型声明
 * 
 * 为 .vue 文件提供 TypeScript 类型支持
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/**
 * 全局组件类型声明
 */
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    // 这里可以添加全局组件的类型声明
  }
}

/**
 * 环境变量类型声明
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_BUILD_TIME: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * CSS 模块类型声明
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.less' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

/**
 * 静态资源类型声明
 */
declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}

/**
 * JSON 文件类型声明
 */
declare module '*.json' {
  const value: any
  export default value
}

/**
 * 文本文件类型声明
 */
declare module '*.txt' {
  const content: string
  export default content
}

declare module '*.md' {
  const content: string
  export default content
}

/**
 * Web Worker 类型声明
 */
declare module '*?worker' {
  const WorkerConstructor: {
    new (): Worker
  }
  export default WorkerConstructor
}

declare module '*?worker&inline' {
  const WorkerConstructor: {
    new (): Worker
  }
  export default WorkerConstructor
}

/**
 * WASM 类型声明
 */
declare module '*.wasm' {
  const wasmModule: WebAssembly.Module
  export default wasmModule
}

/**
 * 字体文件类型声明
 */
declare module '*.woff' {
  const src: string
  export default src
}

declare module '*.woff2' {
  const src: string
  export default src
}

declare module '*.ttf' {
  const src: string
  export default src
}

declare module '*.eot' {
  const src: string
  export default src
}

/**
 * 音视频文件类型声明
 */
declare module '*.mp3' {
  const src: string
  export default src
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module '*.webm' {
  const src: string
  export default src
}

declare module '*.ogg' {
  const src: string
  export default src
}

/**
 * 其他文件类型声明
 */
declare module '*.pdf' {
  const src: string
  export default src
}

declare module '*.zip' {
  const src: string
  export default src
}

/**
 * Vite 特定类型声明
 */
declare module 'virtual:*' {
  const result: any
  export default result
}

/**
 * 测试相关类型声明
 */
declare namespace Vi {
  interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
}

/**
 * 全局类型扩展
 */
declare global {
  interface Window {
    // 可以在这里添加全局 window 对象的扩展
    __LDESIGN_VERSION__?: string
    __LDESIGN_BUILD_TIME__?: string
  }
}

export {}
