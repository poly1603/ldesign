/**
 * I18n按钮组件
 *
 * 用法：
 * <i18n-button text-key="common.save" variant="primary"></i18n-button>
 * <i18n-button text-key="common.cancel" variant="secondary" size="small"></i18n-button>
 */

import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { baseStyles } from '../styles/shared-styles'
import { getI18nConnector } from '../utils/i18n-connector'

/**
 * I18n按钮组件类
 */
@customElement('i18n-button')
export class I18nButton extends LitElement {
  static styles = [
    ...baseStyles,
    css`
      :host {
        display: inline-block;
      }

      :host([block]) {
        display: block;
        width: 100%;
      }

      .button {
        position: relative;
        overflow: hidden;
      }

      .button--block {
        width: 100%;
      }

      .button__content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--i18n-spacing-xs);
      }

      .button__icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
      }

      .button__text {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .button__loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .button--loading .button__content {
        opacity: 0;
      }

      @keyframes spin {
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }

      /* 按钮状态样式 */
      .button--success {
        background-color: #4caf50;
        border-color: #4caf50;
        color: white;
      }

      .button--success:hover {
        background-color: #45a049;
        border-color: #45a049;
      }

      .button--warning {
        background-color: #ff9800;
        border-color: #ff9800;
        color: white;
      }

      .button--warning:hover {
        background-color: #f57c00;
        border-color: #f57c00;
      }

      .button--danger {
        background-color: #f44336;
        border-color: #f44336;
        color: white;
      }

      .button--danger:hover {
        background-color: #d32f2f;
        border-color: #d32f2f;
      }
    `,
  ]

  /**
   * 按钮文本翻译键
   */
  @property({ type: String, attribute: 'text-key' })
  textKey = ''

  /**
   * 按钮变体
   */
  @property({ type: String })
  variant: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'danger' = 'primary'

  /**
   * 按钮尺寸
   */
  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium'

  /**
   * 是否禁用
   */
  @property({ type: Boolean })
  disabled = false

  /**
   * 是否正在加载
   */
  @property({ type: Boolean })
  loading = false

  /**
   * 是否为块级按钮
   */
  @property({ type: Boolean, reflect: true })
  block = false

  /**
   * 按钮类型
   */
  @property({ type: String })
  type: 'button' | 'submit' | 'reset' = 'button'

  /**
   * 按钮名称
   */
  @property({ type: String })
  name = ''

  /**
   * 按钮值
   */
  @property({ type: String })
  value = ''

  /**
   * 图标名称或HTML
   */
  @property({ type: String })
  icon = ''

  /**
   * 图标位置
   */
  @property({ type: String, attribute: 'icon-position' })
  iconPosition: 'left' | 'right' = 'left'

  /**
   * 翻译参数（JSON字符串）
   */
  @property({ type: String })
  params = ''

  /**
   * 当前按钮文本
   */
  @state()
  private buttonText = ''

  private connector = getI18nConnector({ debug: false })
  private removeLanguageListener?: () => void

  /**
   * 组件连接到DOM时
   */
  connectedCallback(): void {
    super.connectedCallback()

    // 监听语言变化
    this.removeLanguageListener = this.connector.addLanguageChangeListener(() => {
      this.updateTranslation()
    })

    // 初始翻译
    this.updateTranslation()
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

    // 如果翻译键或参数变化，重新翻译
    if (
      changedProperties.has('textKey')
      || changedProperties.has('params')
    ) {
      this.updateTranslation()
    }
  }

  /**
   * 更新翻译
   */
  private updateTranslation(): void {
    if (!this.textKey) {
      this.buttonText = ''
      return
    }

    try {
      // 解析参数
      let parsedParams: Record<string, any> | undefined
      if (this.params) {
        try {
          parsedParams = JSON.parse(this.params)
        }
        catch (error) {
          console.warn(`[i18n-button] Invalid params JSON: ${this.params}`, error)
          parsedParams = undefined
        }
      }

      // 执行翻译
      this.buttonText = this.connector.translate(this.textKey, parsedParams)
    }
    catch (error) {
      console.error(`[i18n-button] Translation error for key "${this.textKey}":`, error)
      this.buttonText = this.textKey
    }
  }

  /**
   * 处理点击事件
   */
  private handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    // 发出点击事件
    this.dispatchEvent(new CustomEvent('click', {
      detail: {
        value: this.value,
        name: this.name,
      },
      bubbles: true,
    }))
  }

  /**
   * 获取按钮CSS类名
   */
  private getButtonClasses(): string {
    const classes = ['btn', 'button']

    // 变体样式
    classes.push(`btn--${this.variant}`)

    // 尺寸样式
    if (this.size !== 'medium') {
      classes.push(`btn--${this.size}`)
    }

    // 状态样式
    if (this.loading) {
      classes.push('button--loading')
    }

    if (this.block) {
      classes.push('button--block')
    }

    return classes.join(' ')
  }

  /**
   * 渲染图标
   */
  private renderIcon() {
    if (!this.icon) {
      return ''
    }

    // 如果图标包含HTML标签，直接渲染
    if (this.icon.includes('<')) {
      return html`
        <span class="button__icon" .innerHTML="${this.icon}"></span>
      `
    }

    // 否则作为文本渲染
    return html`
      <span class="button__icon">${this.icon}</span>
    `
  }

  /**
   * 渲染按钮内容
   */
  private renderContent() {
    const iconElement = this.renderIcon()
    const textElement = html`<span class="button__text">${this.buttonText}</span>`

    if (!this.icon) {
      return textElement
    }

    if (this.iconPosition === 'right') {
      return html`${textElement}${iconElement}`
    }

    return html`${iconElement}${textElement}`
  }

  /**
   * 渲染组件
   */
  render() {
    return html`
      <button
        class="${this.getButtonClasses()}"
        type="${this.type}"
        name="${this.name}"
        value="${this.value}"
        ?disabled="${this.disabled || this.loading}"
        @click="${this.handleClick}"
      >
        <div class="button__content">
          ${this.renderContent()}
        </div>
        
        ${this.loading
          ? html`
          <div class="button__loading"></div>
        `
          : ''}
      </button>
    `
  }

  /**
   * 聚焦按钮
   */
  focus(): void {
    this.shadowRoot?.querySelector('button')?.focus()
  }

  /**
   * 失焦按钮
   */
  blur(): void {
    this.shadowRoot?.querySelector('button')?.blur()
  }

  /**
   * 点击按钮
   */
  click(): void {
    this.shadowRoot?.querySelector('button')?.click()
  }

  /**
   * 获取当前按钮文本
   */
  getText(): string {
    return this.buttonText
  }
}

/**
 * 类型声明
 */
declare global {
  interface HTMLElementTagNameMap {
    'i18n-button': I18nButton
  }
}
