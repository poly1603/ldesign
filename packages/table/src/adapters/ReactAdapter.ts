/**
 * React框架适配器
 * 
 * 为React框架提供表格组件适配
 * 支持React 16.8+（Hooks）
 */

import { BaseAdapter } from './BaseAdapter'
import type { TableConfig, TableRow } from '../types'

/**
 * React适配器类
 * 
 * 功能特性：
 * - 支持React Hooks
 * - 集成React生命周期
 * - 支持React事件系统
 * - 兼容React 16.8+
 */
export class ReactAdapter<T extends TableRow = TableRow> extends BaseAdapter<T> {
  /** React组件引用 */
  private reactComponent: any = null

  /** 状态更新函数 */
  private setStateCallbacks: Map<string, Function> = new Map()

  /** Effect清理函数 */
  private effectCleanups: Function[] = []

  /** React版本 */
  private reactVersion: string = 'unknown'

  /**
   * 设置React组件引用
   * @param component React组件实例或ref
   */
  setReactComponent(component: any): void {
    this.reactComponent = component
    this.detectReactVersion()
  }

  /**
   * 注册状态更新回调
   * @param key 状态键
   * @param callback 更新回调函数
   */
  registerStateCallback(key: string, callback: Function): void {
    this.setStateCallbacks.set(key, callback)
  }

  /**
   * 移除状态更新回调
   * @param key 状态键
   */
  unregisterStateCallback(key: string): void {
    this.setStateCallbacks.delete(key)
  }

  /**
   * 框架特定的初始化逻辑
   * @protected
   */
  protected onInitialize(): void {
    if (!this.container || !this.config) {
      throw new Error('Container and config are required')
    }

    this.log('Initializing React adapter', {
      reactVersion: this.reactVersion,
      config: this.config
    })

    // 绑定React事件
    this.bindReactEvents()

    // 设置状态同步
    this.setupStateSync()
  }

  /**
   * 框架特定的配置更新逻辑
   * @param config 更新的配置
   * @protected
   */
  protected onConfigUpdate(config: Partial<TableConfig<T>>): void {
    this.log('Updating React adapter config', config)

    // 触发React重新渲染
    const forceUpdateCallback = this.setStateCallbacks.get('forceUpdate')
    if (forceUpdateCallback) {
      forceUpdateCallback({})
    }
  }

  /**
   * 框架特定的数据更新逻辑
   * @param data 新数据
   * @protected
   */
  protected onDataUpdate(data: T[]): void {
    this.log('Updating React adapter data', { count: data.length })

    // 更新React状态
    const dataUpdateCallback = this.setStateCallbacks.get('data')
    if (dataUpdateCallback) {
      dataUpdateCallback(data)
    }
  }

  /**
   * 框架特定的销毁逻辑
   * @protected
   */
  protected onDestroy(): void {
    this.log('Destroying React adapter')

    // 移除React事件绑定
    this.unbindReactEvents()

    // 清理Effect
    this.cleanupEffects()

    // 清理状态回调
    this.setStateCallbacks.clear()

    this.reactComponent = null
  }

  /**
   * 创建响应式数据绑定
   * @param data 数据源
   * @param callback 数据变化回调
   * @protected
   */
  protected override createReactiveBinding(data: any, callback: (newData: any) => void): void {
    // React使用useEffect来处理副作用
    // 这里提供一个通用的绑定机制

    let previousData = data

    const checkDataChange = () => {
      if (data !== previousData) {
        callback(data)
        previousData = data
      }
    }

    // 使用定时器检查数据变化（简单实现）
    const intervalId = setInterval(checkDataChange, 100)

    // 添加清理函数
    this.effectCleanups.push(() => {
      clearInterval(intervalId)
    })
  }

  /**
   * 移除响应式数据绑定
   * @protected
   */
  protected override removeReactiveBinding(): void {
    this.cleanupEffects()
  }

