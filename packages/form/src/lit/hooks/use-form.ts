/**
 * useLitForm Hook
 * 
 * @description
 * 为 Lit 组件提供表单状态管理功能
 */

import { ReactiveController, ReactiveControllerHost } from 'lit'
import { createForm } from '../../core'
import { LitFormConfig, LitFormState } from '../types'

/**
 * Lit 表单控制器
 */
export class LitFormController implements ReactiveController {
  private host: ReactiveControllerHost
  private formInstance: any = null
  private _state: LitFormState = {
    data: {},
    isValid: true,
    isDirty: false,
    isPending: false,
    errors: {},
    fields: {}
  }

  constructor(host: ReactiveControllerHost, private config: LitFormConfig) {
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
   * 获取表单状态
   */
  get state(): LitFormState {
    return this._state
  }

  /**
   * 获取表单数据
   */
  get data(): Record<string, any> {
    return this.formInstance?.data || {}
  }

  /**
   * 获取表单是否有效
   */
  get isValid(): boolean {
    return this.formInstance?.isValid || true
  }

  /**
   * 获取表单是否已修改
   */
  get isDirty(): boolean {
    return this.formInstance?.isDirty || false
  }

  /**
   * 获取表单是否正在提交
   */
  get isPending(): boolean {
    return this._state.isPending
  }

  /**
   * 初始化表单
   */
  private initializeForm() {
    if (!this.config) return

    // 创建表单实例
    this.formInstance = createForm({
      initialValues: this.config.initialValues || {}
    })

    // 注册字段
    if (this.config.fields) {
      this.config.fields.forEach(field => {
        this.formInstance.registerField({
          name: field.name,
          rules: field.rules || []
        })
      })
    }

    // 更新状态
    this.updateState()
  }

  /**
   * 更新状态
   */
  private updateState() {
    if (!this.formInstance) return

    this._state = {
      data: this.formInstance.data || {},
      isValid: this.formInstance.isValid || true,
      isDirty: this.formInstance.isDirty || false,
      isPending: this._state.isPending,
      errors: this.formInstance.errors || {},
      fields: this.formInstance.fields || {}
    }

    // 请求更新宿主组件
    this.host.requestUpdate()
  }

  /**
   * 设置字段值
   */
  setFieldValue(name: string, value: any) {
    if (!this.formInstance) return

    this.formInstance.setFieldValue(name, value)
    this.updateState()
  }

  /**
   * 获取字段值
   */
  getFieldValue(name: string): any {
    if (!this.formInstance) return undefined
    return this.formInstance.getFieldValue(name)
  }

  /**
   * 验证表单
   */
  async validate(): Promise<boolean> {
    if (!this.formInstance) return true

    const result = await this.formInstance.validate()
    this.updateState()
    return result.valid
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    if (!this.formInstance) return

    try {
      this._state.isPending = true
      this.host.requestUpdate()

      const result = await this.formInstance.validate()
      
      if (result.valid) {
        // 调用配置中的提交处理器
        if (this.config.onSubmit) {
          await this.config.onSubmit(this.formInstance.data)
        }
      } else {
        // 调用配置中的验证错误处理器
        if (this.config.onValidationError) {
          this.config.onValidationError(result.errors)
        }
      }
    } finally {
      this._state.isPending = false
      this.updateState()
    }
  }

  /**
   * 重置表单
   */
  reset(): void {
    if (!this.formInstance) return

    this.formInstance.reset()
    this.updateState()

    // 调用配置中的重置处理器
    if (this.config.onReset) {
      this.config.onReset()
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: LitFormConfig) {
    this.config = config
    this.initializeForm()
  }
}

/**
 * 使用 Lit 表单 Hook
 * 
 * @param host Lit 组件实例
 * @param config 表单配置
 * @returns 表单控制器
 */
export function useLitForm(host: ReactiveControllerHost, config: LitFormConfig): LitFormController {
  return new LitFormController(host, config)
}
