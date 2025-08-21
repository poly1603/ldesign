/**
 * Vue SFC 类型声明
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  interface HTMLAttributes {
    children?: any
  }

  interface ButtonHTMLAttributes {
    children?: any
  }

  interface ComponentCustomProperties {
    $t: (key: string, params?: any, options?: any) => string
    $i18n: any
    $i18nDebug?: {
      logTranslation: (key: string, result: string, params?: any) => void
      validateKey: (key: string) => boolean
      getStats: () => any
    }
  }
}

export {}
