/**
 * 查询表单 Web Component
 * 
 * @description
 * 使用Lit框架实现的Web Components查询表单，展示现代组件化开发
 */

import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import {
  calculateFormLayout,
  createResizeObserver,
  debounce,
  getAvailableWidth,
  generateGridTemplate,
  generateButtonGridStyle,
  DEFAULT_FIELDS,
  type FormConfig,
  type FieldConfig
} from '../utils/formLayoutUtils'
import { createStateSnapshot } from '../utils/formConsistencyChecker'

/**
 * 查询表单 Web Component
 */
@customElement('query-form-component')
export class QueryFormComponent extends LitElement {
  @property({ type: Object })
  config: FormConfig = {
    defaultRowCount: 1,
    collapsible: true,
    actionPosition: 'inline',
    actionAlign: 'left',
    layoutMode: 'adaptive',
    minFieldWidth: 200,
    buttonColumns: 1
  }

  @property({ type: Array })
  fields: FieldConfig[] = DEFAULT_FIELDS
  @state()
  private isExpanded = false

  @state()
  private formData: Record<string, string> = {}

  @state()
  private dynamicColumns = 4

  @state()
  private containerWidth = 800

  @state()
  private isInitialized = false

  private resizeObserver: ResizeObserver | null = null

  /**
   * 计算最大行数
   */
  private get maxRows(): number {
    return Math.max(...this.fields.map(f => f.row))
  }

  /**
   * 计算布局结果
   */
  private get layoutResult() {
    if (!this.config) {
      return {
        dynamicColumns: 4,
        shouldButtonsInRow: false,
        buttonGridColumn: '1 / -1',
        lastVisibleRow: 1,
        visibleRows: 1
      }
    }

    return calculateFormLayout(
      this.config,
      this.fields,
      this.isExpanded,
      this.containerWidth
    )
  }

  /**
   * 计算可见行数
   */
  private get visibleRows(): number {
    return this.layoutResult.visibleRows
  }

  /**
   * 获取可见字段（基于maxVisibleFields限制）
   */
  private get visibleFields(): FieldConfig[] {
    const maxVisible = this.layoutResult.maxVisibleFields
    return this.fields.slice(0, maxVisible)
  }

  /**
   * 按行分组可见字段
   */
  private get visibleFieldsByRow(): Record<number, FieldConfig[]> {
    const result: Record<number, FieldConfig[]> = {}
    const dynamicColumns = this.layoutResult.dynamicColumns

    this.visibleFields.forEach((field, index) => {
      const row = Math.floor(index / dynamicColumns) + 1
      if (!result[row]) {
        result[row] = []
      }
      result[row].push(field)
    })
    return result
  }

  /**
   * 更新容器宽度和布局
   */
  private updateContainerWidth = debounce(() => {
    if (!this.shadowRoot) return

    // 获取实际的容器元素而不是组件本身
    const container = this.shadowRoot.querySelector('.query-form') as HTMLElement
    const availableWidth = container ? getAvailableWidth(container) : getAvailableWidth(this as any)
    this.containerWidth = availableWidth

    // 重新计算布局结果并更新动态列数
    const layout = this.layoutResult
    this.dynamicColumns = layout.dynamicColumns

    // 调试信息和状态快照
    const stateSnapshot = createStateSnapshot(
      'Web Components',
      this.isExpanded,
      layout.visibleRows,
      this.maxRows,
      this.containerWidth,
      layout.dynamicColumns,
      this.config,
      this.fields,
      layout
    )

    console.log('Web Components布局计算结果:', stateSnapshot)

      // 将状态快照存储到全局，供一致性检查使用
      ; (window as any).webComponentsFormState = stateSnapshot

    this.requestUpdate()

    // 发送布局更新事件
    this.dispatchLayoutUpdate()
  }, 100)

