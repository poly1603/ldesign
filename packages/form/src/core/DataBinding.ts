// 数据绑定管理器

import type { FormData } from '../types/form'
import { deepClone, get, has, set, unset } from '../utils/common'
import { SimpleEventEmitter } from '../utils/event'
import { debounce } from '../utils/throttle'

/**
 * 数据绑定管理器
 */
export class DataBinding extends SimpleEventEmitter {
  private data: FormData = {}
  private watchers: Map<string, Set<Function>> = new Map()
  private computedCache: Map<string, { value: any, dependencies: string[] }>
    = new Map()

  private debouncedNotifiers: Map<string, Function> = new Map()

  constructor(initialData: FormData = {}) {
    super()
    this.data = deepClone(initialData)
  }

  /**
   * 获取数据
   */
  getData(): FormData {
    return deepClone(this.data)
  }

  /**
   * 设置数据
   */
  setData(data: FormData): void {
    const oldData = this.data
    this.data = deepClone(data)

    // 通知所有字段变化
    Object.keys(data).forEach((key) => {
      if (oldData[key] !== data[key]) {
        this.notifyWatchers(key, data[key], oldData[key])
      }
    })

    this.emit('dataChange', this.data, oldData)
  }

  /**
   * 获取字段值
   */
  getValue(path: string): any {
    return get(this.data, path)
  }

  /**
   * 设置字段值
   */
  setValue(path: string, value: any): void {
    const oldValue = this.getValue(path)

    if (oldValue === value) {
      return
    }

    set(this.data, path, value)
    this.notifyWatchers(path, value, oldValue)
    this.emit('fieldChange', path, value, oldValue)
  }

  /**
   * 删除字段
   */
  deleteValue(path: string): boolean {
    const oldValue = this.getValue(path)
    const deleted = unset(this.data, path)

    if (deleted) {
      this.notifyWatchers(path, undefined, oldValue)
      this.emit('fieldChange', path, undefined, oldValue)
    }

    return deleted
  }

  /**
   * 检查字段是否存在
   */
  hasValue(path: string): boolean {
    return has(this.data, path)
  }

