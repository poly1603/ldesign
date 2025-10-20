/**
 * Store 配置
 * 使用 @ldesign/store 包
 */

import { 
  createStoreEnginePlugin as createPackageStorePlugin,
  useStore as useVueStore,
  useState,
  useAction,
  useGetter,
  StoreFactory
} from '@ldesign/store'
import type { StoreEnginePluginOptions } from '@ldesign/store'
import { storeConfig } from '@/config/store.config'

// 导出 Vue 专用的 hooks
export const useStore = useVueStore
export { useState, useAction, useGetter }

/**
 * 创建 Store Engine 插件
 */
export function createStoreEnginePlugin(options: StoreEnginePluginOptions = {}) {
  // 合并应用配置与传入的配置
  const mergedConfig = {
    ...storeConfig,
    ...options,
  }

  // 使用包中的插件创建函数
  return createPackageStorePlugin(mergedConfig)
}

/**
 * 创建 Store 插件（用于 bootstrap）
 */
export function createStore() {
  return createStoreEnginePlugin(storeConfig)
}

// 导出默认
export default {
  useStore: useVueStore,
  useState,
  useAction,
  useGetter,
  createStoreEnginePlugin,
  createStore
}