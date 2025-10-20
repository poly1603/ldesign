/**
 * Vue 插件
 * 全局注册 Lottie 组件和指令
 */

import type { App } from 'vue'
import LottieAnimation from './components/LottieAnimation.vue'
import LottiePlayer from './components/LottiePlayer.vue'
import LottieSequence from './components/LottieSequence.vue'
import { vLottie } from './directives/v-lottie'
import { vLottieHover } from './directives/v-lottie-hover'
import { vLottieScroll } from './directives/v-lottie-scroll'

export interface LottiePluginOptions {
  /** 组件名前缀 */
  componentPrefix?: string
  /** 是否注册全局组件 */
  components?: boolean
  /** 是否注册全局指令 */
  directives?: boolean
}

export const LottiePlugin = {
  install(app: App, options: LottiePluginOptions = {}) {
    const {
      componentPrefix = 'Lottie',
      components = true,
      directives = true
    } = options

    // 注册组件
    if (components) {
      app.component(`${componentPrefix}Animation`, LottieAnimation)
      app.component(`${componentPrefix}Player`, LottiePlayer)
      app.component(`${componentPrefix}Sequence`, LottieSequence)
    }

    // 注册指令
    if (directives) {
      app.directive('lottie', vLottie)
      app.directive('lottie-hover', vLottieHover)
      app.directive('lottie-scroll', vLottieScroll)
    }
  }
}

// 默认导出
export default LottiePlugin


