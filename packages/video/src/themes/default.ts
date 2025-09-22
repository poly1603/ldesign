/**
 * 默认主题配置
 * 提供播放器的默认外观和样式
 */

import type { ThemeConfig } from '../types/themes';

/**
 * 默认主题配置
 */
export const defaultTheme: ThemeConfig = {
  name: 'default',
  variables: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      white: '#ffffff',
      black: '#000000',
      
      // 播放器特定颜色
      background: '#000000',
      overlay: 'rgba(0, 0, 0, 0.7)',
      control: '#ffffff',
      controlHover: '#f0f0f0',
      controlActive: '#e0e0e0',
      progress: '#007bff',
      progressBuffer: 'rgba(255, 255, 255, 0.3)',
      progressTrack: 'rgba(255, 255, 255, 0.2)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.5)'
    },
    
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: '14px',
      weight: '400',
      lineHeight: '1.5'
    },
    
    sizes: {
      controlHeight: '40px',
      controlPadding: '8px',
      controlMargin: '4px',
      borderRadius: '4px',
      iconSize: '16px',
      progressHeight: '4px',
      volumeWidth: '80px',
      timeWidth: '60px'
    },
    
    animations: {
      duration: '0.3s',
      easing: 'ease-out',
      fadeIn: 'fadeIn 0.3s ease-out',
      fadeOut: 'fadeOut 0.3s ease-out',
      slideIn: 'slideIn 0.3s ease-out',
      slideOut: 'slideOut 0.3s ease-out'
    }
  },
  
  styles: `
    /* 动画定义 */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    
    @keyframes slideOut {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }
    
    /* 基础样式 */
    .ldesign-video-player {
      position: relative;
      width: 100%;
      height: 100%;
      background: var(--color-background);
      overflow: hidden;
      font-family: var(--font-family);
      font-size: var(--font-size);
      line-height: var(--font-lineHeight);
      color: var(--color-text);
    }
    
    .ldesign-video-player video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    /* 控制栏样式 */
    .ldesign-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, var(--color-overlay));
      padding: var(--size-controlPadding);
      display: flex;
      align-items: center;
      gap: var(--size-controlMargin);
      transition: opacity var(--animation-duration) var(--animation-easing);
    }
    
    .ldesign-controls-left {
      display: flex;
      align-items: center;
      gap: var(--size-controlMargin);
    }
    
    .ldesign-controls-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--size-controlMargin);
    }
    
    .ldesign-controls-right {
      display: flex;
      align-items: center;
      gap: var(--size-controlMargin);
    }
    
    /* 按钮样式 */
    .ldesign-control-button {
      background: transparent;
      border: none;
      color: var(--color-control);
      cursor: pointer;
      padding: var(--size-controlPadding);
      border-radius: var(--size-borderRadius);
      transition: all var(--animation-duration) var(--animation-easing);
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: var(--size-controlHeight);
      height: var(--size-controlHeight);
    }
    
    .ldesign-control-button:hover {
      background: var(--color-controlHover);
      color: var(--color-controlActive);
    }
    
    .ldesign-control-button:active {
      background: var(--color-controlActive);
    }
    
    .ldesign-control-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* 图标样式 */
    .ldesign-icon {
      width: var(--size-iconSize);
      height: var(--size-iconSize);
      fill: currentColor;
    }
    
    /* 进度条样式 */
    .ldesign-progress {
      flex: 1;
      height: var(--size-progressHeight);
      background: var(--color-progressTrack);
      border-radius: calc(var(--size-progressHeight) / 2);
      position: relative;
      cursor: pointer;
      overflow: hidden;
    }
    
    .ldesign-progress-buffer {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--color-progressBuffer);
      border-radius: inherit;
      transition: width var(--animation-duration) var(--animation-easing);
    }
    
    .ldesign-progress-played {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--color-progress);
      border-radius: inherit;
      transition: width var(--animation-duration) var(--animation-easing);
    }
    
    .ldesign-progress-thumb {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 12px;
      background: var(--color-progress);
      border-radius: 50%;
      opacity: 0;
      transition: opacity var(--animation-duration) var(--animation-easing);
    }
    
    .ldesign-progress:hover .ldesign-progress-thumb {
      opacity: 1;
    }
    
    /* 音量控制样式 */
    .ldesign-volume {
      display: flex;
      align-items: center;
      gap: var(--size-controlMargin);
    }
    
    .ldesign-volume-slider {
      width: var(--size-volumeWidth);
      height: var(--size-progressHeight);
      background: var(--color-progressTrack);
      border-radius: calc(var(--size-progressHeight) / 2);
      position: relative;
      cursor: pointer;
    }
    
    .ldesign-volume-level {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--color-progress);
      border-radius: inherit;
      transition: width var(--animation-duration) var(--animation-easing);
    }
    
    /* 时间显示样式 */
    .ldesign-time {
      color: var(--color-textSecondary);
      font-size: 12px;
      min-width: var(--size-timeWidth);
      text-align: center;
    }
    
    /* 加载状态样式 */
    .ldesign-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--color-control);
    }
    
    .ldesign-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-progressTrack);
      border-top: 3px solid var(--color-progress);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* 错误状态样式 */
    .ldesign-error {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: var(--color-danger);
    }
    
    /* 全屏样式 */
    .ldesign-video-player.ldesign-fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9999 !important;
    }
    
    /* 响应式样式 */
    @media (max-width: 768px) {
      .ldesign-controls {
        padding: 4px;
      }
      
      .ldesign-control-button {
        min-width: 32px;
        height: 32px;
        padding: 4px;
      }
      
      .ldesign-volume-slider {
        width: 60px;
      }
      
      .ldesign-time {
        min-width: 50px;
        font-size: 11px;
      }
    }
    
    /* 隐藏状态 */
    .ldesign-plugin-hidden {
      display: none !important;
    }
    
    /* 禁用状态 */
    .ldesign-plugin-disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  `,
  
  components: {
    player: {
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--color-background)',
      overflow: 'hidden'
    },
    
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    },
    
    controls: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(transparent, var(--color-overlay))',
      padding: 'var(--size-controlPadding)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--size-controlMargin)'
    }
  },
  
  breakpoints: {
    mobile: '(max-width: 768px)',
    tablet: '(max-width: 1024px)',
    desktop: '(min-width: 1025px)'
  }
};

/**
 * 暗色主题配置
 */
export const darkTheme: ThemeConfig = {
  name: 'dark',
  extends: 'default',
  variables: {
    colors: {
      background: '#1a1a1a',
      overlay: 'rgba(0, 0, 0, 0.8)',
      control: '#ffffff',
      controlHover: 'rgba(255, 255, 255, 0.1)',
      controlActive: 'rgba(255, 255, 255, 0.2)',
      progress: '#007bff',
      progressBuffer: 'rgba(255, 255, 255, 0.2)',
      progressTrack: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.7)'
    }
  }
};

/**
 * 亮色主题配置
 */
export const lightTheme: ThemeConfig = {
  name: 'light',
  extends: 'default',
  variables: {
    colors: {
      background: '#ffffff',
      overlay: 'rgba(255, 255, 255, 0.9)',
      control: '#333333',
      controlHover: 'rgba(0, 0, 0, 0.1)',
      controlActive: 'rgba(0, 0, 0, 0.2)',
      progress: '#007bff',
      progressBuffer: 'rgba(0, 0, 0, 0.2)',
      progressTrack: 'rgba(0, 0, 0, 0.1)',
      text: '#333333',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      border: 'rgba(0, 0, 0, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  }
};
