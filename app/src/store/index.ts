/**
 * Store 状态管理插件配置
 *
 * 为应用提供完整的状态管理功能，包括：
 * - 基于 Pinia 的现代状态管理
 * - 装饰器支持
 * - 函数式和组合式 API
 * - 性能优化和缓存
 * - 持久化存储
 * - TypeScript 类型安全
 * - Vue 3 深度集成
 */

import { createStoreEnginePlugin } from '@ldesign/store'
import type { StoreEnginePluginOptions } from '@ldesign/store'

/**
 * Store 状态管理基础配置
 * 
 * 配置了适合演示应用的状态管理参数，包括性能优化、
 * 缓存策略、持久化等，支持多种状态管理模式
 */
const storeConfig: StoreEnginePluginOptions = {
  // 插件基础信息
  name: 'store',
  version: '1.0.0',
  description: 'LDesign Store Plugin for Demo App',

  // Store 配置
  storeConfig: {
    // 启用性能优化
    enablePerformanceOptimization: true,
    // 启用持久化（可选）
    enablePersistence: false, // 默认关闭，可根据需要开启
    // 开发模式下启用调试
    debug: process.env.NODE_ENV === 'development',
    
    // 默认缓存配置
    defaultCacheOptions: {
      ttl: 300000, // 5分钟缓存时间
      maxSize: 100 // 最大缓存条目数
    },
    
    // 默认持久化配置
    defaultPersistOptions: {
      key: 'ldesign-demo-store', // 存储键名
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      paths: [] // 需要持久化的状态路径，空数组表示不持久化任何状态
    }
  },

  // Vue 插件配置
  globalInjection: true, // 启用全局注入
  globalPropertyName: '$store', // 全局属性名

  // 自动安装配置
  autoInstall: true,
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development', // 开发模式下启用性能监控
  debug: process.env.NODE_ENV === 'development', // 开发模式下启用调试

  // 全局配置
  globalConfig: {
    // 这里可以添加全局的 store 配置
    // 例如：默认的缓存选项、持久化选项等
  }
}

/**
 * 创建标准化的 Store 引擎插件
 *
 * 使用 @ldesign/store 包提供的标准插件创建函数，
 * 确保与其他已集成包保持一致的插件创建模式
 */
export const storePlugin = createStoreEnginePlugin(storeConfig)

/**
 * 导出 Store 插件实例
 * 
 * 使用示例：
 * ```typescript
 * import { storePlugin } from './store'
 * 
 * // 在 engine 中使用
 * const engine = createAndMountApp(App, '#app', {
 *   plugins: [storePlugin]
 * })
 * 
 * // 在组件中使用
 * import { useStore } from '@ldesign/store/vue'
 * import { createStore } from '@ldesign/store'
 * 
 * // 创建一个 store
 * const userStore = createStore({
 *   id: 'user',
 *   state: () => ({
 *     name: '',
 *     email: ''
 *   }),
 *   actions: {
 *     updateUser(data) {
 *       this.name = data.name
 *       this.email = data.email
 *     }
 *   }
 * })
 * 
 * // 在组件中使用
 * const store = useStore(userStore)
 * ```
 */
export default storePlugin
