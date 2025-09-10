/**
 * @file 默认主题配置
 * @description 默认主题的配置，提供基础的主题样式
 */

import type { FestivalThemeConfig, WidgetConfig } from '../core/types'
import { FestivalType, WidgetType } from '../core/types'

/**
 * 默认主题颜色配置
 * 基于现代简洁的设计风格
 */
const defaultColors = {
  name: 'default-colors',
  displayName: '默认配色',
  light: {
    // 主色调
    primary: '#722ED1',
    secondary: '#52C41A',
    accent: '#1890FF',
    
    // 背景色
    background: '#FFFFFF',
    surface: '#FAFAFA',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#262626',
    onSurface: '#262626',
    
    // 状态色
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#F5222D',
    info: '#1890FF',
    
    // 边框和分割线
    border: '#D9D9D9',
    divider: '#F0F0F0'
  },
  dark: {
    // 主色调
    primary: '#722ED1',
    secondary: '#52C41A',
    accent: '#1890FF',
    
    // 背景色
    background: '#141414',
    surface: '#1F1F1F',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    
    // 状态色
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#F5222D',
    info: '#1890FF',
    
    // 边框和分割线
    border: '#434343',
    divider: '#303030'
  }
}

/**
 * 默认主题挂件配置（最小化装饰）
 */
const defaultWidgets: WidgetConfig[] = [
  // 简单的装饰点
  {
    id: 'default-accent-1',
    name: '装饰点1',
    type: WidgetType.BACKGROUND,
    content: `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="3" fill="var(--ldesign-brand-color)" opacity="0.3"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '95%', y: '5%' },
      anchor: 'top-right'
    },
    style: {
      zIndex: 900,
      opacity: 0.5
    },
    animation: {
      name: 'pulse',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true
    },
    visible: true
  },

  // 简单的几何装饰
  {
    id: 'default-accent-2',
    name: '装饰点2',
    type: WidgetType.BACKGROUND,
    content: `
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="10" height="10" rx="2" fill="var(--ldesign-brand-color)" opacity="0.2"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '5%', y: '90%' },
      anchor: 'bottom-left'
    },
    style: {
      zIndex: 900,
      opacity: 0.4
    },
    animation: {
      name: 'float',
      duration: 6000,
      iterations: 'infinite',
      autoplay: true,
      delay: 2000
    },
    visible: true
  }
]

/**
 * 默认主题配置
 */
export const defaultTheme: FestivalThemeConfig = {
  id: 'default',
  name: '默认主题',
  festival: FestivalType.DEFAULT,
  description: '简洁现代的默认主题，适用于日常使用，提供基础的视觉装饰',
  colors: defaultColors,
  widgets: defaultWidgets,
  globalAnimations: [
    {
      name: 'subtleGlow',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true
    }
  ],
  onActivate: async () => {
    console.log('✨ 默认主题已激活')
    
    // 添加全局样式
    const style = document.createElement('style')
    style.id = 'default-global-styles'
    style.textContent = `
      .ldesign-widget-default {
        transition: all 0.3s ease;
      }
      
      .ldesign-default-subtle {
        animation: subtleGlow 4s ease-in-out infinite alternate;
      }
      
      @keyframes subtleGlow {
        from { opacity: 0.3; }
        to { opacity: 0.6; }
      }
    `
    document.head.appendChild(style)
  },
  
  onDeactivate: async () => {
    console.log('默认主题已停用')
    
    // 移除全局样式
    const style = document.getElementById('default-global-styles')
    if (style) {
      style.remove()
    }
  },
  
  customConfig: {
    // 默认主题配置
    enableSubtleAnimations: true,
    minimalistMode: true
  }
}
