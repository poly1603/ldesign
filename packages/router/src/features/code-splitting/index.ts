/**
 * @ldesign/router 智能代码分割模块
 *
 * 提供智能的路由组件分割和按需加载功能
 */

import type { Component } from 'vue'
import type { RouteRecordRaw } from '../../types'

// ==================== 类型定义 ====================

/**
 * 代码分割策略
 */
export type SplittingStrategy = 'route' | 'module' | 'feature' | 'priority' | 'size'

/**
 * 分割优先级
 */
export type ChunkPriority = 'critical' | 'high' | 'normal' | 'low' | 'idle'

/**
 * 预加载策略
 */
export type PreloadStrategy = 'eager' | 'lazy' | 'hover' | 'visible' | 'predictive'

/**
 * 组件加载状态
 */
export interface ComponentLoadState {
  name: string
  status: 'pending' | 'loading' | 'loaded' | 'error'
  startTime?: number
  loadTime?: number
  error?: Error
  retries?: number
  size?: number
}

/**
 * 分割配置
 */
export interface SplittingConfig {
  /** 分割策略 */
  strategy: SplittingStrategy
  /** 块大小限制（KB） */
  maxChunkSize?: number
  /** 最小块大小（KB） */
  minChunkSize?: number
  /** 并行加载数量 */
  maxConcurrentLoads?: number
  /** 预加载策略 */
  preloadStrategy?: PreloadStrategy
  /** 缓存策略 */
  cacheStrategy?: 'memory' | 'storage' | 'both'
  /** 错误重试次数 */
  maxRetries?: number
  /** 重试延迟（ms） */
  retryDelay?: number
}

/**
 * 分割分析结果
 */
export interface SplittingAnalysis {
  /** 总组件数 */
  totalComponents: number
  /** 分割后的块数 */
  chunks: ChunkInfo[]
  /** 预估总大小（KB） */
  estimatedSize: number
  /** 推荐的优化建议 */
  suggestions: string[]
}

/**
 * 块信息
 */
export interface ChunkInfo {
  id: string
  name: string
  routes: string[]
  components: string[]
  priority: ChunkPriority
  estimatedSize: number
  dependencies: string[]
}

/**
 * 加载性能指标
 */
export interface LoadingMetrics {
  componentName: string
  loadTime: number
  cacheHit: boolean
  networkTime?: number
  parseTime?: number
  executeTime?: number
}

// ==================== 代码分割管理器 ====================

export class CodeSplittingManager {
  private config: SplittingConfig
  private loadStates: Map<string, ComponentLoadState>
  private componentCache: Map<string, Component>
  private metrics: LoadingMetrics[]
  private preloadQueue: Set<string>
  private loadingPromises: Map<string, Promise<Component>>
  private chunkMap: Map<string, ChunkInfo>
  private intersectionObserver?: IntersectionObserver

  constructor(config: SplittingConfig) {
    this.config = config
    this.loadStates = new Map()
    this.componentCache = new Map()
    this.metrics = []
    this.preloadQueue = new Set()
    this.loadingPromises = new Map()
    this.chunkMap = new Map()

    this.initializePreloadStrategy()
  }

  /**
   * 初始化预加载策略
   */
  private initializePreloadStrategy(): void {
    if (this.config?.preloadStrategy === 'visible') {
      this.setupIntersectionObserver()
    }
    else if (this.config?.preloadStrategy === 'predictive') {
      this.setupPredictivePreloading()
    }
  }

