/**
 * @ldesign/cropper 主题管理器
 * 
 * 负责管理裁剪器的主题系统，包括主题切换、自定义主题、动态样式等功能
 */

import type { CropperTheme, ThemeColors, ThemeConfig } from '../types';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 主题管理器接口
// ============================================================================

/**
 * 主题变更事件接口
 */
export interface ThemeChangeEvent {
  /** 事件类型 */
  type: 'theme-change';
  /** 旧主题名称 */
  oldTheme: string;
  /** 新主题名称 */
  newTheme: string;
  /** 主题配置 */
  themeConfig: ThemeConfig;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 主题管理器选项接口
 */
export interface ThemeManagerOptions {
  /** 默认主题 */
  defaultTheme: string;
  /** 是否启用主题持久化 */
  enablePersistence: boolean;
  /** 持久化存储键名 */
  storageKey: string;
  /** 是否启用主题变更事件 */
  enableChangeEvents: boolean;
  /** 是否启用CSS变量注入 */
  enableCSSVariables: boolean;
  /** CSS变量前缀 */
  cssVariablePrefix: string;
}

/**
 * 默认主题管理器选项
 */
export const DEFAULT_THEME_MANAGER_OPTIONS: ThemeManagerOptions = {
  defaultTheme: 'light',
  enablePersistence: true,
  storageKey: 'ldesign-cropper-theme',
  enableChangeEvents: true,
  enableCSSVariables: true,
  cssVariablePrefix: '--ldesign-cropper'
};

// ============================================================================
// 内置主题定义
// ============================================================================

/**
 * 浅色主题配置
 */
export const LIGHT_THEME: ThemeConfig = {
  name: 'light',
  displayName: '浅色主题',
  colors: {
    // 主要颜色
    primary: 'var(--ldesign-brand-color)',
    primaryHover: 'var(--ldesign-brand-color-hover)',
    primaryActive: 'var(--ldesign-brand-color-active)',
    primaryDisabled: 'var(--ldesign-brand-color-disabled)',
    
    // 背景颜色
    background: 'var(--ldesign-bg-color-page)',
    surface: 'var(--ldesign-bg-color-container)',
    surfaceHover: 'var(--ldesign-bg-color-container-hover)',
    
    // 文本颜色
    textPrimary: 'var(--ldesign-text-color-primary)',
    textSecondary: 'var(--ldesign-text-color-secondary)',
    textDisabled: 'var(--ldesign-text-color-disabled)',
    
    // 边框颜色
    border: 'var(--ldesign-border-color)',
    borderHover: 'var(--ldesign-border-color-hover)',
    borderFocus: 'var(--ldesign-border-color-focus)',
    
    // 状态颜色
    success: 'var(--ldesign-success-color)',
    warning: 'var(--ldesign-warning-color)',
    error: 'var(--ldesign-error-color)',
    
    // 裁剪器特定颜色
    cropArea: 'rgba(114, 46, 209, 0.2)',
    cropBorder: 'var(--ldesign-brand-color)',
    controlPoint: 'var(--ldesign-brand-color)',
    controlPointHover: 'var(--ldesign-brand-color-hover)',
    grid: 'rgba(255, 255, 255, 0.5)',
    mask: 'rgba(0, 0, 0, 0.5)'
  },
  spacing: {
    xs: 'var(--ls-spacing-xs)',
    sm: 'var(--ls-spacing-sm)',
    base: 'var(--ls-spacing-base)',
    lg: 'var(--ls-spacing-lg)',
    xl: 'var(--ls-spacing-xl)',
    xxl: 'var(--ls-spacing-xxl)'
  },
  borderRadius: {
    none: 'var(--ls-border-radius-none)',
    sm: 'var(--ls-border-radius-sm)',
    base: 'var(--ls-border-radius-base)',
    lg: 'var(--ls-border-radius-lg)',
    xl: 'var(--ls-border-radius-xl)',
    full: 'var(--ls-border-radius-full)'
  },
  shadows: {
    none: 'var(--ls-shadow-none)',
    sm: 'var(--ls-shadow-sm)',
    base: 'var(--ls-shadow-base)',
    lg: 'var(--ls-shadow-lg)',
    xl: 'var(--ls-shadow-xl)'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: 'var(--ls-font-size-xs)',
      sm: 'var(--ls-font-size-sm)',
      base: 'var(--ls-font-size-base)',
      lg: 'var(--ls-font-size-lg)',
      xl: 'var(--ls-font-size-xl)',
      xxl: 'var(--ls-font-size-xxl)'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  }
};

/**
 * 深色主题配置
 */
export const DARK_THEME: ThemeConfig = {
  ...LIGHT_THEME,
  name: 'dark',
  displayName: '深色主题',
  colors: {
    ...LIGHT_THEME.colors,
    // 深色主题特定的颜色覆盖
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceHover: '#3a3a3a',
    textPrimary: 'rgba(255, 255, 255, 0.9)',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textDisabled: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    grid: 'rgba(255, 255, 255, 0.2)',
    mask: 'rgba(0, 0, 0, 0.7)'
  }
};

/**
 * 高对比度主题配置
 */
export const HIGH_CONTRAST_THEME: ThemeConfig = {
  ...LIGHT_THEME,
  name: 'high-contrast',
  displayName: '高对比度主题',
  colors: {
    ...LIGHT_THEME.colors,
    // 高对比度主题特定的颜色覆盖
    primary: '#0066cc',
    background: '#ffffff',
    surface: '#ffffff',
    textPrimary: '#000000',
    textSecondary: '#333333',
    border: '#000000',
    cropBorder: '#0066cc',
    controlPoint: '#0066cc',
    grid: 'rgba(0, 0, 0, 0.8)',
    mask: 'rgba(0, 0, 0, 0.8)'
  }
};

// ============================================================================
// 主题管理器类
// ============================================================================

/**
 * 主题管理器类
 * 负责管理裁剪器的主题系统
 */
export class ThemeManager {
  private currentTheme: string;
  private themes: Map<string, ThemeConfig> = new Map();
  private options: ThemeManagerOptions;
  private eventListeners: Map<string, Set<(event: ThemeChangeEvent) => void>> = new Map();
  private styleElement: HTMLStyleElement | null = null;

