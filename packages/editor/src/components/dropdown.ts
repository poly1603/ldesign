/**
 * 下拉菜单组件
 * 为字体大小、标题等提供下拉选择界面
 */

import { createElement, addClass, removeClass } from '../utils/dom-utils'

/**
 * 下拉选项
 */
export interface DropdownOption {
  /** 选项值 */
  value: string
  /** 显示文本 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式 */
  style?: Record<string, string>
}

/**
 * 下拉菜单配置
 */
export interface DropdownOptions {
  /** 选项列表 */
  options: DropdownOption[]
  /** 当前选中值 */
  value?: string
  /** 占位符 */
  placeholder?: string
  /** 是否可搜索 */
  searchable?: boolean
  /** 最大高度 */
  maxHeight?: number
  /** 选择回调 */
  onSelect?: (option: DropdownOption) => void
  /** 打开回调 */
  onOpen?: () => void
  /** 关闭回调 */
  onClose?: () => void
}

/**
 * 下拉菜单类
 */
export class Dropdown {
  /** 配置选项 */
  private options: Required<DropdownOptions>

  /** 容器元素 */
  private container: HTMLElement | null = null

  /** 触发按钮 */
  private trigger: HTMLElement | null = null

  /** 下拉面板 */
  private dropdown: HTMLElement | null = null

  /** 搜索输入框 */
  private searchInput: HTMLInputElement | null = null

  /** 选项容器 */
  private optionsContainer: HTMLElement | null = null

  /** 当前选中的选项 */
  private selectedOption: DropdownOption | null = null

  /** 是否已打开 */
  private isOpen = false

  /** 过滤后的选项 */
  private filteredOptions: DropdownOption[] = []

  /** 事件监听器清理函数 */
  private eventCleanupFunctions: Array<() => void> = []

  constructor(options: DropdownOptions) {
    this.options = {
      options: options.options || [],
      value: options.value || '',
      placeholder: options.placeholder || '请选择',
      searchable: options.searchable === true,
      maxHeight: options.maxHeight || 200,
      onSelect: options.onSelect || (() => {}),
      onOpen: options.onOpen || (() => {}),
      onClose: options.onClose || (() => {})
    }

    // 设置初始选中项
    this.selectedOption = this.options.options.find(opt => opt.value === this.options.value) || null
    this.filteredOptions = [...this.options.options]
  }

  /**
   * 渲染下拉菜单
   * @returns 下拉菜单DOM元素
   */
  render(): HTMLElement {
    this.container = createElement('div', {
      className: 'ldesign-dropdown'
    })

    this.renderTrigger()
    this.renderDropdown()
    this.bindEvents()

    return this.container
  }

  /**
   * 渲染触发按钮
   */
  private renderTrigger(): void {
    if (!this.container) return

    this.trigger = createElement('button', {
      className: 'ldesign-dropdown-trigger',
      type: 'button'
    })

    this.updateTriggerText()

    // 添加箭头图标
    const arrow = createElement('span', {
      className: 'ldesign-dropdown-arrow'
    })
    arrow.innerHTML = '▼'

    this.trigger.appendChild(arrow)
    this.container.appendChild(this.trigger)
  }

  /**
   * 渲染下拉面板
   */
  private renderDropdown(): void {
    if (!this.container) return

    this.dropdown = createElement('div', {
      className: 'ldesign-dropdown-panel'
    })

    this.dropdown.style.maxHeight = `${this.options.maxHeight}px`

    // 添加搜索框
    if (this.options.searchable) {
      this.renderSearchInput()
    }

    // 添加选项容器
    this.optionsContainer = createElement('div', {
      className: 'ldesign-dropdown-options'
    })

    this.renderOptions()

    this.dropdown.appendChild(this.optionsContainer)
    this.container.appendChild(this.dropdown)
  }

