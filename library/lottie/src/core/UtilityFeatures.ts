/**
 * 实用工具功能集合
 * 包含数据绑定、录制器、性能分析器、A/B测试、无障碍功能
 */

import type { ILottieInstance } from '../types'

// ==================== 数据绑定 ====================

export interface DataBindingConfig {
  textLayers?: Record<string, string>
  imageLayers?: Record<string, string>
  colorLayers?: Record<string, string>
}

export class DataBinding {
  private instance: ILottieInstance
  private bindings: DataBindingConfig = {}

  constructor(instance: ILottieInstance) {
    this.instance = instance
  }

  /**
   * 更新文本
   */
  updateText(layerName: string, text: string): void {
    const animData = (this.instance.animation as any)?.animationData
    if (!animData?.layers) return

    const layer = this.findLayer(animData.layers, layerName)
    if (layer && layer.t) {
      layer.t.d.k[0].s.t = text
      this.instance.animation?.renderer.renderFrame(this.instance.currentFrame)
    }
  }

  /**
   * 更新图片
   */
  updateImage(layerName: string, imageUrl: string): void {
    const animData = (this.instance.animation as any)?.animationData
    if (!animData?.assets) return

    const asset = animData.assets.find((a: any) => a.id === layerName)
    if (asset) {
      asset.u = imageUrl
      asset.p = imageUrl
      this.instance.animation?.renderer.renderFrame(this.instance.currentFrame)
    }
  }

  /**
   * 批量更新
   */
  updateBatch(config: DataBindingConfig): void {
    if (config.textLayers) {
      Object.entries(config.textLayers).forEach(([layer, text]) => {
        this.updateText(layer, text)
      })
    }
    if (config.imageLayers) {
      Object.entries(config.imageLayers).forEach(([layer, url]) => {
        this.updateImage(layer, url)
      })
    }
  }

  private findLayer(layers: any[], name: string): any {
    for (const layer of layers) {
      if (layer.nm === name) return layer
      if (layer.layers) {
        const found = this.findLayer(layer.layers, name)
        if (found) return found
      }
    }
    return null
  }
}

// ==================== 录制器 ====================

export interface RecorderConfig {
  format?: 'webm' | 'gif'
  fps?: number
  quality?: number
  width?: number
  height?: number
}

export class Recorder {
  private instance: ILottieInstance
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private stream: MediaStream | null = null

  constructor(instance: ILottieInstance) {
    this.instance = instance
  }

  /**
   * 开始录制
   */
  async startRecording(config: RecorderConfig = {}): Promise<void> {
    const container = this.getContainer()
    
    // 创建 canvas 用于录制
    const canvas = document.createElement('canvas')
    canvas.width = config.width ?? 800
    canvas.height = config.height ?? 600
    
    this.stream = canvas.captureStream(config.fps ?? 30)
    
    const options: MediaRecorderOptions = {
      mimeType: config.format === 'webm' ? 'video/webm' : 'video/webm',
      videoBitsPerSecond: (config.quality ?? 0.8) * 2500000
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options)
    this.chunks = []

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data)
      }
    }

    this.mediaRecorder.start()
    
    // 录制动画帧
    this.captureFrames(canvas)
  }

  /**
   * 停止录制
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        throw new Error('No recording in progress')
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' })
        resolve(blob)
      }

      this.mediaRecorder.stop()
      this.stream?.getTracks().forEach(track => track.stop())
    })
  }

  /**
   * 下载录制
   */
  async download(filename = 'animation'): Promise<void> {
    const blob = await this.stopRecording()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  private captureFrames(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!
    const container = this.getContainer()
    
    const capture = () => {
      if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return
      
      // 绘制当前帧
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // 这里需要从容器截图,实际实现需要使用 html2canvas 等库
      
      requestAnimationFrame(capture)
    }
    
    capture()
  }

  private getContainer(): HTMLElement {
    const container = this.instance.config.container
    if (typeof container === 'string') {
      return document.querySelector(container) as HTMLElement
    }
    return container as HTMLElement
  }
}

// ==================== 性能分析器 ====================

