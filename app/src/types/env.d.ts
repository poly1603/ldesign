/**
 * Environment Types
 * 
 * 环境变量和全局类型声明
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { AppConfig } from './app-config'

declare global {
  namespace ImportMeta {
    interface Env {
      /**
       * 应用配置
       * 
       * 通过 app.config.ts 文件定义，支持热更新
       * 
       * @example
       * ```typescript
       * // 访问应用配置
       * const config = import.meta.env.appConfig
       * console.log(config.appName) // 'LDesign App'
       * console.log(config.api.baseUrl) // 'http://localhost:8080/api'
       * ```
       */
      appConfig: AppConfig
      
      // Vite 默认环境变量
      readonly MODE: string
      readonly BASE_URL: string
      readonly PROD: boolean
      readonly DEV: boolean
      readonly SSR: boolean
    }
  }
}

export {}
