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
  | 'user-task'      // 用户任务
  | 'service-task'   // 服务任务
  | 'script-task'    // 脚本任务
  | 'manual-task'    // 手工任务
  | 'parallel-gateway'   // 并行网关
  | 'exclusive-gateway'  // 排他网关
  | 'inclusive-gateway'  // 包容网关
  | 'event-gateway'      // 事件网关
  | 'timer-event'        // 定时事件
  | 'message-event'      // 消息事件
  | 'signal-event'       // 信号事件

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

// 物料仓库相关类型
export interface MaterialStyle {
  // 基础样式
  fill?: string           // 填充色
  stroke?: string         // 边框色
  strokeWidth?: number    // 边框宽度
  strokeDasharray?: string // 边框虚线样式
  opacity?: number        // 透明度

  // 文本样式
  fontSize?: number       // 字体大小
  fontColor?: string      // 字体颜色
  fontWeight?: string     // 字体粗细
  fontFamily?: string     // 字体族

  // 图标样式
  iconColor?: string      // 图标颜色
  iconSize?: number       // 图标大小

  // 形状特定样式
  borderRadius?: number   // 圆角半径（矩形）
  rx?: number            // 椭圆x半径
  ry?: number            // 椭圆y半径
}

export interface MaterialIcon {
  type: 'text' | 'svg' | 'image' | 'emoji'
  content: string         // 图标内容（文本、SVG代码、图片URL、emoji）
  size?: number          // 图标大小
  color?: string         // 图标颜色
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

export interface CustomMaterial {
  id: string              // 物料唯一ID
  name: string            // 物料名称
  category: string        // 物料分类
  description?: string    // 物料描述

  // 节点基础配置
  shape: 'rect' | 'circle' | 'diamond' | 'polygon' | 'ellipse'
  width: number           // 节点宽度
  height: number          // 节点高度

  // 样式配置
  style: MaterialStyle    // 节点样式
  icon?: MaterialIcon     // 节点图标

  // 行为配置
  draggable?: boolean     // 是否可拖拽
  resizable?: boolean     // 是否可调整大小
  rotatable?: boolean     // 是否可旋转

  // 连接配置
  anchors?: Array<{       // 锚点配置
    x: number
    y: number
    type: 'input' | 'output' | 'both'
  }>

  // 元数据
  tags?: string[]         // 标签
  version?: string        // 版本
  author?: string         // 作者
  createdAt?: string      // 创建时间
  updatedAt?: string      // 更新时间
}

export interface MaterialCategory {
  id: string              // 分类ID
  name: string            // 分类名称
  description?: string    // 分类描述
  icon?: string          // 分类图标
  order?: number         // 排序
  materials: CustomMaterial[]  // 分类下的物料
}

export interface MaterialRepository {
  id: string              // 仓库ID
  name: string            // 仓库名称
  description?: string    // 仓库描述
  version: string         // 仓库版本
  categories: MaterialCategory[]  // 物料分类

  // 元数据
  author?: string         // 作者
  license?: string        // 许可证
  homepage?: string       // 主页
  repository?: string     // 代码仓库
  createdAt?: string      // 创建时间
  updatedAt?: string      // 更新时间
}

export interface MaterialRepositoryConfig {
  // 默认仓库
  defaultRepository?: MaterialRepository

  // 外部仓库
  externalRepositories?: Array<{
    name: string
    url: string
    enabled: boolean
  }>

  // 缓存配置
  cache?: {
    enabled: boolean
    maxSize: number
    ttl: number
  }

  // 同步配置
  sync?: {
    enabled: boolean
    interval: number
    autoUpdate: boolean
  }
}

// 物料仓库事件
export interface MaterialRepositoryEvents {
  'material:add': (material: CustomMaterial) => void
  'material:update': (material: CustomMaterial) => void
  'material:delete': (materialId: string) => void
  'category:add': (category: MaterialCategory) => void
  'category:update': (category: MaterialCategory) => void
  'category:delete': (categoryId: string) => void
  'repository:load': (repository: MaterialRepository) => void
  'repository:save': (repository: MaterialRepository) => void
  'repository:export': (repository: MaterialRepository) => void
  'repository:import': (repository: MaterialRepository) => void
}

// 导出 LogicFlow 相关类型
export type { LogicFlow }
export type { NodeConfig, EdgeConfig } from '@logicflow/core'
