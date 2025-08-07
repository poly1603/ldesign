import type {
  RouteComponent,
  RouteRecordNormalized,
  PreloadStrategy,
} from './types'

/**
 * 路由预加载器
 */
export class RoutePreloader {
  private preloadedComponents = new Map<string, Promise<RouteComponent>>()
  private preloadQueue = new Set<string>()
  private strategy: PreloadStrategy = 'none'

  constructor(strategy: PreloadStrategy = 'none') {
    this.strategy = strategy
  }

  /**
   * 设置预加载策略
   */
  setStrategy(strategy: PreloadStrategy) {
    this.strategy = strategy
  }

  /**
   * 预加载路由组件
   */
  async preloadRoute(route: RouteRecordNormalized): Promise<void> {
    const routeKey = this.getRouteKey(route)

    if (
      this.preloadedComponents.has(routeKey) ||
      this.preloadQueue.has(routeKey)
    ) {
      return
    }

    this.preloadQueue.add(routeKey)

    try {
      const component = route.components?.default
      if (component && typeof component === 'function') {
        const preloadPromise = Promise.resolve(component()).then(module => {
          // 处理 ES 模块默认导出
          return module && typeof module === 'object' && 'default' in module
            ? module.default
            : module
        })

        this.preloadedComponents.set(routeKey, preloadPromise)
        await preloadPromise
      }
    } catch (error) {
      console.warn(`Failed to preload route ${routeKey}:`, error)
    } finally {
      this.preloadQueue.delete(routeKey)
    }
  }

  /**
   * 预加载多个路由
   */
  async preloadRoutes(routes: RouteRecordNormalized[]): Promise<void> {
    const promises = routes.map(route => this.preloadRoute(route))
    await Promise.allSettled(promises)
  }

  /**
   * 获取预加载的组件
   */
  getPreloadedComponent(
    route: RouteRecordNormalized
  ): Promise<RouteComponent> | undefined {
    const routeKey = this.getRouteKey(route)
    return this.preloadedComponents.get(routeKey)
  }

  /**
   * 清除预加载缓存
   */
  clearCache(routeKey?: string) {
    if (routeKey) {
      this.preloadedComponents.delete(routeKey)
    } else {
      this.preloadedComponents.clear()
    }
  }

  /**
   * 获取路由唯一标识
   */
  private getRouteKey(route: RouteRecordNormalized): string {
    return route.name?.toString() || route.path
  }

  /**
   * 根据策略预加载相关路由
   */
  async preloadByStrategy(
    currentRoute: RouteRecordNormalized,
    allRoutes: RouteRecordNormalized[]
  ): Promise<void> {
    switch (this.strategy) {
      case 'immediate':
        await this.preloadRoutes(allRoutes)
        break

      case 'visible':
        // 预加载当前路由的子路由和兄弟路由
        const relatedRoutes = this.getRelatedRoutes(currentRoute, allRoutes)
        await this.preloadRoutes(relatedRoutes)
        break

      case 'hover':
        // 在 hover 时才预加载，这里只是标记策略
        break

      case 'none':
      default:
        // 不预加载
        break
    }
  }

  /**
   * 获取相关路由（子路由和兄弟路由）
   */
  private getRelatedRoutes(
    currentRoute: RouteRecordNormalized,
    allRoutes: RouteRecordNormalized[]
  ): RouteRecordNormalized[] {
    const related: RouteRecordNormalized[] = []

    // 添加子路由
    related.push(...currentRoute.children)

    // 添加兄弟路由（同级路由）
    const parentPath = this.getParentPath(currentRoute.path)
    if (parentPath) {
      const siblings = allRoutes.filter(
        route =>
          this.getParentPath(route.path) === parentPath &&
          route.path !== currentRoute.path
      )
      related.push(...siblings)
    }

    return related
  }

  /**
   * 获取父路径
   */
  private getParentPath(path: string): string | null {
    const segments = path.split('/').filter(Boolean)
    if (segments.length <= 1) return null
    return '/' + segments.slice(0, -1).join('/')
  }
}

/**
 * 创建路由预加载器实例
 */
export function createRoutePreloader(
  strategy: PreloadStrategy = 'none'
): RoutePreloader {
  return new RoutePreloader(strategy)
}
