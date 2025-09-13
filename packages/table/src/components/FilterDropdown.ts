/**
 * 筛选下拉框组件
 * 
 * 提供表格列的筛选功能
 * 支持多选、搜索和自定义筛选选项
 */

/**
 * 筛选选项
 */
export interface FilterOption {
  /** 选项值 */
  value: any
  /** 选项标签 */
  label: string
  /** 是否选中 */
  checked?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 筛选下拉框配置
 */
export interface FilterDropdownConfig {
  /** 筛选选项 */
  options: FilterOption[]
  /** 当前选中的值 */
  selectedValues?: any[]
  /** 是否支持搜索 */
  searchable?: boolean
  /** 是否支持全选 */
  showSelectAll?: boolean
  /** 是否支持清空 */
  showClear?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 搜索占位符 */
  searchPlaceholder?: string
  /** 最大高度 */
  maxHeight?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 选择变化回调 */
  onChange?: (selectedValues: any[]) => void
}

/**
 * 筛选下拉框类
 */
export class FilterDropdown {
  /** 配置 */
  private config: FilterDropdownConfig

  /** 容器元素 */
  private container: HTMLElement

  /** 触发器元素 */
  private trigger: HTMLElement | null = null

  /** 下拉框元素 */
  private dropdown: HTMLElement | null = null

  /** 搜索输入框 */
  private searchInput: HTMLInputElement | null = null

  /** 选项列表容器 */
  private optionsList: HTMLElement | null = null

  /** 是否显示下拉框 */
  private isVisible: boolean = false

  /** 过滤后的选项 */
  private filteredOptions: FilterOption[] = []

  /** 事件监听器 */
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()

  /** 全局点击监听器 */
  private globalClickListener: ((e: Event) => void) | null = null

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param config 筛选下拉框配置
   */
  constructor(container: string | HTMLElement, config: FilterDropdownConfig) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container

    if (!this.container) {
      throw new Error('筛选下拉框容器不存在')
    }

    this.config = {
      searchable: true,
      showSelectAll: true,
      showClear: true,
      placeholder: '筛选',
      searchPlaceholder: '搜索...',
      maxHeight: 300,
      disabled: false,
      selectedValues: [],
      ...config
    }

    this.filteredOptions = [...this.config.options]
    this.render()
  }

  /**
   * 渲染筛选下拉框
   */
  render(): void {
    // 清空容器
    this.container.innerHTML = ''

    // 创建触发器
    this.createTrigger()

    // 创建下拉框
    this.createDropdown()

    // 绑定事件
    this.bindEvents()
  }

  /**
   * 创建触发器
   * @private
   */
  private createTrigger(): void {
    this.trigger = document.createElement('button')
    this.trigger.className = `ldesign-table-filter-trigger ${this.config.className || ''}`
    this.trigger.type = 'button'
    this.trigger.disabled = this.config.disabled

    // 创建图标
    const icon = document.createElement('span')
    icon.className = 'ldesign-table-filter-icon'
    icon.innerHTML = '🔽'

    // 创建文本
    const text = document.createElement('span')
    text.className = 'ldesign-table-filter-text'
    text.textContent = this.getDisplayText()

    this.trigger.appendChild(text)
    this.trigger.appendChild(icon)

    // 设置状态
    if (this.hasSelectedValues()) {
      this.trigger.classList.add('ldesign-table-filter-trigger-active')
    }

    this.container.appendChild(this.trigger)
  }

  /**
   * 创建下拉框
   * @private
   */
  private createDropdown(): void {
    this.dropdown = document.createElement('div')
    this.dropdown.className = 'ldesign-table-filter-dropdown'
    this.dropdown.style.display = 'none'
    this.dropdown.style.maxHeight = `${this.config.maxHeight}px`

    // 创建搜索框
    if (this.config.searchable) {
      this.createSearchInput()
    }

    // 创建操作按钮
    if (this.config.showSelectAll || this.config.showClear) {
      this.createActionButtons()
    }

    // 创建选项列表
    this.createOptionsList()

    this.container.appendChild(this.dropdown)
  }

