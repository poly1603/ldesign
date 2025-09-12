/**
 * @ldesign/flowchart Vue集成
 * 
 * 提供Vue专用的组件和组合式函数
 * 只有在使用Vue框架时才需要导入此模块
 */

// 导出Vue组件
export { default as FlowchartEditorVue } from './FlowchartEditor.vue'

// 注意：UI组件已改为原生DOM实现，不再提供Vue组件版本
// 如需在Vue中使用UI组件，请使用原生DOM组件：
// import { MaterialPanel, PropertyPanel, Toolbar } from '@ldesign/flowchart'

// 导出Vue组合式函数
export { useFlowchart, createFlowchartEditor } from './useFlowchart'
export type { UseFlowchartOptions, UseFlowchartReturn } from './useFlowchart'

// 重新导出核心功能（方便Vue用户使用）
export * from '../core'
export * from '../nodes'
export * from '../edges'
export * from '../plugins'
export * from '../themes'
export * from '../api'
export * from '../utils'
export * from '../types'
