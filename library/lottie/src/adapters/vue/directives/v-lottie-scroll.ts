/**
 * v-lottie-scroll 指令
 * 根据滚动位置控制动画进度
 */

import type { Directive } from 'vue'
import { lottieManager } from '../../../core/LottieManager'
import type { ILottieInstance, LottieConfig } from '../../../types'

interface LottieScrollElement extends HTMLElement {
  _lottieInstance?: ILottieInstance
  _scrollHandler?: () => void
}

export const vLottieScroll: Directive = {
  mounted(el: LottieScrollElement, binding) {
    const value = binding.value
    const config: LottieConfig = typeof value === 'string'
      ? { container: el, path: value, autoplay: false, loop: false }
      : { container: el, autoplay: false, ...value }

    try {
      const instance = lottieManager.create(config)
      el._lottieInstance = instance
      instance.load()

      // 滚动处理函数
      el._scrollHandler = () => {
        if (!instance.animation) return

        const rect = el.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // 计算元素在视口中的位置
        const elementTop = rect.top
        const elementBottom = rect.bottom
        const elementHeight = rect.height

        // 计算进度 (0-1)
        let progress = 0

        if (elementBottom > 0 && elementTop < windowHeight) {
          // 元素在视口中
          const visibleHeight = Math.min(elementBottom, windowHeight) - Math.max(elementTop, 0)
          progress = visibleHeight / elementHeight
        }

        // 根据进度设置帧
        const targetFrame = Math.floor(progress * instance.animation.totalFrames)
        instance.goToAndStop(targetFrame, true)
      }

      // 监听滚动
      window.addEventListener('scroll', el._scrollHandler, { passive: true })
      el._scrollHandler() // 初始调用
    } catch (error) {
      console.error('[v-lottie-scroll] Failed to create instance:', error)
    }
  },

  beforeUnmount(el: LottieScrollElement) {
    if (el._scrollHandler) {
      window.removeEventListener('scroll', el._scrollHandler)
    }
    if (el._lottieInstance) {
      el._lottieInstance.destroy()
      delete el._lottieInstance
    }
  }
}


