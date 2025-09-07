/**
 * LDesignForm Lit 组件
 * 
 * @description
 * 基于 Lit 的表单组件实现
 */

import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createForm } from '../../core'

// 声明 Lit 装饰器
declare global {
  interface HTMLElementTagNameMap {
    'ldesign-form': LDesignForm
  }
}
import { LitFormConfig, LitFormState, LitFormComponent } from '../types'

/**
 * LDesign 表单组件
 * 
 * @example
 * ```html
 * <ldesign-form
 *   .config="${formConfig}"
 *   @form-submit="${handleSubmit}"
 *   @form-reset="${handleReset}"
 * ></ldesign-form>
 * ```
 */
@customElement('ldesign-form')
export class LDesignForm extends LitElement implements LitFormComponent {
  static styles = css`
    :host {
      display: block;
      font-family: var(--ldesign-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    }

    .form-container {
      background: var(--ldesign-bg-color-container, white);
      border-radius: var(--ls-border-radius-base, 6px);
      padding: var(--ls-padding-base, 20px);
      box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
    }

    .form-field {
      margin-bottom: var(--ls-margin-base, 20px);
    }

    .form-label {
      display: block;
      margin-bottom: var(--ls-margin-xs, 6px);
      font-weight: 500;
      color: var(--ldesign-text-color-primary, #333);
      font-size: var(--ls-font-size-sm, 16px);
    }

    .form-label .required {
      color: var(--ldesign-error-color, #e54848);
      margin-left: 2px;
    }

    .form-input {
      width: 100%;
      height: var(--ls-input-height-medium, 44px);
      padding: 0 var(--ls-padding-sm, 12px);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-base, 6px);
      font-size: var(--ls-font-size-sm, 16px);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      background-color: var(--ldesign-bg-color-component, white);
      color: var(--ldesign-text-color-primary, #333);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--ldesign-brand-color, #722ED1);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus, rgba(114, 46, 209, 0.2));
    }

    .form-input:hover {
      border-color: var(--ldesign-border-color-hover, #d9d9d9);
    }

    .form-input::placeholder {
      color: var(--ldesign-text-color-placeholder, rgba(0, 0, 0, 50%));
    }

    .form-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--ldesign-bg-color-component-disabled, #fafafa);
    }

    .form-error {
      margin-top: var(--ls-margin-xs, 6px);
      color: var(--ldesign-error-color, #e54848);
      font-size: var(--ls-font-size-xs, 14px);
    }

    .form-buttons {
      display: flex;
      gap: var(--ls-spacing-sm, 12px);
      margin-top: var(--ls-margin-lg, 28px);
      justify-content: flex-end;
    }

    .form-button {
      height: var(--ls-button-height-medium, 44px);
      padding: 0 var(--ls-padding-base, 20px);
      border: none;
      border-radius: var(--ls-border-radius-base, 6px);
      font-size: var(--ls-font-size-sm, 16px);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      user-select: none;
      min-width: 80px;
    }

    .form-button.primary {
      background-color: var(--ldesign-brand-color, #722ED1);
      color: var(--ldesign-font-white-1, white);
    }

    .form-button.primary:hover {
      background-color: var(--ldesign-brand-color-hover, #5e2aa7);
    }

    .form-button.primary:active {
      background-color: var(--ldesign-brand-color-active, #491f84);
    }

    .form-button.secondary {
      background-color: var(--ldesign-bg-color-component, white);
      color: var(--ldesign-text-color-primary, #333);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
    }

    .form-button.secondary:hover {
      background-color: var(--ldesign-bg-color-component-hover, #f8f8f8);
      border-color: var(--ldesign-border-color-hover, #d9d9d9);
    }

    .form-button:focus-visible {
      outline: 2px solid var(--ldesign-brand-color, #722ED1);
      outline-offset: 2px;
    }

    .form-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `

  /**
   * 表单配置
   */
  @property({ type: Object })
  config: LitFormConfig = {
    initialValues: {},
    fields: []
  }

  /**
   * 表单状态
   */
  @state()
  state: LitFormState = {
    data: {},
    isValid: true,
    isDirty: false,
    isPending: false,
    errors: {},
    fields: {}
  }

  /**
   * 内部表单实例
   */
  private formInstance: any = null

  /**
   * 组件连接到 DOM 时调用
   */
  connectedCallback() {
    super.connectedCallback()
    this.initializeForm()
  }

