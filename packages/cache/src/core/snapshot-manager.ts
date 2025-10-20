import type { SerializableValue, StorageEngine } from '../types'

import type { CacheManager } from './cache-manager'

/**
 * 快照数据结构
 */
export interface CacheSnapshot {
  /** 快照版本 */
  version: string
  /** 创建时间戳 */
  timestamp: number
  /** 快照数据 */
  data: Record<string, SerializableValue>
  /** 元数据 */
  metadata?: {
    /** 快照名称 */
    name?: string
    /** 快照描述 */
    description?: string
    /** 自定义数据 */
    custom?: Record<string, any>
  }
}

/**
 * 快照选项
 */
export interface SnapshotOptions {
  /** 快照名称 */
  name?: string
  /** 快照描述 */
  description?: string
  /** 要包含的键（不指定则包含所有） */
  keys?: string[]
  /** 要排除的键 */
  excludeKeys?: string[]
  /** 指定存储引擎 */
  engine?: StorageEngine
  /** 是否压缩 */
  compress?: boolean
  /** 自定义元数据 */
  metadata?: Record<string, any>
}

/**
 * 恢复选项
 */
export interface RestoreOptions {
  /** 是否清空现有缓存 */
  clear?: boolean
  /** 是否合并（不清空，只覆盖冲突的键） */
  merge?: boolean
  /** 要恢复的键（不指定则恢复所有） */
  keys?: string[]
  /** 要排除的键 */
  excludeKeys?: string[]
  /** 指定存储引擎 */
  engine?: StorageEngine
}

/**
 * 缓存快照管理器
 * 
 * 支持导出和导入缓存状态，用于备份、迁移或测试
 * 
 * @example
 * ```typescript
 * const snapshotManager = new SnapshotManager(cache)
 * 
 * // 创建快照
 * const snapshot = await snapshotManager.create({
 *   name: 'backup-2024',
 *   description: '生产环境备份'
 * })
 * 
 * // 导出为 JSON
 * const json = snapshotManager.export(snapshot)
 * 
 * // 从 JSON 导入
 * const imported = snapshotManager.import(json)
 * 
 * // 恢复快照
 * await snapshotManager.restore(imported, { clear: true })
 * ```
 */
export class SnapshotManager {
  private static readonly SNAPSHOT_VERSION = '1.0.0'

  constructor(private cache: CacheManager) {}

  /**
   * 创建快照
   */
  async create(options: SnapshotOptions = {}): Promise<CacheSnapshot> {
    const {
      name,
      description,
      keys: includeKeys,
      excludeKeys = [],
      engine,
      metadata: customMetadata,
    } = options

    // 获取所有键
    let keys = includeKeys || await this.cache.keys(engine)

    // 排除指定的键
    if (excludeKeys.length > 0) {
      keys = keys.filter(key => !excludeKeys.includes(key))
    }

    // 收集数据
    const data: Record<string, SerializableValue> = {}

    for (const key of keys) {
      const value = await this.cache.get(key)
      if (value !== null) {
        data[key] = value
      }
    }

    // 创建快照
    const snapshot: CacheSnapshot = {
      version: SnapshotManager.SNAPSHOT_VERSION,
      timestamp: Date.now(),
      data,
      metadata: {
        name,
        description,
        custom: customMetadata,
      },
    }

    return snapshot
  }

  /**
   * 恢复快照
   */
  async restore(snapshot: CacheSnapshot, options: RestoreOptions = {}): Promise<void> {
    const {
      clear = false,
      keys: includeKeys,
      excludeKeys = [],
      engine,
    } = options

    // 验证快照版本
    if (snapshot.version !== SnapshotManager.SNAPSHOT_VERSION) {
      console.warn(`Snapshot version mismatch: ${snapshot.version} vs ${SnapshotManager.SNAPSHOT_VERSION}`)
    }

    // 清空现有缓存
    if (clear) {
      await this.cache.clear(engine)
    }

    // 获取要恢复的键
    let keys = includeKeys || Object.keys(snapshot.data)

    // 排除指定的键
    if (excludeKeys.length > 0) {
      keys = keys.filter(key => !excludeKeys.includes(key))
    }

    // 恢复数据
    for (const key of keys) {
      const value = snapshot.data[key]
      if (value !== undefined) {
        await this.cache.set(key, value, { engine })
      }
    }
  }