  /**
   * 处理React特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected override bindFrameworkEvent(eventName: string, handler: Function): void {
    // React事件通过props传递，这里记录事件处理器
    const eventCallback = this.setStateCallbacks.get(`event_${eventName}`)
    if (eventCallback) {
      eventCallback(handler)
    }
  }

  /**
   * 移除React特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected override unbindFrameworkEvent(eventName: string, handler: Function): void {
    const eventCallback = this.setStateCallbacks.get(`event_${eventName}`)
    if (eventCallback) {
      eventCallback(null)
    }
  }

  /**
   * 获取React版本信息
   * @protected
   */
  protected override getFrameworkVersion(): string {
    try {
      // 尝试从React包获取版本
      if (typeof window !== 'undefined' && (window as any).React) {
        return (window as any).React.version || 'unknown'
      }

      // 尝试从require获取
      try {
        const React = require('react')
        return React.version || 'unknown'
      } catch (error) {
        // ignore
      }

      return this.reactVersion
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * 检查React兼容性
   * @protected
   */
  protected override checkFrameworkCompatibility(): boolean {
    const version = this.getFrameworkVersion()

    if (version === 'unknown') {
      this.warn('Cannot detect React version')
      return false
    }

    const [major, minor] = version.split('.').map(Number)

    // 要求React 16.8+（Hooks支持）
    if ((major || 0) < 16 || (major === 16 && (minor || 0) < 8)) {
      this.error('React version 16.8+ is required for Hooks support')
      return false
    }

    return true
  }

  // ==================== React特定方法 ====================

  /**
   * 创建useEffect清理函数
   * @param cleanup 清理函数
   */
  addEffectCleanup(cleanup: Function): void {
    this.effectCleanups.push(cleanup)
  }

  /**
   * 获取表格状态用于React状态管理
   */
  getTableState(): any {
    if (!this.table) {
      return null
    }

    return {
      data: this.table.getData(),
      selectedKeys: this.table.getSelectedKeys(),
      expandedKeys: this.table.getExpandedKeys(),
      loading: this.config?.loading || false
    }
  }

  /**
   * 更新表格状态
   * @param state 新状态
   */
  updateTableState(state: any): void {
    if (!this.table) {
      return
    }

    if (state.data) {
      this.table.setData(state.data)
    }

    if (state.selectedKeys) {
      this.table.selectRows(state.selectedKeys, true)
    }

    if (state.expandedKeys) {
      this.table.expandRows(state.expandedKeys)
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 检测React版本
   * @private
   */
  private detectReactVersion(): void {
    this.reactVersion = this.getFrameworkVersion()
    this.log(`Detected React version: ${this.reactVersion}`)
  }

  /**
   * 绑定React事件
   * @private
   */
  private bindReactEvents(): void {
    if (!this.table) {
      return
    }

    // 将表格事件转发到React组件
    const eventNames = [
      'row-click', 'row-dblclick', 'cell-click', 'header-click',
      'selection-change', 'expand-change', 'sort-change', 'filter-change',
      'scroll', 'keydown', 'mouse-enter', 'mouse-leave'
    ]

    eventNames.forEach(eventName => {
      this.table!.on(eventName, (data: any) => {
        // 通过状态回调转发事件
        const eventCallback = this.setStateCallbacks.get(`event_${eventName}`)
        if (eventCallback) {
          eventCallback(data)
        }

        // 如果有React组件引用，直接调用props中的事件处理器
        if (this.reactComponent && this.reactComponent.props) {
          const propName = `on${eventName.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join('')}`

          const handler = this.reactComponent.props[propName]
          if (typeof handler === 'function') {
            handler(data)
          }
        }
      })
    })
  }

  /**
   * 解绑React事件
   * @private
   */
  private unbindReactEvents(): void {
    if (!this.table) {
      return
    }

    // 移除所有事件监听器
    this.table.off()
  }

  /**
   * 设置状态同步
   * @private
   */
  private setupStateSync(): void {
    if (!this.table) {
      return
    }

    // 监听表格状态变化，同步到React状态
    this.table.on('state-change', (state: any) => {
      const stateCallback = this.setStateCallbacks.get('tableState')
      if (stateCallback) {
        stateCallback(state)
      }
    })
  }

  /**
   * 清理Effect
   * @private
   */
  private cleanupEffects(): void {
    this.effectCleanups.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        this.warn('Error during effect cleanup', error)
      }
    })
    this.effectCleanups = []
  }
}
