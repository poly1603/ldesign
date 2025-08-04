/**
 * 表单渲染器 - 负责渲染表单项和管理DOM
 */

import type {
  FormItemConfig,
  FormConfig,
  ItemPosition,
  DisplayConfig,
  FormState,
  ValidationRule,
} from '../types'
import {
  createElement,
  addClass,
  removeClass,
  setStyle,
  setAttributes,
  removeAllChildren,
  insertHTML,
  addEventListener,
  removeEventListener,
} from '../utils/dom'
import { EventEmitter } from '../utils/event-emitter'

export interface FormRendererOptions {
  /** 容器元素 */
  container: HTMLElement
  /** 表单配置 */
  config: FormConfig
  /** 是否只读模式 */
  readonly?: boolean
  /** 自定义渲染器 */
  customRenderers?: Map<string, FormItemRenderer>
}

export interface FormItemRenderer {
  render(item: FormItemConfig, position: ItemPosition, state: any): HTMLElement
  update?(element: HTMLElement, item: FormItemConfig, state: any): void
  destroy?(element: HTMLElement): void
}

export interface RenderContext {
  readonly: boolean
  disabled: boolean
  labelPosition: 'top' | 'left' | 'right'
  showLabel: boolean
  showRequired: boolean
  showError: boolean
  compact: boolean
}

export class FormRenderer extends EventEmitter {
  private container: HTMLElement
  private config: FormConfig
  private context: RenderContext
  private renderedItems = new Map<string, HTMLElement>()
  private itemPositions = new Map<string, ItemPosition>()
  private formState: FormState = { values: {}, errors: {}, touched: {} }
  private customRenderers = new Map<string, FormItemRenderer>()
  private eventListeners = new Map<string, Array<() => void>>()

  constructor(options: FormRendererOptions) {
    super()
    this.container = options.container
    this.config = options.config
    this.context = this.createRenderContext(options)
    
    if (options.customRenderers) {
      this.customRenderers = new Map(options.customRenderers)
    }
    
    this.initializeContainer()
  }

  /**
   * 创建渲染上下文
   */
  private createRenderContext(options: FormRendererOptions): RenderContext {
    const display = this.config.display || {}
    
    return {
      readonly: options.readonly ?? false,
      disabled: false,
      labelPosition: display.labelPosition ?? 'top',
      showLabel: display.showLabel ?? true,
      showRequired: display.showRequired ?? true,
      showError: display.showError ?? true,
      compact: display.compact ?? false,
    }
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    addClass(this.container, 'adaptive-form')
    setStyle(this.container, {
      position: 'relative',
      width: '100%',
    })
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<FormConfig>): void {
    this.config = { ...this.config, ...config }
    this.context = this.createRenderContext({ 
      container: this.container, 
      config: this.config,
      readonly: this.context.readonly,
    })
    this.renderAll()
  }

  /**
   * 更新表单项位置
   */
  updateItemPositions(positions: Map<string, ItemPosition>): void {
    this.itemPositions = new Map(positions)
    this.updateLayout()
  }

  /**
   * 渲染所有表单项
   */
  renderAll(): void {
    // 清除现有内容
    removeAllChildren(this.container)
    this.renderedItems.clear()
    this.clearEventListeners()
    
    // 渲染表单项
    this.config.items.forEach(item => {
      if (item.visible !== false) {
        this.renderItem(item)
      }
    })
    
    // 更新布局
    this.updateLayout()
  }

  /**
   * 渲染单个表单项
   */
  renderItem(item: FormItemConfig): HTMLElement {
    const position = this.itemPositions.get(item.key)
    if (!position) {
      throw new Error(`Position not found for item: ${item.key}`)
    }
    
    // 使用自定义渲染器或默认渲染器
    const renderer = this.customRenderers.get(item.type) || this.getDefaultRenderer(item.type)
    const element = renderer.render(item, position, this.getItemState(item.key))
    
    // 设置基本样式和属性
    this.setupItemElement(element, item, position)
    
    // 添加到容器
    this.container.appendChild(element)
    this.renderedItems.set(item.key, element)
    
    // 绑定事件
    this.bindItemEvents(element, item)
    
    return element
  }

