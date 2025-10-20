import type { DeviceModule, ExtendedNavigator, NetworkInformation } from '../types'
import { EventEmitter } from '../core/EventEmitter'

/**
 * 设备性能信息
 */
export interface DevicePerformanceInfo {
  /** 性能评分 (0-100) */
  score: number
  /** 性能等级 */
  tier: 'low' | 'medium' | 'high' | 'ultra'
  /** 详细指标 */
  metrics: {
    /** CPU 性能评分 */
    cpu: number
    /** GPU 性能评分 */
    gpu: number
    /** 内存评分 */
    memory: number
    /** 网络评分 */
    network: number
    /** 存储性能评分 */
    storage: number
  }
  /** 硬件信息 */
  hardware: {
    /** CPU 核心数 */
    cpuCores: number
    /** 设备内存 (GB) */
    deviceMemory: number
    /** 最大触摸点数 */
    maxTouchPoints: number
  }
  /** 性能建议 */
  recommendations: string[]
  /** 测试时间戳 */
  timestamp: number
}

/**
 * 性能测试选项
 */
export interface PerformanceTestOptions {
  /** 是否包含 GPU 测试 */
  includeGPU?: boolean
  /** 是否包含网络测试 */
  includeNetwork?: boolean
  /** 测试超时时间（毫秒） */
  timeout?: number
}

/**
 * 性能模块事件
 */
export interface PerformanceModuleEvents extends Record<string, unknown> {
  performanceChange: DevicePerformanceInfo
  testComplete: DevicePerformanceInfo
  testStart: void
}

/**
 * 设备性能评估模块
 *
 * 提供设备性能评分和分级功能，包括：
 * - CPU 性能测试（数学密集型计算基准测试）
 * - GPU 性能测试（WebGL + Canvas 2D 渲染测试）
 * - 内存性能测试（容量评估 + 大数组排序测试）
 * - 网络性能评估（基于 Network Information API）
 * - 存储性能测试（localStorage 读写性能测试）
 * - 综合性能评分（五项指标加权平均）
 *
 * 评分权重：
 * - CPU: 30%
 * - GPU: 25%
 * - Memory: 20%
 * - Storage: 15%
 * - Network: 10%
 *
 * @example
 * ```typescript
 * const detector = new DeviceDetector()
 * const perfModule = await detector.loadModule<PerformanceModule>('performance')
 * const perfInfo = perfModule.getData()
 *
 *  
 * // 根据性能等级调整应用配置
 * if (perfInfo.tier === 'low') {
 *   // 降低图形质量
 * } else if (perfInfo.tier === 'ultra') {
 *   // 启用高级特效
 * }
 *
 * // 查看性能建议
 * perfInfo.recommendations.forEach(rec => )
 * ```
 */
