/**
 * 主题切换器组件
 * 
 * 提供主题切换的UI组件
 */

import type { CalendarTheme, IThemeManager } from '../types/theme'

/**
 * 主题切换器配置
 */
export interface ThemeSwitcherConfig {
  /** 显示位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 显示样式 */
  style?: 'dropdown' | 'tabs' | 'buttons'
  /** 是否显示主题预览 */
  showPreview?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 是否显示主题名称 */
  showName?: boolean
  /** 是否显示主题描述 */
  showDescription?: boolean
}

/**
 * 主题切换器类
 */
export class ThemeSwitcher {
  private themeManager: IThemeManager
  private config: ThemeSwitcherConfig
  private container: HTMLElement | null = null
  private element: HTMLElement | null = null

  constructor(themeManager: IThemeManager, config: ThemeSwitcherConfig = {}) {
    this.themeManager = themeManager
    this.config = {
      position: 'top-right',
      style: 'dropdown',
      showPreview: true,
      showName: true,
      showDescription: false,
      ...config,
    }
  }

  /**
   * 渲染主题切换器
   * @param container 容器元素
   */
  render(container: HTMLElement): void {
    this.container = container
    this.createElement()
    this.bindEvents()
  }

  /**
   * 销毁主题切换器
   */
  destroy(): void {
    if (this.element) {
      this.element.remove()
      this.element = null
    }
    this.container = null
  }

  /**
   * 更新主题列表
   */
  update(): void {
    if (this.element) {
      this.destroy()
      if (this.container) {
        this.render(this.container)
      }
    }
  }

  /**
   * 创建元素
   */
  private createElement(): void {
    if (!this.container) return

    this.element = document.createElement('div')
    this.element.className = `ldesign-theme-switcher ${this.config.className || ''}`
    this.element.style.cssText = this.getPositionStyles()

    switch (this.config.style) {
      case 'dropdown':
        this.createDropdownStyle()
        break
      case 'tabs':
        this.createTabsStyle()
        break
      case 'buttons':
        this.createButtonsStyle()
        break
    }

    this.container.appendChild(this.element)
  }

  /**
   * 获取位置样式
   */
  private getPositionStyles(): string {
    const baseStyles = 'position: absolute; z-index: 1000;'
    
    switch (this.config.position) {
      case 'top-left':
        return `${baseStyles} top: 10px; left: 10px;`
      case 'top-right':
        return `${baseStyles} top: 10px; right: 10px;`
      case 'bottom-left':
        return `${baseStyles} bottom: 10px; left: 10px;`
      case 'bottom-right':
        return `${baseStyles} bottom: 10px; right: 10px;`
      default:
        return `${baseStyles} top: 10px; right: 10px;`
    }
  }