  /**
   * 设置表单项元素
   */
  private setupItemElement(
    element: HTMLElement,
    item: FormItemConfig,
    position: ItemPosition
  ): void {
    // 设置基本类名
    addClass(element, 'form-item')
    addClass(element, `form-item-${item.type}`)
    
    if (item.required) {
      addClass(element, 'form-item-required')
    }
    
    if (this.context.readonly || item.readonly) {
      addClass(element, 'form-item-readonly')
    }
    
    if (this.context.disabled || item.disabled) {
      addClass(element, 'form-item-disabled')
    }
    
    // 设置位置样式
    setStyle(element, {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
    })
    
    // 设置属性
    setAttributes(element, {
      'data-key': item.key,
      'data-type': item.type,
      'data-row': position.row.toString(),
      'data-col': position.col.toString(),
      'data-span': position.span.toString(),
    })
  }

  /**
   * 获取默认渲染器
   */
  private getDefaultRenderer(type: string): FormItemRenderer {
    switch (type) {
      case 'input':
        return this.createInputRenderer()
      case 'textarea':
        return this.createTextareaRenderer()
      case 'select':
        return this.createSelectRenderer()
      case 'checkbox':
        return this.createCheckboxRenderer()
      case 'radio':
        return this.createRadioRenderer()
      case 'switch':
        return this.createSwitchRenderer()
      case 'date':
        return this.createDateRenderer()
      case 'time':
        return this.createTimeRenderer()
      case 'datetime':
        return this.createDateTimeRenderer()
      default:
        return this.createInputRenderer()
    }
  }

  /**
   * 创建输入框渲染器
   */
  private createInputRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        // 标签
        if (this.context.showLabel && item.label) {
          const label = this.createLabel(item)
          wrapper.appendChild(label)
        }
        
        // 输入框
        const input = createElement('input', 'form-input') as HTMLInputElement
        input.type = item.inputType || 'text'
        input.placeholder = item.placeholder || ''
        input.value = state || ''
        
        if (item.required) {
          input.required = true
        }
        
        if (this.context.readonly || item.readonly) {
          input.readOnly = true
        }
        
        if (this.context.disabled || item.disabled) {
          input.disabled = true
        }
        
