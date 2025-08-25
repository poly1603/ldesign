/**
 * 设备服务
 * 提供高级设备检测、适配和回退功能
 */

import type {
  DeviceType,
  EventData,
  EventListener,
  TemplateInfo,
} from '../types'

/**
 * 设备信息接口
 */
interface DeviceInfo {
  type: DeviceType
  screenSize: {
    width: number
    height: number
  }
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
  touchSupport: boolean
  userAgent: string
  platform: string
  browser: {
    name: string
    version: string
  }
  features: {
    webgl: boolean
    canvas: boolean
    localStorage: boolean
    sessionStorage: boolean
    indexedDB: boolean
    serviceWorker: boolean
  }
}

/**
 * 设备规则接口
 */
interface DeviceRule {
  name: string
  condition: (info: DeviceInfo) => boolean
  deviceType: DeviceType
  priority: number
}

/**
 * 适配策略接口
 */
interface AdaptationStrategy {
  name: string
  rules: DeviceRule[]
  fallbackChain: Record<DeviceType, DeviceType[]>
  customLogic?: (info: DeviceInfo, availableTypes: DeviceType[]) => DeviceType | null
}

/**
 * 设备服务类
 */
export class DeviceService {
  private currentDeviceInfo: DeviceInfo | null = null
  private adaptationStrategy: AdaptationStrategy
  private listeners = new Map<string, EventListener[]>()
  private resizeObserver: ResizeObserver | null = null
  private orientationChangeHandler: (() => void) | null = null

  constructor() {
    this.adaptationStrategy = this.createDefaultStrategy()
    this.initializeDeviceDetection()
  }

  /**
   * 创建默认适配策略
   */
  private createDefaultStrategy(): AdaptationStrategy {
    return {
      name: 'default',
      rules: [
        {
          name: 'mobile-phone',
          condition: info => info.screenSize.width <= 480 && info.touchSupport,
          deviceType: 'mobile',
          priority: 10,
        },
        {
          name: 'mobile-landscape',
          condition: info =>
            info.screenSize.width <= 768
            && info.orientation === 'landscape'
            && info.touchSupport,
          deviceType: 'mobile',
          priority: 9,
        },
        {
          name: 'tablet-portrait',
          condition: info =>
            info.screenSize.width > 480
            && info.screenSize.width <= 768
            && info.orientation === 'portrait'
            && info.touchSupport,
          deviceType: 'tablet',
          priority: 8,
        },
        {
          name: 'tablet-landscape',
          condition: info =>
            info.screenSize.width > 768
            && info.screenSize.width <= 1024
            && info.touchSupport,
          deviceType: 'tablet',
          priority: 7,
        },
        {
          name: 'desktop-small',
          condition: info =>
            info.screenSize.width > 1024
            && info.screenSize.width <= 1366,
          deviceType: 'desktop',
          priority: 6,
        },
        {
          name: 'desktop-large',
          condition: info => info.screenSize.width > 1366,
          deviceType: 'desktop',
          priority: 5,
        },
        {
          name: 'fallback-mobile',
          condition: info => info.touchSupport,
          deviceType: 'mobile',
          priority: 1,
        },
        {
          name: 'fallback-desktop',
          condition: () => true,
          deviceType: 'desktop',
          priority: 0,
        },
      ],
      fallbackChain: {
        mobile: ['mobile', 'tablet', 'desktop'],
        tablet: ['tablet', 'desktop', 'mobile'],
        desktop: ['desktop', 'tablet', 'mobile'],
      },
    }
  }

  /**
   * 初始化设备检测
   */
  private initializeDeviceDetection(): void {
    if (typeof window === 'undefined') {
      return
    }

    // 初始检测
    this.updateDeviceInfo()

    // 监听窗口大小变化
    this.setupResizeObserver()

    // 监听方向变化
    this.setupOrientationChangeListener()
  }

