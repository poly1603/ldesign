import type {
  DeviceType,
  TemplateChangeEvent,
  TemplateComponent,
  TemplateLoadResult,
  TemplateManagerConfig,
  TemplateMetadata,
  TemplateRenderOptions,
  TemplateScanResult,
  TemplateConfig,
} from '../types'
import { type Component, defineAsyncComponent } from 'vue'
import { TemplateLoadingState } from '../types'
import { TemplateCache } from '../utils/cache'
import { createDeviceWatcher, detectDevice } from '../utils/device'
import { TemplateScanner } from '../utils/scanner'
import { templateRegistry } from './template-registry'

// 合并 template-manager.ts 的类型定义
export interface TemplateInfo {
  id: string
  name: string
  category: string
  device: DeviceType
  variant: string
  isDefault: boolean
  config: TemplateConfig
  component: any
}

export interface TemplateRegistry {
  [category: string]: {
    [device: string]: {
      [variant: string]: TemplateInfo
    }
  }
}

/**
 * 事件发射器
 */
class EventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<Function>>()

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)

    return () => this.off(event, listener)
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    this.listeners.get(event)?.delete(listener)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(data)
      }
      catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error)
      }
    })
  }

  removeAllListeners(): void {
    this.listeners.clear()
  }
}

/**
 * 模板管理器
 */
