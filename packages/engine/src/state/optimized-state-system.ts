/**
 * 优化的状态管理系统
 * 支持状态分片、压缩、迁移和GraphQL风格查询
 */

import type { Engine, Logger } from '../types'

// ==================== 类型定义 ====================

export interface StateShardConfig {
  maxSize?: number // 每个分片的最大大小（字节）
  strategy?: 'hash' | 'range' | 'round-robin'
  compress?: boolean
  encryption?: boolean
}

export interface StateMigration {
  version: string
  up: (oldState: any) => any
  down: (newState: any) => any
  description?: string
}

export interface GraphQLQuery {
  query: string
  variables?: Record<string, unknown>
}

export interface StateCompressionOptions {
  algorithm?: 'gzip' | 'brotli' | 'lz4'
  level?: number
  threshold?: number // 压缩阈值（字节）
}

export interface StateShard {
  id: string
  data: Map<string, any>
  size: number
  compressed: boolean
  lastAccess: number
}

// ==================== 实现 ====================

export class OptimizedStateSystem {
  private shards = new Map<string, StateShard>()
  private shardConfig: StateShardConfig
  private migrations: StateMigration[] = []
  private currentVersion = '1.0.0'
  private compressionOptions: StateCompressionOptions
  private engine?: Engine
  private logger?: Logger
  private shardIndex = new Map<string, string>() // key -> shardId
  private accessLog = new Map<string, number>() // 访问频率统计

  constructor(engine?: Engine, config?: StateShardConfig) {
    this.engine = engine
    this.logger = engine?.logger
    this.shardConfig = {
      maxSize: 1024 * 1024, // 1MB per shard
      strategy: 'hash',
      compress: true,
      encryption: false,
      ...config
    }
    this.compressionOptions = {
      algorithm: 'gzip',
      level: 6,
      threshold: 1024 // 1KB
    }
    
    this.initializeShards()
  }

  // ==================== 状态分片 ====================

  /**
   * 初始化分片
   */
  private initializeShards(): void {
    // 创建初始分片
    for (let i = 0; i < 4; i++) {
      const shardId = `shard-${i}`
      this.shards.set(shardId, {
        id: shardId,
        data: new Map(),
        size: 0,
        compressed: false,
        lastAccess: Date.now()
      })
    }
  }

  /**
   * 获取键对应的分片
   */
  private getShardForKey(key: string): StateShard {
    let shardId = this.shardIndex.get(key)
    
    if (!shardId) {
      // 分配新键到分片
      shardId = this.allocateShard(key)
      this.shardIndex.set(key, shardId)
    }
    
    const shard = this.shards.get(shardId)!
    shard.lastAccess = Date.now()
    
    // 记录访问频率
    this.accessLog.set(key, (this.accessLog.get(key) || 0) + 1)
    
    return shard
  }

  /**
   * 分配分片策略
   */
  private allocateShard(key: string): string {
    const shardIds = Array.from(this.shards.keys())
    
    switch (this.shardConfig.strategy) {
      case 'hash':
        // 基于哈希分配
        const hash = this.hashString(key)
        const index = Math.abs(hash) % shardIds.length
        return shardIds[index]
        
      case 'range':
        // 基于键范围分配
        const firstChar = key.charCodeAt(0)
        const rangeIndex = Math.floor((firstChar - 65) / 26 * shardIds.length)
        return shardIds[Math.min(rangeIndex, shardIds.length - 1)]
        
      case 'round-robin':
      default:
        // 轮询分配到最小的分片
        let minShard = shardIds[0]
        let minSize = Infinity
        
        for (const id of shardIds) {
          const shard = this.shards.get(id)!
          if (shard.size < minSize) {
            minSize = shard.size
            minShard = id
          }
        }
        
        return minShard
    }
  }

  /**
   * 分片重平衡
   */
  async rebalanceShards(): Promise<void> {
    this.logger?.info('Starting shard rebalancing')
    
    // 收集所有数据
    const allData = new Map<string, any>()
    for (const shard of this.shards.values()) {
      const decompressed = await this.decompressShard(shard)
      for (const [key, value] of decompressed.data) {
        allData.set(key, value)
      }
    }
    
    // 清空分片
    for (const shard of this.shards.values()) {
      shard.data.clear()
      shard.size = 0
      shard.compressed = false
    }
    this.shardIndex.clear()
    
    // 根据访问频率重新分配
    const sortedKeys = Array.from(allData.keys()).sort((a, b) => {
      const freqA = this.accessLog.get(a) || 0
      const freqB = this.accessLog.get(b) || 0
      return freqB - freqA // 高频率的放在一起
    })
    
    // 重新分配数据
    for (const key of sortedKeys) {
      const value = allData.get(key)
      await this.setShardedState(key, value)
    }
    
    this.logger?.info('Shard rebalancing completed')
  }

