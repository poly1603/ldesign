/**
 * @ldesign/theme - 标准化挂件系统
 *
 * 设计理念：
 * - 基于 SVG 图标的标准化挂件系统
 * - 通过 CSS 自定义属性实现主题联动
 * - 支持通过简单的 CSS 类为任意元素添加挂件
 * - 每个节日主题有独特的 SVG 装饰，但挂件结构保持一致
 */

/**
 * 支持的挂件类型
 */
export type WidgetType =
  | 'button' // 按钮挂件
  | 'header' // 头部挂件
  | 'sidebar' // 侧边栏挂件
  | 'background' // 背景挂件
  | 'input' // 输入框挂件
  | 'panel' // 面板挂件
  | 'card' // 卡片挂件
  | 'navigation' // 导航挂件
  | 'footer' // 页脚挂件
  | 'modal' // 弹窗挂件

/**
 * 挂件装饰位置
 */
export type WidgetPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'left-center'
  | 'right-center'
  | 'corner-all' // 四个角落
  | 'edge-all' // 四个边缘

/**
 * 挂件尺寸规格
 */
export type WidgetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * 挂件动画类型
 */
export type WidgetAnimation =
  | 'none'
  | 'float'
  | 'bounce'
  | 'swing'
  | 'glow'
  | 'sparkle'
  | 'rotate'
  | 'pulse'
  | 'shake'

/**
 * SVG 图标配置
 */
export interface SVGIcon {
  /** SVG 内容 */
  content: string
  /** 图标尺寸 */
  viewBox: string
  /** 默认颜色（使用 CSS 变量） */
  fill?: string
  /** 描边颜色 */
  stroke?: string
  /** 描边宽度 */
  strokeWidth?: number
}

/**
 * 挂件配置接口
 */
export interface WidgetConfig {
  /** 挂件类型 */
  type: WidgetType
  /** 装饰位置 */
  position: WidgetPosition
  /** SVG 图标 */
  icon: SVGIcon
  /** 挂件尺寸 */
  size: WidgetSize
  /** 动画效果 */
  animation: WidgetAnimation
  /** 透明度 */
  opacity?: number
  /** 层级 */
  zIndex?: number
  /** 是否启用 */
  enabled?: boolean
  /** 响应式配置 */
  responsive?: {
    minWidth?: number
    maxWidth?: number
    hideOnMobile?: boolean
  }
}

/**
 * 主题挂件集合接口
 */
export interface ThemeWidgetSet {
  /** 主题名称 */
  theme: string
  /** 主题显示名称 */
  displayName: string
  /** 挂件配置列表 */
  widgets: WidgetConfig[]
}

/**
 * 挂件管理器接口
 */
export interface WidgetManager {
  /** 注册主题挂件集合 */
  registerThemeWidgets(themeWidgets: ThemeWidgetSet): void
  /** 应用挂件到元素 */
  applyWidget(element: HTMLElement, widgetType: WidgetType): void
  /** 移除元素的挂件 */
  removeWidget(element: HTMLElement, widgetType?: WidgetType): void
  /** 切换主题 */
  switchTheme(theme: string): void
  /** 获取当前主题 */
  getCurrentTheme(): string
  /** 获取可用主题列表 */
  getAvailableThemes(): string[]
}

/**
 * 生成挂件 CSS 类名
 */
export function generateWidgetClass(
  widgetType: WidgetType,
  position?: WidgetPosition,
  size?: WidgetSize
): string {
  const parts = ['ldesign-widget', widgetType]
  if (position) parts.push(position)
  if (size) parts.push(size)
  return parts.join('-')
}

/**
 * 生成主题特定的 CSS 类名
 */
export function generateThemeWidgetClass(
  theme: string,
  widgetType: WidgetType
): string {
  return `ldesign-theme-${theme}-${widgetType}`
}

/**
 * 检查挂件类型是否有效
 */
