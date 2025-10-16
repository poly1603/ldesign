/**
 * 颜色选择器
 */

import { PRESET_COLORS } from '../plugins/formatting/color'

export interface ColorPickerOptions {
  onSelect: (color: string) => void
  colors?: string[]
  customColors?: boolean
  recentColors?: boolean
}

// 存储最近使用的颜色
const recentColorsList: string[] = []
const MAX_RECENT_COLORS = 10

/**
 * 添加到最近使用的颜色
 */
function addRecentColor(color: string): void {
  // 移除已存在的颜色
  const index = recentColorsList.indexOf(color)
  if (index > -1) {
    recentColorsList.splice(index, 1)
  }

  // 添加到开头
  recentColorsList.unshift(color)

  // 限制数量
  if (recentColorsList.length > MAX_RECENT_COLORS) {
    recentColorsList.pop()
  }

  // 保存到 localStorage
  try {
    localStorage.setItem('editor-recent-colors', JSON.stringify(recentColorsList))
  } catch (e) {
    console.error('Failed to save recent colors:', e)
  }
}

/**
 * 加载最近使用的颜色
 */
function loadRecentColors(): void {
  try {
    const saved = localStorage.getItem('editor-recent-colors')
    if (saved) {
      const colors = JSON.parse(saved)
      recentColorsList.length = 0
      recentColorsList.push(...colors.slice(0, MAX_RECENT_COLORS))
    }
  } catch (e) {
    console.error('Failed to load recent colors:', e)
  }
}

// 初始化时加载最近使用的颜色
loadRecentColors()

/**
 * 创建颜色选择器
 */
export function createColorPicker(options: ColorPickerOptions): HTMLElement {
  const { onSelect, colors = PRESET_COLORS, customColors = true, recentColors = true } = options

  const picker = document.createElement('div')
  picker.className = 'editor-color-picker'

  // 最近使用的颜色
  if (recentColors && recentColorsList.length > 0) {
    const recentTitle = document.createElement('div')
    recentTitle.className = 'editor-color-section-title'
    recentTitle.textContent = '最近使用'
    picker.appendChild(recentTitle)

    const recentContainer = document.createElement('div')
    recentContainer.className = 'editor-color-preset editor-color-recent'

    recentColorsList.forEach(color => {
      const colorItem = createColorButton(color, (selectedColor) => {
        onSelect(selectedColor)
        picker.remove()
      })
      recentContainer.appendChild(colorItem)
    })

    picker.appendChild(recentContainer)
  }

  // 预设颜色标题
  const presetTitle = document.createElement('div')
  presetTitle.className = 'editor-color-section-title'
  presetTitle.textContent = '预设颜色'
  picker.appendChild(presetTitle)

  // 预设颜色
  const presetContainer = document.createElement('div')
  presetContainer.className = 'editor-color-preset'

  colors.forEach(color => {
    const colorItem = createColorButton(color, (selectedColor) => {
      addRecentColor(selectedColor)
      onSelect(selectedColor)
      picker.remove()
    })
    presetContainer.appendChild(colorItem)
  })

  picker.appendChild(presetContainer)

  // 自定义颜色
  if (customColors) {
    const customTitle = document.createElement('div')
    customTitle.className = 'editor-color-section-title'
    customTitle.textContent = '自定义颜色'
    picker.appendChild(customTitle)

    const customContainer = document.createElement('div')
    customContainer.className = 'editor-color-custom'

    // HEX 输入框
    const hexInputGroup = document.createElement('div')
    hexInputGroup.className = 'editor-color-hex-group'

    const hexLabel = document.createElement('label')
    hexLabel.textContent = 'HEX:'
    hexLabel.className = 'editor-color-hex-label'

    const hexInput = document.createElement('input')
    hexInput.type = 'text'
    hexInput.className = 'editor-color-hex-input'
    hexInput.placeholder = '#000000'
    hexInput.maxLength = 7

    const hexApplyBtn = document.createElement('button')
    hexApplyBtn.type = 'button'
    hexApplyBtn.className = 'editor-color-hex-apply'
    hexApplyBtn.textContent = '应用'
    hexApplyBtn.addEventListener('click', () => {
      const color = hexInput.value.trim()
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        addRecentColor(color)
        onSelect(color)
        picker.remove()
      } else {
        hexInput.style.borderColor = '#ef4444'
        setTimeout(() => {
          hexInput.style.borderColor = ''
        }, 1000)
      }
    })

    hexInputGroup.appendChild(hexLabel)
    hexInputGroup.appendChild(hexInput)
    hexInputGroup.appendChild(hexApplyBtn)
    customContainer.appendChild(hexInputGroup)

    // 颜色选择器
    const colorInputGroup = document.createElement('div')
    colorInputGroup.className = 'editor-color-input-group'

    const colorLabel = document.createElement('label')
    colorLabel.textContent = '选择器:'
    colorLabel.className = 'editor-color-input-label'

    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.className = 'editor-color-input'
    colorInput.value = '#000000'
    colorInput.addEventListener('input', (e) => {
      const color = (e.target as HTMLInputElement).value
      hexInput.value = color
    })
    colorInput.addEventListener('change', (e) => {
      const color = (e.target as HTMLInputElement).value
      addRecentColor(color)
      onSelect(color)
      picker.remove()
    })

    colorInputGroup.appendChild(colorLabel)
    colorInputGroup.appendChild(colorInput)
    customContainer.appendChild(colorInputGroup)

    picker.appendChild(customContainer)
  }

  return picker
}

/**
 * 创建颜色按钮
 */
function createColorButton(color: string, onClick: (color: string) => void): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'editor-color-item'
  button.style.backgroundColor = color
  button.title = color

  // 添加对比边框（用于浅色）
  const rgb = hexToRgb(color)
  if (rgb && (rgb.r + rgb.g + rgb.b) > 650) {
    button.style.border = '1px solid #e5e7eb'
  }

  button.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClick(color)
  })

  return button
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

/**
 * 显示颜色选择器
 */
export function showColorPicker(
  button: HTMLElement,
  options: ColorPickerOptions
): void {
  // 移除已存在的选择器
  const existing = document.querySelector('.editor-color-picker')
  if (existing) {
    existing.remove()
  }

  const picker = createColorPicker(options)

  // 定位选择器
  const rect = button.getBoundingClientRect()
  picker.style.position = 'absolute'
  picker.style.top = `${rect.bottom + 5}px`
  picker.style.left = `${rect.left}px`
  picker.style.zIndex = '10000'

  document.body.appendChild(picker)

  // 点击外部关闭
  const closeOnClickOutside = (e: MouseEvent) => {
    if (!picker.contains(e.target as Node) && e.target !== button) {
      picker.remove()
      document.removeEventListener('click', closeOnClickOutside)
    }
  }

  setTimeout(() => {
    document.addEventListener('click', closeOnClickOutside)
  }, 0)
}
