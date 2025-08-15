/**
 * @ldesign/theme - 挂件管理器
 *
 * 统一管理挂件的应用、移除和主题切换
 */

import type {
  WidgetManager,
  WidgetType,
  WidgetConfig,
  WidgetPosition,
  WidgetSize,
} from '../widgets/element-decorations'
import type { FestivalThemeConfig } from './festival-theme-config'
import {
  generateWidgetClass,
  generateThemeWidgetClass,
  validateWidgetConfig,
} from '../widgets/element-decorations'

/**
 * 挂件管理器实现
 */
export class WidgetManagerImpl implements WidgetManager {
  private currentTheme: string = 'default'
  private themeConfigs: Map<string, FestivalThemeConfig> = new Map()
  private appliedWidgets: Map<HTMLElement, Set<WidgetType>> = new Map()
  private styleElement: HTMLStyleElement | null = null

  constructor() {
    this.initializeStyles()
  }

  /**
   * 初始化样式元素
   */
  private initializeStyles(): void {
    this.styleElement = document.createElement('style')
    this.styleElement.id = 'ldesign-widget-styles'
    document.head.appendChild(this.styleElement)
  }

  /**
   * 注册主题挂件集合
   */
  registerThemeWidgets(themeConfig: FestivalThemeConfig): void {
    this.themeConfigs.set(themeConfig.id, themeConfig)
    this.updateThemeStyles(themeConfig)
  }

  /**
   * 应用挂件到元素
   */
  applyWidget(element: HTMLElement, widgetType: WidgetType): void {
    const themeConfig = this.themeConfigs.get(this.currentTheme)
    if (!themeConfig) {
      console.warn(`Theme config not found for theme: ${this.currentTheme}`)
      return
    }

    // 查找对应的挂件配置
    const widgetConfig = themeConfig.widgets.find(w => w.type === widgetType)
    if (!widgetConfig || !widgetConfig.enabled) {
      console.warn(
        `Widget config not found or disabled for type: ${widgetType}`
      )
      return
    }

    // 验证挂件配置
    if (!validateWidgetConfig(widgetConfig)) {
      console.error(`Invalid widget config for type: ${widgetType}`)
      return
    }

    // 应用挂件样式
    this.applyWidgetToElement(element, widgetConfig)

    // 记录已应用的挂件
    if (!this.appliedWidgets.has(element)) {
      this.appliedWidgets.set(element, new Set())
    }
    this.appliedWidgets.get(element)!.add(widgetType)
  }

  /**
   * 移除元素的挂件
   */
  removeWidget(element: HTMLElement, widgetType?: WidgetType): void {
    const appliedTypes = this.appliedWidgets.get(element)
    if (!appliedTypes) return

    if (widgetType) {
      // 移除特定类型的挂件
      this.removeWidgetFromElement(element, widgetType)
      appliedTypes.delete(widgetType)
    } else {
      // 移除所有挂件
      appliedTypes.forEach(type => {
        this.removeWidgetFromElement(element, type)
      })
      appliedTypes.clear()
    }

    // 如果元素没有任何挂件，从记录中移除
    if (appliedTypes.size === 0) {
      this.appliedWidgets.delete(element)
    }
  }

