/**
 * I18n输入框组件
 *
 * 用法：
 * <i18n-input placeholder-key="common.searchPlaceholder" type="text"></i18n-input>
 * <i18n-input label-key="form.username" placeholder-key="form.usernamePlaceholder" required></i18n-input>
 */

import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { baseStyles } from '../styles/shared-styles'
import { getI18nConnector } from '../utils/i18n-connector'

/**
 * I18n输入框组件类
 */
@customElement('i18n-input')
export class I18nInput extends LitElement {
  static styles = [
    ...baseStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--i18n-spacing-xs);
      }

      .label {
        font-size: var(--i18n-font-size-sm);
        font-weight: 500;
        color: var(--i18n-text-primary);
        margin-bottom: var(--i18n-spacing-xs);
      }

      .label--required::after {
        content: ' *';
        color: #f44336;
      }

      .input-container {
        position: relative;
      }

      .input {
        width: 100%;
      }

      .help-text {
        font-size: var(--i18n-font-size-xs);
        color: var(--i18n-text-secondary);
        margin-top: var(--i18n-spacing-xs);
      }

      .error-text {
        font-size: var(--i18n-font-size-xs);
        color: #f44336;
        margin-top: var(--i18n-spacing-xs);
      }

      :host([invalid]) .input {
        border-color: #f44336;
      }

      :host([invalid]) .input:focus {
        border-color: #f44336;
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
      }

      .loading-indicator {
        position: absolute;
        right: var(--i18n-spacing-sm);
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border: 2px solid var(--i18n-border-color);
        border-top-color: var(--i18n-primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: translateY(-50%) rotate(360deg);
        }
      }
    `,
  ]

  /**
   * 标签翻译键
   */
  @property({ type: String, attribute: 'label-key' })
  labelKey = ''

  /**
   * 占位符翻译键
   */
  @property({ type: String, attribute: 'placeholder-key' })
  placeholderKey = ''

  /**
   * 帮助文本翻译键
   */
  @property({ type: String, attribute: 'help-key' })
  helpKey = ''

  /**
   * 错误文本翻译键
   */
  @property({ type: String, attribute: 'error-key' })
  errorKey = ''

  /**
   * 输入框类型
   */
  @property({ type: String })
  type = 'text'

  /**
   * 输入框值
   */
  @property({ type: String })
  value = ''

  /**
   * 输入框名称
   */
  @property({ type: String })
  name = ''

  /**
   * 是否必填
   */
  @property({ type: Boolean })
  required = false

  /**
   * 是否禁用
   */
  @property({ type: Boolean })
  disabled = false

  /**
   * 是否只读
   */
  @property({ type: Boolean })
  readonly = false

  /**
   * 最小长度
   */
  @property({ type: Number })
  minlength?: number

  /**
   * 最大长度
   */
  @property({ type: Number })
  maxlength?: number

  /**
   * 输入模式
   */
  @property({ type: String })
  inputmode?: string

  /**
   * 自动完成
   */
  @property({ type: String })
  autocomplete?: string

  /**
   * 尺寸
   */
  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium'

  /**
   * 是否无效
   */
  @property({ type: Boolean, reflect: true })
  invalid = false

  /**
   * 是否正在加载
   */
  @property({ type: Boolean })
  loading = false

  /**
   * 当前标签文本
   */
  @state()
  private labelText = ''

  /**
   * 当前占位符文本
   */
  @state()
  private placeholderText = ''

  /**
   * 当前帮助文本
   */
  @state()
  private helpText = ''

  /**
   * 当前错误文本
   */
  @state()
  private errorText = ''

  /**
   * 输入框元素引用
   */
  @query('.input')
  private inputElement!: HTMLInputElement

  private connector = getI18nConnector({ debug: false })
  private removeLanguageListener?: () => void

  /**
   * 组件连接到DOM时
   */
  connectedCallback(): void {
    super.connectedCallback()

    // 监听语言变化
    this.removeLanguageListener = this.connector.addLanguageChangeListener(() => {
      this.updateTranslations()
    })

    // 初始翻译
    this.updateTranslations()
  }

  /**
   * 组件从DOM断开时
   */
  disconnectedCallback(): void {
    super.disconnectedCallback()

    // 移除语言变化监听器
    if (this.removeLanguageListener) {
      this.removeLanguageListener()
      this.removeLanguageListener = undefined
    }
  }

  /**
   * 属性变化时
   */
  updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties)

    // 如果翻译键变化，重新翻译
    if (
      changedProperties.has('labelKey')
      || changedProperties.has('placeholderKey')
      || changedProperties.has('helpKey')
      || changedProperties.has('errorKey')
    ) {
      this.updateTranslations()
    }
  }

  /**
   * 更新所有翻译
   */
  private updateTranslations(): void {
    this.labelText = this.labelKey ? this.connector.translate(this.labelKey) : ''
    this.placeholderText = this.placeholderKey ? this.connector.translate(this.placeholderKey) : ''
    this.helpText = this.helpKey ? this.connector.translate(this.helpKey) : ''
    this.errorText = this.errorKey ? this.connector.translate(this.errorKey) : ''
  }

  /**
   * 处理输入事件
   */
  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement
    this.value = target.value

    // 发出输入事件
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: this.value },
      bubbles: true,
    }))
  }

  /**
   * 处理变化事件
   */
  private handleChange(event: Event): void {
    const target = event.target as HTMLInputElement
    this.value = target.value

    // 发出变化事件
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
    }))
  }

  /**
   * 处理焦点事件
   */
  private handleFocus(_event: FocusEvent): void {
    this.dispatchEvent(new CustomEvent('focus', {
      detail: { value: this.value },
      bubbles: true,
    }))
  }

  /**
   * 处理失焦事件
   */
  private handleBlur(_event: FocusEvent): void {
    this.dispatchEvent(new CustomEvent('blur', {
      detail: { value: this.value },
      bubbles: true,
    }))
  }

  /**
   * 获取输入框CSS类名
   */
  private getInputClasses(): string {
    const classes = ['input']

    if (this.size === 'small') {
      classes.push('input--small')
    }
    else if (this.size === 'large') {
      classes.push('input--large')
    }

    return classes.join(' ')
  }

  /**
   * 渲染组件
   */
  render() {
    return html`
      <div class="input-wrapper">
        ${this.labelText
          ? html`
          <label class="label ${this.required ? 'label--required' : ''}">
            ${this.labelText}
          </label>
        `
          : ''}
        
        <div class="input-container">
          <input
            class="${this.getInputClasses()}"
            type="${this.type}"
            .value="${this.value}"
            name="${this.name}"
            placeholder="${this.placeholderText}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            minlength="${this.minlength || ''}"
            maxlength="${this.maxlength || ''}"
            inputmode="${this.inputmode || ''}"
            autocomplete="${this.autocomplete || ''}"
            @input="${this.handleInput}"
            @change="${this.handleChange}"
            @focus="${this.handleFocus}"
            @blur="${this.handleBlur}"
          />
          
          ${this.loading
            ? html`
            <div class="loading-indicator"></div>
          `
            : ''}
        </div>
        
        ${this.helpText && !this.invalid
          ? html`
          <div class="help-text">${this.helpText}</div>
        `
          : ''}
        
        ${this.errorText && this.invalid
          ? html`
          <div class="error-text">${this.errorText}</div>
        `
          : ''}
      </div>
    `
  }

  /**
   * 聚焦输入框
   */
  focus(): void {
    this.inputElement?.focus()
  }

  /**
   * 失焦输入框
   */
  blur(): void {
    this.inputElement?.blur()
  }

  /**
   * 选择输入框文本
   */
  select(): void {
    this.inputElement?.select()
  }

  /**
   * 设置选择范围
   */
  setSelectionRange(start: number, end: number): void {
    this.inputElement?.setSelectionRange(start, end)
  }

  /**
   * 检查有效性
   */
  checkValidity(): boolean {
    return this.inputElement?.checkValidity() ?? true
  }

  /**
   * 报告有效性
   */
  reportValidity(): boolean {
    return this.inputElement?.reportValidity() ?? true
  }
}

/**
 * 类型声明
 */
declare global {
  interface HTMLElementTagNameMap {
    'i18n-input': I18nInput
  }
}
