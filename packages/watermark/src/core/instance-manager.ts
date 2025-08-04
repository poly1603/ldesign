/**
 * 实例管理器
 */

import type {
  WatermarkInstance,
  WatermarkInstanceState,
  InstanceManager as IInstanceManager,
  InstanceStats,
  InstanceQuery,
  BatchOperationOptions
} from '../types'

import { WatermarkError, WatermarkErrorCode, ErrorSeverity } from '../types/error'

/**
 * 实例管理器
 * 负责水印实例的注册、查询、统计等管理功能
 */
export class InstanceManager implements IInstanceManager {
  private instances = new Map<string, WatermarkInstance>()
  private instancesByContainer = new Map<HTMLElement, Set<string>>()
  private stats: InstanceStats = {
    total: 0,
    active: 0,
    paused: 0,
    destroyed: 0,
    creating: 0,
    updating: 0,
    destroying: 0
  }

  /**
   * 注册实例
   */
  register(instance: WatermarkInstance): void {
    if (this.instances.has(instance.id)) {
      throw new WatermarkError(
        `Instance with id ${instance.id} already exists`,
        WatermarkErrorCode.INSTANCE_ALREADY_EXISTS,
        ErrorSeverity.MEDIUM,
        { instanceId: instance.id }
      )
    }

    this.instances.set(instance.id, instance)
    
    // 按容器分组
    if (!this.instancesByContainer.has(instance.container)) {
      this.instancesByContainer.set(instance.container, new Set())
    }
    this.instancesByContainer.get(instance.container)!.add(instance.id)
    
    // 更新统计
    this.updateStats()
  }

