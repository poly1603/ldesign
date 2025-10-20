/**
 * UI组件工厂
 * 提供统一的组件创建方法，减少重复代码
 */

import { getIconManager } from '../../icons/IconManager'
import { getI18n } from '../../i18n'
import type { IconRenderOptions } from '../../icons/types'

/**
 * 按钮类型
 */
export type ButtonType = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'link' | 'text'

/**
 * 按钮选项
 */
export interface ButtonOptions {
  type?: ButtonType
  label?: string
  icon?: string
  iconOptions?: IconRenderOptions
  title?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
  onClick?: (e: MouseEvent) => void
}

/**
 * 输入框选项
 */
export interface InputOptions {
  type?: string
  placeholder?: string
  value?: string
  className?: string
  disabled?: boolean
  required?: boolean
  onChange?: (value: string) => void
}

/**
 * 下拉选项项
 */
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  icon?: string
}

/**
 * 下拉选项
 */
export interface SelectOptions {
  options: SelectOption[]
  value?: string | number
  placeholder?: string
  className?: string
  disabled?: boolean
  onChange?: (value: string | number) => void
}

/**
 * 对话框按钮
 */
export interface DialogButton {
  id: string
  label: string
  type?: ButtonType
  onClick?: () => void | Promise<void>
}

/**
 * 对话框选项
 */
export interface DialogOptions {
  title: string
  content?: string | HTMLElement
  buttons?: DialogButton[]
  closeOnOverlay?: boolean
  className?: string
  width?: string
  height?: string
}

/**
 * UI组件工厂类
 */
export class ComponentFactory {
  private iconManager = getIconManager()
  private i18n = getI18n()
  
  /**
   * 创建按钮
   */
  createButton(options: ButtonOptions): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = this.getButtonClassName(options)
    
    if (options.title) {
      button.title = options.title
    }
    
    if (options.disabled) {
      button.disabled = true
    }
    
    // 按钮内容容器
    const content = document.createElement('span')
    content.className = 'btn-content'
    
    // 添加图标
    if (options.icon) {
      const iconEl = this.iconManager.createIconElement(options.icon, {
        size: this.getIconSize(options.size),
        ...options.iconOptions
      })
      content.appendChild(iconEl)
    }
    
    // 添加文本
    if (options.label) {
      const label = document.createElement('span')
      label.className = 'btn-label'
      label.textContent = options.label
      content.appendChild(label)
    }
    
    button.appendChild(content)
    
    // 添加加载状态
    if (options.loading) {
      this.setButtonLoading(button, true)
    }
    
    // 添加点击事件
    if (options.onClick) {
      button.addEventListener('click', options.onClick)
    }
    
    // 应用样式
    this.applyButtonStyles(button, options)
    
