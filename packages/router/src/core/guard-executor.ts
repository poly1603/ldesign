/**
 * @ldesign/router 守卫执行器
 * 
 * 支持依赖分析、并行执行、智能跳过和优先级队列
 */

import type {
  NavigationGuard,
  NavigationGuardReturn,
  RouteLocationNormalized,
} from '../types'

/**
 * 守卫元数据
 */
interface GuardMetadata {
  guard: NavigationGuard
  id: string
  priority: number
  dependencies: string[]
  cacheable: boolean
  skipCondition?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean
}

/**
 * 守卫执行结果
 */
interface GuardExecutionResult {
  guardId: string
  result: NavigationGuardReturn
  duration: number
  cached: boolean
}

/**
 * 守卫依赖图节点
 */
interface DependencyNode {
  id: string
  metadata: GuardMetadata
  dependents: Set<string>
  dependencies: Set<string>
  executed: boolean
  result?: NavigationGuardReturn
}

/**
 * 优化的守卫执行器
 */
export class GuardExecutor {
  private guards: Map<string, GuardMetadata> = new Map()
  private dependencyGraph: Map<string, DependencyNode> = new Map()
  private resultCache: Map<string, { result: NavigationGuardReturn; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5000 // 5秒缓存

  // 性能统计
  private stats = {
    totalExecutions: 0,
    parallelExecutions: 0,
    cacheHits: 0,
    skipped: 0,
    averageDuration: 0,
  }

  /**
   * 注册守卫
   */
  registerGuard(metadata: GuardMetadata): void {
    this.guards.set(metadata.id, metadata)
    this.rebuildDependencyGraph()
  }

  /**
   * 批量注册守卫
   */
  registerGuards(metadatas: GuardMetadata[]): void {
    for (const metadata of metadatas) {
      this.guards.set(metadata.id, metadata)
    }
    this.rebuildDependencyGraph()
  }

  /**
   * 移除守卫
   */
  unregisterGuard(id: string): void {
    this.guards.delete(id)
    this.rebuildDependencyGraph()
  }

  /**
   * 执行所有守卫（优化版）
   */
  async executeAll(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    const startTime = performance.now()
    this.stats.totalExecutions++

    // 检测路由变化并智能跳过
    const guardsToExecute = this.filterGuardsToExecute(to, from)

    if (guardsToExecute.length === 0) {
      return undefined
    }

    // 构建执行计划（基于依赖和优先级）
    const executionPlan = this.buildExecutionPlan(guardsToExecute)

    // 执行守卫
    const results: GuardExecutionResult[] = []

    for (const batch of executionPlan) {
      // 并行执行无依赖的守卫
      const batchResults = await this.executeBatch(batch, to, from)
      results.push(...batchResults)

      // 检查是否有守卫返回了中断导航的结果
      const abortResult = batchResults.find(r =>
        r.result === false ||
        (r.result && typeof r.result !== 'boolean')
      )

      if (abortResult) {
        this.updateStats(results, startTime)
        return abortResult.result
      }
    }

    this.updateStats(results, startTime)
    return undefined
  }

  /**
   * 过滤需要执行的守卫
   */
  private filterGuardsToExecute(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): GuardMetadata[] {
    const result: GuardMetadata[] = []

    for (const metadata of this.guards.values()) {
      // 检查是否可以跳过
      if (metadata.skipCondition && metadata.skipCondition(to, from)) {
        this.stats.skipped++
        continue
      }

      // 检查缓存
      if (metadata.cacheable) {
        const cacheKey = this.getCacheKey(metadata.id, to, from)
        const cached = this.resultCache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          this.stats.cacheHits++
          continue
        }
      }

      result.push(metadata)
    }

    return result
  }

  /**
   * 构建执行计划（按依赖和优先级分批）
   */
  private buildExecutionPlan(guards: GuardMetadata[]): GuardMetadata[][] {
    const plan: GuardMetadata[][] = []
    const remaining = new Set(guards.map(g => g.id))
    const executed = new Set<string>()

    while (remaining.size > 0) {
      const batch: GuardMetadata[] = []

      for (const guardId of remaining) {
        const metadata = this.guards.get(guardId)!
        const node = this.dependencyGraph.get(guardId)

        // 检查依赖是否都已执行
        const dependenciesMet = !node ||
          Array.from(node.dependencies).every(dep => executed.has(dep))

        if (dependenciesMet) {
          batch.push(metadata)
        }
      }

      if (batch.length === 0) {
        // 检测到循环依赖，打破循环
        const first = Array.from(remaining)[0]
        const metadata = this.guards.get(first)!
        batch.push(metadata)
      }

      // 按优先级排序
      batch.sort((a, b) => b.priority - a.priority)

      for (const guard of batch) {
        remaining.delete(guard.id)
        executed.add(guard.id)
      }

      plan.push(batch)
    }

    return plan
  }

