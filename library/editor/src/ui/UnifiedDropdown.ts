/**
 * 统一的下拉框功能
 * 为颜色选择、表情选择等提供一致的下拉框体验
 */

import { showDropdown, type DropdownOption } from './Dropdown'
import { PRESET_COLORS } from '../plugins/formatting/color'

// 表情分类数据
const EMOJI_CATEGORIES = {
  smileys: {
    name: '笑脸',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔']
  },
  gestures: {
    name: '手势',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏']
  },
  hearts: {
    name: '爱心',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
  },
  animals: {
    name: '动物',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴']
  },
  food: {
    name: '食物',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔']
  }
}

/**
 * 显示颜色选择下拉框（简化版）
 */
export function showColorDropdown(
  button: HTMLElement,
  onSelect: (color: string) => void,
  includeCustom: boolean = true,
  title: string = '选择颜色'
): void {
  // 创建颜色选项
  const colorOptions: DropdownOption[] = PRESET_COLORS.slice(0, 20).map(color => ({
    label: color,
    value: color,
    color: color
  }))

  if (includeCustom) {
    // 创建自定义内容区域
    const customContent = document.createElement('div')
    customContent.style.cssText = 'width: 100%; box-sizing: border-box;'
    
    // 添加标题
    const titleElement = document.createElement('div')
    titleElement.className = 'editor-dropdown-title'
    titleElement.textContent = title
    customContent.appendChild(titleElement)
    
    // 颜色网格
    const colorGrid = document.createElement('div')
    colorGrid.className = 'editor-color-grid'
    
    PRESET_COLORS.forEach(color => {
      const colorButton = document.createElement('button')
      colorButton.type = 'button'
      colorButton.className = 'editor-color-item-dropdown'
      colorButton.style.backgroundColor = color
      colorButton.title = color
      
      // 添加对比边框（用于浅色）
      const rgb = hexToRgb(color)
      if (rgb && (rgb.r + rgb.g + rgb.b) > 650) {
        colorButton.style.border = '1px solid #e5e7eb'
      }
      
      colorButton.addEventListener('mousedown', (e) => {
        e.preventDefault()
      })
      
      colorButton.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        // 触发选择回调
        const dropdown = customContent.closest('.editor-dropdown')
        if (dropdown) {
          dropdown.classList.add('closing')
          setTimeout(() => {
            onSelect(color)
            dropdown.remove()
          }, 150)
        }
      })
      
      colorGrid.appendChild(colorButton)
    })
    
    customContent.appendChild(colorGrid)
    
    // 自定义颜色输入
    const customSection = document.createElement('div')
    customSection.className = 'editor-color-custom-section'
    
    const inputGroup = document.createElement('div')
    inputGroup.style.cssText = 'display: flex; gap: 8px; align-items: center; width: 100%; box-sizing: border-box;'
    
    const hexInput = document.createElement('input')
    hexInput.type = 'text'
    hexInput.placeholder = '#000000'
    hexInput.maxLength = 7
    hexInput.style.cssText = 'flex: 1; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; box-sizing: border-box; min-width: 0;'
    
    const applyButton = document.createElement('button')
    applyButton.type = 'button'
    applyButton.textContent = '应用'
    applyButton.style.cssText = 'padding: 6px 12px; border: none; border-radius: 4px; background: #3b82f6; color: white; font-size: 12px; cursor: pointer; flex-shrink: 0;'
    
    applyButton.addEventListener('click', () => {
      const color = hexInput.value.trim()
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        const dropdown = customContent.closest('.editor-dropdown')
        if (dropdown) {
          dropdown.classList.add('closing')
          setTimeout(() => {
            onSelect(color)
            dropdown.remove()
          }, 150)
        }
      } else {
        hexInput.style.borderColor = '#ef4444'
        setTimeout(() => {
          hexInput.style.borderColor = ''
        }, 1000)
      }
    })
    
    inputGroup.appendChild(hexInput)
    inputGroup.appendChild(applyButton)
    customSection.appendChild(inputGroup)
    customContent.appendChild(customSection)
    
    // 显示下拉框
    showDropdown(button, {
      customContent,
      width: 300,
      maxHeight: 420
    })
  } else {
    // 显示简单的颜色列表
    showDropdown(button, {
      options: colorOptions,
      onSelect,
      width: 200
    })
  }
}

/**
 * 显示表情选择下拉框
 */
export function showEmojiDropdown(
  button: HTMLElement,
  onSelect: (emoji: string) => void
): void {
  // 创建自定义内容
  const customContent = document.createElement('div')
  
  // 创建分类标签
  const tabs = document.createElement('div')
  tabs.className = 'editor-dropdown-tabs'
  
  // 创建表情网格容器
  const emojiGrid = document.createElement('div')
  emojiGrid.className = 'editor-emoji-grid'
  
  // 创建分类按钮
  let activeTab: HTMLElement | null = null
  
  Object.entries(EMOJI_CATEGORIES).forEach(([key, category], index) => {
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.textContent = category.name
    tab.className = 'editor-dropdown-tab'
    
    if (index === 0) {
      tab.classList.add('active')
      activeTab = tab
      // 默认显示第一个分类
      showEmojiCategory(category.emojis, emojiGrid, customContent, onSelect)
    }
    
    tab.addEventListener('click', () => {
      // 更新选中状态
      if (activeTab) {
        activeTab.classList.remove('active')
      }
      tab.classList.add('active')
      activeTab = tab
      
      // 显示对应分类的表情
      showEmojiCategory(category.emojis, emojiGrid, customContent, onSelect)
    })
    
    tabs.appendChild(tab)
  })
  
  customContent.appendChild(tabs)
  customContent.appendChild(emojiGrid)
  
  // 显示下拉框
  showDropdown(button, {
    customContent,
    width: 380,
    maxHeight: 320
  })
}

/**
 * 显示表情分类
 */
function showEmojiCategory(
  emojis: string[],
  container: HTMLElement,
  dropdownContent: HTMLElement,
  onSelect: (emoji: string) => void
): void {
  container.innerHTML = ''
  
  emojis.forEach(emoji => {
    const emojiButton = document.createElement('button')
    emojiButton.type = 'button'
    emojiButton.className = 'editor-emoji-item'
    emojiButton.textContent = emoji
    
    emojiButton.addEventListener('mousedown', (e) => {
      e.preventDefault()
    })
    
    emojiButton.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const dropdown = dropdownContent.closest('.editor-dropdown')
      if (dropdown) {
        dropdown.classList.add('closing')
        setTimeout(() => {
          onSelect(emoji)
          dropdown.remove()
        }, 150)
      }
    })
    
    container.appendChild(emojiButton)
  })
}

/**
 * HEX 转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}