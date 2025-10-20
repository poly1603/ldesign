/**
 * useLottieInteractive Composable
 * Lottie 动画交互功能
 */

import { onMounted, onBeforeUnmount } from 'vue'
import { useLottie } from './useLottie'
import { InteractiveController } from '../../../core/InteractiveController'
import type { UseLottieInteractiveOptions, UseLottieReturn } from '../types'

/**
 * 使用交互式 Lottie 动画
 */
export function useLottieInteractive(
  config: UseLottieInteractiveOptions
): UseLottieReturn {
  const {
    enableClick = false,
    enableHover = false,
    enableScroll = false,
    enableDrag = false,
    ...lottieConfig
  } = config

  // 使用基础 useLottie
  const lottie = useLottie(lottieConfig)

  let interactiveController: InteractiveController | null = null

  // 初始化交互控制
  const initInteractive = () => {
    if (!lottie.instance.value) return

    try {
      interactiveController = new InteractiveController({
        instance: lottie.instance.value,
        enableClick,
        enableHover,
        enableScroll,
        enableDrag
      })
    } catch (error) {
      console.error('[useLottieInteractive] Failed to initialize:', error)
    }
  }

  // 生命周期
  onMounted(() => {
    // 等待实例加载后再初始化交互
    const checkInstance = setInterval(() => {
      if (lottie.instance.value) {
        clearInterval(checkInstance)
        initInteractive()
      }
    }, 100)

    // 5秒后超时
    setTimeout(() => clearInterval(checkInstance), 5000)
  })

  onBeforeUnmount(() => {
    interactiveController?.destroy()
  })

  return lottie
}


