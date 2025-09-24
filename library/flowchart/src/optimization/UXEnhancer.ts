/**
 * 用户体验增强器
 * 
 * 负责改善用户体验，包括动画优化、加载优化、交互优化、视觉优化等
 */

import { EventEmitter } from 'events'
import type {
  IUXEnhancer,
  UXMetrics,
  UXEnhancerConfig
} from './types'

/**
 * 用户体验增强器实现
 */
export class UXEnhancer extends EventEmitter implements IUXEnhancer {
  private config: UXEnhancerConfig
  private metricsCollector?: PerformanceObserver
  private animationFrameId?: number
  private loadingIndicators: Map<string, HTMLElement> = new Map()
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private throttleTimers: Map<string, number> = new Map()

  constructor(config: UXEnhancerConfig) {
    super()
    this.config = {
      enabled: true,
      animations: {
        enabled: true,
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        respectMotionPreference: true
      },
      loading: {
        showProgressBar: true,
        showSkeleton: true,
        lazyLoadThreshold: 100
      },
      interaction: {
        debounceDelay: 300,
        throttleDelay: 100,
        hapticFeedback: false
      },
      visual: {
        smoothScrolling: true,
        highDPI: true,
        colorScheme: 'auto'
      },
      ...config
    }

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化用户体验增强器
   */
  private initialize(): void {
    // 设置动画优化
    this.setupAnimationOptimization()

    // 设置加载优化
    this.setupLoadingOptimization()

    // 设置交互优化
    this.setupInteractionOptimization()

    // 设置视觉优化
    this.setupVisualOptimization()

    // 设置性能指标收集
    this.setupMetricsCollection()

    // 应用主题
    this.applyTheme(this.config.visual.colorScheme)

    console.log('用户体验增强器已初始化')
    this.emit('initialized', { timestamp: Date.now() })
  }

  /**
   * 获取用户体验指标
   */
  getMetrics(): UXMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = performance.getEntriesByType('paint')
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    const fidEntries = performance.getEntriesByType('first-input')
    const clsEntries = performance.getEntriesByType('layout-shift')

    const metrics: UXMetrics = {
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      firstContentfulPaint: this.getMetricValue(paintEntries, 'first-contentful-paint'),
      largestContentfulPaint: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0,
      firstInputDelay: fidEntries.length > 0 ? (fidEntries[0] as any).processingStart - fidEntries[0].startTime : 0,
      cumulativeLayoutShift: this.calculateCLS(clsEntries),
      userSatisfactionScore: this.calculateUserSatisfactionScore()
    }

    return metrics
  }

  /**
   * 执行用户体验优化
   */
  async optimize(): Promise<void> {
    console.log('开始用户体验优化...')
    const startTime = Date.now()

    try {
      // 优化动画性能
      this.optimizeAnimations()

      // 优化加载体验
      this.optimizeLoading()

      // 优化交互响应
      this.optimizeInteraction()

      // 优化视觉体验
      this.optimizeVisual()

      const duration = Date.now() - startTime
      console.log(`用户体验优化完成，耗时 ${duration}ms`)

      this.emit('optimizationCompleted', {
        duration,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('用户体验优化失败:', error)
      this.emit('optimizationFailed', { error, timestamp: Date.now() })
    }
  }

  /**
   * 应用主题
   */
  applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    const root = document.documentElement

    if (theme === 'auto') {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = prefersDark ? 'dark' : 'light'
    }

    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme

    // 应用主题相关的CSS变量
    if (theme === 'dark') {
      root.style.setProperty('--bg-color', '#1a1a1a')
      root.style.setProperty('--text-color', '#ffffff')
      root.style.setProperty('--border-color', '#333333')
    } else {
      root.style.setProperty('--bg-color', '#ffffff')
      root.style.setProperty('--text-color', '#000000')
      root.style.setProperty('--border-color', '#e0e0e0')
    }

    this.emit('themeChanged', { theme, timestamp: Date.now() })
  }

  /**
   * 启用/禁用动画
   */
  enableAnimations(enabled: boolean): void {
    this.config.animations.enabled = enabled
    const root = document.documentElement

    if (enabled) {
      root.style.removeProperty('--animation-duration')
      root.classList.remove('reduce-motion')
    } else {
      root.style.setProperty('--animation-duration', '0ms')
      root.classList.add('reduce-motion')
    }

    this.emit('animationsToggled', { enabled, timestamp: Date.now() })
  }

  /**
   * 设置动画优化
   */
  private setupAnimationOptimization(): void {
    const root = document.documentElement

    // 检查用户的动画偏好
    if (this.config.animations.respectMotionPreference) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        this.enableAnimations(false)
        return
      }
    }

    // 设置动画参数
    root.style.setProperty('--animation-duration', `${this.config.animations.duration}ms`)
    root.style.setProperty('--animation-easing', this.config.animations.easing)

