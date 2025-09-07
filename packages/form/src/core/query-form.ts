/**
 * 查询表单核心类
 * 
 * @description
 * 提供查询表单的核心功能，包括动态字段生成、展开收起、智能按钮布局等
 */

import { Form, createForm } from './form'
import type { FormOptions, FormData } from '../types'

export interface QueryFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'select' | 'date' | 'radio' | 'checkbox'
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  span?: number
  required?: boolean
  rules?: any[]
}

export interface QueryFormOptions {
  container: string | HTMLElement
  fields: QueryFormField[]
  defaultRowCount?: number
  colCount?: number
  gutter?: number
  collapsed?: boolean
  actionPosition?: 'auto' | 'inline' | 'block'
  actionAlign?: 'left' | 'center' | 'right' | 'justify'
  labelPosition?: 'top' | 'left'
  responsive?: boolean
  breakpoints?: Record<string, number>
  onSubmit?: (data: FormData) => void
  onReset?: () => void
  onToggle?: (collapsed: boolean) => void
  onFieldChange?: (name: string, value: any, formData: FormData) => void
}

export class DynamicQueryForm {
  private options: Required<QueryFormOptions>
  private form: Form
  private container: HTMLElement
  private grid: HTMLElement
  private actions: HTMLElement
  private collapsed: boolean
  private formData: FormData = {}
  private containerWidth: number = 0
  private currentColCount: number
  private resizeObserver: ResizeObserver | null = null
  private fields: HTMLElement[] = []
  private hiddenFields: HTMLElement[] = []

  constructor(options: QueryFormOptions) {
    this.options = {
      defaultRowCount: 1,
      colCount: 4,
      gutter: 16,
      collapsed: true,
      actionPosition: 'auto',
      actionAlign: 'left',
      labelPosition: 'left',
      responsive: true,
      breakpoints: {
        xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 6
      },
      onSubmit: () => { },
      onReset: () => { },
      onToggle: () => { },
      onFieldChange: () => { },
      ...options
    }

    this.collapsed = this.options.collapsed
    this.currentColCount = this.options.colCount

    // 创建表单实例
    this.form = createForm({
      initialValues: this.getInitialValues()
    })

    this.init()
  }

  private getInitialValues(): FormData {
    const values: FormData = {}
    this.options.fields.forEach(field => {
      values[field.name] = ''
    })
    return values
  }

  private init(): void {
    // 获取容器元素
    if (typeof this.options.container === 'string') {
      const element = document.querySelector(this.options.container)
      if (!element) {
        throw new Error(`Container not found: ${this.options.container}`)
      }
      this.container = element as HTMLElement
    } else {
      this.container = this.options.container
    }

    // 初始化容器宽度
    this.containerWidth = this.container.offsetWidth
    this.currentColCount = this.options.responsive ? this.calculateColCount() : this.options.colCount

    this.generateForm()
    this.bindEvents()
    this.initResizeObserver()
    this.updateLayout()
  }

  private calculateColCount(): number {
    const width = this.containerWidth
    const breakpoints = this.options.breakpoints

    if (width < 576) return breakpoints.xs
    if (width < 768) return breakpoints.sm
    if (width < 992) return breakpoints.md
    if (width < 1200) return breakpoints.lg
    if (width < 1400) return breakpoints.xl
    return breakpoints.xxl
  }

