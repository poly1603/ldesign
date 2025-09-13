/**
 * 默认主题
 * 提供播放器的默认外观和样式
 */

import type { ITheme, ThemeConfig } from '../src/types/theme'

/**
 * 默认主题配置
 */
const defaultThemeConfig: ThemeConfig = {
  variables: {
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
  },
  
  responsive: {
    mobile: {
      variables: {
        'controls-height': '44px',
        'controls-padding': '8px 12px',
        'button-size': '28px',
        'button-padding': '6px',
        'progress-height': '6px',
        'progress-thumb-size': '14px',
        'volume-slider-width': '60px',
        'time-font-size': '12px',
        'icon-size': '18px',
        'danmaku-font-size': '14px',
        'subtitle-font-size': '16px'
      },
      customCSS: `
        .lv-controls__volume {
          display: none;
        }
        
        .lv-controls__buttons-right .lv-controls__button {
          margin-left: 4px;
        }
        
        .lv-danmaku-input-container {
          bottom: 50px !important;
          left: 8px !important;
          right: 8px !important;
        }
      `
    },
    
    tablet: {
      variables: {
        'controls-height': '46px',
        'controls-padding': '10px 14px',
        'button-size': '30px',
        'button-padding': '7px',
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
        'progress-height': '4px',
        'progress-thumb-size': '12px',
        'volume-slider-width': '80px',
        'time-font-size': '14px',
        'icon-size': '20px',
        'danmaku-font-size': '16px',
        'subtitle-font-size': '18px'
      },
      customCSS: `
        .lv-controls:hover .lv-progress__thumb {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.2);
        }
        
        .lv-controls__volume:hover .lv-controls__volume-slider {
          opacity: 1;
          visibility: visible;
        }
      `
    }
  },
  
  customCSS: `
    .lv-player {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      position: relative;
      background: var(--lv-bg-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .lv-video {
      width: 100%;
      height: 100%;
      display: block;
    }
    
    .lv-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--lv-controls-background);
      padding: var(--lv-controls-padding);
      transition: opacity var(--lv-transition-normal), transform var(--lv-transition-normal);
      z-index: 10;
    }
    
    .lv-controls--hidden {
      opacity: 0;
      transform: translateY(100%);
    }
    
    .lv-controls__content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .lv-controls__buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .lv-controls__buttons-left,
    .lv-controls__buttons-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .lv-controls__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--lv-button-size);
      height: var(--lv-button-size);
      padding: var(--lv-button-padding);
      border: none;
      border-radius: var(--lv-button-border-radius);
      background: var(--lv-button-background);
      color: var(--lv-text-color);
      cursor: pointer;
      transition: var(--lv-transition-fast);
      user-select: none;
    }
    
    .lv-controls__button:hover {
      background: var(--lv-button-background-hover);
    }
    
    .lv-controls__button:active {
      background: var(--lv-button-background-active);
    }
    
    .lv-controls__button:focus {
      outline: 2px solid var(--lv-primary-color);
      outline-offset: 2px;
    }
    
    .lv-controls__button svg {
      width: var(--lv-icon-size);
      height: var(--lv-icon-size);
      fill: currentColor;
    }
    
    .lv-controls__play-button .lv-icon--pause {
      display: none;
    }
    
    .lv-controls__play-button--playing .lv-icon--play {
      display: none;
    }
    
    .lv-controls__play-button--playing .lv-icon--pause {
      display: block;
    }
    
    .lv-controls__time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--lv-time-font-size);
      font-weight: var(--lv-time-font-weight);
      color: var(--lv-time-color);
      white-space: nowrap;
    }
    
    .lv-time__separator {
      opacity: 0.7;
    }
    
    .lv-controls__volume {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .lv-controls__volume-slider {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: var(--lv-volume-slider-width);
      height: 100px;
      background: var(--lv-bg-color-overlay);
      border-radius: 4px;
      padding: 8px;
      opacity: 0;
      visibility: hidden;
      transition: var(--lv-transition-fast);
    }
    
    .lv-volume__track {
      position: relative;
      width: var(--lv-volume-slider-height);
      height: 100%;
      background: var(--lv-volume-track-background);
      border-radius: 2px;
      margin: 0 auto;
    }
    
    .lv-volume__fill {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: var(--lv-volume-fill-background);
      border-radius: inherit;
      transition: height var(--lv-transition-fast);
    }
    
    .lv-volume__thumb {
      position: absolute;
      left: 50%;
      width: 12px;
      height: 12px;
      background: var(--lv-volume-fill-background);
      border: 2px solid #ffffff;
      border-radius: 50%;
      transform: translateX(-50%);
      cursor: grab;
      transition: var(--lv-transition-fast);
    }
    
    .lv-volume__thumb:active {
      cursor: grabbing;
    }
  `
}

/**
 * 默认主题
 */
export const defaultTheme: ITheme = {
  name: 'default',
  displayName: '默认主题',
  description: '播放器的默认外观主题',
  version: '1.0.0',
  author: 'LDesign Team',
  config: defaultThemeConfig
}
