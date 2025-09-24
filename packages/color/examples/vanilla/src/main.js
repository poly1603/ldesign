/**
 * @ldesign/color Vanilla JavaScript 示例
 * 完全匹配Vue版本的功能和界面设计
 */

import {
  createThemeManagerWithPresets,
  generateColorConfig,
  generateColorScales,
  hexToRgb,
  rgbToHsl,
  rgbToHsv,
  hslToHex,
  blendColors,
  generateMonochromaticPalette,
  generateAnalogousPalette,
  generateComplementaryPalette,
  checkAccessibility,
} from '@ldesign/color'
import { ColorPaletteCard } from './components/index.js'

class ColorDemo {
  constructor() {
    this.themeManager = null
    this.elements = {}
    this.notifications = []
    this.notificationId = 0
    this.activeTab = 'theme'
    this.init()
  }

  async init() {
    try {
      // 初始化 DOM 元素引用
      this.initElements()

      // 初始化标签页导航
      this.initTabs()

      // 创建主题管理器
      await this.initThemeManager()

      // 绑定事件监听器
      this.bindEvents()

      // 初始化各个功能演示
      this.initColorConverter()
      this.initColorMixer()
      this.initPaletteGenerator()
      this.initAccessibilityChecker()

      // 更新 UI
      this.updateUI()

      // 显示主题预览
      this.displayThemes()

      // 显示当前主题色阶
      this.displayCurrentThemeScales()

      this.showNotification('Vanilla JavaScript 示例已加载完成！', 'success')
    } catch (error) {
      console.error('初始化失败:', error)
      this.showError(`初始化失败: ${error.message}`)
    }
  }

  initElements() {
    this.elements = {
      // 标签页相关
      navTabs: document.querySelectorAll('.nav-tab'),
      demoSections: document.querySelectorAll('.demo-section'),

      // 主题相关
      themeSelect: document.getElementById('theme-select'),
      modeSelect: document.getElementById('mode-select'),
      toggleModeBtn: document.getElementById('toggle-mode'),
      currentTheme: document.getElementById('current-theme'),
      currentMode: document.getElementById('current-mode'),
      systemTheme: document.getElementById('system-theme'),
      themesContainer: document.getElementById('themes-container'),
      currentScalesContainer: document.getElementById('current-scales-container'),

      // 颜色转换相关
      inputColor: document.getElementById('input-color'),
      inputColorText: document.getElementById('input-color-text'),
      colorPreview: document.getElementById('color-preview'),
      resultHex: document.getElementById('result-hex'),
      resultRgb: document.getElementById('result-rgb'),
      resultHsl: document.getElementById('result-hsl'),
      resultHsv: document.getElementById('result-hsv'),

      // 颜色混合相关
      mixerColor1: document.getElementById('mixer-color1'),
      mixerColor1Text: document.getElementById('mixer-color1-text'),
      mixerColor2: document.getElementById('mixer-color2'),
      mixerColor2Text: document.getElementById('mixer-color2-text'),
      mixedColorPreview: document.getElementById('mixed-color-preview'),

      // 调色板生成相关
      paletteBaseColor: document.getElementById('palette-base-color'),
      paletteBaseColorText: document.getElementById('palette-base-color-text'),
      paletteType: document.getElementById('palette-type'),
      generatedPalette: document.getElementById('generated-palette'),

      // 可访问性检查相关
      accessibilityFg: document.getElementById('accessibility-fg'),
      accessibilityFgText: document.getElementById('accessibility-fg-text'),
      accessibilityBg: document.getElementById('accessibility-bg'),
      accessibilityBgText: document.getElementById('accessibility-bg-text'),
      accessibilityPreview: document.getElementById('accessibility-preview'),
      contrastRatio: document.getElementById('contrast-ratio'),
      wcagLevel: document.getElementById('wcag-level'),
    }
  }

