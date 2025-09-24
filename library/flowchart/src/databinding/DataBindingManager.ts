/**
 * 数据绑定管理器
 * 
 * 管理数据源和数据绑定的核心类
 */

import type {
  DataBindingManager as IDataBindingManager,
  DataSource,
  DataSourceConfig,
  DataBinding,
  DataBindingConfig,
  DataUpdateEvent,
  BindingUpdateEvent,
  DataSourceStats
} from './types'
import { DataSourceAdapter } from './DataSourceAdapter'
import { BindingResolver } from './BindingResolver'
import { DataCache } from './DataCache'
import { EventEmitter } from 'events'

/**
 * 数据绑定管理器类
 */
export class DataBindingManager extends EventEmitter implements IDataBindingManager {
  private dataSources: Map<string, DataSource> = new Map()
  private bindings: Map<string, DataBinding> = new Map()
  private adapters: Map<string, DataSourceAdapter> = new Map()
  private bindingResolver: BindingResolver
  private dataCache: DataCache
  private config: DataBindingConfig
  private updateTimers: Map<string, number> = new Map()

  constructor(config?: Partial<DataBindingConfig>) {
    super()
    
    this.config = {
      enabled: true,
      defaultPollInterval: 30000, // 30秒
      defaultCacheExpiry: 300000, // 5分钟
      maxConcurrentConnections: 10,
      defaultTimeout: 10000, // 10秒
      debugMode: false,
      builtinTransformers: [],
      builtinValidators: [],
      ...config
    }
    
    this.bindingResolver = new BindingResolver()
    this.dataCache = new DataCache()
    
    this.setupEventListeners()
  }

  /**
   * 添加数据源
   */
  async addDataSource(config: DataSourceConfig): Promise<DataSource> {
    try {
      // 检查数据源是否已存在
      if (this.dataSources.has(config.id)) {
        throw new Error(`数据源 ${config.id} 已存在`)
      }
      
      // 创建数据源实例
      const dataSource: DataSource = {
        config,
        status: 'disconnected',
        data: null
      }
      
      // 创建适配器
      const adapter = new DataSourceAdapter(config.type)
      this.adapters.set(config.id, adapter)
      
      // 设置适配器事件监听
      this.setupAdapterEventListeners(config.id, adapter)
      
      // 连接数据源
      await this.connectDataSource(dataSource, adapter)
      
      // 保存数据源
      this.dataSources.set(config.id, dataSource)
      
      // 触发事件
      this.emit('datasource:connected', dataSource)
      
      if (this.config.debugMode) {
        console.log(`数据源 ${config.id} 添加成功`)
      }
      
      return dataSource
    } catch (error) {
      throw new Error(`添加数据源失败: ${error}`)
    }
  }

  /**
   * 移除数据源
   */
  async removeDataSource(id: string): Promise<void> {
    try {
      const dataSource = this.dataSources.get(id)
      if (!dataSource) {
        throw new Error(`数据源 ${id} 不存在`)
      }
      
      // 断开连接
      const adapter = this.adapters.get(id)
      if (adapter) {
        await adapter.disconnect()
        this.adapters.delete(id)
      }
      
      // 移除相关绑定
      const relatedBindings = Array.from(this.bindings.values())
        .filter(binding => binding.dataSourceId === id)
      
      for (const binding of relatedBindings) {
        await this.removeBinding(binding.id)
      }
      
      // 清理定时器
      const timer = this.updateTimers.get(id)
      if (timer) {
        clearInterval(timer)
        this.updateTimers.delete(id)
      }
      
      // 移除数据源
      this.dataSources.delete(id)
      
      // 触发事件
      this.emit('datasource:disconnected', dataSource)
      
      if (this.config.debugMode) {
        console.log(`数据源 ${id} 移除成功`)
      }
    } catch (error) {
      throw new Error(`移除数据源失败: ${error}`)
    }
  }

