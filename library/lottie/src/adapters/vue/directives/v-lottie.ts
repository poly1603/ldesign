/**
 * v-lottie 指令
 * 简单的 Lottie 动画指令
 */

import type { Directive } from 'vue'
import { lottieManager } from '../../../core/LottieManager'
import type { ILottieInstance, LottieConfig } from '../../../types'

interface LottieDirectiveElement extends HTMLElement {
  _lottieInstance?: ILottieInstance
}

export const vLottie: Directive = {
  mounted(el: LottieDirectiveElement, binding) {
    const value = binding.value
    
    // 支持直接传入路径字符串或配置对象
    const config: LottieConfig = typeof value === 'string' 
      ? { container: el, path: value, autoplay: true, loop: true }
      : { container: el, ...value }

    try {
      const instance = lottieManager.create(config)
      el._lottieInstance = instance
      instance.load()
    } catch (error) {
      console.error('[v-lottie] Failed to create instance:', error)
    }
  },

  updated(el: LottieDirectiveElement, binding) {
    // 如果值改变，重新创建实例
    if (binding.value !== binding.oldValue) {
      // 销毁旧实例
      if (el._lottieInstance) {
        el._lottieInstance.destroy()
      }

      // 创建新实例
      const value = binding.value
      const config: LottieConfig = typeof value === 'string'
        ? { container: el, path: value, autoplay: true, loop: true }
        : { container: el, ...value }

      try {
        const instance = lottieManager.create(config)
        el._lottieInstance = instance
        instance.load()
      } catch (error) {
        console.error('[v-lottie] Failed to update instance:', error)
      }
    }
  },

  beforeUnmount(el: LottieDirectiveElement) {
    if (el._lottieInstance) {
      el._lottieInstance.destroy()
      delete el._lottieInstance
    }
  }
}


