/**
 * @ldesign/tree - 功能完整的树形选择组件插件
 * 
 * 主要功能：
 * - 支持响应式设计，兼容PC端、平板和手机端
 * - 支持单选和多选模式
 * - 支持无限层级的树形结构
 * - 实现平滑的展开/收起动画效果
 * - 节点拖拽功能（支持节点间的拖拽排序和层级调整）
 * - 节点搜索和过滤功能
 * - 节点的增删改操作
 * - 支持异步加载子节点
 * - 支持节点图标自定义
 * - 支持复选框、单选框等选择模式
 * - 支持节点禁用状态
 * - 支持虚拟滚动（处理大数据量）
 * 
 * @author ldesign
 * @version 0.1.0
 */

// 核心类型导出
export * from './types'

// 核心功能导出
export * from './core'

// 工具函数导出
export * from './utils'

// 组件导出
export * from './components'

// 插件系统导出
export * from './plugins'

// 默认导出
export { default } from './core/tree'