    return button
  }
  
  /**
   * 创建图标按钮
   */
  createIconButton(icon: string, options: Partial<ButtonOptions> = {}): HTMLButtonElement {
    return this.createButton({
      icon,
      type: options.type || 'text',
      ...options
    })
  }
  
  /**
   * 创建输入框
   */
  createInput(options: InputOptions): HTMLInputElement {
    const input = document.createElement('input')
    input.type = options.type || 'text'
    input.className = `input ${options.className || ''}`
    
    if (options.placeholder) {
      input.placeholder = options.placeholder
    }
    
    if (options.value) {
      input.value = options.value
    }
    
    if (options.disabled) {
      input.disabled = true
    }
    
    if (options.required) {
      input.required = true
    }
    
    if (options.onChange) {
      input.addEventListener('input', (e) => {
        options.onChange!((e.target as HTMLInputElement).value)
      })
    }
    
    // 应用样式
    this.applyInputStyles(input)
    
    return input
  }
  
  /**
   * 创建文本域
   */
  createTextarea(options: InputOptions & { rows?: number }): HTMLTextAreaElement {
    const textarea = document.createElement('textarea')
    textarea.className = `textarea ${options.className || ''}`
    
    if (options.placeholder) {
      textarea.placeholder = options.placeholder
    }
    
    if (options.value) {
      textarea.value = options.value
    }
    
    if (options.disabled) {
      textarea.disabled = true
    }
    
    if (options.required) {
      textarea.required = true
    }
    
    if (options.rows) {
      textarea.rows = options.rows
    }
    
    if (options.onChange) {
      textarea.addEventListener('input', (e) => {
        options.onChange!((e.target as HTMLTextAreaElement).value)
      })
    }
    
    // 应用样式
    this.applyTextareaStyles(textarea)
    
    return textarea
  }
  
  /**
   * 创建下拉选择框
   */
  createSelect(options: SelectOptions): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = `select ${options.className || ''}`
    
    if (options.placeholder) {
      const placeholderOption = document.createElement('option')
      placeholderOption.value = ''
      placeholderOption.textContent = options.placeholder
      placeholderOption.disabled = true
      placeholderOption.selected = !options.value
      select.appendChild(placeholderOption)
    }
    
    options.options.forEach(opt => {
      const option = document.createElement('option')
      option.value = String(opt.value)
      option.textContent = opt.label
      
      if (opt.disabled) {
        option.disabled = true
      }
      
      if (opt.value === options.value) {
        option.selected = true
      }
      
      select.appendChild(option)
    })
    
    if (options.disabled) {
      select.disabled = true
    }
    
    if (options.onChange) {
      select.addEventListener('change', (e) => {
        const value = (e.target as HTMLSelectElement).value
        options.onChange!(isNaN(Number(value)) ? value : Number(value))
      })
    }
    
    // 应用样式
    this.applySelectStyles(select)
    
    return select
  }
  
  /**
   * 创建复选框
   */
  createCheckbox(label: string, checked: boolean = false, onChange?: (checked: boolean) => void): HTMLLabelElement {
    const container = document.createElement('label')
    container.className = 'checkbox-container'
    
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.className = 'checkbox'
    input.checked = checked
    
    if (onChange) {
      input.addEventListener('change', (e) => {
        onChange((e.target as HTMLInputElement).checked)
      })
    }
    
    const labelSpan = document.createElement('span')
    labelSpan.className = 'checkbox-label'
    labelSpan.textContent = label
    
    container.appendChild(input)
    container.appendChild(labelSpan)
    
    // 应用样式
    this.applyCheckboxStyles(container)
    
    return container
  }
  
  /**
   * 创建分隔线
   */
  createDivider(className: string = ''): HTMLDivElement {
    const divider = document.createElement('div')
    divider.className = `divider ${className}`
    divider.style.cssText = `
      height: 1px;
      background: var(--editor-color-border, #e5e7eb);
      margin: 8px 0;
    `
    return divider
  }
  
  /**
   * 创建标签
   */
  createLabel(text: string, htmlFor?: string): HTMLLabelElement {
    const label = document.createElement('label')
    label.className = 'label'
    label.textContent = text
    
    if (htmlFor) {
      label.htmlFor = htmlFor
    }
    
    label.style.cssText = `
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 500;
      color: var(--editor-color-text-primary, #1f2937);
    `
    
    return label
  }
  
  /**
   * 创建表单组
   */
  createFormGroup(label: string, input: HTMLElement): HTMLDivElement {
    const group = document.createElement('div')
    group.className = 'form-group'
    group.style.cssText = `
      margin-bottom: 16px;
    `
    
    const labelEl = this.createLabel(label)
    group.appendChild(labelEl)
    group.appendChild(input)
    
    return group
  }
  
  /**
   * 创建卡片
   */
  createCard(options: { title?: string; content?: HTMLElement | string; className?: string }): HTMLDivElement {
    const card = document.createElement('div')
    card.className = `card ${options.className || ''}`
    
    card.style.cssText = `
      background: var(--editor-color-background-paper, #f9fafb);
      border: 1px solid var(--editor-color-border, #e5e7eb);
      border-radius: 8px;
      padding: 16px;
    `
    
    if (options.title) {
      const title = document.createElement('h3')
      title.className = 'card-title'
      title.textContent = options.title
      title.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--editor-color-text-primary, #1f2937);
      `
      card.appendChild(title)
    }
    
    if (options.content) {
      const content = document.createElement('div')
      content.className = 'card-content'
      
      if (typeof options.content === 'string') {
        content.textContent = options.content
      } else {
        content.appendChild(options.content)
      }
      
      card.appendChild(content)
    }
    
    return card
  }
  
  /**
   * 获取按钮类名
   */
  private getButtonClassName(options: ButtonOptions): string {
    const classes = ['btn']
    
    if (options.type) {
      classes.push(`btn-${options.type}`)
    }
    
    if (options.size) {
      classes.push(`btn-${options.size}`)
    }
    
    if (options.loading) {
      classes.push('btn-loading')
    }
    
    if (options.className) {
      classes.push(options.className)
    }
    
    return classes.join(' ')
  }
  
  /**
   * 获取图标大小
   */
  private getIconSize(size?: string): number {
    const sizes = {
      small: 14,
      medium: 16,
      large: 20
    }
    return sizes[size as keyof typeof sizes] || sizes.medium
  }
  
  /**
   * 设置按钮加载状态
   */
  setButtonLoading(button: HTMLButtonElement, loading: boolean): void {
    if (loading) {
      button.classList.add('btn-loading')
      button.disabled = true
      
      // 添加加载图标
      const spinner = this.iconManager.createIconElement('refresh-cw', {
        size: 16,
        spinning: true,
        className: 'btn-spinner'
      })
      
      const content = button.querySelector('.btn-content')
      if (content) {
        content.insertBefore(spinner, content.firstChild)
      }
    } else {
      button.classList.remove('btn-loading')
      button.disabled = false
      
      // 移除加载图标
      const spinner = button.querySelector('.btn-spinner')
      if (spinner) {
        spinner.remove()
      }
    }
  }
  
  /**
   * 应用按钮样式
   */
  private applyButtonStyles(button: HTMLButtonElement, options: ButtonOptions): void {
    const typeStyles: Record<ButtonType, string> = {
      primary: `
        background: var(--editor-color-primary, #3b82f6);
        color: white;
        border: none;
      `,
      secondary: `
        background: var(--editor-color-background-paper, #f3f4f6);
        color: var(--editor-color-text-primary, #374151);
        border: 1px solid var(--editor-color-border, #d1d5db);
      `,
      danger: `
        background: var(--editor-color-error, #ef4444);
        color: white;
        border: none;
      `,
      success: `
        background: var(--editor-color-success, #10b981);
        color: white;
        border: none;
      `,
      warning: `
        background: var(--editor-color-warning, #f59e0b);
        color: white;
        border: none;
      `,
      link: `
        background: none;
        color: var(--editor-color-primary, #3b82f6);
        border: none;
        padding: 8px 12px;
      `,
      text: `
        background: none;
        color: var(--editor-color-text-primary, #374151);
        border: none;
        padding: 8px 12px;
      `
    }
    
    const sizeStyles = {
      small: 'padding: 6px 12px; font-size: 12px;',
      medium: 'padding: 8px 16px; font-size: 14px;',
      large: 'padding: 10px 20px; font-size: 16px;'
    }
    
    button.style.cssText = `
      ${typeStyles[options.type || 'secondary']}
      ${sizeStyles[options.size || 'medium']}
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    `
  }
  
  /**
   * 应用输入框样式
   */
  private applyInputStyles(input: HTMLInputElement): void {
    input.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--editor-color-border, #d1d5db);
      border-radius: 6px;
      font-size: 14px;
      color: var(--editor-color-text-primary, #1f2937);
      background: var(--editor-color-background, #ffffff);
      transition: all 0.2s;
    `
    
    input.addEventListener('focus', () => {
      input.style.outline = 'none'
      input.style.borderColor = 'var(--editor-color-primary, #3b82f6)'
      input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
    })
    
    input.addEventListener('blur', () => {
      input.style.borderColor = 'var(--editor-color-border, #d1d5db)'
      input.style.boxShadow = 'none'
    })
  }
  
  /**
   * 应用文本域样式
   */
  private applyTextareaStyles(textarea: HTMLTextAreaElement): void {
    textarea.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--editor-color-border, #d1d5db);
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      color: var(--editor-color-text-primary, #1f2937);
      background: var(--editor-color-background, #ffffff);
      transition: all 0.2s;
      resize: vertical;
    `
    
    textarea.addEventListener('focus', () => {
      textarea.style.outline = 'none'
      textarea.style.borderColor = 'var(--editor-color-primary, #3b82f6)'
      textarea.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
    })
    
    textarea.addEventListener('blur', () => {
      textarea.style.borderColor = 'var(--editor-color-border, #d1d5db)'
      textarea.style.boxShadow = 'none'
    })
  }
  
  /**
   * 应用下拉框样式
   */
  private applySelectStyles(select: HTMLSelectElement): void {
    select.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--editor-color-border, #d1d5db);
      border-radius: 6px;
      font-size: 14px;
      color: var(--editor-color-text-primary, #1f2937);
      background: var(--editor-color-background, #ffffff);
      cursor: pointer;
      transition: all 0.2s;
    `
    
    select.addEventListener('focus', () => {
      select.style.outline = 'none'
      select.style.borderColor = 'var(--editor-color-primary, #3b82f6)'
      select.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
    })
    
    select.addEventListener('blur', () => {
      select.style.borderColor = 'var(--editor-color-border, #d1d5db)'
      select.style.boxShadow = 'none'
    })
  }
  
  /**
   * 应用复选框样式
   */
  private applyCheckboxStyles(container: HTMLLabelElement): void {
    container.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    `
    
    const checkbox = container.querySelector('.checkbox') as HTMLInputElement
    if (checkbox) {
      checkbox.style.cssText = `
        width: 16px;
        height: 16px;
        cursor: pointer;
      `
    }
    
    const label = container.querySelector('.checkbox-label') as HTMLSpanElement
    if (label) {
      label.style.cssText = `
        font-size: 14px;
        color: var(--editor-color-text-primary, #1f2937);
      `
    }
  }
}

// 全局单例
let factoryInstance: ComponentFactory | null = null

/**
 * 获取组件工厂实例
 */
export function getComponentFactory(): ComponentFactory {
  if (!factoryInstance) {
    factoryInstance = new ComponentFactory()
  }
  return factoryInstance
}

/**
 * 便捷函数
 */
export function createButton(options: ButtonOptions): HTMLButtonElement {
  return getComponentFactory().createButton(options)
}

export function createIconButton(icon: string, options?: Partial<ButtonOptions>): HTMLButtonElement {
  return getComponentFactory().createIconButton(icon, options)
}

export function createInput(options: InputOptions): HTMLInputElement {
  return getComponentFactory().createInput(options)
}

export function createSelect(options: SelectOptions): HTMLSelectElement {
  return getComponentFactory().createSelect(options)
}

export function createCheckbox(label: string, checked?: boolean, onChange?: (checked: boolean) => void): HTMLLabelElement {
  return getComponentFactory().createCheckbox(label, checked, onChange)
}






