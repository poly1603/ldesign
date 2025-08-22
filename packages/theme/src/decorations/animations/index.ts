/**
 * @ldesign/theme - 动画效果导出
 *
 * 统一导出所有动画效果和相关功能
 */

// 动画管理器
export {
  AnimationManager,
  createAnimationManager,
} from '../../core/animation-manager'

// 动画类型
export type {
  AnimationConfig,
  AnimationKeyframe,
  AnimationManagerInstance,
  AnimationPerformance,
} from '../../core/types'

// 基础动画类
export { BaseAnimation } from './base'

// 动画工厂
export { AnimationFactory } from './factory'

// 具体动画效果
export { createFallingAnimation, FallingAnimation } from './falling'

export { createFloatingAnimation, FloatingAnimation } from './floating'

export { createSparklingAnimation, SparklingAnimation } from './sparkling'