export function isValidWidgetType(type: string): type is WidgetType {
  const validTypes: WidgetType[] = [
    'button',
    'header',
    'sidebar',
    'background',
    'input',
    'panel',
    'card',
    'navigation',
    'footer',
    'modal',
  ]
  return validTypes.includes(type as WidgetType)
}

/**
 * 检查挂件位置是否有效
 */
export function isValidWidgetPosition(
  position: string
): position is WidgetPosition {
  const validPositions: WidgetPosition[] = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'center',
    'top-center',
    'bottom-center',
    'left-center',
    'right-center',
    'corner-all',
    'edge-all',
  ]
  return validPositions.includes(position as WidgetPosition)
}

/**
 * 获取所有支持的挂件类型
 */
export function getSupportedWidgetTypes(): WidgetType[] {
  return [
    'button',
    'header',
    'sidebar',
    'background',
    'input',
    'panel',
    'card',
    'navigation',
    'footer',
    'modal',
  ]
}

/**
 * 获取所有支持的挂件位置
 */
export function getSupportedWidgetPositions(): WidgetPosition[] {
  return [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'center',
    'top-center',
    'bottom-center',
    'left-center',
    'right-center',
    'corner-all',
    'edge-all',
  ]
}

/**
 * 获取所有支持的挂件尺寸
 */
export function getSupportedWidgetSizes(): WidgetSize[] {
  return ['xs', 'sm', 'md', 'lg', 'xl']
}

/**
 * 获取所有支持的挂件动画
 */
export function getSupportedWidgetAnimations(): WidgetAnimation[] {
  return [
    'none',
    'float',
    'bounce',
    'swing',
    'glow',
    'sparkle',
    'rotate',
    'pulse',
    'shake',
  ]
}

/**
 * 创建默认挂件配置
 */
export function createDefaultWidgetConfig(
  type: WidgetType,
  icon: SVGIcon,
  overrides?: Partial<WidgetConfig>
): WidgetConfig {
  return {
    type,
    position: 'top-right',
    icon,
    size: 'md',
    animation: 'none',
    opacity: 1,
    zIndex: 1000,
    enabled: true,
    ...overrides,
  }
}

/**
 * 验证挂件配置
 */
export function validateWidgetConfig(config: WidgetConfig): boolean {
  return (
    isValidWidgetType(config.type) &&
    isValidWidgetPosition(config.position) &&
    config.icon &&
    config.icon.content &&
    config.icon.viewBox &&
    getSupportedWidgetSizes().includes(config.size) &&
    getSupportedWidgetAnimations().includes(config.animation)
  )
}

/**
 * 获取元素装饰配置
 */
export function getElementDecorations(element: HTMLElement): WidgetConfig[] {
  const widgetType = element.getAttribute('data-widget-type') as WidgetType
  if (!widgetType) {
    return []
  }

  // 返回默认配置
  return [
    {
      type: widgetType,
      position: 'top-right',
      size: 'md',
      animation: 'glow',
      opacity: 0.8,
      zIndex: 1000,
      enabled: true,
      icon: {
        content: '<circle cx="50" cy="50" r="20" fill="currentColor"/>',
        viewBox: '0 0 100 100',
      },
    },
  ]
}

/**
 * 检查元素是否支持装饰
 */
export function isElementSupported(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase()
  const supportedTags = [
    'button',
    'div',
    'section',
    'header',
    'footer',
    'nav',
    'aside',
    'main',
    'article',
    'input',
    'textarea',
    'select',
  ]
  return supportedTags.includes(tagName)
}

/**
 * 生成装饰类名
 */
export function generateDecorationClass(
  type: WidgetType,
  position?: WidgetPosition,
  size?: WidgetSize
): string {
  let className = `ldesign-widget-${type}`
  if (position) {
    className += `-${position}`
  }
  if (size) {
    className += `-${size}`
  }
  return className
}
