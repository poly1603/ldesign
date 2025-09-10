/**
 * @file 主题工厂函数
 * @description 提供创建自定义节日主题的工厂函数
 */

import type { FestivalThemeConfig, WidgetConfig, AnimationConfig } from '../../core/types'
import { FestivalType, WidgetType } from '../../core/types'

/**
 * 主题创建选项
 */
export interface ThemeFactoryOptions {
  /** 主题描述 */
  description?: string
  /** 主色调 */
  primaryColor?: string
  /** 次要颜色 */
  secondaryColor?: string
  /** 强调色 */
  accentColor?: string
  /** 背景色 */
  backgroundColor?: string
  /** 表面色 */
  surfaceColor?: string
  /** 自定义挂件 */
  customWidgets?: WidgetConfig[]
  /** 全局动画 */
  globalAnimations?: AnimationConfig[]
  /** 激活回调 */
  onActivate?: () => void | Promise<void>
  /** 停用回调 */
  onDeactivate?: () => void | Promise<void>
  /** 自定义配置 */
  customConfig?: Record<string, any>
}

/**
 * 创建自定义节日主题
 * 
 * @param id 主题唯一标识
 * @param name 主题名称
 * @param festival 节日类型
 * @param options 主题选项
 * @returns 节日主题配置
 * 
 * @example
 * ```typescript
 * import { createFestivalTheme, FestivalType, WidgetType } from '@ldesign/theme'
 * 
 * const customTheme = createFestivalTheme(
 *   'my-festival',
 *   '我的节日',
 *   FestivalType.DEFAULT,
 *   {
 *     description: '自定义节日主题',
 *     primaryColor: '#FF6B6B',
 *     secondaryColor: '#4ECDC4',
 *     customWidgets: [
 *       {
 *         id: 'custom-decoration',
 *         name: '自定义装饰',
 *         type: WidgetType.FLOATING,
 *         content: '<svg>...</svg>',
 *         position: { type: 'fixed', position: { x: '50%', y: '50%' }, anchor: 'center' }
 *       }
 *     ]
 *   }
 * )
 * ```
 */
export function createFestivalTheme(
  id: string,
  name: string,
  festival: FestivalType,
  options: ThemeFactoryOptions = {}
): FestivalThemeConfig {
  const {
    description = `自定义${name}主题`,
    primaryColor = '#722ED1',
    secondaryColor = '#52C41A',
    accentColor = '#1890FF',
    backgroundColor = '#FFFFFF',
    surfaceColor = '#FAFAFA',
    customWidgets = [],
    globalAnimations = [],
    onActivate,
    onDeactivate,
    customConfig = {}
  } = options

  // 生成颜色配置
  const colors = {
    name: `${id}-colors`,
    displayName: `${name}配色`,
    light: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      background: backgroundColor,
      surface: surfaceColor,
      onPrimary: getContrastColor(primaryColor),
      onSecondary: getContrastColor(secondaryColor),
      onBackground: getContrastColor(backgroundColor),
      onSurface: getContrastColor(surfaceColor),
      success: '#52C41A',
      warning: '#FAAD14',
      error: '#F5222D',
      info: '#1890FF',
      border: '#D9D9D9',
      divider: '#F0F0F0'
    },
    dark: {
      primary: adjustColorBrightness(primaryColor, -0.2),
      secondary: adjustColorBrightness(secondaryColor, -0.2),
      accent: adjustColorBrightness(accentColor, -0.2),
      background: '#141414',
      surface: '#1F1F1F',
      onPrimary: '#FFFFFF',
      onSecondary: '#FFFFFF',
      onBackground: '#FFFFFF',
      onSurface: '#FFFFFF',
      success: '#52C41A',
      warning: '#FAAD14',
      error: '#F5222D',
      info: '#1890FF',
      border: '#434343',
      divider: '#303030'
    }
  }

  // 默认挂件（如果没有提供自定义挂件）
  const defaultWidgets: WidgetConfig[] = customWidgets.length > 0 ? customWidgets : [
    {
      id: `${id}-default-decoration`,
      name: '默认装饰',
      type: WidgetType.BACKGROUND,
      content: `
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="10" fill="${primaryColor}" opacity="0.3"/>
          <circle cx="15" cy="15" r="5" fill="${accentColor}" opacity="0.6"/>
        </svg>
      `,
      position: {
        type: 'fixed',
        position: { x: '90%', y: '10%' },
        anchor: 'top-right'
      },
      style: {
        zIndex: 900,
        opacity: 0.7
      },
      animation: {
        name: 'pulse',
        duration: 3000,
        iterations: 'infinite',
        autoplay: true
      },
      visible: true
    }
  ]

  // 默认全局动画
  const defaultGlobalAnimations: AnimationConfig[] = globalAnimations.length > 0 ? globalAnimations : [
    {
      name: 'customGlow',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true
    }
  ]

  return {
    id,
    name,
    festival,
    description,
    colors,
    widgets: defaultWidgets,
    globalAnimations: defaultGlobalAnimations,
    onActivate: onActivate || (async () => {
      console.log(`🎨 ${name}已激活！`)
      
      // 添加自定义全局样式
      const style = document.createElement('style')
      style.id = `${id}-global-styles`
      style.textContent = `
        .ldesign-widget-${id} {
          filter: drop-shadow(0 0 8px ${primaryColor}40);
        }
        
        .ldesign-${id}-glow {
          animation: customGlow 3s ease-in-out infinite alternate;
        }
        
        @keyframes customGlow {
          from { filter: drop-shadow(0 0 5px ${primaryColor}); }
          to { filter: drop-shadow(0 0 15px ${accentColor}); }
        }
      `
      document.head.appendChild(style)
    }),
    onDeactivate: onDeactivate || (async () => {
      console.log(`${name}已停用`)
      
      // 移除全局样式
      const style = document.getElementById(`${id}-global-styles`)
      if (style) {
        style.remove()
      }
    }),
    customConfig
  }
}

