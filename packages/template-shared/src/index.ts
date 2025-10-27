/**
 * @ldesign/template-shared
 * 跨框架共享的工具、常量和类型
 */

// 导出常量
export * from './constants'
export { default as constants } from './constants'

// 导出工具函数
export * from './utils'
export { default as utils } from './utils'

// 导出动画工具
export * from './animation'
export { default as animation } from './animation'

// 导出国际化
export * from './i18n'
export { default as i18n } from './i18n'

// 导出类型
export * from './types'
export { default as types } from './types'

// 版本号
export const VERSION = '1.0.0'

// 默认导出
export default {
  VERSION,
}