  /**
   * 设置ResizeObserver
   */
  private setupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }

    // 观察实际的表单容器而不是组件本身
    const container = this.shadowRoot?.querySelector('.query-form') as HTMLElement
    const targetElement = container || this
    this.resizeObserver = createResizeObserver(targetElement, this.updateContainerWidth)
  }

  /**
   * 组件连接到DOM时
   */
  connectedCallback() {
    super.connectedCallback()
    this.updateComplete.then(() => {
      // 确保初始状态正确
      this.isExpanded = false
      this.isInitialized = true
      this.setupResizeObserver()
      this.updateContainerWidth()
      // 发送初始布局更新事件
      this.dispatchLayoutUpdate()
    })
  }

  /**
   * 组件从DOM断开时
   */
  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  }

  /**
   * 处理字段值变化
   */
  private handleFieldChange(fieldName: string, value: string) {
    this.formData = { ...this.formData, [fieldName]: value }
  }

  /**
   * 处理查询
   */
  private handleQuery() {
    console.log('Web Components 查询表单提交:', this.formData)
    this.dispatchEvent(new CustomEvent('query', {
      detail: { formData: this.formData },
      bubbles: true
    }))
  }

  /**
   * 处理重置
   */
  private handleReset() {
    console.log('Web Components 查询表单重置')
    this.formData = {}
    this.requestUpdate()
    this.dispatchEvent(new CustomEvent('reset', { bubbles: true }))
  }

  /**
   * 处理展开收起
   */
  private handleToggle() {
    this.isExpanded = !this.isExpanded
    console.log('Web Components 查询表单展开状态:', this.isExpanded ? '展开' : '收起')
    this.dispatchEvent(new CustomEvent('toggle', {
      detail: { expanded: this.isExpanded },
      bubbles: true
    }))
    // 发送布局更新事件
    this.dispatchLayoutUpdate()
  }

  /**
   * 发送布局更新事件
   */
  private dispatchLayoutUpdate() {
    const layoutResult = this.layoutResult
    this.dispatchEvent(new CustomEvent('layout-update', {
      detail: {
        visibleRows: layoutResult.visibleRows,
        fieldVisibleRows: layoutResult.fieldVisibleRows,
        dynamicColumns: layoutResult.dynamicColumns,
        containerWidth: this.containerWidth
      },
      bubbles: true
    }))
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<QueryFormConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.isExpanded = false // 重置展开状态
    this.updateContainerWidth()
  }

  /**
   * 渲染字段
   */
  private renderField(field: FieldConfig) {
    const value = this.formData[field.name] || ''

    return html`
      <div class="form-field">
        <label class="field-label">${field.label}</label>
        ${field.type === 'select' ? html`
          <select 
            class="form-input"
            .value=${value}
            @change=${(e: Event) => this.handleFieldChange(field.name, (e.target as HTMLSelectElement).value)}
          >
            ${field.options?.map(option => html`
              <option value=${option.value} ?selected=${value === option.value}>
                ${option.label}
              </option>
            `)}
          </select>
        ` : html`
          <input 
            type="text"
            class="form-input"
            .value=${value}
            placeholder=${field.placeholder || `请输入${field.label}`}
            @input=${(e: Event) => this.handleFieldChange(field.name, (e.target as HTMLInputElement).value)}
          />
        `}
      </div>
    `
  }

  /**
   * 渲染按钮组
   */
  private renderButtons(inRow = false, gridColumn = '1 / -1') {
    if (!this.config) return html``

    const alignmentClass = `buttons-${this.config.actionAlign}`
    const positionClass = inRow ? 'buttons-in-row' : 'buttons-newline'

    // 生成按钮组的网格定位样式
    const buttonGridStyle = generateButtonGridStyle(gridColumn)

    return html`
      <div
        class="form-buttons ${alignmentClass} ${positionClass}"
        style=${styleMap(buttonGridStyle)}
      >
        <button class="form-button primary" @click=${this.handleQuery}>查询</button>
        <button class="form-button secondary" @click=${this.handleReset}>重置</button>
        ${this.config.collapsible && this.maxRows > this.config.defaultRowCount ? html`
          <button class="form-button outline" @click=${this.handleToggle}>
            ${this.isExpanded ? '收起' : '展开'}
          </button>
        ` : ''}
      </div>
    `
  }

  /**
   * 主渲染方法
   */
  render() {
    const layout = this.layoutResult
    const maxRows = Math.ceil(this.visibleFields.length / layout.dynamicColumns)

    return html`
      <div class="query-form">
        ${Array.from({ length: maxRows }, (_, index) => {
      const row = index + 1
      const rowFields = this.visibleFieldsByRow[row] || []
      const isLastVisibleRow = row === maxRows
      const showButtonsInThisRow = layout.shouldButtonsInRow && isLastVisibleRow

      return html`
            <div
              class="query-row ${showButtonsInThisRow ? 'has-buttons' : ''}"
              style=${styleMap({
        display: 'grid',
        gridTemplateColumns: generateGridTemplate(layout.dynamicColumns)
      })}
            >
              ${rowFields.map(field => this.renderField(field))}
              ${showButtonsInThisRow ? this.renderButtons(true, layout.buttonGridColumn) : ''}
            </div>
          `
    })}

        ${!layout.shouldButtonsInRow ? html`
          <div
            class="query-row button-row"
            style=${styleMap({
      gridTemplateColumns: generateGridTemplate(layout.dynamicColumns)
    })}
          >
            ${this.renderButtons(false, layout.buttonGridColumn)}
          </div>
        ` : ''}
      </div>
    `
  }

  /**
   * 组件样式
   */
  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .query-form {
      background: var(--ldesign-bg-color-container, #ffffff);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-base, 6px);
      padding: var(--ls-padding-base, 20px);
    }

    .query-row {
      display: grid;
      /* 动态列数通过内联样式设置，移除硬编码 */
      gap: var(--ls-spacing-base, 20px);
      margin-bottom: var(--ls-margin-base, 20px);
      align-items: end;
    }

    .query-row:last-child {
      margin-bottom: 0;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--ls-spacing-xs, 6px);
    }

    .field-label {
      font-size: var(--ls-font-size-sm, 16px);
      font-weight: 500;
      color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
      margin: 0;
    }

    .form-input {
      height: var(--ls-input-height-medium, 44px);
      padding: 0 var(--ls-padding-sm, 12px);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-base, 6px);
      font-size: var(--ls-font-size-sm, 16px);
      color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
      background-color: var(--ldesign-bg-color-component, #ffffff);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--ldesign-brand-color, #722ed1);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus, rgba(114, 46, 209, 0.1));
    }

    .form-input::placeholder {
      color: var(--ldesign-text-color-placeholder, rgba(0, 0, 0, 0.5));
    }

    /* 按钮组样式 */
    .form-buttons {
      display: flex;
      gap: var(--ls-spacing-xs, 6px);
      align-items: center;
    }

    .form-buttons.buttons-left {
      justify-content: flex-start;
    }

    .form-buttons.buttons-center {
      justify-content: center;
    }

    .form-buttons.buttons-right {
      justify-content: flex-end;
    }

    .form-buttons.buttons-in-row {
      grid-column: 4 / -1;
      margin: 0;
    }

    .form-buttons.buttons-newline {
      grid-column: 1 / -1;
      margin-top: var(--ls-margin-lg, 28px);
    }

    .form-button {
      height: var(--ls-button-height-medium, 44px);
      padding: 0 var(--ls-padding-base, 20px);
      border: 1px solid transparent;
      border-radius: var(--ls-border-radius-base, 6px);
      font-size: var(--ls-font-size-sm, 16px);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .form-button.primary {
      background-color: var(--ldesign-brand-color, #722ed1);
      color: var(--ldesign-font-white-1, #ffffff);
      border-color: var(--ldesign-brand-color, #722ed1);
    }

    .form-button.primary:hover {
      background-color: var(--ldesign-brand-color-hover, #5e2aa7);
      border-color: var(--ldesign-brand-color-hover, #5e2aa7);
    }

    .form-button.secondary {
      background-color: var(--ldesign-bg-color-component, #ffffff);
      color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
      border-color: var(--ldesign-border-color, #e5e5e5);
    }

    .form-button.secondary:hover {
      border-color: var(--ldesign-brand-color, #722ed1);
      color: var(--ldesign-brand-color, #722ed1);
    }

    .form-button.outline {
      background-color: transparent;
      color: var(--ldesign-brand-color, #722ed1);
      border-color: var(--ldesign-brand-color, #722ed1);
    }

    .form-button.outline:hover {
      background-color: var(--ldesign-brand-color-focus, rgba(114, 46, 209, 0.1));
    }
  `
}
