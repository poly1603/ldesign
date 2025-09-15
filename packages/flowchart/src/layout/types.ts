/**
 * 自动布局功能类型定义
 */

import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'

/**
 * 布局算法类型
 */
export type LayoutAlgorithm = 
  | 'hierarchical'      // 层次布局
  | 'force-directed'    // 力导向布局
  | 'circular'          // 圆形布局
  | 'grid'              // 网格布局
  | 'tree'              // 树形布局
  | 'dagre'             // Dagre布局
  | 'elk'               // ELK布局
  | 'custom'            // 自定义布局

/**
 * 布局方向
 */
export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL'

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 布局算法 */
  algorithm: LayoutAlgorithm
  /** 布局方向 */
  direction?: LayoutDirection
  /** 节点间距 */
  nodeSpacing?: {
    horizontal: number
    vertical: number
  }
  /** 层级间距 */
  levelSpacing?: number
  /** 是否启用动画 */
  animated?: boolean
  /** 动画持续时间（毫秒） */
  animationDuration?: number
  /** 是否保持现有位置 */
  preservePositions?: boolean
  /** 布局约束 */
  constraints?: LayoutConstraints
  /** 算法特定配置 */
  algorithmConfig?: Record<string, any>
}

/**
 * 布局约束
 */
export interface LayoutConstraints {
  /** 固定位置的节点 */
  fixedNodes?: string[]
  /** 节点对齐约束 */
  alignments?: NodeAlignment[]
  /** 分组约束 */
  groups?: NodeGroup[]
  /** 最小距离约束 */
  minDistances?: DistanceConstraint[]
  /** 边界约束 */
  boundaries?: BoundaryConstraint[]
}

/**
 * 节点对齐
 */
export interface NodeAlignment {
  /** 对齐类型 */
  type: 'horizontal' | 'vertical' | 'center'
  /** 参与对齐的节点ID */
  nodeIds: string[]
  /** 对齐位置（可选） */
  position?: number
}

/**
 * 节点分组
 */
export interface NodeGroup {
  /** 分组ID */
  id: string
  /** 分组名称 */
  name: string
  /** 分组中的节点ID */
  nodeIds: string[]
  /** 分组布局配置 */
  layoutConfig?: Partial<LayoutConfig>
  /** 分组边界 */
  boundary?: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * 距离约束
 */
export interface DistanceConstraint {
  /** 源节点ID */
  sourceId: string
  /** 目标节点ID */
  targetId: string
  /** 最小距离 */
  minDistance: number
  /** 最大距离（可选） */
  maxDistance?: number
}

/**
 * 边界约束
 */
export interface BoundaryConstraint {
  /** 约束类型 */
  type: 'contain' | 'exclude'
  /** 边界区域 */
  boundary: {
    x: number
    y: number
    width: number
    height: number
  }
  /** 受约束的节点ID */
  nodeIds: string[]
}

/**
 * 布局结果
 */
export interface LayoutResult {
  /** 布局后的节点位置 */
  nodePositions: Record<string, { x: number; y: number }>
  /** 布局后的边路径（可选） */
  edgePaths?: Record<string, { x: number; y: number }[]>
  /** 布局边界 */
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  /** 布局统计信息 */
  stats: LayoutStats
  /** 布局配置 */
  config: LayoutConfig
}

/**
 * 布局统计信息
 */
export interface LayoutStats {
  /** 布局耗时（毫秒） */
  duration: number
  /** 迭代次数 */
  iterations?: number
  /** 能量值（力导向布局） */
  energy?: number
  /** 交叉边数量 */
  crossings?: number
  /** 布局质量分数 */
  qualityScore?: number
}

/**
 * 布局建议
 */
export interface LayoutSuggestion {
  /** 建议的算法 */
  algorithm: LayoutAlgorithm
  /** 建议原因 */
  reason: string
  /** 适用性分数 */
  score: number
  /** 建议配置 */
  config: LayoutConfig
  /** 预期效果描述 */
  description: string
}

/**
 * 布局模板
 */
export interface LayoutTemplate {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 模板配置 */
  config: LayoutConfig
  /** 适用的流程图类型 */
  applicableTypes: string[]
  /** 模板预览图 */
  preview?: string
}

/**
 * 布局优化选项
 */
export interface LayoutOptimizationOptions {
  /** 优化目标 */
  objectives: OptimizationObjective[]
  /** 最大迭代次数 */
  maxIterations?: number
  /** 收敛阈值 */
  convergenceThreshold?: number
  /** 是否启用多目标优化 */
  multiObjective?: boolean
  /** 权重配置 */
  weights?: Record<string, number>
}

/**
 * 优化目标
 */
export type OptimizationObjective = 
  | 'minimize-crossings'    // 最小化边交叉
  | 'minimize-area'         // 最小化占用面积
  | 'maximize-symmetry'     // 最大化对称性
  | 'minimize-edge-length'  // 最小化边长度
  | 'maximize-readability'  // 最大化可读性

/**
 * 布局事件
 */
export interface LayoutEvents {
  'layout:started': (config: LayoutConfig) => void
  'layout:progress': (progress: number) => void
  'layout:completed': (result: LayoutResult) => void
  'layout:failed': (error: Error) => void
  'layout:optimized': (result: LayoutResult) => void
}

/**
 * 自动布局引擎接口
 */
export interface AutoLayoutEngine {
  /** 应用布局 */
  applyLayout(data: FlowchartData, config: LayoutConfig): Promise<LayoutResult>
  
