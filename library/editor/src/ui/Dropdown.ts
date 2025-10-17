/**
 * 下拉选择器
 */

import { createIcon } from './icons'

export interface DropdownOption {
  label: string
  value: string
  icon?: string // 可选图标
  color?: string // 可选颜色（用于颜色选择）
  emoji?: string // 可选表情（用于表情选择）
}

export interface DropdownOptions {
  options?: DropdownOption[]
  onSelect?: (value: string) => void
  placeholder?: string
  customContent?: HTMLElement // 自定义内容（用于颜色选择器等复杂UI）
  width?: number | string // 自定义宽度
  maxHeight?: number | string // 最大高度
  selectedValue?: string // 当前选中的值
  renderOption?: (option: DropdownOption) => HTMLElement | null // 自定义渲染选项
}

/**
 * 创建下拉选择器
 */
export function createDropdown(options: DropdownOptions): HTMLElement {
  const { options: items, onSelect, customContent, width, maxHeight, selectedValue, renderOption } = options

  const dropdown = document.createElement('div')
  dropdown.className = 'editor-dropdown'
  
  // 设置自定义宽度
  if (width) {
    dropdown.style.width = typeof width === 'number' ? `${width}px` : width
  }
  
  // 设置自定义最大高度
  if (maxHeight) {
    dropdown.style.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
  }

  // 如果有自定义内容，直接使用
  if (customContent) {
    dropdown.appendChild(customContent)
    return dropdown
  }

  // 创建选项列表
  const list = document.createElement('div')
  list.className = 'editor-dropdown-list'

  if (items && items.length > 0) {
    items.forEach(item => {
      // 如果有自定义渲染函数
      if (renderOption) {
        const customElement = renderOption(item)
        if (customElement) {
          list.appendChild(customElement)
          return
        }
      }
      
      // 处理分隔线
      if (item.value === 'separator' || item.label === '---') {
        const separator = document.createElement('div')
        separator.className = 'editor-dropdown-separator'
        separator.style.cssText = 'height: 1px; background: #e0e0e0; margin: 4px 8px;'
        list.appendChild(separator)
        return
      }
      
      const optionElement = document.createElement('div')
      optionElement.className = 'editor-dropdown-option'
      optionElement.dataset.value = item.value
      
      // 如果是当前选中项，添加活动类
      if (selectedValue && item.value === selectedValue) {
        optionElement.classList.add('active')
      }
      
      // 如果有图标，添加lucide图标
      if (item.icon) {
        const iconElement = createIcon(item.icon)
        if (iconElement) {
          iconElement.style.width = '16px'
          iconElement.style.height = '16px'
          iconElement.style.marginRight = '8px'
          iconElement.style.verticalAlign = 'middle'
          iconElement.style.opacity = '0.7'
          optionElement.appendChild(iconElement)
        }
      }

      // 如果有颜色，创建颜色预览
      if (item.color) {
        const colorPreview = document.createElement('span')
        colorPreview.className = 'editor-dropdown-color-preview'
        colorPreview.style.backgroundColor = item.color
        optionElement.appendChild(colorPreview)
      }

      // 如果有表情，显示表情
      if (item.emoji) {
        const emojiSpan = document.createElement('span')
        emojiSpan.className = 'editor-dropdown-emoji'
        emojiSpan.textContent = item.emoji
        optionElement.appendChild(emojiSpan)
      }

      // 添加文本标签
      const labelSpan = document.createElement('span')
      labelSpan.className = 'editor-dropdown-label'
      labelSpan.textContent = item.label
      optionElement.appendChild(labelSpan)

      // 如果是字体家族，应用字体样式
      if (item.value !== 'inherit' && item.value.includes(',') && !item.color && !item.emoji) {
        optionElement.style.fontFamily = item.value
      }

      // 防止选项获取焦点导致选区丢失
      optionElement.addEventListener('mousedown', (e) => {
        e.preventDefault()
      })

      optionElement.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (onSelect) {
          // 添加关闭动画后再执行回调
          dropdown.classList.add('closing')
          
          // 延迟执行选择回调，让用户看到选中效果
          setTimeout(() => {
            onSelect(item.value)
            dropdown.remove()
          }, 150) // 与关闭动画时长一致
        }
      })

      list.appendChild(optionElement)
    })
  }

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
  // 移除已存在的下拉框（带动画）
  const existing = document.querySelector('.editor-dropdown') as HTMLElement
  if (existing) {
    // 如果已经在关闭动画中，直接移除
    if (existing.classList.contains('closing')) {
      existing.remove()
    } else {
      // 添加关闭动画
      existing.classList.add('closing')
      setTimeout(() => {
        existing.remove()
      }, 150) // 与关闭动画时长一致
    }
  }

  const dropdown = createDropdown(options)

  // 初始定位
  const rect = button.getBoundingClientRect()
  dropdown.style.position = 'fixed'
  dropdown.style.zIndex = '10000'
  
  // 先添加到DOM中以获取准确尺寸
  dropdown.style.visibility = 'hidden'
  dropdown.style.opacity = '0'
  document.body.appendChild(dropdown)
  
  // 获取下拉框的尺寸
  const dropdownRect = dropdown.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const padding = 10 // 距离窗口边缘的最小间距
  
  // 计算最佳位置
  let top = rect.bottom + 5
  let left = rect.left
  
  // 检查右边界
  if (left + dropdownRect.width > windowWidth - padding) {
    // 如果超出右边界，尝试右对齐
    left = rect.right - dropdownRect.width
    
    // 如果右对齐后超出左边界，则贴右边
    if (left < padding) {
      left = windowWidth - dropdownRect.width - padding
    }
  }
  
  // 检查左边界
  if (left < padding) {
    left = padding
  }
  
  // 检查下边界
  if (top + dropdownRect.height > windowHeight - padding) {
    // 如果下方空间不足，尝试显示在按钮上方
    const topAbove = rect.top - dropdownRect.height - 5
    
    if (topAbove >= padding) {
      // 上方有足够空间
      top = topAbove
      // 修改动画起点为底部
      dropdown.style.transformOrigin = 'bottom'
    } else {
      // 上下都不够，限制高度并显示在下方
      top = rect.bottom + 5
      const maxHeight = windowHeight - top - padding
      dropdown.style.maxHeight = `${maxHeight}px`
      dropdown.style.overflowY = 'auto'
    }
  }
  
  // 应用计算后的位置
  dropdown.style.top = `${top}px`
  dropdown.style.left = `${left}px`
  
  // 显示下拉框
  dropdown.style.visibility = 'visible'
  dropdown.style.opacity = '1'
  
  // 触发动画
  dropdown.classList.remove('editor-dropdown')
  void dropdown.offsetWidth // 强制重排
  dropdown.classList.add('editor-dropdown')

  // 点击外部关闭（带动画）
  const closeOnClickOutside = (e: MouseEvent) => {
    if (!dropdown.contains(e.target as Node) && e.target !== button) {
      // 添加关闭动画
      dropdown.classList.add('closing')
      setTimeout(() => {
        dropdown.remove()
      }, 150) // 与关闭动画时长一致
      document.removeEventListener('click', closeOnClickOutside)
    }
  }

  // ESC键关闭下拉框
  const closeOnEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      dropdown.classList.add('closing')
      setTimeout(() => {
        dropdown.remove()
      }, 150)
      document.removeEventListener('keydown', closeOnEsc)
      document.removeEventListener('click', closeOnClickOutside)
    }
  }

  setTimeout(() => {
    document.addEventListener('click', closeOnClickOutside)
    document.addEventListener('keydown', closeOnEsc)
  }, 0)
}
