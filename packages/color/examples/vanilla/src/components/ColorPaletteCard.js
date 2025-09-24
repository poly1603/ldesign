/**
 * ColorPaletteCard - Vanilla JavaScript版本
 * 完全模仿Vue版本的功能和样式
 */

export class ColorPaletteCard {
  constructor(options) {
    this.title = options.title
    this.subtitle = options.subtitle
    this.baseName = options.baseName
    this.colorName = options.colorName
    this.baseColor = options.baseColor
    this.colors = options.colors
    this.container = null
  }

  // 计算对比度
  getContrastRatio(color) {
    const rgb = this.hexToRgb(color)
    if (!rgb) return '0.00'

    const luminance = this.getLuminance(rgb.r, rgb.g, rgb.b)
    const whiteLuminance = 1
    const blackLuminance = 0

    const contrastWithWhite = (whiteLuminance + 0.05) / (luminance + 0.05)
    const contrastWithBlack = (luminance + 0.05) / (blackLuminance + 0.05)

    const contrast = Math.max(contrastWithWhite, contrastWithBlack)
    const rating = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'A' : ''

    return `${contrast.toFixed(2)} (${rating})`
  }

  // 获取对比色
  getContrastColor(color) {
    const rgb = this.hexToRgb(color)
    if (!rgb) return '#000000'

    const luminance = this.getLuminance(rgb.r, rgb.g, rgb.b)
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  // 复制颜色
  async copyColor(color) {
    try {
      await navigator.clipboard.writeText(color)
      this.showNotification(`已复制颜色: ${color}`)
    } catch (err) {
      console.error('复制失败:', err)
      this.showNotification('复制失败', 'error')
    }
  }

  // 显示通知
  showNotification(message, type = 'success') {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }

  // 工具函数
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // 渲染组件
  render() {
    const card = document.createElement('div')
    card.className = 'color-palette-card'

    // 创建头部
    const header = document.createElement('div')
    header.className = 'palette-header'
    header.style.backgroundColor = this.baseColor
    header.style.color = this.getContrastColor(this.baseColor)

    header.innerHTML = `
      <div class="palette-title">${this.title}</div>
      <div class="palette-subtitle">${this.subtitle}</div>
      <div class="base-info">
        <div class="base-name">${this.baseName}</div>
        <div class="base-hex">${this.baseColor}</div>
      </div>
    `

    // 创建颜色列表
    const colorsContainer = document.createElement('div')
    colorsContainer.className = 'palette-colors'

    this.colors.forEach((color, index) => {
      const colorItem = document.createElement('div')
      colorItem.className = 'color-item'
      colorItem.style.backgroundColor = color
      colorItem.addEventListener('click', () => this.copyColor(color))

      colorItem.innerHTML = `
        <div class="color-name">${this.colorName}-${index + 1}</div>
        <div class="color-contrast">${this.getContrastRatio(color)}</div>
        <div class="color-hex">${color.toUpperCase()}</div>
      `

      colorsContainer.appendChild(colorItem)
    })

    card.appendChild(header)
    card.appendChild(colorsContainer)

    this.container = card
    return card
  }

  // 更新颜色
  updateColors(colors) {
    this.colors = colors
    if (this.container) {
      const parent = this.container.parentNode
      if (parent) {
        const newCard = this.render()
        parent.replaceChild(newCard, this.container)
      }
    }
  }
}
