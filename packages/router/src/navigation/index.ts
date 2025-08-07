/**
 * 导航模块导出
 *
 * 这个模块包含与导航相关的功能，包括：
 * - 导航守卫
 * - 导航失败处理
 * - 滚动行为
 */

export {
  createGuardManager,
  createNavigationFailure,
  isNavigationFailure,
  GuardManager,
  NavigationFailureType,
} from '../guards'

// 导航相关类型
export type {
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationFailure,
  ScrollBehavior,
  ScrollPosition,
} from '../types'
