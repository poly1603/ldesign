/**
 * @file useAnimations 组合式函数
 * @description 动画管理的组合式函数
 */

import { inject } from 'vue'
import type { FestivalThemeManager } from '../../core/theme-manager'
import type { AnimationConfig } from '../../core/types'
import type { UseAnimationsReturn } from '../types'

/**
 * 使用动画管理的组合式函数
 * 
 * @returns 动画管理相关的方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useAnimations } from '@ldesign/theme/vue'
 * 
 * const elementRef = ref<HTMLElement>()
 * const { playAnimation, stopAnimation, registerAnimation } = useAnimations()
 * 
 * // 播放动画
 * const handlePlay = () => {
 *   if (elementRef.value) {
 *     playAnimation(elementRef.value, {
 *       name: 'bounce',
 *       duration: 1000,
 *       iterations: 3
 *     })
 *   }
 * }
 * 
 * // 注册自定义动画
 * registerAnimation('customBounce', [
 *   { transform: 'translateY(0px)' },
 *   { transform: 'translateY(-20px)' },
 *   { transform: 'translateY(0px)' }
 * ], { duration: 500 })
 * </script>
 * 
 * <template>
 *   <div ref="elementRef" @click="handlePlay">
 *     点击播放动画
 *   </div>
 * </template>
 * ```
 */
export function useAnimations(): UseAnimationsReturn {
  // 注入主题管理器
  const themeManager = inject<FestivalThemeManager>('themeManager')
  
  if (!themeManager) {
    throw new Error('useAnimations must be used within a theme provider or after installing the Vue theme plugin')
  }

  // 播放动画
  const playAnimation = async (element: HTMLElement, config: AnimationConfig): Promise<void> => {
    await themeManager.animationEngine.playAnimation(element, config)
  }

  // 停止动画
  const stopAnimation = (element: HTMLElement): void => {
    themeManager.animationEngine.stopAnimation(element)
  }

  // 暂停动画
  const pauseAnimation = (element: HTMLElement): void => {
    themeManager.animationEngine.pauseAnimation(element)
  }

  // 恢复动画
  const resumeAnimation = (element: HTMLElement): void => {
    themeManager.animationEngine.resumeAnimation(element)
  }

  // 注册动画
  const registerAnimation = (
    name: string, 
    keyframes: Keyframe[], 
    options?: KeyframeAnimationOptions
  ): void => {
    themeManager.animationEngine.registerAnimation(name, keyframes, options)
  }

  return {
    playAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    registerAnimation
  }
}
