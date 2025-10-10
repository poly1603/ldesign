/**
 * 颜色选择器
 */

import { PRESET_COLORS } from '../plugins/color'

export interface ColorPickerOptions {
  onSelect: (color: string) => void
  colors?: string[]
  customColors?: boolean
}

/**
 * 创建颜色选择器
 */
export function createColorPicker(options: ColorPickerOptions): HTMLElement {
  const { onSelect, colors = PRESET_COLORS, customColors = true } = options

  const picker = document.createElement('div')
  picker.className = 'editor-color-picker'

  // 预设颜色
  const presetContainer = document.createElement('div')
  presetContainer.className = 'editor-color-preset'

  colors.forEach(color => {
    const colorItem = document.createElement('button')
    colorItem.className = 'editor-color-item'
    colorItem.style.backgroundColor = color
    colorItem.title = color
    colorItem.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      onSelect(color)
      picker.remove()
    })
    presetContainer.appendChild(colorItem)
  })

  picker.appendChild(presetContainer)

  // 自定义颜色
  if (customColors) {
    const customContainer = document.createElement('div')
    customContainer.className = 'editor-color-custom'

    const label = document.createElement('label')
    label.textContent = '自定义颜色: '
    label.className = 'editor-color-label'

    const input = document.createElement('input')
    input.type = 'color'
    input.className = 'editor-color-input'
    input.addEventListener('change', (e) => {
      const color = (e.target as HTMLInputElement).value
      onSelect(color)
      picker.remove()
    })

    label.appendChild(input)
    customContainer.appendChild(label)
    picker.appendChild(customContainer)
  }

  return picker
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