export interface PerformanceReport {
  averageFps: number
  minFps: number
  maxFps: number
  frameDrops: number
  memoryUsage: number
  renderTime: number
  recommendations: string[]
}

export class PerformanceAnalyzer {
  private instance: ILottieInstance
  private samples: number[] = []
  private frameTimes: number[] = []
  private lastFrameTime = 0
  
  constructor(instance: ILottieInstance) {
    this.instance = instance
    this.startMonitoring()
  }

  private startMonitoring(): void {
    const monitor = () => {
      const now = performance.now()
      if (this.lastFrameTime > 0) {
        const frameTime = now - this.lastFrameTime
        this.frameTimes.push(frameTime)
        const fps = 1000 / frameTime
        this.samples.push(fps)
        
        // 保持最近 300 帧的数据
        if (this.samples.length > 300) this.samples.shift()
        if (this.frameTimes.length > 300) this.frameTimes.shift()
      }
      this.lastFrameTime = now
      
      if (this.instance.state === 'playing') {
        requestAnimationFrame(monitor)
      }
    }
    
    if (this.instance.state === 'playing') {
      monitor()
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const avgFps = this.samples.reduce((a, b) => a + b, 0) / this.samples.length
    const minFps = Math.min(...this.samples)
    const maxFps = Math.max(...this.samples)
    const frameDrops = this.samples.filter(fps => fps < 55).length
    const avgRenderTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length

    const recommendations: string[] = []
    
    if (avgFps < 30) {
      recommendations.push('平均帧率过低，建议切换到 Canvas 渲染器')
      recommendations.push('考虑降低动画复杂度或分辨率')
    }
    
    if (frameDrops > 50) {
      recommendations.push('频繁掉帧，建议启用性能监控并自动降级')
    }
    
    if (avgRenderTime > 33) {
      recommendations.push('渲染时间过长，建议优化动画层级')
    }

    return {
      averageFps: Math.round(avgFps),
      minFps: Math.round(minFps),
      maxFps: Math.round(maxFps),
      frameDrops,
      memoryUsage: this.instance.getMetrics()?.memory ?? 0,
      renderTime: Math.round(avgRenderTime),
      recommendations
    }
  }

  /**
   * 清除数据
   */
  clear(): void {
    this.samples = []
    this.frameTimes = []
  }
}

// ==================== A/B 测试 ====================

export interface ABTestConfig {
  name: string
  variantA: any
  variantB: any
  metrics: string[]
}

export interface ABTestResult {
  variant: 'A' | 'B'
  winner: 'A' | 'B' | 'tie'
  metrics: Record<string, { A: number; B: number }>
  confidence: number
}

export class ABTester {
  private tests = new Map<string, ABTestConfig>()
  private results = new Map<string, ABTestResult>()

  /**
   * 创建 A/B 测试
   */
  createTest(config: ABTestConfig): void {
    this.tests.set(config.name, config)
  }

  /**
   * 运行测试
   */
  async runTest(testName: string, instanceA: ILottieInstance, instanceB: ILottieInstance): Promise<ABTestResult> {
    const config = this.tests.get(testName)
    if (!config) throw new Error(`Test not found: ${testName}`)

    // 收集指标
    const metricsA = this.collectMetrics(instanceA)
    const metricsB = this.collectMetrics(instanceB)

    // 比较性能
    const metrics: Record<string, { A: number; B: number }> = {}
    let scoreA = 0
    let scoreB = 0

    config.metrics.forEach(metric => {
      const valueA = metricsA[metric] ?? 0
      const valueB = metricsB[metric] ?? 0
      metrics[metric] = { A: valueA, B: valueB }

      if (metric === 'fps') {
        scoreA += valueA > valueB ? 1 : 0
        scoreB += valueB > valueA ? 1 : 0
      } else if (metric === 'memory') {
        scoreA += valueA < valueB ? 1 : 0
        scoreB += valueB < valueA ? 1 : 0
      }
    })

    const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie'
    const confidence = Math.abs(scoreA - scoreB) / config.metrics.length

    const result: ABTestResult = {
      variant: Math.random() > 0.5 ? 'A' : 'B',
      winner,
      metrics,
      confidence
    }

    this.results.set(testName, result)
    return result
  }

