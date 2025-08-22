import { UseThemeAnimationsReturn } from '../types.js'
import { ComputedRef, Ref } from 'vue'

/**
 * @ldesign/theme - useThemeAnimations 组合式函数
 *
 * 提供动画管理的响应式接口
 */

/**
 * 使用主题动画的组合式函数
 */
declare function useThemeAnimations(): UseThemeAnimationsReturn
/**
 * 使用动画控制的组合式函数
 */
declare function useAnimationControl(animationName: string): {
  isRunning: ComputedRef<boolean>
  isPaused: ComputedRef<boolean>
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  toggle: () => void
  restart: () => void
}
/**
 * 使用动画序列的组合式函数
 */
declare function useAnimationSequence(animationNames: string[]): {
  currentIndex: Ref<number>
  currentAnimation: ComputedRef<string | undefined>
  isSequenceRunning: Ref<boolean>
  startSequence: () => void
  stopSequence: () => void
  nextAnimation: () => void
  previousAnimation: () => void
  jumpToAnimation: (index: number) => void
}
/**
 * 使用动画性能监控的组合式函数
 */
declare function useAnimationPerformance(): {
  fps: Ref<number>
  frameTime: Ref<number>
  isPerformanceGood: ComputedRef<boolean>
  startMonitoring: () => void
  stopMonitoring: () => void
}

export {
  useAnimationControl,
  useAnimationPerformance,
  useAnimationSequence,
  useThemeAnimations,
}