export class TemplateManager extends EventEmitter<{
  'template:change': TemplateChangeEvent
  'template:load': TemplateLoadResult
  'template:error': Error
  'device:change': DeviceType
}> {
  private config: Required<TemplateManagerConfig>
  private scanner: TemplateScanner
  private cache: TemplateCache
  private currentTemplate?: TemplateMetadata
  private currentDevice: DeviceType
  private deviceWatcherCleanup?: () => void
  private loadingPromises = new Map<string, Promise<TemplateLoadResult>>()

  constructor(config: TemplateManagerConfig = {}) {
    super()

    // 合并默认配置
    this.config = {
      templateRoot: 'src/templates',
      deviceDetection: {
        mobileBreakpoint: 768,
        tabletBreakpoint: 992,
        desktopBreakpoint: 1200,
        ...config.deviceDetection,
      },
      enableCache: true,
      cacheLimit: 50,
      enablePreload: false,
      preloadTemplates: [],
      defaultDevice: 'desktop',
      ...config,
    }

    this.scanner = new TemplateScanner(this.config.templateRoot)
    this.cache = new TemplateCache(this.config.cacheLimit)
    this.currentDevice = detectDevice(this.config.deviceDetection)

    this.initializeDeviceWatcher()
  }

  /**
   * 初始化设备监听器
   */
  private initializeDeviceWatcher(): void {
    if (typeof window === 'undefined')
      return

    this.deviceWatcherCleanup = createDeviceWatcher(
      (device) => {
        const oldDevice = this.currentDevice
        this.currentDevice = device
        this.emit('device:change', device)

        // 如果当前有模板且设备变化，尝试切换到对应设备的模板
        if (this.currentTemplate && oldDevice !== device) {
          this.autoSwitchDeviceTemplate(device)
        }
      },
      this.config.deviceDetection,
    )
  }

  /**
   * 自动切换设备模板
   */
  private async autoSwitchDeviceTemplate(device: DeviceType): Promise<void> {
    if (!this.currentTemplate)
      return

    try {
      // 查找相同分类和模板名称但不同设备的模板
      const templates = await this.getAvailableTemplates(this.currentTemplate.category, device)
      const targetTemplate = templates.find(t => t.template === this.currentTemplate!.template)

      if (targetTemplate) {
        await this.switch(targetTemplate.category, device, targetTemplate.template)
      }
    }
    catch (error) {
      console.warn('Failed to auto-switch device template:', error)
    }
  }

  /**
   * 扫描模板
   */
  async scanTemplates(): Promise<TemplateScanResult> {
    try {
      const result = await this.scanner.scanTemplates()

      // 预加载指定的模板
      if (this.config.enablePreload && this.config.preloadTemplates.length > 0) {
        this.preloadTemplates(this.config.preloadTemplates)
      }

      return result
    }
    catch (error) {
      const err = error as Error
      this.emit('template:error', err)
      throw err
    }
  }

  /**
   * 预加载模板
   */
  private async preloadTemplates(templateKeys: string[]): Promise<void> {
    const preloadPromises = templateKeys.map(async (key) => {
      try {
        const [category, device, template] = key.split(':')
        if (category && device && template) {
          await this.loadTemplate(category, device as DeviceType, template)
        }
      }
      catch (error) {
        console.warn(`Failed to preload template ${key}:`, error)
      }
    })

    await Promise.allSettled(preloadPromises)
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(category: string, device: DeviceType, template: string): string {
    return `${category}:${device}:${template}`
  }

  /**
   * 加载模板组件
   */
  private async loadTemplate(
    category: string,
    device: DeviceType,
    template: string,
  ): Promise<TemplateLoadResult> {
    const cacheKey = this.getCacheKey(category, device, template)

    // 检查是否正在加载
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!
    }

    // 检查缓存
    if (this.config.enableCache) {
      const cached = this.cache.getComponent(category, device, template)
      if (cached) {
        return {
          state: TemplateLoadingState.LOADED,
          component: cached,
          duration: 0,
        }
      }
    }

    // 开始加载
    const loadPromise = this.performTemplateLoad(category, device, template)
    this.loadingPromises.set(cacheKey, loadPromise)

    try {
      const result = await loadPromise
      this.emit('template:load', result)
      return result
    }
    finally {
      this.loadingPromises.delete(cacheKey)
    }
  }

  /**
   * 执行模板加载
   */
  private async performTemplateLoad(
    category: string,
    device: DeviceType,
    template: string,
  ): Promise<TemplateLoadResult> {
    const startTime = Date.now()

    try {
      // 查找模板元数据
      const metadata = this.scanner.findTemplate(category, device, template)
      if (!metadata) {
        throw new Error(`Template not found: ${category}/${device}/${template}`)
      }

      // 使用模板注册表加载组件
      const component = await templateRegistry.loadTemplateComponent(metadata)

      const templateComponent: TemplateComponent = {
        component,
        metadata,
        loaded: true,
        loadedAt: Date.now(),
      }

      // 缓存组件
      if (this.config.enableCache) {
        this.cache.setComponent(category, device, template, templateComponent)
      }

      const duration = Date.now() - startTime

      return {
        state: TemplateLoadingState.LOADED,
        component: templateComponent,
        duration,
      }
    }
    catch (error) {
      const duration = Date.now() - startTime
      const err = error as Error

      this.emit('template:error', err)

      return {
        state: TemplateLoadingState.ERROR,
        error: err,
        duration,
      }
    }
  }

  /**
   * 渲染模板
   */
  async render(options: TemplateRenderOptions): Promise<Component> {
    const { category, template, props: _props = {} } = options
    const device = options.device || this.currentDevice

    const result = await this.loadTemplate(category, device, template)

    if (result.state === TemplateLoadingState.ERROR || !result.component) {
      throw result.error || new Error('Failed to load template')
    }

    // 创建异步组件
    return defineAsyncComponent({
      loader: () => Promise.resolve(result.component!.component),
      loadingComponent: undefined, // 可以在这里设置加载组件
      errorComponent: undefined, // 可以在这里设置错误组件
      delay: 0,
      timeout: options.timeout || 10000,
    })
  }

  /**
   * 切换模板
   */
  async switch(category: string, device: DeviceType, template: string): Promise<void> {
    const oldTemplate = this.currentTemplate

    try {
      const result = await this.loadTemplate(category, device, template)

      if (result.state === TemplateLoadingState.ERROR || !result.component) {
        throw result.error || new Error('Failed to load template')
      }

      this.currentTemplate = result.component.metadata

      // 发射切换事件
      this.emit('template:change', {
        from: oldTemplate,
        to: this.currentTemplate,
        timestamp: Date.now(),
      })
    }
    catch (error) {
      this.emit('template:error', error as Error)
      throw error
    }
  }

  /**
   * 获取可用模板列表
   */
  async getAvailableTemplates(category?: string, device?: DeviceType): Promise<TemplateMetadata[]> {
    // 确保已扫描模板
    if (this.scanner.getAllTemplates().length === 0) {
      await this.scanTemplates()
    }

    if (category && device) {
      return this.scanner.getTemplatesByCategoryAndDevice(category, device)
    }
    else if (category) {
      return this.scanner.getTemplatesByCategory(category)
    }
    else if (device) {
      return this.scanner.getTemplatesByDevice(device)
    }
    else {
      return this.scanner.getAllTemplates()
    }
  }

  /**
   * 获取当前模板信息
   */
  getCurrentTemplate(): TemplateMetadata | undefined {
    return this.currentTemplate
  }

  /**
   * 检测当前设备类型
   */
  detectDevice(): DeviceType {
    this.currentDevice = detectDevice(this.config.deviceDetection)
    return this.currentDevice
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.currentDevice
  }

  /**
   * 获取可用的分类列表
   */
  async getAvailableCategories(): Promise<string[]> {
    if (this.scanner.getAllTemplates().length === 0) {
      await this.scanTemplates()
    }
    return this.scanner.getAvailableCategories()
  }

  /**
   * 获取指定分类下的可用设备类型
   */
  async getAvailableDevices(category?: string): Promise<DeviceType[]> {
    if (this.scanner.getAllTemplates().length === 0) {
      await this.scanTemplates()
    }
    return this.scanner.getAvailableDevices(category)
  }

  /**
   * 检查模板是否存在
   */
  async hasTemplate(category: string, device: DeviceType, template: string): Promise<boolean> {
    if (this.scanner.getAllTemplates().length === 0) {
      await this.scanTemplates()
    }
    return !!this.scanner.findTemplate(category, device, template)
  }

  /**
   * 获取模板元数据
   */
  async getTemplateMetadata(category: string, device: DeviceType, template: string): Promise<TemplateMetadata | undefined> {
    if (this.scanner.getAllTemplates().length === 0) {
      await this.scanTemplates()
    }
    return this.scanner.findTemplate(category, device, template)
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.loadingPromises.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.cache.getStats()
  }

  /**
   * 清理过期缓存
   */
  cleanupCache() {
    return this.cache.cleanup()
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 清理设备监听器
    if (this.deviceWatcherCleanup) {
      this.deviceWatcherCleanup()
      this.deviceWatcherCleanup = undefined
    }

    // 清空缓存和事件监听器
    this.clearCache()
    this.removeAllListeners()

    // 清空扫描器缓存
    this.scanner.clearCache()
  }

  /**
   * 获取管理器配置
   */
  getConfig(): Readonly<Required<TemplateManagerConfig>> {
    return this.config
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TemplateManagerConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // 如果设备检测配置变化，重新初始化监听器
    if (newConfig.deviceDetection) {
      if (this.deviceWatcherCleanup) {
        this.deviceWatcherCleanup()
      }
      this.initializeDeviceWatcher()
    }
  }
}