  /**
   * 注销实例
   */
  unregister(instanceId: string): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      return false
    }

    // 从容器分组中移除
    const containerInstances = this.instancesByContainer.get(instance.container)
    if (containerInstances) {
      containerInstances.delete(instanceId)
      if (containerInstances.size === 0) {
        this.instancesByContainer.delete(instance.container)
      }
    }

    // 移除实例
    this.instances.delete(instanceId)
    
    // 更新统计
    this.updateStats()
    
    return true
  }

  /**
   * 获取实例
   */
  get(instanceId: string): WatermarkInstance | undefined {
    return this.instances.get(instanceId)
  }

  /**
   * 获取所有实例
   */
  getAll(): WatermarkInstance[] {
    return Array.from(this.instances.values())
  }

  /**
   * 根据容器获取实例
   */
  getByContainer(container: HTMLElement): WatermarkInstance[] {
    const instanceIds = this.instancesByContainer.get(container)
    if (!instanceIds) {
      return []
    }

    return Array.from(instanceIds)
      .map(id => this.instances.get(id))
      .filter((instance): instance is WatermarkInstance => instance !== undefined)
  }

  /**
   * 根据状态获取实例
   */
  getByState(state: WatermarkInstanceState): WatermarkInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.state === state)
  }

  /**
   * 查询实例
   */
  query(query: InstanceQuery): WatermarkInstance[] {
    let results = Array.from(this.instances.values())

    // 按ID过滤
    if (query.ids && query.ids.length > 0) {
      results = results.filter(instance => query.ids!.includes(instance.id))
    }

    // 按状态过滤
    if (query.states && query.states.length > 0) {
      results = results.filter(instance => query.states!.includes(instance.state))
    }

    // 按容器过滤
    if (query.containers && query.containers.length > 0) {
      results = results.filter(instance => query.containers!.includes(instance.container))
    }

    // 按创建时间过滤
    if (query.createdAfter) {
      results = results.filter(instance => instance.createdAt > query.createdAfter!)
    }

    if (query.createdBefore) {
      results = results.filter(instance => instance.createdAt < query.createdBefore!)
    }

    // 按更新时间过滤
    if (query.updatedAfter) {
      results = results.filter(instance => instance.updatedAt > query.updatedAfter!)
    }

    if (query.updatedBefore) {
      results = results.filter(instance => instance.updatedAt < query.updatedBefore!)
    }

    // 按可见性过滤
    if (query.visible !== undefined) {
      results = results.filter(instance => instance.visible === query.visible)
    }

    // 按用户数据过滤
    if (query.userData) {
      results = results.filter(instance => {
        if (!instance.userData) return false
        return Object.entries(query.userData!).every(([key, value]) => {
          return instance.userData![key] === value
        })
      })
    }

    // 按标签过滤
    if (query.tags && query.tags.length > 0) {
      results = results.filter(instance => {
        const instanceTags = instance.userData?.tags as string[] || []
        return query.tags!.some(tag => instanceTags.includes(tag))
      })
    }

    // 排序
    if (query.sortBy) {
      results.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (query.sortBy) {
          case 'createdAt':
            aValue = a.createdAt
            bValue = b.createdAt
            break
          case 'updatedAt':
            aValue = a.updatedAt
            bValue = b.updatedAt
            break
          case 'id':
            aValue = a.id
            bValue = b.id
            break
          default:
            return 0
        }

        if (aValue < bValue) return query.sortOrder === 'desc' ? 1 : -1
        if (aValue > bValue) return query.sortOrder === 'desc' ? -1 : 1
        return 0
      })
    }

    // 分页
    if (query.limit !== undefined) {
      const offset = query.offset || 0
      results = results.slice(offset, offset + query.limit)
    }

    return results
  }

  /**
   * 检查实例是否存在
   */
  has(instanceId: string): boolean {
    return this.instances.has(instanceId)
  }

  /**
   * 获取实例数量
   */
  size(): number {
    return this.instances.size
  }

  /**
   * 获取统计信息
   */
  getStats(): InstanceStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 批量操作
   */
  async batchOperation<T>(
    instanceIds: string[],
    operation: (instance: WatermarkInstance) => Promise<T>,
    options: BatchOperationOptions = {}
  ): Promise<Array<{ instanceId: string; result?: T; error?: Error }>> {
    const results: Array<{ instanceId: string; result?: T; error?: Error }> = []
    const { concurrency = 5, continueOnError = true } = options

    // 分批处理
    for (let i = 0; i < instanceIds.length; i += concurrency) {
      const batch = instanceIds.slice(i, i + concurrency)
      
      const batchPromises = batch.map(async (instanceId) => {
        const instance = this.instances.get(instanceId)
        if (!instance) {
          return {
            instanceId,
            error: new Error(`Instance ${instanceId} not found`)
          }
        }

        try {
          const result = await operation(instance)
          return { instanceId, result }
        } catch (error) {
          const errorResult = { instanceId, error: error as Error }
          if (!continueOnError) {
            throw error
          }
          return errorResult
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  /**
   * 清理已销毁的实例
   */
  cleanup(): number {
    const destroyedInstances = Array.from(this.instances.entries())
      .filter(([, instance]) => instance.state === 'destroyed')
    
    let cleanedCount = 0
    for (const [instanceId] of destroyedInstances) {
      if (this.unregister(instanceId)) {
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * 获取容器的实例数量
   */
  getContainerInstanceCount(container: HTMLElement): number {
    const instanceIds = this.instancesByContainer.get(container)
    return instanceIds ? instanceIds.size : 0
  }

  /**
   * 检查容器是否有实例
   */
  hasContainerInstances(container: HTMLElement): boolean {
    return this.getContainerInstanceCount(container) > 0
  }

  /**
   * 获取所有容器
   */
  getAllContainers(): HTMLElement[] {
    return Array.from(this.instancesByContainer.keys())
  }

  /**
   * 根据选择器查找实例
   */
  findBySelector(selector: string): WatermarkInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => {
        try {
          return instance.container.matches(selector)
        } catch {
          return false
        }
      })
  }

  /**
   * 获取实例的邻居实例（同容器）
   */
  getSiblings(instanceId: string): WatermarkInstance[] {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      return []
    }

    return this.getByContainer(instance.container)
      .filter(sibling => sibling.id !== instanceId)
  }

  /**
   * 更新实例状态
   */
  updateInstanceState(instanceId: string, state: WatermarkInstanceState): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      return false
    }

    instance.state = state
    instance.updatedAt = Date.now()
    this.updateStats()
    
    return true
  }

  /**
   * 获取最近创建的实例
   */
  getRecentlyCreated(count = 10): WatermarkInstance[] {
    return Array.from(this.instances.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count)
  }

  /**
   * 获取最近更新的实例
   */
  getRecentlyUpdated(count = 10): WatermarkInstance[] {
    return Array.from(this.instances.values())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, count)
  }

  /**
   * 清空所有实例
   */
  clear(): void {
    this.instances.clear()
    this.instancesByContainer.clear()
    this.updateStats()
  }

  /**
   * 导出实例数据
   */
  export(): Array<{
    id: string
    state: WatermarkInstanceState
    config: any
    createdAt: number
    updatedAt: number
    visible: boolean
    userData?: Record<string, any>
  }> {
    return Array.from(this.instances.values()).map(instance => ({
      id: instance.id,
      state: instance.state,
      config: instance.config,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
      visible: instance.visible,
      userData: instance.userData
    }))
  }

  // 私有方法

  private updateStats(): void {
    const instances = Array.from(this.instances.values())
    
    this.stats = {
      total: instances.length,
      active: instances.filter(i => i.state === 'active').length,
      paused: instances.filter(i => i.state === 'paused').length,
      destroyed: instances.filter(i => i.state === 'destroyed').length,
      creating: instances.filter(i => i.state === 'creating').length,
      updating: instances.filter(i => i.state === 'updating').length,
      destroying: instances.filter(i => i.state === 'destroying').length
    }
  }
}