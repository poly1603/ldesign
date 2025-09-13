/**
 * 颜色选择器组件
 * 为字体颜色和背景色提供颜色选择界面
 */

import { createElement, addClass, removeClass } from '../utils/dom-utils'

/**
 * 颜色选择器配置
 */
export interface ColorPickerOptions {
  /** 当前选中的颜色 */
  value?: string
  /** 预设颜色列表 */
  colors?: string[]
  /** 是否显示自定义颜色输入 */
  showCustom?: boolean
  /** 是否显示透明选项 */
  showTransparent?: boolean
  /** 标题 */
  title?: string
  /** 变化回调 */
  onChange?: (color: string) => void
  /** 确认回调 */
  onConfirm?: (color: string) => void
  /** 取消回调 */
  onCancel?: () => void
}

/**
 * 颜色选择器类
 */
export class ColorPicker {
  /** 配置选项 */
  private options: Required<ColorPickerOptions>

  /** 容器元素 */
  private container: HTMLElement | null = null

  /** 当前选中的颜色 */
  private currentColor: string

  /** 自定义颜色输入框 */
  private customInput: HTMLInputElement | null = null

  /** 默认颜色列表 */
  private static readonly DEFAULT_COLORS = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#008000', '#000080', '#808080', '#c0c0c0', '#800000',
    '#808000', '#008080', '#ddd', '#f0f0f0', '#333'
  ]

  constructor(options: ColorPickerOptions = {}) {
    this.options = {
      value: options.value || '#000000',
      colors: options.colors || ColorPicker.DEFAULT_COLORS,
      showCustom: options.showCustom !== false,
      showTransparent: options.showTransparent !== false,
      title: options.title || '选择颜色',
      onChange: options.onChange || (() => {}),
      onConfirm: options.onConfirm || (() => {}),
      onCancel: options.onCancel || (() => {})
    }

    this.currentColor = this.options.value
  }

  /**
   * 渲染颜色选择器
   * @returns 颜色选择器DOM元素
   */
  render(): HTMLElement {
    this.container = createElement('div', {
      className: 'ldesign-color-picker'
    })

    // 添加标题
    const title = createElement('div', {
      className: 'ldesign-color-picker-title'
    })
    title.textContent = this.options.title
    this.container.appendChild(title)

    // 添加颜色网格
    this.renderColorGrid()

    // 添加透明选项
    if (this.options.showTransparent) {
      this.renderTransparentOption()
    }

    // 添加自定义颜色输入
    if (this.options.showCustom) {
      this.renderCustomInput()
    }

    // 添加操作按钮
    this.renderActionButtons()

    return this.container
  }

  /**
   * 渲染颜色网格
   */
  private renderColorGrid(): void {
    if (!this.container) return

    const grid = createElement('div', {
      className: 'ldesign-color-picker-grid'
    })

    this.options.colors.forEach(color => {
      const colorItem = createElement('div', {
        className: 'ldesign-color-picker-item'
      })

      colorItem.style.backgroundColor = color
      colorItem.title = color

      if (color === this.currentColor) {
        addClass(colorItem, 'ldesign-color-picker-item-selected')
      }

      colorItem.addEventListener('click', () => {
        this.selectColor(color)
      })

      grid.appendChild(colorItem)
    })

    this.container.appendChild(grid)
  }

  /**
   * 渲染透明选项
   */
  private renderTransparentOption(): void {
    if (!this.container) return

    const transparentSection = createElement('div', {
      className: 'ldesign-color-picker-section'
    })

    const transparentItem = createElement('div', {
      className: 'ldesign-color-picker-item ldesign-color-picker-transparent'
    })
    transparentItem.title = '透明'

    if (this.currentColor === 'transparent') {
      addClass(transparentItem, 'ldesign-color-picker-item-selected')
    }

    transparentItem.addEventListener('click', () => {
      this.selectColor('transparent')
    })

    const label = createElement('span', {
      className: 'ldesign-color-picker-label'
    })
    label.textContent = '透明'

    transparentSection.appendChild(transparentItem)
    transparentSection.appendChild(label)
    this.container.appendChild(transparentSection)
  }

  /**
   * 渲染自定义颜色输入
   */
  private renderCustomInput(): void {
    if (!this.container) return

    const customSection = createElement('div', {
      className: 'ldesign-color-picker-section'
    })

    const label = createElement('label', {
      className: 'ldesign-color-picker-label'
    })
    label.textContent = '自定义颜色:'

    this.customInput = createElement('input', {
      type: 'color',
      className: 'ldesign-color-picker-custom',
      value: this.isValidColor(this.currentColor) ? this.currentColor : '#000000'
    }) as HTMLInputElement

    this.customInput.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement
      this.selectColor(input.value)
    })

    customSection.appendChild(label)
    customSection.appendChild(this.customInput)
    this.container.appendChild(customSection)
  }

  /**
   * 渲染操作按钮
   */
  private renderActionButtons(): void {
    if (!this.container) return

    const actions = createElement('div', {
      className: 'ldesign-color-picker-actions'
    })

    const confirmBtn = createElement('button', {
      className: 'ldesign-color-picker-btn ldesign-color-picker-btn-confirm',
      type: 'button'
    })
    confirmBtn.textContent = '确定'
    confirmBtn.addEventListener('click', () => {
      this.options.onConfirm(this.currentColor)
    })

    const cancelBtn = createElement('button', {
      className: 'ldesign-color-picker-btn ldesign-color-picker-btn-cancel',
      type: 'button'
    })
    cancelBtn.textContent = '取消'
    cancelBtn.addEventListener('click', () => {
      this.options.onCancel()
    })

    actions.appendChild(confirmBtn)
    actions.appendChild(cancelBtn)
    this.container.appendChild(actions)
  }

  /**
   * 选择颜色
   * @param color 颜色值
   */
  private selectColor(color: string): void {
    // 清除之前的选中状态
    if (this.container) {
      const selectedItems = this.container.querySelectorAll('.ldesign-color-picker-item-selected')
      selectedItems.forEach(item => {
        removeClass(item as HTMLElement, 'ldesign-color-picker-item-selected')
      })

      // 设置新的选中状态
      if (color !== 'transparent') {
        const colorItems = this.container.querySelectorAll('.ldesign-color-picker-item')
        colorItems.forEach(item => {
          const element = item as HTMLElement
          if (element.style.backgroundColor === color || 
              this.rgbToHex(element.style.backgroundColor) === color) {
            addClass(element, 'ldesign-color-picker-item-selected')
          }
        })
      } else {
        const transparentItem = this.container.querySelector('.ldesign-color-picker-transparent')
        if (transparentItem) {
          addClass(transparentItem as HTMLElement, 'ldesign-color-picker-item-selected')
        }
      }
    }

    this.currentColor = color

    // 更新自定义输入框
    if (this.customInput && this.isValidColor(color)) {
      this.customInput.value = color
    }

    // 触发变化回调
    this.options.onChange(color)
  }

  /**
   * 获取当前选中的颜色
   * @returns 当前颜色
   */
  getCurrentColor(): string {
    return this.currentColor
  }

  /**
   * 设置当前颜色
   * @param color 颜色值
   */
  setCurrentColor(color: string): void {
    this.selectColor(color)
  }

  /**
   * 检查是否为有效的颜色值
   * @param color 颜色值
   * @returns 是否有效
   */
  private isValidColor(color: string): boolean {
    if (color === 'transparent') return false
    
    const style = new Option().style
    style.color = color
    return style.color !== ''
  }

  /**
   * RGB转十六进制
   * @param rgb RGB颜色字符串
   * @returns 十六进制颜色
   */
  private rgbToHex(rgb: string): string {
    const result = rgb.match(/\d+/g)
    if (!result || result.length < 3) return rgb

    const r = parseInt(result[0])
    const g = parseInt(result[1])
    const b = parseInt(result[2])

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  /**
   * 销毁颜色选择器
   */
  destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = null
    this.customInput = null
  }
}
