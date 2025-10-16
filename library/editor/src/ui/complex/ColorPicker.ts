/**
 * 颜色选择器 - 基于Modal基类重构
 */

import { Modal, ModalOptions } from '../base/Modal'
import { createElement } from '../../utils/dom'
import { hexToRgb, isValidColor, rgbToHex, RGB } from '../../utils/color'
import { debounce } from '../../utils/event'

export interface ColorPickerOptions extends Omit<ModalOptions, 'content'> {
  onSelect?: (color: string) => void
  onCancel?: () => void
  colors?: string[]
  customColors?: boolean
  recentColors?: boolean
  currentColor?: string
}

// 默认预设颜色
const DEFAULT_COLORS = [
  '#000000', '#424242', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0', '#EEEEEE', '#FFFFFF',
  '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#0288D1', '#0097A7',
  '#00796B', '#388E3C', '#689F38', '#AFB42B', '#FBC02D', '#FFA000', '#F57C00', '#E64A19',
  '#5D4037', '#616161', '#455A64', '#263238', '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
  '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41',
  '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
]

// 最近使用的颜色管理
class RecentColorsManager {
  private static KEY = 'editor-recent-colors'
  private static MAX_COUNT = 10
  
  static getColors(): string[] {
    try {
      const saved = localStorage.getItem(this.KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }
  
  static addColor(color: string): void {
    const colors = this.getColors()
    const index = colors.indexOf(color)
    
    if (index > -1) {
      colors.splice(index, 1)
    }
    
    colors.unshift(color)
    
    if (colors.length > this.MAX_COUNT) {
      colors.length = this.MAX_COUNT
    }
    
    try {
      localStorage.setItem(this.KEY, JSON.stringify(colors))
    } catch {
      // Ignore storage errors
    }
  }
}

export class ColorPicker extends Modal {
  private pickerOptions: ColorPickerOptions
  private selectedColor: string = '#000000'
  private colorPreview: HTMLElement | null = null
  private hexInput: HTMLInputElement | null = null
  private rgbInputs: { r: HTMLInputElement, g: HTMLInputElement, b: HTMLInputElement } | null = null
  private colorSlider: HTMLInputElement | null = null
  private opacitySlider: HTMLInputElement | null = null
  
  constructor(options: ColorPickerOptions = {}) {
    const defaultOptions: ColorPickerOptions = {
      title: '选择颜色',
      width: 360,
      colors: DEFAULT_COLORS,
      customColors: true,
      recentColors: true,
      showCloseButton: true,
      centered: true,
      ...options
    }
    
    super(defaultOptions)
    this.pickerOptions = defaultOptions
    
    if (defaultOptions.currentColor) {
      this.selectedColor = defaultOptions.currentColor
    }
    
    this.renderContent()
  }
  
  private renderContent(): void {
    const container = createElement({
      className: 'color-picker-content',
      style: {
        padding: '16px'
      }
    })
    
    // 当前颜色预览
    container.appendChild(this.createColorPreview())
    
    // 最近使用的颜色
    if (this.pickerOptions.recentColors) {
      const recentColors = RecentColorsManager.getColors()
      if (recentColors.length > 0) {
        container.appendChild(this.createColorSection('最近使用', recentColors))
      }
    }
    
    // 预设颜色
    if (this.pickerOptions.colors && this.pickerOptions.colors.length > 0) {
      container.appendChild(this.createColorSection('预设颜色', this.pickerOptions.colors))
    }
    
    // 自定义颜色
    if (this.pickerOptions.customColors) {
      container.appendChild(this.createCustomColorSection())
    }
    
    // 底部按钮
    container.appendChild(this.createFooterButtons())
    
    this.setContent(container)
  }
  
  private createColorPreview(): HTMLElement {
    const preview = createElement({
      className: 'color-preview',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        padding: '12px',
        background: '#f9fafb',
        borderRadius: '6px'
      }
    })
    
    this.colorPreview = createElement({
      className: 'color-preview-box',
      style: {
        width: '60px',
        height: '40px',
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        background: this.selectedColor
      },
      parent: preview
    })
    
    const info = createElement({
      tag: 'div',
      style: { flex: '1' },
      parent: preview
    })
    
    this.hexInput = createElement({
      tag: 'input',
      attrs: {
        type: 'text',
        value: this.selectedColor,
        placeholder: '#000000',
        maxLength: '7'
      },
      style: {
        width: '100%',
        padding: '6px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: 'monospace'
      },
      parent: info
    }) as HTMLInputElement
    
    // HEX输入处理
    const updateFromHex = debounce(() => {
      const value = this.hexInput!.value.trim()
      if (isValidColor(value)) {
        this.selectedColor = value
        this.updateColorPreview()
        this.updateRGBInputs()
      }
    }, 300)
    
    this.hexInput.addEventListener('input', updateFromHex)
    
    return preview
  }
  
  private createColorSection(title: string, colors: string[]): HTMLElement {
    const section = createElement({
      className: 'color-section',
      style: {
        marginBottom: '16px'
      }
    })
    
    const titleEl = createElement({
      tag: 'h4',
      text: title,
      style: {
        margin: '0 0 8px 0',
        fontSize: '13px',
        fontWeight: '500',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      parent: section
    })
    
    const grid = createElement({
      className: 'color-grid',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '6px'
      },
      parent: section
    })
    
    colors.forEach(color => {
      const button = createElement({
        tag: 'button',
        attrs: {
          type: 'button',
          title: color
        },
        style: {
          width: '32px',
          height: '32px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          background: color,
          cursor: 'pointer',
          transition: 'transform 0.2s'
        },
        parent: grid
      }) as HTMLButtonElement
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)'
      })
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = ''
      })
      
      button.addEventListener('click', () => {
        this.selectedColor = color
        this.updateColorPreview()
        this.updateHexInput()
        this.updateRGBInputs()
      })
    })
    
    return section
  }
  
  private createCustomColorSection(): HTMLElement {
    const section = createElement({
      className: 'custom-color-section',
      style: {
        marginBottom: '16px'
      }
    })
    
    const title = createElement({
      tag: 'h4',
      text: '自定义颜色',
      style: {
        margin: '0 0 12px 0',
        fontSize: '13px',
        fontWeight: '500',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      parent: section
    })
    
    // RGB输入
    const rgbContainer = createElement({
      className: 'rgb-inputs',
      style: {
        display: 'flex',
        gap: '8px',
        marginBottom: '12px'
      },
      parent: section
    })
    
    const createRGBInput = (label: string, key: 'r' | 'g' | 'b') => {
      const group = createElement({
        style: { flex: '1' },
        parent: rgbContainer
      })
      
      createElement({
        tag: 'label',
        text: label,
        style: {
          display: 'block',
          marginBottom: '4px',
          fontSize: '12px',
          color: '#6b7280'
        },
        parent: group
      })
      
      const input = createElement({
        tag: 'input',
        attrs: {
          type: 'number',
          min: '0',
          max: '255',
          value: '0'
        },
        style: {
          width: '100%',
          padding: '6px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '14px'
        },
        parent: group
      }) as HTMLInputElement
      
      input.addEventListener('input', () => {
        const r = parseInt(this.rgbInputs!.r.value) || 0
        const g = parseInt(this.rgbInputs!.g.value) || 0
        const b = parseInt(this.rgbInputs!.b.value) || 0
        
        this.selectedColor = rgbToHex({ r, g, b })
        this.updateColorPreview()
        this.updateHexInput()
      })
      
      return input
    }
    
    this.rgbInputs = {
      r: createRGBInput('R', 'r'),
      g: createRGBInput('G', 'g'),
      b: createRGBInput('B', 'b')
    }
    
    // 系统颜色选择器
    const systemPicker = createElement({
      className: 'system-picker',
      style: {
        marginTop: '12px'
      },
      parent: section
    })
    
    const pickerLabel = createElement({
      tag: 'label',
      text: '系统选择器：',
      style: {
        marginRight: '8px',
        fontSize: '13px',
        color: '#374151'
      },
      parent: systemPicker
    })
    
    const colorInput = createElement({
      tag: 'input',
      attrs: {
        type: 'color',
        value: this.selectedColor
      },
      style: {
        width: '80px',
        height: '32px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: 'pointer'
      },
      parent: systemPicker
    }) as HTMLInputElement
    
    colorInput.addEventListener('input', (e) => {
      this.selectedColor = (e.target as HTMLInputElement).value
      this.updateColorPreview()
      this.updateHexInput()
      this.updateRGBInputs()
    })
    
    this.updateRGBInputs()
    
    return section
  }
  
  private createFooterButtons(): HTMLElement {
    const footer = createElement({
      className: 'color-picker-footer',
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }
    })
    
    const cancelBtn = createElement({
      tag: 'button',
      text: '取消',
      style: {
        padding: '8px 16px',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer'
      },
      parent: footer
    }) as HTMLButtonElement
    
    cancelBtn.addEventListener('click', () => {
      this.pickerOptions.onCancel?.()
      this.close()
    })
    
    const confirmBtn = createElement({
      tag: 'button',
      text: '确定',
      style: {
        padding: '8px 16px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer'
      },
      parent: footer
    }) as HTMLButtonElement
    
    confirmBtn.addEventListener('click', () => {
      RecentColorsManager.addColor(this.selectedColor)
      this.pickerOptions.onSelect?.(this.selectedColor)
      this.close()
    })
    
    return footer
  }
  
  private updateColorPreview(): void {
    if (this.colorPreview) {
      this.colorPreview.style.background = this.selectedColor
    }
  }
  
  private updateHexInput(): void {
    if (this.hexInput) {
      this.hexInput.value = this.selectedColor
    }
  }
  
  private updateRGBInputs(): void {
    if (this.rgbInputs) {
      const rgb = hexToRgb(this.selectedColor)
      if (rgb) {
        this.rgbInputs.r.value = rgb.r.toString()
        this.rgbInputs.g.value = rgb.g.toString()
        this.rgbInputs.b.value = rgb.b.toString()
      }
    }
  }
  
  public getSelectedColor(): string {
    return this.selectedColor
  }
  
  public setSelectedColor(color: string): void {
    if (isValidColor(color)) {
      this.selectedColor = color
      this.updateColorPreview()
      this.updateHexInput()
      this.updateRGBInputs()
    }
  }
}