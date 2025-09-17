/**
 * NPM 包专用入口文件
 * 导出应用的核心功能，用于 npm 包发布
 */

// 导出配置相关功能
export {
  defineConfig,
  defineConfigAsync,
  getDefaultConfig,
  createConfigTemplate
} from './config/index'

// 导出类型定义
export type {
  AppConfig,
  ConfigInput,
  ConfigFunction,
  ApiConfig,
  ThemeConfig,
  FeaturesConfig,
  I18nConfig,
  RouterConfig,
  BuildConfig,
  SecurityConfig,
  LogConfig
} from './types/app-config'

// 导出核心插件
export { routerPlugin } from './router'
export { templatePlugin } from './templates'
export { colorPlugin } from './color'
export { sizePlugin } from './size'
export { httpPlugin } from './http'
export { storePlugin } from './store'
export { cryptoPlugin } from './crypto'
export { cachePlugin } from './cache'
export { apiPlugin, systemPlugin, customApiPlugin } from './api'
export { devicePlugin } from './device'

// 导出主应用组件
export { default as App } from './App.vue'

// 导出一个简化的创建应用函数
export function createLDesignApp() {
  return {
    message: 'LDesign App - NPM Package Version',
    version: '4.0.0',
    plugins: [
      'routerPlugin',
      'templatePlugin',
      'colorPlugin',
      'sizePlugin',
      'httpPlugin',
      'storePlugin',
      'cryptoPlugin',
      'cachePlugin',
      'apiPlugin',
      'devicePlugin'
    ]
  }
}

// 导出工具函数
export function createAppConfig(config: any) {
  return {
    ...config,
    version: '4.0.0',
    timestamp: new Date().toISOString()
  }
}