  constructor(options: Partial<ThemeManagerOptions> = {}) {
    this.options = { ...DEFAULT_THEME_MANAGER_OPTIONS, ...options };
    
    // 注册内置主题
    this.registerTheme(LIGHT_THEME);
    this.registerTheme(DARK_THEME);
    this.registerTheme(HIGH_CONTRAST_THEME);

    // 加载当前主题
    this.currentTheme = this.loadCurrentTheme();
    
    // 应用主题
    this.applyTheme(this.currentTheme);
  }

  // ============================================================================
  // 公共API - 主题操作
  // ============================================================================

  /**
   * 获取当前主题名称
   * @returns 当前主题名称
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * 获取主题配置
   * @param themeName 主题名称
   * @returns 主题配置
   */
  getTheme(themeName: string): ThemeConfig | undefined {
    return this.themes.get(themeName);
  }

  /**
   * 获取当前主题配置
   * @returns 当前主题配置
   */
  getCurrentThemeConfig(): ThemeConfig | undefined {
    return this.themes.get(this.currentTheme);
  }

  /**
   * 获取所有可用主题
   * @returns 主题名称数组
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 获取所有主题配置
   * @returns 主题配置数组
   */
  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  /**
   * 设置主题
   * @param themeName 主题名称
   */
  setTheme(themeName: string): void {
    const startTime = performance.now();

    try {
      if (!this.themes.has(themeName)) {
        throw new Error(`Theme not found: ${themeName}`);
      }

      const oldTheme = this.currentTheme;
      this.currentTheme = themeName;

      // 应用主题
      this.applyTheme(themeName);

      // 保存到存储
      this.saveCurrentTheme();

      // 触发变更事件
      if (this.options.enableChangeEvents && oldTheme !== themeName) {
        this.emitThemeChange(oldTheme, themeName);
      }

      globalPerformanceMonitor.record('theme-change', performance.now() - startTime);
    } catch (error) {
      globalPerformanceMonitor.record('theme-change-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 注册主题
   * @param theme 主题配置
   */
  registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.name, theme);
  }

  /**
   * 注销主题
   * @param themeName 主题名称
   */
  unregisterTheme(themeName: string): void {
    if (themeName === this.currentTheme) {
      throw new Error('Cannot unregister current theme');
    }
    this.themes.delete(themeName);
  }

  /**
   * 创建自定义主题
   * @param name 主题名称
   * @param baseTheme 基础主题名称
   * @param overrides 覆盖配置
   * @returns 自定义主题配置
   */
  createCustomTheme(
    name: string, 
    baseTheme: string, 
    overrides: Partial<ThemeConfig>
  ): ThemeConfig {
    const base = this.themes.get(baseTheme);
    if (!base) {
      throw new Error(`Base theme not found: ${baseTheme}`);
    }

    const customTheme: ThemeConfig = {
      ...base,
      ...overrides,
      name,
      colors: { ...base.colors, ...overrides.colors },
      spacing: { ...base.spacing, ...overrides.spacing },
      borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
      shadows: { ...base.shadows, ...overrides.shadows },
      typography: {
        ...base.typography,
        ...overrides.typography,
        fontSize: { ...base.typography.fontSize, ...overrides.typography?.fontSize },
        fontWeight: { ...base.typography.fontWeight, ...overrides.typography?.fontWeight },
        lineHeight: { ...base.typography.lineHeight, ...overrides.typography?.lineHeight }
      },
      animation: {
        ...base.animation,
        ...overrides.animation,
        duration: { ...base.animation.duration, ...overrides.animation?.duration },
        easing: { ...base.animation.easing, ...overrides.animation?.easing }
      }
    };

    this.registerTheme(customTheme);
    return customTheme;
  }

  // ============================================================================
  // 公共API - 事件系统
  // ============================================================================

  /**
   * 添加主题变更监听器
   * @param listener 监听器函数
   */
  onThemeChange(listener: (event: ThemeChangeEvent) => void): void {
    if (!this.eventListeners.has('theme-change')) {
      this.eventListeners.set('theme-change', new Set());
    }
    this.eventListeners.get('theme-change')!.add(listener);
  }

  /**
   * 移除主题变更监听器
   * @param listener 监听器函数
   */
  offThemeChange(listener: (event: ThemeChangeEvent) => void): void {
    const listeners = this.eventListeners.get('theme-change');
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // ============================================================================
  // 公共API - 工具方法
  // ============================================================================

  /**
   * 检测系统主题偏好
   * @returns 系统主题偏好
   */
  detectSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * 监听系统主题变化
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    this.eventListeners.clear();
    
    // 移除样式元素
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 应用主题
   * @param themeName 主题名称
   */
  private applyTheme(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme not found: ${themeName}`);
    }

    if (this.options.enableCSSVariables) {
      this.injectCSSVariables(theme);
    }
  }

  /**
   * 注入CSS变量
   * @param theme 主题配置
   */
  private injectCSSVariables(theme: ThemeConfig): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.setAttribute('data-ldesign-cropper-theme', '');
      document.head.appendChild(this.styleElement);
    }

    const cssVariables = this.generateCSSVariables(theme);
    this.styleElement.textContent = `:root { ${cssVariables} }`;
  }

  /**
   * 生成CSS变量
   * @param theme 主题配置
   * @returns CSS变量字符串
   */
  private generateCSSVariables(theme: ThemeConfig): string {
    const variables: string[] = [];
    const prefix = this.options.cssVariablePrefix;

    // 颜色变量
    for (const [key, value] of Object.entries(theme.colors)) {
      variables.push(`${prefix}-color-${this.kebabCase(key)}: ${value};`);
    }

    // 间距变量
    for (const [key, value] of Object.entries(theme.spacing)) {
      variables.push(`${prefix}-spacing-${key}: ${value};`);
    }

    // 圆角变量
    for (const [key, value] of Object.entries(theme.borderRadius)) {
      variables.push(`${prefix}-border-radius-${key}: ${value};`);
    }

    // 阴影变量
    for (const [key, value] of Object.entries(theme.shadows)) {
      variables.push(`${prefix}-shadow-${key}: ${value};`);
    }

    // 字体变量
    variables.push(`${prefix}-font-family: ${theme.typography.fontFamily};`);
    
    for (const [key, value] of Object.entries(theme.typography.fontSize)) {
      variables.push(`${prefix}-font-size-${key}: ${value};`);
    }

    for (const [key, value] of Object.entries(theme.typography.fontWeight)) {
      variables.push(`${prefix}-font-weight-${key}: ${value};`);
    }

    for (const [key, value] of Object.entries(theme.typography.lineHeight)) {
      variables.push(`${prefix}-line-height-${key}: ${value};`);
    }

    // 动画变量
    for (const [key, value] of Object.entries(theme.animation.duration)) {
      variables.push(`${prefix}-duration-${key}: ${value};`);
    }

    for (const [key, value] of Object.entries(theme.animation.easing)) {
      variables.push(`${prefix}-easing-${this.kebabCase(key)}: ${value};`);
    }

    return variables.join(' ');
  }

  /**
   * 转换为kebab-case
   * @param str 字符串
   * @returns kebab-case字符串
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * 发射主题变更事件
   * @param oldTheme 旧主题
   * @param newTheme 新主题
   */
  private emitThemeChange(oldTheme: string, newTheme: string): void {
    const listeners = this.eventListeners.get('theme-change');
    if (listeners) {
      const themeConfig = this.themes.get(newTheme)!;
      const event: ThemeChangeEvent = {
        type: 'theme-change',
        oldTheme,
        newTheme,
        themeConfig,
        timestamp: Date.now()
      };

      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in theme change listener:', error);
        }
      });
    }
  }

  /**
   * 保存当前主题到存储
   */
  private saveCurrentTheme(): void {
    if (!this.options.enablePersistence) {
      return;
    }

    try {
      localStorage.setItem(this.options.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('Failed to save current theme to storage:', error);
    }
  }

  /**
   * 从存储加载当前主题
   * @returns 当前主题名称
   */
  private loadCurrentTheme(): string {
    if (!this.options.enablePersistence) {
      return this.options.defaultTheme;
    }

    try {
      const savedTheme = localStorage.getItem(this.options.storageKey);
      if (savedTheme && this.themes.has(savedTheme)) {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load current theme from storage:', error);
    }

    return this.options.defaultTheme;
  }
}
