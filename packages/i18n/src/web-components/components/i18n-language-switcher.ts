/**
 * I18n语言选择器组件
 *
 * 用法：
 * <i18n-language-switcher theme="light" position="bottom" show-flags="true"></i18n-language-switcher>
 */

import type { LanguageInfo } from '../../core/types'
import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { baseStyles } from '../styles/shared-styles'
import { getI18nConnector } from '../utils/i18n-connector'

/**
 * 语言标志映射
 */
const LANGUAGE_FLAGS: Record<string, string> = {
  'en': '🇺🇸',
  'zh-CN': '🇨🇳',
  'ja': '🇯🇵',
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'es': '🇪🇸',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'ru': '🇷🇺',
  'ko': '🇰🇷',
  'ar': '🇸🇦',
  'hi': '🇮🇳',
}

/**
 * I18n语言选择器组件类
 */
@customElement('i18n-language-switcher')
export class I18nLanguageSwitcher extends LitElement {
  static styles = [
    ...baseStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }

      .switcher {
        position: relative;
      }

      .trigger {
        display: flex;
        align-items: center;
        gap: var(--i18n-spacing-xs);
        padding: var(--i18n-spacing-sm) var(--i18n-spacing-md);
        border: 1px solid var(--i18n-border-color);
        border-radius: var(--i18n-border-radius);
        background-color: var(--i18n-bg-primary);
        color: var(--i18n-text-primary);
        cursor: pointer;
        transition: all var(--i18n-transition-fast);
        min-height: 36px;
        user-select: none;
      }

      .trigger:hover {
        border-color: var(--i18n-border-hover);
        background-color: var(--i18n-bg-hover);
      }

      .trigger:focus {
        outline: none;
        border-color: var(--i18n-border-focus);
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
      }

      .trigger--open {
        border-color: var(--i18n-border-focus);
      }

      .trigger__flag {
        font-size: 16px;
        line-height: 1;
      }

      .trigger__text {
        flex: 1;
        font-size: var(--i18n-font-size-sm);
        white-space: nowrap;
      }

      .trigger__arrow {
        font-size: 12px;
        transition: transform var(--i18n-transition-fast);
      }

      .trigger--open .trigger__arrow {
        transform: rotate(180deg);
      }

      .dropdown {
        position: absolute;
        left: 0;
        right: 0;
        z-index: var(--i18n-z-dropdown);
        background-color: var(--i18n-bg-primary);
        border: 1px solid var(--i18n-border-color);
        border-radius: var(--i18n-border-radius);
        box-shadow: var(--i18n-shadow-md);
        max-height: 300px;
        overflow-y: auto;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all var(--i18n-transition-fast);
      }

      .dropdown--open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown--top {
        bottom: 100%;
        top: auto;
        transform: translateY(8px);
      }

      .dropdown--top.dropdown--open {
        transform: translateY(0);
      }

      .dropdown__item {
        display: flex;
        align-items: center;
        gap: var(--i18n-spacing-sm);
        padding: var(--i18n-spacing-sm) var(--i18n-spacing-md);
        color: var(--i18n-text-primary);
        cursor: pointer;
        transition: background-color var(--i18n-transition-fast);
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-family: inherit;
        font-size: var(--i18n-font-size-sm);
      }

      .dropdown__item:hover {
        background-color: var(--i18n-bg-hover);
      }

      .dropdown__item:active {
        background-color: var(--i18n-bg-active);
      }

      .dropdown__item--active {
        background-color: var(--i18n-primary-color);
        color: var(--i18n-text-inverse);
      }

      .dropdown__item--active:hover {
        background-color: var(--i18n-primary-hover);
      }

      .dropdown__flag {
        font-size: 16px;
        line-height: 1;
      }

      .dropdown__text {
        flex: 1;
      }

      .dropdown__name {
        font-weight: 500;
      }

      .dropdown__native {
        font-size: var(--i18n-font-size-xs);
        color: var(--i18n-text-secondary);
        margin-top: 2px;
      }

      .dropdown__item--active .dropdown__native {
        color: rgba(255, 255, 255, 0.8);
      }

      .dropdown__check {
        font-size: 14px;
        opacity: 0;
        transition: opacity var(--i18n-transition-fast);
      }

      .dropdown__item--active .dropdown__check {
        opacity: 1;
      }

      .loading {
        opacity: 0.6;
        pointer-events: none;
      }

