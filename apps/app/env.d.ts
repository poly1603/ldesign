/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

// LDesign 模块声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string, params?: Record<string, any>) => string
    $i18n: {
      locale: string
      availableLanguages: Array<{
        code: string
        name: string
        nativeName: string
        flag?: string
      }>
      changeLanguage: (locale: string) => void
      getPerformanceMetrics?: () => any
      getOptimizationSuggestions?: () => any
    }
  }
}

// i18n 相关类型
interface LanguageInfo {
  code: string
  name: string
  nativeName: string
  flag?: string
}

// Store 相关类型扩展
declare global {
  interface Window {
    __LDESIGN_ENGINE__?: any
    __VUE_APP__?: any
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
