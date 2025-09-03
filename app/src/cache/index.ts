/**
 * Cache 客户端插件配置
 *
 * 为应用提供完整的缓存管理功能，包括：
 * - 多存储引擎支持（Memory、LocalStorage、SessionStorage、IndexedDB、Cookie）
 * - 智能缓存策略
 * - 数据加密和压缩
 * - 自动过期管理
 * - 缓存统计和监控
 * - Vue 3 深度集成
 */

import { createCacheEnginePlugin } from '@ldesign/cache'
import type { CacheEnginePluginOptions } from '@ldesign/cache'

/**
 * 缓存配置
 */
const cacheConfig: CacheEnginePluginOptions['cacheConfig'] = {
  // 默认存储引擎
  defaultEngine: 'localStorage',
  
  // 安全配置
  enableEncryption: false, // 在生产环境中可以启用
  enableCompression: true, // 启用压缩以节省存储空间
  
  // 容量配置
  maxSize: 50 * 1024 * 1024, // 50MB 最大缓存大小
  
  // 过期配置
  ttl: 7 * 24 * 60 * 60 * 1000, // 7天默认过期时间
  
  // 清理配置
  cleanupInterval: 60 * 60 * 1000, // 1小时清理一次过期数据
  
  // 存储引擎特定配置
  engines: {
    localStorage: {
      prefix: 'ldesign_cache_',
      enableCompression: true,
    },
    sessionStorage: {
      prefix: 'ldesign_session_',
      enableCompression: false,
    },
    indexedDB: {
      dbName: 'LDesignCache',
      storeName: 'cache_store',
      version: 1,
    },
    memory: {
      maxSize: 10 * 1024 * 1024, // 10MB 内存缓存限制
    },
    cookie: {
      domain: undefined, // 使用当前域名
      path: '/',
      secure: false, // 在 HTTPS 环境中设置为 true
      sameSite: 'lax',
    },
  },
}

/**
 * 开发环境配置
 */
const developmentConfig: Partial<CacheEnginePluginOptions> = {
  debug: true,
  enablePerformanceMonitoring: true,
  cacheConfig: {
    ...cacheConfig,
    // 开发环境使用较短的过期时间
    ttl: 30 * 60 * 1000, // 30分钟
    cleanupInterval: 5 * 60 * 1000, // 5分钟清理一次
  },
}

/**
 * 生产环境配置
 */
const productionConfig: Partial<CacheEnginePluginOptions> = {
  debug: false,
  enablePerformanceMonitoring: false,
  cacheConfig: {
    ...cacheConfig,
    // 生产环境启用加密
    enableEncryption: true,
    // 更长的过期时间
    ttl: 30 * 24 * 60 * 60 * 1000, // 30天
    cleanupInterval: 24 * 60 * 60 * 1000, // 24小时清理一次
  },
}

/**
 * 根据环境选择配置
 */
const getEnvironmentConfig = (): Partial<CacheEnginePluginOptions> => {
  const isDevelopment = import.meta.env.DEV
  return isDevelopment ? developmentConfig : productionConfig
}

/**
 * 最终缓存配置
 */
const finalCacheConfig: CacheEnginePluginOptions = {
  // 插件基础信息
  name: 'cache',
  version: '1.0.0',
  description: 'LDesign Cache Engine Plugin for App',

  // 缓存配置
  cacheConfig,

  // Vue 插件配置
  autoInstall: true,
  globalPropertyName: '$cache',
  registerComposables: true,

  // 环境特定配置
  ...getEnvironmentConfig(),
}

/**
 * 创建标准化的 Cache 引擎插件
 *
 * 使用 @ldesign/cache 包提供的标准插件创建函数，
 * 确保与其他已集成包保持一致的插件创建模式
 */
export const cachePlugin = createCacheEnginePlugin(finalCacheConfig)

/**
 * 导出 Cache 插件实例
 * 
 * 使用示例：
 * ```typescript
 * import { cachePlugin } from './cache'
 * 
 * // 在 engine 中使用
 * const engine = createAndMountApp(App, '#app', {
 *   plugins: [cachePlugin]
 * })
 * 
 * // 在组件中使用
 * import { useCache } from '@ldesign/cache/vue'
 * 
 * const { get, set, delete: del } = useCache()
 * 
 * // 设置缓存
 * await set('user:123', { name: 'John', age: 30 })
 * 
 * // 获取缓存
 * const user = await get('user:123')
 * 
 * // 删除缓存
 * await del('user:123')
 * ```
 */
export default cachePlugin

/**
 * 导出配置供其他模块使用
 */
export { finalCacheConfig as cacheConfig }
