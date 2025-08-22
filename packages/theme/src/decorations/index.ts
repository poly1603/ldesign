/**
 * @ldesign/theme - 装饰元素导出
 *
 * 统一导出所有装饰元素和相关功能
 */

// 装饰元素管理器
export {
  createDecorationManager,
  DecorationManager,
} from '../core/decoration-manager'

// 装饰元素类型
export type {
  DecorationCondition,
  DecorationConfig,
  DecorationManagerInstance,
  DecorationPosition,
  DecorationStyle,
} from '../core/types'

// 基础装饰类
export { BaseDecoration } from './elements/base'

export {
  createCelebrationFireworks,
  createFireworkDecoration,
  FireworkDecoration,
} from './elements/firework'

export {
  createLanternDecoration,
  createSpringFestivalLanterns,
  LanternDecoration,
} from './elements/lantern'

// 具体装饰元素
export {
  createSnowfallEffect,
  createSnowflakeDecoration,
  SnowflakeDecoration,
} from './elements/snowflake'

// 装饰元素工厂
export { DecorationFactory } from './factory'
