/**
 * 智能预加载器 - 基于使用模式预测和预加载数据
 */

export interface PreloadConfig {
  /** 是否启用预加载 */
  enabled: boolean
  /** 最大预加载项数 */
  maxPreloadItems: number
  /** 预加载阈值（访问频率） */
  preloadThreshold: number
  /** 预测算法 */
  algorithm: 'frequency' | 'recency' | 'combined'
  /** 预加载延迟 */
  preloadDelay: number
}

export interface AccessPattern {
  methodName: string
  params: unknown
  count: number
  lastAccess: number
  averageInterval: number
  nextPredicted?: number
}

/**
 * 智能预加载器
 */
export class SmartPreloader {
  private accessHistory = new Map<string, AccessPattern>()
  private preloadQueue = new Set<string>()
  private preloadTimer: ReturnType<typeof setTimeout> | null = null
  private config: Required<PreloadConfig>
  
  private stats = {
    totalAccesses: 0,
    preloadedItems: 0,
    hits: 0,
    misses: 0,
    predictions: 0,
    accuratePredictions: 0,
  }

  constructor(
    private executor: (methodName: string, params?: unknown) => Promise<any>,
    config: Partial<PreloadConfig> = {}
  ) {
    this.config = {
      enabled: true,
      maxPreloadItems: 50,
      preloadThreshold: 3,
      algorithm: 'combined',
      preloadDelay: 1000,
      ...config,
    }
  }

  /**
   * 记录访问模式
   */
  recordAccess(methodName: string, params?: unknown): void {
    if (!this.config.enabled) return

    const key = this.generateKey(methodName, params)
    const now = Date.now()
    
    this.stats.totalAccesses++

    const existing = this.accessHistory.get(key)
    if (existing) {
      // 更新访问模式
      const interval = now - existing.lastAccess
      existing.averageInterval = 
        (existing.averageInterval * existing.count + interval) / (existing.count + 1)
      existing.count++
      existing.lastAccess = now
      
      // 预测下次访问时间
      existing.nextPredicted = now + existing.averageInterval
      
      // 检查是否命中预测
      if (this.preloadQueue.has(key)) {
        this.stats.hits++
        this.stats.accuratePredictions++
        this.preloadQueue.delete(key)
      } else {
        this.stats.misses++
      }
    } else {
      // 创建新的访问模式
      this.accessHistory.set(key, {
        methodName,
        params,
        count: 1,
        lastAccess: now,
        averageInterval: 0,
      })
    }

    // 触发预加载分析
    this.schedulePreloadAnalysis()
  }

  /**
   * 调度预加载分析
   */
  private schedulePreloadAnalysis(): void {
    if (this.preloadTimer) {
      clearTimeout(this.preloadTimer)
    }

    this.preloadTimer = setTimeout(() => {
      this.analyzeAndPreload()
    }, this.config.preloadDelay)
  }

  /**
   * 分析访问模式并预加载
   */
  private async analyzeAndPreload(): Promise<void> {
    const candidates = this.getPredictionCandidates()
    
    // 预加载前N个候选项
    const toPreload = candidates.slice(0, this.config.maxPreloadItems)
    
    for (const pattern of toPreload) {
      const key = this.generateKey(pattern.methodName, pattern.params)
      
      if (!this.preloadQueue.has(key)) {
        this.preloadQueue.add(key)
        this.stats.predictions++
        
        // 异步预加载
        this.preloadItem(pattern.methodName, pattern.params).catch(() => {
          // 预加载失败，静默处理
          this.preloadQueue.delete(key)
        })
      }
    }
    
    this.stats.preloadedItems = this.preloadQueue.size
  }

  /**
   * 预加载单个项
   */
  private async preloadItem(methodName: string, params?: unknown): Promise<void> {
    try {
      await this.executor(methodName, params)
      this.stats.preloadedItems++
    } catch {
      // 忽略预加载错误
    }
  }

  /**
   * 获取预测候选项
   */
  private getPredictionCandidates(): AccessPattern[] {
    const now = Date.now()
    const patterns = Array.from(this.accessHistory.values())
    
    switch (this.config.algorithm) {
      case 'frequency':
        return this.getFrequencyBasedCandidates(patterns)
      
      case 'recency':
        return this.getRecencyBasedCandidates(patterns, now)
      
      case 'combined':
      default:
        return this.getCombinedCandidates(patterns, now)
    }
  }

  /**
   * 基于访问频率的候选项
   */
  private getFrequencyBasedCandidates(patterns: AccessPattern[]): AccessPattern[] {
    return patterns
      .filter(p => p.count >= this.config.preloadThreshold)
      .sort((a, b) => b.count - a.count)
  }

  /**
   * 基于最近访问的候选项
   */
  private getRecencyBasedCandidates(patterns: AccessPattern[], now: number): AccessPattern[] {
    return patterns
      .filter(p => {
        // 预测即将被访问的项
        if (p.nextPredicted) {
          const timeToPredicted = p.nextPredicted - now
          return timeToPredicted > 0 && timeToPredicted < 5000 // 5秒内
        }
        return false
      })
      .sort((a, b) => (a.nextPredicted || 0) - (b.nextPredicted || 0))
  }

