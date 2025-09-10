/**
 * 事件存储
 * 提供事件持久化和回放功能
 */

import type { EventQuery, EventRecord, EventStoreOptions } from '../types'
import { EventEmitter } from 'node:events'

/**
 * 快照接口
 */
interface EventSnapshot {
  name: string
  timestamp: Date
  eventCount: number
  lastSequence: number
  events: EventRecord[]
}

/**
 * 事件存储类
 */
export class EventStore extends EventEmitter {
  private events: EventRecord[] = []
  private options: Required<EventStoreOptions>
  private snapshots: Map<string, EventSnapshot> = new Map()

  constructor(options: EventStoreOptions = {}) {
    super()

    this.options = {
      maxEvents: options.maxEvents || 10000,
      enableSnapshots: options.enableSnapshots !== false,
      snapshotInterval: options.snapshotInterval || 100,
      enableCompression: options.enableCompression !== false,
      enableEncryption: options.enableEncryption !== false,
      encryptionKey: options.encryptionKey || '',
      persistToDisk: options.persistToDisk !== false,
      storageDir: options.storageDir || './events',
    }
  }

  /**
   * 存储事件
   */
  store(event: string, data: unknown, metadata: Record<string, unknown> = {}): string {
    const eventRecord: EventRecord = {
      id: this.generateEventId(),
      event,
      data,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        version: 1,
      },
      timestamp: new Date(),
      sequence: this.events.length + 1,
    }

    // 应用压缩
    if (this.options.enableCompression) {
      eventRecord.data = this.compress(eventRecord.data)
      eventRecord.metadata.compressed = true
    }

    // 应用加密
    if (this.options.enableEncryption && this.options.encryptionKey) {
      eventRecord.data = this.encrypt(eventRecord.data)
      eventRecord.metadata.encrypted = true
    }

    this.events.push(eventRecord)

    // 检查是否需要清理旧事件
    if (this.events.length > this.options.maxEvents) {
      this.events.shift()
    }

    // 检查是否需要创建快照
    if (this.options.enableSnapshots && this.events.length % this.options.snapshotInterval === 0) {
      this.createSnapshot()
    }

    // 持久化到磁盘
    if (this.options.persistToDisk) {
      this.persistEvent(eventRecord)
    }

