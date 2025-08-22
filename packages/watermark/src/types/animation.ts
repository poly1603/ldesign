/**
 * 动画相关类型定义
 */

// 动画类型
export type AnimationType =
  | 'none'
  | 'rotate'
  | 'move'
  | 'fade'
  | 'pulse'
  | 'scale'
  | 'bounce'
  | 'swing'

// 缓动函数类型
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'
  | ((t: number) => number)

// 动画方向
export type AnimationDirection =
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternate-reverse'

// 动画填充模式
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both'

// 动画播放状态
export type AnimationPlayState = 'running' | 'paused'

// 动画配置接口
export interface AnimationConfig {
  /** 动画类型 */
  type: AnimationType
  /** 动画持续时间(毫秒) */
  duration?: number
  /** 动画延迟时间(毫秒) */
  delay?: number
  /** 动画重复次数 */
  iteration?: number | 'infinite'
  /** 缓动函数 */
  easing?: EasingFunction
  /** 动画方向 */
  direction?: AnimationDirection
  /** 填充模式 */
  fillMode?: AnimationFillMode
  /** 播放状态 */
  playState?: AnimationPlayState
  /** 自定义动画参数 */
  params?: AnimationParams
}

// 动画参数
export interface AnimationParams {
  /** 旋转动画参数 */
  rotate?: {
    /** 起始角度 */
    from?: number
    /** 结束角度 */
    to?: number
    /** 旋转中心点 */
    origin?: string
  }
  /** 移动动画参数 */
  move?: {
    /** 水平移动距离 */
    x?: number
    /** 垂直移动距离 */
    y?: number
    /** 移动路径 */
    path?: 'linear' | 'circular' | 'wave'
    /** 路径半径(圆形路径) */
    radius?: number
  }
  /** 淡入淡出动画参数 */
  fade?: {
    /** 起始透明度 */
    from?: number
    /** 结束透明度 */
    to?: number
  }
  /** 脉冲动画参数 */
  pulse?: {
    /** 最小缩放比例 */
    minScale?: number
    /** 最大缩放比例 */
    maxScale?: number
  }
  /** 缩放动画参数 */
  scale?: {
    /** 起始缩放比例 */
    from?: number
    /** 结束缩放比例 */
    to?: number
    /** 缩放中心点 */
    origin?: string
  }
  /** 弹跳动画参数 */
  bounce?: {
    /** 弹跳高度 */
    height?: number
    /** 弹跳次数 */
    count?: number
  }
  /** 摆动动画参数 */
  swing?: {
    /** 摆动角度 */
    angle?: number
    /** 摆动中心点 */
    origin?: string
  }
}

// 动画实例接口
export interface AnimationInstance {
  /** 动画ID */
  id: string
  /** 目标元素 */
  element: HTMLElement
  /** 动画配置 */
  config: AnimationConfig
  /** 开始时间 */
  startTime: number
  /** 暂停时间累计 */
  pausedTime: number
  /** 是否正在播放 */
  isPlaying: boolean
  /** 是否已暂停 */
  isPaused: boolean
  /** 动画帧ID */
  animationFrame?: number
  /** 完成回调 */
  onComplete?: () => void
  /** 开始播放 */
  start(): void
  /** 暂停播放 */
  pause(): void
  /** 恢复播放 */
  resume(): void
  /** 停止播放 */
  stop(): void
  /** 重置动画 */
  reset(): void
}

// 动画事件类型
export interface AnimationEvents {
  /** 动画开始 */
  start: (instance: AnimationInstance) => void
  /** 动画暂停 */
  pause: (instance: AnimationInstance) => void
  /** 动画恢复 */
  resume: (instance: AnimationInstance) => void
  /** 动画停止 */
  stop: (instance: AnimationInstance) => void
  /** 动画完成 */
  complete: (instance: AnimationInstance) => void
  /** 动画重复 */
  iteration: (instance: AnimationInstance, count: number) => void
}

// 默认动画配置
export const DEFAULT_ANIMATION_CONFIG: Required<AnimationConfig> = {
  type: 'none',
  duration: 3000,
  delay: 0,
  iteration: 'infinite',
  easing: 'ease-in-out',
  direction: 'normal',
  fillMode: 'none',
  playState: 'running',
  params: {},
}
