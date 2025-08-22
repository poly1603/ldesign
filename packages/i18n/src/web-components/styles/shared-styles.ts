/**
 * Web Components 共享样式
 *
 * 提供一致的设计系统和主题支持
 */

import { css } from 'lit'

/**
 * CSS自定义属性（CSS变量）定义
 */
export const cssVariables = css`
  :host {
    /* 颜色系统 */
    --i18n-primary-color: #1976d2;
    --i18n-primary-hover: #1565c0;
    --i18n-primary-active: #0d47a1;
    --i18n-secondary-color: #424242;
    --i18n-secondary-hover: #616161;
    --i18n-secondary-active: #212121;
    
    /* 背景色 */
    --i18n-bg-primary: #ffffff;
    --i18n-bg-secondary: #f5f5f5;
    --i18n-bg-tertiary: #eeeeee;
    --i18n-bg-hover: #f0f0f0;
    --i18n-bg-active: #e0e0e0;
    
    /* 文本颜色 */
    --i18n-text-primary: #212121;
    --i18n-text-secondary: #757575;
    --i18n-text-disabled: #bdbdbd;
    --i18n-text-inverse: #ffffff;
    
    /* 边框 */
    --i18n-border-color: #e0e0e0;
    --i18n-border-hover: #bdbdbd;
    --i18n-border-focus: #1976d2;
    --i18n-border-radius: 4px;
    --i18n-border-radius-large: 8px;
    
    /* 阴影 */
    --i18n-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --i18n-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.12);
    --i18n-shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.15);
    
    /* 间距 */
    --i18n-spacing-xs: 4px;
    --i18n-spacing-sm: 8px;
    --i18n-spacing-md: 16px;
    --i18n-spacing-lg: 24px;
    --i18n-spacing-xl: 32px;
    
    /* 字体 */
    --i18n-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --i18n-font-size-xs: 12px;
    --i18n-font-size-sm: 14px;
    --i18n-font-size-md: 16px;
    --i18n-font-size-lg: 18px;
    --i18n-font-size-xl: 20px;
    --i18n-line-height: 1.5;
    
    /* 过渡动画 */
    --i18n-transition-fast: 0.15s ease-in-out;
    --i18n-transition-normal: 0.25s ease-in-out;
    --i18n-transition-slow: 0.35s ease-in-out;
    
    /* Z-index */
    --i18n-z-dropdown: 1000;
    --i18n-z-modal: 1050;
    --i18n-z-tooltip: 1100;
  }
`

/**
 * 暗色主题变量
 */
export const darkThemeVariables = css`
  :host([theme="dark"]) {
    /* 暗色主题颜色覆盖 */
    --i18n-primary-color: #90caf9;
    --i18n-primary-hover: #64b5f6;
    --i18n-primary-active: #42a5f5;
    --i18n-secondary-color: #bdbdbd;
    --i18n-secondary-hover: #e0e0e0;
    --i18n-secondary-active: #f5f5f5;
    
    /* 暗色背景 */
    --i18n-bg-primary: #121212;
    --i18n-bg-secondary: #1e1e1e;
    --i18n-bg-tertiary: #2d2d2d;
    --i18n-bg-hover: #333333;
    --i18n-bg-active: #404040;
    
    /* 暗色文本 */
    --i18n-text-primary: #ffffff;
    --i18n-text-secondary: #b3b3b3;
    --i18n-text-disabled: #666666;
    --i18n-text-inverse: #000000;
    
    /* 暗色边框 */
    --i18n-border-color: #333333;
    --i18n-border-hover: #555555;
    --i18n-border-focus: #90caf9;
  }
`

/**
 * 基础重置样式
 */
export const resetStyles = css`
  :host {
    box-sizing: border-box;
    font-family: var(--i18n-font-family);
    font-size: var(--i18n-font-size-md);
    line-height: var(--i18n-line-height);
    color: var(--i18n-text-primary);
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }
`

/**
 * 按钮基础样式
 */
