/// <reference types="vite/client" />

// Vite 环境类型声明
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly glob: (pattern: string, options?: { eager?: boolean }) => Record<string, () => Promise<unknown>>
}
