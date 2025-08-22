/**
 * @ldesign/theme - 挂件辅助函数
 *
 * 提供便捷的挂件应用和管理函数
 */

import type { WidgetType } from '../widgets/element-decorations'
import { globalWidgetManager } from './widget-manager'

/**
 * 为元素应用挂件的便捷函数
 */
export function applyWidget(
  selector: string | HTMLElement,
  widgetType: WidgetType
): void {
  const elements =
    typeof selector === 'string'
      ? document.querySelectorAll(selector)
      : [selector]

  elements.forEach(element => {
    if (element instanceof HTMLElement) {
      globalWidgetManager.applyWidget(element, widgetType)
    }
  })
}

/**
 * 移除元素的挂件
 */
export function removeWidget(
  selector: string | HTMLElement,
  widgetType?: WidgetType
): void {
  const elements =
    typeof selector === 'string'
      ? document.querySelectorAll(selector)
      : [selector]

  elements.forEach(element => {
    if (element instanceof HTMLElement) {
      globalWidgetManager.removeWidget(element, widgetType)
    }
  })
}

/**
 * 切换主题
 */
export function switchTheme(theme: string): void {
  globalWidgetManager.switchTheme(theme)

  // 更新文档的主题属性
  document.documentElement.setAttribute('data-theme', theme)

  // 触发主题切换事件
  const event = new CustomEvent('theme-changed', {
    detail: { theme, previousTheme: globalWidgetManager.getCurrentTheme() },
  })
  document.dispatchEvent(event)
}

/**
 * 获取当前主题
 */
export function getCurrentTheme(): string {
  return globalWidgetManager.getCurrentTheme()
}

/**
 * 获取可用主题列表
 */
export function getAvailableThemes(): string[] {
  return globalWidgetManager.getAvailableThemes()
}

/**
 * 批量应用挂件
 */
export function applyWidgets(
  configs: Array<{
    selector: string | HTMLElement
    widgetType: WidgetType
  }>
): void {
  configs.forEach(({ selector, widgetType }) => {
    applyWidget(selector, widgetType)
  })
}

/**
 * 为按钮应用挂件的便捷函数
 */
export function applyButtonWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'button')
}

/**
 * 为头部应用挂件的便捷函数
 */
export function applyHeaderWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'header')
}

/**
 * 为卡片应用挂件的便捷函数
 */
export function applyCardWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'card')
}

/**
 * 为面板应用挂件的便捷函数
 */
export function applyPanelWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'panel')
}

/**
 * 为背景应用挂件的便捷函数
 */
export function applyBackgroundWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'background')
}

/**
 * 为侧边栏应用挂件的便捷函数
 */
export function applySidebarWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'sidebar')
}

/**
 * 为输入框应用挂件的便捷函数
 */
export function applyInputWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'input')
}

/**
 * 为导航应用挂件的便捷函数
 */
export function applyNavigationWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'navigation')
}

/**
 * 为页脚应用挂件的便捷函数
 */
export function applyFooterWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'footer')
}

/**
 * 为模态框应用挂件的便捷函数
 */
export function applyModalWidget(selector: string | HTMLElement): void {
  applyWidget(selector, 'modal')
}

/**
 * 自动检测并应用挂件
 */
export function autoApplyWidgets(): void {
  // 自动为常见元素应用挂件
  const autoConfigs = [
    { selector: 'button, .btn', widgetType: 'button' as WidgetType },
    { selector: 'header, .header', widgetType: 'header' as WidgetType },
    { selector: '.card, .panel', widgetType: 'card' as WidgetType },
    { selector: 'aside, .sidebar', widgetType: 'sidebar' as WidgetType },
    { selector: 'input, .input', widgetType: 'input' as WidgetType },
    { selector: 'nav, .navigation', widgetType: 'navigation' as WidgetType },
    { selector: 'footer, .footer', widgetType: 'footer' as WidgetType },
    { selector: '.modal, .dialog', widgetType: 'modal' as WidgetType },
  ]

  autoConfigs.forEach(({ selector, widgetType }) => {
    const elements = document.querySelectorAll(selector)
    if (elements.length > 0) {
      applyWidget(selector, widgetType)
    }
  })
}

/**
 * 清除所有挂件
 */
export function clearAllWidgets(): void {
  const elements = document.querySelectorAll('[data-widget-type]')
  elements.forEach(element => {
    if (element instanceof HTMLElement) {
      globalWidgetManager.removeWidget(element)
    }
  })
}

/**
 * 初始化挂件系统
 */
export function initializeWidgetSystem(
  options: {
    theme?: string
    autoApply?: boolean
    loadStyles?: boolean
  } = {}
): void {
  const { theme = 'default', autoApply = false, loadStyles = true } = options

  // 加载样式
  if (loadStyles) {
    loadWidgetStyles()
  }

  // 设置初始主题
  switchTheme(theme)

  // 自动应用挂件
  if (autoApply) {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoApplyWidgets)
    } else {
      autoApplyWidgets()
    }
  }
}

/**
 * 加载挂件样式
 */
function loadWidgetStyles(): void {
  // 检查是否已经加载了样式
  if (document.getElementById('ldesign-widget-styles-base')) {
    return
  }

  // 创建样式链接
  const link = document.createElement('link')
  link.id = 'ldesign-widget-styles-base'
  link.rel = 'stylesheet'
  link.href = '/node_modules/@ldesign/theme/dist/styles/widget-styles.css'

  // 插入到头部
  document.head.appendChild(link)
}

/**
 * 监听主题切换事件
 */
export function onThemeChange(
  callback: (theme: string, previousTheme: string) => void
): () => void {
  const handler = (event: CustomEvent) => {
    callback(event.detail.theme, event.detail.previousTheme)
  }

  document.addEventListener('theme-changed', handler as EventListener)

  // 返回取消监听的函数
  return () => {
    document.removeEventListener('theme-changed', handler as EventListener)
  }
}

/**
 * 调试模式
 */
export function enableDebugMode(): void {
  document.documentElement.classList.add('ldesign-widget-debug')
}

/**
 * 关闭调试模式
 */
export function disableDebugMode(): void {
  document.documentElement.classList.remove('ldesign-widget-debug')
}
