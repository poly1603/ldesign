/**
 * 基础适配器类
 * 
 * 定义框架适配器的基础接口和通用功能
 * 为不同框架提供统一的适配层
 */

import { Table } from '../core/Table'
import type { TableConfig, TableRow } from '../types'

/**
 * 框架适配器基类
 * 
 * 功能特性：
 * - 提供框架无关的表格实例管理
 * - 定义统一的适配器接口
 * - 处理生命周期管理
 * - 支持响应式数据绑定
 */
export abstract class BaseAdapter<T extends TableRow = TableRow> {
  /** 表格实例 */
  protected table: Table<T> | null = null

  /** 容器元素 */
  protected container: HTMLElement | null = null

  /** 表格配置 */
  protected config: TableConfig<T> | null = null

  /** 是否已初始化 */
  protected initialized: boolean = false

  /** 是否已销毁 */
  protected destroyed: boolean = false

  /**
   * 初始化适配器
   * @param container 容器元素
   * @param config 表格配置
   */
  initialize(container: HTMLElement, config: TableConfig<T>): void {
    if (this.initialized) {
      throw new Error('Adapter already initialized')
    }

    this.container = container
    this.config = config

    // 创建表格实例
    this.table = new Table<T>(config)

    // 执行框架特定的初始化
    this.onInitialize()

    this.initialized = true
  }

  /**
   * 更新表格配置
   * @param config 新的配置
   */
  updateConfig(config: Partial<TableConfig<T>>): void {
    if (!this.table || !this.config) {
      throw new Error('Adapter not initialized')
    }

    // 合并配置
    this.config = { ...this.config, ...config }

    // 更新表格
    this.table.updateConfig(this.config)

    // 执行框架特定的更新
    this.onConfigUpdate(config)
  }

  /**
   * 更新表格数据
   * @param data 新数据
   */
  updateData(data: T[]): void {
    if (!this.table) {
      throw new Error('Adapter not initialized')
    }

    this.table.setData(data)

    // 执行框架特定的数据更新
    this.onDataUpdate(data)
  }

  /**
   * 获取表格实例
   */
  getTable(): Table<T> | null {
    return this.table
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement | null {
    return this.container
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    // 执行框架特定的销毁
    this.onDestroy()

    // 销毁表格实例
    if (this.table) {
      this.table.destroy()
      this.table = null
    }

    this.container = null
    this.config = null
    this.initialized = false
    this.destroyed = true
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized && !this.destroyed
  }

  /**
   * 检查是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed
  }

  // ==================== 抽象方法 ====================

  /**
   * 框架特定的初始化逻辑
   * @protected
   */
  protected abstract onInitialize(): void

  /**
   * 框架特定的配置更新逻辑
   * @param config 更新的配置
   * @protected
   */
  protected abstract onConfigUpdate(config: Partial<TableConfig<T>>): void

  /**
   * 框架特定的数据更新逻辑
   * @param data 新数据
   * @protected
   */
  protected abstract onDataUpdate(data: T[]): void

  /**
   * 框架特定的销毁逻辑
   * @protected
   */
  protected abstract onDestroy(): void

  // ==================== 工具方法 ====================

  /**
   * 创建响应式数据绑定
   * @param data 数据源
   * @param callback 数据变化回调
   * @protected
   */
  protected createReactiveBinding(data: any, callback: (newData: any) => void): void {
    // 子类可以重写此方法实现框架特定的响应式绑定
  }

  /**
   * 移除响应式数据绑定
   * @protected
   */
  protected removeReactiveBinding(): void {
    // 子类可以重写此方法移除响应式绑定
  }

  /**
   * 处理框架特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected bindFrameworkEvent(eventName: string, handler: Function): void {
    // 子类可以重写此方法处理框架特定的事件绑定
  }

  /**
   * 移除框架特定的事件
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @protected
   */
  protected unbindFrameworkEvent(eventName: string, handler: Function): void {
    // 子类可以重写此方法移除框架特定的事件绑定
  }

  /**
   * 获取框架版本信息
   * @protected
   */
  protected getFrameworkVersion(): string {
    return 'unknown'
  }

  /**
   * 检查框架兼容性
   * @protected
   */
  protected checkFrameworkCompatibility(): boolean {
    return true
  }

  /**
   * 记录调试信息
   * @param message 消息
   * @param data 数据
   * @protected
   */
  protected log(message: string, data?: any): void {
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`[${this.constructor.name}] ${message}`, data)
    }
  }

  /**
   * 记录警告信息
   * @param message 消息
   * @param data 数据
   * @protected
   */
  protected warn(message: string, data?: any): void {
    console.warn(`[${this.constructor.name}] ${message}`, data)
  }

  /**
   * 记录错误信息
   * @param message 消息
   * @param error 错误对象
   * @protected
   */
  protected error(message: string, error?: Error): void {
    console.error(`[${this.constructor.name}] ${message}`, error)
  }
}
