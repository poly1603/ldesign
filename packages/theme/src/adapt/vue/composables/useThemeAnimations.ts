/**
 * @ldesign/theme - useThemeAnimations 组合式函数
 *
 * 提供动画管理的响应式接口
 */

import type {
  AnimationConfig,
  UseThemeAnimationsReturn,
  VueThemeContext,
} from '../types'
import {
  computed,
  type ComputedRef,
  inject,
  onUnmounted,
  ref,
  type Ref,
} from 'vue'
import { VueThemeContextKey } from '../types'

/**
 * 使用主题动画的组合式函数
 */
export function useThemeAnimations(): UseThemeAnimationsReturn {
  // 注入主题上下文
  const themeContext = inject<VueThemeContext>(VueThemeContextKey)

  if (!themeContext) {
    throw new Error('useThemeAnimations must be used within a ThemeProvider')
  }

  // 动画列表
  const animations = ref<AnimationConfig[]>([])

  // 更新动画列表
  const updateAnimations = () => {
    if (themeContext.themeManager.value) {
      // 这里需要从主题管理器获取动画列表
      // animations.value = themeContext.themeManager.value.getAnimations()
    }
  }

  /**
   * 开始动画
   */
  const startAnimation = (name: string): void => {
    if (!themeContext.themeManager.value) {
      throw new Error('Theme manager is not initialized')
    }

    themeContext.themeManager.value.startAnimation(name)
  }

  /**
   * 停止动画
   */
  const stopAnimation = (name: string): void => {
    if (!themeContext.themeManager.value) {
      return
    }

    themeContext.themeManager.value.stopAnimation(name)
  }

  /**
   * 暂停动画
   */
  const pauseAnimation = (name: string): void => {
    if (!themeContext.themeManager.value) {
      return
    }

    themeContext.themeManager.value.pauseAnimation(name)
  }

  /**
   * 恢复动画
   */
  const resumeAnimation = (name: string): void => {
    if (!themeContext.themeManager.value) {
      return
    }

    themeContext.themeManager.value.resumeAnimation(name)
  }

  /**
   * 检查动画是否正在运行
   */
  const isAnimationRunning = (name: string): ComputedRef<boolean> => {
    return computed(() => {
      // 这里需要从动画管理器获取状态
      // return themeContext.themeManager.value?.isAnimationRunning(name) || false
      return false
    })
  }

  /**
   * 获取动画配置
   */
  const getAnimation = (
    name: string,
  ): ComputedRef<AnimationConfig | undefined> => {
    return computed(() => {
      return animations.value.find(animation => animation.name === name)
    })
  }

  // 初始化动画列表
  updateAnimations()

  return {
    animations,
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    isAnimationRunning,
    getAnimation,
  }
}

/**
 * 使用动画控制的组合式函数
 */
export function useAnimationControl(animationName: string): {
  isRunning: ComputedRef<boolean>
  isPaused: ComputedRef<boolean>
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  toggle: () => void
  restart: () => void
} {
  const {
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    isAnimationRunning,
  } = useThemeAnimations()

  const isRunning = isAnimationRunning(animationName)
  const isPaused = ref(false) // 这里需要从动画管理器获取实际状态

  const start = () => {
    startAnimation(animationName)
    isPaused.value = false
  }

  const stop = () => {
    stopAnimation(animationName)
    isPaused.value = false
  }

  const pause = () => {
    pauseAnimation(animationName)
    isPaused.value = true
  }

  const resume = () => {
    resumeAnimation(animationName)
    isPaused.value = false
  }

  const toggle = () => {
    if (isRunning.value) {
      if (isPaused.value) {
        resume()
      }
      else {
        pause()
      }
    }
    else {
      start()
    }
  }

  const restart = () => {
    stop()
    setTimeout(() => start(), 50)
  }

  return {
    isRunning,
    isPaused: computed(() => isPaused.value),
    start,
    stop,
    pause,
    resume,
    toggle,
    restart,
  }
}

