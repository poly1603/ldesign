/**
 * 主题系统
 * 
 * 这个文件包含了组件库的主题管理功能
 * 支持亮色/暗色主题切换，自定义主题配置
 */

import { ThemeConfig } from '../types';

// ==================== 默认主题配置 ====================

/**
 * 默认亮色主题配置
 */
export const defaultLightTheme: ThemeConfig = {
  primaryColor: '#1890ff',
  successColor: '#52c41a',
  warningColor: '#faad14',
  errorColor: '#ff4d4f',
  infoColor: '#1890ff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  fontSize: '14px',
  borderRadius: '6px',
  spacing: '8px'
};

/**
 * 默认暗色主题配置
 */
export const defaultDarkTheme: ThemeConfig = {
  ...defaultLightTheme,
  // 暗色主题下的特殊配置可以在这里覆盖
};

// ==================== 主题管理器 ====================

/**
 * 主题管理器类
 */
export class ThemeManager {
  private currentTheme: 'light' | 'dark' | 'auto' = 'light';
  private customTheme: Partial<ThemeConfig> = {};
  private listeners: Set<(theme: string) => void> = new Set();

  /**
   * 获取当前主题模式
   */
  getCurrentTheme(): 'light' | 'dark' | 'auto' {
    return this.currentTheme;
  }

  /**
   * 设置主题模式
   * @param theme 主题模式
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.currentTheme = theme;
    this.applyTheme();
    this.notifyListeners(theme);
  }

  /**
   * 设置自定义主题配置
   * @param config 主题配置
   */
  setCustomTheme(config: Partial<ThemeConfig>): void {
    this.customTheme = { ...this.customTheme, ...config };
    this.applyTheme();
  }

  /**
   * 获取完整的主题配置
   */
  getThemeConfig(): ThemeConfig {
    const baseTheme = this.currentTheme === 'dark' ? defaultDarkTheme : defaultLightTheme;
    return { ...baseTheme, ...this.customTheme };
  }

  /**
   * 监听主题变化
   * @param listener 监听器函数
   * @returns 取消监听的函数
   */
  onThemeChange(listener: (theme: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 应用主题到 DOM
   */
  private applyTheme(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const config = this.getThemeConfig();

    // 设置主题模式属性
    if (this.currentTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', this.currentTheme);
    }

    // 应用自定义 CSS 变量
    Object.entries(config).forEach(([key, value]) => {
      if (value) {
        const cssVar = this.toCSSVariable(key);
        root.style.setProperty(cssVar, value);
      }
    });
  }

  /**
   * 将配置键转换为 CSS 变量名
   * @param key 配置键
   * @returns CSS 变量名
   */
  private toCSSVariable(key: string): string {
    const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `--ld-${kebabCase}`;
  }

  /**
   * 通知所有监听器
   * @param theme 当前主题
   */
  private notifyListeners(theme: string): void {
    this.listeners.forEach(listener => listener(theme));
  }

  /**
   * 初始化主题管理器
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('ld-theme') as 'light' | 'dark' | 'auto';
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('auto');
    }

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'auto') {
        this.applyTheme();
      }
    });

    // 保存主题设置
    this.onThemeChange((theme) => {
      localStorage.setItem('ld-theme', theme);
    });
  }
}

// ==================== 主题工具函数 ====================

/**
 * 生成颜色变体（hover、active 等状态）
 * @param color 基础颜色
 * @param type 变体类型
 * @returns 颜色值
 */
export function generateColorVariant(color: string, type: 'hover' | 'active' | 'light' | 'lighter'): string {
  // 这里可以使用颜色处理库来生成变体
  // 为了简化，这里返回基础实现
  const colorMap: Record<string, Record<string, string>> = {
    '#1890ff': {
      hover: '#40a9ff',
      active: '#096dd9',
      light: '#e6f7ff',
      lighter: '#f0f9ff'
    },
    '#52c41a': {
      hover: '#73d13d',
      active: '#389e0d',
      light: '#f6ffed',
      lighter: '#f6ffed'
    },
    '#faad14': {
      hover: '#ffc53d',
      active: '#d48806',
      light: '#fffbe6',
      lighter: '#fffbe6'
    },
    '#ff4d4f': {
      hover: '#ff7875',
      active: '#d9363e',
      light: '#fff2f0',
      lighter: '#fff2f0'
    }
  };

  return colorMap[color]?.[type] || color;
}

/**
 * 检查是否为暗色主题
 * @returns 是否为暗色主题
 */
export function isDarkTheme(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * 获取 CSS 变量值
 * @param variable CSS 变量名（不包含 --）
 * @returns CSS 变量值
 */
export function getCSSVariable(variable: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(`--${variable}`).trim();
}

/**
 * 设置 CSS 变量值
 * @param variable CSS 变量名（不包含 --）
 * @param value CSS 变量值
 */
export function setCSSVariable(variable: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(`--${variable}`, value);
}

// ==================== 预设主题 ====================

/**
 * 蓝色主题
 */
export const blueTheme: Partial<ThemeConfig> = {
  primaryColor: '#1890ff',
};

/**
 * 绿色主题
 */
export const greenTheme: Partial<ThemeConfig> = {
  primaryColor: '#52c41a',
};

/**
 * 红色主题
 */
export const redTheme: Partial<ThemeConfig> = {
  primaryColor: '#ff4d4f',
};

/**
 * 紫色主题
 */
export const purpleTheme: Partial<ThemeConfig> = {
  primaryColor: '#722ed1',
};

/**
 * 橙色主题
 */
export const orangeTheme: Partial<ThemeConfig> = {
  primaryColor: '#fa8c16',
};

/**
 * 预设主题集合
 */
export const presetThemes = {
  blue: blueTheme,
  green: greenTheme,
  red: redTheme,
  purple: purpleTheme,
  orange: orangeTheme,
};

// ==================== 导出 ====================

// 创建全局主题管理器实例
export const themeManager = new ThemeManager();

// 导出主题相关的所有功能
export * from '../types';