// ============================================================================
// 函数式 API (兼容 template-manager.ts)
// ============================================================================

/**
 * 全局模板注册表
 */
const globalTemplateRegistry: TemplateRegistry = {}

/**
 * 注册模板
 */
export function registerTemplate(
  category: string,
  device: DeviceType,
  variant: string,
  config: TemplateConfig,
  component: any,
): void {
  if (!globalTemplateRegistry[category]) {
    globalTemplateRegistry[category] = {}
  }

  if (!globalTemplateRegistry[category][device]) {
    globalTemplateRegistry[category][device] = {}
  }

  const templateInfo: TemplateInfo = {
    id: config.id || `${category}-${device}-${variant}`,
    name: config.name,
    category,
    device,
    variant,
    isDefault: config.isDefault || false,
    config,
    component,
  }

  globalTemplateRegistry[category][device][variant] = templateInfo
}

/**
 * 获取模板
 */
export function getTemplate(
  category: string,
  device: DeviceType,
  variant?: string,
): TemplateInfo | null {
  const categoryTemplates = globalTemplateRegistry[category]
  if (!categoryTemplates) return null

  const deviceTemplates = categoryTemplates[device]
  if (!deviceTemplates) return null

  if (variant) {
    return deviceTemplates[variant] || null
  }

  // 如果没有指定变体，返回默认模板
  const defaultTemplate = Object.values(deviceTemplates).find(t => t.isDefault)
  if (defaultTemplate) return defaultTemplate

  // 如果没有默认模板，返回第一个
  const firstTemplate = Object.values(deviceTemplates)[0]
  return firstTemplate || null
}