  private generateForm(): void {
    if (!this.options.fields || this.options.fields.length === 0) {
      console.warn('DynamicQueryForm: No fields provided')
      return
    }

    // 清空容器
    this.container.innerHTML = ''

    // 创建表单元素
    const form = document.createElement('form')
    form.className = 'query-form'
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSubmit()
    })

    // 创建网格容器
    this.grid = document.createElement('div')
    this.grid.className = 'query-form-grid'
    this.updateGridStyle()

    // 生成字段
    this.fields = []
    this.options.fields.forEach((field, index) => {
      const fieldElement = this.createField(field, index)
      this.fields.push(fieldElement)
      this.grid.appendChild(fieldElement)
    })

    // 创建按钮组
    this.actions = this.createActions()
    this.grid.appendChild(this.actions)

    form.appendChild(this.grid)
    this.container.appendChild(form)

    // 标识隐藏字段
    this.updateHiddenFields()
  }

  private createField(field: QueryFormField, index: number): HTMLElement {
    const fieldDiv = document.createElement('div')
    fieldDiv.className = 'query-form-field'
    fieldDiv.dataset.fieldIndex = index.toString()

    // 设置标签位置和对齐属性
    fieldDiv.dataset.labelPosition = this.options.labelPosition
    if (this.options.labelAlign) {
      fieldDiv.dataset.labelAlign = this.options.labelAlign
    }

    // 创建标签
    const label = document.createElement('label')
    label.textContent = field.label
    label.className = 'query-form-label'
    label.setAttribute('for', field.name)

    // 创建输入元素
    let input: HTMLElement
    switch (field.type) {
      case 'select':
        input = this.createSelectInput(field)
        break
      case 'radio':
        input = this.createRadioInput(field)
        break
      case 'checkbox':
        input = this.createCheckboxInput(field)
        break
      default:
        input = this.createTextInput(field)
    }

    fieldDiv.appendChild(label)
    fieldDiv.appendChild(input)

    return fieldDiv
  }

  private createTextInput(field: QueryFormField): HTMLInputElement {
    const input = document.createElement('input')
    input.type = field.type
    input.name = field.name
    input.id = field.name
    input.placeholder = field.placeholder || ''
    input.className = 'query-form-input'

    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.formData[field.name] = target.value
      this.options.onFieldChange(field.name, target.value, this.formData)
    })

    return input
  }

  private createSelectInput(field: QueryFormField): HTMLSelectElement {
    const select = document.createElement('select')
    select.name = field.name
    select.id = field.name
    select.className = 'query-form-select'

    // 添加默认选项
    if (field.placeholder) {
      const defaultOption = document.createElement('option')
      defaultOption.value = ''
      defaultOption.textContent = field.placeholder
      select.appendChild(defaultOption)
    }

    // 添加选项
    field.options?.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label
      select.appendChild(optionElement)
    })

    select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement
      this.formData[field.name] = target.value
      this.options.onFieldChange(field.name, target.value, this.formData)
    })

    return select
  }

  private createRadioInput(field: QueryFormField): HTMLElement {
    const container = document.createElement('div')
    container.className = 'query-form-radio-group'

    field.options?.forEach(option => {
      const label = document.createElement('label')
      label.className = 'query-form-radio-label'

      const input = document.createElement('input')
      input.type = 'radio'
      input.name = field.name
      input.value = option.value
      input.className = 'query-form-radio'

      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        if (target.checked) {
          this.formData[field.name] = target.value
          this.options.onFieldChange(field.name, target.value, this.formData)
        }
      })

      label.appendChild(input)
      label.appendChild(document.createTextNode(option.label))
      container.appendChild(label)
    })

    return container
  }

  private createCheckboxInput(field: QueryFormField): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.name = field.name
    input.id = field.name
    input.className = 'query-form-checkbox'

    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      this.formData[field.name] = target.checked
      this.options.onFieldChange(field.name, target.checked, this.formData)
    })

    return input
  }

  private createActions(): HTMLElement {
    const actions = document.createElement('div')
    actions.className = 'query-form-actions'

    // 主要操作按钮容器
    const primaryActions = document.createElement('div')
    primaryActions.className = 'query-form-actions__primary'

    // 查询按钮
    const submitBtn = document.createElement('button')
    submitBtn.type = 'submit'
    submitBtn.textContent = '查询'
    submitBtn.className = 'btn btn-primary'

    // 重置按钮
    const resetBtn = document.createElement('button')
    resetBtn.type = 'button'
    resetBtn.textContent = '重置'
    resetBtn.className = 'btn btn-text'
    resetBtn.addEventListener('click', () => this.handleReset())

    primaryActions.appendChild(submitBtn)
    primaryActions.appendChild(resetBtn)

    // 展开/收起按钮
    const collapseActions = document.createElement('div')
    collapseActions.className = 'query-form-actions__collapse'

    const toggleBtn = document.createElement('button')
    toggleBtn.type = 'button'
    toggleBtn.textContent = this.collapsed ? '展开' : '收起'
    toggleBtn.className = 'btn btn-text'
    toggleBtn.addEventListener('click', () => this.handleToggle())

    collapseActions.appendChild(toggleBtn)

    actions.appendChild(primaryActions)
    actions.appendChild(collapseActions)

    // 初始化时更新展开/收起按钮的显示状态
    this.updateCollapseButtonVisibility(actions)

    return actions
  }

  private updateGridStyle(): void {
    this.grid.style.gridTemplateColumns = `repeat(${this.currentColCount}, 1fr)`
    this.grid.style.gap = `${this.options.gutter}px`
  }

  private updateHiddenFields(): void {
    let maxVisibleFields = this.options.defaultRowCount * this.currentColCount

    // 收起状态下，如果按钮位置是内联模式，需要为按钮组预留最后一列的位置
    if (this.collapsed && this.options.actionPosition === 'inline') {
      maxVisibleFields = maxVisibleFields - 1
    }

    // 重新计算隐藏字段
    this.hiddenFields = []

    this.fields.forEach((field, index) => {
      if (this.collapsed && index >= maxVisibleFields) {
        this.hiddenFields.push(field)
      }
    })
  }

  private updateLayout(): void {
    this.updateGridStyle()

    // 先显示所有字段，然后根据状态隐藏需要隐藏的字段
    this.fields.forEach(field => {
      field.style.display = 'flex'
    })

    // 更新隐藏字段显示状态
    this.hiddenFields.forEach(field => {
      field.style.display = 'none'
    })

    // 更新按钮组位置
    this.updateActionPosition()

    // 更新展开/收起按钮的显示状态
    this.updateCollapseButtonVisibility(this.actions)
  }

  private updateActionPosition(): void {
    let visibleFields: number

    if (this.collapsed) {
      // 收起状态：计算默认显示的字段数量
      let maxVisibleFields = this.options.defaultRowCount * this.currentColCount

      // 收起状态下，如果按钮位置是内联模式，需要为按钮组预留最后一列的位置
      if (this.options.actionPosition === 'inline') {
        maxVisibleFields = maxVisibleFields - 1
      }

      visibleFields = Math.min(this.options.fields.length, maxVisibleFields)
    } else {
      // 展开状态：显示所有字段
      visibleFields = this.options.fields.length
    }

    const shouldInline = this.shouldActionInline(visibleFields)

    // 清除之前的样式类
    this.actions.classList.remove('action-inline', 'action-block')
    this.actions.classList.remove('action-align-left', 'action-align-center', 'action-align-right', 'action-align-justify')

    if (shouldInline) {
      // 内联模式：按钮组占用最后一行的剩余列数
      if (this.collapsed && this.options.actionPosition === 'inline') {
        // 收起状态下的内联模式：按钮组固定占用最后一列
        this.actions.style.gridColumn = `${this.currentColCount} / -1`
        this.actions.classList.add('action-inline')
      } else {
        // 展开状态或auto模式：根据字段数量计算按钮组位置
        const lastRowFieldCount = visibleFields % this.currentColCount

        if (lastRowFieldCount === 0) {
          // 最后一行已满
          if (this.options.actionPosition === 'inline') {
            // 强制内联模式：按钮组另起一行但保持内联样式
            this.actions.style.gridColumn = '1 / -1'
            this.actions.classList.add('action-inline')
          } else {
            // auto 模式：独占新行
            this.actions.style.gridColumn = '1 / -1'
            this.actions.classList.add('action-block')
          }
        } else {
          // 计算按钮组在最后一行的位置
          const startCol = lastRowFieldCount + 1
          this.actions.style.gridColumn = `${startCol} / -1`
          this.actions.classList.add('action-inline')
        }
      }
    } else {
      // 块级模式：独占一行
      this.actions.style.gridColumn = '1 / -1'
      this.actions.classList.add('action-block')
    }

    // 设置对齐方式
    this.actions.classList.add(`action-align-${this.options.actionAlign}`)
  }

  public shouldActionInline(visibleFields: number): boolean {
    if (this.options.actionPosition === 'block') return false
    if (this.options.actionPosition === 'inline') return true

    // auto 模式：根据字段数量和布局自动决定
    const lastRowFieldCount = visibleFields % this.currentColCount

    // 内联条件：
    // 1. 收起状态：如果字段数量没有填满一行，按钮组可以内联显示
    // 2. 展开状态：如果最后一行有剩余位置，按钮组占用剩余列数；如果最后一行被占满，按钮组另起一行
    if (this.collapsed) {
      // 收起状态：如果可见字段数量小于列数，说明最后一行有剩余位置可以放置按钮组
      return visibleFields < this.currentColCount
    } else {
      // 展开状态：如果最后一行有剩余位置，内联显示；否则独占一行
      return lastRowFieldCount > 0 && lastRowFieldCount < this.currentColCount
    }
  }

  private updateCollapseButtonVisibility(actions: HTMLElement): void {
    const collapseActions = actions.querySelector('.query-form-actions__collapse') as HTMLElement
    if (!collapseActions) return

    // 计算是否需要显示展开/收起按钮
    let maxVisibleFields = this.options.defaultRowCount * this.currentColCount

    // 如果按钮位置是内联模式，需要为按钮组预留最后一列的位置
    if (this.options.actionPosition === 'inline') {
      maxVisibleFields = maxVisibleFields - 1
    }

    const shouldShow = this.options.fields.length > maxVisibleFields
    collapseActions.style.display = shouldShow ? 'flex' : 'none'
  }

  private bindEvents(): void {
    // 表单字段变化事件已在创建字段时绑定
  }

  private initResizeObserver(): void {
    if (!this.options.responsive || !window.ResizeObserver) return

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width
        if (Math.abs(newWidth - this.containerWidth) > 10) {
          this.containerWidth = newWidth
          const newColCount = this.calculateColCount()

          if (newColCount !== this.currentColCount) {
            this.currentColCount = newColCount
            this.updateHiddenFields()
            this.updateLayout()
          }
        }
      }
    })

    this.resizeObserver.observe(this.container)
  }

  private handleSubmit(): void {
    this.options.onSubmit(this.formData)
  }

  private handleReset(): void {
    // 重置表单数据
    this.formData = this.getInitialValues()

    // 重置表单元素
    const form = this.container.querySelector('form')
    if (form) {
      form.reset()
    }

    this.options.onReset()
  }

  private handleToggle(): void {
    this.collapsed = !this.collapsed

    // 更新按钮文本
    const toggleBtn = this.actions.querySelector('.query-form-actions__collapse button')
    if (toggleBtn) {
      toggleBtn.textContent = this.collapsed ? '展开' : '收起'
    }

    // 更新隐藏字段
    this.updateHiddenFields()
    this.updateLayout()

    this.options.onToggle(this.collapsed)
  }

  // 公共方法
  public updateOptions(newOptions: Partial<QueryFormOptions>): void {
    Object.assign(this.options, newOptions)

    // 如果更新了响应式配置，重新初始化 ResizeObserver
    if ('responsive' in newOptions) {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      this.initResizeObserver()
    }

    // 如果更新了列数配置，重新计算布局
    if ('colCount' in newOptions && !this.options.responsive) {
      this.currentColCount = this.options.colCount
      this.updateHiddenFields()
    }

    this.updateLayout()
  }

  public getFormData(): FormData {
    return { ...this.formData }
  }

  public setFormData(data: Partial<FormData>): void {
    Object.assign(this.formData, data)

    // 更新表单元素的值
    Object.entries(data).forEach(([name, value]) => {
      const element = this.container.querySelector(`[name="${name}"]`) as HTMLInputElement
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = Boolean(value)
        } else {
          element.value = String(value)
        }
      }
    })
  }

  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  }

  public getVisibleFieldCount(): number {
    if (this.collapsed) {
      const maxVisibleFields = this.options.defaultRowCount * this.currentColCount
      return Math.min(this.options.fields.length, maxVisibleFields)
    }
    return this.options.fields.length
  }
}
