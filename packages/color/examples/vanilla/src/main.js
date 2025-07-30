/**
 * @ldesign/color Vanilla JavaScript 示例
 */

import {
  createCustomTheme,
  createThemeManagerWithPresets,
  generateColorConfig,
  getRandomPresetTheme,
  getSystemTheme,
  watchSystemTheme,
} from '@ldesign/color'

class ColorDemo {
  constructor() {
    this.themeManager = null
    this.systemThemeWatcher = null
    this.elements = {}
    this.init()
  }

  async init() {
    try {
      // 初始化 DOM 元素引用
      this.initElements()

      // 创建主题管理器
      await this.initThemeManager()

      // 绑定事件监听器
      this.bindEvents()

      // 初始化系统主题监听
      this.initSystemThemeWatcher()

      // 更新 UI
      this.updateUI()

      // 显示色阶
      this.displayColorScales()

      // 显示性能信息
      this.updatePerformanceStats()

      console.log('🎨 Color Demo 初始化完成')
    }
    catch (error) {
      console.error('初始化失败:', error)
      this.showError(`初始化失败: ${error.message}`)
    }
  }

  initElements() {
    this.elements = {
      themeSelect: document.getElementById('theme-select'),
      modeSelect: document.getElementById('mode-select'),
      toggleModeBtn: document.getElementById('toggle-mode'),
      randomThemeBtn: document.getElementById('random-theme'),
      systemSyncBtn: document.getElementById('system-sync'),
      currentTheme: document.getElementById('current-theme'),
      currentMode: document.getElementById('current-mode'),
      systemTheme: document.getElementById('system-theme'),
      primaryColorInput: document.getElementById('primary-color'),
      generateColorsBtn: document.getElementById('generate-colors'),
      generatedColors: document.getElementById('generated-colors'),
      colorScalesContainer: document.getElementById('color-scales-container'),
      customName: document.getElementById('custom-name'),
      customPrimary: document.getElementById('custom-primary'),
      customDarkPrimary: document.getElementById('custom-dark-primary'),
      createCustomThemeBtn: document.getElementById('create-custom-theme'),
      performanceStats: document.getElementById('performance-stats'),
    }
  }

  async initThemeManager() {
    this.themeManager = await createThemeManagerWithPresets({
      defaultTheme: 'default',
      autoDetect: true,
      idleProcessing: true,
      onThemeChanged: (theme, mode) => {
        console.log(`主题已切换: ${theme} - ${mode}`)
        this.updateUI()
        this.displayColorScales()
      },
      onError: (error) => {
        console.error('主题管理器错误:', error)
        this.showError(`主题错误: ${error.message}`)
      },
    })

    // 预生成所有主题以提升性能
    await this.themeManager.preGenerateAllThemes()

    // 填充主题选择器
    this.populateThemeSelect()
  }

  populateThemeSelect() {
    const themes = this.themeManager.getThemeNames()
    this.elements.themeSelect.innerHTML = ''

    themes.forEach((themeName) => {
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

  bindEvents() {
    // 主题选择
    this.elements.themeSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        this.themeManager.setTheme(e.target.value)
      }
    })

    // 模式选择
    this.elements.modeSelect.addEventListener('change', (e) => {
      this.themeManager.setMode(e.target.value)
    })

    // 切换模式按钮
    this.elements.toggleModeBtn.addEventListener('click', () => {
      const currentMode = this.themeManager.getCurrentMode()
      const newMode = currentMode === 'light' ? 'dark' : 'light'
      this.themeManager.setMode(newMode)
    })

    // 随机主题按钮
    this.elements.randomThemeBtn.addEventListener('click', () => {
      const randomTheme = getRandomPresetTheme()
      this.themeManager.setTheme(randomTheme.name)
    })

    // 同步系统主题按钮
    this.elements.systemSyncBtn.addEventListener('click', () => {
      const systemTheme = getSystemTheme()
      this.themeManager.setMode(systemTheme)
    })

    // 生成颜色按钮
    this.elements.generateColorsBtn.addEventListener('click', () => {
      this.generateAndDisplayColors()
    })

    // 创建自定义主题按钮
    this.elements.createCustomThemeBtn.addEventListener('click', () => {
      this.createCustomTheme()
    })

    // 主色调输入变化
    this.elements.primaryColorInput.addEventListener('input', () => {
      this.generateAndDisplayColors()
    })
  }

  initSystemThemeWatcher() {
    this.systemThemeWatcher = watchSystemTheme((mode) => {
      this.elements.systemTheme.textContent = mode
    })

    // 初始设置
    this.elements.systemTheme.textContent = getSystemTheme()
  }

  updateUI() {
    const currentTheme = this.themeManager.getCurrentTheme()
    const currentMode = this.themeManager.getCurrentMode()

    // 更新状态显示
    this.elements.currentTheme.textContent = currentTheme
    this.elements.currentMode.textContent = currentMode

    // 更新选择器
    this.elements.themeSelect.value = currentTheme
    this.elements.modeSelect.value = currentMode

    // 更新切换按钮文本
    const nextMode = currentMode === 'light' ? '暗色' : '亮色'
    this.elements.toggleModeBtn.textContent = `切换到${nextMode}模式`
  }

  generateAndDisplayColors() {
    const primaryColor = this.elements.primaryColorInput.value

    try {
      const colorConfig = generateColorConfig(primaryColor)
      this.displayGeneratedColors(colorConfig)
    }
    catch (error) {
      console.error('颜色生成失败:', error)
      this.showError(`颜色生成失败: ${error.message}`)
    }
  }