  /**
   * 渲染搜索输入框
   */
  private renderSearchInput(): void {
    if (!this.dropdown) return

    const searchContainer = createElement('div', {
      className: 'ldesign-dropdown-search'
    })

    this.searchInput = createElement('input', {
      type: 'text',
      className: 'ldesign-dropdown-search-input',
      placeholder: '搜索...'
    }) as HTMLInputElement

    this.searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.filterOptions(target.value)
    })

    searchContainer.appendChild(this.searchInput)
    this.dropdown.appendChild(searchContainer)
  }

  /**
   * 渲染选项列表
   */
  private renderOptions(): void {
    if (!this.optionsContainer) return

    // 清空现有选项
    this.optionsContainer.innerHTML = ''

    this.filteredOptions.forEach(option => {
      const optionElement = createElement('div', {
        className: 'ldesign-dropdown-option'
      })

      if (option.disabled) {
        addClass(optionElement, 'ldesign-dropdown-option-disabled')
      }

      if (this.selectedOption && option.value === this.selectedOption.value) {
        addClass(optionElement, 'ldesign-dropdown-option-selected')
      }

      // 设置文本内容
      optionElement.textContent = option.label

      // 应用自定义样式
      if (option.style) {
        Object.entries(option.style).forEach(([key, value]) => {
          optionElement.style.setProperty(key, value)
        })
      }

      // 绑定点击事件
      if (!option.disabled) {
        optionElement.addEventListener('click', () => {
          this.selectOption(option)
        })
      }

      this.optionsContainer.appendChild(optionElement)
    })

    // 如果没有匹配的选项，显示提示
    if (this.filteredOptions.length === 0) {
      const noOptionsElement = createElement('div', {
        className: 'ldesign-dropdown-no-options'
      })
      noOptionsElement.textContent = '没有找到匹配的选项'
      this.optionsContainer.appendChild(noOptionsElement)
    }
  }

  /**
   * 更新触发按钮文本
   */
  private updateTriggerText(): void {
    if (!this.trigger) return

    const textSpan = this.trigger.querySelector('.ldesign-dropdown-text') || 
      createElement('span', { className: 'ldesign-dropdown-text' })

    if (!this.trigger.contains(textSpan)) {
      this.trigger.insertBefore(textSpan, this.trigger.firstChild)
    }

    textSpan.textContent = this.selectedOption ? this.selectedOption.label : this.options.placeholder
  }

  /**
   * 过滤选项
   * @param searchText 搜索文本
   */
  private filterOptions(searchText: string): void {
    const lowerSearchText = searchText.toLowerCase()
    
    this.filteredOptions = this.options.options.filter(option =>
      option.label.toLowerCase().includes(lowerSearchText) ||
      option.value.toLowerCase().includes(lowerSearchText)
    )

    this.renderOptions()
  }

  /**
   * 选择选项
   * @param option 选择的选项
   */
  private selectOption(option: DropdownOption): void {
    this.selectedOption = option
    this.updateTriggerText()
    this.close()
    this.options.onSelect(option)
  }

  /**
   * 打开下拉菜单
   */
  open(): void {
    if (this.isOpen || !this.dropdown || !this.container) return

    this.isOpen = true
    addClass(this.container, 'ldesign-dropdown-open')
    
    // 重置搜索
    if (this.searchInput) {
      this.searchInput.value = ''
      this.filteredOptions = [...this.options.options]
      this.renderOptions()
      
      // 聚焦搜索框
      setTimeout(() => {
        this.searchInput?.focus()
      }, 10)
    }

    this.options.onOpen()
  }

  /**
   * 关闭下拉菜单
   */
  close(): void {
    if (!this.isOpen || !this.container) return

    this.isOpen = false
    removeClass(this.container, 'ldesign-dropdown-open')
    this.options.onClose()
  }

  /**
   * 切换下拉菜单状态
   */
  toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * 设置选中值
   * @param value 选项值
   */
  setValue(value: string): void {
    const option = this.options.options.find(opt => opt.value === value)
    if (option) {
      this.selectedOption = option
      this.updateTriggerText()
    }
  }

  /**
   * 获取选中值
   * @returns 当前选中的选项值
   */
  getValue(): string | null {
    return this.selectedOption ? this.selectedOption.value : null
  }

  /**
   * 获取选中选项
   * @returns 当前选中的选项
   */
  getSelectedOption(): DropdownOption | null {
    return this.selectedOption
  }

  /**
   * 更新选项列表
   * @param options 新的选项列表
   */
  updateOptions(options: DropdownOption[]): void {
    this.options.options = options
    this.filteredOptions = [...options]
    
    // 检查当前选中项是否还存在
    if (this.selectedOption && !options.find(opt => opt.value === this.selectedOption!.value)) {
      this.selectedOption = null
      this.updateTriggerText()
    }
    
    this.renderOptions()
  }

  /**
   * 绑定事件监听器
   */
  private bindEvents(): void {
    if (!this.trigger) return

    // 触发按钮点击事件
    const handleTriggerClick = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      this.toggle()
    }

    this.trigger.addEventListener('click', handleTriggerClick)

    // 点击外部关闭
    const handleDocumentClick = (e: Event) => {
      if (this.isOpen && this.container && !this.container.contains(e.target as Node)) {
        this.close()
      }
    }

    document.addEventListener('click', handleDocumentClick)

    // 键盘导航
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.isOpen) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          this.close()
          break
        case 'ArrowDown':
          e.preventDefault()
          this.navigateOptions(1)
          break
        case 'ArrowUp':
          e.preventDefault()
          this.navigateOptions(-1)
          break
        case 'Enter':
          e.preventDefault()
          this.selectHighlightedOption()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // 保存清理函数
    this.eventCleanupFunctions.push(
      () => this.trigger?.removeEventListener('click', handleTriggerClick),
      () => document.removeEventListener('click', handleDocumentClick),
      () => document.removeEventListener('keydown', handleKeyDown)
    )
  }

  /**
   * 导航选项（键盘）
   * @param direction 方向（1向下，-1向上）
   */
  private navigateOptions(direction: number): void {
    if (!this.optionsContainer) return

    const options = Array.from(this.optionsContainer.querySelectorAll('.ldesign-dropdown-option:not(.ldesign-dropdown-option-disabled)'))
    if (options.length === 0) return

    let currentIndex = -1
    const highlighted = this.optionsContainer.querySelector('.ldesign-dropdown-option-highlighted')
    
    if (highlighted) {
      currentIndex = options.indexOf(highlighted)
      removeClass(highlighted as HTMLElement, 'ldesign-dropdown-option-highlighted')
    }

    const newIndex = Math.max(0, Math.min(options.length - 1, currentIndex + direction))
    addClass(options[newIndex] as HTMLElement, 'ldesign-dropdown-option-highlighted')

    // 滚动到可见区域
    options[newIndex].scrollIntoView({ block: 'nearest' })
  }

  /**
   * 选择高亮的选项
   */
  private selectHighlightedOption(): void {
    if (!this.optionsContainer) return

    const highlighted = this.optionsContainer.querySelector('.ldesign-dropdown-option-highlighted')
    if (highlighted) {
      const index = Array.from(this.optionsContainer.children).indexOf(highlighted)
      if (index >= 0 && index < this.filteredOptions.length) {
        this.selectOption(this.filteredOptions[index])
      }
    }
  }

  /**
   * 销毁下拉菜单
   */
  destroy(): void {
    // 清理事件监听器
    this.eventCleanupFunctions.forEach(cleanup => cleanup())
    this.eventCleanupFunctions = []

    // 清理DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }

    // 清理引用
    this.container = null
    this.trigger = null
    this.dropdown = null
    this.searchInput = null
    this.optionsContainer = null
    this.selectedOption = null
  }
}
