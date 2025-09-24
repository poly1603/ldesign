/**
 * 内存管理器
 * 
 * 管理I18n系统的内存使用，提供内存压力检测和自动清理功能
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { TimeUtils } from '../utils/common'

/**
 * 内存统计接口
 */
export interface MemoryStats {
  /** 总内存使用量（字节） */
  totalMemory: number
  /** 缓存内存使用量 */
  cacheMemory: number
  /** 翻译数据内存使用量 */
  translationMemory: number
  /** 其他内存使用量 */
  otherMemory: number
  /** 内存压力级别 (0-1) */
  pressureLevel: number
  /** 是否处于内存压力状态 */
  underPressure: boolean
}

/**
 * 内存配置接口
 */
export interface MemoryConfig {
  /** 最大内存限制（字节） */
  maxMemory: number
  /** 内存压力阈值 (0-1) */
  pressureThreshold: number
  /** 清理间隔（毫秒） */
  cleanupInterval: number
  /** 是否启用自动清理 */
  autoCleanup: boolean
  /** 紧急清理阈值 (0-1) */
  emergencyThreshold: number
  /** 清理策略 */
  cleanupStrategy: 'lru' | 'ttl' | 'frequency' | 'hybrid'
}

/**
 * 内存项接口
 */
interface MemoryItem {
  key: string
  size: number
  lastAccessed: number
  accessCount: number
  priority: number
  type: 'cache' | 'translation' | 'other'
}

/**
 * 清理结果接口
 */
interface CleanupResult {
  itemsRemoved: number
  memoryFreed: number
  duration: number
}

/**
 * 内存管理器类
 */
export class MemoryManager {
  private config: MemoryConfig
  private items = new Map<string, MemoryItem>()
  private stats: MemoryStats
  private cleanupTimer?: NodeJS.Timeout
  private lastCleanup = 0

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = {
      maxMemory: 100 * 1024 * 1024, // 100MB
      pressureThreshold: 0.8, // 80%
      cleanupInterval: 30 * 1000, // 30秒
      autoCleanup: true,
      emergencyThreshold: 0.95, // 95%
      cleanupStrategy: 'hybrid',
      ...config
    }

    this.stats = {
      totalMemory: 0,
      cacheMemory: 0,
      translationMemory: 0,
      otherMemory: 0,
      pressureLevel: 0,
      underPressure: false
    }

