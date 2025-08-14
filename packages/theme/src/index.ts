/**
 * @ldesign/theme - 主题系统
 *
 * 提供完整的主题管理功能，包括节日主题、装饰元素和动画效果
 *
 * @version 0.1.0
 * @author LDesign Team
 */

// 导出核心类型
export type {
  ThemeCategory,
  FestivalType,
  DecorationType,
  AnimationType,
  Position,
  Size,
  TimeRange,
  DecorationPosition,
  DecorationStyle,
  DecorationConfig,
  DecorationCondition,
  AnimationConfig,
  AnimationKeyframe,
  AnimationPerformance,
  ResourceConfig,
  ThemeConfig,
  ThemeCompatibility,
  ThemeManagerOptions,
  PerformanceOptions,
  StorageOptions,
  ThemeEventType,
  ThemeEventData,
  ThemeEventListener,
  ThemeManagerInstance,
  DecorationManagerInstance,
  AnimationManagerInstance,
  ResourceManagerInstance,
  ResourceStats,
} from './core/types'

// 导出核心管理器
export { ThemeManager, createThemeManager } from './core/theme-manager'
export {
  DecorationManager,
  createDecorationManager,
} from './core/decoration-manager'
export {
  AnimationManager,
  createAnimationManager,
} from './core/animation-manager'
export { ResourceManager, createResourceManager } from './core/resource-manager'

// 导出工具函数
export {
  EventEmitterImpl,
  createEventEmitter,
  defaultEventEmitter,
} from './utils/event-emitter'

// 导出主题预设
export * from './themes/presets'

// 导出装饰元素
export * from './decorations'

// 导出动画效果
export * from './decorations/animations'

// 导出 Vue 适配层
export * from './adapt/vue'

// 导出所有类型
export * from './types'

// 版本信息
export const version = '0.1.0'

// 默认导出
export default {
  version,
  createThemeManager,
}
