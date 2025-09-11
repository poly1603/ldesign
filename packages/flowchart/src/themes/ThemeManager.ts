/**
 * 主题管理器
 *
 * 管理审批流程图编辑器的主题系统，支持动态主题切换和样式注入
 */

import type { LogicFlow } from '@logicflow/core'
import type { ThemeConfig } from '../types'
import { DefaultTheme } from './DefaultTheme'
import { DarkTheme } from './DarkTheme'
import { BlueTheme } from './BlueTheme'

/**
 * 主题管理器类
 */
export class ThemeManager {
  private lf: LogicFlow
  private currentTheme: string = 'default'
  private themes: Map<string, ThemeConfig> = new Map()
  private styleElement: HTMLStyleElement | null = null
  private container: HTMLElement

  /**
   * 构造函数
   * @param lf LogicFlow 实例
   */
  constructor(lf: LogicFlow) {
    this.lf = lf
    this.container = lf.container

    // 注册内置主题
    this.registerTheme('default', DefaultTheme)
    this.registerTheme('dark', DarkTheme)
    this.registerTheme('blue', BlueTheme)

    // 初始化样式元素
    this.initStyleElement()

    // 应用默认主题
    this.setTheme('default')
  }

  /**
   * 初始化样式元素
   */
  private initStyleElement(): void {
    // 创建样式元素
    this.styleElement = document.createElement('style')
    this.styleElement.setAttribute('data-flowchart-theme', 'true')

    // 添加到容器的父元素或 head
    const targetElement = this.container.parentElement || document.head
    targetElement.appendChild(this.styleElement)
  }

  /**
   * 注册主题
   * @param name 主题名称
   * @param theme 主题配置
   */
  registerTheme(name: string, theme: ThemeConfig): void {
    this.themes.set(name, theme)
  }

  /**
   * 设置主题
   * @param theme 主题名称或主题配置对象
   */
  setTheme(theme: string | ThemeConfig): void {
    let themeConfig: ThemeConfig

    if (typeof theme === 'string') {
      const registeredTheme = this.themes.get(theme)
      if (!registeredTheme) {
        console.warn(`主题 "${theme}" 不存在，使用默认主题`)
        themeConfig = this.themes.get('default')!
      } else {
        themeConfig = registeredTheme
        this.currentTheme = theme
      }
    } else {
      themeConfig = theme
      this.currentTheme = 'custom'
    }

    // 应用主题
    this.applyTheme(themeConfig)
  }

  /**
   * 获取当前主题名称
   */
  getCurrentTheme(): string {
    return this.currentTheme
  }

  /**
   * 获取所有已注册的主题名称
   */
  getThemeNames(): string[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 应用主题
   * @param theme 主题配置
   */
  private applyTheme(theme: ThemeConfig): void {
    // 注入 CSS 样式
    this.injectStyles(theme)

    // 构建 LogicFlow 主题配置
    const lfTheme: any = {}

    // 应用节点样式
    Object.entries(theme.nodes).forEach(([nodeType, nodeStyle]) => {
      lfTheme[nodeType] = nodeStyle
    })

    // 应用边样式
    lfTheme.line = theme.edges
    lfTheme.polyline = theme.edges
    lfTheme.bezier = theme.edges

    // 应用画布样式
    if (theme.canvas.backgroundColor) {
      this.setCanvasBackground(theme.canvas.backgroundColor)
    }

    // 设置 LogicFlow 主题
    this.lf.setTheme(lfTheme)
  }

  /**
   * 设置画布背景
   * @param backgroundColor 背景颜色
   */
  private setCanvasBackground(backgroundColor: string): void {
    const container = this.lf.container
    if (container) {
      container.style.backgroundColor = backgroundColor
    }
  }

  /**
   * 切换到下一个主题
   */
  switchToNextTheme(): void {
    const themeNames = this.getThemeNames()
    const currentIndex = themeNames.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themeNames.length
    const nextTheme = themeNames[nextIndex]

    this.setTheme(nextTheme)
  }

  /**
   * 重置为默认主题
   */
  resetToDefault(): void {
    this.setTheme('default')
  }

  /**
   * 注入样式
   * @param theme 主题配置
   */
  private injectStyles(theme: ThemeConfig): void {
    if (!this.styleElement) return

    const css = this.generateCSS(theme)
    this.styleElement.textContent = css
  }

  /**
   * 生成 CSS 样式
   * @param theme 主题配置
   */
  private generateCSS(theme: ThemeConfig): string {
    const containerId = this.container.id || 'flowchart-container'
    let css = `
/* Flowchart Theme: ${theme.name} */
#${containerId} {
  background-color: ${theme.canvas.backgroundColor};
}

/* 节点样式 */
`

    // 生成节点样式
    Object.entries(theme.nodes).forEach(([nodeType, style]) => {
      css += this.generateNodeCSS(containerId, nodeType, style)
    })

    // 生成边样式
    css += this.generateEdgeCSS(containerId, theme.edges)

    return css
  }

  /**
   * 生成节点 CSS
   * @param containerId 容器 ID
   * @param nodeType 节点类型
   * @param style 样式配置
   */
  private generateNodeCSS(containerId: string, nodeType: string, style: NodeStyleConfig): string {
    return `
#${containerId} .lf-node-${nodeType} .lf-node-shape {
  fill: ${style.fill};
  stroke: ${style.stroke};
  stroke-width: ${style.strokeWidth}px;
}

#${containerId} .lf-node-${nodeType} .lf-node-text {
  font-size: ${style.fontSize}px;
  fill: ${style.fontColor};
}

#${containerId} .lf-node-${nodeType}:hover .lf-node-shape {
  opacity: 0.8;
}

#${containerId} .lf-node-${nodeType}.lf-node-selected .lf-node-shape {
  stroke-width: ${(style.strokeWidth || 2) + 1}px;
  filter: drop-shadow(0 0 6px ${style.stroke});
}
`
  }

  /**
   * 生成边 CSS
   * @param containerId 容器 ID
   * @param edgeStyle 边样式配置
   */
  private generateEdgeCSS(containerId: string, edgeStyle: any): string {
    return `
#${containerId} .lf-edge .lf-edge-path {
  stroke: ${edgeStyle.stroke};
  stroke-width: ${edgeStyle.strokeWidth}px;
  stroke-dasharray: ${edgeStyle.strokeDasharray};
}

#${containerId} .lf-edge:hover .lf-edge-path {
  stroke-width: ${(edgeStyle.strokeWidth || 2) + 1}px;
}

#${containerId} .lf-edge.lf-edge-selected .lf-edge-path {
  stroke-width: ${(edgeStyle.strokeWidth || 2) + 1}px;
  filter: drop-shadow(0 0 4px ${edgeStyle.stroke});
}
`
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    if (this.styleElement && this.styleElement.parentElement) {
      this.styleElement.parentElement.removeChild(this.styleElement)
      this.styleElement = null
    }
  }
}
