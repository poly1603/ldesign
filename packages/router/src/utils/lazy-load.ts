/**
 * 路由懒加载工具模块
 * 提供代码分割和按需加载功能
 */

import type { Component } from 'vue'
import type { RouteComponent, RouteRecordRaw } from '../types'

/**
 * 懒加载配置选项
 */
export interface LazyLoadOptions {
  /** 加载时显示的组件 */
  loading?: Component
  /** 加载失败时显示的组件 */
  error?: Component
  /** 延迟显示加载组件的时间（毫秒） */
  delay?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 预取策略 */
  prefetch?: boolean | 'hover' | 'visible'
  /** 预加载策略 */
  preload?: boolean
}

/**
 * 组件加载状态
 */
interface LoadingState {
  isLoading: boolean
  error: Error | null
  retryCount: number
}

/**
 * 创建懒加载组件
 * @param loader 组件加载函数
 * @param options 懒加载选项
 */
export function lazyLoadComponent(
  loader: () => Promise<any>,
  options: LazyLoadOptions = {}
): RouteComponent {
  const {
    loading,
    error,
    delay = 200,
    timeout = 15000, // 优化：减少超时时间从30秒到15秒
    retries = 2, // 优化：减少重试次数从3次到2次
    retryDelay = 1000,
    prefetch = false,
    preload = false,
  } = options

  let component: Component | null = null
  let loadPromise: Promise<Component> | null = null
  const state: LoadingState = {
    isLoading: false,
    error: null,
    retryCount: 0,
  }

  // 重试加载逻辑
  const loadWithRetry = async (): Promise<Component> => {
    while (state.retryCount <= retries) {
      try {
        const module = await Promise.race([
          loader(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Loading timeout')), timeout)
          ),
        ])

        // 处理各种模块格式
        component = module.default || module
        state.error = null
        state.isLoading = false
        return component!
      } catch (err) {
        state.error = err as Error
        state.retryCount++

        if (state.retryCount > retries) {
          state.isLoading = false
          throw err
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    throw state.error
  }

  // 主加载函数
  const load = async (): Promise<Component> => {
    if (component) return component
    if (loadPromise) return loadPromise

    state.isLoading = true
    state.retryCount = 0
    loadPromise = loadWithRetry()

    return loadPromise
  }

  // 预取逻辑
  if (prefetch === true) {
    // 在浏览器空闲时预取
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => load())
    } else {
      setTimeout(() => load(), 1000)
    }
  }

  // 预加载逻辑
  if (preload) {
    load()
  }

  // 返回异步组件定义
  return () => ({
    loader: load,
    loadingComponent: loading,
    errorComponent: error,
    delay,
    timeout,
  })
}

/**
 * 为路由配置添加懒加载
 * @param routes 路由配置数组
 * @param options 全局懒加载选项
 */
export function lazyLoadRoutes(
  routes: RouteRecordRaw[],
  options: LazyLoadOptions = {}
): RouteRecordRaw[] {
  return routes.map(route => {
    const processedRoute = { ...route }

    // 处理组件懒加载
    if (route.component && typeof route.component === 'function') {
      const loader = route.component as () => Promise<any>
      const metaOptions = route.meta?.lazyLoadOptions as LazyLoadOptions | undefined
      processedRoute.component = lazyLoadComponent(loader, {
        ...options,
        ...metaOptions,
      })
    }

    // 处理命名视图组件
    if (route.components) {
      processedRoute.components = {}
      for (const [name, comp] of Object.entries(route.components)) {
        if (typeof comp === 'function') {
          const metaOptions = route.meta?.lazyLoadOptions as LazyLoadOptions | undefined
          processedRoute.components[name] = lazyLoadComponent(
            comp as () => Promise<any>,
            {
              ...options,
              ...metaOptions,
            }
          )
        } else {
          processedRoute.components[name] = comp
        }
      }
    }

    // 递归处理子路由
    if (route.children) {
      processedRoute.children = lazyLoadRoutes(route.children, options)
    }

    return processedRoute
  })
}

/**
 * 创建代码分割点
 * @param chunkName 分割点名称
 * @param loader 组件加载函数
 */
export function splitChunk(
  chunkName: string,
  loader: () => Promise<any>
): () => Promise<any> {
  return () =>
    import(/* @vite-ignore */ /* webpackChunkName: "[request]" */ `${chunkName}`).then(
      () => loader()
    )
}

/**
 * 批量预加载路由组件
 * @param routes 要预加载的路由名称或路径
 * @param router 路由器实例
 */
export async function preloadRoutes(
  routes: string[],
  router: any
): Promise<void> {
  const promises = routes.map(async route => {
    const resolved = router.resolve(route)
    if (resolved && resolved.matched.length > 0) {
      const components = resolved.matched
        .map((record: any) => record.components?.default)
        .filter((comp: any) => typeof comp === 'function')

      await Promise.all(
        components.map((comp: any) => comp())
      )
    }
  })

  await Promise.all(promises)
}

/**
 * 基于 IntersectionObserver 的可见性预加载
 * @param element 目标元素
 * @param loader 组件加载函数
 * @param options 观察器选项
 */
export function visibilityPreload(
  element: HTMLElement,
  loader: () => Promise<any>,
  options: IntersectionObserverInit = {}
): () => void {
  if (!('IntersectionObserver' in window)) {
    return () => { }
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loader()
          observer.disconnect()
        }
      })
    },
    {
      rootMargin: '50px',
      ...options,
    }
  )

  observer.observe(element)

  // 返回清理函数
  return () => observer.disconnect()
}

