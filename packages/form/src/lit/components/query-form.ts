/**
 * LDesignQueryForm Lit 组件
 * 
 * @description
 * 基于 Lit 的查询表单组件实现，支持展开收起、响应式布局等功能
 */

import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createForm } from '../../core'
import { LitQueryFormConfig, LitQueryFormComponent } from '../types'

// 声明 Lit 装饰器
declare global {
  interface HTMLElementTagNameMap {
    'ldesign-query-form': LDesignQueryForm
  }
}

/**
 * LDesign 查询表单组件
 * 
 * @example
 * ```html
 * <ldesign-query-form
 *   .config="${queryFormConfig}"
 *   @query-submit="${handleQuery}"
 *   @query-toggle="${handleToggle}"
 * ></ldesign-query-form>
 * ```
 */
@customElement('ldesign-query-form')
export class LDesignQueryForm extends LitElement implements LitQueryFormComponent {
  static styles = css`
    :host {
      display: block;
      font-family: var(--ldesign-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    }

    .query-form-container {
      background: var(--ldesign-bg-color-container, white);
      border-radius: var(--ls-border-radius-base, 6px);
      padding: var(--ls-padding-base, 20px);
      box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
    }

    .query-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--ls-spacing-base, 20px);
      margin-bottom: var(--ls-margin-base, 20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .query-row.hidden {
      display: none;
    }

    .query-row.expanding {
      opacity: 0;
      transform: translateY(-10px);
      animation: expandIn 0.3s ease forwards;
    }

    .query-row.expanded {
      opacity: 1;
      transform: translateY(0);
    }

    .query-row.collapsing {
      opacity: 0;
      transform: translateY(-10px);
      animation: collapseOut 0.3s ease forwards;
    }

    @keyframes expandIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes collapseOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      margin-bottom: var(--ls-margin-xs, 6px);
      font-weight: 500;
      color: var(--ldesign-text-color-primary, #333);
      font-size: var(--ls-font-size-sm, 16px);
    }

    .form-input {
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

    select.form-input {
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right var(--ls-padding-sm, 12px) center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 40px;
    }

    .form-buttons {
      display: flex;
      gap: var(--ls-spacing-sm, 12px);
      margin-top: var(--ls-margin-sm, 12px);
      padding-top: var(--ls-padding-sm, 12px);
      border-top: 1px solid var(--ldesign-border-level-1-color, #e5e5e5);
      justify-content: flex-start;
    }

    .form-buttons.center {
      justify-content: center;
    }

    .form-buttons.right {
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

    .form-button.secondary {
      background-color: var(--ldesign-bg-color-component, white);
      color: var(--ldesign-text-color-primary, #333);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
    }

    .form-button.secondary:hover {
      background-color: var(--ldesign-bg-color-component-hover, #f8f8f8);
      border-color: var(--ldesign-border-color-hover, #d9d9d9);
    }

    .form-button.outline {
      background-color: transparent;
      color: var(--ldesign-brand-color, #722ED1);
      border: 1px solid var(--ldesign-brand-color, #722ED1);
      position: relative;
    }

    .form-button.outline:hover {
      background-color: var(--ldesign-brand-color-focus, rgba(114, 46, 209, 0.1));
    }

    .form-button.outline:after {
      content: '';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid currentColor;
      transition: transform 0.3s ease;
    }

    .form-button.outline.expanded:after {
      transform: translateY(-50%) rotate(180deg);
    }

    /* 响应式布局 */
    @media (max-width: 1200px) {
      .query-row {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .query-row {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--ls-spacing-sm, 12px);
      }
    }

    @media (max-width: 480px) {
      .query-row {
        grid-template-columns: 1fr;
        gap: var(--ls-spacing-xs, 6px);
      }
      
      .form-buttons {
        flex-direction: column;
      }
      
      .form-button {
        width: 100%;
      }
    }
  `

  /**
   * 查询表单配置
   */
  @property({ type: Object })
  config: LitQueryFormConfig = {
    defaultRowCount: 1,
    collapsible: true,
    fields: [],
    actionPosition: 'inline',
    actionAlign: 'left'
  }

  /**
   * 是否展开
   */
  @state()
  expanded: boolean = false

  /**
   * 查询数据
   */
  @state()
  queryData: Record<string, any> = {}

  /**
   * 内部表单实例
   */
  private formInstance: any = null

  /**
   * 最大行数
   */
  private get maxRows(): number {
    if (!this.config.fields) return 1
    return Math.max(...this.config.fields.map(f => f.row || 1))
  }

  /**
   * 可见行数
   */
  private get visibleRows(): number {
    return this.expanded ? this.maxRows : (this.config.defaultRowCount || 1)
  }

