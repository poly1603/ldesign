/**
 * 动画相关类型定义
 */

import type { Ref } from 'vue'

/**
 * 动画类型枚举
 */
export enum AnimationType {
  FADE = 'fade',
  SLIDE = 'slide',
  SCALE = 'scale',
  SLIDE_FADE = 'slide-fade',
  SCALE_FADE = 'scale-fade',
}

/**
 * 动画方向枚举
 */
export enum AnimationDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * 动画状态枚举
 */
export enum AnimationState {
  IDLE = 'idle',
  ENTERING = 'entering',
  ENTERED = 'entered',
  LEAVING = 'leaving',
  LEFT = 'left',
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 动画类型 */
  type: AnimationType
  /** 动画时长（毫秒） */
  duration: number
  /** 动画方向 */
  direction?: AnimationDirection
  /** 缓动函数 */
  easing?: string
  /** 延迟时间（毫秒） */
  delay?: number
  /** 是否启用动画 */
  enabled?: boolean
}

/**
 * 动画状态接口
 */
export interface AnimationStateData {
  /** 是否正在进入 */
  entering: boolean
  /** 是否正在离开 */
  leaving: boolean
  /** 是否可见 */
  visible: boolean
  /** 动画是否完成 */
  completed: boolean
}

/**
 * 动画过渡类名接口
 */
export interface AnimationTransitionClasses {
  'enter-active-class': string
  'leave-active-class': string
  'enter-from-class': string
  'enter-to-class': string
  'leave-from-class': string
  'leave-to-class': string
}

/**
 * 动画样式接口
 */
export interface AnimationStyles extends Record<`--${string}`, string> {
  '--animation-duration': string
  '--animation-easing': string
  '--animation-delay': string
}

/**
 * 使用模板动画的返回值接口（简化版）
 */
export interface UseTemplateAnimationReturn {
  /** 动画状态 */
  animationState: Ref<AnimationStateData>
  /** 动画配置 */
  config: Ref<AnimationConfig>
  /** 是否正在动画 */
  isAnimating: Ref<boolean>
  /** 开始进入动画 */
  enter: () => Promise<void>
  /** 开始离开动画 */
  leave: () => Promise<void>
  /** 更新配置 */
  updateConfig: (newConfig: Partial<AnimationConfig>) => void
  /** 获取过渡CSS类名 */
  getTransitionClasses: () => AnimationTransitionClasses
  /** 获取过渡CSS样式 */
  getTransitionStyles: () => AnimationStyles
  /** 重置动画状态 */
  reset: () => void
}

/**
 * 动画序列接口
 */
export interface AnimationSequence {
  /** 当前动画索引 */
  currentIndex: Ref<number>
  /** 当前动画配置 */
  currentAnimation: Ref<AnimationConfig | undefined>
  /** 是否正在播放 */
  isPlaying: Ref<boolean>
  /** 是否已暂停 */
  isPaused: Ref<boolean>
  /** 是否有下一个动画 */
  hasNext: Ref<boolean>
  /** 是否有上一个动画 */
  hasPrevious: Ref<boolean>
  /** 播放动画序列 */
  play: () => Promise<void>
  /** 暂停动画序列 */
  pause: () => void
  /** 恢复动画序列 */
  resume: () => void
  /** 停止动画序列 */
  stop: () => void
  /** 跳转到指定动画 */
  goTo: (index: number) => void
  /** 下一个动画 */
  next: () => void
  /** 上一个动画 */
  previous: () => void
}

/**
 * 交错动画接口
 */
export interface StaggeredAnimation {
  /** 动画实例数组 */
  animations: Ref<UseTemplateAnimationReturn[]>
  /** 是否正在播放 */
  isPlaying: Ref<boolean>
  /** 初始化动画 */
  initialize: () => void
  /** 播放交错动画 */
  playStaggered: () => Promise<void>
  /** 播放反向交错动画 */
  playReverseStaggered: () => Promise<void>
  /** 重置所有动画 */
  reset: () => void
}

/**
 * 动画性能指标接口
 */
