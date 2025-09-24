/**
 * 移动端适配器
 * 
 * 负责移动端设备的适配，包括响应式布局、触摸交互、性能优化等
 */

import { EventEmitter } from 'events'
import type {
  IMobileAdapter,
  DeviceInfo,
  MobileAdapterConfig
} from './types'

/**
 * 移动端适配器实现
 */
export class MobileAdapter extends EventEmitter implements IMobileAdapter {
  private config: MobileAdapterConfig
  private deviceInfo: DeviceInfo
  private touchStartTime: number = 0
  private touchStartPos: { x: number; y: number } = { x: 0, y: 0 }
  private isLongPress: boolean = false
  private longPressTimer?: NodeJS.Timeout
  private orientationChangeTimer?: NodeJS.Timeout

  constructor(config: MobileAdapterConfig) {
    super()
    this.config = {
      enabled: true,
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
      },
      touch: {
        tapDelay: 300,
        longPressDelay: 500,
        swipeThreshold: 50,
        pinchThreshold: 10
      },
      layout: {
        responsive: true,
        scaleFactor: 1,
        minZoom: 0.5,
        maxZoom: 3
      },
      performance: {
        reducedMotion: false,
        lowPowerMode: false,
        dataSaver: false
      },
      ...config
    }

    this.deviceInfo = this.detectDeviceInfo()

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化移动端适配器
   */
  private initialize(): void {
    // 设置视口
    this.setupViewport()

    // 设置响应式布局
    if (this.config.layout.responsive) {
      this.setupResponsiveLayout()
    }

    // 设置触摸交互
    this.setupTouchInteraction()

    // 设置方向变化处理
    this.setupOrientationHandling()

    // 设置性能优化
    this.setupPerformanceOptimization()

    // 执行初始适配
    this.adapt()

    console.log('移动端适配器已初始化', this.deviceInfo)
    this.emit('initialized', { deviceInfo: this.deviceInfo, timestamp: Date.now() })
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo
  }

  /**
   * 执行适配
   */
  adapt(): void {
    console.log('执行移动端适配...')

    // 根据设备类型应用适配
    switch (this.deviceInfo.type) {
      case 'mobile':
        this.adaptForMobile()
        break
      case 'tablet':
        this.adaptForTablet()
        break
      case 'desktop':
        this.adaptForDesktop()
        break
    }

    // 应用网络优化
    this.applyNetworkOptimization()

    // 应用性能优化
    this.applyPerformanceOptimization()

    this.emit('adapted', { deviceInfo: this.deviceInfo, timestamp: Date.now() })
  }

  /**
   * 处理方向变化
   */
  handleOrientationChange(): void {
    // 防抖处理方向变化
    if (this.orientationChangeTimer) {
      clearTimeout(this.orientationChangeTimer)
    }

    this.orientationChangeTimer = setTimeout(() => {
      console.log('处理方向变化')
      
      // 更新设备信息
      this.deviceInfo = this.detectDeviceInfo()
      
      // 重新适配
      this.adapt()
      
      // 触发重新布局
      this.triggerReflow()

      this.emit('orientationChanged', {
        orientation: this.deviceInfo.screen.orientation,
        deviceInfo: this.deviceInfo,
        timestamp: Date.now()
      })
    }, 100)
  }

  /**
   * 针对设备优化
   */
  optimizeForDevice(): void {
    console.log('针对设备进行优化...')

    // 根据设备性能调整
    if (this.isLowEndDevice()) {
      this.applyLowEndOptimizations()
    }

    // 根据网络状况调整
    if (this.isSlowNetwork()) {
      this.applySlowNetworkOptimizations()
    }

    // 根据电池状态调整
    if (this.isLowBattery()) {
      this.applyLowBatteryOptimizations()
    }

    this.emit('optimized', { timestamp: Date.now() })
  }

  /**
   * 检测设备信息
   */
  private detectDeviceInfo(): DeviceInfo {
    const screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' as const : 'portrait' as const
    }

    const touch = {
      supported: 'ontouchstart' in window,
      maxPoints: navigator.maxTouchPoints || 0,
      pressure: 'force' in TouchEvent.prototype
    }

    const connection = (navigator as any).connection || {}
    const network = {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0
    }

    const performance = {
      memory: (navigator as any).deviceMemory || 0,
      cores: navigator.hardwareConcurrency || 0,
      gpu: this.detectGPU()
    }

    const type = this.detectDeviceType(screen.width)