/**
 * 基于鼠标悬停的预加载
 * @param element 目标元素
 * @param loader 组件加载函数
 * @param delay 延迟时间（毫秒）
 */
export function hoverPreload(
  element: HTMLElement,
  loader: () => Promise<any>,
  delay = 100
): () => void {
  let timeoutId: ReturnType<typeof setTimeout>

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => loader(), delay)
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }

  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  // 返回清理函数
  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

/**
 * 智能预加载策略
 * 根据网络状态和设备性能自动调整预加载策略
 */
export class SmartPreloader {
  private static instance: SmartPreloader
  private networkType: string = 'unknown'
  private deviceMemory: number = 4
  private hardwareConcurrency: number = 2

  private constructor() {
    this.detectCapabilities()
  }

  static getInstance(): SmartPreloader {
    if (!SmartPreloader.instance) {
      SmartPreloader.instance = new SmartPreloader()
    }
    return SmartPreloader.instance
  }

  private detectCapabilities(): void {
    // 检测网络类型
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.networkType = connection?.effectiveType || 'unknown'

      connection?.addEventListener('change', () => {
        this.networkType = connection.effectiveType || 'unknown'
      })
    }

    // 检测设备内存
    if ('deviceMemory' in navigator) {
      this.deviceMemory = (navigator as any).deviceMemory || 4
    }

    // 检测 CPU 核心数
    if ('hardwareConcurrency' in navigator) {
      this.hardwareConcurrency = navigator.hardwareConcurrency || 2
    }
  }

  /**
   * 判断是否应该预加载
   */
  shouldPreload(): boolean {
    // 低速网络不预加载
    if (['slow-2g', '2g'].includes(this.networkType)) {
      return false
    }

    // 低内存设备限制预加载
    if (this.deviceMemory < 2) {
      return false
    }

    // 单核设备限制预加载
    if (this.hardwareConcurrency < 2) {
      return false
    }

    return true
  }

  /**
   * 获取推荐的预加载策略
   */
  getRecommendedStrategy(): 'aggressive' | 'moderate' | 'conservative' {
    if (!this.shouldPreload()) {
      return 'conservative'
    }

    // 高性能设备和快速网络
    if (
      this.networkType === '4g' &&
      this.deviceMemory >= 8 &&
      this.hardwareConcurrency >= 4
    ) {
      return 'aggressive'
    }

    // 中等性能
    if (
      ['3g', '4g'].includes(this.networkType) &&
      this.deviceMemory >= 4
    ) {
      return 'moderate'
    }

    return 'conservative'
  }

  /**
   * 获取推荐的并发加载数
   */
  getRecommendedConcurrency(): number {
    const strategy = this.getRecommendedStrategy()

    switch (strategy) {
      case 'aggressive':
        return Math.min(6, this.hardwareConcurrency)
      case 'moderate':
        return Math.min(3, Math.floor(this.hardwareConcurrency / 2))
      case 'conservative':
        return 1
      default:
        return 2
    }
  }
}

/**
 * 创建优化的路由配置
 * 自动应用最佳实践
 */
export function optimizeRoutes(
  routes: RouteRecordRaw[],
  options: {
    enableLazyLoad?: boolean
    enablePrefetch?: boolean
    enableSmartPreload?: boolean
  } = {}
): RouteRecordRaw[] {
  const {
    enableLazyLoad = true,
    enablePrefetch = true,
    enableSmartPreload = true,
  } = options

  const smartPreloader = enableSmartPreload
    ? SmartPreloader.getInstance()
    : null

  const shouldPrefetch = smartPreloader
    ? smartPreloader.shouldPreload() && enablePrefetch
    : enablePrefetch

  if (!enableLazyLoad) {
    return routes
  }

  return lazyLoadRoutes(routes, {
    prefetch: shouldPrefetch,
    preload: false,
    retries: 3,
    retryDelay: 1000,
    timeout: 30000,
  })
}
