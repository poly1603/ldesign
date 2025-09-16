/**
 * 事件创建/编辑弹窗组件
 */

import { DOMUtils } from '../utils/dom'
import type { CalendarEvent, DateInput } from '../types'
import dayjs from 'dayjs'

export interface EventModalOptions {
  mode: 'create' | 'edit'
  event?: CalendarEvent
  date?: DateInput
  onSave?: (event: CalendarEvent) => void
  onCancel?: () => void
  onDelete?: (event: CalendarEvent) => void
}

export class EventModal {
  private overlay: HTMLElement | null = null
  private modal: HTMLElement | null = null
  private options: EventModalOptions | null = null
  private formData: Partial<CalendarEvent> = {}

  /**
   * 显示弹窗
   */
  public show(options: EventModalOptions): void {
    this.options = options
    this.initFormData()
    this.createElement()
    this.bindEvents()
  }

  /**
   * 隐藏弹窗
   */
  public hide(): void {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
      this.modal = null
    }
    this.options = null
    this.formData = {}
  }

  /**
   * 初始化表单数据
   */
  private initFormData(): void {
    if (!this.options) return

    if (this.options.mode === 'edit' && this.options.event) {
      this.formData = { ...this.options.event }
    } else {
      const date = this.options.date ? dayjs(this.options.date) : dayjs()
      this.formData = {
        title: '',
        description: '',
        start: date.hour(9).minute(0).toDate(),
        end: date.hour(10).minute(0).toDate(),
        allDay: false,
        color: '#722ED1',
        category: 'work'
      }
    }
  }

  /**
   * 创建弹窗元素
   */
  private createElement(): void {
    if (!this.options) return

    // 创建遮罩层
    this.overlay = DOMUtils.createElement('div', 'ldesign-calendar-modal-overlay')
    
    // 创建弹窗
    this.modal = DOMUtils.createElement('div', 'ldesign-calendar-modal')
    
    // 创建头部
    const header = this.createHeader()
    this.modal.appendChild(header)
    
    // 创建主体
    const body = this.createBody()
    this.modal.appendChild(body)
    
    // 创建底部
    const footer = this.createFooter()
    this.modal.appendChild(footer)
    
    this.overlay.appendChild(this.modal)
    document.body.appendChild(this.overlay)
  }

  /**
   * 创建头部
   */
  private createHeader(): HTMLElement {
    const header = DOMUtils.createElement('div', 'ldesign-calendar-modal-header')
    
    const title = DOMUtils.createElement('h3', 'ldesign-calendar-modal-title')
    title.textContent = this.options!.mode === 'create' ? '新建日程' : '编辑日程'
    
    const closeBtn = DOMUtils.createElement('button', 'ldesign-calendar-modal-close')
    closeBtn.innerHTML = '×'
    closeBtn.addEventListener('click', () => this.handleCancel())
    
    header.appendChild(title)
    header.appendChild(closeBtn)
    
    return header
  }

  /**
   * 创建主体
   */
  private createBody(): HTMLElement {
    const body = DOMUtils.createElement('div', 'ldesign-calendar-modal-body')
    
    // 标题输入
    const titleGroup = this.createFormGroup('标题', 'title', 'input', {
      placeholder: '请输入日程标题',
      required: true
    })
    body.appendChild(titleGroup)
    
    // 时间设置
    const timeRow = DOMUtils.createElement('div', 'ldesign-calendar-form-row')
    
    const startGroup = this.createFormGroup('开始时间', 'start', 'datetime-local')
    const endGroup = this.createFormGroup('结束时间', 'end', 'datetime-local')
    
    const startCol = DOMUtils.createElement('div', 'ldesign-calendar-form-col')
    startCol.appendChild(startGroup)
    timeRow.appendChild(startCol)

    const endCol = DOMUtils.createElement('div', 'ldesign-calendar-form-col')
    endCol.appendChild(endGroup)
    timeRow.appendChild(endCol)
    body.appendChild(timeRow)
    
    // 全天事件
    const allDayGroup = this.createCheckboxGroup('全天事件', 'allDay')
    body.appendChild(allDayGroup)
    
    // 描述
    const descGroup = this.createFormGroup('描述', 'description', 'textarea', {
      placeholder: '请输入日程描述（可选）'
    })
    body.appendChild(descGroup)
    
    // 分类和颜色
    const categoryRow = DOMUtils.createElement('div', 'ldesign-calendar-form-row')
    
    const categoryGroup = this.createSelectGroup('分类', 'category', [
      { value: 'work', label: '工作' },
      { value: 'personal', label: '个人' },
      { value: 'meeting', label: '会议' },
      { value: 'reminder', label: '提醒' },
      { value: 'other', label: '其他' }
    ])
    
    const colorGroup = this.createColorGroup('颜色', 'color')
    
    const categoryCol = DOMUtils.createElement('div', 'ldesign-calendar-form-col')
    categoryCol.appendChild(categoryGroup)
    categoryRow.appendChild(categoryCol)

    const colorCol = DOMUtils.createElement('div', 'ldesign-calendar-form-col')
    colorCol.appendChild(colorGroup)
    categoryRow.appendChild(colorCol)
    body.appendChild(categoryRow)
    
    return body
  }

  /**
   * 创建底部
   */
  private createFooter(): HTMLElement {
    const footer = DOMUtils.createElement('div', 'ldesign-calendar-modal-footer')
    
    // 删除按钮（仅编辑模式）
    if (this.options!.mode === 'edit') {
      const deleteBtn = DOMUtils.createElement('button', 'ldesign-calendar-btn ldesign-calendar-btn-danger')
      deleteBtn.textContent = '删除'
      deleteBtn.addEventListener('click', () => this.handleDelete())
      footer.appendChild(deleteBtn)
    }
    
    // 取消按钮
    const cancelBtn = DOMUtils.createElement('button', 'ldesign-calendar-btn')
    cancelBtn.textContent = '取消'
    cancelBtn.addEventListener('click', () => this.handleCancel())
    
    // 保存按钮
    const saveBtn = DOMUtils.createElement('button', 'ldesign-calendar-btn ldesign-calendar-btn-primary')
    saveBtn.textContent = this.options!.mode === 'create' ? '创建' : '保存'
    saveBtn.addEventListener('click', () => this.handleSave())
    
    footer.appendChild(cancelBtn)
    footer.appendChild(saveBtn)
    
    return footer
  }

  /**
   * 创建表单组
   */
  private createFormGroup(label: string, name: string, type: string, attrs: any = {}): HTMLElement {
    const group = DOMUtils.createElement('div', 'ldesign-calendar-form-group')
    
    const labelEl = DOMUtils.createElement('label', 'ldesign-calendar-form-label')
    labelEl.textContent = label
    
    const input = DOMUtils.createElement(
      type === 'textarea' ? 'textarea' : 'input',
      type === 'textarea' ? 'ldesign-calendar-form-textarea' : 'ldesign-calendar-form-input'
    ) as HTMLInputElement | HTMLTextAreaElement
    
    if (type !== 'textarea') {
      (input as HTMLInputElement).type = type
    }
    
    // 设置属性
    Object.keys(attrs).forEach(key => {
      input.setAttribute(key, attrs[key])
    })
    
    // 设置初始值
    const value = this.formData[name as keyof CalendarEvent]
    if (value !== undefined) {
      if (type === 'datetime-local' && value instanceof Date) {
        input.value = dayjs(value).format('YYYY-MM-DDTHH:mm')
      } else {
        input.value = String(value)
      }
    }
    
    // 绑定事件
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      let val: any = target.value
      
      if (type === 'datetime-local') {
        val = new Date(val)
      }
      
      ;(this.formData as any)[name] = val
    })
    
    group.appendChild(labelEl)
    group.appendChild(input)
    
    return group
  }

  /**
   * 创建复选框组
   */
  private createCheckboxGroup(label: string, name: string): HTMLElement {
    const group = DOMUtils.createElement('div', 'ldesign-calendar-form-group')
    
    const labelEl = DOMUtils.createElement('label', 'ldesign-calendar-form-label')
    
    const checkbox = DOMUtils.createElement('input') as HTMLInputElement
    checkbox.type = 'checkbox'
    checkbox.checked = Boolean(this.formData[name as keyof CalendarEvent])
    
    checkbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      ;(this.formData as any)[name] = target.checked
    })
    
    labelEl.appendChild(checkbox)
    labelEl.appendChild(document.createTextNode(` ${label}`))
    
    group.appendChild(labelEl)
    
    return group
  }

  /**
   * 创建选择框组
   */
  private createSelectGroup(label: string, name: string, options: Array<{value: string, label: string}>): HTMLElement {
    const group = DOMUtils.createElement('div', 'ldesign-calendar-form-group')
    
    const labelEl = DOMUtils.createElement('label', 'ldesign-calendar-form-label')
    labelEl.textContent = label
    
    const select = DOMUtils.createElement('select', 'ldesign-calendar-form-select') as HTMLSelectElement
    
    options.forEach(option => {
      const optionEl = DOMUtils.createElement('option') as HTMLOptionElement
      optionEl.value = option.value
      optionEl.textContent = option.label
      
      if (this.formData[name as keyof CalendarEvent] === option.value) {
        optionEl.selected = true
      }
      
      select.appendChild(optionEl)
    })
    
    select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement
      ;(this.formData as any)[name] = target.value
    })
    
    group.appendChild(labelEl)
    group.appendChild(select)
    
    return group
  }

  /**
   * 创建颜色选择组
   */
  private createColorGroup(label: string, name: string): HTMLElement {
    const group = DOMUtils.createElement('div', 'ldesign-calendar-form-group')
    
    const labelEl = DOMUtils.createElement('label', 'ldesign-calendar-form-label')
    labelEl.textContent = label
    
    const colorInput = DOMUtils.createElement('input', 'ldesign-calendar-form-input') as HTMLInputElement
    colorInput.type = 'color'
    colorInput.value = String(this.formData[name as keyof CalendarEvent] || '#722ED1')
    
    colorInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      ;(this.formData as any)[name] = target.value
    })
    
    group.appendChild(labelEl)
    group.appendChild(colorInput)
    
    return group
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.overlay) return
    
    // 点击遮罩层关闭
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.handleCancel()
      }
    })
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleCancel()
      }
    })
  }

  /**
   * 处理保存
   */
  private handleSave(): void {
    if (!this.validateForm()) return
    
    const event: CalendarEvent = {
      id: this.formData.id || `event-${Date.now()}`,
      title: this.formData.title!,
      description: this.formData.description,
      start: this.formData.start!,
      end: this.formData.end!,
      allDay: this.formData.allDay || false,
      color: this.formData.color || '#722ED1',
      category: this.formData.category || 'other'
    }
    
    this.options?.onSave?.(event)
    this.hide()
  }

  /**
   * 处理取消
   */
  private handleCancel(): void {
    this.options?.onCancel?.()
    this.hide()
  }

  /**
   * 处理删除
   */
  private handleDelete(): void {
    if (this.options?.mode === 'edit' && this.options.event) {
      this.options.onDelete?.(this.options.event)
    }
    this.hide()
  }

  /**
   * 验证表单
   */
  private validateForm(): boolean {
    if (!this.formData.title?.trim()) {
      alert('请输入日程标题')
      return false
    }
    
    if (!this.formData.start || !this.formData.end) {
      alert('请设置开始和结束时间')
      return false
    }
    
    if (this.formData.start >= this.formData.end) {
      alert('结束时间必须晚于开始时间')
      return false
    }
    
    return true
  }
}