  /**
   * 创建搜索输入框
   * @private
   */
  private createSearchInput(): void {
    const searchContainer = document.createElement('div')
    searchContainer.className = 'ldesign-table-filter-search'

    this.searchInput = document.createElement('input')
    this.searchInput.type = 'text'
    this.searchInput.className = 'ldesign-table-filter-search-input'
    this.searchInput.placeholder = this.config.searchPlaceholder || '搜索...'

    searchContainer.appendChild(this.searchInput)
    this.dropdown!.appendChild(searchContainer)
  }

  /**
   * 创建操作按钮
   * @private
   */
  private createActionButtons(): void {
    const actionsContainer = document.createElement('div')
    actionsContainer.className = 'ldesign-table-filter-actions'

    if (this.config.showSelectAll) {
      const selectAllBtn = document.createElement('button')
      selectAllBtn.type = 'button'
      selectAllBtn.className = 'ldesign-table-filter-action-btn'
      selectAllBtn.textContent = '全选'
      selectAllBtn.addEventListener('click', () => this.selectAll())
      actionsContainer.appendChild(selectAllBtn)
    }

    if (this.config.showClear) {
      const clearBtn = document.createElement('button')
      clearBtn.type = 'button'
      clearBtn.className = 'ldesign-table-filter-action-btn'
      clearBtn.textContent = '清空'
      clearBtn.addEventListener('click', () => this.clearAll())
      actionsContainer.appendChild(clearBtn)
    }

    this.dropdown!.appendChild(actionsContainer)
  }

  /**
   * 创建选项列表
   * @private
   */
  private createOptionsList(): void {
    this.optionsList = document.createElement('div')
    this.optionsList.className = 'ldesign-table-filter-options'

    this.renderOptions()
    this.dropdown!.appendChild(this.optionsList)
  }

  /**
   * 渲染选项
   * @private
   */
  private renderOptions(): void {
    if (!this.optionsList) return

    this.optionsList.innerHTML = ''

    this.filteredOptions.forEach((option, index) => {
      const optionElement = document.createElement('label')
      optionElement.className = 'ldesign-table-filter-option'

      if (option.disabled) {
        optionElement.classList.add('ldesign-table-filter-option-disabled')
      }

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.className = 'ldesign-table-filter-option-checkbox'
      checkbox.checked = this.isSelected(option.value)
      checkbox.disabled = option.disabled || false
      checkbox.addEventListener('change', () => this.toggleOption(option.value))

      const label = document.createElement('span')
      label.className = 'ldesign-table-filter-option-label'
      label.textContent = option.label

      optionElement.appendChild(checkbox)
      optionElement.appendChild(label)
      this.optionsList.appendChild(optionElement)
    })

    // 如果没有选项，显示空状态
    if (this.filteredOptions.length === 0) {
      const emptyElement = document.createElement('div')
      emptyElement.className = 'ldesign-table-filter-empty'
      emptyElement.textContent = '无匹配选项'
      this.optionsList.appendChild(emptyElement)
    }
  }

