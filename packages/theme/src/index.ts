/**
 * @ldesign/theme - 主题系统
 *
 * 提供完整的主题管理功能，包括节日主题、装饰元素和动画效果
 *
 * @version 0.1.0
 * @author LDesign Team
 */

import { createThemeManager, ThemeManager } from './core/theme-manager'
// 导出 Vue 适配层
export * from './adapt/vue'

export {
  AnimationManager,
  createAnimationManager,
} from './core/animation-manager'
export {
  createDecorationManager,
  DecorationManager,
} from './core/decoration-manager'
export { createResourceManager, ResourceManager } from './core/resource-manager'
// 导出核心管理器
export { createThemeManager, ThemeManager }

// 导出核心类型
export type {
  AnimationConfig,
  AnimationKeyframe,
  AnimationManagerInstance,
  AnimationPerformance,
  AnimationType,
  DecorationCondition,
  DecorationConfig,
  DecorationManagerInstance,
  DecorationPosition,
  DecorationStyle,
  DecorationType,
  FestivalType,
  PerformanceOptions,
  Position,
  ResourceConfig,
  ResourceManagerInstance,
  ResourceStats,
  Size,
  StorageOptions,
  ThemeCategory,
  ThemeCompatibility,
  ThemeConfig,
  ThemeEventData,
  ThemeEventListener,
  ThemeEventType,
  ThemeManagerInstance,
  ThemeManagerOptions,
  TimeRange,
} from './core/types'

// 导出装饰元素
export * from './decorations'

// 导出动画效果
export * from './decorations/animations'

// 导出主题预设
export * from './themes/presets'

// 导出所有类型
export * from './types'

// 导出工具函数
export {
  createEventEmitter,
  defaultEventEmitter,
  EventEmitterImpl,
} from './utils/event-emitter'

// 版本信息
export const version = '0.1.0'

// 默认导出
export default {
  version,
  createThemeManager,
}