/**
 * 获取设备类型的所有模板
 */
export function getTemplatesByDevice(
  category: string,
  device: DeviceType,
): TemplateInfo[] {
  const categoryTemplates = globalTemplateRegistry[category]
  if (!categoryTemplates) return []

  const deviceTemplates = categoryTemplates[device]
  if (!deviceTemplates) return []

  return Object.values(deviceTemplates)
}

/**
 * 获取分类的所有模板
 */
export function getTemplatesByCategory(category: string): TemplateInfo[] {
  const categoryTemplates = globalTemplateRegistry[category]
  if (!categoryTemplates) return []

  const allTemplates: TemplateInfo[] = []
  Object.values(categoryTemplates).forEach((deviceTemplates) => {
    Object.values(deviceTemplates).forEach((template) => {
      allTemplates.push(template)
    })
  })

  return allTemplates
}

/**
 * 获取所有模板
 */
export function getAllTemplates(): TemplateInfo[] {
  const allTemplates: TemplateInfo[] = []

  Object.values(globalTemplateRegistry).forEach((categoryTemplates) => {
    Object.values(categoryTemplates).forEach((deviceTemplates) => {
      Object.values(deviceTemplates).forEach((template) => {
        allTemplates.push(template)
      })
    })
  })

  return allTemplates
}

/**
 * 获取默认模板
 */
export function getDefaultTemplate(
  category: string,
  device: DeviceType,
): TemplateInfo | null {
  const deviceTemplates = getTemplatesByDevice(category, device)
  return deviceTemplates.find(t => t.isDefault) || deviceTemplates[0] || null
}

/**
 * 检查模板是否存在
 */
export function hasTemplate(
  category: string,
  device: DeviceType,
  variant: string,
): boolean {
  return getTemplate(category, device, variant) !== null
}

/**
 * 获取模板配置
 */
export function getTemplateConfig(
  category: string,
  device: DeviceType,
  variant: string,
): TemplateConfig | null {
  const template = getTemplate(category, device, variant)
  return template?.config || null
}

/**
 * 获取模板组件
 */
export function getTemplateComponent(
  category: string,
  device: DeviceType,
  variant: string,
): any {
  const template = getTemplate(category, device, variant)
  return template?.component || null
}

/**
 * 清空模板注册表
 */
export function clearTemplateRegistry(): void {
  Object.keys(globalTemplateRegistry).forEach((key) => {
    delete globalTemplateRegistry[key]
  })
}

/**
 * 获取模板统计信息
 */
export function getTemplateStats(): {
  totalTemplates: number
  categoriesCount: number
  deviceBreakdown: Record<DeviceType, number>
  categoryBreakdown: Record<string, number>
} {
  const allTemplates = getAllTemplates()
  const categories = new Set<string>()
  const deviceBreakdown: Record<DeviceType, number> = {
    desktop: 0,
    tablet: 0,
    mobile: 0,
  }
  const categoryBreakdown: Record<string, number> = {}

  allTemplates.forEach((template) => {
    categories.add(template.category)
    deviceBreakdown[template.device]++
    categoryBreakdown[template.category] = (categoryBreakdown[template.category] || 0) + 1
  })

  return {
    totalTemplates: allTemplates.length,
    categoriesCount: categories.size,
    deviceBreakdown,
    categoryBreakdown,
  }
}
