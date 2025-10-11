import type { AnimationItem, AnimationConfigWithData, AnimationConfigWithPath, RendererType } from 'lottie-web'

/**
 * 渲染器类型
 */
export type LottieRendererType = RendererType

/**
 * 动画质量配置
 */
export type AnimationQuality = 'low' | 'medium' | 'high' | 'auto'

/**
 * 加载策略
 */
export type LoadStrategy = 'eager' | 'lazy' | 'intersection'

/**
 * 播放模式
 */
export type PlayMode = 'normal' | 'bounce' | 'reverse'

/**
 * 动画状态
 */
export type AnimationState = 'idle' | 'loading' | 'loaded' | 'playing' | 'paused' | 'stopped' | 'error'

/**
 * 性能监控数据
 */
export interface PerformanceMetrics {
  /** 加载时间 (ms) */
  loadTime: number
  /** 渲染帧率 */
  fps: number
  /** 内存使用 (MB) */
  memory: number
  /** 动画时长 (ms) */
  duration: number
  /** 总帧数 */
  totalFrames: number
}

/**
 * 事件回调类型
 */
export interface LottieEvents {
  /** 配置完成 */
  config_ready?: () => void
  /** 数据加载完成 */
  data_ready?: () => void
  /** 数据加载失败 */
  data_failed?: (error: Error) => void
  /** DOM 加载完成 */
  DOMLoaded?: () => void
  /** 销毁 */
  destroy?: () => void
  /** 进入帧 */
  enterFrame?: (event: { currentTime: number; totalTime: number; direction: number }) => void
  /** 分段完成 */
  segmentStart?: () => void
  /** 完成 */
  complete?: () => void
  /** 循环完成 */
  loopComplete?: () => void
  /** 状态变化 */
  stateChange?: (state: AnimationState) => void
  /** 性能警告 */
  performanceWarning?: (metrics: PerformanceMetrics) => void
}

/**
 * 高级配置选项
 */
export interface AdvancedOptions {
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean
  /** 性能监控间隔 (ms) */
  performanceMonitorInterval?: number
  /** 最大内存限制 (MB) */
  maxMemory?: number
  /** 最小 FPS 阈值 */
  minFps?: number
  /** 是否启用自动降级 */
  enableAutoDegradation?: boolean
  /** 是否缓存动画数据 */
  enableCache?: boolean
  /** 缓存 key */
  cacheKey?: string
  /** 预加载 */
  preload?: boolean
  /** 交叉观察器配置 */
  intersectionOptions?: IntersectionObserverInit
  /** 自定义加载器 */
  customLoader?: (path: string) => Promise<any>
}

/**
 * Lottie 配置
 */
export interface LottieConfig {
  /** 容器元素或选择器 */
  container?: HTMLElement | string
  /** 渲染器类型 */
  renderer?: LottieRendererType
  /** 是否循环播放 */
  loop?: boolean | number
  /** 是否自动播放 */
  autoplay?: boolean
  /** 动画数据 */
  animationData?: any
  /** 动画路径 */
  path?: string
  /** 动画名称 */
  name?: string
  /** 播放速度 */
  speed?: number
  /** 动画质量 */
  quality?: AnimationQuality
  /** 加载策略 */
  loadStrategy?: LoadStrategy
  /** 播放模式 */
  playMode?: PlayMode
  /** 初始帧 */
  initialSegment?: [number, number]
  /** 事件监听器 */
  events?: LottieEvents
  /** 高级选项 */
  advanced?: AdvancedOptions
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
}

/**
 * Lottie 实例接口
 */
export interface ILottieInstance {
  /** 唯一标识 */
  readonly id: string
  /** 动画名称 */
  readonly name: string
  /** 当前状态 */
  readonly state: AnimationState
  /** Lottie 原生实例 */
  readonly animation: AnimationItem | null
  /** 配置 */
  readonly config: LottieConfig
  /** 容器元素 */
  readonly container: HTMLElement | null

  /** 加载动画 */
  load(): Promise<void>
  /** 播放 */
  play(): void
  /** 暂停 */
  pause(): void
  /** 停止 */
  stop(): void
  /** 销毁 */
  destroy(): void
  /** 设置速度 */
  setSpeed(speed: number): void
  /** 设置方向 */
  setDirection(direction: 1 | -1): void
  /** 跳转到指定帧 */
  goToAndStop(frame: number, isFrame?: boolean): void
  /** 跳转并播放 */
  goToAndPlay(frame: number, isFrame?: boolean): void
  /** 播放片段 */
  playSegments(segments: [number, number] | [number, number][], forceFlag?: boolean): void
  /** 重置 */
  reset(): void
  /** 调整大小 */
  resize(): void
  /** 获取性能指标 */
  getMetrics(): PerformanceMetrics | null
  /** 监听事件 */
  on<K extends keyof LottieEvents>(event: K, callback: LottieEvents[K]): void
  /** 移除事件监听 */
  off<K extends keyof LottieEvents>(event: K, callback?: LottieEvents[K]): void
}

/**
 * Lottie Manager 配置
 */
export interface LottieManagerConfig {
  /** 最大实例数 */
  maxInstances?: number
  /** 全局渲染器类型 */
  defaultRenderer?: LottieRendererType
  /** 是否启用实例池 */
  enableInstancePool?: boolean
  /** 实例池大小 */
  poolSize?: number
  /** 是否启用全局性能监控 */
  enableGlobalPerformanceMonitor?: boolean
  /** 全局缓存配置 */
  cache?: {
    enabled: boolean
    maxSize?: number
    ttl?: number
  }
}

/**
 * 缓存项
 */
export interface CacheItem {
  data: any
  timestamp: number
  size: number
}

/**
 * 实例池统计
 */
export interface PoolStats {
  total: number
  active: number
  idle: number
  peak: number
}

/**
 * 全局性能统计
 */
export interface GlobalPerformanceStats {
  totalInstances: number
  activeInstances: number
  averageFps: number
  totalMemory: number
  cacheHitRate: number
}