  /**
   * 设置可见性观察器
   */
  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const routeName = entry.target.getAttribute('data-route')
              if (routeName) {
                this.preloadComponent(routeName)
              }
            }
          })
        },
        { rootMargin: '50px' },
      )
    }
  }

  /**
   * 设置预测性预加载
   */
  private setupPredictivePreloading(): void {
    // 基于用户行为模式预测
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement
        const link = target.closest('[data-route]')
        if (link) {
          const routeName = link.getAttribute('data-route')
          if (routeName) {
            this.preloadComponent(routeName, 'hover')
          }
        }
      })
    }
  }

  /**
   * 创建智能分割的路由
   */
  public createSplitRoute(route: RouteRecordRaw): RouteRecordRaw {
    if (!route.component || typeof route.component !== 'function') {
      return route
    }

    const originalComponent = route.component as () => Promise<Component>
    const componentName = route.name?.toString() || route.path

    // 包装组件加载器
    const splitComponent = () => {
      return this.loadComponent(componentName, originalComponent)
    }

    return {
      ...route,
      component: splitComponent,
    }
  }

  /**
   * 加载组件
   */
  private async loadComponent(
    name: string,
    loader: () => Promise<Component>,
  ): Promise<Component> {
    // 检查缓存
    if (this.componentCache.has(name)) {
      this.recordMetrics(name, 0, true)
      return this.componentCache.get(name)!
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!
    }

    // 开始加载
    const loadPromise = this.performLoad(name, loader)
    this.loadingPromises.set(name, loadPromise)

    try {
      const component = await loadPromise
      this.loadingPromises.delete(name)
      return component
    }
    catch (error) {
      this.loadingPromises.delete(name)
      throw error
    }
  }

  /**
   * 执行加载
   */
  private async performLoad(
    name: string,
    loader: () => Promise<Component>,
  ): Promise<Component> {
    const startTime = performance.now()
    let retries = 0

    this.updateLoadState(name, {
      name,
      status: 'loading',
      startTime,
      retries: 0,
    })

    while (retries <= (this.config?.maxRetries || 3)) {
      try {
        const component = await loader()
        const loadTime = performance.now() - startTime

        this.updateLoadState(name, {
          name,
          status: 'loaded',
          loadTime,
        })

        // 缓存组件
        if (this.config?.cacheStrategy !== 'storage') {
          this.componentCache.set(name, component)
        }

        this.recordMetrics(name, loadTime, false)
        return component
      }
      catch (error) {
        retries++

        if (retries > (this.config?.maxRetries || 3)) {
          this.updateLoadState(name, {
            name,
            status: 'error',
            error: error as Error,
            retries,
          })
          throw error
        }

        // 重试延迟
        await this.delay(this.config?.retryDelay || 1000 * retries)
      }
    }

    throw new Error(`Failed to load component: ${name}`)
  }

  /**
   * 预加载组件
   */
  public async preloadComponent(
    name: string,
    _trigger?: 'hover' | 'visible' | 'manual',
  ): Promise<void> {
    if (this.componentCache.has(name) || this.preloadQueue.has(name)) {
      return
    }

    this.preloadQueue.add(name)

    // 根据优先级决定加载时机
    const chunkInfo = this.chunkMap.get(name)
    const priority = chunkInfo?.priority || 'normal'

    if (priority === 'critical') {
      // 立即加载
      await this.loadComponentByName(name)
    }
    else if (priority === 'high') {
      // 空闲时加载
      this.requestIdleLoad(name)
    }
    else {
      // 延迟加载
      setTimeout(() => this.loadComponentByName(name), 5000)
    }
  }

  /**
   * 按名称加载组件
   */
  private async loadComponentByName(_name: string): Promise<void> {
    // 这里需要维护一个名称到加载器的映射
    // 实际实现时需要在路由注册时建立这个映射
  }

  /**
   * 请求空闲加载
   */
  private requestIdleLoad(name: string): void {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.loadComponentByName(name)
      })
    }
    else {
      setTimeout(() => this.loadComponentByName(name), 2000)
    }
  }

  /**
   * 分析路由分割情况
   */
  public analyzeRoutes(routes: RouteRecordRaw[]): SplittingAnalysis {
    const chunks: ChunkInfo[] = []
    let totalComponents = 0
    let estimatedSize = 0

    const analyzeRoute = (route: RouteRecordRaw, depth = 0) => {
      if (route.component) {
        totalComponents++

        const chunkId = this.generateChunkId(route)
        const priority = this.determinePriority(route, depth)
        const size = this.estimateComponentSize(route)

        estimatedSize += size

        chunks.push({
          id: chunkId,
          name: route.name?.toString() || route.path,
          routes: [route.path],
          components: [route.name?.toString() || 'unnamed'],
          priority,
          estimatedSize: size,
          dependencies: [],
        })
      }

      if (route.children) {
        route.children.forEach(child => analyzeRoute(child, depth + 1))
      }
    }

    routes.forEach(route => analyzeRoute(route))

    // 生成优化建议
    const suggestions = this.generateSuggestions(chunks, estimatedSize)

    return {
      totalComponents,
      chunks,
      estimatedSize,
      suggestions,
    }
  }

  /**
   * 生成块ID
   */
  private generateChunkId(route: RouteRecordRaw): string {
    const strategy = this.config?.strategy

    switch (strategy) {
      case 'route':
        return `route-${route.name ? String(route.name) : route.path.replace(/\//g, '-')}`
      case 'module':
        return `module-${this.extractModuleName(route.path)}`
      case 'feature':
        return `feature-${this.extractFeatureName(route.path)}`
      default:
        return `chunk-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  /**
   * 提取模块名
   */
  private extractModuleName(path: string): string {
    const segments = path.split('/')
    return segments[1] || 'root'
  }

  /**
   * 提取功能名
   */
  private extractFeatureName(path: string): string {
    const segments = path.split('/')
    return segments.slice(1, 3).join('-') || 'main'
  }

  /**
   * 确定优先级
   */
  private determinePriority(route: RouteRecordRaw, depth: number): ChunkPriority {
    // 根据路由深度和元信息确定优先级
    if (depth === 0)
      return 'critical'
    if (route.meta?.priority)
      return route.meta.priority as ChunkPriority
    if (depth === 1)
      return 'high'
    if (depth === 2)
      return 'normal'
    return 'low'
  }

  /**
   * 估算组件大小
   */
  private estimateComponentSize(route: RouteRecordRaw): number {
    // 基于路由配置估算组件大小
    // 实际实现时可以通过构建工具获取真实大小
    let baseSize = 10 // 基础大小 10KB

    if (route.children?.length) {
      baseSize += route.children.length * 5
    }

    if (route.components) {
      baseSize += Object.keys(route.components).length * 8
    }

    return baseSize
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(chunks: ChunkInfo[], totalSize: number): string[] {
    const suggestions: string[] = []

    // 检查块大小
    chunks.forEach((chunk) => {
      if (chunk.estimatedSize > (this.config?.maxChunkSize || 244)) {
        suggestions.push(`块 ${chunk.name} 过大 (${chunk.estimatedSize}KB)，建议进一步分割`)
      }
      if (chunk.estimatedSize < (this.config?.minChunkSize || 10)) {
        suggestions.push(`块 ${chunk.name} 过小 (${chunk.estimatedSize}KB)，建议与其他块合并`)
      }
    })

    // 检查关键路径
    const criticalChunks = chunks.filter(c => c.priority === 'critical')
    if (criticalChunks.length > 5) {
      suggestions.push('关键块过多，建议优化首屏加载策略')
    }

    // 检查总大小
    if (totalSize > 1024) {
      suggestions.push(`应用总大小过大 (${totalSize}KB)，建议启用更激进的代码分割`)
    }

    // 检查依赖关系
    const hasCircularDeps = this.checkCircularDependencies(chunks)
    if (hasCircularDeps) {
      suggestions.push('检测到循环依赖，建议重构组件结构')
    }

    return suggestions
  }

  /**
   * 检查循环依赖
   */
  private checkCircularDependencies(chunks: ChunkInfo[]): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (chunkId: string): boolean => {
      visited.add(chunkId)
      recursionStack.add(chunkId)

      const chunk = chunks.find(c => c.id === chunkId)
      if (chunk) {
        for (const dep of chunk.dependencies) {
          if (!visited.has(dep)) {
            if (hasCycle(dep))
              return true
          }
          else if (recursionStack.has(dep)) {
            return true
          }
        }
      }

      recursionStack.delete(chunkId)
      return false
    }

    for (const chunk of chunks) {
      if (!visited.has(chunk.id)) {
        if (hasCycle(chunk.id))
          return true
      }
    }

    return false
  }

  /**
   * 更新加载状态
   */
  private updateLoadState(name: string, state: ComponentLoadState): void {
    this.loadStates.set(name, state)
  }

  /**
   * 记录性能指标
   */
  private recordMetrics(name: string, loadTime: number, cacheHit: boolean): void {
    this.metrics.push({
      componentName: name,
      loadTime,
      cacheHit,
    })

    // 保持指标数量在合理范围内
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取加载统计
   */
  public getLoadStatistics(): {
    totalLoaded: number
    totalCached: number
    averageLoadTime: number
    cacheHitRate: number
    failureRate: number
  } {
    const loaded = Array.from(this.loadStates.values())
    const totalLoaded = loaded.filter(s => s.status === 'loaded').length
    const totalFailed = loaded.filter(s => s.status === 'error').length
    const totalCached = this.componentCache.size

    const loadTimes = this.metrics.filter(m => !m.cacheHit).map(m => m.loadTime)
    const averageLoadTime = loadTimes.length
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      : 0

    const cacheHits = this.metrics.filter(m => m.cacheHit).length
    const cacheHitRate = this.metrics.length
      ? cacheHits / this.metrics.length
      : 0

    const failureRate = loaded.length
      ? totalFailed / loaded.length
      : 0

    return {
      totalLoaded,
      totalCached,
      averageLoadTime,
      cacheHitRate,
      failureRate,
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.intersectionObserver?.disconnect()
    this.loadStates.clear()
    this.componentCache.clear()
    this.metrics = []
    this.preloadQueue.clear()
    this.loadingPromises.clear()
    this.chunkMap.clear()
  }
}

// ==================== 导出工厂函数 ====================

/**
 * 创建代码分割管理器
 */
export function createCodeSplittingManager(
  config?: Partial<SplittingConfig>,
): CodeSplittingManager {
  const defaultConfig: SplittingConfig = {
    strategy: 'route',
    maxChunkSize: 244,
    minChunkSize: 10,
    maxConcurrentLoads: 3,
    preloadStrategy: 'lazy',
    cacheStrategy: 'memory',
    maxRetries: 3,
    retryDelay: 1000,
  }

  return new CodeSplittingManager({
    ...defaultConfig,
    ...config,
  })
}

// ==================== Vue 集成 ====================

/**
 * 代码分割插件
 */
export const CodeSplittingPlugin = {
  install(app: any, options?: Partial<SplittingConfig>) {
    const manager = createCodeSplittingManager(options)

    app.provide('codeSplittingManager', manager)

    app.config.globalProperties.$codeSplitting = manager

    // 在应用卸载时清理
    app.unmount = new Proxy(app.unmount, {
      apply(target, thisArg, argArray) {
        manager.dispose()
        return Reflect.apply(target, thisArg, argArray)
      },
    })
  },
}