  /**
   * 综合算法候选项
   */
  private getCombinedCandidates(patterns: AccessPattern[], now: number): AccessPattern[] {
    // 计算综合得分
    const scored = patterns.map(pattern => {
      let score = 0
      
      // 频率得分（权重 0.4）
      score += (pattern.count / 100) * 0.4
      
      // 最近访问得分（权重 0.3）
      const recencyScore = Math.max(0, 1 - (now - pattern.lastAccess) / (24 * 60 * 60 * 1000))
      score += recencyScore * 0.3
      
      // 预测准确性得分（权重 0.3）
      if (pattern.nextPredicted) {
        const timeToPredicted = Math.abs(pattern.nextPredicted - now)
        const predictScore = Math.max(0, 1 - timeToPredicted / (60 * 1000))
        score += predictScore * 0.3
      }
      
      return { pattern, score }
    })
    
    // 按得分排序
    return scored
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0.2) // 最小得分阈值
      .map(item => item.pattern)
  }

  /**
   * 生成缓存键
   */
  private generateKey(methodName: string, params?: unknown): string {
    return `${methodName}:${JSON.stringify(params || {})}`
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.totalAccesses > 0
        ? this.stats.hits / this.stats.totalAccesses
        : 0,
      predictionAccuracy: this.stats.predictions > 0
        ? this.stats.accuratePredictions / this.stats.predictions
        : 0,
      patternCount: this.accessHistory.size,
      queueSize: this.preloadQueue.size,
    }
  }

  /**
   * 清理历史数据
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    const toDelete: string[] = []
    
    for (const [key, pattern] of this.accessHistory) {
      if (now - pattern.lastAccess > maxAge) {
        toDelete.push(key)
      }
    }
    
    toDelete.forEach(key => this.accessHistory.delete(key))
  }

  /**
   * 重置预加载器
   */
  reset(): void {
    this.accessHistory.clear()
    this.preloadQueue.clear()
    if (this.preloadTimer) {
      clearTimeout(this.preloadTimer)
      this.preloadTimer = null
    }
    
    this.stats = {
      totalAccesses: 0,
      preloadedItems: 0,
      hits: 0,
      misses: 0,
      predictions: 0,
      accuratePredictions: 0,
    }
  }
}

/**
 * 缓存预热器
 */
export class CacheWarmer {
  private warmupQueue: Array<{
    methodName: string
    params?: unknown
    priority: number
  }> = []
  
  private isWarming = false
  private stats = {
    totalWarmed: 0,
    successfulWarms: 0,
    failedWarms: 0,
    warmupTime: 0,
  }

  constructor(
    private executor: (methodName: string, params?: unknown) => Promise<any>
  ) {}

  /**
   * 添加预热项
   */
  addWarmupItem(
    methodName: string,
    params?: unknown,
    priority: number = 0
  ): void {
    this.warmupQueue.push({ methodName, params, priority })
    
    // 按优先级排序
    this.warmupQueue.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 批量添加预热项
   */
  addBatchWarmupItems(
    items: Array<{
      methodName: string
      params?: unknown
      priority?: number
    }>
  ): void {
    items.forEach(item => {
      this.addWarmupItem(item.methodName, item.params, item.priority || 0)
    })
  }

  /**
   * 执行预热
   */
  async warm(options: {
    concurrent?: number
    onProgress?: (current: number, total: number) => void
  } = {}): Promise<void> {
    if (this.isWarming) {
      throw new Error('Warmup already in progress')
    }

    this.isWarming = true
    const startTime = Date.now()
    const concurrent = options.concurrent || 3
    const total = this.warmupQueue.length
    
    try {
      // 并发执行预热
      while (this.warmupQueue.length > 0) {
        const batch = this.warmupQueue.splice(0, concurrent)
        
        await Promise.all(
          batch.map(async item => {
            try {
              await this.executor(item.methodName, item.params)
              this.stats.successfulWarms++
            } catch {
              this.stats.failedWarms++
            }
            this.stats.totalWarmed++
            
            // 进度回调
            if (options.onProgress) {
              options.onProgress(this.stats.totalWarmed, total)
            }
          })
        )
      }
    } finally {
      this.isWarming = false
      this.stats.warmupTime = Date.now() - startTime
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalWarmed > 0
        ? this.stats.successfulWarms / this.stats.totalWarmed
        : 0,
      queueSize: this.warmupQueue.length,
      isWarming: this.isWarming,
    }
  }

  /**
   * 清空预热队列
   */
  clear(): void {
    this.warmupQueue = []
  }

  /**
   * 重置预热器
   */
  reset(): void {
    this.clear()
    this.isWarming = false
    this.stats = {
      totalWarmed: 0,
      successfulWarms: 0,
      failedWarms: 0,
      warmupTime: 0,
    }
  }
}