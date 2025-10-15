/**
 * 模板管理器
 * 
 * 整合核心层功能，提供统一的模板管理接口，支持插件系统
 */

import type {
  SystemConfig,
  DeviceType,
  TemplateId,
  TemplateMetadata,
  TemplateLoadResult,
  TemplateQueryOptions,
  TemplateSwitchOptions,
  Plugin,
} from '../types'
import type { Component } from 'vue'
import type { LoadOptions } from '../core/loader'
import { TemplateRegistry } from '../core/registry'
import { CacheManager } from '../core/cache'
import { TemplateLoader } from '../core/loader'
import { DeviceDetector } from '../core/device'
import { getGlobalEmitter } from '../core/events'
import { LifecycleManager } from './lifecycle'
import { PerformanceMonitor } from './monitor'
import { deepMerge } from '../utils'
import { DEFAULT_CACHE_CONFIG, DEFAULT_BREAKPOINTS, DEFAULT_LOGGER_CONFIG } from '../utils/constants'

/**
 * 模板管理器类
 */
export class TemplateManager {
  private registry: TemplateRegistry
  private cache: CacheManager
  private loader: TemplateLoader
  private device: DeviceDetector
  private lifecycle: LifecycleManager
  private monitor: PerformanceMonitor
  private emitter = getGlobalEmitter()
  private currentTemplateId: TemplateId | null = null
  private config: Required<SystemConfig>
  private plugins: Map<string, Plugin> = new Map()
  private debug: boolean

  constructor(config: SystemConfig = {}) {
    // 初始化配置
    this.config = {
      cache: deepMerge({ ...DEFAULT_CACHE_CONFIG }, config.cache || {}),
      device: deepMerge(
        { breakpoints: { ...DEFAULT_BREAKPOINTS }, defaultDevice: 'desktop', enableResponsive: true },
        config.device || {}
      ),
      logger: deepMerge({ ...DEFAULT_LOGGER_CONFIG }, config.logger || {}),
      hooks: config.hooks || {},
      debug: config.debug || false,
    }

    this.debug = this.config.debug

    // 初始化核心组件
    this.registry = new TemplateRegistry()
    this.cache = new CacheManager(this.config.cache)
    this.device = new DeviceDetector(this.config.device)
    this.loader = new TemplateLoader(this.registry, this.cache)
    this.lifecycle = new LifecycleManager()
    this.monitor = new PerformanceMonitor({ enabled: this.debug })

    // 注册生命周期钩子
    if (this.config.hooks) {
      this.lifecycle.registerHooks(this.config.hooks)
    }

    // 监听设备变化
    this.device.addListener(this.handleDeviceChange.bind(this))

    // 监听缓存淘汰事件
    this.emitter.on('cache:evict', async ({ key }) => {
      await this.lifecycle.onCacheEvict(key)
    })

    this.log('TemplateManager initialized')
  }

  /**
   * 注册模板
   */
  register(
    category: string,
    device: DeviceType,
    name: string,
    metadata: Omit<TemplateMetadata, 'category' | 'device' | 'name'>,
    component: Component | (() => Promise<{ default: Component }>)
  ): TemplateId {
    const id = this.registry.register(category, device, name, metadata, component)
    this.log(`Template registered: ${id}`)
    return id
  }

  /**
   * 批量注册模板
   */
  registerBatch(
    registrations: Array<{
      category: string
      device: DeviceType
      name: string
      metadata: Omit<TemplateMetadata, 'category' | 'device' | 'name'>
      component: Component | (() => Promise<{ default: Component }>)
    }>
  ): TemplateId[] {
    const ids = this.registry.registerBatch(registrations)
    this.log(`Batch registered ${ids.length} templates`)
    return ids
  }

  /**
   * 注销模板
   */
  unregister(id: TemplateId): boolean {
    const result = this.registry.unregister(id)
    if (result) {
      this.log(`Template unregistered: ${id}`)
    }
    return result
  }

  /**
   * 加载模板
   */
  async load(
    category: string,
    device?: DeviceType,
    name?: string,
    options?: LoadOptions
  ): Promise<TemplateLoadResult> {
    const targetDevice = device || this.device.getDevice()
    const id = name ? `${category}:${targetDevice}:${name}` : ''

    // 如果没有指定name，获取默认模板
    const registration = id
      ? this.registry.get(id)
      : this.registry.getDefault(category, targetDevice)

    if (!registration) {
      throw new Error(`No template found for category: ${category}, device: ${targetDevice}`)
    }

    // 触发beforeLoad钩子
    await this.lifecycle.onBeforeLoad(registration.id)

    try {
      const result = await this.loader.load(registration.id, options)

      // 触发afterLoad钩子
      await this.lifecycle.onAfterLoad(registration.id, result.component)

      // 记录性能
      this.monitor.recordLoad(registration.id, result.loadTime, result.cached)

      this.log(
        `Loaded template: ${registration.id} (cached: ${result.cached}, time: ${result.loadTime}ms)`
      )

      return result
    } catch (error) {
      // 触发error钩子
      await this.lifecycle.onError(registration.id, error as Error)
      throw error
    }
  }

