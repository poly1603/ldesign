/**
 * @ldesign/theme - 动画效果导出
 *
 * 统一导出所有动画效果和相关功能
 */

// 基础动画类
export { BaseAnimation } from './base'

// 具体动画效果
export { FallingAnimation, createFallingAnimation } from './falling'

export { FloatingAnimation, createFloatingAnimation } from './floating'

export { SparklingAnimation, createSparklingAnimation } from './sparkling'

// 动画管理器
export {
  AnimationManager,
  createAnimationManager,
} from '../../core/animation-manager'

// 动画类型
export type {
  AnimationConfig,
  AnimationKeyframe,
  AnimationPerformance,
  AnimationManagerInstance,
} from '../../core/types'

// 动画工厂
export { AnimationFactory } from './factory'