  /** 优化布局 */
  optimizeLayout(data: FlowchartData, options: LayoutOptimizationOptions): Promise<LayoutResult>
  
  /** 获取布局建议 */
  getLayoutSuggestions(data: FlowchartData): Promise<LayoutSuggestion[]>
  
  /** 应用布局模板 */
  applyLayoutTemplate(data: FlowchartData, template: LayoutTemplate): Promise<LayoutResult>
  
  /** 验证布局配置 */
  validateConfig(config: LayoutConfig): boolean
  
  /** 获取支持的算法 */
  getSupportedAlgorithms(): LayoutAlgorithm[]
}

/**
 * 布局算法接口
 */
export interface LayoutAlgorithmInterface {
  /** 算法名称 */
  name: LayoutAlgorithm
  
  /** 算法描述 */
  description: string
  
  /** 执行布局 */
  layout(data: FlowchartData, config: LayoutConfig): Promise<LayoutResult>
  
  /** 验证配置 */
  validateConfig(config: LayoutConfig): boolean
  
  /** 获取默认配置 */
  getDefaultConfig(): Partial<LayoutConfig>
  
  /** 是否支持动画 */
  supportsAnimation(): boolean
  
  /** 是否支持约束 */
  supportsConstraints(): boolean
}

/**
 * 布局优化器接口
 */
export interface LayoutOptimizer {
  /** 优化布局 */
  optimize(result: LayoutResult, options: LayoutOptimizationOptions): Promise<LayoutResult>
  
  /** 计算布局质量 */
  calculateQuality(result: LayoutResult): number
  
  /** 检测边交叉 */
  detectCrossings(result: LayoutResult): number
  
  /** 计算布局面积 */
  calculateArea(result: LayoutResult): number
  
  /** 评估对称性 */
  evaluateSymmetry(result: LayoutResult): number
}

/**
 * 位置
 */
export interface Position {
  x: number
  y: number
}

/**
 * 尺寸
 */
export interface Size {
  width: number
  height: number
}

/**
 * 矩形区域
 */
export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 布局上下文
 */
export interface LayoutContext {
  /** 画布尺寸 */
  canvasSize: Size
  /** 视口信息 */
  viewport: Rectangle
  /** 缩放级别 */
  scale: number
  /** 现有节点位置 */
  existingPositions: Record<string, Position>
  /** 用户偏好 */
  preferences: LayoutPreferences
}

/**
 * 布局偏好
 */
export interface LayoutPreferences {
  /** 首选算法 */
  preferredAlgorithm?: LayoutAlgorithm
  /** 首选方向 */
  preferredDirection?: LayoutDirection
  /** 紧凑程度 */
  compactness: 'loose' | 'normal' | 'tight'
  /** 是否保持现有布局 */
  preserveExisting: boolean
  /** 动画偏好 */
  animationEnabled: boolean
}

/**
 * 布局历史记录
 */
export interface LayoutHistory {
  /** 历史记录ID */
  id: string
  /** 布局配置 */
  config: LayoutConfig
  /** 布局结果 */
  result: LayoutResult
  /** 应用时间 */
  timestamp: number
  /** 用户评分 */
  userRating?: number
  /** 备注 */
  notes?: string
}
