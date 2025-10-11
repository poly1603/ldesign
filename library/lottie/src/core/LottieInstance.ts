import lottie, { AnimationItem } from 'lottie-web'
import type { ILottieInstance, LottieConfig, AnimationState, LottieEvents, PerformanceMetrics } from '../types'
import { PerformanceMonitor } from './PerformanceMonitor'

let instanceCounter = 0

/**
 * Lottie 实例类
 */
export class LottieInstance implements ILottieInstance {
  readonly id: string
  readonly name: string
  private _state: AnimationState = 'idle'
  private _animation: AnimationItem | null = null
  private _container: HTMLElement | null = null
  private _config: LottieConfig
  private performanceMonitor: PerformanceMonitor | null = null
  private eventListeners: Map<string, Set<Function>> = new Map()
  private intersectionObserver: IntersectionObserver | null = null
  private isIntersecting: boolean = false

  constructor(config: LottieConfig) {
    this.id = `lottie-${++instanceCounter}-${Date.now()}`
    this.name = config.name || this.id
    this._config = this.normalizeConfig(config)

    // 初始化容器
    if (config.container) {
      this._container = typeof config.container === 'string'
        ? document.querySelector(config.container)
        : config.container
    }
  }

  get state(): AnimationState {
    return this._state
  }

  get animation(): AnimationItem | null {
    return this._animation
  }

  get container(): HTMLElement | null {
    return this._container
  }

  get config(): LottieConfig {
    return { ...this._config }
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: LottieConfig): LottieConfig {
    return {
      renderer: 'svg',
      loop: true,
      autoplay: false,
      speed: 1,
      quality: 'high',
      loadStrategy: 'eager',
      playMode: 'normal',
      ...config,
      advanced: {
        enablePerformanceMonitor: true,
        performanceMonitorInterval: 1000,
        enableCache: true,
        enableAutoDegradation: false,
        preload: false,
        ...config.advanced,
      },
    }
  }

  /**
   * 加载动画
   */
  async load(): Promise<void> {
    if (this._state === 'loading' || this._state === 'loaded') {
      return
    }

    try {
      this.setState('loading')

      // 根据加载策略加载
      switch (this._config.loadStrategy) {
        case 'lazy':
          // 延迟加载，等待用户交互或其他触发
          break
        case 'intersection':
          this.setupIntersectionObserver()
          break
        case 'eager':
        default:
          await this.loadAnimation()
          break
      }
    } catch (error) {
      this.setState('error')
      this.emit('data_failed', error as Error)
      throw error
    }
  }

