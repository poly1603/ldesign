/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string

  // LDesign Launcher 配置相关
  readonly VITE_LAUNCHER_CONFIG: string
  readonly VITE_LAUNCHER_ENVIRONMENT: string
  readonly VITE_LAUNCHER_COMMAND: string
  readonly VITE_LAUNCHER_TIMESTAMP: string

  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// LDesign Launcher 全局工具
declare global {
  interface Window {
    __LDESIGN_LAUNCHER__: {
      getConfig(): any
      getEnvironment(): string
      getCommand(): string
      getTimestamp(): number
      getFullConfig(): Promise<any>
      logConfig(): void
    }
  }
}