  /**
   * 按行分组的字段
   */
  private get fieldsByRow(): Record<number, any[]> {
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
    if (!this.config || !this.config.fields) return

    // 初始化查询数据
    this.queryData = this.config.fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || ''
      return acc
    }, {} as Record<string, any>)

    // 创建表单实例
    this.formInstance = createForm({
      initialValues: this.queryData
    })

    // 注册字段
    this.config.fields.forEach(field => {
      this.formInstance.registerField({
        name: field.name,
        rules: field.rules || []
      })
    })
  }

  /**
   * 执行查询
   */
  async query(): Promise<void> {
    if (!this.formInstance) return

    try {
      const data = this.formInstance.data || this.queryData

      // 触发查询事件
      this.dispatchEvent(new CustomEvent('query-submit', {
        detail: { data },
        bubbles: true,
        composed: true
      }))

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
      this.queryData = this.config.fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || ''
        return acc
      }, {} as Record<string, any>)
    }

    // 重置表单实例
    if (this.formInstance) {
      this.formInstance.reset()
    }

    this.requestUpdate()

    // 调用配置中的重置处理器
    if (this.config.onReset) {
      this.config.onReset()
    }
  }

  /**
   * 切换展开收起
   */
  toggleExpand(): void {
    this.expanded = !this.expanded

    // 触发展开收起事件
    this.dispatchEvent(new CustomEvent('query-toggle', {
      detail: { expanded: this.expanded },
      bubbles: true,
      composed: true
    }))

    // 调用配置中的展开收起处理器
    if (this.config.onToggleExpand) {
      this.config.onToggleExpand(this.expanded)
    }
  }

  /**
   * 导出数据
   */
  async export(): Promise<void> {
    if (!this.formInstance) return

    try {
      const data = this.formInstance.data || this.queryData

      // 调用配置中的导出处理器
      if (this.config.onExport) {
        await this.config.onExport(data)
      }
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  /**
   * 处理输入事件
   */
  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement
    const name = target.name
    const value = target.value

    this.queryData = {
      ...this.queryData,
      [name]: value
    }

    if (this.formInstance) {
      this.formInstance.setFieldValue(name, value)
    }

    this.requestUpdate()
  }

  /**
   * 处理查询事件
   */
  private handleQuery(event: Event) {
    event.preventDefault()
    this.query()
  }

  /**
   * 处理重置事件
   */
  private handleReset(event: Event) {
    event.preventDefault()
    this.reset()
  }

  /**
   * 处理展开收起事件
   */
  private handleToggle(event: Event) {
    event.preventDefault()
    this.toggleExpand()
  }

  /**
   * 渲染表单字段
   */
  private renderField(field: any) {
    const value = this.queryData[field.name] || ''

    return html`
      <div class="form-field">
        <label class="form-label" for="${field.name}">
          ${field.label}
        </label>
        ${field.type === 'select' ? html`
          <select
            class="form-input"
            id="${field.name}"
            name="${field.name}"
            .value="${value}"
            @change="${this.handleInput}"
          >
            <option value="">${field.placeholder || '请选择'}</option>
            ${field.options?.map((option: any) => html`
              <option value="${option.value}" ?selected="${value === option.value}">
                ${option.label}
              </option>
            `)}
          </select>
        ` : html`
          <input
            class="form-input"
            id="${field.name}"
            name="${field.name}"
            type="${field.type || 'text'}"
            placeholder="${field.placeholder || ''}"
            .value="${value}"
            @input="${this.handleInput}"
          />
        `}
      </div>
    `
  }

  /**
   * 渲染查询行
   */
  private renderQueryRow(row: number, fields: any[]) {
    const isVisible = row <= this.visibleRows
    const isExpanding = row > (this.config.defaultRowCount || 1) && this.expanded

    return html`
      <div 
        class="query-row ${!isVisible ? 'hidden' : ''} ${isExpanding ? 'expanding' : 'expanded'}"
        data-row="${row}"
      >
        ${fields.map(field => this.renderField(field))}
      </div>
    `
  }

  /**
   * 渲染按钮组
   */
  private renderButtons() {
    const showToggleButton = this.config.collapsible && this.maxRows > (this.config.defaultRowCount || 1)

    return html`
      <div class="form-buttons ${this.config.actionAlign || 'left'}">
        <button 
          type="button" 
          class="form-button primary"
          @click="${this.handleQuery}"
        >
          查询
        </button>
        <button 
          type="button" 
          class="form-button secondary"
          @click="${this.handleReset}"
        >
          重置
        </button>
        ${showToggleButton ? html`
          <button 
            type="button" 
            class="form-button outline ${this.expanded ? 'expanded' : ''}"
            @click="${this.handleToggle}"
          >
            ${this.expanded ? '收起' : '展开'}
          </button>
        ` : ''}
      </div>
    `
  }

  /**
   * 渲染组件
   */
  render() {
    if (!this.config || !this.config.fields) {
      return html`<div>查询表单配置未设置</div>`
    }

    return html`
      <div class="query-form-container">
        <form @submit="${this.handleQuery}">
          ${Object.entries(this.fieldsByRow).map(([row, fields]) =>
      this.renderQueryRow(Number(row), fields)
    )}
          ${this.renderButtons()}
        </form>
      </div>
    `
  }
}
