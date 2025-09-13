/**
 * 亮色主题
 * 提供播放器的亮色外观和样式
 */

import type { ITheme, ThemeConfig } from '../src/types/theme'

/**
 * 亮色主题配置
 */
const lightThemeConfig: ThemeConfig = {
  variables: {
    // 主色调
    'primary-color': 'var(--ldesign-brand-color)',
    'primary-color-hover': 'var(--ldesign-brand-color-hover)',
    'primary-color-active': 'var(--ldesign-brand-color-active)',
    
    // 背景色
    'bg-color': '#ffffff',
    'bg-color-secondary': 'rgba(255, 255, 255, 0.95)',
    'bg-color-overlay': 'rgba(255, 255, 255, 0.9)',
    
    // 文字颜色
    'text-color': '#333333',
    'text-color-secondary': 'rgba(51, 51, 51, 0.8)',
    'text-color-disabled': 'rgba(51, 51, 51, 0.4)',
    
    // 边框颜色
    'border-color': 'rgba(0, 0, 0, 0.1)',
    'border-color-hover': 'rgba(0, 0, 0, 0.2)',
    
    // 控制栏
    'controls-height': '48px',
    'controls-padding': '12px 16px',
    'controls-background': 'linear-gradient(transparent, rgba(255, 255, 255, 0.95))',
    'controls-border-radius': '0',
    
    // 按钮
    'button-size': '32px',
    'button-padding': '8px',
    'button-border-radius': '6px',
    'button-background': 'transparent',
    'button-background-hover': 'rgba(0, 0, 0, 0.05)',
    'button-background-active': 'rgba(0, 0, 0, 0.1)',
    
    // 进度条
    'progress-height': '4px',
    'progress-track-background': 'rgba(0, 0, 0, 0.15)',
    'progress-buffer-background': 'rgba(0, 0, 0, 0.25)',
    'progress-played-background': 'var(--ldesign-brand-color)',
    'progress-thumb-size': '12px',
    'progress-thumb-background': 'var(--ldesign-brand-color)',
    'progress-thumb-border': '2px solid #ffffff',
    
    // 音量控制
    'volume-slider-width': '80px',
    'volume-slider-height': '4px',
    'volume-track-background': 'rgba(0, 0, 0, 0.15)',
    'volume-fill-background': 'var(--ldesign-brand-color)',
    
    // 时间显示
    'time-font-size': '14px',
    'time-font-weight': '500',
    'time-color': '#333333',
    
    // 图标
    'icon-size': '20px',
    'icon-color': '#333333',
    
    // 阴影
    'shadow-small': '0 2px 4px rgba(0, 0, 0, 0.1)',
    'shadow-medium': '0 4px 8px rgba(0, 0, 0, 0.15)',
    'shadow-large': '0 8px 16px rgba(0, 0, 0, 0.2)',
    
    // 动画
    'transition-fast': '0.15s ease',
    'transition-normal': '0.3s ease',
    'transition-slow': '0.5s ease',
    
    // 弹幕
    'danmaku-font-size': '16px',
    'danmaku-font-family': 'Arial, sans-serif',
    'danmaku-stroke-width': '1px',
    'danmaku-stroke-color': '#ffffff',
    'danmaku-opacity': '0.9',
    
    // 字幕
    'subtitle-font-size': '18px',
    'subtitle-font-family': 'Arial, sans-serif',
    'subtitle-color': '#333333',
    'subtitle-background': 'rgba(255, 255, 255, 0.9)',
    'subtitle-padding': '6px 12px',
    'subtitle-border-radius': '6px'
  },
  
  responsive: {
    mobile: {
      variables: {
        'controls-height': '44px',
        'controls-padding': '8px 12px',
        'button-size': '28px',
        'button-padding': '6px',
        'button-border-radius': '4px',
        'progress-height': '6px',
        'progress-thumb-size': '14px',
        'volume-slider-width': '60px',
        'time-font-size': '12px',
        'icon-size': '18px',
        'danmaku-font-size': '14px',
        'subtitle-font-size': '16px'
      }
    },
    
    tablet: {
      variables: {
        'controls-height': '46px',
        'controls-padding': '10px 14px',
        'button-size': '30px',
        'button-padding': '7px',
        'button-border-radius': '5px',
        'progress-height': '5px',
        'progress-thumb-size': '13px',
        'volume-slider-width': '70px',
        'time-font-size': '13px',
        'icon-size': '19px',
        'danmaku-font-size': '15px',
        'subtitle-font-size': '17px'
      }
    },
    
    desktop: {
      variables: {
        'controls-height': '48px',
        'controls-padding': '12px 16px',
        'button-size': '32px',
        'button-padding': '8px',
        'button-border-radius': '6px',
        'progress-height': '4px',
        'progress-thumb-size': '12px',
        'volume-slider-width': '80px',
        'time-font-size': '14px',
        'icon-size': '20px',
        'danmaku-font-size': '16px',
        'subtitle-font-size': '18px'
      }
    }
  },
  
  customCSS: `
    .lv-theme-light {
      background: var(--lv-bg-color);
      border: 1px solid var(--lv-border-color);
      box-shadow: var(--lv-shadow-medium);
    }
    
    .lv-theme-light .lv-video {
      border-radius: 8px 8px 0 0;
    }
    
    .lv-theme-light .lv-controls {
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-top: 1px solid var(--lv-border-color);
    }
    
    .lv-theme-light .lv-controls__button {
      border: 1px solid transparent;
      transition: all var(--lv-transition-fast);
    }
    
    .lv-theme-light .lv-controls__button:hover {
      border-color: var(--lv-border-color-hover);
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-light .lv-controls__button:focus {
      border-color: var(--lv-primary-color);
      box-shadow: 0 0 0 2px rgba(var(--ldesign-brand-color-rgb), 0.2);
    }
    
    .lv-theme-light .lv-progress__track {
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }
    
    .lv-theme-light .lv-progress__thumb {
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-light .lv-progress__thumb:hover {
      box-shadow: var(--lv-shadow-medium);
    }
    
    .lv-theme-light .lv-controls__volume-slider {
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid var(--lv-border-color);
      box-shadow: var(--lv-shadow-medium);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .lv-theme-light .lv-volume__track {
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .lv-theme-light .lv-volume__thumb {
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-light .lv-danmaku-input-container input {
      background: rgba(255, 255, 255, 0.95);
      border-color: var(--lv-border-color);
      color: var(--lv-text-color);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .lv-theme-light .lv-danmaku-input-container input:focus {
      border-color: var(--lv-primary-color);
      box-shadow: 0 0 0 2px rgba(var(--ldesign-brand-color-rgb), 0.2);
    }
    
    .lv-theme-light .lv-danmaku-input-container input::placeholder {
      color: var(--lv-text-color-secondary);
    }
    
    .lv-theme-light .lv-danmaku-send-button {
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-light .lv-danmaku-send-button:hover {
      box-shadow: var(--lv-shadow-medium);
      transform: translateY(-1px);
    }
    
    .lv-theme-light .lv-subtitle {
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      box-shadow: var(--lv-shadow-small);
      border: 1px solid var(--lv-border-color);
    }
    
    /* 滚动条样式 */
    .lv-theme-light ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .lv-theme-light ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }
    
    .lv-theme-light ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }
    
    .lv-theme-light ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }
    
    /* 选择文本样式 */
    .lv-theme-light ::selection {
      background: rgba(var(--ldesign-brand-color-rgb), 0.2);
      color: var(--lv-text-color);
    }
    
    /* 焦点样式 */
    .lv-theme-light *:focus {
      outline: none;
    }
    
    .lv-theme-light *:focus-visible {
      outline: 2px solid var(--lv-primary-color);
      outline-offset: 2px;
    }
    
    /* 弹幕特殊样式 */
    .lv-theme-light .lv-danmaku-item {
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
    }
    
    /* 加载状态 */
    .lv-theme-light .lv-loading {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    
    .lv-theme-light .lv-loading-spinner {
      border-color: var(--lv-border-color);
      border-top-color: var(--lv-primary-color);
    }
  `
}

/**
 * 亮色主题
 */
export const lightTheme: ITheme = {
  name: 'light',
  displayName: '亮色主题',
  description: '适合亮色环境的播放器主题',
  version: '1.0.0',
  author: 'LDesign Team',
  config: lightThemeConfig
}
