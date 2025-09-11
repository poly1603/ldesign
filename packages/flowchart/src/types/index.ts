/**
 * @ldesign/flowchart 类型定义
 * 
 * 定义审批流程图编辑器的所有 TypeScript 类型
 */

import type { LogicFlow } from '@logicflow/core'

// 基础几何类型
export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rectangle extends Point, Size { }

// 审批流程节点类型
export type ApprovalNodeType =
  | 'start'           // 开始节点
  | 'approval'        // 审批节点
  | 'condition'       // 条件节点
  | 'end'            // 结束节点
  | 'process'        // 处理节点
  | 'parallel-gateway'   // 并行网关
  | 'exclusive-gateway'  // 排他网关

// 审批状态
export type ApprovalStatus =
  | 'pending'    // 待审批
  | 'approved'   // 已通过
  | 'rejected'   // 已拒绝
  | 'processing' // 处理中
  | 'completed'  // 已完成

// 节点配置
export interface ApprovalNodeConfig {
  id?: string
  type: ApprovalNodeType
  x: number
  y: number
  text?: string
  properties?: {
    // 审批人信息
    approvers?: Array<{
      id: string
      name: string
      role?: string
    }>
    // 审批状态
    status?: ApprovalStatus
    // 审批时间限制（小时）
    timeLimit?: number
    // 是否允许委托
    allowDelegate?: boolean
    // 是否允许加签
    allowAddSign?: boolean
    // 自定义属性
    [key: string]: any
  }
}

// 边配置
export interface ApprovalEdgeConfig {
  id?: string
  type?: string
  sourceNodeId: string
  targetNodeId: string
  text?: string
  properties?: {
    // 条件表达式
    condition?: string
    // 优先级
    priority?: number
    // 自定义属性
    [key: string]: any
  }
}

// 流程图数据
export interface FlowchartData {
  nodes: ApprovalNodeConfig[]
  edges: ApprovalEdgeConfig[]
}

// 编辑器配置
export interface FlowchartEditorConfig {
  // 容器元素
  container: HTMLElement | string
  // 画布尺寸
  width?: number
  height?: number
  // 是否只读
  readonly?: boolean
  // 主题
  theme?: string | ThemeConfig
  // 网格配置
  grid?: {
    size?: number
    visible?: boolean
    type?: 'dot' | 'line'
  }
  // 工具栏配置
  toolbar?: {
    visible?: boolean
    tools?: string[]
  }
  // 属性面板配置
  propertyPanel?: {
    visible?: boolean
    position?: 'left' | 'right'
  }
  // 节点面板配置
  nodePanel?: {
    visible?: boolean
    position?: 'left' | 'right'
  }
  // 插件配置
  plugins?: any[]
  // LogicFlow 配置
  logicflowConfig?: any
}

// 预览器配置
export interface FlowchartViewerConfig {
  container: HTMLElement | string
  width?: number
  height?: number
  data?: FlowchartData
  // 高亮节点
  highlightNodes?: string[]
  // 执行状态
  executionState?: {
    currentNode?: string
    completedNodes?: string[]
    failedNodes?: string[]
  }
}

// 主题配置
export interface ThemeConfig {
  name: string
  // 节点样式
  nodes: {
    [key in ApprovalNodeType]: {
      fill?: string
      stroke?: string
      strokeWidth?: number
      fontSize?: number
      fontColor?: string
      [key: string]: any
    }
  }
  // 边样式
  edges: {
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
    [key: string]: any
  }
  // 画布样式
  canvas: {
    backgroundColor?: string
    [key: string]: any
  }
}

// 插件接口
export interface Plugin {
  name: string
  install: (editor: any) => void
  uninstall?: (editor: any) => void
}

// 事件类型
export interface FlowchartEvents {
  'node:click': (data: { node: ApprovalNodeConfig; event: MouseEvent }) => void
  'node:dblclick': (data: { node: ApprovalNodeConfig; event: MouseEvent }) => void
  'node:add': (data: { node: ApprovalNodeConfig }) => void
  'node:delete': (data: { node: ApprovalNodeConfig }) => void
  'node:update': (data: { node: ApprovalNodeConfig; oldNode: ApprovalNodeConfig }) => void
  'edge:click': (data: { edge: ApprovalEdgeConfig; event: MouseEvent }) => void
  'edge:add': (data: { edge: ApprovalEdgeConfig }) => void
  'edge:delete': (data: { edge: ApprovalEdgeConfig }) => void
  'edge:update': (data: { edge: ApprovalEdgeConfig; oldEdge: ApprovalEdgeConfig }) => void
  'canvas:click': (data: { event: MouseEvent; position: Point }) => void
  'selection:change': (data: { selected: Array<ApprovalNodeConfig | ApprovalEdgeConfig> }) => void
  'data:change': (data: { flowchartData: FlowchartData }) => void
}

// 工具栏工具类型
export type ToolbarTool =
  | 'select'     // 选择工具
  | 'pan'        // 平移工具
  | 'zoom-in'    // 放大
  | 'zoom-out'   // 缩小
  | 'zoom-fit'   // 适应画布
  | 'undo'       // 撤销
  | 'redo'       // 重做
  | 'delete'     // 删除
  | 'copy'       // 复制
  | 'paste'      // 粘贴

// 导出 LogicFlow 相关类型
export type { LogicFlow }
export type { NodeConfig, EdgeConfig } from '@logicflow/core'
