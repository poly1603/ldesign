/**
 * 应用入口文件
 * 启动 LDesign 应用
 */

import { bootstrap } from './bootstrap'

// 启动应用
bootstrap().then(engine => {
  console.log('🎉 应用启动成功！')
  console.log('Engine实例:', engine)
}).catch(error => {
  console.error('❌ 应用启动失败:', error)
})

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