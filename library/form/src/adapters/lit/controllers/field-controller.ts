/**
 * @ldesign/form - Lit Field Controller
 * Lit 字段控制器
 */

import { ReactiveController, ReactiveControllerHost } from 'lit'
import type { FormCore } from '../../../core'
import type { FieldState } from '../../../utils/types'

/**
 * 字段控制器类
 */
export class FieldController implements ReactiveController {
  private host: ReactiveControllerHost
  private form: FormCore
  private fieldName: string
  public value: any
  public fieldState?: FieldState

  constructor(host: ReactiveControllerHost, form: FormCore, name: string) {
    this.host = host
    this.form = form
    this.fieldName = name
    this.value = form.getFieldValue(name)
    this.fieldState = form.getFieldState(name)

    host.addController(this)
  }

  /**
   * 控制器连接时调用
   */
  hostConnected() {
    // 监听字段变更
    this.form.on('field:change', (event) => {
      if (event.field === this.fieldName) {
        this.value = event.value
        this.updateFieldState()
        this.host.requestUpdate()
      }
    })

    // 监听状态变更
    this.form.on('state:change', (event) => {
      if (event.type === 'field' && event.field === this.fieldName) {
        this.updateFieldState()
        this.host.requestUpdate()
      }
    })

    // 监听重置事件
    this.form.on('reset', () => {
      this.value = this.form.getFieldValue(this.fieldName)
      this.updateFieldState()
      this.host.requestUpdate()
    })
  }

  /**
   * 更新字段状态
   */
  private updateFieldState(): void {
    this.fieldState = this.form.getFieldState(this.fieldName)
  }

  /**
   * 设置值
   */
  setValue(value: any): void {
    this.form.setFieldValue(this.fieldName, value)
  }

  /**
   * 处理变更
   */
  onChange(value: any): void {
    this.setValue(value)
  }

  /**
   * 处理失焦
   */
  onBlur(): void {
    this.form.handleFieldBlur(this.fieldName)
  }

  /**
   * 处理聚焦
   */
  onFocus(): void {
    this.form.handleFieldFocus(this.fieldName)
  }

  /**
   * 验证字段
   */
  async validate(): Promise<boolean> {
    return this.form.validateField(this.fieldName)
  }

  /**
   * 获取错误信息
   */
  get error(): string | undefined {
    return this.fieldState?.errors[0]
  }

  /**
   * 获取所有错误
   */
  get errors(): string[] {
    return this.fieldState?.errors || []
  }

  /**
   * 是否触摸
   */
  get touched(): boolean {
    return this.fieldState?.touched || false
  }

  /**
   * 是否脏数据
   */
  get dirty(): boolean {
    return this.fieldState?.dirty || false
  }

  /**
   * 是否验证中
   */
  get validating(): boolean {
    return this.fieldState?.validating || false
  }

  /**
   * 是否有效
   */
  get valid(): boolean {
    return this.fieldState?.valid || true
  }
}




