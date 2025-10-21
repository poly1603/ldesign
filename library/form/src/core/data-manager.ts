/**
 * @ldesign/form - Data Manager
 * 数据管理器
 */

import type { FormValues, Subscriber, Unsubscribe } from '../utils/types'
import {
  getValue,
  setValue,
  deletePath,
  hasPath,
  deepClone,
  deepEqual
} from '../utils/helpers'

/**
 * 数据变更事件
 */
export interface DataChangeEvent {
  /** 变更的字段路径 */
  path: string
  /** 新值 */
  value: any
  /** 旧值 */
  oldValue: any
  /** 完整的表单数据 */
  values: FormValues
}

/**
 * 数据管理器配置
 */
export interface DataManagerConfig {
  /** 初始数据 */
  initialValues?: FormValues
  /** 是否启用快照 */
  enableSnapshot?: boolean
}

/**
 * 数据管理器类
 */
export class DataManager {
  private values: FormValues
  private initialValues: FormValues
  private snapshots: FormValues[]
  private subscribers: Set<Subscriber<DataChangeEvent>>
  private enableSnapshot: boolean

  constructor(config: DataManagerConfig = {}) {
    this.initialValues = deepClone(config.initialValues || {})
    this.values = deepClone(this.initialValues)
    this.snapshots = []
    this.subscribers = new Set()
    this.enableSnapshot = config.enableSnapshot ?? false
  }

  /**
   * 获取字段值
   * @param path 字段路径
   * @param defaultValue 默认值
   */
  getValue<T = any>(path: string, defaultValue?: T): T {
    return getValue(this.values, path, defaultValue)
  }

  /**
   * 设置字段值
   * @param path 字段路径
   * @param value 字段值
   * @param silent 是否静默更新（不触发订阅者）
   */
  setValue(path: string, value: any, silent = false): void {
    const oldValue = this.getValue(path)

    // 如果值没有变化，直接返回
    if (deepEqual(oldValue, value)) {
      return
    }

    setValue(this.values, path, value)

    // 触发订阅者
    if (!silent) {
      this.notifySubscribers({
        path,
        value,
        oldValue,
        values: this.getValues()
      })
    }
  }

  /**
   * 批量设置值
   * @param values 值对象
   * @param silent 是否静默更新
   */
  setValues(values: FormValues, silent = false): void {
    Object.keys(values).forEach(key => {
      this.setValue(key, values[key], silent)
    })
  }

  /**
   * 删除字段值
   * @param path 字段路径
   * @param silent 是否静默删除
   */
  deleteValue(path: string, silent = false): boolean {
    const oldValue = this.getValue(path)
    const deleted = deletePath(this.values, path)

    if (deleted && !silent) {
      this.notifySubscribers({
        path,
        value: undefined,
        oldValue,
        values: this.getValues()
      })
    }

    return deleted
  }

  /**
   * 检查字段是否存在
   * @param path 字段路径
   */
  hasValue(path: string): boolean {
    return hasPath(this.values, path)
  }

  /**
   * 获取所有值
   * @param clone 是否克隆（默认true，避免外部修改）
   */
  getValues(clone = true): FormValues {
    return clone ? deepClone(this.values) : this.values
  }

  /**
   * 获取初始值
   * @param clone 是否克隆
   */
  getInitialValues(clone = true): FormValues {
    return clone ? deepClone(this.initialValues) : this.initialValues
  }

  /**
   * 重置到初始值
   * @param silent 是否静默重置
   */
  reset(silent = false): void {
    this.values = deepClone(this.initialValues)

    if (!silent) {
      this.notifySubscribers({
        path: '',
        value: this.values,
        oldValue: {},
        values: this.getValues()
      })
    }
  }

  /**
   * 重置到指定值
   * @param values 新的初始值
   * @param silent 是否静默重置
   */
  resetTo(values: FormValues, silent = false): void {
    this.initialValues = deepClone(values)
    this.reset(silent)
  }

  /**
   * 创建快照
   */
  createSnapshot(): void {
    if (this.enableSnapshot) {
      this.snapshots.push(deepClone(this.values))
    }
  }

  /**
   * 恢复到上一个快照
   * @param silent 是否静默恢复
   * @returns 是否成功恢复
   */
  restoreSnapshot(silent = false): boolean {
    if (!this.enableSnapshot || this.snapshots.length === 0) {
      return false
    }

    const snapshot = this.snapshots.pop()!
    const oldValues = this.values
    this.values = snapshot

    if (!silent) {
      this.notifySubscribers({
        path: '',
        value: this.values,
        oldValue: oldValues,
        values: this.getValues()
      })
    }

    return true
  }

  /**
   * 清空所有快照
   */
  clearSnapshots(): void {
    this.snapshots = []
  }

  /**
   * 获取快照数量
   */
  get snapshotCount(): number {
    return this.snapshots.length
  }

  /**
   * 检查数据是否已变更（与初始值比较）
   */
  isDirty(path?: string): boolean {
    if (path) {
      const currentValue = this.getValue(path)
      const initialValue = getValue(this.initialValues, path)
      return !deepEqual(currentValue, initialValue)
    }

    return !deepEqual(this.values, this.initialValues)
  }

  /**
   * 订阅数据变更
   * @param subscriber 订阅者函数
   * @returns 取消订阅函数
   */
  subscribe(subscriber: Subscriber<DataChangeEvent>): Unsubscribe {
    this.subscribers.add(subscriber)

    return () => {
      this.subscribers.delete(subscriber)
    }
  }

  /**
   * 通知所有订阅者
   * @param event 变更事件
   */
  private notifySubscribers(event: DataChangeEvent): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(event)
      } catch (error) {
        console.error('Error in data change subscriber:', error)
      }
    })
  }

  /**
   * 销毁数据管理器
   */
  destroy(): void {
    this.subscribers.clear()
    this.snapshots = []
  }
}

/**
 * 创建数据管理器
 */
export function createDataManager(config?: DataManagerConfig): DataManager {
  return new DataManager(config)
}




