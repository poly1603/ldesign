/**
 * 模板动画组合式函数
 * 提供统一的动画配置和控制功能
 */

import { computed, nextTick, ref, type Ref, watch } from 'vue'
import type {
  AnimationStyles,
  AnimationMetrics,
  AnimationTransitionClasses
} from '../types/animation'

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
 * 默认动画配置
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  type: AnimationType.SLIDE_FADE,
  duration: 250,
  direction: AnimationDirection.DOWN,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  delay: 0,
  enabled: true,
}

/**
 * 模板选择器动画配置
 */
export const SELECTOR_ANIMATION_CONFIG: AnimationConfig = {
  type: AnimationType.SCALE_FADE,
  duration: 200,
  direction: AnimationDirection.DOWN,
  easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  delay: 0,
  enabled: true,
}

/**
 * 模板切换动画配置
 */
export const TEMPLATE_SWITCH_ANIMATION_CONFIG: AnimationConfig = {
  type: AnimationType.FADE,
  duration: 300,
  easing: 'ease-in-out',
  delay: 0,
  enabled: true,
}

/**
 * 动画状态接口
 */
export interface AnimationState {
  /** 是否正在进入 */
  entering: boolean
  /** 是否正在离开 */
  leaving: boolean
  /** 是否可见 */
  visible: boolean
  /** 动画是否完成 */
  completed: boolean
}

// 导入统一的接口定义
import type { UseTemplateAnimationReturn } from '../types/animation'

/**
 * 模板动画组合式函数
 */