  /**
   * 设置窗口大小监听器
   */
  private setupResizeObserver(): void {
    if (typeof window === 'undefined' || !window.ResizeObserver) {
      // 回退到 resize 事件
      let resizeTimer: NodeJS.Timeout
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          this.updateDeviceInfo()
        }, 250)
      })
      return
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateDeviceInfo()
    })

    this.resizeObserver.observe(document.documentElement)
  }

  /**
   * 设置方向变化监听器
   */
  private setupOrientationChangeListener(): void {
    if (typeof window === 'undefined') {
      return
    }

    this.orientationChangeHandler = () => {
      // 延迟更新，等待方向变化完成
      setTimeout(() => {
        this.updateDeviceInfo()
      }, 100)
    }

    // 监听方向变化事件
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', this.orientationChangeHandler)
    }

    // 监听屏幕方向API
    if (screen.orientation) {
      screen.orientation.addEventListener('change', this.orientationChangeHandler)
    }
  }

  /**
   * 更新设备信息
   */
  private updateDeviceInfo(): void {
    const newDeviceInfo = this.detectDeviceInfo()
    const oldDeviceType = this.currentDeviceInfo?.type
    const newDeviceType = newDeviceInfo.type

    this.currentDeviceInfo = newDeviceInfo

    // 如果设备类型发生变化，触发事件
    if (oldDeviceType && oldDeviceType !== newDeviceType) {
      this.emit('device:change', {
        oldDeviceType,
        newDeviceType,
        deviceInfo: newDeviceInfo,
      })
    }

    this.emit('device:update', { deviceInfo: newDeviceInfo })
  }

  /**
   * 检测设备信息
   */
  private detectDeviceInfo(): DeviceInfo {
    const screenSize = {
      width: window.innerWidth || 0,
      height: window.innerHeight || 0,
    }

    const orientation = screenSize.width > screenSize.height ? 'landscape' : 'portrait'
    const pixelRatio = window.devicePixelRatio || 1
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const userAgent = navigator.userAgent
    const platform = navigator.platform || ''

    // 检测浏览器信息
    const browser = this.detectBrowser(userAgent)

    // 检测功能支持
    const features = this.detectFeatures()

    // 根据规则确定设备类型
    const deviceType = this.determineDeviceType({
      type: 'desktop', // 临时值
      screenSize,
      orientation,
      pixelRatio,
      touchSupport,
      userAgent,
      platform,
      browser,
      features,
    })

    return {
      type: deviceType,
      screenSize,
      orientation,
      pixelRatio,
      touchSupport,
      userAgent,
      platform,
      browser,
      features,
    }
  }

  /**
   * 检测浏览器信息
   */
  private detectBrowser(userAgent: string): { name: string, version: string } {
    const browsers = [
      { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
      { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
      { name: 'Safari', pattern: /Safari\/(\d+)/ },
      { name: 'Edge', pattern: /Edge\/(\d+)/ },
      { name: 'IE', pattern: /MSIE (\d+)/ },
    ]

    for (const browser of browsers) {
      const match = userAgent.match(browser.pattern)
      if (match) {
        return {
          name: browser.name,
          version: match[1],
        }
      }
    }

    return { name: 'Unknown', version: '0' }
  }

  /**
   * 检测功能支持
   */
  private detectFeatures(): DeviceInfo['features'] {
    const canvas = document.createElement('canvas')

    return {
      webgl: !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
      canvas: !!canvas.getContext('2d'),
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      serviceWorker: 'serviceWorker' in navigator,
    }
  }

  /**
   * 根据规则确定设备类型
   */
  private determineDeviceType(info: Omit<DeviceInfo, 'type'>): DeviceType {
    // 按优先级排序规则
    const sortedRules = [...this.adaptationStrategy.rules].sort((a, b) => b.priority - a.priority)

    // 找到第一个匹配的规则
    for (const rule of sortedRules) {
      if (rule.condition(info as DeviceInfo)) {
        return rule.deviceType
      }
    }

    // 如果没有规则匹配，返回默认值
    return 'desktop'
  }

  /**
   * 获取当前设备信息
   */
  getDeviceInfo(): DeviceInfo {
    if (!this.currentDeviceInfo) {
      this.updateDeviceInfo()
    }
    return this.currentDeviceInfo!
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDeviceType(): DeviceType {
    return this.getDeviceInfo().type
  }

  /**
   * 选择最适合的模板
   */
  selectBestTemplate(
    category: string,
    availableTemplates: TemplateInfo[],
  ): TemplateInfo | null {
    const currentDeviceType = this.getCurrentDeviceType()
    const categoryTemplates = availableTemplates.filter(t => t.category === category)

    if (categoryTemplates.length === 0) {
      return null
    }

    // 按设备类型分组
    const templatesByDevice = categoryTemplates.reduce((acc, template) => {
      acc[template.deviceType] = template
      return acc
    }, {} as Record<DeviceType, TemplateInfo>)

    // 应用回退链
    const fallbackChain = this.adaptationStrategy.fallbackChain[currentDeviceType] || [currentDeviceType]

    for (const deviceType of fallbackChain) {
      if (templatesByDevice[deviceType]) {
        return templatesByDevice[deviceType]
      }
    }

    // 如果有自定义逻辑，尝试使用
    if (this.adaptationStrategy.customLogic) {
      const availableTypes = Object.keys(templatesByDevice) as DeviceType[]
      const selectedType = this.adaptationStrategy.customLogic(this.getDeviceInfo(), availableTypes)
      if (selectedType && templatesByDevice[selectedType]) {
        return templatesByDevice[selectedType]
      }
    }

    return null
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(
    category: string,
    availableTemplates: TemplateInfo[],
    deviceType?: DeviceType,
  ): boolean {
    const targetDeviceType = deviceType || this.getCurrentDeviceType()
    return availableTemplates.some(t =>
      t.category === category && t.deviceType === targetDeviceType,
    )
  }

  /**
   * 设置自定义适配策略
   */
  setAdaptationStrategy(strategy: Partial<AdaptationStrategy>): void {
    this.adaptationStrategy = {
      ...this.adaptationStrategy,
      ...strategy,
      rules: strategy.rules || this.adaptationStrategy.rules,
      fallbackChain: strategy.fallbackChain || this.adaptationStrategy.fallbackChain,
    }

    // 重新检测设备类型
    this.updateDeviceInfo()
  }

  /**
   * 添加自定义规则
   */
  addRule(rule: DeviceRule): void {
    this.adaptationStrategy.rules.push(rule)
    this.adaptationStrategy.rules.sort((a, b) => b.priority - a.priority)
    this.updateDeviceInfo()
  }

  /**
   * 移除规则
   */
  removeRule(ruleName: string): boolean {
    const index = this.adaptationStrategy.rules.findIndex(r => r.name === ruleName)
    if (index > -1) {
      this.adaptationStrategy.rules.splice(index, 1)
      this.updateDeviceInfo()
      return true
    }
    return false
  }

  /**
   * 获取适配策略
   */
  getAdaptationStrategy(): AdaptationStrategy {
    return { ...this.adaptationStrategy }
  }

  /**
   * 强制设备类型（用于测试）
   */
  forceDeviceType(deviceType: DeviceType): void {
    if (this.currentDeviceInfo) {
      const oldDeviceType = this.currentDeviceInfo.type
      this.currentDeviceInfo.type = deviceType

      this.emit('device:change', {
        oldDeviceType,
        newDeviceType: deviceType,
        forced: true,
        deviceInfo: this.currentDeviceInfo,
      })
    }
  }

  /**
   * 重置设备检测
   */
  resetDetection(): void {
    this.updateDeviceInfo()
  }

  /**
   * 事件发射器
   */
  private emit(type: string, data: any): void {
    const eventData: EventData = {
      type: type as any,
      timestamp: Date.now(),
      data,
    }

    const listeners = this.listeners.get(type) || []
    listeners.forEach((listener) => {
      try {
        listener(eventData)
      }
      catch (error) {
        console.error(`Error in device service event listener for ${type}:`, error)
      }
    })
  }

  /**
   * 添加事件监听器
   */
  on(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    // 清理方向变化监听器
    if (this.orientationChangeHandler && typeof window !== 'undefined') {
      if ('onorientationchange' in window) {
        window.removeEventListener('orientationchange', this.orientationChangeHandler)
      }
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', this.orientationChangeHandler)
      }
      this.orientationChangeHandler = null
    }

    this.listeners.clear()
    this.currentDeviceInfo = null
  }
}
