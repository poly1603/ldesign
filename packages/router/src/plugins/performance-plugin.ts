import type { App } from 'vue'
import type { Router } from '../types'

/**
 * 性能监控配置
 */
export interface PerformanceConfig {
  /**
   * 是否启用性能监控
   */
  enabled?: boolean

  /**
   * 是否记录导航时间
   */
  trackNavigation?: boolean

  /**
   * 是否记录组件加载时间
   */
  trackComponentLoading?: boolean

  /**
   * 是否启用路由预加载
   */
  enablePreload?: boolean

  /**
   * 预加载策略
   */
  preloadStrategy?: 'hover' | 'visible' | 'idle'

  /**
   * 性能数据回调
   */
  onPerformanceData?: (data: PerformanceData) => void
}

/**
 * 性能数据接口
 */
export interface PerformanceData {
  type: 'navigation' | 'component-load' | 'preload'
  route: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

/**
 * 路由性能监控插件
 */
export class RouterPerformancePlugin {
  private config: Required<PerformanceConfig>
  private router: Router | null = null
  private navigationStartTime = 0
  private preloadCache = new Set<string>()

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      trackNavigation: true,
      trackComponentLoading: true,
      enablePreload: true,
      preloadStrategy: 'hover',
      onPerformanceData: () => {},
      ...config,
    }
  }

  /**
   * 安装插件
   */
  install(app: App): void {
    if (!this.config.enabled) return

    // 获取路由器实例
    const router = (app.config.globalProperties as any).$router as Router
    if (!router) {
      console.warn('RouterPerformancePlugin: Router not found')
      return
    }

    this.router = router
    this.setupNavigationTracking()
    this.setupPreloading()
  }

  /**
   * 设置导航跟踪
   */
  private setupNavigationTracking(): void {
    if (!this.router || !this.config.trackNavigation) return

    // 导航开始
    this.router.beforeEach(() => {
      this.navigationStartTime = performance.now()
      return true
    })

    // 导航结束
    this.router.afterEach((to, from) => {
      if (this.navigationStartTime > 0) {
        const duration = performance.now() - this.navigationStartTime
        this.reportPerformanceData({
          type: 'navigation',
          route: to.path,
          duration,
          timestamp: Date.now(),
          metadata: {
            from: from.path,
            name: to.name,
          },
        })
        this.navigationStartTime = 0
      }
    })
  }

  /**
   * 设置预加载
   */
  private setupPreloading(): void {
    if (!this.config.enablePreload) return

    // 监听路由链接的鼠标悬停事件
    if (this.config.preloadStrategy === 'hover') {
      this.setupHoverPreload()
    }
    // 监听路由链接进入视口
    else if (this.config.preloadStrategy === 'visible') {
      this.setupVisiblePreload()
    }
    // 在浏览器空闲时预加载
    else if (this.config.preloadStrategy === 'idle') {
      this.setupIdlePreload()
    }
  }

  /**
   * 设置悬停预加载
   */
  private setupHoverPreload(): void {
    document.addEventListener('mouseover', event => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      if (link && this.isInternalLink(link)) {
        this.preloadRoute(link.getAttribute('href')!)
      }
    })
  }

  /**
   * 设置可见预加载
   */
  private setupVisiblePreload(): void {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement
          if (this.isInternalLink(link)) {
            this.preloadRoute(link.getAttribute('href')!)
          }
        }
      })
    })

    // 观察所有路由链接
    const observeLinks = () => {
      document.querySelectorAll('a[href]').forEach(link => {
        if (this.isInternalLink(link as HTMLAnchorElement)) {
          observer.observe(link)
        }
      })
    }

    // 初始观察
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeLinks)
    } else {
      observeLinks()
    }

    // 监听DOM变化
    const mutationObserver = new MutationObserver(observeLinks)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  /**
   * 设置空闲预加载
   */
  private setupIdlePreload(): void {
    if ('requestIdleCallback' in window) {
      const preloadOnIdle = () => {
        window.requestIdleCallback(() => {
          document.querySelectorAll('a[href]').forEach(link => {
            const href = (link as HTMLAnchorElement).getAttribute('href')
            if (href && this.isInternalLink(link as HTMLAnchorElement)) {
              this.preloadRoute(href)
            }
          })
        })
      }

      if (document.readyState === 'complete') {
        preloadOnIdle()
      } else {
        window.addEventListener('load', preloadOnIdle)
      }
    }
  }

  /**
   * 预加载路由
   */
  private async preloadRoute(href: string): Promise<void> {
    if (!this.router || this.preloadCache.has(href)) return

    this.preloadCache.add(href)
    const startTime = performance.now()

    try {
      // 解析路由
      const route = this.router.resolve(href)

      // 预加载组件
      if (route.matched.length > 0) {
        const components = route.matched[0]?.components
        if (
          components &&
          components.default &&
          typeof components.default === 'function'
        ) {
          await components.default()
        }
      }

      const duration = performance.now() - startTime
      this.reportPerformanceData({
        type: 'preload',
        route: href,
        duration,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.warn(`Failed to preload route ${href}:`, error)
    }
  }

  /**
   * 检查是否为内部链接
   */
  private isInternalLink(link: HTMLAnchorElement): boolean {
    const href = link.getAttribute('href')
    if (!href) return false

    // 检查是否为相对路径或同域名
    return (
      href.startsWith('/') ||
      href.startsWith('./') ||
      href.startsWith('../') ||
      link.hostname === window.location.hostname
    )
  }

  /**
   * 报告性能数据
   */
  private reportPerformanceData(data: PerformanceData): void {
    this.config.onPerformanceData(data)

    // 在开发环境下输出到控制台
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'development'
    ) {
      // eslint-disable-next-line no-console
      console.log(
        `[Router Performance] ${data.type}: ${
          data.route
        } (${data.duration.toFixed(2)}ms)`
      )
    }
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    preloadCacheSize: number
    isEnabled: boolean
  } {
    return {
      preloadCacheSize: this.preloadCache.size,
      isEnabled: this.config.enabled,
    }
  }

  /**
   * 清除预加载缓存
   */
  clearPreloadCache(): void {
    this.preloadCache.clear()
  }
}

/**
 * 创建性能监控插件
 */
export function createPerformancePlugin(config?: Partial<PerformanceConfig>) {
  return new RouterPerformancePlugin(config)
}

export default RouterPerformancePlugin