  /**
   * 切换模板
   */
  async switch(
    category: string,
    device?: DeviceType,
    name?: string,
    options: TemplateSwitchOptions = {}
  ): Promise<TemplateLoadResult> {
    const targetDevice = device || this.device.getDevice()
    const registration = name
      ? this.registry.get(category, targetDevice, name)
      : this.registry.getDefault(category, targetDevice)

    if (!registration) {
      throw new Error(`No template found for category: ${category}, device: ${targetDevice}`)
    }

    const targetId = registration.id

    // 触发beforeSwitch钩子
    if (options.onBeforeSwitch) {
      await options.onBeforeSwitch()
    }
    await this.lifecycle.onBeforeSwitch(this.currentTemplateId, targetId)

    // 加载新模板
    const result = await this.load(category, targetDevice, name)

    // 更新当前模板ID
    const oldId = this.currentTemplateId
    this.currentTemplateId = targetId

    // 触发afterSwitch钩子
    if (options.onAfterSwitch) {
      await options.onAfterSwitch()
    }
    await this.lifecycle.onAfterSwitch(oldId, targetId)

    this.log(`Switched template: ${oldId} → ${targetId}`)

    return result
  }

  /**
   * 查询模板
   */
  query(options: TemplateQueryOptions = {}) {
    return this.registry.query(options)
  }

  /**
   * 获取模板元数据
   */
  getMetadata(category: string, device: DeviceType, name: string): TemplateMetadata | null
  getMetadata(id: TemplateId): TemplateMetadata | null
  getMetadata(
    categoryOrId: string,
    device?: DeviceType,
    name?: string
  ): TemplateMetadata | null {
    const registration =
      device && name
        ? this.registry.get(categoryOrId, device, name)
        : this.registry.get(categoryOrId as TemplateId)

    return registration?.metadata || null
  }

  /**
   * 检查模板是否存在
   */
  has(category: string, device: DeviceType, name: string): boolean
  has(id: TemplateId): boolean
  has(categoryOrId: string, device?: DeviceType, name?: string): boolean {
    return device && name
      ? this.registry.has(categoryOrId, device, name)
      : this.registry.has(categoryOrId as TemplateId)
  }

  /**
   * 预加载模板
   */
  async preload(ids: TemplateId[], options?: LoadOptions): Promise<void> {
    this.log(`Preloading ${ids.length} templates`)
    await this.loader.preload(ids, options)
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.device.getDevice()
  }

  /**
   * 设置设备类型
   */
  setDevice(device: DeviceType): void {
    this.device.setDevice(device)
  }

  /**
   * 获取当前模板ID
   */
  getCurrentTemplateId(): TemplateId | null {
    return this.currentTemplateId
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.log('Cache cleared')
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cache.getStats()
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return this.monitor.getMetrics()
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): string {
    return this.monitor.generateReport()
  }

  /**
   * 使用插件
   */
  use(plugin: Plugin): this {
    if (this.plugins.has(plugin.name)) {
      console.warn(`[Manager] Plugin already installed: ${plugin.name}`)
      return this
    }

    this.plugins.set(plugin.name, plugin)
    plugin.install(this)

    this.log(`Plugin installed: ${plugin.name} v${plugin.version}`)

    return this
  }

  /**
   * 卸载插件
   */
  unuse(pluginName: string): boolean {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) return false

    if (plugin.uninstall) {
      plugin.uninstall()
    }

    this.plugins.delete(pluginName)
    this.log(`Plugin uninstalled: ${pluginName}`)

    return true
  }

  /**
   * 获取已安装的插件
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件是否已安装
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 处理设备变化
   */
  private handleDeviceChange(device: DeviceType): void {
    this.log(`Device changed to: ${device}`)
    // 可以在这里实现自动切换模板的逻辑
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: any[]): void {
    if (this.debug) {
      console.log(`[TemplateManager] ${message}`, ...args)
    }
  }

  /**
   * 获取配置
   */
  getConfig(): Required<SystemConfig> {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SystemConfig>): void {
    this.config = deepMerge(this.config, config)

    // 更新子系统配置
    if (config.device) {
      this.device.updateConfig(config.device)
    }

    if (config.debug !== undefined) {
      this.debug = config.debug
      this.monitor.setEnabled(config.debug)
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.device.destroy()
    this.cache.clear()
    this.lifecycle.clearHooks()
    this.monitor.clearRecords()
    this.plugins.clear()
    this.emitter.clear()

    this.log('TemplateManager destroyed')
  }
}

/**
 * 创建模板管理器（工厂函数）
 */
export function createTemplateManager(config?: SystemConfig): TemplateManager {
  return new TemplateManager(config)
}