  /**
   * 属性更新时调用
   */
  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties)

    if (changedProperties.has('config')) {
      this.initializeForm()
    }
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
   * 更新组件状态
   */
  private updateState() {
    if (!this.formInstance) return

    this.state = {
      data: this.formInstance.data || {},
      isValid: this.formInstance.isValid || true,
      isDirty: this.formInstance.isDirty || false,
      isPending: this.formInstance.isPending || false,
      errors: this.formInstance.errors || {},
      fields: this.formInstance.fields || {}
    }

    this.requestUpdate()
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    if (!this.formInstance) return

    try {
      this.state.isPending = true
      this.requestUpdate()

      const result = await this.formInstance.validate()

      if (result.valid) {
        // 触发提交事件
        this.dispatchEvent(new CustomEvent('form-submit', {
          detail: { data: this.formInstance.data },
          bubbles: true,
          composed: true
        }))

        // 调用配置中的提交处理器
        if (this.config.onSubmit) {
          await this.config.onSubmit(this.formInstance.data)
        }
      } else {
        // 触发验证错误事件
        this.dispatchEvent(new CustomEvent('form-validate', {
          detail: { valid: false, errors: result.errors },
          bubbles: true,
          composed: true
        }))

        // 调用配置中的验证错误处理器
        if (this.config.onValidationError) {
          this.config.onValidationError(result.errors)
        }
      }
    } finally {
      this.state.isPending = false
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

    // 触发重置事件
    this.dispatchEvent(new CustomEvent('form-reset', {
      bubbles: true,
      composed: true
    }))

    // 调用配置中的重置处理器
    if (this.config.onReset) {
      this.config.onReset()
    }
  }

  /**
   * 验证表单
   */
  async validate(): Promise<boolean> {
    if (!this.formInstance) return true

    const result = await this.formInstance.validate()
    this.updateState()

    // 触发验证事件
    this.dispatchEvent(new CustomEvent('form-validate', {
      detail: { valid: result.valid, errors: result.errors },
      bubbles: true,
      composed: true
    }))

    return result.valid
  }

  /**
   * 设置字段值
   */
  setFieldValue(name: string, value: any): void {
    if (!this.formInstance) return

    this.formInstance.setFieldValue(name, value)
    this.updateState()

    // 触发字段变化事件
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { name, value },
      bubbles: true,
      composed: true
    }))

    // 调用配置中的字段变化处理器
    if (this.config.onFieldChange) {
      this.config.onFieldChange(name, value)
    }
  }

  /**
   * 获取字段值
   */
  getFieldValue(name: string): any {
    if (!this.formInstance) return undefined
    return this.formInstance.getFieldValue(name)
  }

  /**
   * 获取表单数据
   */
  getFormData(): Record<string, any> {
    if (!this.formInstance) return {}
    return this.formInstance.data || {}
  }

  /**
   * 处理输入事件
   */
  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    const name = target.name
    const value = target.value

    this.setFieldValue(name, value)
  }

  /**
   * 处理提交事件
   */
  private handleSubmit(event: Event) {
    event.preventDefault()
    this.submit()
  }

  /**
   * 处理重置事件
   */
  private handleReset(event: Event) {
    event.preventDefault()
    this.reset()
  }

  /**
   * 渲染表单字段
   */
  private renderField(field: any) {
    const fieldState = this.state.fields[field.name] || {}
    const hasError = fieldState.error && fieldState.error.length > 0

    return html`
      <div class="form-field">
        <label class="form-label" for="${field.name}">
          ${field.label}
          ${field.required ? html`<span class="required">*</span>` : ''}
        </label>
        <input
          class="form-input ${hasError ? 'error' : ''}"
          id="${field.name}"
          name="${field.name}"
          type="${field.type || 'text'}"
          placeholder="${field.placeholder || ''}"
          .value="${fieldState.value || ''}"
          ?required="${field.required}"
          ?disabled="${field.disabled}"
          ?readonly="${field.readonly}"
          @input="${this.handleInput}"
        />
        ${hasError ? html`
          <div class="form-error">
            ${fieldState.error.join(', ')}
          </div>
        ` : ''}
      </div>
    `
  }

  /**
   * 渲染组件
   */
  render() {
    if (!this.config) {
      return html`<div>表单配置未设置</div>`
    }

    return html`
      <div class="form-container">
        <form @submit="${this.handleSubmit}" @reset="${this.handleReset}">
          ${this.config.fields?.map(field => this.renderField(field))}
          
          <div class="form-buttons">
            <button 
              type="submit" 
              class="form-button primary"
              ?disabled="${this.state.isPending}"
            >
              ${this.state.isPending ? '提交中...' : '提交'}
            </button>
            <button 
              type="reset" 
              class="form-button secondary"
              ?disabled="${this.state.isPending}"
            >
              重置
            </button>
          </div>
        </form>
      </div>
    `
  }
}