  /**
   * 并行执行一批守卫
   */
  private async executeBatch(
    batch: GuardMetadata[],
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<GuardExecutionResult[]> {
    if (batch.length > 1) {
      this.stats.parallelExecutions++
    }

    const promises = batch.map(metadata =>
      this.executeGuard(metadata, to, from)
    )

    return Promise.all(promises)
  }

  /**
   * 执行单个守卫
   */
  private async executeGuard(
    metadata: GuardMetadata,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<GuardExecutionResult> {
    const startTime = performance.now()

    try {
      const result = await this.runGuard(metadata.guard, to, from)

      // 缓存结果
      if (metadata.cacheable) {
        const cacheKey = this.getCacheKey(metadata.id, to, from)
        this.resultCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        })
      }

      return {
        guardId: metadata.id,
        result,
        duration: performance.now() - startTime,
        cached: false,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 运行守卫（带超时和重试）
   */
  private async runGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    return new Promise((resolve, reject) => {
      let resolved = false

      const next = (result?: NavigationGuardReturn) => {
        if (resolved) return
        resolved = true

        if (result === false) {
          resolve(false)
        } else if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      }

      // 设置超时
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          reject(new Error(`Guard timeout: ${guard.name || 'anonymous'}`))
        }
      }, 3000)

      try {
        const guardResult = guard(to, from, next)

        // 处理Promise返回
        if (guardResult && typeof guardResult === 'object' && 'then' in guardResult) {
          (guardResult as Promise<NavigationGuardReturn>).then(
            result => {
              clearTimeout(timeout)
              if (!resolved) {
                resolved = true
                resolve(result)
              }
            },
            error => {
              clearTimeout(timeout)
              if (!resolved) {
                resolved = true
                reject(error)
              }
            }
          )
        } else {
          clearTimeout(timeout)
        }
      } catch (error) {
        clearTimeout(timeout)
        if (!resolved) {
          resolved = true
          reject(error)
        }
      }
    })
  }

  /**
   * 重建依赖图
   */
  private rebuildDependencyGraph(): void {
    this.dependencyGraph.clear()

    // 创建节点
    for (const [id, metadata] of this.guards) {
      this.dependencyGraph.set(id, {
        id,
        metadata,
        dependents: new Set(),
        dependencies: new Set(metadata.dependencies),
        executed: false,
      })
    }

    // 建立依赖关系
    for (const node of this.dependencyGraph.values()) {
      for (const depId of node.dependencies) {
        const depNode = this.dependencyGraph.get(depId)
        if (depNode) {
          depNode.dependents.add(node.id)
        }
      }
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(
    guardId: string,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): string {
    return `${guardId}_${to.path}_${from.path}`
  }

  /**
   * 更新统计信息
   */
  private updateStats(results: GuardExecutionResult[], startTime: number): void {
    const totalDuration = performance.now() - startTime
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length

    this.stats.averageDuration =
      (this.stats.averageDuration * (this.stats.totalExecutions - 1) + avgDuration) /
      this.stats.totalExecutions
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      registeredGuards: this.guards.size,
      cacheSize: this.resultCache.size,
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.resultCache.clear()
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalExecutions: 0,
      parallelExecutions: 0,
      cacheHits: 0,
      skipped: 0,
      averageDuration: 0,
    }
  }
}

/**
 * 创建守卫元数据的辅助函数
 */
export function createGuardMetadata(
  guard: NavigationGuard,
  options: {
    id?: string
    priority?: number
    dependencies?: string[]
    cacheable?: boolean
    skipCondition?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean
  } = {}
): GuardMetadata {
  return {
    guard,
    id: options.id || guard.name || `guard_${Date.now()}_${Math.random()}`,
    priority: options.priority ?? 0,
    dependencies: options.dependencies || [],
    cacheable: options.cacheable ?? false,
    skipCondition: options.skipCondition,
  }
}

/**
 * 常用的跳过条件
 */
export const commonSkipConditions = {
  // 当路径相同时跳过
  samePath: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
    to.path === from.path,

  // 当查询参数相同时跳过
  sameQuery: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
    JSON.stringify(to.query) === JSON.stringify(from.query),

  // 当参数相同时跳过
  sameParams: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
    JSON.stringify(to.params) === JSON.stringify(from.params),

  // 组合条件
  sameRoute: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
    to.path === from.path &&
    JSON.stringify(to.query) === JSON.stringify(from.query) &&
    JSON.stringify(to.params) === JSON.stringify(from.params),
}

