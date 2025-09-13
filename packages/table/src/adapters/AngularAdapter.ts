/**
 * Angular框架适配器
 * 
 * 为Angular框架提供表格组件适配
 * 支持Angular 12+
 */

import { BaseAdapter } from './BaseAdapter'
import type { TableConfig, TableRow } from '../types'

/**
 * Angular适配器类
 * 
 * 功能特性：
 * - 支持Angular依赖注入
 * - 集成Angular生命周期
 * - 支持Angular事件系统
 * - 兼容Angular 12+
 */
export class AngularAdapter<T extends TableRow = TableRow> extends BaseAdapter<T> {
  /** Angular组件引用 */
  private angularComponent: any = null

  /** 变更检测引用 */
  private changeDetectorRef: any = null

  /** 订阅管理 */
  private subscriptions: any[] = []

  /** Angular版本 */
  private angularVersion: string = 'unknown'

  /** Zone.js引用 */
  private ngZone: any = null

  /**
   * 设置Angular组件引用
   * @param component Angular组件实例
   */
  setAngularComponent(component: any): void {
    this.angularComponent = component
    this.detectAngularVersion()
  }

  /**
   * 设置变更检测引用
   * @param cdr ChangeDetectorRef实例
   */
  setChangeDetectorRef(cdr: any): void {
    this.changeDetectorRef = cdr
  }

  /**
   * 设置NgZone引用
   * @param ngZone NgZone实例
   */
  setNgZone(ngZone: any): void {
    this.ngZone = ngZone
  }

  /**
   * 框架特定的初始化逻辑
   * @protected
   */
  protected onInitialize(): void {
    if (!this.container || !this.config) {
      throw new Error('Container and config are required')
    }

    this.log('Initializing Angular adapter', {
      angularVersion: this.angularVersion,
      config: this.config
    })

    // 绑定Angular事件
    this.bindAngularEvents()

    // 设置变更检测
    this.setupChangeDetection()
  }

  /**
   * 框架特定的配置更新逻辑
   * @param config 更新的配置
   * @protected
   */
  protected onConfigUpdate(config: Partial<TableConfig<T>>): void {
    this.log('Updating Angular adapter config', config)

    // 触发Angular变更检测
    this.detectChanges()
  }

  /**
   * 框架特定的数据更新逻辑
   * @param data 新数据
   * @protected
   */
  protected onDataUpdate(data: T[]): void {
    this.log('Updating Angular adapter data', { count: data.length })

    // 在Angular Zone中执行更新
    if (this.ngZone) {
      this.ngZone.run(() => {
        this.detectChanges()
      })
    } else {
      this.detectChanges()
    }
  }

  /**
   * 框架特定的销毁逻辑
   * @protected
   */
  protected onDestroy(): void {
    this.log('Destroying Angular adapter')

    // 移除Angular事件绑定
    this.unbindAngularEvents()

    // 清理订阅
    this.cleanupSubscriptions()

    this.angularComponent = null
    this.changeDetectorRef = null
    this.ngZone = null
  }

  /**
   * 创建响应式数据绑定
   * @param data 数据源
   * @param callback 数据变化回调
   * @protected
   */
  protected override createReactiveBinding(data: any, callback: (newData: any) => void): void {
    // Angular使用RxJS进行响应式编程
    try {
      // 尝试使用Observable
      if (data && typeof data.subscribe === 'function') {
        const subscription = data.subscribe(callback)
        this.subscriptions.push(subscription)
        return
      }

      // 简单的轮询检查（备用方案）
      let previousData = JSON.stringify(data)

      const checkDataChange = () => {
        const currentData = JSON.stringify(data)
        if (currentData !== previousData) {
          callback(data)
          previousData = currentData
        }
      }

      const intervalId = setInterval(checkDataChange, 100)

      this.subscriptions.push({
        unsubscribe: () => clearInterval(intervalId)
      })

    } catch (error) {
      this.warn('Error creating reactive binding', error)
    }
  }

  /**
   * 移除响应式数据绑定
   * @protected
   */
  protected override removeReactiveBinding(): void {
    this.cleanupSubscriptions()
  }

