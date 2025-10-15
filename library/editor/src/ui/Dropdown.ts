/**
 * 下拉选择器
 */

export interface DropdownOption {
  label: string
  value: string
}

export interface DropdownOptions {
  options: DropdownOption[]
  onSelect: (value: string) => void
  placeholder?: string
}

/**
 * 创建下拉选择器
 */
export function createDropdown(options: DropdownOptions): HTMLElement {
  const { options: items, onSelect, placeholder = '请选择' } = options

  const dropdown = document.createElement('div')
  dropdown.className = 'editor-dropdown'

  // 创建选项列表
  const list = document.createElement('div')
  list.className = 'editor-dropdown-list'

  items.forEach(item => {
    const optionElement = document.createElement('div')
    optionElement.className = 'editor-dropdown-option'
    optionElement.textContent = item.label
    optionElement.dataset.value = item.value

    // 如果是字体家族，应用字体样式
    if (item.value !== 'inherit' && item.value.includes(',')) {
      optionElement.style.fontFamily = item.value
    }

    // 防止选项获取焦点导致选区丢失
    optionElement.addEventListener('mousedown', (e) => {
      e.preventDefault()
    })

    optionElement.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      onSelect(item.value)
      dropdown.remove()
    })

    list.appendChild(optionElement)
  })

  dropdown.appendChild(list)

  return dropdown
}

/**
 * 显示下拉选择器
 */
export function showDropdown(
  button: HTMLElement,
  options: DropdownOptions
): void {
  // 移除已存在的下拉框
  const existing = document.querySelector('.editor-dropdown')
  if (existing) {
    existing.remove()
  }

  const dropdown = createDropdown(options)

  // 定位下拉框
  const rect = button.getBoundingClientRect()
  dropdown.style.position = 'absolute'
  dropdown.style.top = `${rect.bottom + 5}px`
  dropdown.style.left = `${rect.left}px`
  dropdown.style.zIndex = '10000'

  document.body.appendChild(dropdown)

  // 点击外部关闭
  const closeOnClickOutside = (e: MouseEvent) => {
    if (!dropdown.contains(e.target as Node) && e.target !== button) {
      dropdown.remove()
      document.removeEventListener('click', closeOnClickOutside)
    }
  }

  setTimeout(() => {
    document.addEventListener('click', closeOnClickOutside)
  }, 0)
}