/**
 * 根据背景色获取对比色（黑色或白色）
 * @param color 颜色值（HEX格式）
 * @returns 对比色
 */
function getContrastColor(color: string): string {
  // 移除 # 符号
  const hex = color.replace('#', '')
  
  // 转换为 RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // 根据亮度返回对比色
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

/**
 * 调整颜色亮度
 * @param color 颜色值（HEX格式）
 * @param amount 调整量（-1 到 1）
 * @returns 调整后的颜色
 */
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '')
  
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount)))
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount)))
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount)))
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * 创建简单的装饰挂件
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content SVG内容
 * @param position 位置配置
 * @param animation 动画配置
 * @returns 挂件配置
 */
export function createSimpleWidget(
  id: string,
  name: string,
  content: string,
  position: { x: string, y: string, anchor?: string },
  animation?: Partial<AnimationConfig>
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.FLOATING,
    content,
    position: {
      type: 'fixed',
      position: { x: position.x, y: position.y },
      anchor: (position.anchor as any) || 'center'
    },
    style: {
      zIndex: 900,
      opacity: 0.8
    },
    animation: animation ? {
      name: 'float',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true,
      ...animation
    } : undefined,
    interactive: true,
    responsive: true,
    visible: true
  }
}

/**
 * 创建背景装饰挂件
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content SVG内容
 * @param position 位置配置
 * @returns 挂件配置
 */
export function createBackgroundWidget(
  id: string,
  name: string,
  content: string,
  position: { x: string, y: string }
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.BACKGROUND,
    content,
    position: {
      type: 'fixed',
      position: { x: position.x, y: position.y },
      anchor: 'center'
    },
    style: {
      zIndex: 800,
      opacity: 0.6
    },
    animation: {
      name: 'sparkle',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true
    },
    visible: true
  }
}

/**
 * 预定义的节日主题模板
 */
export const themeTemplates = {
  /** 春节模板 */
  springFestival: {
    primaryColor: '#DC143C',
    secondaryColor: '#FFD700',
    accentColor: '#FF6B35',
    backgroundColor: '#FFF8F0'
  },
  /** 圣诞节模板 */
  christmas: {
    primaryColor: '#C41E3A',
    secondaryColor: '#228B22',
    accentColor: '#FFD700',
    backgroundColor: '#F8F8FF'
  },
  /** 万圣节模板 */
  halloween: {
    primaryColor: '#FF6B35',
    secondaryColor: '#2C2C2C',
    accentColor: '#8B008B',
    backgroundColor: '#FFF8DC'
  },
  /** 情人节模板 */
  valentines: {
    primaryColor: '#FF69B4',
    secondaryColor: '#DC143C',
    accentColor: '#FFB6C1',
    backgroundColor: '#FFF0F5'
  },
  /** 中秋节模板 */
  midAutumn: {
    primaryColor: '#C0C0C0',
    secondaryColor: '#DAA520',
    accentColor: '#F0E68C',
    backgroundColor: '#F5F5DC'
  }
} as const
