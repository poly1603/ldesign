/**
 * Cache 插件 - Vue 直接集成
 */
import type { App } from 'vue'
import { CacheManager } from '@ldesign/cache/core/cache-manager'
import { CacheProvider, CACHE_MANAGER_KEY } from '@ldesign/cache/vue'
import type { CacheOptions } from '@ldesign/cache'

export interface CachePluginOptions extends CacheOptions {
  globalPropertyName?: string
}

/**
 * 创建 Cache Vue 插件
 */
export function createCacheVuePlugin(options: CachePluginOptions = {}) {
  const {
    globalPropertyName = '$cache',
    ...cacheOptions
  } = options

  const manager = new CacheManager(cacheOptions)

  return {
    install(app: App) {
      // 提供缓存管理器
      app.provide(CACHE_MANAGER_KEY, manager)

      // 注册全局属性
      app.config.globalProperties[globalPropertyName] = {
        manager,
        get: manager.get.bind(manager),
        set: manager.set.bind(manager),
        remove: manager.remove.bind(manager),
        clear: manager.clear.bind(manager),
        has: manager.has.bind(manager),
        keys: manager.keys.bind(manager),
        getStats: manager.getStats.bind(manager),
        remember: manager.remember.bind(manager)
      }

      // 注册全局组件
      app.component('CacheProvider', CacheProvider)

      console.info('[Cache Plugin] 已安装')
    }
  }
}




