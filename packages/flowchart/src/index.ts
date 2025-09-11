/**
 * @ldesign/flowchart - 基于 LogicFlow 的审批流程图编辑器
 * 
 * 这是一个基于 @logicflow/core 的审批流程图编辑器组件，
 * 专为 OA 系统的流程审批流程可视化设计。
 * 
 * @author LDESIGN Team
 * @version 1.0.0
 */

// 导出核心编辑器类
export { FlowchartEditor } from './core/FlowchartEditor'
export { FlowchartViewer } from './core/FlowchartViewer'

// 导出审批流程节点
export { StartNode } from './nodes/StartNode'
export { ApprovalNode } from './nodes/ApprovalNode'
export { ConditionNode } from './nodes/ConditionNode'
export { EndNode } from './nodes/EndNode'
export { ProcessNode } from './nodes/ProcessNode'
export { ParallelGateway } from './nodes/ParallelGateway'
export { ExclusiveGateway } from './nodes/ExclusiveGateway'

// 导出连接线类型
export { ApprovalEdge } from './edges/ApprovalEdge'

// 导出主题系统
export { DefaultTheme } from './themes/DefaultTheme'
export { DarkTheme } from './themes/DarkTheme'
export { ThemeManager } from './themes/ThemeManager'

// 导出插件系统
export { PluginManager } from './plugins/PluginManager'
export { BasePlugin } from './plugins/BasePlugin'

// 导出内置插件
export { MiniMapPlugin } from './plugins/builtin/MiniMapPlugin'
export { HistoryPlugin } from './plugins/builtin/HistoryPlugin'
export { ExportPlugin } from './plugins/builtin/ExportPlugin'

// 导出 API 接口
export * from './api'

// 导出工具函数
export * from './utils'

// 导出类型定义
export * from './types'

// 导出UI组件
export * from './ui'

// 导出默认配置
export { defaultConfig } from './config/defaultConfig'

// 版本信息
export const version = '1.0.0'
