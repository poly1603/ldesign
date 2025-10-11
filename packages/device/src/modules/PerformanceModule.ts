import type { DeviceModule } from '../types'
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
 * - CPU 性能测试
 * - GPU 性能测试
 * - 内存容量评估
 * - 网络性能评估
 * - 综合性能评分
 *
 * @example
 * ```typescript
 * const detector = new DeviceDetector()
 * const perfModule = await detector.loadModule<PerformanceModule>('performance')
 * const perfInfo = perfModule.getData()
 *
 * console.log(`设备性能评分: ${perfInfo.score}`)
 * console.log(`性能等级: ${perfInfo.tier}`)
 *
 * // 根据性能等级调整应用配置
 * if (perfInfo.tier === 'low') {
 *   // 降低图形质量
 * } else if (perfInfo.tier === 'ultra') {
 *   // 启用高级特效
 * }
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
    const [cpuScore, gpuScore, memoryScore, networkScore] = await Promise.all([
      this.testCPUPerformance(timeout),
      includeGPU ? this.testGPUPerformance(timeout) : Promise.resolve(50),
      this.evaluateMemory(hardware.deviceMemory),
      includeNetwork ? this.testNetworkPerformance(timeout) : Promise.resolve(50),
    ])

    const metrics = {
      cpu: cpuScore,
      gpu: gpuScore,
      memory: memoryScore,
      network: networkScore,
    }

    // 计算综合评分（加权平均）
    const weights = {
      cpu: 0.4,
      gpu: 0.3,
      memory: 0.2,
      network: 0.1,
    }

    const score = Math.round(
      cpuScore * weights.cpu
      + gpuScore * weights.gpu
      + memoryScore * weights.memory
      + networkScore * weights.network,
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
      cpuCores: (navigator as any).hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory || 4,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    }
  }

  /**
   * 测试 CPU 性能
   */
  private async testCPUPerformance(timeout: number): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      let iterations = 0
      const maxIterations = 1000000

      const test = () => {
        // 执行计算密集型任务
        for (let i = 0; i < 10000 && iterations < maxIterations; i++) {
          Math.sqrt(Math.random() * 1000)
          iterations++
        }

        const elapsed = performance.now() - startTime

        if (elapsed >= timeout || iterations >= maxIterations) {
          // 根据完成的迭代次数计算评分
          const score = Math.min(100, (iterations / maxIterations) * 100)
          resolve(score)
        }
        else {
          requestIdleCallback ? requestIdleCallback(test) : setTimeout(test, 0)
        }
      }

      test()
    })
  }

  /**
   * 测试 GPU 性能
   */
  private async testGPUPerformance(timeout: number): Promise<number> {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256

      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl)
        return 30 // 不支持 WebGL，给低分

      const startTime = performance.now()
      let frames = 0
      const maxFrames = 100

      return new Promise((resolve) => {
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
    }
    catch {
      return 30
    }
  }

  /**
   * 评估内存
   */
  private async evaluateMemory(deviceMemory: number): Promise<number> {
    // 根据设备内存大小评分
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

  /**
   * 测试网络性能
   */
  private async testNetworkPerformance(_timeout: number): Promise<number> {
    try {
      // 使用 Network Information API
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (!connection)
        return 50

      const effectiveType = connection.effectiveType
      const downlink = connection.downlink || 0

      // 根据网络类型评分
      const typeScores: Record<string, number> = {
        '4g': 100,
        '3g': 60,
        '2g': 30,
        'slow-2g': 10,
      }

      const typeScore = typeScores[effectiveType] || 50

      // 根据下载速度评分
      const speedScore = Math.min(100, (downlink / 10) * 100)

      return Math.round((typeScore + speedScore) / 2)
    }
    catch {
      return 50
    }
  }

  /**
   * 计算性能等级
   */
  private calculateTier(score: number): 'low' | 'medium' | 'high' | 'ultra' {
    if (score >= 85)
      return 'ultra'
    if (score >= 70)
      return 'high'
    if (score >= 50)
      return 'medium'
    return 'low'
  }

  /**
   * 生成性能建议
   */
  private generateRecommendations(
    metrics: DevicePerformanceInfo['metrics'],
    tier: DevicePerformanceInfo['tier'],
  ): string[] {
    const recommendations: string[] = []

    if (tier === 'low') {
      recommendations.push('建议降低图形质量以提升性能')
      recommendations.push('建议关闭动画效果')
      recommendations.push('建议减少同时运行的任务')
    }

    if (metrics.cpu < 50) {
      recommendations.push('CPU 性能较低，建议避免复杂计算')
    }

    if (metrics.gpu < 50) {
      recommendations.push('GPU 性能较低，建议降低渲染质量')
    }

    if (metrics.memory < 50) {
      recommendations.push('内存容量较小，建议优化内存使用')
    }

    if (metrics.network < 50) {
      recommendations.push('网络速度较慢，建议启用数据压缩')
    }

    if (tier === 'ultra') {
      recommendations.push('设备性能优秀，可以启用所有高级特性')
    }

    return recommendations
  }
}
