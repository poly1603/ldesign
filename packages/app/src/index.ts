/**
 * LDesign App 简化演示入口
 *
 * 展示 LDesign Engine 生态系统的基本集成
 */

// 导出主要组件和函数
export { default as App } from './App'
export { default as createLDesignApp } from './main'
export { routes } from './router/routes'

// 导出类型和工具
export * from './types'
export * from './utils'

// 导出集成的包功能
export * as Cache from '@ldesign/cache'
// Cache Vue 集成 (注意：cache包没有vue导出，使用组合式API)
export { createCache, defaultCache } from '@ldesign/cache'
export * as Color from '@ldesign/color'
export * as ColorVue from '@ldesign/color/vue'
export * as Crypto from '@ldesign/crypto'
export * as CryptoVue from '@ldesign/crypto/vue'
export * as Size from '@ldesign/size'
export * as SizeVue from '@ldesign/size/vue'
export * as Store from '@ldesign/store'
export * as StoreVue from '@ldesign/store/vue'
