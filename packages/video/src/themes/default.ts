/**
 * 默认主题
 * 提供播放器的默认外观和样式
 */

import type { ITheme, ThemeConfig } from '../src/types/theme'

/**
 * 默认主题配置
 */
const defaultThemeConfig: ThemeConfig = {
  metadata: {
    name: 'default',
    version: '1.0.0',
    description: '默认主题',
    author: 'LDesign Team',
    dark: false
  },
  style: {
    cssVariables: {
      // 主色调
      'primary-color': 'var(--ldesign-brand-color)',
      'primary-color-hover': 'var(--ldesign-brand-color-hover)',
      'primary-color-active': 'var(--ldesign-brand-color-active)',
      
      // 背景色
      'bg-color': '#000000',
      'bg-color-secondary': 'rgba(0, 0, 0, 0.8)',
      'bg-color-overlay': 'rgba(0, 0, 0, 0.6)',
      
      // 文字颜色
      'text-color': '#ffffff',
      'text-color-secondary': 'rgba(255, 255, 255, 0.8)',
      'text-color-disabled': 'rgba(255, 255, 255, 0.4)',
      
      // 边框颜色
      'border-color': 'rgba(255, 255, 255, 0.2)',
      'border-color-hover': 'rgba(255, 255, 255, 0.4)',
      
      // 控制栏
      'controls-height': '48px',
      'controls-padding': '12px 16px',
      'controls-background': 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
      'controls-border-radius': '0',
      
      // 按钮
      'button-size': '32px',
      'button-padding': '8px',
      'button-border-radius': '4px',
      'button-background': 'transparent',
      'button-background-hover': 'rgba(255, 255, 255, 0.1)',
      'button-background-active': 'rgba(255, 255, 255, 0.2)',
      
      // 进度条
      'progress-height': '4px',
      'progress-track-background': 'rgba(255, 255, 255, 0.3)',
      'progress-buffer-background': 'rgba(255, 255, 255, 0.5)',
      'progress-played-background': 'var(--ldesign-brand-color)',
      'progress-thumb-size': '12px',
      'progress-thumb-background': 'var(--ldesign-brand-color)',
      'progress-thumb-border': '2px solid #ffffff',
      
      // 音量控制
      'volume-slider-width': '80px',
      'volume-slider-height': '4px',
      'volume-track-background': 'rgba(255, 255, 255, 0.3)',
      'volume-fill-background': 'var(--ldesign-brand-color)',
      
      // 时间显示
      'time-font-size': '14px',
      'time-font-weight': '500',
      'time-color': '#ffffff',
      
      // 图标
      'icon-size': '20px',
      'icon-color': '#ffffff',
      
      // 阴影
      'shadow-small': '0 2px 4px rgba(0, 0, 0, 0.2)',
      'shadow-medium': '0 4px 8px rgba(0, 0, 0, 0.3)',
      'shadow-large': '0 8px 16px rgba(0, 0, 0, 0.4)',
      
      // 动画
      'transition-fast': '0.15s ease',
      'transition-normal': '0.3s ease',
      'transition-slow': '0.5s ease',
      
      // 弹幕
      'danmaku-font-size': '16px',
      'danmaku-font-family': 'Arial, sans-serif',
      'danmaku-stroke-width': '1px',
      'danmaku-stroke-color': '#000000',
      'danmaku-opacity': '0.8',
      
      // 字幕
      'subtitle-font-size': '18px',
      'subtitle-font-family': 'Arial, sans-serif',
      'subtitle-color': '#ffffff',
      'subtitle-background': 'rgba(0, 0, 0, 0.7)',
      'subtitle-padding': '4px 8px',
      'subtitle-border-radius': '4px'
    }
  }
}
    
/**
 * 默认主题实现类
 */
class DefaultTheme implements ITheme {
  readonly metadata = defaultThemeConfig.metadata
  readonly style = defaultThemeConfig.style

  apply(container: HTMLElement): void {
    // 应用CSS变量
    const variables = this.getCSSVariables()
    Object.entries(variables).forEach(([key, value]) => {
      container.style.setProperty(`--lv-${key}`, value)
    })
  }

  remove(container: HTMLElement): void {
    // 移除CSS变量
    const variables = this.getCSSVariables()
    Object.keys(variables).forEach(key => {
      container.style.removeProperty(`--lv-${key}`)
    })
  }

  updateStyle(style: Partial<ThemeStyle>): void {
    Object.assign(this.style, style)
  }

  getCSSVariables(): Record<string, string> {
    return this.style.cssVariables || {}
  }

  generateCSS(): string {
    const variables = this.getCSSVariables()
    const cssVars = Object.entries(variables)
      .map(([key, value]) => `  --lv-${key}: ${value};`)
      .join('\n')
    
    return `:root {\n${cssVars}\n}`
  }
}

/**
 * 默认主题实例
 */
export const defaultTheme = new DefaultTheme()