  /**
   * 绑定事件
   * @private
   */
  private bindEvents(): void {
    // 触发器点击
    this.trigger?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggle()
    })

    // 搜索输入
    this.searchInput?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.filterOptions(target.value)
    })

    // 全局点击关闭
    this.globalClickListener = (e) => {
      if (!this.container.contains(e.target as Node)) {
        this.hide()
      }
    }
    document.addEventListener('click', this.globalClickListener)
  }

  /**
   * 获取显示文本
   * @private
   */
  private getDisplayText(): string {
    const selectedCount = this.config.selectedValues?.length || 0
    if (selectedCount === 0) {
      return this.config.placeholder || '筛选'
    }
    return `已选择 ${selectedCount} 项`
  }

  /**
   * 检查是否有选中值
   * @private
   */
  private hasSelectedValues(): boolean {
    return (this.config.selectedValues?.length || 0) > 0
  }

  /**
   * 检查值是否被选中
   * @private
   */
  private isSelected(value: any): boolean {
    return this.config.selectedValues?.includes(value) || false
  }

  /**
   * 过滤选项
   * @private
   */
  private filterOptions(searchText: string): void {
    const text = searchText.toLowerCase()
    this.filteredOptions = this.config.options.filter(option =>
      option.label.toLowerCase().includes(text)
    )
    this.renderOptions()
  }

  /**
   * 切换选项
   * @private
   */
  private toggleOption(value: any): void {
    const selectedValues = [...(this.config.selectedValues || [])]
    const index = selectedValues.indexOf(value)

    if (index > -1) {
      selectedValues.splice(index, 1)
    } else {
      selectedValues.push(value)
    }

    this.setSelectedValuesInternal(selectedValues)
  }

  /**
   * 全选
   * @private
   */
  private selectAll(): void {
    const allValues = this.filteredOptions
      .filter(option => !option.disabled)
      .map(option => option.value)
    this.setSelectedValuesInternal(allValues)
  }

  /**
   * 清空
   * @private
   */
  private clearAll(): void {
    this.setSelectedValuesInternal([])
  }

  /**
   * 设置选中值（内部方法）
   * @private
   */
  private setSelectedValuesInternal(values: any[]): void {
    this.config.selectedValues = values
    this.updateTrigger()
    this.renderOptions()

    // 触发回调
    if (this.config.onChange) {
      this.config.onChange(values)
    }

    // 触发事件
    this.emit('change', { selectedValues: values })
  }

  /**
   * 更新触发器
   * @private
   */
  private updateTrigger(): void {
    if (!this.trigger) return

    const text = this.trigger.querySelector('.ldesign-table-filter-text')
    if (text) {
      text.textContent = this.getDisplayText()
    }

    if (this.hasSelectedValues()) {
      this.trigger.classList.add('ldesign-table-filter-trigger-active')
    } else {
      this.trigger.classList.remove('ldesign-table-filter-trigger-active')
    }
  }

  /**
   * 发射事件
   * @private
   */
  private emit(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in filter dropdown event listener for ${eventName}:`, error)
        }
      })
    }
  }

  // ==================== 公共方法 ====================

  /**
   * 显示下拉框
   */
  show(): void {
    if (this.config.disabled || this.isVisible) return

    this.isVisible = true
    if (this.dropdown) {
      this.dropdown.style.display = 'block'
    }

    // 重置搜索
    if (this.searchInput) {
      this.searchInput.value = ''
      this.filterOptions('')
      this.searchInput.focus()
    }

    this.emit('show', {})
  }

  /**
   * 隐藏下拉框
   */
  hide(): void {
    if (!this.isVisible) return

    this.isVisible = false
    if (this.dropdown) {
      this.dropdown.style.display = 'none'
    }

    this.emit('hide', {})
  }

  /**
   * 切换显示状态
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * 设置选项
   */
  setOptions(options: FilterOption[]): void {
    this.config.options = options
    this.filteredOptions = [...options]
    this.renderOptions()
  }

  /**
   * 获取选中值
   */
  getSelectedValues(): any[] {
    return [...(this.config.selectedValues || [])]
  }

  /**
   * 设置选中值
   */
  setSelectedValues(values: any[]): void {
    this.config.selectedValues = values
    this.updateTrigger()
    this.renderOptions()

    // 触发回调
    if (this.config.onChange) {
      this.config.onChange(values)
    }

    // 触发事件
    this.emit('change', { selectedValues: values })
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<FilterDropdownConfig>): void {
    this.config = { ...this.config, ...config }
    this.render()
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) return

    if (listener) {
      const listeners = this.eventListeners.get(eventName)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(eventName)
    }
  }

  /**
   * 销毁筛选下拉框
   */
  destroy(): void {
    // 移除全局事件监听器
    if (this.globalClickListener) {
      document.removeEventListener('click', this.globalClickListener)
      this.globalClickListener = null
    }

    // 清理DOM
    this.container.innerHTML = ''
    this.trigger = null
    this.dropdown = null
    this.searchInput = null
    this.optionsList = null

    // 清理事件监听器
    this.eventListeners.clear()
  }
}