    return {
      type,
      screen,
      touch,
      network,
      performance
    }
  }

  /**
   * 检测设备类型
   */
  private detectDeviceType(width: number): 'desktop' | 'tablet' | 'mobile' {
    if (width < this.config.breakpoints.mobile) {
      return 'mobile'
    } else if (width < this.config.breakpoints.tablet) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  /**
   * 检测GPU信息
   */
  private detectGPU(): string {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
      }
    }
    
    return 'unknown'
  }

  /**
   * 设置视口
   */
  private setupViewport(): void {
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    
    if (!viewport) {
      viewport = document.createElement('meta')
      viewport.name = 'viewport'
      document.head.appendChild(viewport)
    }

    // 根据设备类型设置视口
    if (this.deviceInfo.type === 'mobile') {
      viewport.content = 'width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes'
    } else {
      viewport.content = 'width=device-width, initial-scale=1'
    }
  }

  /**
   * 设置响应式布局
   */
  private setupResponsiveLayout(): void {
    // 添加响应式CSS类
    document.documentElement.classList.add('responsive')
    document.documentElement.classList.add(`device-${this.deviceInfo.type}`)

    // 设置CSS自定义属性
    const root = document.documentElement
    root.style.setProperty('--screen-width', `${this.deviceInfo.screen.width}px`)
    root.style.setProperty('--screen-height', `${this.deviceInfo.screen.height}px`)
    root.style.setProperty('--device-pixel-ratio', this.deviceInfo.screen.ratio.toString())

    // 监听窗口大小变化
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize()
    }, 250))
  }

  /**
   * 设置触摸交互
   */
  private setupTouchInteraction(): void {
    if (!this.deviceInfo.touch.supported) {
      return
    }

    // 设置触摸事件处理
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })

    // 禁用默认的触摸行为
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault() // 防止双指缩放
      }
    })

    // 设置手势识别
    this.setupGestureRecognition()
  }

  /**
   * 设置方向变化处理
   */
  private setupOrientationHandling(): void {
    // 监听方向变化
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange()
    })

    // 监听窗口大小变化（作为方向变化的备选）
    window.addEventListener('resize', this.debounce(() => {
      const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      if (newOrientation !== this.deviceInfo.screen.orientation) {
        this.handleOrientationChange()
      }
    }, 100))
  }

  /**
   * 设置性能优化
   */
  private setupPerformanceOptimization(): void {
    // 检测低功耗模式
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          this.config.performance.lowPowerMode = true
          this.applyLowBatteryOptimizations()
        }
      })
    }

    // 检测数据节省模式
    const connection = (navigator as any).connection
    if (connection && connection.saveData) {
      this.config.performance.dataSaver = true
      this.applyDataSaverOptimizations()
    }

    // 检测动画偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      this.config.performance.reducedMotion = true
    }
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(e: TouchEvent): void {
    this.touchStartTime = Date.now()
    this.touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    this.isLongPress = false

    // 设置长按定时器
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true
      this.emit('longPress', {
        x: this.touchStartPos.x,
        y: this.touchStartPos.y,
        timestamp: Date.now()
      })
    }, this.config.touch.longPressDelay)
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(e: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = undefined
    }

    const currentPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }

    const deltaX = currentPos.x - this.touchStartPos.x
    const deltaY = currentPos.y - this.touchStartPos.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance > this.config.touch.swipeThreshold) {
      this.emit('swipe', {
        direction: this.getSwipeDirection(deltaX, deltaY),
        distance,
        deltaX,
        deltaY,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = undefined
    }

    const touchDuration = Date.now() - this.touchStartTime

    if (!this.isLongPress && touchDuration < this.config.touch.tapDelay) {
      this.emit('tap', {
        x: this.touchStartPos.x,
        y: this.touchStartPos.y,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 设置手势识别
   */
  private setupGestureRecognition(): void {
    let initialDistance = 0
    let initialScale = 1

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getDistance(e.touches[0], e.touches[1])
        initialScale = this.config.layout.scaleFactor
      }
    })

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1])
        const scale = (currentDistance / initialDistance) * initialScale

        if (Math.abs(scale - initialScale) > this.config.touch.pinchThreshold / 100) {
          this.emit('pinch', {
            scale,
            center: this.getCenter(e.touches[0], e.touches[1]),
            timestamp: Date.now()
          })
        }
      }
    })
  }

  /**
   * 适配移动设备
   */
  private adaptForMobile(): void {
    document.documentElement.classList.add('mobile-layout')
    
    // 调整字体大小
    document.documentElement.style.fontSize = '14px'
    
    // 调整触摸目标大小
    const style = document.createElement('style')
    style.textContent = `
      .mobile-layout button,
      .mobile-layout .clickable {
        min-height: 44px;
        min-width: 44px;
        padding: 12px;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 适配平板设备
   */
  private adaptForTablet(): void {
    document.documentElement.classList.add('tablet-layout')
    document.documentElement.style.fontSize = '16px'
  }

  /**
   * 适配桌面设备
   */
  private adaptForDesktop(): void {
    document.documentElement.classList.add('desktop-layout')
    document.documentElement.style.fontSize = '16px'
  }

  /**
   * 应用网络优化
   */
  private applyNetworkOptimization(): void {
    if (this.isSlowNetwork()) {
      // 减少网络请求
      document.documentElement.classList.add('slow-network')
      
      // 禁用自动播放
      const videos = document.querySelectorAll('video')
      videos.forEach(video => {
        video.autoplay = false
        video.preload = 'none'
      })
    }
  }

  /**
   * 应用性能优化
   */
  private applyPerformanceOptimization(): void {
    if (this.isLowEndDevice()) {
      this.applyLowEndOptimizations()
    }
  }

  /**
   * 应用低端设备优化
   */
  private applyLowEndOptimizations(): void {
    document.documentElement.classList.add('low-end-device')
    
    // 禁用动画
    document.documentElement.style.setProperty('--animation-duration', '0ms')
    
    // 减少视觉效果
    const style = document.createElement('style')
    style.textContent = `
      .low-end-device * {
        box-shadow: none !important;
        text-shadow: none !important;
        filter: none !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 应用慢网络优化
   */
  private applySlowNetworkOptimizations(): void {
    // 延迟加载非关键资源
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy'
      }
    })
  }

  /**
   * 应用低电量优化
   */
  private applyLowBatteryOptimizations(): void {
    document.documentElement.classList.add('low-battery')
    
    // 减少CPU使用
    this.config.performance.reducedMotion = true
    
    // 降低刷新率
    const style = document.createElement('style')
    style.textContent = `
      .low-battery * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 应用数据节省优化
   */
  private applyDataSaverOptimizations(): void {
    document.documentElement.classList.add('data-saver')
    
    // 禁用自动加载
    const iframes = document.querySelectorAll('iframe')
    iframes.forEach(iframe => {
      iframe.loading = 'lazy'
    })
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    const oldDeviceType = this.deviceInfo.type
    this.deviceInfo = this.detectDeviceInfo()
    
    if (oldDeviceType !== this.deviceInfo.type) {
      // 设备类型发生变化，重新适配
      this.adapt()
    }

    this.emit('resize', {
      deviceInfo: this.deviceInfo,
      timestamp: Date.now()
    })
  }

  /**
   * 触发重新布局
   */
  private triggerReflow(): void {
    // 强制重新计算布局
    document.body.offsetHeight
    
    // 触发自定义重新布局事件
    this.emit('reflow', { timestamp: Date.now() })
  }

  /**
   * 获取滑动方向
   */
  private getSwipeDirection(deltaX: number, deltaY: number): string {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }

  /**
   * 获取两点距离
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const deltaX = touch1.clientX - touch2.clientX
    const deltaY = touch1.clientY - touch2.clientY
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

  /**
   * 获取两点中心
   */
  private getCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  /**
   * 检查是否为低端设备
   */
  private isLowEndDevice(): boolean {
    const { memory, cores } = this.deviceInfo.performance
    return memory < 4 || cores < 4
  }

  /**
   * 检查是否为慢网络
   */
  private isSlowNetwork(): boolean {
    const { effectiveType } = this.deviceInfo.network
    return effectiveType === 'slow-2g' || effectiveType === '2g'
  }

  /**
   * 检查是否为低电量
   */
  private isLowBattery(): boolean {
    return this.config.performance.lowPowerMode
  }

  /**
   * 防抖函数
   */
  private debounce(func: Function, delay: number): Function {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }

  /**
   * 销毁移动端适配器
   */
  destroy(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
    }

    if (this.orientationChangeTimer) {
      clearTimeout(this.orientationChangeTimer)
    }

    // 移除事件监听器
    window.removeEventListener('orientationchange', this.handleOrientationChange)
    window.removeEventListener('resize', this.handleResize)

    console.log('移动端适配器已销毁')
    this.emit('destroyed', { timestamp: Date.now() })
  }
}
