/**
 * 响应式管理器
 */

import type {
  WatermarkInstance,
  ResponsiveConfig,
  Breakpoint,
  MediaQuery,
  DeviceInfo,
  ContainerInfo,
  ResponsiveManager as IResponsiveManager,
  ResponsiveEvents,
  AdaptiveStrategy,
  AdaptiveConfig,
  BreakpointManager,
  MediaQueryManager,
  ResizeObserverConfig
} from '../types'

import { WatermarkError, WatermarkErrorCode, ErrorSeverity } from '../types/error'
import { generateId } from '../utils/id-generator'

/**
 * 响应式管理器
 * 负责水印的响应式布局和设备适配
 */
export class ResponsiveManager implements IResponsiveManager {
  private instances = new Map<string, WatermarkInstance>()
  private breakpoints = new Map<string, Breakpoint>()
  private mediaQueries = new Map<string, MediaQueryList>()
  private resizeObserver?: ResizeObserver
  private deviceInfo: DeviceInfo
  private containerInfos = new Map<string, ContainerInfo>()
  private eventListeners = new Map<string, EventListener[]>()
  private adaptiveStrategies = new Map<string, AdaptiveStrategy>()
  private config: ResponsiveConfig
  private initialized = false

  constructor(config: ResponsiveConfig) {
    this.config = { ...config }
    this.deviceInfo = this.detectDevice()
    this.setupDefaultBreakpoints()
    this.setupDefaultStrategies()
  }

  /**
   * 初始化响应式管理器
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    // 设置媒体查询监听
    this.setupMediaQueries()
    
    // 设置ResizeObserver
    this.setupResizeObserver()
    
    // 监听窗口变化
    this.setupWindowListeners()
    
    // 监听设备方向变化
    this.setupOrientationListeners()
    
    this.initialized = true
  }

  /**
   * 注册实例
   */
  async registerInstance(instance: WatermarkInstance): Promise<void> {
    this.instances.set(instance.id, instance)
    
    // 获取容器信息
    const containerInfo = this.getContainerInfo(instance.container)
    this.containerInfos.set(instance.id, containerInfo)
    
    // 应用响应式配置
    await this.applyResponsiveConfig(instance)
    
    // 开始观察容器
    if (this.resizeObserver && instance.container) {
      this.resizeObserver.observe(instance.container)
    }
  }

