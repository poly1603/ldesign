/**
 * 模板管理器 - 统一管理模板扫描、加载和查询
 */

import type { Component } from 'vue'
import type {
  DeviceType,
  TemplateFilter,
  TemplateLoadOptions,
  TemplateManagerOptions,
  TemplateMetadata,
  TemplateRegistryItem,
  TemplateScanResult,
} from '../types'
import { getLoader } from './loader'
import { getScanner } from './scanner'

/**
 * 模板管理器类
 */
export class TemplateManager {
  private initialized = false
  private scanResult: TemplateScanResult | null = null
  private options: TemplateManagerOptions

  /**
   * 构造函数
   */
  constructor(options: TemplateManagerOptions = {}) {
    this.options = options
  }

  /**
   * 初始化（扫描所有模板）
   */
  async initialize(): Promise<TemplateScanResult> {
    if (this.initialized && this.scanResult) {
      return this.scanResult
    }

    const scanner = getScanner()
    this.scanResult = await scanner.scan()
    this.initialized = true

    return this.scanResult
  }

  /**
   * 确保已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  /**
   * 加载模板组件
   */
  async loadTemplate(
    category: string,
    device: string,
    name: string,
    options?: TemplateLoadOptions
  ): Promise<Component> {
    await this.ensureInitialized()
    const loader = getLoader()
    return loader.load(category, device, name, options)
  }

  /**
   * 获取所有模板元数据
   */
  async getAllTemplates(): Promise<TemplateMetadata[]> {
    await this.ensureInitialized()
    const scanner = getScanner()
    return scanner.getAllMetadata()
  }

  /**
   * 根据过滤条件查询模板
   */
  async queryTemplates(filter: TemplateFilter): Promise<TemplateMetadata[]> {
    await this.ensureInitialized()
    const allTemplates = await this.getAllTemplates()
    return this.filterTemplates(allTemplates, filter)
  }

  /**
   * 获取指定分类的所有模板
   */
  async getTemplatesByCategory(category: string): Promise<TemplateMetadata[]> {
    return this.queryTemplates({ category })
  }

  /**
   * 获取指定设备的所有模板
   */
  async getTemplatesByDevice(device: DeviceType): Promise<TemplateMetadata[]> {
    return this.queryTemplates({ device })
  }

  /**
   * 获取默认模板
   */
  async getDefaultTemplate(category: string, device: DeviceType | string): Promise<TemplateMetadata | null> {
    const templates = await this.queryTemplates({
      category,
      device: device as DeviceType,
      defaultOnly: true,
    })
    return templates[0] || null
  }

  /**
   * 获取扫描结果
   */
  getScanResult(): TemplateScanResult | null {
    return this.scanResult
  }

  /**
   * 预加载模板
   */
  async preloadTemplate(category: string, device: string, name: string): Promise<void> {
    await this.ensureInitialized()
    const loader = getLoader()
    return loader.preload(category, device, name)
  }

  /**
   * 根据过滤条件预加载模板
   */
  async preloadByFilter(filter: TemplateFilter): Promise<void> {
    await this.ensureInitialized()
    const loader = getLoader()
    return loader.preloadByFilter(filter)
  }

  /**
   * 清除缓存
   */
  clearCache(category?: string, device?: string, name?: string): void {
    const loader = getLoader()
    loader.clearCache(category, device, name)
  }

  /**
   * 扫描模板（别名方法）
   */
  async scanTemplates(): Promise<Map<string, TemplateRegistryItem>> {
    await this.initialize()
    // 返回注册表的 Map 格式
    const scanner = getScanner()
    return scanner.getRegistry()
  }

  /**
   * 重新扫描模板
   */
  async rescan(): Promise<TemplateScanResult> {
    this.initialized = false
    return this.initialize()
  }

  /**
   * 过滤模板
   */
  private filterTemplates(templates: TemplateMetadata[], filter: TemplateFilter): TemplateMetadata[] {
    return templates.filter(t => {
      if (filter.category) {
        const categories = Array.isArray(filter.category) ? filter.category : [filter.category]
        if (!categories.includes(t.category)) return false
      }

      if (filter.device) {
        const devices = Array.isArray(filter.device) ? filter.device : [filter.device]
        if (!devices.includes(t.device)) return false
      }

      if (filter.name) {
        const names = Array.isArray(filter.name) ? filter.name : [filter.name]
        if (!names.includes(t.name)) return false
      }

      if (filter.tags) {
        const tags = Array.isArray(filter.tags) ? filter.tags : [filter.tags]
        if (!t.tags || !tags.some(tag => t.tags?.includes(tag) === true)) return false
      }

      if (filter.defaultOnly && !t.isDefault) return false

      return true
    })
  }
}

/**
 * 全局管理器实例
 */
let globalManager: TemplateManager | null = null

/**
 * 获取全局管理器实例
 */
export function getManager(): TemplateManager {
  if (!globalManager) {
    globalManager = new TemplateManager()
  }
  return globalManager
}

/**
 * 创建模板管理器实例
 */
export function createTemplateManager(): TemplateManager {
  return new TemplateManager()
}
