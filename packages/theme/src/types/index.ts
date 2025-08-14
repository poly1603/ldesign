/**
 * @ldesign/theme - 类型定义导出
 *
 * 统一导出所有类型定义
 */

// 核心类型
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
} from '../core/types'

// 工具类型
export type {
  DeepPartial,
  RequiredKeys,
  OptionalKeys,
  Prettify,
  UnionToIntersection,
} from './utils'