  initTabs() {
    this.elements.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab
        this.switchTab(tabName)
      })
    })
  }

  switchTab(tabName) {
    this.activeTab = tabName

    // 更新标签页状态
    this.elements.navTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName)
    })

    // 更新内容区域
    this.elements.demoSections.forEach(section => {
      section.classList.toggle('active', section.id === `${tabName}-demo`)
    })
  }

  async initThemeManager() {
    this.themeManager = await createThemeManagerWithPresets({
      defaultTheme: 'default',
      autoDetect: true,
      onThemeChanged: (_theme, _mode) => {
        // Theme switched
        this.updateUI()
        this.displayCurrentThemeScales()
      },
      onError: error => {
        console.error('主题管理器错误:', error)
        this.showError(`主题错误: ${error.message}`)
      },
    })

    // 填充主题选择器
    this.populateThemeSelect()
  }

  populateThemeSelect() {
    const themes = this.themeManager.getThemeNames()
    this.elements.themeSelect.innerHTML = ''

    themes.forEach(themeName => {
      const option = document.createElement('option')
      option.value = themeName
      option.textContent = this.getThemeDisplayName(themeName)
      this.elements.themeSelect.appendChild(option)
    })
  }

  getThemeDisplayName(themeName) {
    const themeConfig = this.themeManager.getThemeConfig(themeName)
    return themeConfig?.displayName || themeName
  }

  displayThemes() {
    const themes = this.themeManager.getThemeNames()
    this.elements.themesContainer.innerHTML = ''

    themes.forEach(themeName => {
      const themeCard = this.createThemeCard(themeName)
      this.elements.themesContainer.appendChild(themeCard)
    })
  }

  createThemeCard(themeName) {
    const themeConfig = this.themeManager.getThemeConfig(themeName)
    const currentTheme = this.themeManager.getCurrentTheme()

    const card = document.createElement('div')
    card.className = `theme-item ${currentTheme === themeName ? 'active' : ''}`

    // 主题预览颜色
    const preview = document.createElement('div')
    preview.className = 'theme-preview'

    // 生成完整的颜色配置
    let previewColors
    try {
      const generatedColors = generateColorConfig(themeConfig?.light?.primary || '#1890ff')
      previewColors = {
        primary: themeConfig?.light?.primary || '#1890ff',
        success: generatedColors.success || '#52c41a',
        warning: generatedColors.warning || '#faad14',
        danger: generatedColors.danger || '#f5222d',
      }
    } catch {
      // 降级到默认颜色
      previewColors = {
        primary: themeConfig?.light?.primary || '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        danger: '#f5222d',
      }
    }

    const colorTypes = ['primary', 'success', 'warning', 'danger']
    colorTypes.forEach(type => {
      const colorDiv = document.createElement('div')
      colorDiv.className = 'theme-color'
      colorDiv.style.backgroundColor = previewColors[type]
      preview.appendChild(colorDiv)
    })

    // 主题信息
    const info = document.createElement('div')
    info.className = 'theme-info'

    const name = document.createElement('div')
    name.className = 'theme-name'
    name.textContent = themeConfig?.displayName || themeName

    const description = document.createElement('div')
    description.className = 'theme-description'
    description.textContent = themeConfig?.description || '精美的主题配色方案'

    info.appendChild(name)
    info.appendChild(description)

    card.appendChild(preview)
    card.appendChild(info)

    // 点击切换主题
    card.addEventListener('click', () => {
      this.themeManager.setTheme(themeName)
      this.displayThemes() // 重新渲染以更新active状态
    })

    return card
  }

  displayCurrentThemeScales() {
    const currentTheme = this.themeManager.getCurrentTheme()
    const currentMode = this.themeManager.getCurrentMode()
    const themeConfig = this.themeManager.getThemeConfig(currentTheme)

    if (!themeConfig) {
      this.elements.currentScalesContainer.innerHTML = '<p>无法获取当前主题配置</p>'
      return
    }

    const modeColors = currentMode === 'light' ? themeConfig.light : themeConfig.dark
    if (!modeColors) {
      this.elements.currentScalesContainer.innerHTML = '<p>当前模式下无颜色配置</p>'
      return
    }

    // 准备颜色配置
    // 如果主题配置中没有定义完整的颜色，使用生成的颜色配置
    let generatedColors = null
    try {
      generatedColors = generateColorConfig(modeColors.primary)
    } catch (error) {
      console.warn('生成颜色配置失败:', error)
    }

    const colors = {
      primary: modeColors.primary,
      success: modeColors.success || generatedColors?.success || '#52c41a',
      warning: modeColors.warning || generatedColors?.warning || '#faad14',
      danger: modeColors.danger || generatedColors?.danger || '#f5222d',
      gray: modeColors.gray || generatedColors?.gray || '#8c8c8c',
    }

    try {
      const scales = generateColorScales(colors, currentMode)
      this.renderScales(scales)
    } catch (error) {
      console.warn('生成色阶失败:', error)
      this.elements.currentScalesContainer.innerHTML = '<p>生成色阶失败</p>'
    }
  }

  renderScales(scales) {
    this.elements.currentScalesContainer.innerHTML = ''
    this.elements.currentScalesContainer.className = 'palette-showcase'

    const colorTypeNames = {
      primary: '主色调',
      success: '成功色',
      warning: '警告色',
      danger: '危险色',
      gray: '灰色',
    }

    Object.entries(scales).forEach(([colorType, scaleData]) => {
      const colors = scaleData.colors || []
      const baseColor = colors[5] || '#000000' // 第6个颜色作为基准色

      const paletteCard = new ColorPaletteCard({
        title: colorTypeNames[colorType] || colorType,
        subtitle: colorType,
        baseName: `${colorType}-6`,
        colorName: colorType,
        baseColor,
        colors,
      })

      this.elements.currentScalesContainer.appendChild(paletteCard.render())
    })
  }

  initColorConverter() {
    const updateConvertedColors = () => {
      try {
        const color = this.elements.inputColor.value
        this.elements.inputColorText.value = color
        this.elements.colorPreview.style.backgroundColor = color

        const rgb = hexToRgb(color)
        if (rgb) {
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
          const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)

          this.elements.resultHex.textContent = color
          this.elements.resultRgb.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
          this.elements.resultHsl.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
          this.elements.resultHsv.textContent = `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`
        }
      } catch (error) {
        console.error('颜色转换失败:', error)
      }
    }

    this.elements.inputColor.addEventListener('input', updateConvertedColors)
    this.elements.inputColorText.addEventListener('input', e => {
      this.elements.inputColor.value = e.target.value
      updateConvertedColors()
    })

    updateConvertedColors()
  }

  initColorMixer() {
    const updateMixedColor = () => {
      try {
        const color1 = this.elements.mixerColor1.value
        const color2 = this.elements.mixerColor2.value
        this.elements.mixerColor1Text.value = color1
        this.elements.mixerColor2Text.value = color2

        const mixed = blendColors(color1, color2, 'normal', 0.5)
        this.elements.mixedColorPreview.style.backgroundColor = mixed
        this.elements.mixedColorPreview.innerHTML = `<span>混合结果: ${mixed}</span>`
      } catch (error) {
        console.error('颜色混合失败:', error)
      }
    }

    this.elements.mixerColor1.addEventListener('input', updateMixedColor)
    this.elements.mixerColor2.addEventListener('input', updateMixedColor)
    this.elements.mixerColor1Text.addEventListener('input', e => {
      this.elements.mixerColor1.value = e.target.value
      updateMixedColor()
    })
    this.elements.mixerColor2Text.addEventListener('input', e => {
      this.elements.mixerColor2.value = e.target.value
      updateMixedColor()
    })

    updateMixedColor()
  }

  initPaletteGenerator() {
    const generatePalette = () => {
      try {
        const baseColor = this.elements.paletteBaseColor.value
        const type = this.elements.paletteType.value
        this.elements.paletteBaseColorText.value = baseColor

        let colors = []
        switch (type) {
          case 'monochromatic':
            colors = generateMonochromaticPalette(baseColor, 5)
            break
          case 'analogous':
            colors = generateAnalogousPalette(baseColor, 5)
            break
          case 'complementary':
            colors = generateComplementaryPalette(baseColor)
            break
        }

        this.elements.generatedPalette.innerHTML = ''
        colors.forEach((color, index) => {
          const colorDiv = document.createElement('div')
          colorDiv.className = 'palette-color'
          colorDiv.style.backgroundColor = color
          colorDiv.title = color
          colorDiv.innerHTML = `<span>${color}</span>`
          colorDiv.addEventListener('click', () => this.copyColor(color))
          this.elements.generatedPalette.appendChild(colorDiv)
        })
      } catch (error) {
        console.error('调色板生成失败:', error)
      }
    }

    this.elements.paletteBaseColor.addEventListener('input', generatePalette)
    this.elements.paletteType.addEventListener('change', generatePalette)
    this.elements.paletteBaseColorText.addEventListener('input', e => {
      this.elements.paletteBaseColor.value = e.target.value
      generatePalette()
    })

    generatePalette()
  }

  initAccessibilityChecker() {
    const checkColorAccessibility = () => {
      try {
        const fg = this.elements.accessibilityFg.value
        const bg = this.elements.accessibilityBg.value
        this.elements.accessibilityFgText.value = fg
        this.elements.accessibilityBgText.value = bg

        this.elements.accessibilityPreview.style.color = fg
        this.elements.accessibilityPreview.style.backgroundColor = bg

        const result = checkAccessibility(fg, bg, 'normal')
        this.elements.contrastRatio.textContent = `${result.ratio.toFixed(2)}:1`
        this.elements.wcagLevel.textContent = result.level
        this.elements.wcagLevel.className = `level ${result.level.toLowerCase()}`
      } catch (error) {
        console.error('可访问性检查失败:', error)
      }
    }

    this.elements.accessibilityFg.addEventListener('input', checkColorAccessibility)
    this.elements.accessibilityBg.addEventListener('input', checkColorAccessibility)
    this.elements.accessibilityFgText.addEventListener('input', e => {
      this.elements.accessibilityFg.value = e.target.value
      checkColorAccessibility()
    })
    this.elements.accessibilityBgText.addEventListener('input', e => {
      this.elements.accessibilityBg.value = e.target.value
      checkColorAccessibility()
    })

    checkColorAccessibility()
  }

  bindEvents() {
    // 主题选择器
    this.elements.themeSelect.addEventListener('change', e => {
      this.themeManager.setTheme(e.target.value)
    })

    // 模式选择器
    this.elements.modeSelect.addEventListener('change', e => {
      this.themeManager.setMode(e.target.value)
      // 强制刷新色阶显示
      setTimeout(() => {
        this.displayCurrentThemeScales()
      }, 100)
    })

    // 切换模式按钮
    this.elements.toggleModeBtn.addEventListener('click', () => {
      this.themeManager.toggleMode()
      // 强制刷新色阶显示
      setTimeout(() => {
        this.displayCurrentThemeScales()
      }, 100)
    })
  }

  updateUI() {
    const currentTheme = this.themeManager.getCurrentTheme()
    const currentMode = this.themeManager.getCurrentMode()

    this.elements.currentTheme.textContent = this.getThemeDisplayName(currentTheme)
    this.elements.currentMode.textContent = currentMode === 'light' ? '亮色' : '暗色'
    this.elements.systemTheme.textContent = currentMode === 'light' ? '亮色' : '暗色'

    this.elements.themeSelect.value = currentTheme
    this.elements.modeSelect.value = currentMode
  }

  async copyColor(color) {
    try {
      await navigator.clipboard.writeText(color)
      this.showNotification(`已复制颜色值: ${color}`, 'success')
    } catch {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = color
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      this.showNotification(`已复制颜色值: ${color}`, 'success')
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)
  }

  showError(message) {
    this.showNotification(message, 'error')
  }

  // 复制颜色值
  async copyColor(color) {
    try {
      await navigator.clipboard.writeText(color)
      this.showNotification(`已复制颜色值: ${color}`, 'success')
    } catch {
      this.showNotification('复制失败', 'error')
    }
  }
}

// 启动应用
// eslint-disable-next-line no-new
new ColorDemo()
