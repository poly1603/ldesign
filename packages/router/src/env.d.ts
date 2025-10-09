/// <reference types="vite/client" />

/**
 * 环境变量类型定义
 */
interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  readonly NODE_ENV: 'development' | 'production' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
