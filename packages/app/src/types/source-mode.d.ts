/**
 * Source 模式专用类型声明
 * 用于解决源码模式下的类型导入问题
 */

declare module '@ldesign/device' {
  export function createDeviceEnginePlugin(config?: any): any
  export * from '@ldesign/device/src'
}

declare module '@ldesign/engine' {
  export interface CreateEngineOptions {
    debug?: boolean
    [key: string]: any
  }
  export function createEngine(options?: CreateEngineOptions): any
  export * from '@ldesign/engine/src'
}

declare module '@ldesign/template' {
  export interface TemplateEnginePluginConfig {
    name: string
    version: string
    defaultDevice?: string
    [key: string]: any
  }
  export function createTemplateEnginePlugin(config: TemplateEnginePluginConfig): any
  export * from '@ldesign/template/src'
}

declare module '@ldesign/cache' {
  export interface CacheOptions {
    [key: string]: any
  }
  export function createCache(options?: CacheOptions): any
  export * from '@ldesign/cache/src'
}

declare module '@ldesign/router' {
  export function createRouterEnginePlugin(config?: any): any
  export * from '@ldesign/router/src'
}

declare module '@ldesign/i18n' {
  export function createI18nEnginePlugin(config?: any): any
  export * from '@ldesign/i18n/src'
}

declare module '@ldesign/http' {
  export function createHttpEnginePlugin(config?: any): any
  export * from '@ldesign/http/src'
}

// 全局类型扩展
declare global {
  interface Window {
    __DEV_MODE__?: string
    __DEV_ENV_INFO__?: any
  }
}