export interface AnimationMetrics {
  /** 动画总数 */
  animationCount: number
  /** 总持续时间 */
  totalDuration: number
  /** 平均持续时间 */
  averageDuration: number
  /** 最后一次动画时间 */
  lastAnimationTime: number
  /** 帧率 */
  fps: number
  /** 内存使用量 */
  memoryUsage: number
}

/**
 * 动画性能监控接口
 */
export interface AnimationPerformance {
  /** 性能指标 */
  metrics: Ref<AnimationMetrics>
  /** 开始动画计时 */
  startAnimation: () => void
  /** 结束动画计时 */
  endAnimation: () => void
  /** 重置统计 */
  reset: () => void
}

/**
 * 动画队列接口
 */
export interface AnimationQueue {
  /** 动画队列 */
  queue: Ref<Array<() => Promise<void>>>
  /** 是否正在处理 */
  isProcessing: Ref<boolean>
  /** 当前处理索引 */
  currentIndex: Ref<number>
  /** 添加动画到队列 */
  add: (animation: () => Promise<void>) => void
  /** 处理队列 */
  process: () => Promise<void>
  /** 清空队列 */
  clear: () => void
  /** 暂停处理 */
  pause: () => void
}

/**
 * 响应式动画配置接口
 */
export interface ResponsiveAnimationConfig {
  /** 屏幕宽度 */
  screenWidth: Ref<number>
  /** 当前配置 */
  currentConfig: Ref<AnimationConfig>
  /** 清理函数 */
  cleanup: () => void
}

/**
 * 动画状态管理接口
 */
export interface AnimationStateManager {
  /** 状态映射 */
  states: Ref<Map<string, boolean>>
  /** 设置状态 */
  setState: (key: string, value: boolean) => void
  /** 获取状态 */
  getState: (key: string) => boolean
  /** 切换状态 */
  toggleState: (key: string) => boolean
  /** 清除所有状态 */
  clearStates: () => void
  /** 批量设置状态 */
  setStates: (stateMap: Record<string, boolean>) => void
}

/**
 * 缓动函数类型
 */
export type EasingFunction = keyof typeof import('../composables/useAnimationUtils').EASING_FUNCTIONS

/**
 * 动画预设类型
 */
export type AnimationPreset = keyof typeof import('../composables/useAnimationUtils').ANIMATION_PRESETS

/**
 * 模板渲染器动画配置
 */
export interface TemplateRendererAnimationConfig {
  /** 模板选择器动画配置 */
  selector?: Partial<AnimationConfig>
  /** 模板切换动画配置 */
  templateSwitch?: Partial<AnimationConfig>
  /** 是否启用动画 */
  enabled?: boolean
  /** 全局动画时长倍数 */
  durationMultiplier?: number
  /** 是否尊重用户的减少动画偏好 */
  respectReducedMotion?: boolean
}

/**
 * 扩展的模板渲染器Props（包含动画配置）
 */
export interface TemplateRendererPropsWithAnimation {
  /** 模板分类（必需） */
  category: string
  /** 设备类型（可选，默认自动检测） */
  device?: import('./template').DeviceType
  /** 模板名称（可选，默认使用该分类下的默认模板） */
  templateName?: string
  /** 是否响应式跟随设备（默认: true） */
  responsive?: boolean
  /** 是否显示模板选择器（默认: false） */
  showSelector?: boolean
  /** 加载失败时的备用模板名称（可选） */
  fallbackTemplate?: string
  /** 自定义加载组件（可选） */
  loadingComponent?: import('vue').Component
  /** 自定义错误组件（可选） */
  errorComponent?: import('vue').Component
  /** 传递给模板的属性（可选） */
  props?: Record<string, any>
  /** 动画配置（可选） */
  animationConfig?: TemplateRendererAnimationConfig
  /** 模板切换回调（可选） */
  onTemplateChange?: (templateName: string) => void
  /** 加载错误回调（可选） */
  onLoadError?: (error: Error) => void
  /** 动画开始回调（可选） */
  onAnimationStart?: (type: string) => void
  /** 动画结束回调（可选） */
  onAnimationEnd?: (type: string) => void
}
