/**
 * @ldesign/router 常量定义
 *
 * 这个文件定义了路由系统中使用的所有常量
 */

import type { RouteLocationNormalized } from '../types'

// 导入 process 以避免 ESLint 错误
// eslint-disable-next-line node/prefer-global/process
const nodeProcess = typeof process !== 'undefined' ? process : undefined

// ==================== 开发模式常量 ====================

/** 是否为开发模式 */
export const __DEV__ = nodeProcess?.env?.NODE_ENV === 'development'

// ==================== 路径相关常量 ====================

/** 根路径 */
export const ROOT_PATH = '/'

/** 路径分隔符 */
export const PATH_SEPARATOR = '/'

/** 哈希分隔符 */
export const HASH_SEPARATOR = '#'

/** 查询参数分隔符 */
export const QUERY_SEPARATOR = '?'

/** 查询参数项分隔符 */
export const QUERY_ITEM_SEPARATOR = '&'

/** 查询参数键值分隔符 */
export const QUERY_KV_SEPARATOR = '='

/** 空字符串 */
export const EMPTY_STRING = ''

// ==================== 正则表达式常量 ====================

/** 参数匹配正则 */
export const PARAM_RE = /:([\w-]+)(\?)?/g

/** 可选参数匹配正则 */
export const OPTIONAL_PARAM_RE = /\?$/

/** 通配符匹配正则 */
export const WILDCARD_RE = /\*/g

// ==================== 默认类名常量 ====================

/** 默认链接激活类名 */
export const DEFAULT_LINK_ACTIVE_CLASS = 'router-link-active'

/** 默认链接精确激活类名 */
export const DEFAULT_LINK_EXACT_ACTIVE_CLASS = 'router-link-exact-active'

/** 默认视图名称 */
export const DEFAULT_VIEW_NAME = 'default'

// ==================== 注入键常量 ====================

/** 路由器注入键 */
export const ROUTER_INJECTION_SYMBOL = Symbol('router')

/** 路由注入键 */
export const ROUTE_INJECTION_SYMBOL = Symbol('route')

/** 路由视图位置注入键 */
export const ROUTER_VIEW_LOCATION_SYMBOL = Symbol('router-view-location')

// ==================== 错误类型常量 ====================

/** 错误类型枚举 */
export enum ErrorTypes {
  MATCHER_NOT_FOUND = 'MATCHER_NOT_FOUND',
  NAVIGATION_GUARD_REDIRECT = 'NAVIGATION_GUARD_REDIRECT',
  NAVIGATION_ABORTED = 'NAVIGATION_ABORTED',
  NAVIGATION_CANCELLED = 'NAVIGATION_CANCELLED',
  NAVIGATION_DUPLICATED = 'NAVIGATION_DUPLICATED',
}

// ==================== 导航失败类型常量 ====================

/** 导航失败类型 */
export enum NavigationFailureType {
  /** 导航被中止 */
  aborted = 4,
  /** 导航被取消 */
  cancelled = 8,
  /** 重复导航 */
  duplicated = 16,
}

// ==================== 起始位置常量 ====================

/** 起始路由位置 */
export const START_LOCATION: RouteLocationNormalized = {
  path: '/',
  name: '',
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
} as RouteLocationNormalized

// ==================== 动画相关常量 ====================

/** 默认动画持续时间（毫秒） */
export const DEFAULT_ANIMATION_DURATION = 300

/** 动画类型 */
export enum AnimationType {
  FADE = 'fade',
  SLIDE = 'slide',
  SCALE = 'scale',
  FLIP = 'flip',
  NONE = 'none',
}

// ==================== 预加载相关常量 ====================

/** 预加载策略 */
export enum PreloadStrategy {
  HOVER = 'hover',
  VISIBLE = 'visible',
  IDLE = 'idle',
  NONE = 'none',
}

/** 默认预加载延迟（毫秒） */
export const DEFAULT_PRELOAD_DELAY = 200

// ==================== 缓存相关常量 ====================

/** 缓存策略 */
export enum CacheStrategy {
  MEMORY = 'memory',
  SESSION = 'session',
  LOCAL = 'local',
  NONE = 'none',
}

/** 默认缓存大小限制 */
export const DEFAULT_CACHE_SIZE = 10

// ==================== 性能相关常量 ====================

/** 性能监控事件类型 */
export enum PerformanceEventType {
  NAVIGATION_START = 'navigation-start',
  NAVIGATION_END = 'navigation-end',
  COMPONENT_LOAD_START = 'component-load-start',
  COMPONENT_LOAD_END = 'component-load-end',
  ROUTE_MATCH_START = 'route-match-start',
  ROUTE_MATCH_END = 'route-match-end',
}

/** 性能警告阈值（毫秒） */
export const PERFORMANCE_WARNING_THRESHOLD = 1000

// ==================== HTTP 状态码常量 ====================

/** HTTP 状态码 */
export enum HttpStatusCode {
  OK = 200,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// ==================== 浏览器兼容性常量 ====================

/** 是否支持 History API */
export const SUPPORTS_HISTORY
  = typeof window !== 'undefined'
    && 'history' in window
    && 'pushState' in window.history

/** 是否支持 IntersectionObserver */
export const SUPPORTS_INTERSECTION_OBSERVER
  = typeof window !== 'undefined' && 'IntersectionObserver' in window

/** 是否支持 requestIdleCallback */
export const SUPPORTS_REQUEST_IDLE_CALLBACK
  = typeof window !== 'undefined' && 'requestIdleCallback' in window

export const IS_DEV = nodeProcess?.env?.NODE_ENV === 'development'

/** 是否为生产模式 */
export const IS_PROD = nodeProcess?.env?.NODE_ENV === 'production'

/** 是否为测试模式 */
export const IS_TEST = nodeProcess?.env?.NODE_ENV === 'test'

// ==================== 版本信息常量 ====================

/** 路由器版本 */
export const ROUTER_VERSION = '1.0.0'

/** 最小 Vue 版本要求 */
export const MIN_VUE_VERSION = '3.3.0'