export class PerformanceModule
  extends EventEmitter<PerformanceModuleEvents>
  implements DeviceModule {
  name = 'performance'
  private performanceInfo: DevicePerformanceInfo | null = null
  private isInitialized = false
  private isTesting = false

  /**
   * 初始化模块
   */
  async init(): Promise<void> {
    if (this.isInitialized)
      return

    this.performanceInfo = await this.runPerformanceTest()
    this.isInitialized = true
  }

  /**
   * 获取性能数据
   */
  getData(): DevicePerformanceInfo {
    if (!this.performanceInfo) {
      throw new Error('PerformanceModule not initialized')
    }
    return { ...this.performanceInfo }
  }

  /**
   * 获取性能评分
   */
  getScore(): number {
    return this.performanceInfo?.score ?? 0
  }

  /**
   * 获取性能等级
   */
  getTier(): 'low' | 'medium' | 'high' | 'ultra' {
    return this.performanceInfo?.tier ?? 'medium'
  }

  /**
   * 重新运行性能测试
   */
  async runTest(options?: PerformanceTestOptions): Promise<DevicePerformanceInfo> {
    if (this.isTesting) {
      throw new Error('Performance test already running')
    }

    this.isTesting = true
    this.emit('testStart', undefined)

    try {
      this.performanceInfo = await this.runPerformanceTest(options)
      this.emit('testComplete', this.performanceInfo)
      this.emit('performanceChange', this.performanceInfo)
      return this.performanceInfo
    }
    finally {
      this.isTesting = false
    }
  }

  /**
   * 销毁模块
   */
  async destroy(): Promise<void> {
    this.removeAllListeners()
    this.performanceInfo = null
    this.isInitialized = false
  }

  /**
   * 运行性能测试
   */
  private async runPerformanceTest(
    options: PerformanceTestOptions = {},
  ): Promise<DevicePerformanceInfo> {
    const {
      includeGPU = true,
      includeNetwork = false,
      timeout = 5000,
    } = options

    const hardware = this.detectHardware()

    // 并行运行各项测试
    const [cpuScore, gpuScore, memoryScore, networkScore, storageScore] = await Promise.all([
      this.testCPUPerformance(timeout, hardware.cpuCores),
      includeGPU ? this.testGPUPerformance(timeout) : Promise.resolve(50),
      this.testMemoryPerformance(hardware.deviceMemory),
      includeNetwork ? this.testNetworkPerformance(timeout) : Promise.resolve(50),
      this.testStoragePerformance(timeout),
    ])

    const metrics = {
      cpu: cpuScore,
      gpu: gpuScore,
      memory: memoryScore,
      network: networkScore,
      storage: storageScore,
    }

    // 计算综合评分（加权平均）
    const weights = {
      cpu: 0.3,
      gpu: 0.25,
      memory: 0.2,
      network: 0.1,
      storage: 0.15,
    }

    const score = Math.round(
      cpuScore * weights.cpu
      + gpuScore * weights.gpu
      + memoryScore * weights.memory
      + networkScore * weights.network
      + storageScore * weights.storage,
    )

    const tier = this.calculateTier(score)
    const recommendations = this.generateRecommendations(metrics, tier)

    return {
      score,
      tier,
      metrics,
      hardware,
      recommendations,
      timestamp: Date.now(),
    }
  }

  /**
   * 检测硬件信息
   */
  private detectHardware() {
    return {
      cpuCores: (navigator as ExtendedNavigator).hardwareConcurrency || 1,
      deviceMemory: (navigator as ExtendedNavigator).deviceMemory || 4,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    }
  }

  /**
   * 测试 CPU 性能
   * 使用数学密集型计算进行基准测试
   */
  private async testCPUPerformance(_timeout: number, cores: number): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      const iterations = 100000

      // 执行数学密集型计算
      let result = 0
      for (let i = 0; i < iterations; i++) {
        result += Math.sqrt(i) * Math.sin(i) * Math.cos(i)
      }

      // 使用result防止被优化掉
      if (result === 0) result = 1

      const duration = performance.now() - startTime

      // 根据执行时间计算基准分数
      // 假设高端设备约50ms，低端设备约500ms
      const benchmarkScore = Math.max(0, Math.min(100, (500 - duration) / 4.5))

      // 结合 CPU 核心数进行综合评分
      // 核心数权重40%，基准测试60%
      const coreScore = Math.min(100, (cores / 8) * 100)
      const finalScore = Math.round(coreScore * 0.4 + benchmarkScore * 0.6)

      resolve(finalScore)
    })
  }

  /**
   * 测试 GPU 性能
   * 结合 WebGL 渲染测试和 Canvas 2D 测试
   */
  private async testGPUPerformance(timeout: number): Promise<number> {
    try {
      // 首先测试 Canvas 2D 渲染性能
      const canvas2DScore = await this.testCanvas2DPerformance()

      // 然后测试 WebGL 性能
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256

      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) {
        // 不支持 WebGL，只使用 Canvas 2D 分数
        return Math.round(canvas2DScore * 0.8) // 降低权重
      }

      const startTime = performance.now()
      let frames = 0
      const maxFrames = 100

      const webglScore = await new Promise<number>((resolve) => {
        const render = () => {
          if (!gl) {
            resolve(30)
            return
          }

          // 简单的渲染测试
          gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0)
          gl.clear(gl.COLOR_BUFFER_BIT)
          frames++

          const elapsed = performance.now() - startTime

          if (elapsed >= timeout || frames >= maxFrames) {
            // 根据帧率计算评分
            const fps = (frames / elapsed) * 1000
            const score = Math.min(100, (fps / 60) * 100)
            resolve(score)
          }
          else {
            requestAnimationFrame(render)
          }
        }

        render()
      })

      // WebGL 支持额外奖励
      const webglBonus = 10

      // 综合 Canvas 2D (40%) 和 WebGL (60%) 分数
      return Math.min(100, Math.round(canvas2DScore * 0.4 + webglScore * 0.6 + webglBonus))
    }
    catch {
      return 30
    }
  }

  /**
   * 测试 Canvas 2D 渲染性能
   */
  private async testCanvas2DPerformance(): Promise<number> {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')

      if (!ctx)
        return 50

      const startTime = performance.now()

      // 执行 Canvas 2D 绘制测试
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgb(${i % 255}, ${(i * 2) % 255}, ${(i * 3) % 255})`
        ctx.fillRect(
          Math.random() * 800,
          Math.random() * 600,
          Math.random() * 50,
          Math.random() * 50,
        )
      }

      const duration = performance.now() - startTime

      // 假设高端设备约20ms，低端设备约200ms
      return Math.max(0, Math.min(100, (200 - duration) / 1.8))
    }
    catch {
      return 50
    }
  }

  /**
   * 测试内存性能
   * 结合设备内存容量和实际性能测试
   */
  private async testMemoryPerformance(deviceMemory: number): Promise<number> {
    try {
      // 内存基准测试：大数组排序
      const arraySize = 1000000
      const startTime = performance.now()

      // 创建大数组
      const arr: number[] = Array.from({length: arraySize})
      for (let i = 0; i < arraySize; i++) {
        arr[i] = Math.random()
      }

      // 执行排序测试
      arr.sort((a, b) => a - b)

      const duration = performance.now() - startTime

      // 清理内存
      arr.length = 0

      // 根据执行时间计算基准分数
      // 假设高端设备约100ms，低端设备约1000ms
      const benchmarkScore = Math.max(0, Math.min(100, (1000 - duration) / 9))

      // 根据设备内存容量计算分数
      const memoryCapacityScore = Math.min(100, (deviceMemory / 16) * 100)

      // 内存容量权重50%，基准测试50%
      return Math.round(memoryCapacityScore * 0.5 + benchmarkScore * 0.5)
    }
    catch {
      // 测试失败，仅根据内存容量评分
      if (deviceMemory >= 8)
        return 100
      if (deviceMemory >= 6)
        return 85
      if (deviceMemory >= 4)
        return 70
      if (deviceMemory >= 2)
        return 50
      return 30
    }
  }

  /**
   * 测试网络性能
   */
  private async testNetworkPerformance(_timeout: number): Promise<number> {
    try {
      // 使用 Network Information API
      const connection = (navigator as ExtendedNavigator).connection || 
                         (navigator as ExtendedNavigator).mozConnection || 
                         (navigator as ExtendedNavigator).webkitConnection

      if (!connection)
        return 70 // 默认中等分数

      const effectiveType = (connection as NetworkInformation).effectiveType || '4g'
      const downlink = (connection as NetworkInformation).downlink || 0

      // 根据网络类型评分
      const typeScores: Record<string, number> = {
        'slow-2g': 20,
        '2g': 40,
        '3g': 60,
        '4g': 85,
        '5g': 100,
      }

      const typeScore = typeScores[effectiveType] || 70

      // 根据下载速度评分（如果有的话）
      if (downlink > 0) {
        const speedScore = Math.min(100, (downlink / 10) * 100)
        return Math.round((typeScore + speedScore) / 2)
      }

      return typeScore
    }
    catch {
      return 70
    }
  }

  /**
   * 测试存储性能
   * 测试 localStorage 读写性能
   */
  private async testStoragePerformance(_timeout: number): Promise<number> {
    try {
      const testKey = '__perf_test_storage__'
      const testData = 'x'.repeat(10000) // 10KB 数据

      const startTime = performance.now()

      // 执行 localStorage 读写测试
      for (let i = 0; i < 10; i++) {
        localStorage.setItem(testKey, testData)
        localStorage.getItem(testKey)
      }

      // 清理测试数据
      localStorage.removeItem(testKey)

      const duration = performance.now() - startTime

      // 根据执行时间计算基准分数
      // 假设高端设备约5ms，低端设备约50ms
      const benchmarkScore = Math.max(0, Math.min(100, (50 - duration) / 0.45))

      // 检查存储 API 支持
      let apiBonus = 0
      if ('indexedDB' in window)
        apiBonus += 5
      if ('caches' in window)
        apiBonus += 5

      return Math.min(100, Math.round(benchmarkScore + apiBonus))
    }
    catch {
      // 测试失败，返回中等分数
      return 50
    }
  }

  /**
   * 计算性能等级
   */
  private calculateTier(score: number): 'low' | 'medium' | 'high' | 'ultra' {
    if (score >= 80)
      return 'ultra'
    if (score >= 60)
      return 'high'
    if (score >= 40)
      return 'medium'
    return 'low'
  }

  /**
   * 生成性能建议
   * 提供更详细和实用的优化建议
   */
  private generateRecommendations(
    metrics: DevicePerformanceInfo['metrics'],
    tier: DevicePerformanceInfo['tier'],
  ): string[] {
    const recommendations: string[] = []

    // 根据性能等级提供整体建议
    if (tier === 'low') {
      recommendations.push('设备性能较低，建议降低整体图形质量和关闭非必要动画效果')
      recommendations.push('建议减少同时运行的任务和后台进程')
    }

    // CPU 性能建议
    if (metrics.cpu < 50) {
      recommendations.push('降低JavaScript计算复杂度，使用Web Workers处理密集型计算任务')
      recommendations.push('避免在主线程中执行复杂的数据处理操作')
    }
    else if (metrics.cpu < 70) {
      recommendations.push('注意优化JavaScript执行效率，避免不必要的复杂计算')
    }

    // GPU 性能建议
    if (metrics.gpu < 50) {
      recommendations.push('减少DOM操作和重绘次数，使用CSS动画代替JavaScript动画')
      recommendations.push('降低Canvas渲染质量，减少同时渲染的图形元素数量')
    }
    else if (metrics.gpu < 70) {
      recommendations.push('优化图形渲染性能，注意控制动画帧率')
    }

    // 内存性能建议
    if (metrics.memory < 50) {
      recommendations.push('减少内存占用，及时清理不用的对象和大数组')
      recommendations.push('避免内存泄漏，注意解除事件监听和定时器')
    }
    else if (metrics.memory < 70) {
      recommendations.push('注意内存使用效率，避免创建过多的临时对象')
    }

    // 网络性能建议
    if (metrics.network < 50) {
      recommendations.push('优化资源加载策略，启用Gzip压缩和浏览器缓存')
      recommendations.push('减少网络请求次数，考虑使用CDN加速静态资源')
      recommendations.push('启用懒加载和预加载策略，优化首屏加载时间')
    }
    else if (metrics.network < 70) {
      recommendations.push('网络性能一般，建议优化资源加载和使用缓存策略')
    }

    // 存储性能建议
    if (metrics.storage < 50) {
      recommendations.push('减少localStorage的使用频率，考虑使用IndexedDB存储大量数据')
      recommendations.push('优化数据存储策略，避免频繁的读写操作')
    }
    else if (metrics.storage < 70) {
      recommendations.push('注意存储性能，避免过度使用localStorage')
    }

    // 高性能设备建议
    if (tier === 'ultra') {
      recommendations.push('设备性能优秀，可以启用所有高级特性和高质量图形效果')
    }
    else if (tier === 'high') {
      recommendations.push('设备性能良好，可以启用大部分高级特性')
    }

    // 如果没有特别的性能问题
    if (recommendations.length === 0) {
      recommendations.push('设备性能表现良好，可以正常使用各项功能')
    }

    return recommendations
  }
}
