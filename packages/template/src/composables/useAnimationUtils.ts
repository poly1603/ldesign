/**
 * 动画工具函数
 * 提供常用的动画效果和工具方法
 */

import { computed, ref } from 'vue'
import { type AnimationConfig, AnimationDirection, AnimationType } from './useTemplateAnimation'

/**
 * 动画缓动函数
 */
export const EASING_FUNCTIONS = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  easeInSine: 'cubic-bezier(0.12, 0, 0.39, 0)',
  easeOutSine: 'cubic-bezier(0.61, 1, 0.88, 1)',
  easeInOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',
  easeInQuad: 'cubic-bezier(0.11, 0, 0.5, 0)',
  easeOutQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
  easeInOutQuad: 'cubic-bezier(0.45, 0, 0.55, 1)',
  easeInCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
  easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
  easeInQuint: 'cubic-bezier(0.64, 0, 0.78, 0)',
  easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeInOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',
  easeInExpo: 'cubic-bezier(0.7, 0, 0.84, 0)',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
  easeInCirc: 'cubic-bezier(0.55, 0, 1, 0.45)',
  easeOutCirc: 'cubic-bezier(0, 0.55, 0.45, 1)',
  easeInOutCirc: 'cubic-bezier(0.85, 0, 0.15, 1)',
  easeInBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeInOutBack: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const

/**
 * 预定义动画配置
 */
export const ANIMATION_PRESETS = {
  // 快速动画
  quickFade: {
    type: AnimationType.FADE,
    duration: 150,
    easing: EASING_FUNCTIONS.easeOut,
  },
  quickSlide: {
    type: AnimationType.SLIDE,
    duration: 150,
    direction: AnimationDirection.DOWN,
    easing: EASING_FUNCTIONS.easeOut,
  },
  quickScale: {
    type: AnimationType.SCALE,
    duration: 150,
    easing: EASING_FUNCTIONS.easeOut,
  },

  // 标准动画
  standardFade: {
    type: AnimationType.FADE,
    duration: 250,
    easing: EASING_FUNCTIONS.easeInOut,
  },
  standardSlide: {
    type: AnimationType.SLIDE,
    duration: 250,
    direction: AnimationDirection.DOWN,
    easing: EASING_FUNCTIONS.easeInOut,
  },
  standardScale: {
    type: AnimationType.SCALE,
    duration: 250,
    easing: EASING_FUNCTIONS.easeInOut,
  },

  // 慢速动画
  slowFade: {
    type: AnimationType.FADE,
    duration: 400,
    easing: EASING_FUNCTIONS.easeInOut,
  },
  slowSlide: {
    type: AnimationType.SLIDE,
    duration: 400,
    direction: AnimationDirection.DOWN,
    easing: EASING_FUNCTIONS.easeInOut,
  },
  slowScale: {
    type: AnimationType.SCALE,
    duration: 400,
    easing: EASING_FUNCTIONS.easeInOut,
  },

  // 弹性动画
  bounceIn: {
    type: AnimationType.SCALE_FADE,
    duration: 300,
    easing: EASING_FUNCTIONS.easeOutBack,
  },
  bounceOut: {
    type: AnimationType.SCALE_FADE,
    duration: 200,
    easing: EASING_FUNCTIONS.easeInBack,
  },

  // 滑动方向动画
  slideUp: {
    type: AnimationType.SLIDE,
    duration: 250,
    direction: AnimationDirection.UP,
    easing: EASING_FUNCTIONS.easeInOut,
  },
  slideDown: {
    type: AnimationType.SLIDE,
    duration: 250,
    direction: AnimationDirection.DOWN,
    easing: EASING_FUNCTIONS.easeInOut,
  },
  slideLeft: {
    type: AnimationType.SLIDE,
    duration: 250,
    direction: AnimationDirection.LEFT,
    easing: EASING_FUNCTIONS.easeInOut,
  },
  slideRight: {
    type: AnimationType.SLIDE,
    duration: 250,
    direction: AnimationDirection.RIGHT,
    easing: EASING_FUNCTIONS.easeInOut,
  },
} as const