  /**
   * 处理Angular特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected override bindFrameworkEvent(eventName: string, handler: Function): void {
    if (!this.angularComponent) {
      return
    }

    // Angular事件通过EventEmitter处理
    const eventEmitterName = `${eventName}Change`

    if (this.angularComponent[eventEmitterName] &&
      typeof this.angularComponent[eventEmitterName].emit === 'function') {

      // 包装处理器以触发EventEmitter
      const wrappedHandler = (data: any) => {
        handler(data)
        this.angularComponent[eventEmitterName].emit(data)
      }

      // 存储包装后的处理器以便后续清理
      this.angularComponent[`_${eventName}Handler`] = wrappedHandler
    }
  }

  /**
   * 移除Angular特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected override unbindFrameworkEvent(eventName: string, handler: Function): void {
    if (!this.angularComponent) {
      return
    }

    // 清理存储的处理器
    delete this.angularComponent[`_${eventName}Handler`]
  }

  /**
   * 获取Angular版本信息
   * @protected
   */
  protected override getFrameworkVersion(): string {
    try {
      // 尝试从Angular核心包获取版本
      if (typeof window !== 'undefined' && (window as any).ng) {
        return (window as any).ng.version?.full || 'unknown'
      }

      // 尝试从require获取
      try {
        const core = require('@angular/core')
        return core.VERSION?.full || 'unknown'
      } catch (error) {
        // ignore
      }

      return this.angularVersion
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * 检查Angular兼容性
   * @protected
   */
  protected override checkFrameworkCompatibility(): boolean {
    const version = this.getFrameworkVersion()

    if (version === 'unknown') {
      this.warn('Cannot detect Angular version')
      return false
    }

    const majorVersion = parseInt(version.split('.')[0] || '0')

    // 要求Angular 12+
    if (majorVersion < 12) {
      this.error('Angular version 12+ is required')
      return false
    }

    return true
  }

  // ==================== Angular特定方法 ====================

  /**
   * 触发变更检测
   */
  detectChanges(): void {
    if (this.changeDetectorRef && !this.changeDetectorRef.destroyed) {
      try {
        this.changeDetectorRef.detectChanges()
      } catch (error) {
        this.warn('Error during change detection', error)
      }
    }
  }

  /**
   * 标记为需要检查
   */
  markForCheck(): void {
    if (this.changeDetectorRef && !this.changeDetectorRef.destroyed) {
      try {
        this.changeDetectorRef.markForCheck()
      } catch (error) {
        this.warn('Error marking for check', error)
      }
    }
  }

  /**
   * 分离变更检测
   */
  detach(): void {
    if (this.changeDetectorRef && !this.changeDetectorRef.destroyed) {
      this.changeDetectorRef.detach()
    }
  }

  /**
   * 重新附加变更检测
   */
  reattach(): void {
    if (this.changeDetectorRef && !this.changeDetectorRef.destroyed) {
      this.changeDetectorRef.reattach()
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 检测Angular版本
   * @private
   */
  private detectAngularVersion(): void {
    this.angularVersion = this.getFrameworkVersion()
    this.log(`Detected Angular version: ${this.angularVersion}`)
  }

  /**
   * 绑定Angular事件
   * @private
   */
  private bindAngularEvents(): void {
    if (!this.table) {
      return
    }

    // 将表格事件转发到Angular组件
    const eventNames = [
      'row-click', 'row-dblclick', 'cell-click', 'header-click',
      'selection-change', 'expand-change', 'sort-change', 'filter-change',
      'scroll', 'keydown', 'mouse-enter', 'mouse-leave'
    ]

    eventNames.forEach(eventName => {
      this.table!.on(eventName, (data: any) => {
        // 在Angular Zone中执行
        if (this.ngZone) {
          this.ngZone.run(() => {
            this.emitAngularEvent(eventName, data)
          })
        } else {
          this.emitAngularEvent(eventName, data)
        }
      })
    })
  }

  /**
   * 解绑Angular事件
   * @private
   */
  private unbindAngularEvents(): void {
    if (!this.table) {
      return
    }

    // 移除所有事件监听器
    this.table.off()
  }

  /**
   * 发射Angular事件
   * @private
   */
  private emitAngularEvent(eventName: string, data: any): void {
    if (!this.angularComponent) {
      return
    }

    // 触发EventEmitter
    const eventEmitterName = `${eventName}Change`

    if (this.angularComponent[eventEmitterName] &&
      typeof this.angularComponent[eventEmitterName].emit === 'function') {
      this.angularComponent[eventEmitterName].emit(data)
    }

    // 调用组件方法（如果存在）
    const methodName = `on${eventName.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')}`

    if (typeof this.angularComponent[methodName] === 'function') {
      this.angularComponent[methodName](data)
    }

    // 触发变更检测
    this.markForCheck()
  }

  /**
   * 设置变更检测
   * @private
   */
  private setupChangeDetection(): void {
    if (!this.table) {
      return
    }

    // 监听表格状态变化，触发变更检测
    this.table.on('state-change', () => {
      this.markForCheck()
    })
  }

  /**
   * 清理订阅
   * @private
   */
  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(subscription => {
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe()
        }
      } catch (error) {
        this.warn('Error during subscription cleanup', error)
      }
    })
    this.subscriptions = []
  }
}