  /**
   * 设置交叉观察器
   */
  private setupIntersectionObserver(): void {
    if (!this._container) return

    const options = this._config.advanced?.intersectionOptions || {
      threshold: 0.1,
    }

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isIntersecting = entry.isIntersecting
        if (entry.isIntersecting && this._state === 'loading') {
          this.loadAnimation()
        }
      })
    }, options)

    this.intersectionObserver.observe(this._container)
  }

  /**
   * 加载动画核心逻辑
   */
  private async loadAnimation(): Promise<void> {
    if (!this._container) {
      throw new Error('Container is required')
    }

    // 准备动画数据
    let animationData = this._config.animationData

    // 如果有 path，加载数据
    if (this._config.path && !animationData) {
      const loader = this._config.advanced?.customLoader || this.defaultLoader
      animationData = await loader(this._config.path)
    }

    if (!animationData) {
      throw new Error('Animation data or path is required')
    }

    // 创建 lottie 动画
    this._animation = lottie.loadAnimation({
      container: this._container,
      renderer: this._config.renderer,
      loop: this._config.loop,
      autoplay: false, // 我们手动控制播放
      animationData,
      rendererSettings: this.getRendererSettings(),
    })

    // 应用自定义样式
    if (this._config.style) {
      Object.assign(this._container.style, this._config.style)
    }

    // 设置播放速度
    if (this._config.speed) {
      this._animation.setSpeed(this._config.speed)
    }

    // 注册事件
    this.registerLottieEvents()

    // 初始化性能监控
    if (this._config.advanced?.enablePerformanceMonitor) {
      const totalFrames = this._animation.totalFrames
      const duration = this._animation.getDuration(true) * 1000
      this.performanceMonitor = new PerformanceMonitor(
        totalFrames,
        duration,
        this._config.advanced.performanceMonitorInterval
      )

      // 监控性能指标
      this.performanceMonitor.onMetrics((metrics) => {
        this.emit('performanceWarning', metrics)
        this.checkPerformance(metrics)
      })
    }

    this.setState('loaded')
    this.emit('data_ready')

    // 如果配置了自动播放，则播放
    if (this._config.autoplay) {
      this.play()
    }
  }

  /**
   * 默认加载器
   */
  private async defaultLoader(path: string): Promise<any> {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Failed to load animation: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取渲染器设置
   */
  private getRendererSettings(): any {
    const quality = this._config.quality || 'high'
    const baseSettings: any = {
      preserveAspectRatio: 'xMidYMid meet',
    }

    // 根据质量调整设置
    switch (quality) {
      case 'low':
        return {
          ...baseSettings,
          progressiveLoad: true,
          hideOnTransparent: true,
        }
      case 'medium':
        return {
          ...baseSettings,
          progressiveLoad: false,
        }
      case 'high':
      case 'auto':
      default:
        return baseSettings
    }
  }

  /**
   * 注册 lottie 事件
   */
  private registerLottieEvents(): void {
    if (!this._animation) return

    const events = {
      config_ready: () => this.emit('config_ready'),
      data_ready: () => this.emit('data_ready'),
      data_failed: () => this.emit('data_failed', new Error('Animation data failed')),
      DOMLoaded: () => this.emit('DOMLoaded'),
      destroy: () => this.emit('destroy'),
      enterFrame: (e: any) => this.emit('enterFrame', e),
      segmentStart: () => this.emit('segmentStart'),
      complete: () => {
        this.handleComplete()
        this.emit('complete')
      },
      loopComplete: () => this.emit('loopComplete'),
    }

    Object.entries(events).forEach(([event, handler]) => {
      this._animation!.addEventListener(event as any, handler)
    })
  }

  /**
   * 处理动画完成
   */
  private handleComplete(): void {
    if (this._config.playMode === 'bounce') {
      // 反弹模式：反向播放
      const direction = this._animation!.playDirection
      this._animation!.setDirection(direction === 1 ? -1 : 1)
      this._animation!.play()
    } else if (this._config.playMode === 'reverse') {
      // 反向模式：重置到结束并反向播放
      this._animation!.setDirection(-1)
      this._animation!.goToAndPlay(this._animation!.totalFrames - 1, true)
    }
  }

  /**
   * 检查性能
   */
  private checkPerformance(metrics: PerformanceMetrics): void {
    const { minFps, maxMemory, enableAutoDegradation } = this._config.advanced || {}

    // 检查 FPS
    if (minFps && metrics.fps < minFps) {
      console.warn(`[LottieInstance] Low FPS detected: ${metrics.fps}`)
      if (enableAutoDegradation) {
        this.degradeQuality()
      }
    }

    // 检查内存
    if (maxMemory && metrics.memory > maxMemory) {
      console.warn(`[LottieInstance] High memory usage: ${metrics.memory}MB`)
      if (enableAutoDegradation) {
        this.degradeQuality()
      }
    }
  }

  /**
   * 降级质量
   */
  private degradeQuality(): void {
    if (!this._animation) return

    const currentQuality = this._config.quality
    if (currentQuality === 'high') {
      this._config.quality = 'medium'
      console.log('[LottieInstance] Degraded to medium quality')
    } else if (currentQuality === 'medium') {
      this._config.quality = 'low'
      console.log('[LottieInstance] Degraded to low quality')
    }
  }

  /**
   * 播放
   */
  play(): void {
    if (!this._animation) {
      console.warn('[LottieInstance] Animation not loaded')
      return
    }

    this._animation.play()
    this.setState('playing')
    this.performanceMonitor?.start()
  }

  /**
   * 暂停
   */
  pause(): void {
    if (!this._animation) return

    this._animation.pause()
    this.setState('paused')
    this.performanceMonitor?.stop()
  }

  /**
   * 停止
   */
  stop(): void {
    if (!this._animation) return

    this._animation.stop()
    this.setState('stopped')
    this.performanceMonitor?.stop()
  }

  /**
   * 销毁
   */
  destroy(): void {
    // 停止性能监控
    this.performanceMonitor?.destroy()
    this.performanceMonitor = null

    // 停止交叉观察器
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }

    // 销毁动画
    if (this._animation) {
      this._animation.destroy()
      this._animation = null
    }

    // 清理事件监听器
    this.eventListeners.clear()

    this.setState('idle')
    this._container = null
  }

  /**
   * 设置速度
   */
  setSpeed(speed: number): void {
    if (this._animation) {
      this._animation.setSpeed(speed)
      this._config.speed = speed
    }
  }

  /**
   * 设置方向
   */
  setDirection(direction: 1 | -1): void {
    this._animation?.setDirection(direction)
  }

  /**
   * 跳转到指定帧并停止
   */
  goToAndStop(frame: number, isFrame: boolean = true): void {
    this._animation?.goToAndStop(frame, isFrame)
  }

  /**
   * 跳转到指定帧并播放
   */
  goToAndPlay(frame: number, isFrame: boolean = true): void {
    this._animation?.goToAndPlay(frame, isFrame)
    this.setState('playing')
  }

  /**
   * 播放片段
   */
  playSegments(segments: [number, number] | [number, number][], forceFlag: boolean = false): void {
    this._animation?.playSegments(segments, forceFlag)
    this.setState('playing')
  }

  /**
   * 重置
   */
  reset(): void {
    this.stop()
    this._animation?.goToAndStop(0, true)
  }

  /**
   * 调整大小
   */
  resize(): void {
    this._animation?.resize()
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics | null {
    return this.performanceMonitor?.getMetrics() || null
  }

  /**
   * 监听事件
   */
  on<K extends keyof LottieEvents>(event: K, callback: LottieEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback as Function)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof LottieEvents>(event: K, callback?: LottieEvents[K]): void {
    if (!callback) {
      this.eventListeners.delete(event)
      return
    }
    this.eventListeners.get(event)?.delete(callback as Function)
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof LottieEvents>(event: K, ...args: any[]): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`[LottieInstance] Error in ${event} callback:`, error)
      }
    })

    // 触发配置中的事件
    const configCallback = this._config.events?.[event]
    if (configCallback) {
      try {
        ;(configCallback as any)(...args)
      } catch (error) {
        console.error(`[LottieInstance] Error in config ${event} callback:`, error)
      }
    }
  }

  /**
   * 设置状态
   */
  private setState(state: AnimationState): void {
    if (this._state === state) return
    this._state = state
    this.emit('stateChange', state)
  }
}
