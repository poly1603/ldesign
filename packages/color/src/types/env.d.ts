/// <reference types="vite/client" />

// 扩展 ImportMeta 接口以支持 Vite 环境变量
interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly BASE_URL: string
  readonly SSR: boolean
  // 更多环境变量可以在这里添加
  [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
