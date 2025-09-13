/**
 * Vue框架适配器
 * 
 * 为Vue框架提供表格组件适配
 * 支持Vue 2.x和Vue 3.x
 */

import { BaseAdapter } from './BaseAdapter'
import type { TableConfig, TableRow } from '../types'

/**
 * Vue适配器类
 * 
 * 功能特性：
 * - 支持Vue响应式数据绑定
 * - 集成Vue生命周期
 * - 支持Vue事件系统
 * - 兼容Vue 2.x和3.x
 */
export class VueAdapter<T extends TableRow = TableRow> extends BaseAdapter<T> {
  /** Vue实例引用 */
  private vueInstance: any = null

  /** 响应式数据观察器 */
  private watchers: any[] = []

  /** Vue版本 */
  private vueVersion: number = 2

  /**
   * 设置Vue实例
   * @param instance Vue组件实例
   */
  setVueInstance(instance: any): void {
    this.vueInstance = instance
    this.detectVueVersion()
  }

  /**
   * 框架特定的初始化逻辑
   * @protected
   */
  protected onInitialize(): void {
    if (!this.container || !this.config) {
      throw new Error('Container and config are required')
    }

    this.log('Initializing Vue adapter', {
      vueVersion: this.vueVersion,
      config: this.config
    })

    // 绑定Vue事件
    this.bindVueEvents()

    // 创建响应式数据绑定
    this.setupReactiveBindings()
  }

  /**
   * 框架特定的配置更新逻辑
   * @param config 更新的配置
   * @protected
   */
  protected onConfigUpdate(config: Partial<TableConfig<T>>): void {
    this.log('Updating Vue adapter config', config)

    // 触发Vue更新
    if (this.vueInstance && this.vueVersion === 2) {
      this.vueInstance.$forceUpdate()
    } else if (this.vueInstance && this.vueVersion === 3) {
      // Vue 3的更新机制
      this.vueInstance.proxy?.$forceUpdate?.()
    }
  }

  /**
   * 框架特定的数据更新逻辑
   * @param data 新数据
   * @protected
   */
  protected onDataUpdate(data: T[]): void {
    this.log('Updating Vue adapter data', { count: data.length })

    // Vue的响应式系统会自动处理数据更新
    // 这里可以添加额外的Vue特定逻辑
  }

  /**
   * 框架特定的销毁逻辑
   * @protected
   */
  protected onDestroy(): void {
    this.log('Destroying Vue adapter')

    // 移除Vue事件绑定
    this.unbindVueEvents()

    // 清理响应式绑定
    this.cleanupReactiveBindings()

    this.vueInstance = null
  }

  /**
   * 创建响应式数据绑定
   * @param data 数据源
   * @param callback 数据变化回调
   * @protected
   */
  protected override createReactiveBinding(data: any, callback: (newData: any) => void): void {
    if (!this.vueInstance) {
      return
    }

    if (this.vueVersion === 2) {
      // Vue 2的响应式绑定
      const watcher = this.vueInstance.$watch(
        () => data,
        callback,
        { deep: true, immediate: false }
      )
      this.watchers.push(watcher)
    } else if (this.vueVersion === 3) {
      // Vue 3的响应式绑定
      try {
        const { watch } = require('vue')
        const watcher = watch(
          () => data,
          callback,
          { deep: true, immediate: false }
        )
        this.watchers.push(watcher)
      } catch (error) {
        this.warn('Vue 3 watch not available', error)
      }
    }
  }

  /**
   * 移除响应式数据绑定
   * @protected
   */
  protected override removeReactiveBinding(): void {
    this.watchers.forEach(watcher => {
      if (typeof watcher === 'function') {
        watcher() // Vue 3 watcher cleanup
      } else if (watcher && typeof watcher.unwatch === 'function') {
        watcher.unwatch() // Vue 2 watcher cleanup
      }
    })
    this.watchers = []
  }

  /**
   * 处理Vue特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected override bindFrameworkEvent(eventName: string, handler: Function): void {
    if (!this.vueInstance) {
      return
    }

    // 绑定到Vue实例的事件系统
    if (this.vueVersion === 2) {
      this.vueInstance.$on(eventName, handler)
    } else if (this.vueVersion === 3) {
      // Vue 3使用emits
      this.vueInstance.emit?.(eventName, handler)
    }
  }

  /**
   * 移除Vue特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected override unbindFrameworkEvent(eventName: string, handler: Function): void {
    if (!this.vueInstance) {
      return
    }

    if (this.vueVersion === 2) {
      this.vueInstance.$off(eventName, handler)
    }
    // Vue 3不需要手动移除emit事件
  }

  /**
   * 获取Vue版本信息
   * @protected
   */
  protected override getFrameworkVersion(): string {
    try {
      if (typeof window !== 'undefined' && (window as any).Vue) {
        return (window as any).Vue.version || 'unknown'
      }

      // 尝试从Vue实例获取版本
      if (this.vueInstance) {
        return this.vueInstance.$options?._base?.version ||
          this.vueInstance.version ||
          'unknown'
      }

      return 'unknown'
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * 检查Vue兼容性
   * @protected
   */
  protected override checkFrameworkCompatibility(): boolean {
    const version = this.getFrameworkVersion()

    if (version === 'unknown') {
      this.warn('Cannot detect Vue version')
      return false
    }

    const majorVersion = parseInt(version.split('.')[0] || '0')

    if (majorVersion < 2) {
      this.error('Vue version 2.0+ is required')
      return false
    }

    return true
  }

  // ==================== 私有方法 ====================

  /**
   * 检测Vue版本
   * @private
   */
  private detectVueVersion(): void {
    const version = this.getFrameworkVersion()

    if (version !== 'unknown') {
      this.vueVersion = parseInt(version.split('.')[0] || '0')
    }

    // 备用检测方法
    if (this.vueInstance) {
      if (this.vueInstance.$options) {
        this.vueVersion = 2
      } else if (this.vueInstance.proxy || this.vueInstance.setupState) {
        this.vueVersion = 3
      }
    }

    this.log(`Detected Vue version: ${this.vueVersion}`)
  }

  /**
   * 绑定Vue事件
   * @private
   */
  private bindVueEvents(): void {
    if (!this.table || !this.vueInstance) {
      return
    }

    // 将表格事件转发到Vue实例
    const eventNames = [
      'row-click', 'row-dblclick', 'cell-click', 'header-click',
      'selection-change', 'expand-change', 'sort-change', 'filter-change',
      'scroll', 'keydown', 'mouse-enter', 'mouse-leave'
    ]

    eventNames.forEach(eventName => {
      this.table!.on(eventName, (data: any) => {
        // 转发到Vue事件系统
        if (this.vueVersion === 2) {
          this.vueInstance.$emit(eventName, data)
        } else if (this.vueVersion === 3) {
          this.vueInstance.emit?.(eventName, data)
        }
      })
    })
  }

  /**
   * 解绑Vue事件
   * @private
   */
  private unbindVueEvents(): void {
    if (!this.table) {
      return
    }

    // 移除所有事件监听器
    this.table.off()
  }

  /**
   * 设置响应式绑定
   * @private
   */
  private setupReactiveBindings(): void {
    if (!this.vueInstance || !this.config) {
      return
    }

    // 监听数据变化
    if (this.config.data) {
      this.createReactiveBinding(this.config.data, (newData: T[]) => {
        this.updateData(newData)
      })
    }
  }

  /**
   * 清理响应式绑定
   * @private
   */
  private cleanupReactiveBindings(): void {
    this.removeReactiveBinding()
  }
}
