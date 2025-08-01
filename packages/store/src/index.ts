/**
 * @ldesign/store
 * 一个基于Pinia的Vue3状态管理库，支持类、Hook、Provider、装饰器等多种使用方式
 */

import 'reflect-metadata'

// 核心功能
export * from './core'

// 装饰器
export * from './decorators'

// Vue 集成
export * from './vue'

// Hooks
export * from './hooks'

// 类型定义
export * from './types'

// 版本信息
export const version = '0.1.0'

// 默认导出
export { BaseStore } from './core/BaseStore'