  /**
   * 注销实例
   */
  async unregisterInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      return
    }

    // 停止观察容器
    if (this.resizeObserver && instance.container) {
      this.resizeObserver.unobserve(instance.container)
    }
    
    // 清理数据
    this.instances.delete(instanceId)
    this.containerInfos.delete(instanceId)
    this.eventListeners.delete(instanceId)
  }

  /**
   * 更新实例响应式配置
   */
  async updateInstance(instance: WatermarkInstance): Promise<void> {
    if (!this.instances.has(instance.id)) {
      return
    }

    this.instances.set(instance.id, instance)
    await this.applyResponsiveConfig(instance)
  }

  /**
   * 获取当前断点
   */
  getCurrentBreakpoint(): Breakpoint | null {
    const width = window.innerWidth
    
    // 按宽度从大到小排序，找到第一个匹配的断点
    const sortedBreakpoints = Array.from(this.breakpoints.values())
      .sort((a, b) => b.minWidth - a.minWidth)
    
    for (const breakpoint of sortedBreakpoints) {
      if (width >= breakpoint.minWidth && 
          (!breakpoint.maxWidth || width <= breakpoint.maxWidth)) {
        return breakpoint
      }
    }
    
    return null
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  /**
   * 获取容器信息
   */
  getContainerInfo(container: Element): ContainerInfo {
    const rect = container.getBoundingClientRect()
    const style = window.getComputedStyle(container)
    
    return {
      width: rect.width,
      height: rect.height,
      aspectRatio: rect.width / rect.height,
      position: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom
      },
      padding: {
        top: parseFloat(style.paddingTop),
        right: parseFloat(style.paddingRight),
        bottom: parseFloat(style.paddingBottom),
        left: parseFloat(style.paddingLeft)
      },
      margin: {
        top: parseFloat(style.marginTop),
        right: parseFloat(style.marginRight),
        bottom: parseFloat(style.marginBottom),
        left: parseFloat(style.marginLeft)
      },
      scrollable: {
        horizontal: container.scrollWidth > container.clientWidth,
        vertical: container.scrollHeight > container.clientHeight
      }
    }
  }

  /**
   * 添加断点
   */
  addBreakpoint(breakpoint: Breakpoint): void {
    this.breakpoints.set(breakpoint.name, breakpoint)
    this.setupMediaQuery(breakpoint)
  }

  /**
   * 移除断点
   */
  removeBreakpoint(name: string): boolean {
    const removed = this.breakpoints.delete(name)
    if (removed) {
      const mediaQuery = this.mediaQueries.get(name)
      if (mediaQuery) {
        // 移除监听器
        const listeners = this.eventListeners.get(name) || []
        listeners.forEach(listener => {
          mediaQuery.removeEventListener('change', listener)
        })
        this.mediaQueries.delete(name)
        this.eventListeners.delete(name)
      }
    }
    return removed
  }

  /**
   * 添加自适应策略
   */
  addAdaptiveStrategy(name: string, strategy: AdaptiveStrategy): void {
    this.adaptiveStrategies.set(name, strategy)
  }

  /**
   * 移除自适应策略
   */
  removeAdaptiveStrategy(name: string): boolean {
    return this.adaptiveStrategies.delete(name)
  }

  /**
   * 手动触发响应式更新
   */
  async triggerUpdate(instanceId?: string): Promise<void> {
    if (instanceId) {
      const instance = this.instances.get(instanceId)
      if (instance) {
        await this.handleInstanceResize(instance)
      }
    } else {
      // 更新所有实例
      for (const instance of this.instances.values()) {
        await this.handleInstanceResize(instance)
      }
    }
  }

  /**
   * 获取响应式状态
   */
  getState(): {
    currentBreakpoint: Breakpoint | null
    deviceInfo: DeviceInfo
    registeredInstances: number
    activeBreakpoints: string[]
  } {
    return {
      currentBreakpoint: this.getCurrentBreakpoint(),
      deviceInfo: this.getDeviceInfo(),
      registeredInstances: this.instances.size,
      activeBreakpoints: Array.from(this.breakpoints.keys())
    }
  }

  /**
   * 销毁响应式管理器
   */
  async dispose(): Promise<void> {
    // 停止ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = undefined
    }

    // 移除媒体查询监听器
    for (const [name, mediaQuery] of this.mediaQueries) {
      const listeners = this.eventListeners.get(name) || []
      listeners.forEach(listener => {
        mediaQuery.removeEventListener('change', listener)
      })
    }

    // 移除窗口监听器
    window.removeEventListener('resize', this.handleWindowResize)
    window.removeEventListener('orientationchange', this.handleOrientationChange)

    // 清理数据
    this.instances.clear()
    this.breakpoints.clear()
    this.mediaQueries.clear()
    this.containerInfos.clear()
    this.eventListeners.clear()
    this.adaptiveStrategies.clear()

    this.initialized = false
  }

  // 私有方法

  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()
    
    // 检测设备类型
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop'
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      type = 'mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
      type = 'tablet'
    }

    // 检测操作系统
    let os = 'unknown'
    if (/windows/i.test(userAgent)) os = 'windows'
    else if (/mac/i.test(userAgent)) os = 'macos'
    else if (/linux/i.test(userAgent)) os = 'linux'
    else if (/android/i.test(userAgent)) os = 'android'
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'ios'

    // 检测浏览器
    let browser = 'unknown'
    if (/chrome/i.test(userAgent)) browser = 'chrome'
    else if (/firefox/i.test(userAgent)) browser = 'firefox'
    else if (/safari/i.test(userAgent)) browser = 'safari'
    else if (/edge/i.test(userAgent)) browser = 'edge'

    return {
      type,
      os,
      browser,
      userAgent,
      platform,
      screenSize: {
        width: screen.width,
        height: screen.height
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      touchSupport: 'ontouchstart' in window,
      retina: window.devicePixelRatio > 1
    }
  }

  private setupDefaultBreakpoints(): void {
    const defaultBreakpoints: Breakpoint[] = [
      { name: 'xs', minWidth: 0, maxWidth: 575 },
      { name: 'sm', minWidth: 576, maxWidth: 767 },
      { name: 'md', minWidth: 768, maxWidth: 991 },
      { name: 'lg', minWidth: 992, maxWidth: 1199 },
      { name: 'xl', minWidth: 1200, maxWidth: 1399 },
      { name: 'xxl', minWidth: 1400 }
    ]

    defaultBreakpoints.forEach(bp => this.addBreakpoint(bp))
  }

  private setupDefaultStrategies(): void {
    // 缩放策略
    this.addAdaptiveStrategy('scale', {
      name: 'scale',
      apply: async (instance, containerInfo, deviceInfo) => {
        const baseWidth = 1200
        const scale = Math.min(containerInfo.width / baseWidth, 1)
        
        // 应用缩放
        instance.elements.forEach(element => {
          element.style.transform = `scale(${scale})`
          element.style.transformOrigin = 'top left'
        })
      }
    })

    // 重排策略
    this.addAdaptiveStrategy('reflow', {
      name: 'reflow',
      apply: async (instance, containerInfo, deviceInfo) => {
        const isMobile = deviceInfo.type === 'mobile'
        const config = instance.config
        
        if (isMobile && config.layout) {
          // 移动端调整布局
          config.layout.gap = Math.max(config.layout.gap * 0.5, 10)
          config.layout.padding = Math.max(config.layout.padding * 0.5, 5)
        }
      }
    })

    // 隐藏策略
    this.addAdaptiveStrategy('hide', {
      name: 'hide',
      apply: async (instance, containerInfo, deviceInfo) => {
        const shouldHide = containerInfo.width < 480 || containerInfo.height < 320
        
        instance.elements.forEach(element => {
          element.style.display = shouldHide ? 'none' : ''
        })
      }
    })
  }

  private setupMediaQueries(): void {
    for (const breakpoint of this.breakpoints.values()) {
      this.setupMediaQuery(breakpoint)
    }
  }

  private setupMediaQuery(breakpoint: Breakpoint): void {
    let query = `(min-width: ${breakpoint.minWidth}px)`
    if (breakpoint.maxWidth) {
      query += ` and (max-width: ${breakpoint.maxWidth}px)`
    }

    const mediaQuery = window.matchMedia(query)
    this.mediaQueries.set(breakpoint.name, mediaQuery)

    const listener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        this.handleBreakpointChange(breakpoint)
      }
    }

    mediaQuery.addEventListener('change', listener)
    
    if (!this.eventListeners.has(breakpoint.name)) {
      this.eventListeners.set(breakpoint.name, [])
    }
    this.eventListeners.get(breakpoint.name)!.push(listener)
  }

  private setupResizeObserver(): void {
    if (!window.ResizeObserver) {
      console.warn('ResizeObserver not supported')
      return
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target
        
        // 找到对应的实例
        for (const instance of this.instances.values()) {
          if (instance.container === element) {
            this.handleInstanceResize(instance)
            break
          }
        }
      }
    })
  }

  private setupWindowListeners(): void {
    window.addEventListener('resize', this.handleWindowResize)
  }

  private setupOrientationListeners(): void {
    window.addEventListener('orientationchange', this.handleOrientationChange)
  }

  private handleWindowResize = async (): Promise<void> => {
    // 更新设备信息
    this.deviceInfo = this.detectDevice()
    
    // 触发所有实例更新
    await this.triggerUpdate()
  }

  private handleOrientationChange = async (): Promise<void> => {
    // 延迟处理，等待方向变化完成
    setTimeout(async () => {
      this.deviceInfo = this.detectDevice()
      await this.triggerUpdate()
    }, 100)
  }

  private async handleBreakpointChange(breakpoint: Breakpoint): Promise<void> {
    // 触发断点变化事件
    for (const instance of this.instances.values()) {
      await this.applyBreakpointConfig(instance, breakpoint)
    }
  }

  private async handleInstanceResize(instance: WatermarkInstance): Promise<void> {
    if (!instance.container) {
      return
    }

    // 更新容器信息
    const containerInfo = this.getContainerInfo(instance.container)
    this.containerInfos.set(instance.id, containerInfo)

    // 应用响应式配置
    await this.applyResponsiveConfig(instance)
  }

  private async applyResponsiveConfig(instance: WatermarkInstance): Promise<void> {
    const responsiveConfig = instance.config.responsive
    if (!responsiveConfig || !responsiveConfig.enabled) {
      return
    }

    const containerInfo = this.containerInfos.get(instance.id)
    if (!containerInfo) {
      return
    }

    // 应用断点配置
    const currentBreakpoint = this.getCurrentBreakpoint()
    if (currentBreakpoint) {
      await this.applyBreakpointConfig(instance, currentBreakpoint)
    }

    // 应用自适应策略
    if (responsiveConfig.adaptive && responsiveConfig.adaptive.enabled) {
      await this.applyAdaptiveStrategies(instance, containerInfo)
    }
  }

  private async applyBreakpointConfig(
    instance: WatermarkInstance, 
    breakpoint: Breakpoint
  ): Promise<void> {
    const responsiveConfig = instance.config.responsive
    if (!responsiveConfig || !responsiveConfig.breakpoints) {
      return
    }

    const breakpointConfig = responsiveConfig.breakpoints[breakpoint.name]
    if (!breakpointConfig) {
      return
    }

    // 应用断点特定的配置
    if (breakpointConfig.content) {
      Object.assign(instance.config.content, breakpointConfig.content)
    }
    
    if (breakpointConfig.style) {
      Object.assign(instance.config.style, breakpointConfig.style)
    }
    
    if (breakpointConfig.layout) {
      Object.assign(instance.config.layout, breakpointConfig.layout)
    }

    // 触发重新渲染
    // 这里需要调用实例的更新方法
  }

  private async applyAdaptiveStrategies(
    instance: WatermarkInstance,
    containerInfo: ContainerInfo
  ): Promise<void> {
    const adaptiveConfig = instance.config.responsive?.adaptive
    if (!adaptiveConfig || !adaptiveConfig.enabled) {
      return
    }

    const strategies = adaptiveConfig.strategies || ['scale']
    
    for (const strategyName of strategies) {
      const strategy = this.adaptiveStrategies.get(strategyName)
      if (strategy) {
        try {
          await strategy.apply(instance, containerInfo, this.deviceInfo)
        } catch (error) {
          console.error(`Failed to apply adaptive strategy ${strategyName}:`, error)
        }
      }
    }
  }
}