    if (this.config.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 注册内存项
   */
  registerItem(
    key: string,
    size: number,
    type: 'cache' | 'translation' | 'other' = 'other',
    priority: number = 1
  ): void {
    const now = TimeUtils.now()
    const existingItem = this.items.get(key)

    if (existingItem) {
      // 更新现有项
      this.updateStats(existingItem.size, -1, existingItem.type)
      existingItem.size = size
      existingItem.lastAccessed = now
      existingItem.accessCount++
      existingItem.priority = priority
      existingItem.type = type
    } else {
      // 添加新项
      this.items.set(key, {
        key,
        size,
        lastAccessed: now,
        accessCount: 1,
        priority,
        type
      })
    }

    this.updateStats(size, 1, type)
    this.checkMemoryPressure()
  }

  /**
   * 移除内存项
   */
  removeItem(key: string): boolean {
    const item = this.items.get(key)
    if (!item) return false

    this.items.delete(key)
    this.updateStats(item.size, -1, item.type)
    return true
  }

  /**
   * 访问内存项（更新访问统计）
   */
  accessItem(key: string): void {
    const item = this.items.get(key)
    if (!item) return

    item.lastAccessed = TimeUtils.now()
    item.accessCount++
  }

  /**
   * 获取内存统计
   */
  getStats(): MemoryStats {
    return { ...this.stats }
  }

  /**
   * 执行内存清理
   */
  cleanup(force: boolean = false): CleanupResult {
    const startTime = TimeUtils.now()
    let itemsRemoved = 0
    let memoryFreed = 0

    // 检查是否需要清理
    if (!force && !this.shouldCleanup()) {
      return { itemsRemoved: 0, memoryFreed: 0, duration: 0 }
    }

    const itemsToRemove = this.selectItemsForCleanup()

    for (const item of itemsToRemove) {
      if (this.removeItem(item.key)) {
        itemsRemoved++
        memoryFreed += item.size
      }
    }

    this.lastCleanup = startTime
    const duration = TimeUtils.now() - startTime

    return { itemsRemoved, memoryFreed, duration }
  }

  /**
   * 强制紧急清理
   */
  emergencyCleanup(): CleanupResult {
    // 紧急清理：移除所有非关键项
    const startTime = TimeUtils.now()
    let itemsRemoved = 0
    let memoryFreed = 0

    const itemsToRemove = Array.from(this.items.values())
      .filter(item => item.priority < 5) // 保留高优先级项
      .sort((a, b) => a.priority - b.priority) // 按优先级排序
      .slice(0, Math.floor(this.items.size * 0.5)) // 最多清理50%

    for (const item of itemsToRemove) {
      if (this.removeItem(item.key)) {
        itemsRemoved++
        memoryFreed += item.size
      }
    }

    const duration = TimeUtils.now() - startTime
    return { itemsRemoved, memoryFreed, duration }
  }

  /**
   * 获取内存使用报告
   */
  getMemoryReport(): {
    stats: MemoryStats
    topConsumers: Array<{ key: string; size: number; type: string }>
    recommendations: string[]
  } {
    const topConsumers = Array.from(this.items.values())
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(item => ({
        key: item.key,
        size: item.size,
        type: item.type
      }))

    const recommendations = this.generateRecommendations()

    return {
      stats: this.getStats(),
      topConsumers,
      recommendations
    }
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.items.clear()
    this.resetStats()
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    if (this.cleanupTimer) return

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * 更新统计信息
   */
  private updateStats(size: number, delta: number, type: 'cache' | 'translation' | 'other'): void {
    const change = size * delta

    this.stats.totalMemory += change

    switch (type) {
      case 'cache':
        this.stats.cacheMemory += change
        break
      case 'translation':
        this.stats.translationMemory += change
        break
      default:
        this.stats.otherMemory += change
        break
    }

    // 更新压力级别
    this.stats.pressureLevel = this.stats.totalMemory / this.config.maxMemory
    this.stats.underPressure = this.stats.pressureLevel > this.config.pressureThreshold
  }

  /**
   * 检查内存压力
   */
  private checkMemoryPressure(): void {
    if (this.stats.pressureLevel > this.config.emergencyThreshold) {
      // 紧急清理
      this.emergencyCleanup()
    } else if (this.stats.underPressure) {
      // 常规清理
      this.cleanup()
    }
  }

  /**
   * 判断是否需要清理
   */
  private shouldCleanup(): boolean {
    const timeSinceLastCleanup = TimeUtils.now() - this.lastCleanup
    return (
      this.stats.underPressure ||
      timeSinceLastCleanup > this.config.cleanupInterval * 2
    )
  }

  /**
   * 选择要清理的项目
   */
  private selectItemsForCleanup(): MemoryItem[] {
    const items = Array.from(this.items.values())
    const targetReduction = Math.max(
      this.stats.totalMemory * 0.1, // 至少清理10%
      this.stats.totalMemory - this.config.maxMemory * this.config.pressureThreshold
    )

    let selectedItems: MemoryItem[] = []
    let totalSize = 0

    switch (this.config.cleanupStrategy) {
      case 'lru':
        selectedItems = this.selectByLRU(items, targetReduction)
        break
      case 'ttl':
        selectedItems = this.selectByTTL(items, targetReduction)
        break
      case 'frequency':
        selectedItems = this.selectByFrequency(items, targetReduction)
        break
      case 'hybrid':
      default:
        selectedItems = this.selectByHybrid(items, targetReduction)
        break
    }

    return selectedItems
  }

  /**
   * 按LRU策略选择
   */
  private selectByLRU(items: MemoryItem[], targetSize: number): MemoryItem[] {
    const sorted = items.sort((a, b) => a.lastAccessed - b.lastAccessed)
    return this.selectUntilTarget(sorted, targetSize)
  }

  /**
   * 按TTL策略选择（选择最老的项）
   */
  private selectByTTL(items: MemoryItem[], targetSize: number): MemoryItem[] {
    const now = TimeUtils.now()
    const sorted = items.sort((a, b) => a.lastAccessed - b.lastAccessed)
    return this.selectUntilTarget(sorted, targetSize)
  }

  /**
   * 按访问频率策略选择
   */
  private selectByFrequency(items: MemoryItem[], targetSize: number): MemoryItem[] {
    const sorted = items.sort((a, b) => a.accessCount - b.accessCount)
    return this.selectUntilTarget(sorted, targetSize)
  }

  /**
   * 混合策略选择
   */
  private selectByHybrid(items: MemoryItem[], targetSize: number): MemoryItem[] {
    const now = TimeUtils.now()
    
    // 计算综合分数（越低越容易被清理）
    const scored = items.map(item => ({
      ...item,
      score: this.calculateHybridScore(item, now)
    }))

    const sorted = scored.sort((a, b) => a.score - b.score)
    return this.selectUntilTarget(sorted, targetSize)
  }

  /**
   * 计算混合分数
   */
  private calculateHybridScore(item: MemoryItem, now: number): number {
    const ageWeight = 0.3
    const frequencyWeight = 0.3
    const priorityWeight = 0.4

    const age = now - item.lastAccessed
    const normalizedAge = Math.min(age / (24 * 60 * 60 * 1000), 1) // 最大1天
    const normalizedFrequency = Math.min(item.accessCount / 100, 1) // 最大100次
    const normalizedPriority = item.priority / 10 // 假设最大优先级为10

    return (
      normalizedAge * ageWeight +
      (1 - normalizedFrequency) * frequencyWeight +
      (1 - normalizedPriority) * priorityWeight
    )
  }

  /**
   * 选择项目直到达到目标大小
   */
  private selectUntilTarget(items: MemoryItem[], targetSize: number): MemoryItem[] {
    const selected: MemoryItem[] = []
    let totalSize = 0

    for (const item of items) {
      if (totalSize >= targetSize) break
      selected.push(item)
      totalSize += item.size
    }

    return selected
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.stats.pressureLevel > 0.9) {
      recommendations.push('内存使用率过高，建议增加内存限制或减少缓存大小')
    }

    if (this.stats.cacheMemory / this.stats.totalMemory > 0.7) {
      recommendations.push('缓存占用内存过多，考虑调整缓存策略或减少缓存大小')
    }

    if (this.items.size > 10000) {
      recommendations.push('内存项数量过多，考虑增加清理频率或调整清理策略')
    }

    return recommendations
  }

  /**
   * 重置统计信息
   */
  private resetStats(): void {
    this.stats = {
      totalMemory: 0,
      cacheMemory: 0,
      translationMemory: 0,
      otherMemory: 0,
      pressureLevel: 0,
      underPressure: false
    }
  }
}

/**
 * 创建内存管理器实例
 */
export function createMemoryManager(config?: Partial<MemoryConfig>): MemoryManager {
  return new MemoryManager(config)
}