  /**
   * 切换主题
   */
  switchTheme(theme: string): void {
    const oldTheme = this.currentTheme
    this.currentTheme = theme

    // 重新应用所有已应用的挂件
    this.appliedWidgets.forEach((widgetTypes, element) => {
      widgetTypes.forEach(widgetType => {
        // 先移除旧主题的样式
        this.removeWidgetFromElement(element, widgetType, oldTheme)
        // 再应用新主题的样式
        this.applyWidget(element, widgetType)
      })
    })
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string {
    return this.currentTheme
  }

  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themeConfigs.keys())
  }

  /**
   * 应用挂件到具体元素
   */
  private applyWidgetToElement(
    element: HTMLElement,
    config: WidgetConfig
  ): void {
    // 生成基础挂件类名
    const baseClass = generateWidgetClass(
      config.type,
      config.position,
      config.size
    )
    const themeClass = generateThemeWidgetClass(this.currentTheme, config.type)

    // 添加CSS类
    element.classList.add(baseClass, themeClass)

    // 设置自定义属性
    element.setAttribute('data-widget-type', config.type)
    element.setAttribute('data-widget-theme', this.currentTheme)
    element.setAttribute('data-widget-position', config.position)
    element.setAttribute('data-widget-size', config.size)
    element.setAttribute('data-widget-animation', config.animation)

    // 应用内联样式（如果需要）
    if (config.opacity !== undefined) {
      element.style.setProperty('--widget-opacity', config.opacity.toString())
    }
    if (config.zIndex !== undefined) {
      element.style.setProperty('--widget-z-index', config.zIndex.toString())
    }

    // 创建并插入SVG装饰元素
    this.createWidgetDecoration(element, config)
  }

  /**
   * 从元素移除挂件
   */
  private removeWidgetFromElement(
    element: HTMLElement,
    widgetType: WidgetType,
    theme?: string
  ): void {
    const targetTheme = theme || this.currentTheme
    const themeClass = generateThemeWidgetClass(targetTheme, widgetType)

    // 移除CSS类
    element.classList.remove(themeClass)

    // 移除挂件相关的类（如果没有其他挂件）
    const remainingWidgets = this.appliedWidgets.get(element)
    if (!remainingWidgets || remainingWidgets.size <= 1) {
      // 移除所有挂件相关的类和属性
      element.removeAttribute('data-widget-type')
      element.removeAttribute('data-widget-theme')
      element.removeAttribute('data-widget-position')
      element.removeAttribute('data-widget-size')
      element.removeAttribute('data-widget-animation')
      element.style.removeProperty('--widget-opacity')
      element.style.removeProperty('--widget-z-index')
    }

    // 移除SVG装饰元素
    this.removeWidgetDecoration(element, widgetType)
  }

  /**
   * 创建挂件装饰元素
   */
  private createWidgetDecoration(
    element: HTMLElement,
    config: WidgetConfig
  ): void {
    const decorationId = `widget-decoration-${config.type}-${Date.now()}`

    // 创建装饰容器
    const decoration = document.createElement('div')
    decoration.id = decorationId
    decoration.className = `ldesign-widget-decoration ldesign-widget-decoration-${config.type}`
    decoration.setAttribute('data-widget-type', config.type)
    decoration.setAttribute('data-widget-position', config.position)

    // 设置SVG内容
    decoration.innerHTML = `
      <svg 
        class="ldesign-widget-svg" 
        viewBox="${config.icon.viewBox}"
        style="
          width: var(--widget-size-${config.size});
          height: var(--widget-size-${config.size});
          opacity: ${config.opacity || 1};
          z-index: ${config.zIndex || 1000};
        "
      >
        ${config.icon.content}
      </svg>
    `

    // 设置装饰位置
    this.positionDecoration(decoration, config.position)

    // 应用动画
    if (config.animation !== 'none') {
      decoration.style.animation = `ldesign-${config.animation} var(--animation-duration, 2s) var(--animation-timing, ease-in-out) var(--animation-iteration, infinite)`
    }

    // 插入到元素中
    element.style.position = element.style.position || 'relative'
    element.appendChild(decoration)

    // 存储装饰元素引用
    element.setAttribute(`data-decoration-${config.type}`, decorationId)
  }

  /**
   * 移除挂件装饰元素
   */
  private removeWidgetDecoration(
    element: HTMLElement,
    widgetType: WidgetType
  ): void {
    const decorationId = element.getAttribute(`data-decoration-${widgetType}`)
    if (decorationId) {
      const decoration = document.getElementById(decorationId)
      if (decoration) {
        decoration.remove()
      }
      element.removeAttribute(`data-decoration-${widgetType}`)
    }
  }

  /**
   * 设置装饰元素位置
   */
  private positionDecoration(
    decoration: HTMLElement,
    position: WidgetPosition
  ): void {
    decoration.style.position = 'absolute'
    decoration.style.pointerEvents = 'none'

    switch (position) {
      case 'top-left':
        decoration.style.top = '0'
        decoration.style.left = '0'
        break
      case 'top-right':
        decoration.style.top = '0'
        decoration.style.right = '0'
        break
      case 'bottom-left':
        decoration.style.bottom = '0'
        decoration.style.left = '0'
        break
      case 'bottom-right':
        decoration.style.bottom = '0'
        decoration.style.right = '0'
        break
      case 'center':
        decoration.style.top = '50%'
        decoration.style.left = '50%'
        decoration.style.transform = 'translate(-50%, -50%)'
        break
      case 'top-center':
        decoration.style.top = '0'
        decoration.style.left = '50%'
        decoration.style.transform = 'translateX(-50%)'
        break
      case 'bottom-center':
        decoration.style.bottom = '0'
        decoration.style.left = '50%'
        decoration.style.transform = 'translateX(-50%)'
        break
      case 'left-center':
        decoration.style.left = '0'
        decoration.style.top = '50%'
        decoration.style.transform = 'translateY(-50%)'
        break
      case 'right-center':
        decoration.style.right = '0'
        decoration.style.top = '50%'
        decoration.style.transform = 'translateY(-50%)'
        break
      default:
        decoration.style.top = '0'
        decoration.style.right = '0'
    }
  }

  /**
   * 更新主题样式
   */
  private updateThemeStyles(themeConfig: FestivalThemeConfig): void {
    if (!this.styleElement) return

    // 生成主题相关的CSS
    const css = this.generateThemeCSS(themeConfig)
    this.styleElement.textContent += css
  }

  /**
   * 生成主题CSS
   */
  private generateThemeCSS(themeConfig: FestivalThemeConfig): string {
    const { id: themeId, cssVariables, animations } = themeConfig

    let css = `
      /* Theme: ${themeId} */
      [data-theme="${themeId}"] {
    `

    // 添加CSS变量
    Object.entries(cssVariables).forEach(([key, value]) => {
      css += `    ${key}: ${value};\n`
    })

    css += '  }\n\n'

    // 添加动画定义
    if (animations) {
      animations.forEach(animation => {
        css += `
          @keyframes ldesign-${animation.name} {
            /* Animation keyframes would be defined here */
          }
        `
      })
    }

    return css
  }
}

/**
 * 创建挂件管理器实例
 */
export function createWidgetManager(): WidgetManager {
  return new WidgetManagerImpl()
}

/**
 * 全局挂件管理器实例
 */
export const globalWidgetManager = createWidgetManager()