    this.emit('eventStored', eventRecord)
    return eventRecord.id
  }

  /**
   * 查询事件
   */
  query(query: EventQuery = {}): EventRecord[] {
    let results = [...this.events]

    // 按事件名称过滤
    if (query.event) {
      if (Array.isArray(query.event)) {
        results = results.filter(record => query.event!.includes(record.event))
      }
      else {
        results = results.filter(record => record.event === query.event)
      }
    }

    // 按时间范围过滤
    if (query.from) {
      results = results.filter(record => record.timestamp >= query.from!)
    }
    if (query.to) {
      results = results.filter(record => record.timestamp <= query.to!)
    }

    // 按序列号范围过滤
    if (query.fromSequence) {
      results = results.filter(record => record.sequence >= query.fromSequence!)
    }
    if (query.toSequence) {
      results = results.filter(record => record.sequence <= query.toSequence!)
    }

    // 按元数据过滤
    if (query.metadata) {
      results = results.filter((record) => {
        return Object.entries(query.metadata!).every(
          ([key, value]) => record.metadata[key] === value,
        )
      })
    }

    // 排序
    if (query.orderBy) {
      const { field, direction = 'asc' } = query.orderBy
      results.sort((a, b) => {
        const aValue = this.getFieldValue(a, field)
        const bValue = this.getFieldValue(b, field)

        if (direction === 'asc') {
          return this.compareValues(aValue, bValue)
        }
        else {
          return this.compareValues(bValue, aValue)
        }
      })
    }

    // 分页
    if (query.limit) {
      const offset = query.offset || 0
      results = results.slice(offset, offset + query.limit)
    }

    return results.map(record => this.deserializeEvent(record))
  }

  /**
   * 获取事件
   */
  getEvent(id: string): EventRecord | undefined {
    const record = this.events.find(event => event.id === id)
    return record ? this.deserializeEvent(record) : undefined
  }

  /**
   * 获取最新事件
   */
  getLatestEvents(count: number = 10): EventRecord[] {
    return this.events.slice(-count).map(record => this.deserializeEvent(record))
  }

  /**
   * 回放事件
   */
  replay(query: EventQuery = {}, handler?: (event: EventRecord) => void): EventRecord[] {
    const events = this.query(query)

    for (const event of events) {
      if (handler) {
        handler(event)
      }
      this.emit('eventReplayed', event)
    }

    return events
  }

  /**
   * 创建快照
   */
  createSnapshot(name?: string): void {
    const snapshotName = name || `snapshot_${Date.now()}`
    const snapshot = {
      name: snapshotName,
      timestamp: new Date(),
      eventCount: this.events.length,
      lastSequence: this.events.length > 0 ? (this.events[this.events.length - 1]?.sequence ?? 0) : 0,
      events: [...this.events],
    }

    this.snapshots.set(snapshotName, snapshot)
    this.emit('snapshotCreated', snapshot)
  }

  /**
   * 恢复快照
   */
  restoreSnapshot(name: string): boolean {
    const snapshot = this.snapshots.get(name)
    if (!snapshot) {
      return false
    }

    this.events = [...snapshot.events]
    this.emit('snapshotRestored', snapshot)
    return true
  }

  /**
   * 获取快照列表
   */
  getSnapshots(): string[] {
    return Array.from(this.snapshots.keys())
  }

  /**
   * 删除快照
   */
  deleteSnapshot(name: string): boolean {
    const deleted = this.snapshots.delete(name)
    if (deleted) {
      this.emit('snapshotDeleted', name)
    }
    return deleted
  }

  /**
   * 清空事件存储
   */
  clear(): void {
    this.events = []
    this.snapshots.clear()
    this.emit('storeCleared')
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalEvents: number
    eventTypes: Record<string, number>
    oldestEvent?: Date
    newestEvent?: Date
    snapshotCount: number
    storageSize: number
  } {
    const eventTypes: Record<string, number> = {}
    let oldestEvent: Date | undefined
    let newestEvent: Date | undefined

    for (const event of this.events) {
      eventTypes[event.event] = (eventTypes[event.event] || 0) + 1

      if (!oldestEvent || event.timestamp < oldestEvent) {
        oldestEvent = event.timestamp
      }
      if (!newestEvent || event.timestamp > newestEvent) {
        newestEvent = event.timestamp
      }
    }

    return {
      totalEvents: this.events.length,
      eventTypes,
      oldestEvent,
      newestEvent,
      snapshotCount: this.snapshots.size,
      storageSize: this.calculateStorageSize(),
    }
  }

  /**
   * 导出事件
   */
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2)
    }
    else {
      // CSV格式
      const headers = ['id', 'event', 'data', 'timestamp', 'sequence']
      const rows = this.events.map(event => [
        event.id,
        event.event,
        JSON.stringify(event.data),
        event.timestamp.toISOString(),
        event.sequence.toString(),
      ])

      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
  }

  /**
   * 导入事件
   */
  import(data: string, format: 'json' | 'csv' = 'json'): number {
    let importedEvents: EventRecord[] = []

    if (format === 'json') {
      importedEvents = JSON.parse(data)
    }
    else {
      // CSV格式解析
      const lines = data.split('\n')
      const headerLine = lines[0]
      if (headerLine) {
        const headers = headerLine.split(',')

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          if (!line)
            continue
          const values = line.split(',')
          if (values.length === headers.length) {
            const id = values[0] ?? ''
            const eventName = values[1] ?? ''
            const dataStr = values[2] ?? '{}'
            const ts = values[3] ?? ''
            const seqStr = values[4] ?? '0'
            if (!id || !eventName)
              continue
            let parsedData: unknown
            try {
              parsedData = JSON.parse(dataStr)
            }
            catch {
              parsedData = {}
            }
            const sequence = Number.parseInt(seqStr)
            const timestamp = ts ? new Date(ts) : new Date()
            importedEvents.push({
              id,
              event: eventName,
              data: parsedData,
              metadata: {},
              timestamp,
              sequence,
            })
          }
        }
      }
    }

    // 验证和导入事件
    let importedCount = 0
    for (const event of importedEvents) {
      if (this.validateEvent(event)) {
        this.events.push(event)
        importedCount++
      }
    }

    this.emit('eventsImported', importedCount)
    return importedCount
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 压缩数据
   */
  private compress(data: unknown): string {
    // 简单的JSON压缩，实际应用中可以使用gzip等
    return JSON.stringify(data)
  }

  /**
   * 解压数据
   */
  private decompress(data: unknown): unknown {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      }
      catch {
        return data
      }
    }
    return data
  }

  /**
   * 加密数据
   */
  private encrypt(data: unknown): unknown {
    // 简单的加密实现，实际应用中应使用更安全的加密算法
    if (!this.options.encryptionKey)
      return data

    const dataStr = JSON.stringify(data)
    let encrypted = ''
    for (let i = 0; i < dataStr.length; i++) {
      encrypted += String.fromCharCode(
        dataStr.charCodeAt(i)
        ^ this.options.encryptionKey.charCodeAt(i % this.options.encryptionKey.length),
      )
    }
    return encrypted
  }

  /**
   * 解密数据
   */
  private decrypt(data: unknown): unknown {
    if (!this.options.encryptionKey || typeof data !== 'string')
      return data

    let decrypted = ''
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(
        (data as string).charCodeAt(i)
        ^ this.options.encryptionKey.charCodeAt(i % this.options.encryptionKey.length),
      )
    }

    try {
      return JSON.parse(decrypted)
    }
    catch {
      return decrypted
    }
  }

  /**
   * 反序列化事件
   */
  private deserializeEvent(record: EventRecord): EventRecord {
    const deserialized = { ...record }

    // 解密
    if (record.metadata.encrypted && this.options.encryptionKey) {
      deserialized.data = this.decrypt(record.data)
    }

    // 解压
    if (record.metadata.compressed) {
      deserialized.data = this.decompress(record.data)
    }

    return deserialized
  }

  /**
   * 获取字段值
   */
  private getFieldValue(record: EventRecord, field: string): unknown {
    switch (field) {
      case 'timestamp':
        return record.timestamp
      case 'sequence':
        return record.sequence
      case 'event':
        return record.event
      default:
        return record.metadata[field]
    }
  }

  /**
   * 验证事件
   */
  private validateEvent(event: unknown): event is EventRecord {
    return (
      event !== null
      && typeof event === 'object'
      && typeof (event as EventRecord).id === 'string'
      && typeof (event as EventRecord).event === 'string'
      && (event as EventRecord).timestamp instanceof Date
      && typeof (event as EventRecord).sequence === 'number'
    )
  }

  /**
   * 持久化事件
   */
  private async persistEvent(event: EventRecord): Promise<void> {
    // 实际实现中应该写入文件系统或数据库
    // 这里只是一个占位符
    this.emit('eventPersisted', event)
  }

  /**
   * 比较两个值
   */
  private compareValues(a: unknown, b: unknown): number {
    // 处理 null 和 undefined
    if (a == null && b == null) return 0
    if (a == null) return -1
    if (b == null) return 1

    // 如果类型相同，直接比较
    if (typeof a === typeof b) {
      if (typeof a === 'number' || typeof a === 'string') {
        return a < b ? -1 : a > b ? 1 : 0
      }
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime()
      }
    }

    // 转换为字符串比较
    return String(a).localeCompare(String(b))
  }

  /**
   * 计算存储大小
   */
  private calculateStorageSize(): number {
    return (
      JSON.stringify(this.events).length
      + JSON.stringify(Array.from(this.snapshots.values())).length
    )
  }

  /**
   * 创建事件存储实例
   */
  static create(options?: EventStoreOptions): EventStore {
    return new EventStore(options)
  }
}
