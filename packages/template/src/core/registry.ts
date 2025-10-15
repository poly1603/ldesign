/**
 * 模板注册中心
 * 
 * 单一数据源，管理所有模板的注册、查询和索引
 */

import type {
  DeviceType,
  TemplateId,
  TemplateMetadata,
  TemplateRegistration,
  TemplateQueryOptions,
} from '../types'
import type { Component } from 'vue'
import { buildTemplateId, parseTemplateId } from '../utils'
import { getGlobalEmitter } from './events'

/**
 * 模板注册中心类
 */
export class TemplateRegistry {
  /** 主索引：ID → 模板 */
  private templates = new Map<TemplateId, TemplateRegistration>()

  /** 分类索引：category → device → name[] */
  private categoryIndex = new Map<string, Map<DeviceType, Set<string>>>()

  /** 设备索引：device → ID[] */
  private deviceIndex = new Map<DeviceType, Set<TemplateId>>()

  /** 分组索引：group → ID[] */
  private groupIndex = new Map<string, Set<TemplateId>>()

  /** 事件发射器 */
  private emitter = getGlobalEmitter()

  /**
   * 注册模板
   */
  register(
    category: string,
    device: DeviceType,
    name: string,
    metadata: Omit<TemplateMetadata, 'category' | 'device' | 'name'>,
    componentOrLoader: Component | (() => Promise<{ default: Component }>)
  ): TemplateId {
    const id = buildTemplateId(category, device, name)

    // 检查是否已注册
    if (this.templates.has(id)) {
      console.warn(`[Registry] Template already registered: ${id}`)
      return id
    }

    // 创建注册信息
    const registration: TemplateRegistration = {
      id,
      metadata: {
        ...metadata,
        category,
        device,
        name,
      },
    }

    // 判断是组件还是加载器
    if (typeof componentOrLoader === 'function') {
      registration.loader = componentOrLoader
    } else {
      registration.component = componentOrLoader
    }

    // 添加到主索引
    this.templates.set(id, registration)

    // 更新分类索引
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, new Map())
    }
    const categoryMap = this.categoryIndex.get(category)!
    if (!categoryMap.has(device)) {
      categoryMap.set(device, new Set())
    }
    categoryMap.get(device)!.add(name)

    // 更新设备索引
    if (!this.deviceIndex.has(device)) {
      this.deviceIndex.set(device, new Set())
    }
    this.deviceIndex.get(device)!.add(id)

    // 更新分组索引
    if (metadata.group) {
      if (!this.groupIndex.has(metadata.group)) {
        this.groupIndex.set(metadata.group, new Set())
      }
      this.groupIndex.get(metadata.group)!.add(id)
    }

    // 发射注册事件
    this.emitter.emit('template:registered', { id, metadata: registration.metadata })

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
    return registrations.map(r =>
      this.register(r.category, r.device, r.name, r.metadata, r.component)
    )
  }

  /**
   * 注销模板
   */
  unregister(id: TemplateId): boolean {
    const registration = this.templates.get(id)
    if (!registration) return false

    const parsed = parseTemplateId(id)
    if (!parsed) return false

    // 从主索引删除
    this.templates.delete(id)

    // 从分类索引删除
    const categoryMap = this.categoryIndex.get(parsed.category)
    if (categoryMap) {
      const deviceSet = categoryMap.get(parsed.device)
      if (deviceSet) {
        deviceSet.delete(parsed.name)
        if (deviceSet.size === 0) {
          categoryMap.delete(parsed.device)
        }
      }
      if (categoryMap.size === 0) {
        this.categoryIndex.delete(parsed.category)
      }
    }

    // 从设备索引删除
    const deviceSet = this.deviceIndex.get(parsed.device)
    if (deviceSet) {
      deviceSet.delete(id)
      if (deviceSet.size === 0) {
        this.deviceIndex.delete(parsed.device)
      }
    }

    // 从分组索引删除
    if (registration.metadata.group) {
      const groupSet = this.groupIndex.get(registration.metadata.group)
      if (groupSet) {
        groupSet.delete(id)
        if (groupSet.size === 0) {
          this.groupIndex.delete(registration.metadata.group)
        }
      }
    }

    // 发射注销事件
    this.emitter.emit('template:unregistered', { id })

    return true
  }

  /**
   * 批量注销模板
   */
  unregisterBatch(ids: TemplateId[]): boolean[] {
    return ids.map(id => this.unregister(id))
  }

  /**
   * 获取模板
   */
  get(category: string, device: DeviceType, name: string): TemplateRegistration | null
  get(id: TemplateId): TemplateRegistration | null
  get(
    categoryOrId: string,
    device?: DeviceType,
    name?: string
  ): TemplateRegistration | null {
    if (device && name) {
      const id = buildTemplateId(categoryOrId, device, name)
      return this.templates.get(id) || null
    }
    return this.templates.get(categoryOrId as TemplateId) || null
  }

  /**
   * 检查模板是否存在
   */
  has(category: string, device: DeviceType, name: string): boolean
  has(id: TemplateId): boolean
  has(categoryOrId: string, device?: DeviceType, name?: string): boolean {
    if (device && name) {
      const id = buildTemplateId(categoryOrId, device, name)
      return this.templates.has(id)
    }
    return this.templates.has(categoryOrId as TemplateId)
  }

  /**
   * 获取默认模板
   */
  getDefault(category: string, device: DeviceType): TemplateRegistration | null {
    const templates = this.query({ category, device, isDefault: true })
    return templates.length > 0 ? templates[0] : null
  }

  /**
   * 获取分组模板
   */
  getGroup(group: string): TemplateRegistration[] {
    return this.query({ group })
  }

  /**
   * 查询模板列表
   */
  query(options: TemplateQueryOptions = {}): TemplateRegistration[] {
    let results = Array.from(this.templates.values())

    // 按分类过滤
    if (options.category) {
      results = results.filter(r => r.metadata.category === options.category)
    }

    // 按设备过滤
    if (options.device) {
      results = results.filter(r => r.metadata.device === options.device)
    }

    // 按名称过滤
    if (options.name) {
      results = results.filter(r => r.metadata.name === options.name)
    }

    // 按分组过滤
    if (options.group) {
      results = results.filter(r => r.metadata.group === options.group)
    }

    // 按标签过滤
    if (options.tags && options.tags.length > 0) {
      results = results.filter(r =>
        r.metadata.tags?.some(tag => options.tags!.includes(tag))
      )
    }

    // 按是否默认过滤
    if (options.isDefault !== undefined) {
      results = results.filter(r => r.metadata.isDefault === options.isDefault)
    }

    // 排序
    if (options.sort) {
      const order = options.order === 'desc' ? -1 : 1
      results.sort((a, b) => {
        let compareResult = 0
        switch (options.sort) {
          case 'name':
            compareResult = a.metadata.name.localeCompare(b.metadata.name)
            break
          case 'lastModified':
            compareResult = (a.metadata.lastModified || 0) - (b.metadata.lastModified || 0)
            break
          case 'version':
            compareResult = a.metadata.version.localeCompare(b.metadata.version)
            break
        }
        return compareResult * order
      })
    }

    return results
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    return Array.from(this.categoryIndex.keys())
  }

  /**
   * 获取所有设备类型
   */
  getDevices(): DeviceType[] {
    return Array.from(this.deviceIndex.keys())
  }

  /**
   * 获取所有分组
   */
  getGroups(): string[] {
    return Array.from(this.groupIndex.keys())
  }

  /**
   * 获取模板数量
   */
  size(): number {
    return this.templates.size
  }

  /**
   * 清空所有模板
   */
  clear(): void {
    this.templates.clear()
    this.categoryIndex.clear()
    this.deviceIndex.clear()
    this.groupIndex.clear()
  }
}

// 单例实例
let instance: TemplateRegistry | null = null

/**
 * 获取注册中心实例
 */
export function getRegistry(): TemplateRegistry {
  if (!instance) {
    instance = new TemplateRegistry()
  }
  return instance
}

/**
 * 重置注册中心
 */
export function resetRegistry(): void {
  if (instance) {
    instance.clear()
    instance = null
  }
}