/**
 * 使用动画序列的组合式函数
 */
export function useAnimationSequence(animationNames: string[]): {
  currentIndex: Ref<number>
  currentAnimation: ComputedRef<string | undefined>
  isSequenceRunning: Ref<boolean>
  startSequence: () => void
  stopSequence: () => void
  nextAnimation: () => void
  previousAnimation: () => void
  jumpToAnimation: (index: number) => void
} {
  const { startAnimation, stopAnimation } = useThemeAnimations()

  const currentIndex = ref(0)
  const isSequenceRunning = ref(false)

  const currentAnimation = computed(() => {
    return animationNames[currentIndex.value]
  })

  const startSequence = () => {
    if (animationNames.length === 0)
      return

    isSequenceRunning.value = true
    currentIndex.value = 0
    startAnimation(animationNames[0])
  }

  const stopSequence = () => {
    isSequenceRunning.value = false

    if (currentAnimation.value) {
      stopAnimation(currentAnimation.value)
    }
  }

  const nextAnimation = () => {
    if (!isSequenceRunning.value)
      return

    if (currentAnimation.value) {
      stopAnimation(currentAnimation.value)
    }

    currentIndex.value = (currentIndex.value + 1) % animationNames.length

    if (currentAnimation.value) {
      startAnimation(currentAnimation.value)
    }
  }

  const previousAnimation = () => {
    if (!isSequenceRunning.value)
      return

    if (currentAnimation.value) {
      stopAnimation(currentAnimation.value)
    }

    currentIndex.value
      = currentIndex.value === 0
        ? animationNames.length - 1
        : currentIndex.value - 1

    if (currentAnimation.value) {
      startAnimation(currentAnimation.value)
    }
  }

  const jumpToAnimation = (index: number) => {
    if (index < 0 || index >= animationNames.length)
      return

    if (currentAnimation.value) {
      stopAnimation(currentAnimation.value)
    }

    currentIndex.value = index

    if (isSequenceRunning.value && currentAnimation.value) {
      startAnimation(currentAnimation.value)
    }
  }

  return {
    currentIndex,
    currentAnimation,
    isSequenceRunning,
    startSequence,
    stopSequence,
    nextAnimation,
    previousAnimation,
    jumpToAnimation,
  }
}

/**
 * 使用动画性能监控的组合式函数
 */
export function useAnimationPerformance(): {
  fps: Ref<number>
  frameTime: Ref<number>
  isPerformanceGood: ComputedRef<boolean>
  startMonitoring: () => void
  stopMonitoring: () => void
} {
  const fps = ref(60)
  const frameTime = ref(16.67)
  const monitoringId = ref<number>()

  const isPerformanceGood = computed(() => fps.value >= 30)

  let lastTime = 0
  let frameCount = 0
  let fpsStartTime = 0

  const monitor = (currentTime: number) => {
    if (!monitoringId.value)
      return

    // 计算帧时间
    if (lastTime > 0) {
      frameTime.value = currentTime - lastTime
    }
    lastTime = currentTime

    // 计算FPS
    frameCount++
    if (fpsStartTime === 0) {
      fpsStartTime = currentTime
    }

    if (currentTime - fpsStartTime >= 1000) {
      fps.value = Math.round((frameCount * 1000) / (currentTime - fpsStartTime))
      frameCount = 0
      fpsStartTime = currentTime
    }

    monitoringId.value = requestAnimationFrame(monitor)
  }

  const startMonitoring = () => {
    if (monitoringId.value)
      return

    lastTime = 0
    frameCount = 0
    fpsStartTime = 0
    monitoringId.value = requestAnimationFrame(monitor)
  }

  const stopMonitoring = () => {
    if (monitoringId.value) {
      cancelAnimationFrame(monitoringId.value)
      monitoringId.value = undefined
    }
  }

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    fps,
    frameTime,
    isPerformanceGood,
    startMonitoring,
    stopMonitoring,
  }
}
