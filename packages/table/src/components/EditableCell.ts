/**
 * 可编辑单元格组件
 * 
 * 提供单元格的编辑功能，支持多种编辑器类型
 * 包括文本输入、数字输入、选择器、日期选择器等
 */

import type { TableRow, TableId, TableColumn } from '../types'
import { EventManager } from '../managers/EventManager'

/**
 * 编辑器类型
 */
export type EditorType = 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'custom'

/**
 * 编辑器配置
 */
export interface EditorConfig {
  /** 编辑器类型 */
  type: EditorType
  /** 选项列表（用于select类型） */
  options?: Array<{ label: string; value: any }>
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 自定义编辑器渲染函数 */
  render?: (value: any, onChange: (value: any) => void) => HTMLElement
  /** 编辑器属性 */
  props?: Record<string, any>
}

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 验证函数 */
  validator: (value: any) => boolean | string
  /** 错误消息 */
  message?: string
}

/**
 * 编辑事件数据
 */
export interface EditEventData<T = any> {
  /** 行数据 */
  row: T
  /** 列配置 */
  column: TableColumn<T>
  /** 原始值 */
  oldValue: any
  /** 新值 */
  newValue: any
  /** 行索引 */
  rowIndex: number
  /** 列索引 */
  columnIndex: number
}

/**
 * 可编辑单元格实现类
 */
export class EditableCell<T extends TableRow = TableRow> {
  /** 事件管理器 */
  private eventManager: EventManager

  /** 当前编辑的单元格 */
  private currentEditCell: HTMLElement | null = null

  /** 当前编辑器元素 */
  private currentEditor: HTMLElement | null = null

  /** 当前编辑的数据 */
  private currentEditData: EditEventData<T> | null = null

  /** 是否正在编辑 */
  private isEditing: boolean = false

  /**
   * 构造函数
   */
  constructor() {
    this.eventManager = new EventManager()
    this.bindGlobalEvents()
  }

  /**
   * 绑定全局事件
   * @private
   */
  private bindGlobalEvents(): void {
    // 点击其他地方时结束编辑
    document.addEventListener('click', (event) => {
      if (this.isEditing && this.currentEditCell && this.currentEditor) {
        const target = event.target as HTMLElement
        if (!this.currentEditCell.contains(target) && !this.currentEditor.contains(target)) {
          this.finishEdit()
        }
      }
    })

    // ESC键取消编辑
    document.addEventListener('keydown', (event) => {
      if (this.isEditing && event.key === 'Escape') {
        this.cancelEdit()
      }
    })
  }

  /**
   * 开始编辑单元格
   */
  startEdit(
    cell: HTMLElement,
    row: T,
    column: TableColumn<T>,
    rowIndex: number,
    columnIndex: number
  ): void {
    // 如果已经在编辑，先结束当前编辑
    if (this.isEditing) {
      this.finishEdit()
    }

    // 检查列是否可编辑
    if (!column.editable) {
      return
    }

    const currentValue = row[column.key]

    // 创建编辑数据
    this.currentEditData = {
      row,
      column,
      oldValue: currentValue,
      newValue: currentValue,
      rowIndex,
      columnIndex
    }

    this.currentEditCell = cell
    this.isEditing = true

    // 创建编辑器
    this.createEditor(cell, currentValue, column.editor || { type: 'text' })

    // 触发编辑开始事件
    this.eventManager.emit('edit-start', this.currentEditData)
  }

  /**
   * 创建编辑器
   * @private
   */
  private createEditor(cell: HTMLElement, value: any, config: EditorConfig): void {
    const editor = this.createEditorElement(value, config)

    if (!editor) return

    this.currentEditor = editor

    // 设置编辑器样式
    editor.style.position = 'absolute'
    editor.style.zIndex = '1000'
    editor.style.width = `${cell.offsetWidth}px`
    editor.style.height = `${cell.offsetHeight}px`
    editor.style.border = '2px solid var(--ldesign-brand-color)'
    editor.style.borderRadius = '4px'
    editor.style.padding = '4px 8px'
    editor.style.fontSize = '14px'
    editor.style.backgroundColor = 'white'
    editor.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'

    // 定位编辑器
    const cellRect = cell.getBoundingClientRect()
    editor.style.left = `${cellRect.left}px`
    editor.style.top = `${cellRect.top}px`

    // 添加到页面
    document.body.appendChild(editor)

    // 聚焦编辑器
    this.focusEditor(editor)

    // 绑定编辑器事件
    this.bindEditorEvents(editor, config)
  }

  /**
   * 创建编辑器元素
   * @private
   */
  private createEditorElement(value: any, config: EditorConfig): HTMLElement | null {
    switch (config.type) {
      case 'text':
        return this.createTextEditor(value, config)
      case 'number':
        return this.createNumberEditor(value, config)
      case 'select':
        return this.createSelectEditor(value, config)
      case 'date':
        return this.createDateEditor(value, config)
      case 'textarea':
        return this.createTextareaEditor(value, config)
      case 'checkbox':
        return this.createCheckboxEditor(value, config)
      case 'custom':
        return this.createCustomEditor(value, config)
      default:
        return this.createTextEditor(value, config)
    }
  }

  /**
   * 创建文本编辑器
   * @private
   */
  private createTextEditor(value: any, config: EditorConfig): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = value || ''

    // 应用配置属性
    if (config.props) {
      Object.assign(input, config.props)
    }