  /**
   * 获取数据源
   */
  getDataSource(id: string): DataSource | null {
    return this.dataSources.get(id) || null
  }

  /**
   * 获取所有数据源
   */
  getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values())
  }

  /**
   * 添加数据绑定
   */
  async addBinding(binding: DataBinding): Promise<void> {
    try {
      // 检查绑定是否已存在
      if (this.bindings.has(binding.id)) {
        throw new Error(`数据绑定 ${binding.id} 已存在`)
      }
      
      // 检查数据源是否存在
      const dataSource = this.dataSources.get(binding.dataSourceId)
      if (!dataSource) {
        throw new Error(`数据源 ${binding.dataSourceId} 不存在`)
      }
      
      // 验证绑定表达式
      if (!this.bindingResolver.validateExpression(binding.expression)) {
        throw new Error(`绑定表达式 ${binding.expression} 无效`)
      }
      
      // 保存绑定
      this.bindings.set(binding.id, binding)
      
      // 如果绑定已启用，立即更新
      if (binding.enabled) {
        await this.updateBinding(binding.id)
      }
      
      // 触发事件
      this.emit('binding:created', binding)
      
      if (this.config.debugMode) {
        console.log(`数据绑定 ${binding.id} 添加成功`)
      }
    } catch (error) {
      throw new Error(`添加数据绑定失败: ${error}`)
    }
  }

  /**
   * 移除数据绑定
   */
  async removeBinding(id: string): Promise<void> {
    try {
      const binding = this.bindings.get(id)
      if (!binding) {
        throw new Error(`数据绑定 ${id} 不存在`)
      }
      
      // 移除绑定
      this.bindings.delete(id)
      
      // 触发事件
      this.emit('binding:removed', id)
      
      if (this.config.debugMode) {
        console.log(`数据绑定 ${id} 移除成功`)
      }
    } catch (error) {
      throw new Error(`移除数据绑定失败: ${error}`)
    }
  }

  /**
   * 获取数据绑定
   */
  getBinding(id: string): DataBinding | null {
    return this.bindings.get(id) || null
  }

  /**
   * 获取节点的所有绑定
   */
  getNodeBindings(nodeId: string): DataBinding[] {
    return Array.from(this.bindings.values())
      .filter(binding => binding.nodeId === nodeId)
  }

  /**
   * 更新绑定数据
   */
  async updateBinding(bindingId: string): Promise<void> {
    try {
      const binding = this.bindings.get(bindingId)
      if (!binding || !binding.enabled) {
        return
      }
      
      const dataSource = this.dataSources.get(binding.dataSourceId)
      if (!dataSource || !dataSource.data) {
        return
      }
      
      // 检查条件表达式
      if (binding.condition) {
        const conditionResult = this.bindingResolver.resolveExpression(
          binding.condition,
          dataSource.data
        )
        if (!conditionResult.success || !conditionResult.value) {
          return
        }
      }
      
      // 解析绑定表达式
      const result = this.bindingResolver.resolveExpression(
        binding.expression,
        dataSource.data
      )
      
      if (!result.success) {
        this.handleBindingError(binding, new Error(result.error || '表达式解析失败'))
        return
      }
      
      let value = result.value
      
      // 应用数据转换器
      if (binding.transformer) {
        try {
          value = binding.transformer.transform(value, {
            node: this.getNodeById(binding.nodeId),
            sourceData: dataSource.data,
            binding
          })
        } catch (error) {
          this.handleBindingError(binding, error as Error)
          return
        }
      }
      
      // 应用数据验证器
      if (binding.validator) {
        const validationResult = binding.validator.validate(value, {
          node: this.getNodeById(binding.nodeId),
          binding
        })
        
        if (!validationResult.valid) {
          this.handleBindingError(binding, new Error(validationResult.errors?.join(', ')))
          return
        }
      }
      
      // 获取当前值
      const currentValue = this.getNodePropertyValue(binding.nodeId, binding.targetProperty)
      
      // 检查值是否发生变化
      if (JSON.stringify(currentValue) === JSON.stringify(value)) {
        return
      }
      
      // 更新节点属性
      this.updateNodeProperty(binding.nodeId, binding.targetProperty, value)
      
      // 触发绑定更新事件
      const updateEvent: BindingUpdateEvent = {
        bindingId: binding.id,
        nodeId: binding.nodeId,
        targetProperty: binding.targetProperty,
        oldValue: currentValue,
        newValue: value,
        timestamp: Date.now()
      }
      
      this.emit('binding:updated', updateEvent)
      
      if (this.config.debugMode) {
        console.log(`绑定 ${bindingId} 更新成功:`, { oldValue: currentValue, newValue: value })
      }
    } catch (error) {
      const binding = this.bindings.get(bindingId)
      if (binding) {
        this.handleBindingError(binding, error as Error)
      }
    }
  }

  /**
   * 刷新所有绑定
   */
  async refreshAllBindings(): Promise<void> {
    const enabledBindings = Array.from(this.bindings.values())
      .filter(binding => binding.enabled)
    
    const updatePromises = enabledBindings.map(binding => 
      this.updateBinding(binding.id).catch(error => {
        console.error(`更新绑定 ${binding.id} 失败:`, error)
      })
    )
    
    await Promise.all(updatePromises)
  }

  /**
   * 启用/禁用绑定
   */
  async toggleBinding(bindingId: string, enabled: boolean): Promise<void> {
    const binding = this.bindings.get(bindingId)
    if (!binding) {
      throw new Error(`数据绑定 ${bindingId} 不存在`)
    }
    
    binding.enabled = enabled
    
    if (enabled) {
      await this.updateBinding(bindingId)
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): DataSourceStats {
    const dataSources = Array.from(this.dataSources.values())
    const bindings = Array.from(this.bindings.values())
    
    return {
      totalDataSources: dataSources.length,
      connectedDataSources: dataSources.filter(ds => ds.status === 'connected').length,
      errorDataSources: dataSources.filter(ds => ds.status === 'error').length,
      totalBindings: bindings.length,
      activeBindings: bindings.filter(b => b.enabled).length,
      dataUpdates: 0, // TODO: 实现数据更新计数
      lastUpdateTime: Date.now()
    }
  }

  /**
   * 连接数据源
   */
  private async connectDataSource(dataSource: DataSource, adapter: DataSourceAdapter): Promise<void> {
    try {
      dataSource.status = 'connecting'
      
      // 连接适配器
      await adapter.connect(dataSource.config)
      
      // 获取初始数据
      const data = await adapter.fetchData()
      dataSource.data = data
      dataSource.status = 'connected'
      dataSource.lastUpdated = Date.now()
      
      // 设置轮询（如果配置了轮询间隔）
      if (dataSource.config.pollInterval && dataSource.config.pollInterval > 0) {
        const timer = setInterval(async () => {
          try {
            const newData = await adapter.fetchData()
            this.handleDataUpdate(dataSource.config.id, newData)
          } catch (error) {
            console.error(`轮询数据源 ${dataSource.config.id} 失败:`, error)
          }
        }, dataSource.config.pollInterval)
        
        this.updateTimers.set(dataSource.config.id, timer)
      }
      
      // 订阅数据变化（对于WebSocket等实时数据源）
      adapter.subscribe((data) => {
        this.handleDataUpdate(dataSource.config.id, data)
      })
      
    } catch (error) {
      dataSource.status = 'error'
      dataSource.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  }

  /**
   * 处理数据更新
   */
  private handleDataUpdate(dataSourceId: string, newData: any): void {
    const dataSource = this.dataSources.get(dataSourceId)
    if (!dataSource) {
      return
    }
    
    // 更新数据源数据
    const oldData = dataSource.data
    dataSource.data = newData
    dataSource.lastUpdated = Date.now()
    
    // 更新缓存
    if (dataSource.config.enableCache) {
      this.dataCache.set(
        dataSourceId,
        newData,
        dataSource.config.cacheExpiry || this.config.defaultCacheExpiry
      )
    }
    
    // 触发数据更新事件
    const updateEvent: DataUpdateEvent = {
      dataSourceId,
      data: newData,
      timestamp: Date.now(),
      changeType: oldData ? 'update' : 'create'
    }
    
    this.emit('datasource:data-updated', updateEvent)
    
    // 更新相关绑定
    const relatedBindings = Array.from(this.bindings.values())
      .filter(binding => binding.dataSourceId === dataSourceId && binding.enabled)
    
    for (const binding of relatedBindings) {
      // 使用节流控制更新频率
      if (binding.throttle && binding.throttle > 0) {
        this.throttledUpdateBinding(binding.id, binding.throttle)
      } else {
        this.updateBinding(binding.id).catch(error => {
          console.error(`更新绑定 ${binding.id} 失败:`, error)
        })
      }
    }
  }

  /**
   * 节流更新绑定
   */
  private throttledUpdateBinding(bindingId: string, throttle: number): void {
    const timerId = `throttle_${bindingId}`
    
    if (this.updateTimers.has(timerId)) {
      return // 已有更新在等待中
    }
    
    const timer = setTimeout(() => {
      this.updateBinding(bindingId).catch(error => {
        console.error(`节流更新绑定 ${bindingId} 失败:`, error)
      }).finally(() => {
        this.updateTimers.delete(timerId)
      })
    }, throttle)
    
    this.updateTimers.set(timerId, timer)
  }

  /**
   * 处理绑定错误
   */
  private handleBindingError(binding: DataBinding, error: Error): void {
    this.emit('binding:error', binding, error)
    
    // 根据错误策略处理
    switch (binding.errorStrategy) {
      case 'ignore':
        // 忽略错误
        break
      
      case 'default':
        // 使用默认值
        if (binding.defaultValue !== undefined) {
          this.updateNodeProperty(binding.nodeId, binding.targetProperty, binding.defaultValue)
        }
        break
      
      case 'retry':
        // 重试更新
        setTimeout(() => {
          this.updateBinding(binding.id).catch(() => {
            // 重试失败，使用默认值
            if (binding.defaultValue !== undefined) {
              this.updateNodeProperty(binding.nodeId, binding.targetProperty, binding.defaultValue)
            }
          })
        }, 1000)
        break
      
      case 'fallback':
        // 使用备用数据源
        // TODO: 实现备用数据源逻辑
        break
      
      case 'notify':
        // 通知用户
        console.error(`绑定 ${binding.id} 错误:`, error)
        break
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听数据源事件
    this.on('datasource:data-updated', (event: DataUpdateEvent) => {
      if (this.config.debugMode) {
        console.log('数据源数据更新:', event)
      }
    })
    
    // 监听绑定事件
    this.on('binding:updated', (event: BindingUpdateEvent) => {
      if (this.config.debugMode) {
        console.log('绑定数据更新:', event)
      }
    })
  }

  /**
   * 设置适配器事件监听器
   */
  private setupAdapterEventListeners(dataSourceId: string, adapter: DataSourceAdapter): void {
    // TODO: 实现适配器事件监听
  }

  /**
   * 获取节点（需要从编辑器获取）
   */
  private getNodeById(nodeId: string): any {
    // TODO: 从编辑器获取节点数据
    return null
  }

  /**
   * 获取节点属性值
   */
  private getNodePropertyValue(nodeId: string, property: string): any {
    // TODO: 从编辑器获取节点属性值
    return null
  }

  /**
   * 更新节点属性
   */
  private updateNodeProperty(nodeId: string, property: string, value: any): void {
    // TODO: 更新编辑器中的节点属性
  }
}
