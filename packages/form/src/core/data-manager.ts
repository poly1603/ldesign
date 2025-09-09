/**
 * 数据管理器
 * 
 * 负责表单数据的管理，包括：
 * - 数据的获取和设置
 * - 数据变化的监听和通知
 * - 数据的序列化和反序列化
 * - 数据的重置和恢复
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { EventEmitter } from '../utils/event-emitter'
import { deepClone, deepEqual, getValueByPath, setValueByPath } from '../utils/helpers'

/**
 * 数据变化事件
 */
export interface DataChangeEvent<T = any> {
  /** 变化类型 */
  type: 'set' | 'update' | 'reset'
  /** 新数据 */
  data: T
  /** 旧数据 */
  oldData: T
  /** 变化的路径（如果是字段级变化） */
  path?: string
}

/**
 * 字段变化事件
 */
export interface FieldChangeEvent {
  /** 字段名称 */
  name: string
  /** 新值 */
  value: any
  /** 旧值 */
  oldValue: any
  /** 变化路径 */
  path: string
}

/**
 * 数据管理器类
 * 
 * 提供完整的数据管理功能，支持：
 * - 深层数据结构
 * - 路径访问（如 'user.profile.name'）
 * - 数据变化监听
 * - 数据快照和恢复
 * 
 * @template T 数据类型
 */
export class DataManager<T = Record<string, any>> extends EventEmitter {
  /** 当前数据 */
  private data: T

  /** 初始数据（用于重置） */
  private initialData: T

  /** 数据快照历史 */
  private snapshots: T[] = []

  /** 最大快照数量 */
  private maxSnapshots = 10

  /** 是否启用深度监听 */
  private deepWatch = true

  /** 是否已销毁 */
  private destroyed = false

  /**
   * 构造函数
   * 
   * @param initialData 初始数据
   * @param options 配置选项
   */
  constructor(
    initialData: T,
    options: {
      deepWatch?: boolean
      maxSnapshots?: number
    } = {}
  ) {
    super()

    this.deepWatch = options.deepWatch !== false
    this.maxSnapshots = options.maxSnapshots || 10

    // 深拷贝初始数据
    this.initialData = deepClone(initialData)
    this.data = deepClone(initialData)

    // 创建初始快照
    this.createSnapshot()
  }

  /**
   * 获取完整数据
   * 
   * @returns 数据副本
   */
  getData(): T {
    this.checkDestroyed()
    return deepClone(this.data)
  }

  /**
   * 设置完整数据
   * 
   * @param newData 新数据
   * @param silent 是否静默更新（不触发事件）
   */
  setData(newData: Partial<T>, silent = false): void {
    this.checkDestroyed()

    const oldData = deepClone(this.data)
    const mergedData = { ...this.data, ...newData }

    // 检查数据是否真的发生了变化
    if (deepEqual(this.data, mergedData)) {
      return
    }

    this.data = mergedData

    if (!silent) {
      this.emit('data:change', {
        type: 'update',
        data: deepClone(this.data),
        oldData
      } as DataChangeEvent<T>)
    }

    this.createSnapshot()
  }

  /**
   * 获取字段值
   * 
   * @param path 字段路径，支持点号分隔的深层路径
   * @returns 字段值
   */
  getFieldValue(path: string): any {
    this.checkDestroyed()
    return getValueByPath(this.data, path)
  }

  /**
   * 设置字段值
   * 
   * @param path 字段路径
   * @param value 新值
   * @param silent 是否静默更新
   */
  setFieldValue(path: string, value: any, silent = false): void {
    this.checkDestroyed()

    const oldValue = this.getFieldValue(path)

    // 检查值是否真的发生了变化
    if (deepEqual(oldValue, value)) {
      return
    }

    const oldData = deepClone(this.data)
    setValueByPath(this.data, path, value)

    if (!silent) {
      // 触发字段变化事件
      this.emit('field:change', {
        name: path,
        value: deepClone(value),
        oldValue: deepClone(oldValue),
        path
      } as FieldChangeEvent)

      // 触发数据变化事件
      this.emit('data:change', {
        type: 'set',
        data: deepClone(this.data),
        oldData,
        path
      } as DataChangeEvent<T>)
    }

    this.createSnapshot()
  }

