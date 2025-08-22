/**
 * @ldesign/router 类型安全的路由定义助手
 *
 * 提供类型安全的路由定义和导航方法
 */

import type {
  ExtractRouteParams,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  RouteRecordRaw,
  TypedRouteParams,
  TypedRouteQuery,
} from './index'

// ==================== 路由定义助手 ====================

/**
 * 类型安全的路由记录定义
 */
export interface TypedRouteRecord<
  TPath extends string = string,
  TParams extends Record<string, any> = ExtractRouteParams<TPath>,
  TQuery extends Record<string, any> = Record<string, any>,
  TMeta extends RouteMeta = RouteMeta,
> {
  /** 路径模式 */
  path: TPath
  /** 路由名称 */
  name?: string | symbol
  /** 组件 */
  component?: any
  /** 多个命名组件 */
  components?: Record<string, any>
  /** 重定向 */
  redirect?: RouteLocationRaw<TParams, TQuery>
  /** 别名 */
  alias?: string | string[]
  /** 子路由 */
  children?: TypedRouteRecord[]
  /** 元信息 */
  meta?: TMeta
  /** 路由守卫 */
  beforeEnter?: any
  /** 属性传递 */
  props?: boolean | Record<string, any> | ((route: any) => Record<string, any>)
}

/**
 * 创建类型安全的路由记录
 */
export function defineRoute<
  TPath extends string,
  TParams extends Record<string, any> = ExtractRouteParams<TPath>,
  TQuery extends Record<string, any> = Record<string, any>,
  TMeta extends RouteMeta = RouteMeta,
>(route: TypedRouteRecord<TPath, TParams, TQuery, TMeta>): RouteRecordRaw {
  return route as RouteRecordRaw
}

/**
 * 创建类型安全的路由集合
 */
export function defineRoutes<T extends readonly TypedRouteRecord[]>(
  routes: [...T],
): RouteRecordRaw[] {
  return routes as unknown as RouteRecordRaw[]
}

// ==================== 导航助手 ====================

/**
 * 类型安全的导航选项
 */
export interface TypedNavigationOptions<
  TParams extends Record<string, any> = Record<string, any>,
  TQuery extends Record<string, any> = Record<string, any>,
> {
  /** 路由参数 */
  params?: TypedRouteParams<TParams>
  /** 查询参数 */
  query?: TypedRouteQuery<TQuery>
  /** 哈希值 */
  hash?: string
  /** 是否替换当前历史记录 */
  replace?: boolean
}

/**
 * 类型安全的路径导航
 */
export function navigateToPath<TPath extends string>(
  path: TPath,
  options?: TypedNavigationOptions<ExtractRouteParams<TPath>>,
): RouteLocationRaw {
  if (!options) {
    return path
  }

  const { params, query, hash, ...rest } = options
  return {
    path,
    params: params as any,
    query: query as any,
    hash,
    ...rest,
  } as RouteLocationRaw
}

/**
 * 类型安全的命名路由导航
 */
export function navigateToName<
  TParams extends Record<string, any> = Record<string, any>,
  TQuery extends Record<string, any> = Record<string, any>,
>(
  name: string | symbol,
  options?: TypedNavigationOptions<TParams, TQuery>,
): RouteLocationRaw {
  const { params, query, hash, ...rest } = options || {}
  return {
    name,
    params: params as any,
    query: query as any,
    hash,
    ...rest,
  } as RouteLocationRaw
}

// ==================== 路由匹配助手 ====================

/**
 * 类型安全的路由匹配器
 */
export interface TypedRouteMatcher {
  /**
   * 匹配路径
   */
  match: <TPath extends string>(
    path: TPath
  ) => RouteLocationNormalized<ExtractRouteParams<TPath>> | null

  /**
   * 匹配命名路由
   */
  matchName: <
    TParams extends Record<string, any> = Record<string, any>,
    TQuery extends Record<string, any> = Record<string, any>,
  >(
    name: string | symbol,
    params?: TypedRouteParams<TParams>,
    query?: TypedRouteQuery<TQuery>
  ) => RouteLocationNormalized<TParams, TQuery> | null
}

// ==================== 路由守卫助手 ====================

/**
 * 类型安全的导航守卫
 */
export type TypedNavigationGuard<
  TFromParams extends Record<string, any> = Record<string, any>,
  TFromQuery extends Record<string, any> = Record<string, any>,
  TToParams extends Record<string, any> = Record<string, any>,
  TToQuery extends Record<string, any> = Record<string, any>,
> = (
  to: RouteLocationNormalized<TToParams, TToQuery>,
  from: RouteLocationNormalized<TFromParams, TFromQuery>,
  next: (location?: RouteLocationRaw) => void
) => void | Promise<void> | RouteLocationRaw | boolean

/**
 * 创建类型安全的导航守卫
 */
export function defineNavigationGuard<
  TFromParams extends Record<string, any> = Record<string, any>,
  TFromQuery extends Record<string, any> = Record<string, any>,
  TToParams extends Record<string, any> = Record<string, any>,
  TToQuery extends Record<string, any> = Record<string, any>,
>(
  guard: TypedNavigationGuard<TFromParams, TFromQuery, TToParams, TToQuery>,
): any {
  return guard
}

// ==================== 路由元信息助手 ====================

/**
 * 类型安全的路由元信息定义
 */
export function defineMeta<T extends RouteMeta>(meta: T): T {
  return meta
}

/**
 * 扩展路由元信息类型
 */
export interface ExtendedRouteMeta extends RouteMeta {
  /** 页面图标 */
  icon?: string
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean
  /** 面包屑路径 */
  breadcrumb?: string[]
  /** 页面权限码 */
  permission?: string
  /** 页面分组 */
  group?: string
  /** 排序权重 */
  order?: number
}

// ==================== 工具类型 ====================

/**
 * 从路由记录中提取路径类型
 */
export type ExtractRoutePath<T> = T extends TypedRouteRecord<
  infer P,
  any,
  any,
  any
>
  ? P
  : never

/**
 * 从路由记录中提取参数类型
 */
export type ExtractRouteRecordParams<T> = T extends TypedRouteRecord<
  any,
  infer P,
  any,
  any
>
  ? P
  : never

/**
 * 从路由记录中提取查询类型
 */
export type ExtractRouteRecordQuery<T> = T extends TypedRouteRecord<
  any,
  any,
  infer Q,
  any
>
  ? Q
  : never

/**
 * 从路由记录中提取元信息类型
 */
export type ExtractRouteRecordMeta<T> = T extends TypedRouteRecord<
  any,
  any,
  any,
  infer M
>
  ? M
  : never

/**
 * 路由记录联合类型
 */
export type RouteRecordUnion<T extends readonly TypedRouteRecord[]> = T[number]

/**
 * 从路由记录数组中提取所有路径
 */
export type ExtractAllPaths<T extends readonly TypedRouteRecord[]> =
  ExtractRoutePath<RouteRecordUnion<T>>

// ==================== 默认导出 ====================

export default {
  defineRoute,
  defineRoutes,
  navigateToPath,
  navigateToName,
  defineNavigationGuard,
  defineMeta,
}