      /* 紧凑模式 */
      :host([compact]) .trigger {
        padding: var(--i18n-spacing-xs) var(--i18n-spacing-sm);
        min-height: 28px;
      }

      :host([compact]) .trigger__text {
        font-size: var(--i18n-font-size-xs);
      }

      /* 无边框模式 */
      :host([borderless]) .trigger {
        border: none;
        background: transparent;
        padding: var(--i18n-spacing-xs);
      }

      :host([borderless]) .trigger:hover {
        background-color: var(--i18n-bg-hover);
      }
    `,
  ]

  /**
   * 主题
   */
  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' = 'light'

  /**
   * 下拉菜单位置
   */
  @property({ type: String })
  position: 'top' | 'bottom' = 'bottom'

  /**
   * 是否显示国旗
   */
  @property({ type: Boolean, attribute: 'show-flags' })
  showFlags = true

  /**
   * 是否紧凑模式
   */
  @property({ type: Boolean, reflect: true })
  compact = false

  /**
   * 是否无边框
   */
  @property({ type: Boolean, reflect: true })
  borderless = false

  /**
   * 是否禁用
   */
  @property({ type: Boolean })
  disabled = false

  /**
   * 自定义语言列表（JSON字符串）
   */
  @property({ type: String, attribute: 'languages' })
  languages = ''

  /**
   * 是否显示原生名称
   */
  @property({ type: Boolean, attribute: 'show-native-name' })
  showNativeName = true

  /**
   * 是否正在加载
   */
  @state()
  private isLoading = false

  /**
   * 是否打开下拉菜单
   */
  @state()
  private isOpen = false

  /**
   * 当前语言
   */
  @state()
  private currentLanguage = ''

  /**
   * 可用语言列表
   */
  @state()
  private availableLanguages: LanguageInfo[] = []

  /**
   * 触发器元素引用
   */
  @query('.trigger')
  private triggerElement!: HTMLElement

  private connector = getI18nConnector({ debug: false })
  private removeLanguageListener?: () => void

  /**
   * 组件连接到DOM时
   */
  connectedCallback(): void {
    super.connectedCallback()

    // 监听语言变化
    this.removeLanguageListener = this.connector.addLanguageChangeListener(() => {
      this.updateLanguageInfo()
    })

    // 监听全局点击事件
    document.addEventListener('click', this.handleDocumentClick.bind(this))

    // 初始化语言信息
    this.updateLanguageInfo()
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

    // 移除全局点击监听器
    document.removeEventListener('click', this.handleDocumentClick.bind(this))
  }

  /**
   * 属性变化时
   */
  updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties)

    // 如果自定义语言列表变化，重新解析
    if (changedProperties.has('languages')) {
      this.updateLanguageInfo()
    }
  }

  /**
   * 更新语言信息
   */
  private updateLanguageInfo(): void {
    this.currentLanguage = this.connector.getCurrentLanguage()

    // 如果有自定义语言列表，使用自定义列表
    if (this.languages) {
      try {
        this.availableLanguages = JSON.parse(this.languages)
      }
      catch (error) {
        console.warn(`[i18n-language-switcher] Invalid languages JSON: ${this.languages}`, error)
        this.availableLanguages = this.connector.getAvailableLanguages()
      }
    }
    else {
      this.availableLanguages = this.connector.getAvailableLanguages()
    }
  }

  /**
   * 处理触发器点击
   */
  private handleTriggerClick(event: MouseEvent): void {
    event.stopPropagation()

    if (this.disabled || this.isLoading) {
      return
    }

    this.isOpen = !this.isOpen
  }

  /**
   * 处理语言选择
   */
  private async handleLanguageSelect(language: LanguageInfo): Promise<void> {
    if (this.disabled || this.isLoading || language.code === this.currentLanguage) {
      return
    }

    this.isLoading = true
    this.isOpen = false

    try {
      await this.connector.changeLanguage(language.code)

      // 发出语言变化事件
      this.dispatchEvent(new CustomEvent('language-changed', {
        detail: {
          language: language.code,
          previousLanguage: this.currentLanguage,
          languageInfo: language,
        },
        bubbles: true,
      }))
    }
    catch (error) {
      console.error(`[i18n-language-switcher] Language change error:`, error)

      // 发出错误事件
      this.dispatchEvent(new CustomEvent('language-change-error', {
        detail: {
          error,
          targetLanguage: language.code,
          currentLanguage: this.currentLanguage,
        },
        bubbles: true,
      }))
    }
    finally {
      this.isLoading = false
    }
  }

  /**
   * 处理文档点击（关闭下拉菜单）
   */
  private handleDocumentClick(event: MouseEvent): void {
    if (!this.contains(event.target as Node)) {
      this.isOpen = false
    }
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled || this.isLoading) {
      return
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        this.isOpen = !this.isOpen
        break
      case 'Escape':
        this.isOpen = false
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!this.isOpen) {
          this.isOpen = true
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!this.isOpen) {
          this.isOpen = true
        }
        break
    }
  }

  /**
   * 获取语言标志
   */
  private getLanguageFlag(languageCode: string): string {
    return LANGUAGE_FLAGS[languageCode] || '🌐'
  }

  /**
   * 获取当前语言信息
   */
  private getCurrentLanguageInfo(): LanguageInfo | undefined {
    return this.availableLanguages.find(lang => lang.code === this.currentLanguage)
  }

  /**
   * 获取触发器CSS类名
   */
  private getTriggerClasses(): string {
    const classes = ['trigger']

    if (this.isOpen) {
      classes.push('trigger--open')
    }

    return classes.join(' ')
  }

  /**
   * 获取下拉菜单CSS类名
   */
  private getDropdownClasses(): string {
    const classes = ['dropdown']

    if (this.isOpen) {
      classes.push('dropdown--open')
    }

    if (this.position === 'top') {
      classes.push('dropdown--top')
    }

    return classes.join(' ')
  }

  /**
   * 渲染触发器
   */
  private renderTrigger() {
    const currentLang = this.getCurrentLanguageInfo()

    return html`
      <div
        class="${this.getTriggerClasses()}"
        tabindex="${this.disabled ? -1 : 0}"
        role="button"
        aria-haspopup="listbox"
        aria-expanded="${this.isOpen}"
        aria-disabled="${this.disabled}"
        @click="${this.handleTriggerClick}"
        @keydown="${this.handleKeyDown}"
      >
        ${this.showFlags
          ? html`
          <span class="trigger__flag">
            ${this.getLanguageFlag(this.currentLanguage)}
          </span>
        `
          : ''}
        
