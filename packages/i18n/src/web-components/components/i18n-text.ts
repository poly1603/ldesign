/**
 * I18n文本组件
 *
 * 用法：
 * <i18n-text key="common.ok"></i18n-text>
 * <i18n-text key="common.pageOf" params='{"current": 1, "total": 10}'></i18n-text>
 * <i18n-text key="missing.key" default="Default Text"></i18n-text>
 */

import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { baseStyles } from '../styles/shared-styles'
import { getI18nConnector } from '../utils/i18n-connector'

/**
 * I18n文本组件类
 */
@customElement('i18n-text')
export class I18nText extends LitElement {
  static styles = [
    ...baseStyles,
    css`
      :host {
        display: inline;
      }

      :host([block]) {
        display: block;
      }

      .text {
        color: inherit;
        font: inherit;
        margin: 0;
        padding: 0;
      }

      .text--loading {
        opacity: 0.6;
      }

      .text--error {
        color: var(--i18n-text-secondary);
        font-style: italic;
      }

      .text--missing {
        color: var(--i18n-text-disabled);
        text-decoration: underline dotted;
      }
    `,
  ]

  /**
   * 翻译键
   */
  @property({ type: String })
  key = ''

  /**
   * 参数对象（JSON字符串）
   */
  @property({ type: String })
  params = ''

  /**
   * 默认值
   */
  @property({ type: String })
  default = ''

  /**
   * 是否显示为块级元素
   */
  @property({ type: Boolean, reflect: true })
  block = false

  /**
   * 是否启用HTML渲染
   */
  @property({ type: Boolean })
  html = false

  /**
   * 翻译选项（JSON字符串）
   */
  @property({ type: String })
  options = ''

  /**
   * 当前翻译文本
   */
  @state()
  private translatedText = ''

  /**
   * 是否正在加载
   */
  @state()
  private isLoading = false

  /**
   * 是否有错误
   */
  @state()
  private hasError = false

  /**
   * 是否缺失翻译
   */
  @state()
  private isMissing = false

  private connector = getI18nConnector({ debug: false })
  private removeLanguageListener?: () => void
  private i18nInstance: any = null

  /**
   * 组件连接到DOM时
   */
  connectedCallback(): void {
    super.connectedCallback()

    // 尝试获取全局 i18n 实例
    if (typeof window !== 'undefined' && (window as any).i18n) {
      this.i18nInstance = (window as any).i18n
    }

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

    // 如果关键属性变化，重新翻译
    if (
      changedProperties.has('key')
      || changedProperties.has('params')
      || changedProperties.has('default')
      || changedProperties.has('options')
    ) {
      this.updateTranslation()
    }
  }

  /**
   * 更新翻译
   */
  private updateTranslation(): void {
    if (!this.key) {
      this.translatedText = this.default || ''
      this.hasError = false
      this.isMissing = false
      return
    }

    this.isLoading = true
    this.hasError = false
    this.isMissing = false

    try {
      // 解析参数
      let parsedParams: Record<string, any> | undefined
      if (this.params) {
        try {
          parsedParams = JSON.parse(this.params)
        }
        catch (error) {
          console.warn(`[i18n-text] Invalid params JSON: ${this.params}`, error)
          parsedParams = undefined
        }
      }

      // 解析选项
      let parsedOptions: any = {}
      if (this.options) {
        try {
          parsedOptions = JSON.parse(this.options)
        }
        catch (error) {
          console.warn(`[i18n-text] Invalid options JSON: ${this.options}`, error)
        }
      }

      // 添加默认值到选项
      if (this.default) {
        parsedOptions.defaultValue = this.default
      }

      // 执行翻译 - 优先使用全局 i18n 实例
      let result: string
      if (this.i18nInstance && typeof this.i18nInstance.t === 'function') {
        result = this.i18nInstance.t(this.key, parsedParams, parsedOptions)
      } else {
        result = this.connector.translate(this.key, parsedParams, parsedOptions)
      }

      // 检查是否缺失翻译（返回的是key本身）
      if (result === this.key && !this.default) {
        this.isMissing = true
        this.translatedText = this.key
      }
      else {
        this.translatedText = result
      }

      // 发出翻译完成事件
      this.dispatchEvent(new CustomEvent('translated', {
        detail: {
          key: this.key,
          params: parsedParams,
          result: this.translatedText,
          isMissing: this.isMissing,
        },
        bubbles: true,
      }))
    }
    catch (error) {
      console.error(`[i18n-text] Translation error for key "${this.key}":`, error)
      this.hasError = true
      this.translatedText = this.default || this.key

      // 发出错误事件
      this.dispatchEvent(new CustomEvent('translation-error', {
        detail: {
          key: this.key,
          error,
          fallback: this.translatedText,
        },
        bubbles: true,
      }))
    }
    finally {
      this.isLoading = false
    }
  }

  /**
   * 获取CSS类名
   */
  private getTextClasses(): string {
    const classes = ['text']

    if (this.isLoading) {
      classes.push('text--loading')
    }

    if (this.hasError) {
      classes.push('text--error')
    }

    if (this.isMissing) {
      classes.push('text--missing')
    }

    return classes.join(' ')
  }

  /**
   * 渲染组件
   */
  render() {
    const classes = this.getTextClasses()

    // 如果启用HTML渲染
    if (this.html) {
      return html`
        <span 
          class="${classes}"
          .innerHTML="${this.translatedText}"
          title="${this.isMissing ? `Missing translation: ${this.key}` : ''}"
        ></span>
      `
    }

    // 普通文本渲染
    return html`
      <span 
        class="${classes}"
        title="${this.isMissing ? `Missing translation: ${this.key}` : ''}"
      >
        ${this.translatedText}
      </span>
    `
  }

  /**
   * 手动刷新翻译
   */
  refresh(): void {
    this.updateTranslation()
  }

  /**
   * 获取当前翻译结果
   */
  getTranslation(): string {
    return this.translatedText
  }

  /**
   * 检查是否缺失翻译
   */
  isMissingTranslation(): boolean {
    return this.isMissing
  }

  /**
   * 检查是否有翻译错误
   */
  hasTranslationError(): boolean {
    return this.hasError
  }
}

/**
 * 类型声明
 */
declare global {
  interface HTMLElementTagNameMap {
    'i18n-text': I18nText
  }

  interface HTMLElementEventMap {
    'translated': CustomEvent<{
      key: string
      params?: Record<string, any>
      result: string
      isMissing: boolean
    }>
    'translation-error': CustomEvent<{
      key: string
      error: Error
      fallback: string
    }>
  }
}
