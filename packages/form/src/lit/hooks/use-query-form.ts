/**
 * useLitQueryForm Hook
 * 
 * @description
 * 为 Lit 组件提供查询表单状态管理功能
 */

import { ReactiveController, ReactiveControllerHost } from 'lit'
import { createForm } from '../../core'
import { LitQueryFormConfig } from '../types'

/**
 * Lit 查询表单控制器
 */
export class LitQueryFormController implements ReactiveController {
  private host: ReactiveControllerHost
  private formInstance: any = null
  private _expanded: boolean = false
  private _queryData: Record<string, any> = {}

  constructor(host: ReactiveControllerHost, private config: LitQueryFormConfig) {
    this.host = host
    host.addController(this)
    this.initializeForm()
  }

  /**
   * 组件连接时调用
   */
  hostConnected() {
    // 组件连接到 DOM 时的逻辑
  }

  /**
   * 组件断开连接时调用
   */
  hostDisconnected() {
    // 清理资源
    this.formInstance = null
  }

  /**
   * 获取是否展开
   */
  get expanded(): boolean {
    return this._expanded
  }

  /**
   * 获取查询数据
   */
  get queryData(): Record<string, any> {
    return this._queryData
  }

  /**
   * 获取最大行数
   */
  get maxRows(): number {
    if (!this.config.fields) return 1
    return Math.max(...this.config.fields.map(f => f.row || 1))
  }

  /**
   * 获取可见行数
   */
  get visibleRows(): number {
    return this._expanded ? this.maxRows : (this.config.defaultRowCount || 1)
  }

  /**
   * 获取按行分组的字段
   */
  get fieldsByRow(): Record<number, any[]> {
    const rows: Record<number, any[]> = {}
    if (!this.config.fields) return rows

    this.config.fields.forEach(field => {
      const row = field.row || 1
      if (!rows[row]) {
        rows[row] = []
      }
      rows[row].push(field)
    })
    return rows
  }

  /**
   * 初始化表单
   */
  private initializeForm() {
    if (!this.config || !this.config.fields) return

    // 初始化查询数据
    this._queryData = this.config.fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || ''
      return acc
    }, {} as Record<string, any>)

    // 创建表单实例
    this.formInstance = createForm({
      initialValues: this._queryData
    })

    // 注册字段
    this.config.fields.forEach(field => {
      this.formInstance.registerField({
        name: field.name,
        rules: field.rules || []
      })
    })

    this.host.requestUpdate()
  }

  /**
   * 设置字段值
   */
  setFieldValue(name: string, value: any): void {
    this._queryData = {
      ...this._queryData,
      [name]: value
    }

    if (this.formInstance) {
      this.formInstance.setFieldValue(name, value)
    }

    this.host.requestUpdate()
  }

  /**
   * 获取字段值
   */
  getFieldValue(name: string): any {
    return this._queryData[name]
  }

  /**
   * 执行查询
   */
  async query(): Promise<void> {
    try {
      const data = this.formInstance?.data || this._queryData

      // 调用配置中的查询处理器
      if (this.config.onQuery) {
        await this.config.onQuery(data)
      }
    } catch (error) {
      console.error('查询失败:', error)
    }
  }

  /**
   * 重置查询
   */
  reset(): void {
    // 重置查询数据
    if (this.config.fields) {
      this._queryData = this.config.fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || ''
        return acc
      }, {} as Record<string, any>)
    }

    // 重置表单实例
    if (this.formInstance) {
      this.formInstance.reset()
    }

    this.host.requestUpdate()

    // 调用配置中的重置处理器
    if (this.config.onReset) {
      this.config.onReset()
    }
  }

  /**
   * 切换展开收起
   */
  toggleExpand(): void {
    this._expanded = !this._expanded
    this.host.requestUpdate()

    // 调用配置中的展开收起处理器
    if (this.config.onToggleExpand) {
      this.config.onToggleExpand(this._expanded)
    }
  }

  /**
   * 导出数据
   */
  async export(): Promise<void> {
    try {
      const data = this.formInstance?.data || this._queryData

      // 调用配置中的导出处理器
      if (this.config.onExport) {
        await this.config.onExport(data)
      }
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: LitQueryFormConfig): void {
    this.config = config
    this.initializeForm()
  }
}

/**
 * 使用 Lit 查询表单 Hook
 * 
 * @param host Lit 组件实例
 * @param config 查询表单配置
 * @returns 查询表单控制器
 */
export function useLitQueryForm(host: ReactiveControllerHost, config: LitQueryFormConfig): LitQueryFormController {
  return new LitQueryFormController(host, config)
}