    return input
  }

  /**
   * 创建数字编辑器
   * @private
   */
  private createNumberEditor(value: any, config: EditorConfig): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'number'
    input.value = value || ''

    // 应用配置属性
    if (config.props) {
      Object.assign(input, config.props)
    }

    return input
  }

  /**
   * 创建选择器编辑器
   * @private
   */
  private createSelectEditor(value: any, config: EditorConfig): HTMLSelectElement {
    const select = document.createElement('select')

    // 添加选项
    if (config.options) {
      config.options.forEach(option => {
        const optionElement = document.createElement('option')
        optionElement.value = option.value
        optionElement.textContent = option.label
        optionElement.selected = option.value === value
        select.appendChild(optionElement)
      })
    }

    // 应用配置属性
    if (config.props) {
      Object.assign(select, config.props)
    }

    return select
  }

  /**
   * 创建日期编辑器
   * @private
   */
  private createDateEditor(value: any, config: EditorConfig): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'date'

    // 格式化日期值
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        input.value = date.toISOString().split('T')[0]
      }
    }

    // 应用配置属性
    if (config.props) {
      Object.assign(input, config.props)
    }

    return input
  }

  /**
   * 创建文本域编辑器
   * @private
   */
  private createTextareaEditor(value: any, config: EditorConfig): HTMLTextAreaElement {
    const textarea = document.createElement('textarea')
    textarea.value = value || ''
    textarea.style.resize = 'none'
    textarea.style.height = '80px'

    // 应用配置属性
    if (config.props) {
      Object.assign(textarea, config.props)
    }

    return textarea
  }

  /**
   * 创建复选框编辑器
   * @private
   */
  private createCheckboxEditor(value: any, config: EditorConfig): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = Boolean(value)
    input.style.width = '20px'
    input.style.height = '20px'

    // 应用配置属性
    if (config.props) {
      Object.assign(input, config.props)
    }

    return input
  }

  /**
   * 创建自定义编辑器
   * @private
   */
  private createCustomEditor(value: any, config: EditorConfig): HTMLElement | null {
    if (config.render) {
      return config.render(value, (newValue) => {
        if (this.currentEditData) {
          this.currentEditData.newValue = newValue
        }
      })
    }
    return null
  }

  /**
   * 聚焦编辑器
   * @private
   */
  private focusEditor(editor: HTMLElement): void {
    if (editor instanceof HTMLInputElement || editor instanceof HTMLTextAreaElement) {
      editor.focus()
      editor.select()
    } else if (editor instanceof HTMLSelectElement) {
      editor.focus()
    }
  }

  /**
   * 绑定编辑器事件
   * @private
   */
  private bindEditorEvents(editor: HTMLElement, config: EditorConfig): void {
    // Enter键确认编辑
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !(editor instanceof HTMLTextAreaElement)) {
        event.preventDefault()
        this.finishEdit()
      }
    })

    // 值变化时更新编辑数据
    editor.addEventListener('input', () => {
      if (this.currentEditData) {
        this.currentEditData.newValue = this.getEditorValue(editor)
      }
    })

    editor.addEventListener('change', () => {
      if (this.currentEditData) {
        this.currentEditData.newValue = this.getEditorValue(editor)
      }
    })
  }

  /**
   * 获取编辑器值
   * @private
   */
  private getEditorValue(editor: HTMLElement): any {
    if (editor instanceof HTMLInputElement) {
      if (editor.type === 'checkbox') {
        return editor.checked
      } else if (editor.type === 'number') {
        return editor.valueAsNumber || 0
      } else {
        return editor.value
      }
    } else if (editor instanceof HTMLSelectElement) {
      return editor.value
    } else if (editor instanceof HTMLTextAreaElement) {
      return editor.value
    }
    return null
  }

  /**
   * 完成编辑
   */
  finishEdit(): void {
    if (!this.isEditing || !this.currentEditData) {
      return
    }

    // 验证新值
    const isValid = this.validateValue(
      this.currentEditData.newValue,
      this.currentEditData.column.editor?.rules
    )

    if (!isValid) {
      return
    }

    // 触发编辑完成事件
    this.eventManager.emit('edit-finish', this.currentEditData)

    this.cleanup()
  }

  /**
   * 取消编辑
   */
  cancelEdit(): void {
    if (!this.isEditing || !this.currentEditData) {
      return
    }

    // 触发编辑取消事件
    this.eventManager.emit('edit-cancel', this.currentEditData)

    this.cleanup()
  }

  /**
   * 验证值
   * @private
   */
  private validateValue(value: any, rules?: ValidationRule[]): boolean {
    if (!rules || rules.length === 0) {
      return true
    }

    for (const rule of rules) {
      const result = rule.validator(value)
      if (result !== true) {
        const message = typeof result === 'string' ? result : rule.message || '验证失败'
        this.showValidationError(message)
        return false
      }
    }

    return true
  }

  /**
   * 显示验证错误
   * @private
   */
  private showValidationError(message: string): void {
    // 简单的错误提示，可以根据需要扩展
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message)
    } else {
      console.error('Validation Error:', message)
    }
  }

  /**
   * 清理编辑状态
   * @private
   */
  private cleanup(): void {
    if (this.currentEditor && this.currentEditor.parentNode) {
      this.currentEditor.parentNode.removeChild(this.currentEditor)
    }

    this.currentEditCell = null
    this.currentEditor = null
    this.currentEditData = null
    this.isEditing = false
  }

  /**
   * 获取当前编辑状态
   */
  isCurrentlyEditing(): boolean {
    return this.isEditing
  }

  /**
   * 获取当前编辑数据
   */
  getCurrentEditData(): EditEventData<T> | null {
    return this.currentEditData
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    this.eventManager.on(eventName, listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    this.eventManager.off(eventName, listener)
  }

  /**
   * 销毁可编辑单元格
   */
  destroy(): void {
    this.cleanup()
    this.eventManager.destroy()
  }
}
