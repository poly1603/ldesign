/**
 * 模板选择持久化存储管理器
 */

import type { DeviceType, TemplateStorageOptions } from '../types'

/**
 * 模板选择数据结构
 */
export interface TemplateSelection {
  /** 分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 模板名称 */
  template: string
  /** 选择时间戳 */
  timestamp: number
}

/**
 * 存储的数据结构
 */
export interface TemplateStorageData {
  /** 用户选择的模板映射 */
  selections: Record<string, TemplateSelection>
  /** 最后更新时间 */
  lastUpdated: number
  /** 版本号 */
  version: string
}

/**
 * 模板存储管理器
 */
export class TemplateStorageManager {
  private options: Required<TemplateStorageOptions>
  private storage: Storage | Map<string, string>
  private data: TemplateStorageData

  constructor(options: TemplateStorageOptions = {}) {
    this.options = {
      key: 'ldesign-template-selections',
      storage: 'localStorage',
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      ...options,
    }

    // 初始化存储
    this.storage = this.getStorage()

    // 初始化数据
    this.data = this.loadData()
  }

  /**
   * 获取存储对象
   */
  private getStorage(): Storage | Map<string, string> {
    switch (this.options.storage) {
      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          return sessionStorage
        }
        break
      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          return localStorage
        }
        break
      case 'memory':
      default:
        return new Map<string, string>()
    }

    // 回退到内存存储
    return new Map<string, string>()
  }

  /**
   * 加载存储的数据
   */
  private loadData(): TemplateStorageData {
    try {
      const stored
        = this.storage instanceof Map ? this.storage.get(this.options.key) : this.storage.getItem(this.options.key)

      if (stored) {
        const parsed = this.options.deserialize(stored)

        // 验证数据结构
        if (parsed && typeof parsed === 'object' && parsed.selections) {
          return {
            selections: parsed.selections || {},
            lastUpdated: parsed.lastUpdated || Date.now(),
            version: parsed.version || '1.0.0',
          }
        }
      }
    }
    catch (error) {
      console.warn('Failed to load template selections from storage:', error)
    }

    // 返回默认数据
    return {
      selections: {},
      lastUpdated: Date.now(),
      version: '1.0.0',
    }
  }

  /**
   * 保存数据到存储
   */
  private saveData(): void {
    try {
      this.data.lastUpdated = Date.now()
      const serialized = this.options.serialize(this.data)

      if (this.storage instanceof Map) {
        this.storage.set(this.options.key, serialized)
      }
      else {
        this.storage.setItem(this.options.key, serialized)
      }
    }
    catch (error) {
      console.warn('Failed to save template selections to storage:', error)
    }
  }

  /**
   * 生成选择键
   */
  private getSelectionKey(category: string, device: DeviceType): string {
    return `${category}:${device}`
  }

  /**
   * 保存模板选择
   */
  saveSelection(category: string, device: DeviceType, template: string): void {
    const key = this.getSelectionKey(category, device)

    this.data.selections[key] = {
      category,
      device,
      template,
      timestamp: Date.now(),
    }

    this.saveData()
  }

  /**
   * 获取模板选择
   */
  getSelection(category: string, device: DeviceType): TemplateSelection | null {
    const key = this.getSelectionKey(category, device)
    return this.data.selections[key] || null
  }

  /**
   * 删除模板选择
   */
  removeSelection(category: string, device: DeviceType): void {
    const key = this.getSelectionKey(category, device)
    delete this.data.selections[key]
    this.saveData()
  }

  /**
   * 清空所有选择
   */
  clearSelections(): void {
    this.data.selections = {}
    this.saveData()
  }

  /**
   * 获取所有选择
   */
  getAllSelections(): Record<string, TemplateSelection> {
    return { ...this.data.selections }
  }

  /**
   * 获取指定分类的所有选择
   */
  getSelectionsByCategory(category: string): TemplateSelection[] {
    return Object.values(this.data.selections).filter(selection => selection.category === category)
  }

  /**
   * 获取指定设备类型的所有选择
   */
  getSelectionsByDevice(device: DeviceType): TemplateSelection[] {
    return Object.values(this.data.selections).filter(selection => selection.device === device)
  }

  /**
   * 检查是否有选择
   */
  hasSelection(category: string, device: DeviceType): boolean {
    const key = this.getSelectionKey(category, device)
    return key in this.data.selections
  }

  /**
   * 获取存储统计信息
   */
  getStats(): {
    totalSelections: number
    lastUpdated: number
    version: string
    storageType: string
  } {
    return {
      totalSelections: Object.keys(this.data.selections).length,
      lastUpdated: this.data.lastUpdated,
      version: this.data.version,
      storageType: this.options.storage,
    }
  }

  /**
   * 导出数据
   */
  exportData(): TemplateStorageData {
    return { ...this.data }
  }

  /**
   * 导入数据
   */
  importData(data: TemplateStorageData): void {
    this.data = {
      selections: { ...data.selections },
      lastUpdated: data.lastUpdated || Date.now(),
      version: data.version || '1.0.0',
    }
    this.saveData()
  }
}