  /**
   * 批量设置字段值
   * 
   * @param fields 字段值映射
   * @param silent 是否静默更新
   */
  setFieldsValue(fields: Record<string, any>, silent = false): void {
    this.checkDestroyed()

    const oldData = deepClone(this.data)
    const changes: FieldChangeEvent[] = []

    // 批量更新字段
    for (const [path, value] of Object.entries(fields)) {
      const oldValue = this.getFieldValue(path)

      if (!deepEqual(oldValue, value)) {
        setValueByPath(this.data, path, value)
        changes.push({
          name: path,
          value: deepClone(value),
          oldValue: deepClone(oldValue),
          path
        })
      }
    }

    // 如果没有变化，直接返回
    if (changes.length === 0) {
      return
    }

    if (!silent) {
      // 触发字段变化事件
      changes.forEach(change => {
        this.emit('field:change', change)
      })

      // 触发数据变化事件
      this.emit('data:change', {
        type: 'update',
        data: deepClone(this.data),
        oldData
      } as DataChangeEvent<T>)
    }

    this.createSnapshot()
  }

  /**
   * 重置数据到初始状态
   * 
   * @param silent 是否静默更新
   */
  reset(silent = false): void {
    this.checkDestroyed()

    const oldData = deepClone(this.data)
    this.data = deepClone(this.initialData)

    if (!silent) {
      this.emit('data:change', {
        type: 'reset',
        data: deepClone(this.data),
        oldData
      } as DataChangeEvent<T>)
    }

    this.createSnapshot()
  }

  /**
   * 检查字段是否存在
   * 
   * @param path 字段路径
   * @returns 是否存在
   */
  hasField(path: string): boolean {
    this.checkDestroyed()
    return getValueByPath(this.data, path) !== undefined
  }

  /**
   * 删除字段
   * 
   * @param path 字段路径
   * @param silent 是否静默更新
   */
  deleteField(path: string, silent = false): void {
    this.checkDestroyed()

    if (!this.hasField(path)) {
      return
    }

    const oldValue = this.getFieldValue(path)
    const oldData = deepClone(this.data)

    // 删除字段
    const pathParts = path.split('.')
    let current: any = this.data

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
      if (!current) return
    }

    delete current[pathParts[pathParts.length - 1]]

    if (!silent) {
      this.emit('field:change', {
        name: path,
        value: undefined,
        oldValue: deepClone(oldValue),
        path
      } as FieldChangeEvent)

      this.emit('data:change', {
        type: 'update',
        data: deepClone(this.data),
        oldData,
        path
      } as DataChangeEvent<T>)
    }

    this.createSnapshot()
  }

  /**
   * 创建数据快照
   */
  private createSnapshot(): void {
    this.snapshots.push(deepClone(this.data))

    // 限制快照数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }
  }

  /**
   * 恢复到指定快照
   * 
   * @param index 快照索引，-1表示最新快照
   * @param silent 是否静默更新
   */
  restoreSnapshot(index = -1, silent = false): void {
    this.checkDestroyed()

    const actualIndex = index < 0 ? this.snapshots.length + index : index
    const snapshot = this.snapshots[actualIndex]

    if (!snapshot) {
      throw new Error(`Snapshot at index ${index} not found`)
    }

    const oldData = deepClone(this.data)
    this.data = deepClone(snapshot)

    if (!silent) {
      this.emit('data:change', {
        type: 'set',
        data: deepClone(this.data),
        oldData
      } as DataChangeEvent<T>)
    }
  }

  /**
   * 获取快照数量
   * 
   * @returns 快照数量
   */
  getSnapshotCount(): number {
    return this.snapshots.length
  }

  /**
   * 清除所有快照
   */
  clearSnapshots(): void {
    this.snapshots = []
  }

  /**
   * 销毁数据管理器
   */
  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.snapshots = []

    // 直接清理监听器映射，避免调用checkDestroyed
    this.listeners.clear()
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('DataManager has been destroyed')
    }
  }
}
