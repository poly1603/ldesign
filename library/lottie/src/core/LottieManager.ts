import type {
  ILottieInstance,
  LottieConfig,
  LottieManagerConfig,
  GlobalPerformanceStats,
  PoolStats
} from '../types'
import { LottieInstance } from './LottieInstance'
import { InstancePool } from './InstancePool'
import { CacheManager } from './CacheManager'
import { DeviceDetector, getRecommendedConfig, type DeviceInfo } from '../utils/device'

/**
 * Lottie 管理器 - 全局单例
 */
export class LottieManager {
  private static instance: LottieManager | null = null
  private config: Required<LottieManagerConfig>
  private instancePool: InstancePool
  private cacheManager: CacheManager
  private instances: Map<string, ILottieInstance> = new Map()
  private deviceDetector: DeviceDetector

  private constructor(config?: LottieManagerConfig) {
    this.config = this.normalizeConfig(config)
    this.deviceDetector = DeviceDetector.getInstance()
    this.instancePool = new InstancePool(this.config.poolSize)
    this.cacheManager = new CacheManager(
      this.config.cache.maxSize,
      this.config.cache.ttl
    )

    // 定期清理过期缓存
    if (this.config.cache.enabled) {
      setInterval(() => {
        this.cacheManager.cleanExpired()
      }, 60000) // 每分钟清理一次
    }

    // 监听窗口大小变化，自动优化低性能设备
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize.bind(this))
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: LottieManagerConfig): LottieManager {
    if (!LottieManager.instance) {
      LottieManager.instance = new LottieManager(config)
    }
    return LottieManager.instance
  }

  /**
   * 重置单例（主要用于测试）
   */
  static reset(): void {
    if (LottieManager.instance) {
      LottieManager.instance.destroyAll()
      LottieManager.instance = null
    }
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config?: LottieManagerConfig): Required<LottieManagerConfig> {
    // 获取设备推荐配置
    const recommended = getRecommendedConfig()
    
    return {
      maxInstances: config?.maxInstances ?? 100,
      defaultRenderer: config?.defaultRenderer ?? recommended.renderer,
      enableInstancePool: config?.enableInstancePool ?? true,
      poolSize: config?.poolSize ?? 50,
      enableGlobalPerformanceMonitor: config?.enableGlobalPerformanceMonitor ?? recommended.enableMonitoring,
      cache: {
        enabled: config?.cache?.enabled ?? true,
        maxSize: config?.cache?.maxSize ?? 50,
        ttl: config?.cache?.ttl ?? 3600000,
      },
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    const deviceInfo = this.deviceDetector.getInfo()
    
    // 如果是低性能设备或移动设备，在窗口变化时暂停所有动画
    if (deviceInfo.performanceTier === 'low' || deviceInfo.isMobile) {
      const activeInstances = Array.from(this.instances.values())
        .filter(i => i.state === 'playing')
      
      // 暂停所有动画，等待 resize 完成
      activeInstances.forEach(i => i.pause())
      
      // 延迟恢复播放
      setTimeout(() => {
        activeInstances.forEach(i => i.play())
      }, 300)
    }
  }

  /**
   * 创建 Lottie 实例
   */
  create(config: LottieConfig): ILottieInstance {
    // 检查实例数量限制
    if (this.instances.size >= this.config.maxInstances) {
      throw new Error(`Maximum instances limit reached (${this.config.maxInstances})`)
    }

    // 获取设备推荐配置
    const recommended = getRecommendedConfig()
    const deviceInfo = this.deviceDetector.getInfo()

    // 合并默认配置（优先使用用户配置，其次使用设备推荐配置）
    const finalConfig: LottieConfig = {
      renderer: config.renderer ?? this.config.defaultRenderer ?? recommended.renderer,
      ...config,
    }

    // 如果是移动设备，自动启用性能监控
    if (deviceInfo.isMobile && !finalConfig.advanced?.enablePerformanceMonitor) {
      finalConfig.advanced = {
        ...finalConfig.advanced,
        enablePerformanceMonitor: true,
        targetFPS: recommended.targetFPS,
      }
    }

    // 修复 HTML 渲染器的问题 - 添加特殊配置
    if (finalConfig.renderer === 'html') {
      finalConfig.rendererSettings = {
        ...finalConfig.rendererSettings,
        // HTML 渲染器特殊设置
        className: finalConfig.rendererSettings?.className || 'lottie-html',
        hideOnTransparent: true,
        // 移动设备上禁用某些特性以提升性能
        ...(deviceInfo.isMobile && {
          progressiveLoad: false,
        }),
      }
    }

    // 尝试从缓存加载动画数据
    if (this.config.cache.enabled && config.path && !config.animationData) {
      const cacheKey = config.advanced?.cacheKey || config.path
      const cachedData = this.cacheManager.get(cacheKey)
      if (cachedData) {
        finalConfig.animationData = cachedData
        finalConfig.path = undefined
      }
    }

    // 创建实例
    const instance = new LottieInstance(finalConfig)

    // 添加到管理器
    this.instances.set(instance.id, instance)

    // 添加到池
    if (this.config.enableInstancePool) {
      this.instancePool.add(instance)
    }

    // 如果从路径加载，保存到缓存
    if (this.config.cache.enabled && config.path) {
      instance.on('data_ready', () => {
        if (instance.animation) {
          const cacheKey = config.advanced?.cacheKey || config.path!
          const data = (instance.animation as any).animationData
          this.cacheManager.set(cacheKey, data)
        }
      })
    }

    return instance
  }

  /**
   * 获取实例
   */
  get(id: string): ILottieInstance | undefined {
    return this.instances.get(id)
  }

  /**
   * 获取实例by名称
   */
  getByName(name: string): ILottieInstance | undefined {
    return Array.from(this.instances.values()).find(instance => instance.name === name)
  }

  /**
   * 获取所有实例
   */
  getAll(): ILottieInstance[] {
    return Array.from(this.instances.values())
  }

  /**
   * 销毁实例
   */
  destroy(id: string): boolean {
    const instance = this.instances.get(id)
    if (!instance) return false

    // 从池中移除
    if (this.config.enableInstancePool) {
      this.instancePool.remove(id)
    }

    // 销毁实例
    instance.destroy()

    // 从管理器中移除
    this.instances.delete(id)

    return true
  }

  /**
   * 销毁所有实例
   */
  destroyAll(): void {
    this.instances.forEach(instance => {
      try {
        instance.destroy()
      } catch (error) {
        console.error('[LottieManager] Error destroying instance:', error)
      }
    })
    this.instances.clear()

    if (this.config.enableInstancePool) {
      this.instancePool.clear()
    }
  }

  /**
   * 播放所有实例
   */
  playAll(): void {
    this.instances.forEach(instance => {
      try {
        instance.play()
      } catch (error) {
        console.error('[LottieManager] Error playing instance:', error)
      }
    })
  }

  /**
   * 暂停所有实例
   */
  pauseAll(): void {
    this.instances.forEach(instance => {
      try {
        instance.pause()
      } catch (error) {
        console.error('[LottieManager] Error pausing instance:', error)
      }
    })
  }

  /**
   * 停止所有实例
   */
  stopAll(): void {
    this.instances.forEach(instance => {
      try {
        instance.stop()
      } catch (error) {
        console.error('[LottieManager] Error stopping instance:', error)
      }
    })
  }

  /**
   * 设置全局播放速度
   */
  setGlobalSpeed(speed: number): void {
    this.instances.forEach(instance => {
      try {
        instance.setSpeed(speed)
      } catch (error) {
        console.error('[LottieManager] Error setting speed:', error)
      }
    })
  }

  /**
   * 预加载动画数据
   */
  async preload(path: string, cacheKey?: string): Promise<any> {
    const key = cacheKey || path

    // 检查缓存
    const cached = this.cacheManager.get(key)
    if (cached) {
      return cached
    }

    // 加载数据
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to preload animation: ${response.statusText}`)
      }
      const data = await response.json()

      // 保存到缓存
      if (this.config.cache.enabled) {
        this.cacheManager.set(key, data)
      }

      return data
    } catch (error) {
      console.error('[LottieManager] Preload failed:', error)
      throw error
    }
  }

  /**
   * 批量预加载
   */
  async preloadBatch(paths: string[]): Promise<void> {
    const promises = paths.map(path => this.preload(path).catch(err => {
      console.error(`[LottieManager] Failed to preload ${path}:`, err)
      return null
    }))
    await Promise.all(promises)
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cacheManager.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cacheManager.getCurrentSize(),
      hitRate: this.cacheManager.getHitRate(),
    }
  }

  /**
   * 获取池统计
   */
  getPoolStats(): PoolStats {
    return this.instancePool.getStats()
  }

  /**
   * 获取全局性能统计
   */
  getGlobalStats(): GlobalPerformanceStats {
    const instances = Array.from(this.instances.values())
    const activeInstances = instances.filter(i => i.state === 'playing')

    // 计算平均 FPS
    let totalFps = 0
    let fpsCount = 0
    let totalMemory = 0

    instances.forEach(instance => {
      const metrics = instance.getMetrics()
      if (metrics) {
        if (metrics.fps > 0) {
          totalFps += metrics.fps
          fpsCount++
        }
        totalMemory += metrics.memory
      }
    })

    return {
      totalInstances: this.instances.size,
      activeInstances: activeInstances.length,
      averageFps: fpsCount > 0 ? Math.round(totalFps / fpsCount) : 0,
      totalMemory: Math.round(totalMemory * 100) / 100,
      cacheHitRate: this.cacheManager.getHitRate(),
    }
  }

  /**
   * 优化性能 - 清理空闲实例
   */
  optimize(): { cleaned: number; cacheCleared: boolean } {
    let cleaned = 0

    // 清理池中的空闲实例
    if (this.config.enableInstancePool) {
      const idleInstances = this.instancePool.getIdleInstances()
      const toClean = Math.floor(idleInstances.length * 0.5) // 清理50%的空闲实例

      idleInstances.slice(0, toClean).forEach(instance => {
        if (instance.state === 'stopped' || instance.state === 'idle') {
          this.destroy(instance.id)
          cleaned++
        }
      })
    }

    // 清理过期缓存
    const cacheCleared = this.cacheManager.cleanExpired() > 0

    return { cleaned, cacheCleared }
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<Required<LottieManagerConfig>> {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LottieManagerConfig>): void {
    this.config = this.normalizeConfig({ ...this.config, ...config })
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return this.deviceDetector.getInfo()
  }

  /**
   * 获取推荐配置
   */
  getRecommendedConfig() {
    return getRecommendedConfig()
  }

  /**
   * 根据设备自动优化所有实例
   */
  autoOptimize(): { optimized: number; downgraded: number } {
    const deviceInfo = this.deviceDetector.getInfo()
    const recommended = getRecommendedConfig()
    let optimized = 0
    let downgraded = 0

    // 如果是低性能设备，降级所有实例
    if (deviceInfo.performanceTier === 'low') {
      this.instances.forEach(instance => {
        try {
          // 降低播放速度
          const currentSpeed = (instance.animation as any)?.playSpeed || 1
          if (currentSpeed > 0.8) {
            instance.setSpeed(0.8)
            downgraded++
          }

          // 切换到更高效的渲染器
          if (instance.config.renderer === 'svg') {
            // SVG 在低性能设备上可能较慢，尝试切换到 canvas
            instance.switchRenderer('canvas')
            downgraded++
          }
        } catch (error) {
          console.warn('[LottieManager] Failed to optimize instance:', error)
        }
      })
    }

    // 优化空闲实例
    const result = this.optimize()
    optimized = result.cleaned

    return { optimized, downgraded }
  }
}

// 导出默认实例
export const lottieManager = LottieManager.getInstance()