        <span class="trigger__text">
          ${currentLang?.nativeName || currentLang?.name || this.currentLanguage}
        </span>
        
        <span class="trigger__arrow">▼</span>
      </div>
    `
  }

  /**
   * 渲染下拉菜单
   */
  private renderDropdown() {
    return html`
      <div class="${this.getDropdownClasses()}" role="listbox">
        ${this.availableLanguages.map(language => html`
          <button
            class="dropdown__item ${language.code === this.currentLanguage ? 'dropdown__item--active' : ''}"
            role="option"
            aria-selected="${language.code === this.currentLanguage}"
            @click="${() => this.handleLanguageSelect(language)}"
          >
            ${this.showFlags
              ? html`
              <span class="dropdown__flag">
                ${this.getLanguageFlag(language.code)}
              </span>
            `
              : ''}
            
            <div class="dropdown__text">
              <div class="dropdown__name">${language.name}</div>
              ${this.showNativeName && language.nativeName !== language.name
                ? html`
                <div class="dropdown__native">${language.nativeName}</div>
              `
                : ''}
            </div>
            
            <span class="dropdown__check">✓</span>
          </button>
        `)}
      </div>
    `
  }

  /**
   * 渲染组件
   */
  render() {
    return html`
      <div class="switcher ${this.isLoading ? 'loading' : ''}">
        ${this.renderTrigger()}
        ${this.renderDropdown()}
      </div>
    `
  }

  /**
   * 打开下拉菜单
   */
  open(): void {
    if (!this.disabled && !this.isLoading) {
      this.isOpen = true
    }
  }

  /**
   * 关闭下拉菜单
   */
  close(): void {
    this.isOpen = false
  }

  /**
   * 切换下拉菜单
   */
  toggle(): void {
    if (this.isOpen) {
      this.close()
    }
    else {
      this.open()
    }
  }

  /**
   * 聚焦组件
   */
  focus(): void {
    this.triggerElement?.focus()
  }
}

/**
 * 类型声明
 */
declare global {
  interface HTMLElementTagNameMap {
    'i18n-language-switcher': I18nLanguageSwitcher
  }

  interface HTMLElementEventMap {
    'language-changed': CustomEvent<{
      language: string
      previousLanguage: string
      languageInfo: LanguageInfo
    }>
    'language-change-error': CustomEvent<{
      error: Error
      targetLanguage: string
      currentLanguage: string
    }>
  }
}