export const buttonStyles = css`
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--i18n-spacing-sm) var(--i18n-spacing-md);
    border: 1px solid transparent;
    border-radius: var(--i18n-border-radius);
    font-family: inherit;
    font-size: var(--i18n-font-size-sm);
    font-weight: 500;
    line-height: 1.2;
    text-decoration: none;
    cursor: pointer;
    transition: all var(--i18n-transition-fast);
    user-select: none;
    white-space: nowrap;
    min-height: 36px;
  }

  .btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--i18n-border-focus);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* 按钮变体 */
  .btn--primary {
    background-color: var(--i18n-primary-color);
    border-color: var(--i18n-primary-color);
    color: var(--i18n-text-inverse);
  }

  .btn--primary:hover {
    background-color: var(--i18n-primary-hover);
    border-color: var(--i18n-primary-hover);
  }

  .btn--primary:active {
    background-color: var(--i18n-primary-active);
    border-color: var(--i18n-primary-active);
  }

  .btn--secondary {
    background-color: transparent;
    border-color: var(--i18n-border-color);
    color: var(--i18n-text-primary);
  }

  .btn--secondary:hover {
    background-color: var(--i18n-bg-hover);
    border-color: var(--i18n-border-hover);
  }

  .btn--secondary:active {
    background-color: var(--i18n-bg-active);
  }

  .btn--ghost {
    background-color: transparent;
    border-color: transparent;
    color: var(--i18n-primary-color);
  }

  .btn--ghost:hover {
    background-color: var(--i18n-bg-hover);
  }

  .btn--ghost:active {
    background-color: var(--i18n-bg-active);
  }

  /* 按钮尺寸 */
  .btn--small {
    padding: var(--i18n-spacing-xs) var(--i18n-spacing-sm);
    font-size: var(--i18n-font-size-xs);
    min-height: 28px;
  }

  .btn--large {
    padding: var(--i18n-spacing-md) var(--i18n-spacing-lg);
    font-size: var(--i18n-font-size-lg);
    min-height: 44px;
  }
`

/**
 * 输入框基础样式
 */
export const inputStyles = css`
  .input {
    display: block;
    width: 100%;
    padding: var(--i18n-spacing-sm) var(--i18n-spacing-md);
    border: 1px solid var(--i18n-border-color);
    border-radius: var(--i18n-border-radius);
    font-family: inherit;
    font-size: var(--i18n-font-size-sm);
    line-height: var(--i18n-line-height);
    color: var(--i18n-text-primary);
    background-color: var(--i18n-bg-primary);
    transition: all var(--i18n-transition-fast);
    min-height: 36px;
  }

  .input::placeholder {
    color: var(--i18n-text-secondary);
    opacity: 1;
  }

  .input:hover {
    border-color: var(--i18n-border-hover);
  }

  .input:focus {
    outline: none;
    border-color: var(--i18n-border-focus);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }

  .input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--i18n-bg-secondary);
  }

  /* 输入框尺寸 */
  .input--small {
    padding: var(--i18n-spacing-xs) var(--i18n-spacing-sm);
    font-size: var(--i18n-font-size-xs);
    min-height: 28px;
  }

  .input--large {
    padding: var(--i18n-spacing-md) var(--i18n-spacing-lg);
    font-size: var(--i18n-font-size-lg);
    min-height: 44px;
  }
`

/**
 * 下拉菜单样式
 */
export const dropdownStyles = css`
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown__trigger {
    display: flex;
    align-items: center;
    gap: var(--i18n-spacing-xs);
  }

  .dropdown__menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: var(--i18n-z-dropdown);
    background-color: var(--i18n-bg-primary);
    border: 1px solid var(--i18n-border-color);
    border-radius: var(--i18n-border-radius);
    box-shadow: var(--i18n-shadow-md);
    max-height: 300px;
    overflow-y: auto;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: all var(--i18n-transition-fast);
  }

  .dropdown__menu--open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .dropdown__menu--top {
    top: auto;
    bottom: 100%;
    transform: translateY(8px);
  }

  .dropdown__menu--top.dropdown__menu--open {
    transform: translateY(0);
  }

  .dropdown__item {
    display: flex;
    align-items: center;
    gap: var(--i18n-spacing-sm);
    padding: var(--i18n-spacing-sm) var(--i18n-spacing-md);
    color: var(--i18n-text-primary);
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--i18n-transition-fast);
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    font-size: var(--i18n-font-size-sm);
  }

  .dropdown__item:hover {
    background-color: var(--i18n-bg-hover);
  }

  .dropdown__item:active {
    background-color: var(--i18n-bg-active);
  }

  .dropdown__item--active {
    background-color: var(--i18n-primary-color);
    color: var(--i18n-text-inverse);
  }

  .dropdown__item--active:hover {
    background-color: var(--i18n-primary-hover);
  }
`

/**
 * 工具样式
 */
export const utilityStyles = css`
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .loading {
    opacity: 0.6;
    pointer-events: none;
  }

  .loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid var(--i18n-border-color);
    border-top-color: var(--i18n-primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .fade-in {
    animation: fadeIn var(--i18n-transition-normal) ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

/**
 * 组合所有基础样式
 */
export const baseStyles = [
  cssVariables,
  darkThemeVariables,
  resetStyles,
  buttonStyles,
  inputStyles,
  dropdownStyles,
  utilityStyles,
]
