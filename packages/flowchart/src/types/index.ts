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
  width?: number
  height?: number
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
  // 性能监控配置
  performance?: PerformanceConfig
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
  'node:select': (data: { node: ApprovalNodeConfig; event: MouseEvent }) => void
  'edge:click': (data: { edge: ApprovalEdgeConfig; event: MouseEvent }) => void
  'edge:select': (data: { edge: ApprovalEdgeConfig; event: MouseEvent }) => void
  'edge:add': (data: { edge: ApprovalEdgeConfig }) => void
  'edge:delete': (data: { edge: ApprovalEdgeConfig }) => void
  'edge:update': (data: { edge: ApprovalEdgeConfig; oldEdge: ApprovalEdgeConfig }) => void
  'canvas:click': (data: { event: MouseEvent; position: Point }) => void
  'selection:change': (data: { selected: Array<ApprovalNodeConfig | ApprovalEdgeConfig> }) => void
  'data:change': (data: FlowchartData) => void
  'theme:change': (data: { theme: string }) => void
  // 模板相关事件
  'template:load': (template: any) => void
  'template:save': (data: any) => void
  'template:delete': (data: any) => void
  // 其他事件
  'copy:success': (data: any) => void
  'copy:error': (data: any) => void
  'copy:warning': (data: any) => void
  'paste:success': (data: any) => void
  'paste:error': (data: any) => void
  'paste:warning': (data: any) => void
  'clipboard:clear': (data: any) => void
  'export:success': (data: any) => void
  'export:error': (data: any) => void
  'export:dialog:show': (data: any) => void
  'validation:show': (data: any) => void
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

// 主题类型
export type FlowchartTheme = 'default' | 'dark' | 'blue' | string

// 边类型
export type ApprovalEdgeType = 'approval-edge' | 'polyline' | string

// 性能监控相关类型
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled: boolean
  /** 采样间隔（毫秒） */
  sampleInterval: number
  /** 最大历史记录数量 */
  maxHistorySize: number
  /** 是否监控内存 */
  monitorMemory: boolean
  /** 是否监控FPS */
  monitorFPS: boolean
  /** 性能阈值配置 */
  thresholds: {
    renderTime: number // 渲染时间阈值（毫秒）
    fps: number // FPS阈值
    memory: number // 内存使用阈值（MB）
  }
  /** 虚拟渲染配置 */
  virtualRender?: {
    /** 是否启用虚拟渲染 */
    enabled: boolean
    /** 可视区域缓冲区大小（像素） */
    bufferSize: number
    /** 最大同时渲染的节点数量 */
    maxVisibleNodes: number
    /** 最大同时渲染的边数量 */
    maxVisibleEdges: number
    /** 是否启用节点懒加载 */
    enableLazyLoading: boolean
    /** 懒加载延迟时间（毫秒） */
    lazyLoadDelay: number
  }
}

// 视口信息类型
export interface ViewportInfo {
  /** 可视区域左上角X坐标 */
  x: number
  /** 可视区域左上角Y坐标 */
  y: number
  /** 可视区域宽度 */
  width: number
  /** 可视区域高度 */
  height: number
  /** 缩放比例 */
  scale: number
}

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

// 模板系统类型定义
export interface FlowchartTemplate {
  id: string                    // 模板唯一ID
  name: string                  // 模板名称
  displayName: string           // 显示名称
  description: string           // 模板描述
  category: TemplateCategory    // 模板分类
  version: string               // 模板版本
  author?: string               // 作者
  tags?: string[]               // 标签
  preview?: string              // 预览图URL

  // 模板数据
  data: FlowchartData           // 流程图数据

  // 元数据
  isBuiltIn: boolean            // 是否为内置模板
  isDefault?: boolean           // 是否为默认模板
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
}

// 模板分类
export type TemplateCategory =
  | 'approval'      // 审批流程
  | 'workflow'      // 工作流程
  | 'business'      // 业务流程
  | 'custom'        // 自定义
  | 'other'         // 其他

// 模板元数据（用于模板列表显示）
export interface TemplateMetadata {
  id: string
  name: string
  displayName: string
  description: string
  category: TemplateCategory
  version: string
  author?: string
  tags?: string[]
  preview?: string
  isBuiltIn: boolean
  isDefault?: boolean
  createdAt: string
  updatedAt: string
  nodeCount: number             // 节点数量
  edgeCount: number             // 连接线数量
}

// 模板过滤器
export interface TemplateFilter {
  category?: TemplateCategory
  tags?: string[]
  author?: string
  isBuiltIn?: boolean
  search?: string               // 搜索关键词
}

// 模板排序选项
export interface TemplateSortOptions {
  field: 'name' | 'displayName' | 'createdAt' | 'updatedAt' | 'nodeCount'
  order: 'asc' | 'desc'
}

// 模板导入导出选项
export interface TemplateExportOptions {
  includeMetadata?: boolean     // 是否包含元数据
  format?: 'json' | 'xml'       // 导出格式
  pretty?: boolean              // 是否美化输出
}

export interface TemplateImportOptions {
  overwrite?: boolean           // 是否覆盖同名模板
  validateData?: boolean        // 是否验证数据
  generateId?: boolean          // 是否生成新ID
}

// 模板管理器配置
export interface TemplateManagerConfig {
  // 存储配置
  storage?: {
    type: 'localStorage' | 'indexedDB' | 'memory'
    key?: string                // 存储键名
    maxSize?: number            // 最大存储大小
  }

  // 内置模板配置
  builtInTemplates?: {
    enabled: boolean            // 是否启用内置模板
    categories?: TemplateCategory[]  // 启用的分类
  }

  // 缓存配置
  cache?: {
    enabled: boolean
    maxSize: number
    ttl: number                 // 缓存时间（毫秒）
  }
}

// 模板管理器事件
export interface TemplateManagerEvents {
  'template:add': (template: FlowchartTemplate) => void
  'template:update': (template: FlowchartTemplate, oldTemplate: FlowchartTemplate) => void
  'template:delete': (templateId: string) => void
  'template:load': (template: FlowchartTemplate) => void
  'template:save': (template: FlowchartTemplate) => void
  'template:import': (templates: FlowchartTemplate[]) => void
  'template:export': (templates: FlowchartTemplate[]) => void
  'templates:refresh': (templates: FlowchartTemplate[]) => void
}

// 导出 LogicFlow 相关类型
export type { LogicFlow }
export type { NodeConfig, EdgeConfig } from '@logicflow/core'