  /**
   * 监听字段变化
   */
  watch(
    path: string,
    callback: (newValue: any, oldValue: any) => void,
  ): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Set())
    }

    this.watchers.get(path)!.add(callback)

    // 返回取消监听的函数
    return () => {
      this.unwatch(path, callback)
    }
  }

  /**
   * 取消监听字段变化
   */
  unwatch(path: string, callback?: Function): void {
    if (!callback) {
      this.watchers.delete(path)
      return
    }

    const pathWatchers = this.watchers.get(path)
    if (pathWatchers) {
      pathWatchers.delete(callback)
      if (pathWatchers.size === 0) {
        this.watchers.delete(path)
      }
    }
  }

  /**
   * 监听多个字段变化
   */
  watchMultiple(
    paths: string[],
    callback: (
      changes: Record<string, { newValue: any, oldValue: any }>
    ) => void,
  ): () => void {
    const changes: Record<string, { newValue: any, oldValue: any }> = {}
    let pendingNotification = false

    const debouncedCallback = debounce(() => {
      if (Object.keys(changes).length > 0) {
        callback({ ...changes })
        Object.keys(changes).forEach(key => delete changes[key])
      }
      pendingNotification = false
    }, 0)

    const unwatchers = paths.map(path =>
      this.watch(path, (newValue, oldValue) => {
        changes[path] = { newValue, oldValue }
        if (!pendingNotification) {
          pendingNotification = true
          debouncedCallback()
        }
      }),
    )

    return () => {
      unwatchers.forEach(unwatcher => unwatcher())
    }
  }

  /**
   * 创建计算属性
   */
  computed(
    name: string,
    dependencies: string[],
    computeFn: (data: FormData) => any,
  ): () => void {
    const compute = () => {
      const value = computeFn(this.data)
      this.computedCache.set(name, { value, dependencies })
      return value
    }

    // 初始计算
    compute()

    // 监听依赖变化
    const unwatchers = dependencies.map(dep =>
      this.watch(dep, () => {
        const newValue = compute()
        this.emit('computedChange', name, newValue)
      }),
    )

    return () => {
      unwatchers.forEach(unwatcher => unwatcher())
      this.computedCache.delete(name)
    }
  }

  /**
   * 获取计算属性值
   */
  getComputed(name: string): any {
    const cached = this.computedCache.get(name)
    return cached ? cached.value : undefined
  }

  /**
   * 批量更新
   */
  batchUpdate(updates: Record<string, any>): void {
    const oldData = deepClone(this.data)
    const changes: Record<string, { newValue: any, oldValue: any }> = {}

    Object.entries(updates).forEach(([path, value]) => {
      const oldValue = this.getValue(path)
      if (oldValue !== value) {
        set(this.data, path, value)
        changes[path] = { newValue: value, oldValue }
      }
    })

    // 批量通知变化
    Object.entries(changes).forEach(([path, { newValue, oldValue }]) => {
      this.notifyWatchers(path, newValue, oldValue)
    })

    if (Object.keys(changes).length > 0) {
      this.emit('batchChange', changes)
      this.emit('dataChange', this.data, oldData)
    }
  }

  /**
   * 通知监听器
   */
  private notifyWatchers(path: string, newValue: any, oldValue: any): void {
    const watchers = this.watchers.get(path)
    if (watchers) {
      watchers.forEach((callback) => {
        try {
          callback(newValue, oldValue)
        }
        catch (error) {
          console.error(`Error in watcher for path "${path}":`, error)
        }
      })
    }

    // 通知父路径的监听器
    this.notifyParentWatchers(path, newValue, oldValue)
  }

  /**
   * 通知父路径监听器
   */
  private notifyParentWatchers(
    path: string,
    newValue: any,
    oldValue: any,
  ): void {
    const parts = path.split('.')
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.')
      const parentWatchers = this.watchers.get(parentPath)
      if (parentWatchers) {
        const parentNewValue = this.getValue(parentPath)
        parentWatchers.forEach((callback) => {
          try {
            callback(parentNewValue, parentNewValue) // 父对象引用相同，但内容已变化
          }
          catch (error) {
            console.error(
              `Error in parent watcher for path "${parentPath}":`,
              error,
            )
          }
        })
      }
    }
  }

  /**
   * 重置数据
   */
  reset(initialData: FormData = {}): void {
    const oldData = this.data
    this.data = deepClone(initialData)
    this.computedCache.clear()

    this.emit('reset', this.data, oldData)
  }

  /**
   * 合并数据
   */
  merge(data: FormData): void {
    const oldData = deepClone(this.data)
    this.data = { ...this.data, ...data }

    Object.keys(data).forEach((key) => {
      if (oldData[key] !== data[key]) {
        this.notifyWatchers(key, data[key], oldData[key])
      }
    })

    this.emit('dataChange', this.data, oldData)
  }

  /**
   * 获取所有监听的路径
   */
  getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys())
  }

  /**
   * 获取路径的监听器数量
   */
  getWatcherCount(path: string): number {
    return this.watchers.get(path)?.size || 0
  }

  /**
   * 清空所有监听器
   */
  clearWatchers(): void {
    this.watchers.clear()
    this.debouncedNotifiers.clear()
  }

  /**
   * 获取数据统计信息
   */
  getStats(): {
    dataSize: number
    watcherCount: number
    computedCount: number
    watchedPaths: number
  } {
    return {
      dataSize: JSON.stringify(this.data).length,
      watcherCount: Array.from(this.watchers.values()).reduce(
        (sum, set) => sum + set.size,
        0,
      ),
      computedCount: this.computedCache.size,
      watchedPaths: this.watchers.size,
    }
  }

  /**
   * 销毁数据绑定管理器
   */
  destroy(): void {
    this.clearWatchers()
    this.computedCache.clear()
    this.removeAllListeners()
  }
}
