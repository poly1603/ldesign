/**
 * 水印实例相关类型定义
 */

import type { WatermarkConfig } from './config'
import type { AnimationInstance } from './animation'
import type { RenderContext, BaseRenderer } from './render'
import type { ResponsiveManager } from './responsive'
import type { SecurityManagerState } from './security'

// 水印实例状态
export type WatermarkInstanceState =
  | 'creating' // 创建中
  | 'active' // 活跃状态
  | 'paused' // 暂停状态
  | 'updating' // 更新中
  | 'destroying' // 销毁中
  | 'destroyed' // 已销毁

// 水印实例接口
export interface WatermarkInstance {
  /** 实例唯一ID */
  id: string
  /** 实例状态 */
  state: WatermarkInstanceState
  /** 配置信息 */
  config: WatermarkConfig
  /** 容器元素 */
  container: HTMLElement
  /** 水印元素列表 */
  elements: HTMLElement[]
  /** 渲染器实例 */
  renderer: BaseRenderer
  /** 渲染上下文 */
  renderContext: RenderContext
  /** 安全管理器 */
  securityManager?: SecurityManagerState
  /** 响应式管理器 */
  responsiveManager?: ResponsiveManager
  /** 动画实例列表 */
  animations: Map<string, AnimationInstance>
  /** 创建时间 */
  createdAt: number
  /** 最后更新时间 */
  updatedAt: number
  /** 是否可见 */
  visible: boolean
  /** 事件监听器 */
  eventListeners: Map<string, EventListener[]>
  /** 清理函数列表 */
  cleanupFunctions: (() => void)[]
  /** 自定义数据 */
  userData?: Record<string, any>
}

// 实例管理器接口
export interface InstanceManager {
  /** 所有实例 */
  instances: Map<string, WatermarkInstance>
  /** 创建实例 */
  create(config: WatermarkConfig): Promise<WatermarkInstance>
  /** 获取实例 */
  get(id: string): WatermarkInstance | undefined
  /** 更新实例 */
  update(id: string, config: Partial<WatermarkConfig>): Promise<void>
  /** 销毁实例 */
  destroy(id: string): Promise<void>
  /** 销毁所有实例 */
  destroyAll(): Promise<void>
  /** 暂停实例 */
  pause(id: string): void
  /** 恢复实例 */
  resume(id: string): void
  /** 显示实例 */
  show(id: string): void
  /** 隐藏实例 */
  hide(id: string): void
  /** 获取实例数量 */
  count(): number
  /** 获取所有实例ID */
  getAllIds(): string[]
  /** 根据容器查找实例 */
  findByContainer(container: HTMLElement): WatermarkInstance[]
}

// 实例事件类型
export interface InstanceEvents {
  /** 实例创建完成 */
  created: (instance: WatermarkInstance) => void
  /** 实例更新完成 */
  updated: (instance: WatermarkInstance, oldConfig: WatermarkConfig) => void
  /** 实例销毁完成 */
  destroyed: (instanceId: string) => void
  /** 实例状态变化 */
  stateChanged: (
    instance: WatermarkInstance,
    oldState: WatermarkInstanceState
  ) => void
  /** 实例可见性变化 */
  visibilityChanged: (instance: WatermarkInstance, visible: boolean) => void
  /** 实例错误 */
  error: (instance: WatermarkInstance, error: Error) => void
}

// 实例创建选项
export interface CreateInstanceOptions {
  /** 是否立即渲染 */
  immediate?: boolean
  /** 是否启用安全保护 */
  enableSecurity?: boolean
  /** 是否启用响应式 */
  enableResponsive?: boolean
  /** 是否启用动画 */
  enableAnimation?: boolean
  /** 自定义渲染器 */
  customRenderer?: BaseRenderer
  /** 事件监听器 */
  eventListeners?: Partial<InstanceEvents>
  /** 自定义数据 */
  userData?: Record<string, any>
}

// 实例更新选项
export interface UpdateInstanceOptions {
  /** 是否强制重新渲染 */
  forceRerender?: boolean
  /** 是否保持动画状态 */
  preserveAnimations?: boolean
  /** 是否平滑过渡 */
  smoothTransition?: boolean
  /** 过渡持续时间 */
  transitionDuration?: number
}

// 实例统计信息
export interface InstanceStats {
  /** 实例ID */
  id: string
  /** 创建时间 */
  createdAt: number
  /** 运行时长(毫秒) */
  uptime: number
  /** 更新次数 */
  updateCount: number
  /** 渲染次数 */
  renderCount: number
  /** 元素数量 */
  elementCount: number
  /** 动画数量 */
  animationCount: number
  /** 内存使用(估算) */
  memoryUsage: number
  /** 性能指标 */
  performance: {
    /** 平均渲染时间 */
    avgRenderTime: number
    /** 最大渲染时间 */
    maxRenderTime: number
    /** 最小渲染时间 */
    minRenderTime: number
    /** 帧率(如果有动画) */
    fps?: number
  }
}

// 批量操作选项
export interface BatchOperationOptions {
  /** 并发数量限制 */
  concurrency?: number
  /** 是否忽略错误继续执行 */
  continueOnError?: boolean
  /** 进度回调 */
  onProgress?: (completed: number, total: number) => void
  /** 错误回调 */
  onError?: (error: Error, instanceId: string) => void
}

// 实例查询条件
export interface InstanceQuery {
  /** 状态过滤 */
  state?: WatermarkInstanceState | WatermarkInstanceState[]
  /** 容器过滤 */
  container?: HTMLElement
  /** 配置过滤 */
  config?: Partial<WatermarkConfig>
  /** 创建时间范围 */
  createdAfter?: number
  /** 创建时间范围 */
  createdBefore?: number
  /** 排序字段 */
  sortBy?: string
  /** 排序顺序 */
  sortOrder?: 'asc' | 'desc'
  /** 限制数量 */
  limit?: number
  /** 偏移量 */
  offset?: number
  /** 自定义过滤函数 */
  filter?: (instance: WatermarkInstance) => boolean
}