  private collectMetrics(instance: ILottieInstance): Record<string, number> {
    const metrics = instance.getMetrics()
    return {
      fps: metrics?.fps ?? 0,
      memory: metrics?.memory ?? 0,
      frameDrops: metrics?.frameDrops ?? 0
    }
  }

  /**
   * 获取测试结果
   */
  getResult(testName: string): ABTestResult | undefined {
    return this.results.get(testName)
  }
}

// ==================== 无障碍功能 ====================

export interface AccessibilityConfig {
  announcements?: boolean
  keyboardNav?: boolean
  ariaLabels?: boolean
  reducedMotion?: boolean
}

export class AccessibilityManager {
  private instance: ILottieInstance
  private config: Required<AccessibilityConfig>
  private container: HTMLElement
  private announcer: HTMLElement | null = null

  constructor(instance: ILottieInstance, config: AccessibilityConfig = {}) {
    this.instance = instance
    this.config = {
      announcements: config.announcements ?? true,
      keyboardNav: config.keyboardNav ?? true,
      ariaLabels: config.ariaLabels ?? true,
      reducedMotion: config.reducedMotion ?? true
    }
    this.container = this.getContainer()
    this.init()
  }

  private getContainer(): HTMLElement {
    const container = this.instance.config.container
    if (typeof container === 'string') {
      return document.querySelector(container) as HTMLElement
    }
    return container as HTMLElement
  }

  private init(): void {
    // ARIA 标签
    if (this.config.ariaLabels) {
      this.container.setAttribute('role', 'img')
      this.container.setAttribute('aria-label', 'Lottie动画')
      this.container.setAttribute('tabindex', '0')
    }

    // 键盘导航
    if (this.config.keyboardNav) {
      this.setupKeyboardNav()
    }

    // 屏幕阅读器
    if (this.config.announcements) {
      this.createAnnouncer()
    }

    // 减少动画
    if (this.config.reducedMotion) {
      this.handleReducedMotion()
    }
  }

  private setupKeyboardNav(): void {
    this.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          if (this.instance.state === 'playing') {
            this.instance.pause()
            this.announce('动画已暂停')
          } else {
            this.instance.play()
            this.announce('动画正在播放')
          }
          e.preventDefault()
          break
        
        case 'ArrowLeft':
          this.instance.goToAndStop(Math.max(0, this.instance.currentFrame - 10), true)
          this.announce('后退10帧')
          e.preventDefault()
          break
        
        case 'ArrowRight':
          this.instance.goToAndStop(
            Math.min(this.instance.totalFrames, this.instance.currentFrame + 10),
            true
          )
          this.announce('前进10帧')
          e.preventDefault()
          break
        
        case 'Home':
          this.instance.goToAndStop(0, true)
          this.announce('跳转到开始')
          e.preventDefault()
          break
        
        case 'End':
          this.instance.goToAndStop(this.instance.totalFrames - 1, true)
          this.announce('跳转到结束')
          e.preventDefault()
          break
      }
    })
  }

  private createAnnouncer(): void {
    this.announcer = document.createElement('div')
    this.announcer.setAttribute('role', 'status')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.style.position = 'absolute'
    this.announcer.style.left = '-10000px'
    this.announcer.style.width = '1px'
    this.announcer.style.height = '1px'
    this.announcer.style.overflow = 'hidden'
    document.body.appendChild(this.announcer)
  }

  /**
   * 朗读文本
   */
  announce(text: string): void {
    if (this.announcer) {
      this.announcer.textContent = text
    }
  }

  private handleReducedMotion(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      this.instance.setSpeed(0.5)
      this.announce('已启用减少动画模式')
    }
  }

  /**
   * 获取帮助信息
   */
  getHelp(): string {
    return `
键盘快捷键:
- 空格/回车: 播放/暂停
- 左箭头: 后退10帧
- 右箭头: 前进10帧
- Home: 跳转到开始
- End: 跳转到结束
    `.trim()
  }

  destroy(): void {
    if (this.announcer) {
      this.announcer.remove()
    }
  }
}
