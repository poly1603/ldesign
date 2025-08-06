import type { RouteLocationNormalized } from './types'

/**
 * 导航失败类型
 */
export enum NavigationFailureType {
  aborted = 4,
  cancelled = 8,
  duplicated = 16,
}

/**
 * 错误类型
 */
export enum ErrorTypes {
  MATCHER_NOT_FOUND = 1,
  NAVIGATION_GUARD_REDIRECT = 2,
  NAVIGATION_ABORTED = 4,
  NAVIGATION_CANCELLED = 8,
  NAVIGATION_DUPLICATED = 16,
}

/**
 * 起始位置
 */
export const START_LOCATION: RouteLocationNormalized = {
  name: undefined,
  path: '/',
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  href: '/',
  matched: [],
  meta: {},
}

/**
 * 默认链接激活类名
 */
export const DEFAULT_LINK_ACTIVE_CLASS = 'router-link-active'

/**
 * 默认链接精确激活类名
 */
export const DEFAULT_LINK_EXACT_ACTIVE_CLASS = 'router-link-exact-active'

/**
 * 路由视图名称
 */
export const DEFAULT_VIEW_NAME = 'default'

/**
 * 路由参数正则
 */
export const PARAM_RE = /:(\w+)/g

/**
 * 可选参数正则
 */
export const OPTIONAL_PARAM_RE = /:(\w+)\?/g

/**
 * 通配符正则
 */
export const WILDCARD_RE = /\*/g

/**
 * 路径分隔符
 */
export const PATH_SEPARATOR = '/'

/**
 * 查询参数分隔符
 */
export const QUERY_SEPARATOR = '?'

/**
 * 哈希分隔符
 */
export const HASH_SEPARATOR = '#'

/**
 * 查询参数键值分隔符
 */
export const QUERY_KV_SEPARATOR = '='

/**
 * 查询参数项分隔符
 */
export const QUERY_ITEM_SEPARATOR = '&'

/**
 * 空字符串
 */
export const EMPTY_STRING = ''

/**
 * 根路径
 */
export const ROOT_PATH = '/'

/**
 * Router 注入符号
 */
export const ROUTER_INJECTION_SYMBOL = Symbol('router')

/**
 * Route 注入符号
 */
export const ROUTE_INJECTION_SYMBOL = Symbol('route')

/**
 * RouterView 位置符号
 */
export const ROUTER_VIEW_LOCATION_SYMBOL = Symbol('router-view-location')