/**
 * 动画性能监控
 */
export function useAnimationPerformance() {
  const metrics = ref<{
    animationCount: number
    totalDuration: number
    averageDuration: number
    lastAnimationTime: number
  }>({
    animationCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastAnimationTime: 0,
  })

  /**
   * 记录动画开始
   */
  const startAnimation = () => {
    metrics.value.lastAnimationTime = performance.now()
  }

  /**
   * 记录动画结束
   */
  const endAnimation = () => {
    const duration = performance.now() - metrics.value.lastAnimationTime
    metrics.value.animationCount++
    metrics.value.totalDuration += duration
    metrics.value.averageDuration = metrics.value.totalDuration / metrics.value.animationCount
  }

  /**
   * 重置统计
   */
  const reset = () => {
    metrics.value = {
      animationCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      lastAnimationTime: 0,
    }
  }

  return {
    metrics,
    startAnimation,
    endAnimation,
    reset,
  }
}

/**
 * 动画队列管理
 */
export function useAnimationQueue() {
  const queue = ref<Array<() => Promise<void>>>([])
  const isProcessing = ref(false)
  const currentIndex = ref(0)

  /**
   * 添加动画到队列
   */
  const add = (animation: () => Promise<void>) => {
    queue.value.push(animation)
  }

  /**
   * 处理队列
   */
  const process = async () => {
    if (isProcessing.value || queue.value.length === 0)
      return

    isProcessing.value = true
    currentIndex.value = 0

    try {
      for (let i = 0; i < queue.value.length; i++) {
        currentIndex.value = i
        await queue.value[i]()
      }
    }
    finally {
      isProcessing.value = false
      currentIndex.value = 0
    }
  }

  /**
   * 清空队列
   */
  const clear = () => {
    queue.value = []
    currentIndex.value = 0
  }

  /**
   * 暂停处理
   */
  const pause = () => {
    // 注意：这里只是标记暂停，实际的暂停逻辑需要在动画函数中实现
    isProcessing.value = false
  }

  return {
    queue,
    isProcessing,
    currentIndex,
    add,
    process,
    clear,
    pause,
  }
}

/**
 * 响应式动画配置
 */
export function useResponsiveAnimation(
  baseConfig: AnimationConfig,
  breakpoints: Record<string, Partial<AnimationConfig>> = {},
) {
  const screenWidth = ref(window.innerWidth)

  // 监听窗口大小变化
  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth
  }

  window.addEventListener('resize', updateScreenWidth)

  /**
   * 获取当前配置
   */
  const currentConfig = computed(() => {
    let config = { ...baseConfig }

    // 应用断点配置
    for (const [breakpoint, breakpointConfig] of Object.entries(breakpoints)) {
      const width = Number.parseInt(breakpoint)
      if (screenWidth.value <= width) {
        config = { ...config, ...breakpointConfig }
        break
      }
    }

    return config
  })

  /**
   * 清理事件监听
   */
  const cleanup = () => {
    window.removeEventListener('resize', updateScreenWidth)
  }

  return {
    screenWidth,
    currentConfig,
    cleanup,
  }
}

/**
 * 动画状态管理
 */
export function useAnimationState() {
  const states = ref<Map<string, boolean>>(new Map())

  /**
   * 设置动画状态
   */
  const setState = (key: string, value: boolean) => {
    states.value.set(key, value)
  }

  /**
   * 获取动画状态
   */
  const getState = (key: string): boolean => {
    return states.value.get(key) || false
  }

  /**
   * 切换动画状态
   */
  const toggleState = (key: string): boolean => {
    const currentState = getState(key)
    const newState = !currentState
    setState(key, newState)
    return newState
  }

  /**
   * 清除所有状态
   */
  const clearStates = () => {
    states.value.clear()
  }

  /**
   * 批量设置状态
   */
  const setStates = (stateMap: Record<string, boolean>) => {
    Object.entries(stateMap).forEach(([key, value]) => {
      setState(key, value)
    })
  }

  return {
    states,
    setState,
    getState,
    toggleState,
    clearStates,
    setStates,
  }
}
