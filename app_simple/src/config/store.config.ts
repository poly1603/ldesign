/**
 * Store 配置
 */

import type { StoreEnginePluginOptions } from '@ldesign/store'

/**
 * Store 配置
 */
export const storeConfig: StoreEnginePluginOptions = {
  // 开发工具
  devtools: {
    enabled: import.meta.env.DEV
  },
  
  // 持久化配置
  persist: {
    enabled: true,
    key: 'ldesign-store',
    storage: localStorage,
    beforeRestore: (context) => {
      // 恢复前的处理
    },
    afterRestore: (context) => {
      // 恢复后的处理
    }
  },
  
  // 性能配置
  performance: {
    monitoring: import.meta.env.DEV,
    slowThreshold: 100
  },
  
  // 插件配置
  plugins: []
}