  // ==================== 状态压缩 ====================

  /**
   * 压缩状态数据
   */
  private async compressData(data: any): Promise<ArrayBuffer> {
    const json = JSON.stringify(data)
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(json)
    
    if (uint8Array.byteLength < this.compressionOptions.threshold!) {
      return uint8Array.buffer
    }
    
    // 使用 CompressionStream API（如果可用）
    if ('CompressionStream' in globalThis) {
      const format = this.compressionOptions.algorithm === 'brotli' ? 'gzip' : 'gzip'
      const stream = new (globalThis as any).CompressionStream(format)
      
      const writer = stream.writable.getWriter()
      writer.write(uint8Array)
      writer.close()
      
      const chunks: Uint8Array[] = []
      const reader = stream.readable.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      const compressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      )
      
      let offset = 0
      for (const chunk of chunks) {
        compressed.set(chunk, offset)
        offset += chunk.length
      }
      
      return compressed.buffer
    }
    
    // 降级：简单的 RLE 压缩
    return this.simpleCompress(uint8Array)
  }

  /**
   * 解压状态数据
   */
  private async decompressData(buffer: ArrayBuffer): Promise<any> {
    if ('DecompressionStream' in globalThis) {
      const format = this.compressionOptions.algorithm === 'brotli' ? 'gzip' : 'gzip'
      const stream = new (globalThis as any).DecompressionStream(format)
      
      const writer = stream.writable.getWriter()
      writer.write(new Uint8Array(buffer))
      writer.close()
      
      const chunks: Uint8Array[] = []
      const reader = stream.readable.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      const decompressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      )
      
      let offset = 0
      for (const chunk of chunks) {
        decompressed.set(chunk, offset)
        offset += chunk.length
      }
      
      const decoder = new TextDecoder()
      const json = decoder.decode(decompressed)
      return JSON.parse(json)
    }
    
    // 降级处理
    return this.simpleDecompress(new Uint8Array(buffer))
  }

  /**
   * 简单压缩算法（RLE）
   */
  private simpleCompress(data: Uint8Array): ArrayBuffer {
    const result: number[] = []
    let i = 0
    
    while (i < data.length) {
      let count = 1
      const value = data[i]
      
      while (i + count < data.length && data[i + count] === value && count < 255) {
        count++
      }
      
      result.push(count, value)
      i += count
    }
    
    return new Uint8Array(result).buffer
  }

  /**
   * 简单解压算法
   */
  private simpleDecompress(data: Uint8Array): any {
    const result: number[] = []
    
    for (let i = 0; i < data.length; i += 2) {
      const count = data[i]
      const value = data[i + 1]
      
      for (let j = 0; j < count; j++) {
        result.push(value)
      }
    }
    
    const decoder = new TextDecoder()
    const json = decoder.decode(new Uint8Array(result))
    return JSON.parse(json)
  }

  /**
   * 压缩分片
   */
  private async compressShard(shard: StateShard): Promise<void> {
    if (shard.compressed || shard.size < this.compressionOptions.threshold!) {
      return
    }
    
    const data = Object.fromEntries(shard.data)
    const compressed = await this.compressData(data)
    
    shard.data.clear()
    shard.data.set('__compressed__', compressed)
    shard.compressed = true
    
    this.logger?.debug(`Shard ${shard.id} compressed: ${shard.size} -> ${compressed.byteLength}`)
  }

  /**
   * 解压分片
   */
  private async decompressShard(shard: StateShard): Promise<StateShard> {
    if (!shard.compressed) {
      return shard
    }
    
    const compressed = shard.data.get('__compressed__') as ArrayBuffer
    const data = await this.decompressData(compressed)
    
    shard.data.clear()
    for (const [key, value] of Object.entries(data)) {
      shard.data.set(key, value)
    }
    shard.compressed = false
    
    return shard
  }

  // ==================== 状态迁移 ====================

  /**
   * 注册迁移
   */
  registerMigration(migration: StateMigration): void {
    this.migrations.push(migration)
    this.migrations.sort((a, b) => a.version.localeCompare(b.version))
  }

  /**
   * 执行迁移
   */
  async migrate(targetVersion: string): Promise<void> {
    const currentIndex = this.migrations.findIndex(m => m.version === this.currentVersion)
    const targetIndex = this.migrations.findIndex(m => m.version === targetVersion)
    
    if (currentIndex === -1 || targetIndex === -1) {
      throw new Error(`Invalid migration version: ${this.currentVersion} -> ${targetVersion}`)
    }
    
    const isUpgrade = targetIndex > currentIndex
    const migrations = isUpgrade
      ? this.migrations.slice(currentIndex + 1, targetIndex + 1)
      : this.migrations.slice(targetIndex, currentIndex).reverse()
    
    this.logger?.info(`Migrating state: ${this.currentVersion} -> ${targetVersion}`)
    
    // 收集所有状态
    let state = await this.getAllState()
    
    // 执行迁移
    for (const migration of migrations) {
      this.logger?.debug(`Running migration: ${migration.version} - ${migration.description}`)
      
      if (isUpgrade) {
        state = await migration.up(state)
      } else {
        state = await migration.down(state)
      }
    }
    
    // 清空并重新设置状态
    await this.clearAllShards()
    await this.setAllState(state)
    
    this.currentVersion = targetVersion
    this.logger?.info(`Migration completed: ${targetVersion}`)
  }

  /**
   * 创建迁移快照
   */
  async createMigrationSnapshot(): Promise<{
    version: string
    state: any
    timestamp: number
  }> {
    const state = await this.getAllState()
    
    return {
      version: this.currentVersion,
      state,
      timestamp: Date.now()
    }
  }

  // ==================== GraphQL 查询 ====================

  /**
   * GraphQL 风格查询
   */
  async query(gql: GraphQLQuery): Promise<any> {
    // 解析查询
    const { fields, filters, orderBy, limit } = this.parseGraphQLQuery(gql.query)
    
    // 收集匹配的数据
    const results: any[] = []
    
    for (const shard of this.shards.values()) {
      const decompressed = await this.decompressShard(shard)
      
      for (const [, value] of decompressed.data) {
        if (this.matchesFilters(value, filters, gql.variables)) {
          results.push(this.selectFields(value, fields))
        }
      }
    }
    
    // 排序
    if (orderBy) {
      results.sort((a, b) => {
        const aVal = this.getNestedValue(a, orderBy.field)
        const bVal = this.getNestedValue(b, orderBy.field)
        return orderBy.direction === 'ASC' 
          ? (aVal > bVal ? 1 : -1)
          : (aVal < bVal ? 1 : -1)
      })
    }
    
    // 限制结果数量
    if (limit) {
      return results.slice(0, limit)
    }
    
    return results
  }

  /**
   * 解析 GraphQL 查询
   */
  private parseGraphQLQuery(query: string): {
    fields: string[]
    filters: Record<string, any>
    orderBy?: { field: string; direction: 'ASC' | 'DESC' }
    limit?: number
  } {
    // 简化的 GraphQL 解析器
    const fields: string[] = []
    const filters: Record<string, any> = {}
    let orderBy: { field: string; direction: 'ASC' | 'DESC' } | undefined
    let limit: number | undefined
    
    // 提取字段
    const fieldsMatch = query.match(/\{([^}]+)\}/)
    if (fieldsMatch) {
      fields.push(...fieldsMatch[1].split(',').map(f => f.trim()))
    }
    
    // 提取过滤器
    const whereMatch = query.match(/where:\s*\{([^}]+)\}/)
    if (whereMatch) {
      const whereParts = whereMatch[1].split(',')
      for (const part of whereParts) {
        const [key, value] = part.split(':').map(s => s.trim())
        filters[key] = value.replace(/["']/g, '')
      }
    }
    
    // 提取排序
    const orderByMatch = query.match(/orderBy:\s*(\w+)_(ASC|DESC)/)
    if (orderByMatch) {
      orderBy = {
        field: orderByMatch[1],
        direction: orderByMatch[2] as 'ASC' | 'DESC'
      }
    }
    
    // 提取限制
    const limitMatch = query.match(/limit:\s*(\d+)/)
    if (limitMatch) {
      limit = Number.parseInt(limitMatch[1])
    }
    
    return { fields, filters, orderBy, limit }
  }

  /**
   * 匹配过滤器
   */
  private matchesFilters(
    value: any, 
    filters: Record<string, any>,
    variables?: Record<string, unknown>
  ): boolean {
    for (const [key, filterValue] of Object.entries(filters)) {
      const actualValue = this.getNestedValue(value, key)
      let expectedValue = filterValue
      
      // 处理变量
      if (typeof filterValue === 'string' && filterValue.startsWith('$')) {
        expectedValue = variables?.[filterValue.substring(1)]
      }
      
      if (actualValue !== expectedValue) {
        return false
      }
    }
    
    return true
  }

  /**
   * 选择字段
   */
  private selectFields(value: any, fields: string[]): any {
    if (fields.length === 0) {
      return value
    }
    
    const result: any = {}
    
    for (const field of fields) {
      const fieldValue = this.getNestedValue(value, field)
      this.setNestedValue(result, field, fieldValue)
    }
    
    return result
  }

  // ==================== 核心 API ====================

  /**
   * 设置分片状态
   */
  async setShardedState(key: string, value: any): Promise<void> {
    const shard = this.getShardForKey(key)
    
    // 解压分片（如果需要）
    if (shard.compressed) {
      await this.decompressShard(shard)
    }
    
    // 计算数据大小
    const size = JSON.stringify(value).length
    
    // 设置数据
    shard.data.set(key, value)
    shard.size += size
    
    // 检查是否需要分片或压缩
    if (shard.size > this.shardConfig.maxSize!) {
      if (this.shardConfig.compress) {
        await this.compressShard(shard)
      } else {
        // 创建新分片
        await this.splitShard(shard)
      }
    }
  }

  /**
   * 获取分片状态
   */
  async getShardedState(key: string): Promise<any> {
    const shard = this.getShardForKey(key)
    
    if (shard.compressed) {
      const decompressed = await this.decompressShard(shard)
      return decompressed.data.get(key)
    }
    
    return shard.data.get(key)
  }

  /**
   * 分割分片
   */
  private async splitShard(shard: StateShard): Promise<void> {
    const newShardId = `shard-${Date.now()}`
    const newShard: StateShard = {
      id: newShardId,
      data: new Map(),
      size: 0,
      compressed: false,
      lastAccess: Date.now()
    }
    
    // 将一半数据移到新分片
    const keys = Array.from(shard.data.keys())
    const mid = Math.floor(keys.length / 2)
    
    for (let i = mid; i < keys.length; i++) {
      const key = keys[i]
      const value = shard.data.get(key)
      newShard.data.set(key, value)
      newShard.size += JSON.stringify(value).length
      shard.data.delete(key)
      this.shardIndex.set(key, newShardId)
    }
    
    // 重新计算原分片大小
    shard.size = Array.from(shard.data.values())
      .reduce((sum, val) => sum + JSON.stringify(val).length, 0)
    
    this.shards.set(newShardId, newShard)
    this.logger?.info(`Shard split: ${shard.id} -> ${newShardId}`)
  }

  /**
   * 获取所有状态
   */
  private async getAllState(): Promise<any> {
    const state: any = {}
    
    for (const shard of this.shards.values()) {
      const decompressed = await this.decompressShard(shard)
      for (const [key, value] of decompressed.data) {
        state[key] = value
      }
    }
    
    return state
  }

  /**
   * 设置所有状态
   */
  private async setAllState(state: any): Promise<void> {
    for (const [key, value] of Object.entries(state)) {
      await this.setShardedState(key, value)
    }
  }

  /**
   * 清空所有分片
   */
  private async clearAllShards(): Promise<void> {
    for (const shard of this.shards.values()) {
      shard.data.clear()
      shard.size = 0
      shard.compressed = false
    }
    this.shardIndex.clear()
  }

  // ==================== 工具方法 ====================

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[key]
    }
    
    return current
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }

  // ==================== 公共 API ====================

  /**
   * 获取分片统计
   */
  getShardStats(): {
    totalShards: number
    totalSize: number
    compressedShards: number
    averageSize: number
    distribution: Array<{ id: string; size: number; compressed: boolean }>
  } {
    const shards = Array.from(this.shards.values())
    const totalSize = shards.reduce((sum, s) => sum + s.size, 0)
    const compressedShards = shards.filter(s => s.compressed).length
    
    return {
      totalShards: shards.length,
      totalSize,
      compressedShards,
      averageSize: totalSize / shards.length,
      distribution: shards.map(s => ({
        id: s.id,
        size: s.size,
        compressed: s.compressed
      }))
    }
  }

  /**
   * 优化分片
   */
  async optimizeShards(): Promise<void> {
    // 压缩不常访问的分片
    const threshold = Date.now() - 60000 // 1分钟
    
    for (const shard of this.shards.values()) {
      if (shard.lastAccess < threshold && !shard.compressed) {
        await this.compressShard(shard)
      }
    }
    
    // 重平衡（如果需要）
    const stats = this.getShardStats()
    const maxSize = Math.max(...stats.distribution.map(d => d.size))
    const minSize = Math.min(...stats.distribution.map(d => d.size))
    
    if (maxSize > minSize * 3) {
      await this.rebalanceShards()
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.shards.clear()
    this.shardIndex.clear()
    this.accessLog.clear()
    this.migrations = []
  }
}

// 导出工厂函数
export function createOptimizedStateSystem(
  engine?: Engine, 
  config?: StateShardConfig
): OptimizedStateSystem {
  return new OptimizedStateSystem(engine, config)
}