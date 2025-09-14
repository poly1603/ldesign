/**
 * 多框架适配器入口文件
 */

// Vue 适配器
export { LDesignTree as VueTree, LDesignTreePlugin as VueTreePlugin } from './vue'

// React 适配器
export { default as ReactTree, type LDesignTreeProps as ReactTreeProps, type LDesignTreeRef as ReactTreeRef } from './react'

// Angular 适配器
export { default as AngularTree, LDesignTreeModule as AngularTreeModule } from './angular'

// 原生JavaScript适配器
export { default as VanillaTree, createTree, registerGlobal, type VanillaTreeConfig } from './vanilla'

// 核心树组件
export { Tree } from '../core/tree'

// 类型定义
export type { TreeOptions, TreeNodeData, TreeNode } from '../types'