  /**
   * 创建下拉样式
   */
  private createDropdownStyle(): void {
    if (!this.element) return

    const currentTheme = this.themeManager.getCurrent()
    const themes = this.themeManager.getAll()

    // 创建触发按钮
    const trigger = document.createElement('button')
    trigger.className = 'ldesign-theme-switcher-trigger'
    trigger.textContent = currentTheme?.displayName || '选择主题'
    trigger.style.cssText = `
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    `

    // 创建下拉箭头
    const arrow = document.createElement('span')
    arrow.textContent = '▼'
    arrow.style.fontSize = '10px'
    trigger.appendChild(arrow)

    // 创建下拉菜单
    const dropdown = document.createElement('div')
    dropdown.className = 'ldesign-theme-switcher-dropdown'
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 4px 0;
      min-width: 150px;
      display: none;
      z-index: 1001;
    `

    // 添加主题选项
    themes.forEach(theme => {
      const option = this.createThemeOption(theme)
      dropdown.appendChild(option)
    })

    // 绑定下拉事件
    trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'
    })

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
      dropdown.style.display = 'none'
    })

    this.element.appendChild(trigger)
    this.element.appendChild(dropdown)
  }

  /**
   * 创建标签页样式
   */
  private createTabsStyle(): void {
    if (!this.element) return

    const themes = this.themeManager.getAll()
    const currentTheme = this.themeManager.getCurrent()

    const tabsContainer = document.createElement('div')
    tabsContainer.className = 'ldesign-theme-switcher-tabs'
    tabsContainer.style.cssText = `
      display: flex;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      overflow: hidden;
    `

    themes.forEach(theme => {
      const tab = document.createElement('button')
      tab.className = 'ldesign-theme-switcher-tab'
      tab.textContent = theme.displayName
      tab.style.cssText = `
        padding: 6px 12px;
        border: none;
        background: ${currentTheme?.name === theme.name ? '#f0f0f0' : 'white'};
        cursor: pointer;
        font-size: 12px;
        border-right: 1px solid #d9d9d9;
        transition: background-color 0.2s;
      `

      tab.addEventListener('click', () => {
        this.switchTheme(theme.name)
      })

      tab.addEventListener('mouseenter', () => {
        if (currentTheme?.name !== theme.name) {
          tab.style.backgroundColor = '#f8f8f8'
        }
      })

      tab.addEventListener('mouseleave', () => {
        if (currentTheme?.name !== theme.name) {
          tab.style.backgroundColor = 'white'
        }
      })

      tabsContainer.appendChild(tab)
    })

    this.element.appendChild(tabsContainer)
  }

  /**
   * 创建按钮样式
   */
  private createButtonsStyle(): void {
    if (!this.element) return

    const themes = this.themeManager.getAll()
    const currentTheme = this.themeManager.getCurrent()

    const buttonsContainer = document.createElement('div')
    buttonsContainer.className = 'ldesign-theme-switcher-buttons'
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 4px;
    `

    themes.forEach(theme => {
      const button = document.createElement('button')
      button.className = 'ldesign-theme-switcher-button'
      button.style.cssText = `
        padding: 8px 12px;
        border: 1px solid ${currentTheme?.name === theme.name ? theme.colors.primary : '#d9d9d9'};
        border-radius: 4px;
        background: ${currentTheme?.name === theme.name ? theme.colors.primary : 'white'};
        color: ${currentTheme?.name === theme.name ? 'white' : '#333'};
        cursor: pointer;
        font-size: 12px;
        text-align: left;
        transition: all 0.2s;
      `

      if (this.config.showPreview) {
        const preview = document.createElement('div')
        preview.style.cssText = `
          width: 12px;
          height: 12px;
          background: ${theme.colors.primary};
          border-radius: 2px;
          display: inline-block;
          margin-right: 8px;
        `
        button.appendChild(preview)
      }

      const text = document.createElement('span')
      text.textContent = theme.displayName
      button.appendChild(text)

      button.addEventListener('click', () => {
        this.switchTheme(theme.name)
      })

      buttonsContainer.appendChild(button)
    })

    this.element.appendChild(buttonsContainer)
  }

  /**
   * 创建主题选项
   */
  private createThemeOption(theme: CalendarTheme): HTMLElement {
    const option = document.createElement('div')
    option.className = 'ldesign-theme-switcher-option'
    option.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    `

    if (this.config.showPreview) {
      const preview = document.createElement('div')
      preview.style.cssText = `
        width: 12px;
        height: 12px;
        background: ${theme.colors.primary};
        border-radius: 2px;
        flex-shrink: 0;
      `
      option.appendChild(preview)
    }

    const content = document.createElement('div')
    content.style.cssText = 'flex: 1;'

    if (this.config.showName) {
      const name = document.createElement('div')
      name.textContent = theme.displayName
      name.style.fontWeight = '500'
      content.appendChild(name)
    }

    if (this.config.showDescription && theme.description) {
      const description = document.createElement('div')
      description.textContent = theme.description
      description.style.cssText = 'font-size: 10px; color: #666; margin-top: 2px;'
      content.appendChild(description)
    }

    option.appendChild(content)

    // 添加事件
    option.addEventListener('mouseenter', () => {
      option.style.backgroundColor = '#f5f5f5'
    })

    option.addEventListener('mouseleave', () => {
      option.style.backgroundColor = 'transparent'
    })

    option.addEventListener('click', () => {
      this.switchTheme(theme.name)
    })

    return option
  }

  /**
   * 切换主题
   */
  private switchTheme(themeName: string): void {
    try {
      this.themeManager.apply(themeName)
      this.update() // 更新UI状态
    } catch (error) {
      console.error('切换主题失败:', error)
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听主题变化事件
    this.themeManager.on('themeChange', () => {
      this.update()
    })
  }
}
