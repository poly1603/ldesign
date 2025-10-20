/**
 * Vue 3 适配器 - 主入口
 * 导出所有 Vue 相关功能
 */

// Composable
export { useLottie } from './composables/useLottie'
export { useLottieInteractive } from './composables/useLottieInteractive'
export { useLottieSequence } from './composables/useLottieSequence'

// 组件
export { default as LottieAnimation } from './components/LottieAnimation.vue'
export { default as LottiePlayer } from './components/LottiePlayer.vue'
export { default as LottieSequence } from './components/LottieSequence.vue'

// 指令
export { vLottie } from './directives/v-lottie'
export { vLottieHover } from './directives/v-lottie-hover'
export { vLottieScroll } from './directives/v-lottie-scroll'

// 插件
export { LottiePlugin } from './plugin'

// 类型
export type * from './types'