export function useTemplateAnimation(
  initialConfig: Partial<AnimationConfig> = {},
): UseTemplateAnimationReturn {
  // 合并配置
  const config = ref<AnimationConfig>({
    ...DEFAULT_ANIMATION_CONFIG,
    ...initialConfig,
  })

  // 动画状态
  const animationState = ref<AnimationState>({
    entering: false,
    leaving: false,
    visible: false,
    completed: false,
  })

  /**
   * 更新动画配置
   */
  const updateConfig = (newConfig: Partial<AnimationConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  /**
   * 开始进入动画
   */
  const enter = async (): Promise<void> => {
    if (!config.value.enabled) {
      animationState.value.visible = true
      animationState.value.completed = true
      return
    }

    animationState.value.entering = true
    animationState.value.leaving = false
    animationState.value.completed = false

    // 等待下一帧
    await nextTick()

    // 设置可见状态
    animationState.value.visible = true

    // 等待动画完成
    return new Promise((resolve) => {
      const duration = config.value.duration + (config.value.delay || 0)
      setTimeout(() => {
        animationState.value.entering = false
        animationState.value.completed = true
        resolve()
      }, duration)
    })
  }

  /**
   * 开始离开动画
   */
  const leave = async (): Promise<void> => {
    if (!config.value.enabled) {
      animationState.value.visible = false
      animationState.value.completed = true
      return
    }

    animationState.value.leaving = true
    animationState.value.entering = false
    animationState.value.completed = false

    // 等待动画完成
    return new Promise((resolve) => {
      const duration = config.value.duration + (config.value.delay || 0)
      setTimeout(() => {
        animationState.value.leaving = false
        animationState.value.visible = false
        animationState.value.completed = true
        resolve()
      }, duration)
    })
  }

  /**
   * 获取过渡CSS类名
   */
  const getTransitionClasses = (): AnimationTransitionClasses => {
    const baseClass = `template-animation-${config.value.type}`
    const directionClass = config.value.direction
      ? `${baseClass}-${config.value.direction}`
      : baseClass

    return {
      'enter-active-class': `${directionClass}-enter-active`,
      'leave-active-class': `${directionClass}-leave-active`,
      'enter-from-class': `${directionClass}-enter-from`,
      'enter-to-class': `${directionClass}-enter-to`,
      'leave-from-class': `${directionClass}-leave-from`,
      'leave-to-class': `${directionClass}-leave-to`,
    }
  }

  /**
   * 获取过渡CSS样式
   */
  const getTransitionStyles = (): AnimationStyles => {
    return {
      '--animation-duration': `${config.value.duration}ms`,
      '--animation-easing': config.value.easing || 'ease',
      '--animation-delay': `${config.value.delay || 0}ms`,
    }
  }

  /**
   * 重置动画状态
   */
  const reset = () => {
    animationState.value = {
      entering: false,
      leaving: false,
      visible: false,
      completed: false,
    }
  }

  // 简化的属性
  const isAnimating = computed(() => animationState.value.entering || animationState.value.leaving)

  return {
    animationState,
    config,
    isAnimating,
    updateConfig,
    enter,
    leave,
    getTransitionClasses,
    getTransitionStyles,
    reset,
  }
}

/**
 * 模板选择器专用动画Hook
 */
export function useTemplateSelectorAnimation() {
  return useTemplateAnimation(SELECTOR_ANIMATION_CONFIG)
}

/**
 * 模板切换专用动画Hook
 */
export function useTemplateSwitchAnimation() {
  return useTemplateAnimation(TEMPLATE_SWITCH_ANIMATION_CONFIG)
}

/**
 * 创建自定义动画序列
 */
export function useAnimationSequence(animations: AnimationConfig[]) {
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const isPaused = ref(false)

  const currentAnimation = computed(() => animations[currentIndex.value])
  const hasNext = computed(() => currentIndex.value < animations.length - 1)
  const hasPrevious = computed(() => currentIndex.value > 0)

  /**
   * 播放动画序列
   */
  const play = async (): Promise<void> => {
    if (isPlaying.value || animations.length === 0)
      return

    isPlaying.value = true
    isPaused.value = false

    try {
      for (let i = currentIndex.value; i < animations.length; i++) {
        if (isPaused.value)
          break

        currentIndex.value = i
        const animation = useTemplateAnimation(animations[i])
        await animation.enter()

        // 如果不是最后一个动画，等待一小段时间
        if (i < animations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }
    finally {
      isPlaying.value = false
    }
  }

  /**
   * 暂停动画序列
   */
  const pause = () => {
    isPaused.value = true
  }

  /**
   * 恢复动画序列
   */
  const resume = () => {
    if (isPaused.value) {
      isPaused.value = false
      play()
    }
  }

  /**
   * 停止动画序列
   */
  const stop = () => {
    isPlaying.value = false
    isPaused.value = false
    currentIndex.value = 0
  }

  /**
   * 跳转到指定动画
   */
  const goTo = (index: number) => {
    if (index >= 0 && index < animations.length) {
      currentIndex.value = index
    }
  }

  /**
   * 下一个动画
   */
  const next = () => {
    if (hasNext.value) {
      currentIndex.value++
    }
  }

  /**
   * 上一个动画
   */
  const previous = () => {
    if (hasPrevious.value) {
      currentIndex.value--
    }
  }

  return {
    currentIndex,
    currentAnimation,
    isPlaying,
    isPaused,
    hasNext,
    hasPrevious,
    play,
    pause,
    resume,
    stop,
    goTo,
    next,
    previous,
  }
}

/**
 * 创建交错动画效果
 */
export function useStaggeredAnimation(
  elements: Ref<HTMLElement[]>,
  config: Partial<AnimationConfig> = {},
  staggerDelay: number = 100,
) {
  const animations = ref<UseTemplateAnimationReturn[]>([])
  const isPlaying = ref(false)

  /**
   * 初始化动画
   */
  const initialize = () => {
    animations.value = elements.value.map(() =>
      useTemplateAnimation(config),
    )
  }

  /**
   * 播放交错动画
   */
  const playStaggered = async (): Promise<void> => {
    if (isPlaying.value)
      return

    isPlaying.value = true

    try {
      const promises = animations.value.map((animation, index) => {
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            await animation.enter()
            resolve()
          }, index * staggerDelay)
        })
      })

      await Promise.all(promises)
    }
    finally {
      isPlaying.value = false
    }
  }

  /**
   * 播放反向交错动画
   */
  const playReverseStaggered = async (): Promise<void> => {
    if (isPlaying.value)
      return

    isPlaying.value = true

    try {
      const promises = animations.value.map((animation, index) => {
        return new Promise<void>((resolve) => {
          const reverseIndex = animations.value.length - 1 - index
          setTimeout(async () => {
            await animation.leave()
            resolve()
          }, reverseIndex * staggerDelay)
        })
      })

      await Promise.all(promises)
    }
    finally {
      isPlaying.value = false
    }
  }

  /**
   * 重置所有动画
   */
  const reset = () => {
    animations.value.forEach(animation => animation.reset())
    isPlaying.value = false
  }

  // 监听元素变化，重新初始化动画
  watch(elements, initialize, { immediate: true })

  return {
    animations,
    isPlaying,
    initialize,
    playStaggered,
    playReverseStaggered,
    reset,
  }
}
