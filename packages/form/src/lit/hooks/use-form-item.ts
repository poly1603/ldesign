/**
 * useLitFormItem Hook
 * 
 * @description
 * 为 Lit 组件提供表单项状态管理功能
 */

import { ReactiveController, ReactiveControllerHost } from 'lit'
import { LitFormItemConfig } from '../types'

/**
 * Lit 表单项控制器
 */
export class LitFormItemController implements ReactiveController {
  private host: ReactiveControllerHost
  private _value: any = ''
  private _error: string[] = []
  private _touched: boolean = false
  private _dirty: boolean = false

  constructor(host: ReactiveControllerHost, private config: LitFormItemConfig) {
    this.host = host
    host.addController(this)
    this._value = config.value || config.defaultValue || ''
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
  }

  /**
   * 获取字段值
   */
  get value(): any {
    return this._value
  }

  /**
   * 设置字段值
   */
  set value(val: any) {
    if (this._value !== val) {
      this._value = val
      this._dirty = true
      this.host.requestUpdate()
    }
  }

  /**
   * 获取错误信息
   */
  get error(): string[] {
    return this._error
  }

  /**
   * 设置错误信息
   */
  set error(errors: string[]) {
    this._error = errors
    this.host.requestUpdate()
  }

  /**
   * 获取是否已触摸
   */
  get touched(): boolean {
    return this._touched
  }

  /**
   * 设置触摸状态
   */
  set touched(val: boolean) {
    this._touched = val
    this.host.requestUpdate()
  }

  /**
   * 获取是否已修改
   */
  get dirty(): boolean {
    return this._dirty
  }

  /**
   * 验证字段
   */
  async validate(): Promise<boolean> {
    if (!this.config.rules) return true

    const errors: string[] = []

    for (const rule of this.config.rules) {
      try {
        const isValid = await rule.validator(this._value)
        if (!isValid) {
          errors.push(rule.message)
        }
      } catch (error) {
        errors.push(rule.message)
      }
    }

    this._error = errors
    this.host.requestUpdate()

    return errors.length === 0
  }

  /**
   * 重置字段
   */
  reset(): void {
    this._value = this.config.defaultValue || ''
    this._error = []
    this._touched = false
    this._dirty = false
    this.host.requestUpdate()
  }

  /**
   * 处理输入事件
   */
  handleInput(value: any): void {
    this.value = value
    this._touched = true
  }

  /**
   * 处理失焦事件
   */
  handleBlur(): void {
    this._touched = true
    this.validate()
  }

  /**
   * 更新配置
   */
  updateConfig(config: LitFormItemConfig): void {
    this.config = config
    this.host.requestUpdate()
  }
}

/**
 * 使用 Lit 表单项 Hook
 * 
 * @param host Lit 组件实例
 * @param config 表单项配置
 * @returns 表单项控制器
 */
export function useLitFormItem(host: ReactiveControllerHost, config: LitFormItemConfig): LitFormItemController {
  return new LitFormItemController(host, config)
}
