/**
 * React 适配器 - 主入口
 * 导出所有 React 相关功能
 */

// Hooks
export { useLottie } from './hooks/useLottie'
export { useLottieInteractive } from './hooks/useLottieInteractive'
export { useLottieSequence } from './hooks/useLottieSequence'
export { useLottieControls } from './hooks/useLottieControls'

// 组件
export { LottieAnimation } from './components/LottieAnimation'
export { LottiePlayer } from './components/LottiePlayer'
export { LottieSequence } from './components/LottieSequence'

// Context
export { LottieProvider, useLottieContext } from './context/LottieContext'

// 类型
export type * from './types'