    // 监听动画偏好变化
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (this.config.animations.respectMotionPreference) {
        this.enableAnimations(!e.matches)
      }
    })
  }

  /**
   * 设置加载优化
   */
  private setupLoadingOptimization(): void {
    // 设置懒加载
    this.setupLazyLoading()

    // 设置进度指示器
    if (this.config.loading.showProgressBar) {
      this.setupProgressBar()
    }

    // 设置骨架屏
    if (this.config.loading.showSkeleton) {
      this.setupSkeletonScreens()
    }
  }

  /**
   * 设置交互优化
   */
  private setupInteractionOptimization(): void {
    // 设置防抖和节流
    this.setupDebounceThrottle()

    // 设置触觉反馈
    if (this.config.interaction.hapticFeedback && 'vibrate' in navigator) {
      this.setupHapticFeedback()
    }

    // 优化点击响应
    this.optimizeClickResponse()
  }

  /**
   * 设置视觉优化
   */
  private setupVisualOptimization(): void {
    // 设置平滑滚动
    if (this.config.visual.smoothScrolling) {
      document.documentElement.style.scrollBehavior = 'smooth'
    }

    // 设置高DPI支持
    if (this.config.visual.highDPI) {
      this.setupHighDPISupport()
    }

    // 监听主题偏好变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.config.visual.colorScheme === 'auto') {
        this.applyTheme('auto')
      }
    })
  }

  /**
   * 设置性能指标收集
   */
  private setupMetricsCollection(): void {
    if (!window.PerformanceObserver) {
      return
    }

    try {
      this.metricsCollector = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          this.processMetricEntry(entry)
        })
      })

      this.metricsCollector.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      })
    } catch (error) {
      console.warn('无法设置性能指标收集:', error)
    }
  }

  /**
   * 设置懒加载
   */
  private setupLazyLoading(): void {
    if (!window.IntersectionObserver) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          this.loadElement(element)
          observer.unobserve(element)
        }
      })
    }, {
      rootMargin: `${this.config.loading.lazyLoadThreshold}px`
    })

    // 观察所有需要懒加载的元素
    document.querySelectorAll('[data-lazy]').forEach(element => {
      observer.observe(element)
    })
  }

  /**
   * 设置进度条
   */
  private setupProgressBar(): void {
    const progressBar = document.createElement('div')
    progressBar.className = 'ux-progress-bar'
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 2px;
      background: #007bff;
      z-index: 9999;
      transition: width 0.3s ease;
    `
    document.body.appendChild(progressBar)

    // 监听加载进度
    this.on('loadProgress', (data) => {
      progressBar.style.width = `${data.progress}%`
      if (data.progress >= 100) {
        setTimeout(() => {
          progressBar.style.opacity = '0'
          setTimeout(() => {
            progressBar.style.width = '0%'
            progressBar.style.opacity = '1'
          }, 300)
        }, 500)
      }
    })
  }

  /**
   * 设置骨架屏
   */
  private setupSkeletonScreens(): void {
    const skeletons = document.querySelectorAll('.skeleton')
    skeletons.forEach(skeleton => {
      skeleton.classList.add('skeleton-loading')
    })
  }

  /**
   * 设置防抖和节流
   */
  private setupDebounceThrottle(): void {
    // 为输入元素添加防抖
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      if (target.dataset.debounce) {
        this.debounce(target.dataset.debounce, () => {
          this.emit('debouncedInput', { target, value: target.value })
        }, this.config.interaction.debounceDelay)
      }
    })

    // 为滚动事件添加节流
    document.addEventListener('scroll', this.throttle(() => {
      this.emit('throttledScroll', { scrollY: window.scrollY })
    }, this.config.interaction.throttleDelay))
  }

  /**
   * 设置触觉反馈
   */
  private setupHapticFeedback(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.dataset.haptic) {
        navigator.vibrate(50) // 短震动
      }
    })
  }

  /**
   * 优化点击响应
   */
  private optimizeClickResponse(): void {
    // 添加视觉反馈
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.classList.contains('clickable')) {
        target.classList.add('clicked')
        setTimeout(() => {
          target.classList.remove('clicked')
        }, 150)
      }
    })
  }

  /**
   * 设置高DPI支持
   */
  private setupHighDPISupport(): void {
    const pixelRatio = window.devicePixelRatio || 1
    if (pixelRatio > 1) {
      document.documentElement.classList.add('high-dpi')
      document.documentElement.style.setProperty('--pixel-ratio', pixelRatio.toString())
    }
  }

  /**
   * 优化动画
   */
  private optimizeAnimations(): void {
    // 检查设备性能
    const isLowEndDevice = this.isLowEndDevice()
    if (isLowEndDevice) {
      this.enableAnimations(false)
    }

    // 优化动画性能
    const animatedElements = document.querySelectorAll('[data-animate]')
    animatedElements.forEach(element => {
      (element as HTMLElement).style.willChange = 'transform, opacity'
    })
  }

  /**
   * 优化加载体验
   */
  private optimizeLoading(): void {
    // 预加载关键资源
    this.preloadCriticalResources()

    // 优化图片加载
    this.optimizeImageLoading()
  }

  /**
   * 优化交互响应
   */
  private optimizeInteraction(): void {
    // 减少输入延迟
    this.reduceInputDelay()

    // 优化滚动性能
    this.optimizeScrollPerformance()
  }

  /**
   * 优化视觉体验
   */
  private optimizeVisual(): void {
    // 优化字体渲染
    this.optimizeFontRendering()

    // 优化颜色对比度
    this.optimizeColorContrast()
  }

  /**
   * 防抖函数
   */
  private debounce(key: string, func: Function, delay: number): void {
    const existingTimer = this.debounceTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      func()
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }

  /**
   * 节流函数
   */
  private throttle(func: Function, delay: number): Function {
    return (...args: any[]) => {
      const now = Date.now()
      const lastCall = this.throttleTimers.get('scroll') || 0

      if (now - lastCall >= delay) {
        this.throttleTimers.set('scroll', now)
        func.apply(this, args)
      }
    }
  }

  /**
   * 加载元素
   */
  private loadElement(element: HTMLElement): void {
    const src = element.dataset.src
    if (src && element.tagName === 'IMG') {
      (element as HTMLImageElement).src = src
      element.removeAttribute('data-src')
    }

    element.classList.remove('lazy')
    element.classList.add('loaded')
  }

  /**
   * 处理性能指标条目
   */
  private processMetricEntry(entry: PerformanceEntry): void {
    this.emit('metricEntry', {
      type: entry.entryType,
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now()
    })
  }

  /**
   * 获取指标值
   */
  private getMetricValue(entries: PerformanceEntry[], name: string): number {
    const entry = entries.find(e => e.name === name)
    return entry ? entry.startTime : 0
  }

  /**
   * 计算累积布局偏移
   */
  private calculateCLS(entries: PerformanceEntry[]): number {
    let cls = 0
    entries.forEach(entry => {
      if (!(entry as any).hadRecentInput) {
        cls += (entry as any).value
      }
    })
    return cls
  }

  /**
   * 计算用户满意度评分
   */
  private calculateUserSatisfactionScore(): number {
    const metrics = this.getMetrics()
    let score = 100

    // 根据各项指标计算评分
    if (metrics.loadTime > 3000) score -= 20
    if (metrics.firstContentfulPaint > 1800) score -= 15
    if (metrics.largestContentfulPaint > 2500) score -= 15
    if (metrics.firstInputDelay > 100) score -= 20
    if (metrics.cumulativeLayoutShift > 0.1) score -= 30

    return Math.max(0, score)
  }

  /**
   * 检查是否为低端设备
   */
  private isLowEndDevice(): boolean {
    const memory = (navigator as any).deviceMemory
    const cores = navigator.hardwareConcurrency
    const connection = (navigator as any).connection

    return (
      (memory && memory < 4) ||
      (cores && cores < 4) ||
      (connection && connection.effectiveType === 'slow-2g')
    )
  }

  /**
   * 预加载关键资源
   */
  private preloadCriticalResources(): void {
    const criticalResources = document.querySelectorAll('[data-preload]')
    criticalResources.forEach(element => {
      const href = element.getAttribute('data-preload')
      if (href) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = href
        link.as = element.tagName.toLowerCase() === 'img' ? 'image' : 'fetch'
        document.head.appendChild(link)
      }
    })
  }

  /**
   * 优化图片加载
   */
  private optimizeImageLoading(): void {
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy'
      }
      if (!img.decoding) {
        img.decoding = 'async'
      }
    })
  }

  /**
   * 减少输入延迟
   */
  private reduceInputDelay(): void {
    const inputs = document.querySelectorAll('input, textarea')
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        (input as HTMLElement).style.willChange = 'contents'
      })
      input.addEventListener('blur', () => {
        (input as HTMLElement).style.willChange = 'auto'
      })
    })
  }

  /**
   * 优化滚动性能
   */
  private optimizeScrollPerformance(): void {
    const scrollableElements = document.querySelectorAll('[data-scrollable]')
    scrollableElements.forEach(element => {
      (element as HTMLElement).style.willChange = 'scroll-position'
    })
  }

  /**
   * 优化字体渲染
   */
  private optimizeFontRendering(): void {
    document.documentElement.style.fontDisplay = 'swap'
  }

  /**
   * 优化颜色对比度
   */
  private optimizeColorContrast(): void {
    // 检查颜色对比度并应用优化
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    }
  }

  /**
   * 销毁用户体验增强器
   */
  destroy(): void {
    if (this.metricsCollector) {
      this.metricsCollector.disconnect()
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
    this.throttleTimers.clear()
    this.loadingIndicators.clear()

    console.log('用户体验增强器已销毁')
    this.emit('destroyed', { timestamp: Date.now() })
  }
}
