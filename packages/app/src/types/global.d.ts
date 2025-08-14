/**
 * 全局类型声明
 */

declare global {
  const __DEV_MODE__: string
  const __DEV_ENV_INFO__: {
    mode: string
    description: string
    port: number
    packages: string
  }
  const __VUE_OPTIONS_API__: boolean
  const __VUE_PROD_DEVTOOLS__: boolean
}

export {}
