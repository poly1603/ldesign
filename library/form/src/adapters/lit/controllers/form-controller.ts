/**
 * @ldesign/form - Lit Form Controller
 * Lit 表单控制器
 */

import { ReactiveController, ReactiveControllerHost } from 'lit'
import { createForm, type FormCore } from '../../../core'
import type { FormOptions, FormValues, FormState } from '../../../utils/types'

/**
 * 表单控制器类
 */
export class FormController implements ReactiveController {
  private host: ReactiveControllerHost
  private formInstance: FormCore
  public values: FormValues
  public state: FormState
  public isExpanded: boolean

  constructor(host: ReactiveControllerHost, options: FormOptions = {}) {
    this.host = host
    this.formInstance = createForm(options)
    this.values = this.formInstance.getFieldsValue()
    this.state = this.formInstance.getFormState()
    this.isExpanded = this.formInstance.isExpanded()

    host.addController(this)
  }

  /**
   * 控制器连接时调用
   */
  hostConnected() {
    // 监听数据变更
    this.formInstance.on('data:change', () => {
      this.values = this.formInstance.getFieldsValue()
      this.host.requestUpdate()
    })

    // 监听状态变更
    this.formInstance.on('state:change', () => {
      this.state = this.formInstance.getFormState()
      this.host.requestUpdate()
    })

    // 监听展开收起
    this.formInstance.on('expand:change', (event) => {
      this.isExpanded = event.expanded
      this.host.requestUpdate()
    })
  }

  /**
   * 控制器断开时调用
   */
  hostDisconnected() {
    this.formInstance.destroy()
  }

  /**
   * 获取表单实例
   */
  getForm(): FormCore {
    return this.formInstance
  }

  /**
   * 设置字段值
   */
  setFieldValue(field: string, value: any): void {
    this.formInstance.setFieldValue(field, value)
  }

  /**
   * 批量设置字段值
   */
  setFieldsValue(values: FormValues): void {
    this.formInstance.setFieldsValue(values)
  }

  /**
   * 获取字段值
   */
  getFieldValue<T = any>(field: string): T {
    return this.formInstance.getFieldValue<T>(field)
  }

  /**
   * 获取所有字段值
   */
  getFieldsValue(): FormValues {
    return this.formInstance.getFieldsValue()
  }

  /**
   * 验证字段
   */
  async validateField(field: string): Promise<boolean> {
    return this.formInstance.validateField(field)
  }

  /**
   * 验证表单
   */
  async validate(): Promise<boolean> {
    const result = await this.formInstance.validate()
    return result.valid
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    await this.formInstance.submit()
  }

  /**
   * 重置表单
   */
  reset(): void {
    this.formInstance.reset()
  }

  /**
   * 切换展开/收起
   */
  toggleExpand(): void {
    this.formInstance.toggleExpand()
  }
}