  displayGeneratedColors(colorConfig) {
    const container = this.elements.generatedColors
    container.innerHTML = ''

    const colorCategories = [
      { key: 'primary', name: '主色调', color: colorConfig.primary },
      { key: 'success', name: '成功色', color: colorConfig.success },
      { key: 'warning', name: '警告色', color: colorConfig.warning },
      { key: 'danger', name: '危险色', color: colorConfig.danger },
      { key: 'gray', name: '灰色', color: colorConfig.gray },
    ]

    colorCategories.forEach(({ key, name, color }) => {
      const colorItem = document.createElement('div')
      colorItem.className = 'color-item'

      colorItem.innerHTML = `
        <div class="color-preview" style="background-color: ${color}">
          ${name}
        </div>
        <div class="color-info">
          <div class="color-name">${name}</div>
          <div class="color-value">${color}</div>
        </div>
      `

      // 点击复制颜色值
      colorItem.addEventListener('click', () => {
        this.copyToClipboard(color)
        this.showToast(`已复制 ${color}`)
      })

      container.appendChild(colorItem)
    })
  }

  async displayColorScales() {
    const container = this.elements.colorScalesContainer
    container.innerHTML = ''

    try {
      const currentTheme = this.themeManager.getCurrentTheme()
      const currentMode = this.themeManager.getCurrentMode()
      const generatedTheme = this.themeManager.getGeneratedTheme(currentTheme)

      if (!generatedTheme) {
        container.innerHTML = '<p>主题数据加载中...</p>'
        return
      }

      const scales = generatedTheme[currentMode].scales
      const colorCategories = ['primary', 'success', 'warning', 'danger', 'gray']

      colorCategories.forEach((category) => {
        if (scales[category]) {
          const scaleGroup = this.createScaleGroup(category, scales[category])
          container.appendChild(scaleGroup)
        }
      })
    }
    catch (error) {
      console.error('色阶显示失败:', error)
      container.innerHTML = '<p>色阶加载失败</p>'
    }
  }

  createScaleGroup(categoryName, scale) {
    const group = document.createElement('div')
    group.className = 'scale-group'

    const header = document.createElement('div')
    header.className = 'scale-header'
    header.textContent = this.getCategoryDisplayName(categoryName)

    const colorsContainer = document.createElement('div')
    colorsContainer.className = 'scale-colors'

    // 显示 10 级色阶
    for (let i = 1; i <= 10; i++) {
      const color = scale.indices[i]
      if (color) {
        const colorDiv = document.createElement('div')
        colorDiv.className = 'scale-color'
        colorDiv.style.backgroundColor = color
        colorDiv.textContent = i
        colorDiv.title = `${categoryName}-${i}: ${color}`

        // 点击复制
        colorDiv.addEventListener('click', () => {
          this.copyToClipboard(color)
          this.showToast(`已复制 ${color}`)
        })

        colorsContainer.appendChild(colorDiv)
      }
    }

    group.appendChild(header)
    group.appendChild(colorsContainer)
    return group
  }

  getCategoryDisplayName(category) {
    const names = {
      primary: '主色调',
      success: '成功色',
      warning: '警告色',
      danger: '危险色',
      gray: '灰色',
    }
    return names[category] || category
  }

  createCustomTheme() {
    const name = this.elements.customName.value.trim()
    const primaryColor = this.elements.customPrimary.value
    const darkPrimaryColor = this.elements.customDarkPrimary.value

    if (!name) {
      this.showError('请输入主题名称')
      return
    }

    try {
      const customTheme = createCustomTheme(name, primaryColor, {
        displayName: name,
        description: `自定义主题：${name}`,
        darkPrimaryColor,
      })

      this.themeManager.registerTheme(customTheme)
      this.populateThemeSelect()
      this.themeManager.setTheme(name)

      this.showToast(`自定义主题 "${name}" 创建成功！`)

      // 清空输入框
      this.elements.customName.value = ''
    }
    catch (error) {
      console.error('创建自定义主题失败:', error)
      this.showError(`创建自定义主题失败: ${error.message}`)
    }
  }

  updatePerformanceStats() {
    const stats = [
      {
        label: '可用主题数量',
        value: this.themeManager ? this.themeManager.getThemeNames().length : 0,
      },
      {
        label: '当前主题',
        value: this.themeManager ? this.themeManager.getCurrentTheme() : '-',
      },
      {
        label: '当前模式',
        value: this.themeManager ? this.themeManager.getCurrentMode() : '-',
      },
      {
        label: '系统主题',
        value: getSystemTheme(),
      },
      {
        label: '闲时处理',
        value: '已启用',
      },
      {
        label: '缓存状态',
        value: '已启用',
      },
    ]

    const container = this.elements.performanceStats
    container.innerHTML = ''

    stats.forEach((stat) => {
      const statItem = document.createElement('div')
      statItem.className = 'stat-item'

      statItem.innerHTML = `
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      `

      container.appendChild(statItem)
    })
  }

  // 工具方法
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      }
      else {
        // 回退方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
    }
    catch (error) {
      console.error('复制失败:', error)
    }
  }

  showToast(message, type = 'success') {
    // 创建简单的 toast 通知
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-${type === 'success' ? 'success' : 'danger'}, #52c41a);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `

    // 添加动画样式
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style')
      style.id = 'toast-styles'
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(toast)

    // 3秒后自动移除
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  showError(message) {
    this.showToast(message, 'error')
  }

  // 清理资源
  destroy() {
    if (this.systemThemeWatcher) {
      this.systemThemeWatcher()
    }

    if (this.themeManager) {
      this.themeManager.destroy()
    }
  }
}

// 初始化应用
let colorDemo

document.addEventListener('DOMContentLoaded', () => {
  colorDemo = new ColorDemo()
})

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
  if (colorDemo) {
    colorDemo.destroy()
  }
})

// 导出到全局作用域以便调试
window.colorDemo = colorDemo
