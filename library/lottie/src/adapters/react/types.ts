/**
 * React 适配器类型定义
 */

import type { RefObject } from 'react'
import type { LottieConfig, ILottieInstance, AnimationState } from '../../types'

/**
 * Lottie Hook 返回类型
 */
export interface UseLottieReturn {
  /** 容器 ref */
  containerRef: RefObject<HTMLDivElement>
  /** 动画实例 */
  instance: ILottieInstance | null
  /** 动画状态 */
  state: AnimationState
  /** 是否正在播放 */
  isPlaying: boolean
  /** 是否已加载 */
  isLoaded: boolean
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
}

/**
 * 组件 Props
 */
export interface LottieAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
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
  /** 完整配置 */
  config?: LottieConfig
  /** 准备就绪回调 */
  onReady?: () => void
  /** 完成回调 */
  onComplete?: () => void
  /** 循环完成回调 */
  onLoopComplete?: () => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * Player 组件 Props
 */
export interface LottiePlayerProps extends LottieAnimationProps {
  /** 是否显示控制栏 */
  showControls?: boolean
  /** 高度 */
  height?: string | number
}

/**
 * Context 类型
 */
export interface LottieContextValue {
  /** 所有实例 */
  instances: Map<string, ILottieInstance>
  /** 注册实例 */
  register: (id: string, instance: ILottieInstance) => void
  /** 注销实例 */
  unregister: (id: string) => void
  /** 播放所有 */
  playAll: () => void
  /** 暂停所有 */
  pauseAll: () => void
  /** 停止所有 */
  stopAll: () => void
}


