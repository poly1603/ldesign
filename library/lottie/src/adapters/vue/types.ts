/**
 * Vue 适配器类型定义
 */

import type { Ref, ComputedRef } from 'vue'
import type { LottieConfig, ILottieInstance, AnimationState } from '../../types'

/**
 * Composable 返回类型
 */
export interface UseLottieReturn {
  /** 容器 ref */
  containerRef: Ref<HTMLElement | null>
  /** 动画实例 */
  instance: Ref<ILottieInstance | null>
  /** 动画状态 */
  state: Ref<AnimationState>
  /** 是否正在播放 */
  isPlaying: ComputedRef<boolean>
  /** 是否已加载 */
  isLoaded: ComputedRef<boolean>
  /** 播放 */
  play: () => void
  /** 暂停 */
  pause: () => void
  /** 停止 */
  stop: () => void
  /** 重置 */
  reset: () => void
  /** 设置速度 */
  setSpeed: (speed: number) => void
  /** 设置方向 */
  setDirection: (direction: 1 | -1) => void
  /** 跳转到指定帧 */
  goToFrame: (frame: number, play?: boolean) => void
  /** 销毁 */
  destroy: () => void
}

/**
 * 交互式 Composable 配置
 */
export interface UseLottieInteractiveOptions extends LottieConfig {
  /** 启用点击交互 */
  enableClick?: boolean
  /** 启用悬停交互 */
  enableHover?: boolean
  /** 启用滚动交互 */
  enableScroll?: boolean
  /** 启用拖拽交互 */
  enableDrag?: boolean
}

/**
 * 序列 Composable 配置
 */
export interface UseLottieSequenceOptions {
  /** 序列项 */
  items: Array<{
    config: LottieConfig
    delay?: number
    duration?: number
  }>
  /** 是否循环 */
  loop?: boolean
  /** 是否自动播放 */
  autoplay?: boolean
}

/**
 * 组件 Props
 */
export interface LottieAnimationProps {
  /** 动画路径 */
  path?: string
  /** 动画数据 */
  animationData?: any
  /** 是否循环 */
  loop?: boolean | number
  /** 是否自动播放 */
  autoplay?: boolean
  /** 渲染器 */
  renderer?: 'svg' | 'canvas' | 'html'
  /** 播放速度 */
  speed?: number
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 完整配置 */
  config?: LottieConfig
}

/**
 * 指令绑定值
 */
export interface LottieDirectiveBinding {
  /** 动画路径或数据 */
  value: string | any
  /** 配置 */
  config?: LottieConfig
}