  /**
   * 导出快照为 JSON 字符串
   */
  export(snapshot: CacheSnapshot, pretty = false): string {
    return JSON.stringify(snapshot, null, pretty ? 2 : 0)
  }

  /**
   * 从 JSON 字符串导入快照
   */
  import(json: string): CacheSnapshot {
    try {
      const snapshot = JSON.parse(json) as CacheSnapshot

      // 验证快照结构
      if (!snapshot.version || !snapshot.timestamp || !snapshot.data) {
        throw new Error('Invalid snapshot format')
      }

      return snapshot
    }
    catch (error) {
      throw new Error(`Failed to import snapshot: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 导出快照为 Blob（用于下载）
   */
  exportAsBlob(snapshot: CacheSnapshot, pretty = false): Blob {
    const json = this.export(snapshot, pretty)
    return new Blob([json], { type: 'application/json' })
  }

  /**
   * 从 Blob 导入快照
   */
  async importFromBlob(blob: Blob): Promise<CacheSnapshot> {
    const text = await blob.text()
    return this.import(text)
  }

  /**
   * 比较两个快照
   */
  compare(snapshot1: CacheSnapshot, snapshot2: CacheSnapshot): {
    added: string[]
    removed: string[]
    modified: string[]
    unchanged: string[]
  } {
    const keys1 = new Set(Object.keys(snapshot1.data))
    const keys2 = new Set(Object.keys(snapshot2.data))

    const added: string[] = []
    const removed: string[] = []
    const modified: string[] = []
    const unchanged: string[] = []

    // 检查新增和修改
    for (const key of keys2) {
      if (!keys1.has(key)) {
        added.push(key)
      }
      else {
        const value1 = JSON.stringify(snapshot1.data[key])
        const value2 = JSON.stringify(snapshot2.data[key])

        if (value1 === value2) {
          unchanged.push(key)
        }
        else {
          modified.push(key)
        }
      }
    }

    // 检查删除
    for (const key of keys1) {
      if (!keys2.has(key)) {
        removed.push(key)
      }
    }

    return { added, removed, modified, unchanged }
  }

  /**
   * 合并多个快照
   */
  merge(...snapshots: CacheSnapshot[]): CacheSnapshot {
    if (snapshots.length === 0) {
      throw new Error('At least one snapshot is required')
    }

    const merged: CacheSnapshot = {
      version: SnapshotManager.SNAPSHOT_VERSION,
      timestamp: Date.now(),
      data: {},
      metadata: {
        name: 'Merged Snapshot',
        description: `Merged from ${snapshots.length} snapshots`,
      },
    }

    // 按时间顺序合并（后面的覆盖前面的）
    for (const snapshot of snapshots) {
      Object.assign(merged.data, snapshot.data)
    }

    return merged
  }

  /**
   * 获取快照统计信息
   */
  getStats(snapshot: CacheSnapshot): {
    keyCount: number
    dataSize: number
    timestamp: number
    age: number
  } {
    const keyCount = Object.keys(snapshot.data).length
    const dataSize = new Blob([JSON.stringify(snapshot.data)]).size
    const age = Date.now() - snapshot.timestamp

    return {
      keyCount,
      dataSize,
      timestamp: snapshot.timestamp,
      age,
    }
  }
}

/**
 * 创建快照管理器
 */
export function createSnapshotManager(cache: CacheManager): SnapshotManager {
  return new SnapshotManager(cache)
}

