import type { RouteLocationNormalized, RouteLocationRaw } from '../types'

/**
 * RouterView 组件属性
 */
export interface RouterViewProps {
  /**
   * 视图名称
   */
  name?: string
  /**
   * 路由对象
   */
  route?: RouteLocationNormalized
}

/**
 * RouterLink 组件属性
 */
export interface RouterLinkProps {
  /**
   * 目标路由
   */
  to: RouteLocationRaw
  /**
   * 是否替换当前历史记录
   */
  replace?: boolean
  /**
   * 激活时的类名
   */
  activeClass?: string
  /**
   * 精确激活时的类名
   */
  exactActiveClass?: string
  /**
   * 是否精确匹配
   */
  exact?: boolean
  /**
   * 渲染的标签
   */
  tag?: string
  /**
   * 触发导航的事件
   */
  event?: string | string[]
  /**
   * 是否追加路径
   */
  append?: boolean
  /**
   * 是否自定义渲染
   */
  custom?: boolean
}

/**
 * RouterLink 插槽参数
 */
export interface RouterLinkSlotProps {
  /**
   * 链接地址
   */
  href: string
  /**
   * 解析的路由
   */
  route: RouteLocationNormalized | null
  /**
   * 导航函数
   */
  navigate: (e: Event) => void
  /**
   * 是否激活
   */
  isActive: boolean
  /**
   * 是否精确激活
   */
  isExactActive: boolean
}

/**
 * RouterView 插槽参数
 */
export interface RouterViewSlotProps {
  /**
   * 组件实例
   */
  Component: Component | null
  /**
   * 当前路由
   */
  route: RouteLocationNormalized
}