        wrapper.appendChild(input)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const input = element.querySelector('.form-input') as HTMLInputElement
        if (input && input.value !== state) {
          input.value = state || ''
        }
      },
    }
  }

  /**
   * 创建文本域渲染器
   */
  private createTextareaRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        // 标签
        if (this.context.showLabel && item.label) {
          const label = this.createLabel(item)
          wrapper.appendChild(label)
        }
        
        // 文本域
        const textarea = createElement('textarea', 'form-textarea') as HTMLTextAreaElement
        textarea.placeholder = item.placeholder || ''
        textarea.value = state || ''
        textarea.rows = item.rows || 3
        
        if (item.required) {
          textarea.required = true
        }
        
        if (this.context.readonly || item.readonly) {
          textarea.readOnly = true
        }
        
        if (this.context.disabled || item.disabled) {
          textarea.disabled = true
        }
        
        wrapper.appendChild(textarea)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const textarea = element.querySelector('.form-textarea') as HTMLTextAreaElement
        if (textarea && textarea.value !== state) {
          textarea.value = state || ''
        }
      },
    }
  }

  /**
   * 创建选择框渲染器
   */
  private createSelectRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        // 标签
        if (this.context.showLabel && item.label) {
          const label = this.createLabel(item)
          wrapper.appendChild(label)
        }
        
        // 选择框
        const select = createElement('select', 'form-select') as HTMLSelectElement
        
        // 添加选项
        if (item.options) {
          item.options.forEach(option => {
            const optionElement = createElement('option') as HTMLOptionElement
            optionElement.value = option.value
            optionElement.textContent = option.label
            
            if (option.value === state) {
              optionElement.selected = true
            }
            
            select.appendChild(optionElement)
          })
        }
        
        if (item.required) {
          select.required = true
        }
        
        if (this.context.disabled || item.disabled) {
          select.disabled = true
        }
        
        wrapper.appendChild(select)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const select = element.querySelector('.form-select') as HTMLSelectElement
        if (select && select.value !== state) {
          select.value = state || ''
        }
      },
    }
  }

  /**
   * 创建复选框渲染器
   */
  private createCheckboxRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        const label = createElement('label', 'form-checkbox-label')
        
        // 复选框
        const checkbox = createElement('input', 'form-checkbox') as HTMLInputElement
        checkbox.type = 'checkbox'
        checkbox.checked = Boolean(state)
        
        if (this.context.disabled || item.disabled) {
          checkbox.disabled = true
        }
        
        label.appendChild(checkbox)
        
        // 标签文本
        if (item.label) {
          const labelText = createElement('span', 'form-checkbox-text')
          labelText.textContent = item.label
          label.appendChild(labelText)
        }
        
        wrapper.appendChild(label)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const checkbox = element.querySelector('.form-checkbox') as HTMLInputElement
        if (checkbox && checkbox.checked !== Boolean(state)) {
          checkbox.checked = Boolean(state)
        }
      },
    }
  }

  /**
   * 创建单选框渲染器
   */
  private createRadioRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        // 标签
        if (this.context.showLabel && item.label) {
          const label = this.createLabel(item)
          wrapper.appendChild(label)
        }
        
        // 单选框组
        const radioGroup = createElement('div', 'form-radio-group')
        
        if (item.options) {
          item.options.forEach(option => {
            const label = createElement('label', 'form-radio-label')
            
            const radio = createElement('input', 'form-radio') as HTMLInputElement
            radio.type = 'radio'
            radio.name = item.key
            radio.value = option.value
            radio.checked = option.value === state
            
            if (this.context.disabled || item.disabled) {
              radio.disabled = true
            }
            
            label.appendChild(radio)
            
            const labelText = createElement('span', 'form-radio-text')
            labelText.textContent = option.label
            label.appendChild(labelText)
            
            radioGroup.appendChild(label)
          })
        }
        
        wrapper.appendChild(radioGroup)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const radios = element.querySelectorAll('.form-radio') as NodeListOf<HTMLInputElement>
        radios.forEach(radio => {
          radio.checked = radio.value === state
        })
      },
    }
  }

  /**
   * 创建开关渲染器
   */
  private createSwitchRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        const label = createElement('label', 'form-switch-label')
        
        // 开关
        const switchInput = createElement('input', 'form-switch') as HTMLInputElement
        switchInput.type = 'checkbox'
        switchInput.checked = Boolean(state)
        
        if (this.context.disabled || item.disabled) {
          switchInput.disabled = true
        }
        
        label.appendChild(switchInput)
        
        // 标签文本
        if (item.label) {
          const labelText = createElement('span', 'form-switch-text')
          labelText.textContent = item.label
          label.appendChild(labelText)
        }
        
        wrapper.appendChild(label)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const switchInput = element.querySelector('.form-switch') as HTMLInputElement
        if (switchInput && switchInput.checked !== Boolean(state)) {
          switchInput.checked = Boolean(state)
        }
      },
    }
  }

  /**
   * 创建日期渲染器
   */
  private createDateRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        // 标签
        if (this.context.showLabel && item.label) {
          const label = this.createLabel(item)
          wrapper.appendChild(label)
        }
        
        // 日期输入框
        const input = createElement('input', 'form-date') as HTMLInputElement
        input.type = 'date'
        input.value = state || ''
        
        if (item.required) {
          input.required = true
        }
        
        if (this.context.readonly || item.readonly) {
          input.readOnly = true
        }
        
        if (this.context.disabled || item.disabled) {
          input.disabled = true
        }
        
        wrapper.appendChild(input)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const input = element.querySelector('.form-date') as HTMLInputElement
        if (input && input.value !== state) {
          input.value = state || ''
        }
      },
    }
  }

  /**
   * 创建时间渲染器
   */
  private createTimeRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        // 标签
        if (this.context.showLabel && item.label) {
          const label = this.createLabel(item)
          wrapper.appendChild(label)
        }
        
        // 时间输入框
        const input = createElement('input', 'form-time') as HTMLInputElement
        input.type = 'time'
        input.value = state || ''
        
        if (item.required) {
          input.required = true
        }
        
        if (this.context.readonly || item.readonly) {
          input.readOnly = true
        }
        
        if (this.context.disabled || item.disabled) {
          input.disabled = true
        }
        
        wrapper.appendChild(input)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const input = element.querySelector('.form-time') as HTMLInputElement
        if (input && input.value !== state) {
          input.value = state || ''
        }
      },
    }
  }

  /**
   * 创建日期时间渲染器
   */
  private createDateTimeRenderer(): FormItemRenderer {
    return {
      render: (item, position, state) => {
        const wrapper = createElement('div', 'form-item-wrapper')
        
        // 标签
        if (this.context.showLabel && item.label) {
          const label = this.createLabel(item)
          wrapper.appendChild(label)
        }
        
        // 日期时间输入框
        const input = createElement('input', 'form-datetime') as HTMLInputElement
        input.type = 'datetime-local'
        input.value = state || ''
        
        if (item.required) {
          input.required = true
        }
        
        if (this.context.readonly || item.readonly) {
          input.readOnly = true
        }
        
        if (this.context.disabled || item.disabled) {
          input.disabled = true
        }
        
        wrapper.appendChild(input)
        
        // 错误信息
        if (this.context.showError) {
          const error = this.createErrorElement(item.key)
          wrapper.appendChild(error)
        }
        
        return wrapper
      },
      
      update: (element, item, state) => {
        const input = element.querySelector('.form-datetime') as HTMLInputElement
        if (input && input.value !== state) {
          input.value = state || ''
        }
      },
    }
  }

  /**
   * 创建标签元素
   */
  private createLabel(item: FormItemConfig): HTMLElement {
    const label = createElement('label', 'form-label')
    label.textContent = item.label || ''
    
    if (item.required && this.context.showRequired) {
      const required = createElement('span', 'form-required')
      required.textContent = '*'
      label.appendChild(required)
    }
    
    return label
  }

  /**
   * 创建错误信息元素
   */
  private createErrorElement(key: string): HTMLElement {
    const error = createElement('div', 'form-error')
    error.setAttribute('data-key', key)
    
    const errorMessage = this.formState.errors[key]
    if (errorMessage) {
      error.textContent = errorMessage
      addClass(error, 'form-error-visible')
    }
    
    return error
  }

  /**
   * 绑定表单项事件
   */
  private bindItemEvents(element: HTMLElement, item: FormItemConfig): void {
    const input = element.querySelector('input, select, textarea') as HTMLInputElement
    if (!input) return
    
    const listeners: Array<() => void> = []
    
    // 值变化事件
    const handleChange = () => {
      const value = this.getInputValue(input, item.type)
      this.updateItemState(item.key, value)
      this.emit('change', { key: item.key, value, item })
    }
    
    const handleInput = () => {
      const value = this.getInputValue(input, item.type)
      this.updateItemState(item.key, value)
      this.emit('input', { key: item.key, value, item })
    }
    
    // 焦点事件
    const handleFocus = () => {
      addClass(element, 'form-item-focused')
      this.emit('focus', { key: item.key, item })
    }
    
    const handleBlur = () => {
      removeClass(element, 'form-item-focused')
      this.markAsTouched(item.key)
      this.emit('blur', { key: item.key, item })
    }
    
    // 绑定事件
    listeners.push(
      addEventListener(input, 'change', handleChange),
      addEventListener(input, 'input', handleInput),
      addEventListener(input, 'focus', handleFocus),
      addEventListener(input, 'blur', handleBlur)
    )
    
    // 存储事件监听器
    this.eventListeners.set(item.key, listeners)
  }

  /**
   * 获取输入值
   */
  private getInputValue(input: HTMLInputElement, type: string): any {
    switch (type) {
      case 'checkbox':
      case 'switch':
        return input.checked
      case 'radio':
        const radioGroup = input.closest('.form-radio-group')
        if (radioGroup) {
          const checked = radioGroup.querySelector('input:checked') as HTMLInputElement
          return checked ? checked.value : ''
        }
        return input.value
      default:
        return input.value
    }
  }

  /**
   * 更新布局
   */
  private updateLayout(): void {
    this.itemPositions.forEach((position, key) => {
      const element = this.renderedItems.get(key)
      if (element) {
        setStyle(element, {
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.width}px`,
          height: `${position.height}px`,
        })
        
        // 更新可见性
        if (position.visible) {
          removeClass(element, 'form-item-hidden')
        } else {
          addClass(element, 'form-item-hidden')
        }
      }
    })
  }

  /**
   * 更新表单项状态
   */
  updateItemState(key: string, value: any): void {
    this.formState.values[key] = value
    
    // 更新渲染的元素
    const element = this.renderedItems.get(key)
    const item = this.config.items.find(item => item.key === key)
    
    if (element && item) {
      const renderer = this.customRenderers.get(item.type) || this.getDefaultRenderer(item.type)
      if (renderer.update) {
        renderer.update(element, item, value)
      }
    }
  }

  /**
   * 获取表单项状态
   */
  getItemState(key: string): any {
    return this.formState.values[key]
  }

  /**
   * 标记为已触摸
   */
  markAsTouched(key: string): void {
    this.formState.touched[key] = true
  }

  /**
   * 设置错误信息
   */
  setError(key: string, error: string | null): void {
    if (error) {
      this.formState.errors[key] = error
    } else {
      delete this.formState.errors[key]
    }
    
    // 更新错误显示
    const element = this.renderedItems.get(key)
    if (element) {
      const errorElement = element.querySelector('.form-error') as HTMLElement
      if (errorElement) {
        if (error) {
          errorElement.textContent = error
          addClass(errorElement, 'form-error-visible')
        } else {
          errorElement.textContent = ''
          removeClass(errorElement, 'form-error-visible')
        }
      }
    }
  }

  /**
   * 设置表单项可见性
   */
  setItemVisible(key: string, visible: boolean): void {
    const element = this.renderedItems.get(key)
    if (element) {
      if (visible) {
        removeClass(element, 'form-item-hidden')
      } else {
        addClass(element, 'form-item-hidden')
      }
    }
  }

  /**
   * 设置表单项禁用状态
   */
  setItemDisabled(key: string, disabled: boolean): void {
    const element = this.renderedItems.get(key)
    if (element) {
      const input = element.querySelector('input, select, textarea') as HTMLInputElement
      if (input) {
        input.disabled = disabled
      }
      
      if (disabled) {
        addClass(element, 'form-item-disabled')
      } else {
        removeClass(element, 'form-item-disabled')
      }
    }
  }

  /**
   * 获取表单状态
   */
  getFormState(): FormState {
    return { ...this.formState }
  }

  /**
   * 设置表单状态
   */
  setFormState(state: Partial<FormState>): void {
    if (state.values) {
      Object.assign(this.formState.values, state.values)
    }
    
    if (state.errors) {
      Object.assign(this.formState.errors, state.errors)
    }
    
    if (state.touched) {
      Object.assign(this.formState.touched, state.touched)
    }
    
    // 更新渲染
    this.updateRenderedItems()
  }

  /**
   * 更新渲染的表单项
   */
  private updateRenderedItems(): void {
    this.renderedItems.forEach((element, key) => {
      const item = this.config.items.find(item => item.key === key)
      if (item) {
        const value = this.formState.values[key]
        const error = this.formState.errors[key]
        
        // 更新值
        const renderer = this.customRenderers.get(item.type) || this.getDefaultRenderer(item.type)
        if (renderer.update) {
          renderer.update(element, item, value)
        }
        
        // 更新错误
        this.setError(key, error)
      }
    })
  }

  /**
   * 清除事件监听器
   */
  private clearEventListeners(): void {
    this.eventListeners.forEach(listeners => {
      listeners.forEach(removeListener => removeListener())
    })
    this.eventListeners.clear()
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clearEventListeners()
    removeAllChildren(this.container)
    this.renderedItems.clear()
    this.itemPositions.clear()
    this.removeAllListeners()
  }
}

/**
 * 创建表单渲染器
 */
export function createFormRenderer(options: FormRendererOptions): FormRenderer {
  return new FormRenderer(options)
}