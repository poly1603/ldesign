/**
 * v-lottie-hover 指令
 * 鼠标悬停时播放动画
 */

import type { Directive } from 'vue'
import { lottieManager } from '../../../core/LottieManager'
import type { ILottieInstance, LottieConfig } from '../../../types'

interface LottieHoverElement extends HTMLElement {
  _lottieInstance?: ILottieInstance
  _mouseEnterHandler?: () => void
  _mouseLeaveHandler?: () => void
}

export const vLottieHover: Directive = {
  mounted(el: LottieHoverElement, binding) {
    const value = binding.value
    const config: LottieConfig = typeof value === 'string'
      ? { container: el, path: value, autoplay: false, loop: false }
      : { container: el, autoplay: false, ...value }

    try {
      const instance = lottieManager.create(config)
      el._lottieInstance = instance
      instance.load()

      // 添加悬停事件
      el._mouseEnterHandler = () => {
        instance.play()
      }

      el._mouseLeaveHandler = () => {
        instance.pause()
      }

      el.addEventListener('mouseenter', el._mouseEnterHandler)
      el.addEventListener('mouseleave', el._mouseLeaveHandler)

      // 添加样式
      el.style.cursor = 'pointer'
    } catch (error) {
      console.error('[v-lottie-hover] Failed to create instance:', error)
    }
  },

  beforeUnmount(el: LottieHoverElement) {
    if (el._mouseEnterHandler) {
      el.removeEventListener('mouseenter', el._mouseEnterHandler)
    }
    if (el._mouseLeaveHandler) {
      el.removeEventListener('mouseleave', el._mouseLeaveHandler)
    }
    if (el._lottieInstance) {
      el._lottieInstance.destroy()
      delete el._lottieInstance
    }
    el.style.cursor = ''
  }
}


