/**
 * 工具模块导出
 *
 * 这个模块包含各种工具函数，包括：
 * - 路由解析和格式化
 * - 查询参数处理
 * - 通用工具函数
 */

export {
  assert,
  debounce,
  deepClone,
  isSameRouteLocation,
  merge,
  normalizeParams,
  parseQuery,
  parseURL,
  stringifyQuery,
  stringifyURL,
  throttle,
  warn,
  isNavigationFailure,
  createNavigationFailure,
} from '../utils'
