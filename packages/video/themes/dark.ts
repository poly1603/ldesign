/**
 * 暗色主题
 * 提供播放器的暗色外观和样式
 */

import type { ITheme, ThemeConfig } from '../src/types/theme'

/**
 * 暗色主题配置
 */
const darkThemeConfig: ThemeConfig = {
  variables: {
    // 主色调
    'primary-color': 'var(--ldesign-brand-color)',
    'primary-color-hover': 'var(--ldesign-brand-color-hover)',
    'primary-color-active': 'var(--ldesign-brand-color-active)',
    
    // 背景色
    'bg-color': '#1a1a1a',
    'bg-color-secondary': 'rgba(26, 26, 26, 0.9)',
    'bg-color-overlay': 'rgba(0, 0, 0, 0.8)',
    
    // 文字颜色
    'text-color': '#ffffff',
    'text-color-secondary': 'rgba(255, 255, 255, 0.85)',
    'text-color-disabled': 'rgba(255, 255, 255, 0.5)',
    
    // 边框颜色
    'border-color': 'rgba(255, 255, 255, 0.15)',
    'border-color-hover': 'rgba(255, 255, 255, 0.3)',
    
    // 控制栏
    'controls-height': '48px',
    'controls-padding': '12px 16px',
    'controls-background': 'linear-gradient(transparent, rgba(26, 26, 26, 0.95))',
    'controls-border-radius': '0',
    
    // 按钮
    'button-size': '32px',
    'button-padding': '8px',
    'button-border-radius': '6px',
    'button-background': 'transparent',
    'button-background-hover': 'rgba(255, 255, 255, 0.08)',
    'button-background-active': 'rgba(255, 255, 255, 0.15)',
    
    // 进度条
    'progress-height': '4px',
    'progress-track-background': 'rgba(255, 255, 255, 0.2)',
    'progress-buffer-background': 'rgba(255, 255, 255, 0.4)',
    'progress-played-background': 'var(--ldesign-brand-color)',
    'progress-thumb-size': '12px',
    'progress-thumb-background': 'var(--ldesign-brand-color)',
    'progress-thumb-border': '2px solid #ffffff',
    
    // 音量控制
    'volume-slider-width': '80px',
    'volume-slider-height': '4px',
    'volume-track-background': 'rgba(255, 255, 255, 0.2)',
    'volume-fill-background': 'var(--ldesign-brand-color)',
    
    // 时间显示
    'time-font-size': '14px',
    'time-font-weight': '500',
    'time-color': '#ffffff',
    
    // 图标
    'icon-size': '20px',
    'icon-color': '#ffffff',
    
    // 阴影
    'shadow-small': '0 2px 8px rgba(0, 0, 0, 0.4)',
    'shadow-medium': '0 4px 12px rgba(0, 0, 0, 0.5)',
    'shadow-large': '0 8px 24px rgba(0, 0, 0, 0.6)',
    
    // 动画
    'transition-fast': '0.15s ease',
    'transition-normal': '0.3s ease',
    'transition-slow': '0.5s ease',
    
    // 弹幕
    'danmaku-font-size': '16px',
    'danmaku-font-family': 'Arial, sans-serif',
    'danmaku-stroke-width': '1px',
    'danmaku-stroke-color': '#000000',
    'danmaku-opacity': '0.85',
    
    // 字幕
    'subtitle-font-size': '18px',
    'subtitle-font-family': 'Arial, sans-serif',
    'subtitle-color': '#ffffff',
    'subtitle-background': 'rgba(0, 0, 0, 0.8)',
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
    .lv-theme-dark {
      background: var(--lv-bg-color);
      border: 1px solid var(--lv-border-color);
    }
    
    .lv-theme-dark .lv-controls {
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .lv-theme-dark .lv-controls__button {
      border: 1px solid transparent;
      transition: all var(--lv-transition-fast);
    }
    
    .lv-theme-dark .lv-controls__button:hover {
      border-color: var(--lv-border-color-hover);
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-dark .lv-controls__button:focus {
      border-color: var(--lv-primary-color);
      box-shadow: 0 0 0 2px rgba(var(--ldesign-brand-color-rgb), 0.2);
    }
    
    .lv-theme-dark .lv-progress__track {
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .lv-theme-dark .lv-progress__thumb {
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-dark .lv-progress__thumb:hover {
      box-shadow: var(--lv-shadow-medium);
    }
    
    .lv-theme-dark .lv-controls__volume-slider {
      background: rgba(26, 26, 26, 0.95);
      border: 1px solid var(--lv-border-color);
      box-shadow: var(--lv-shadow-medium);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .lv-theme-dark .lv-volume__track {
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .lv-theme-dark .lv-volume__thumb {
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-dark .lv-danmaku-input-container input {
      background: rgba(26, 26, 26, 0.9);
      border-color: var(--lv-border-color);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .lv-theme-dark .lv-danmaku-input-container input:focus {
      border-color: var(--lv-primary-color);
      box-shadow: 0 0 0 2px rgba(var(--ldesign-brand-color-rgb), 0.2);
    }
    
    .lv-theme-dark .lv-danmaku-send-button {
      box-shadow: var(--lv-shadow-small);
    }
    
    .lv-theme-dark .lv-danmaku-send-button:hover {
      box-shadow: var(--lv-shadow-medium);
      transform: translateY(-1px);
    }
    
    .lv-theme-dark .lv-subtitle {
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      box-shadow: var(--lv-shadow-small);
    }
    
    /* 滚动条样式 */
    .lv-theme-dark ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .lv-theme-dark ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    
    .lv-theme-dark ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }
    
    .lv-theme-dark ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
    
    /* 选择文本样式 */
    .lv-theme-dark ::selection {
      background: rgba(var(--ldesign-brand-color-rgb), 0.3);
      color: #ffffff;
    }
    
    /* 焦点样式 */
    .lv-theme-dark *:focus {
      outline: none;
    }
    
    .lv-theme-dark *:focus-visible {
      outline: 2px solid var(--lv-primary-color);
      outline-offset: 2px;
    }
  `
}

/**
 * 暗色主题
 */
export const darkTheme: ITheme = {
  name: 'dark',
  displayName: '暗色主题',
  description: '适合暗色环境的播放器主题',
  version: '1.0.0',
  author: 'LDesign Team',
  config: darkThemeConfig
}
