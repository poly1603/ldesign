/**
 * @ldesign/theme - 装饰元素导出
 *
 * 统一导出所有装饰元素和相关功能
 */

// 基础装饰类
export { BaseDecoration } from './elements/base'

// 具体装饰元素
export {
  SnowflakeDecoration,
  createSnowflakeDecoration,
  createSnowfallEffect,
} from './elements/snowflake'

export {
  LanternDecoration,
  createLanternDecoration,
  createSpringFestivalLanterns,
} from './elements/lantern'

export {
  FireworkDecoration,
  createFireworkDecoration,
  createCelebrationFireworks,
} from './elements/firework'

// 装饰元素工厂
export { DecorationFactory } from './factory'

// 装饰元素管理器
export {
  DecorationManager,
  createDecorationManager,
} from '../core/decoration-manager'

// 装饰元素类型
export type {
  DecorationConfig,
  DecorationPosition,
  DecorationStyle,
  DecorationCondition,
  DecorationManagerInstance,
} from '../core/types'
