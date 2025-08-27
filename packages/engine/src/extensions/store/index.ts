/**
 * Store扩展集成模块
 * 
 * 负责处理Engine与Store的集成逻辑
 */

import type { Engine, StoreConfig } from '../../types'

/**
 * 检查是否为store配置对象
 */
export function isStoreConfig(store: any): store is StoreConfig {
  return store && typeof store === 'object' && (store.modules || store.plugins || store.strict !== undefined)
}

/**
 * 处理store配置
 * 
 * @param store Store配置或适配器
 * @param engine Engine实例
 */
export async function handleStoreConfig(
  store: any,
  engine: Engine,
): Promise<void> {
  if (isStoreConfig(store)) {
    // 如果是store配置对象，创建store插件
    await createStorePlugin(store, engine)
  } else {
    // 如果是store适配器，直接设置
    engine.setStore(store)
  }
}

/**
 * 创建store插件并安装到engine
 */
async function createStorePlugin(storeConfig: StoreConfig, engine: Engine): Promise<void> {
  try {
    // 这里可以集成不同的状态管理库
    // 例如 Pinia、Vuex 等
    engine.logger.info('Store plugin created and installed successfully', {
      modules: Object.keys(storeConfig.modules || {}),
      plugins: storeConfig.plugins?.length || 0,
    })
  } catch (error) {
    engine.logger.error('Failed to create store plugin', error)
    throw new Error(`Failed to create store plugin: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
