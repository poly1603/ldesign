/**
 * 主题管理类
 * 实现主题切换、CSS变量管理、系统主题检测等功能
 */

import type { ThemeType, ThemeConfig } from '../types';
import { EventManager } from '../utils/EventManager';
import { DOMUtils } from '../utils/DOMUtils';

/**
 * 主题变量定义
 */
interface ThemeVariables {
  // 颜色变量
  '--ld-primary-color': string;
  '--ld-primary-color-hover': string;
  '--ld-primary-color-active': string;
  '--ld-background-color': string;
  '--ld-background-color-secondary': string;
  '--ld-text-color': string;
  '--ld-text-color-secondary': string;
  '--ld-text-color-disabled': string;
  '--ld-border-color': string;
  '--ld-border-color-hover': string;
  '--ld-border-color-focus': string;
  '--ld-shadow-color': string;
  
  // 尺寸变量
  '--ld-border-radius': string;
  '--ld-border-radius-small': string;
  '--ld-border-radius-large': string;
  '--ld-font-size': string;
  '--ld-font-size-small': string;
  '--ld-font-size-large': string;
  '--ld-line-height': string;
  '--ld-spacing': string;
  '--ld-spacing-small': string;
  '--ld-spacing-large': string;
  
  // 阴影变量
  '--ld-box-shadow': string;
  '--ld-box-shadow-hover': string;
  '--ld-box-shadow-focus': string;
  
  // 动画变量
  '--ld-transition-duration': string;
  '--ld-transition-timing': string;
}

/**
 * 预定义主题
 */
const PREDEFINED_THEMES: Record<'light' | 'dark', Partial<ThemeVariables>> = {
  light: {
    '--ld-primary-color': '#1890ff',
    '--ld-primary-color-hover': '#40a9ff',
    '--ld-primary-color-active': '#096dd9',
    '--ld-background-color': '#ffffff',
    '--ld-background-color-secondary': '#fafafa',
    '--ld-text-color': '#000000d9',
    '--ld-text-color-secondary': '#00000073',
    '--ld-text-color-disabled': '#00000040',
    '--ld-border-color': '#d9d9d9',
    '--ld-border-color-hover': '#40a9ff',
    '--ld-border-color-focus': '#1890ff',
    '--ld-shadow-color': 'rgba(0, 0, 0, 0.15)',
    '--ld-border-radius': '6px',
    '--ld-border-radius-small': '4px',
    '--ld-border-radius-large': '8px',
    '--ld-font-size': '14px',
    '--ld-font-size-small': '12px',
    '--ld-font-size-large': '16px',
    '--ld-line-height': '1.5715',
    '--ld-spacing': '8px',
    '--ld-spacing-small': '4px',
    '--ld-spacing-large': '16px',
    '--ld-box-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)',
    '--ld-box-shadow-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
    '--ld-box-shadow-focus': '0 0 0 2px rgba(24, 144, 255, 0.2)',
    '--ld-transition-duration': '0.3s',
    '--ld-transition-timing': 'cubic-bezier(0.645, 0.045, 0.355, 1)'
  },
  
  dark: {
    '--ld-primary-color': '#1890ff',
    '--ld-primary-color-hover': '#40a9ff',
    '--ld-primary-color-active': '#096dd9',
    '--ld-background-color': '#141414',
    '--ld-background-color-secondary': '#1f1f1f',
    '--ld-text-color': '#ffffffd9',
    '--ld-text-color-secondary': '#ffffff73',
    '--ld-text-color-disabled': '#ffffff40',
    '--ld-border-color': '#434343',
    '--ld-border-color-hover': '#40a9ff',
    '--ld-border-color-focus': '#1890ff',
    '--ld-shadow-color': 'rgba(0, 0, 0, 0.45)',
    '--ld-border-radius': '6px',
    '--ld-border-radius-small': '4px',
    '--ld-border-radius-large': '8px',
    '--ld-font-size': '14px',
    '--ld-font-size-small': '12px',
    '--ld-font-size-large': '16px',
    '--ld-line-height': '1.5715',
    '--ld-spacing': '8px',
    '--ld-spacing-small': '4px',
    '--ld-spacing-large': '16px',
    '--ld-box-shadow': '0 2px 8px rgba(0, 0, 0, 0.45)',
    '--ld-box-shadow-hover': '0 4px 12px rgba(0, 0, 0, 0.45)',
    '--ld-box-shadow-focus': '0 0 0 2px rgba(24, 144, 255, 0.2)',
    '--ld-transition-duration': '0.3s',
    '--ld-transition-timing': 'cubic-bezier(0.645, 0.045, 0.355, 1)'
  }
};

/**
 * 主题管理器类
 */
export class ThemeManager {
  /** 当前主题类型 */
  private currentTheme: ThemeType = 'light';
  
  /** 当前主题配置 */
  private currentConfig: ThemeConfig;
  
  /** 事件管理器 */
  private eventManager: EventManager;
  
  /** 系统主题媒体查询 */
  private systemThemeQuery?: MediaQueryList;
  
  /** 主题容器元素 */
  private container: HTMLElement;
  
  /** 是否已初始化 */
  private initialized: boolean = false;
  
  // ==================== 构造函数 ====================
  
  /**
   * 构造函数
   * @param config 主题配置
   * @param container 主题容器元素
   */
  constructor(config?: Partial<ThemeConfig>, container?: HTMLElement) {
    this.eventManager = new EventManager();
    this.container = container || document.documentElement;
    
    // 初始化配置
    this.currentConfig = {
      type: 'light',
      ...config
    };
    
    this.initialize();
  }
  
  // ==================== 初始化方法 ====================
  
  /**
   * 初始化主题管理器
   */
  private initialize(): void {
    if (this.initialized) {
      return;
    }
    
    // 检测系统主题
    this.setupSystemThemeDetection();
    
    // 设置初始主题
    this.setTheme(this.currentConfig.type);
    
    this.initialized = true;
  }
  
  /**
   * 设置系统主题检测
   */
  private setupSystemThemeDetection(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    
    this.systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 监听系统主题变化
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (this.currentTheme === 'auto') {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(systemTheme);
        
        // 触发主题变化事件
        this.eventManager.emit('themeChange', {
          theme: 'auto',
          actualTheme: systemTheme,
          source: 'system'
        });
      }
    };
    
    // 兼容不同浏览器的事件监听方式
    if (this.systemThemeQuery.addEventListener) {
      this.systemThemeQuery.addEventListener('change', handleSystemThemeChange);
    } else if (this.systemThemeQuery.addListener) {
      this.systemThemeQuery.addListener(handleSystemThemeChange);
    }
  }
  
  // ==================== 主题设置方法 ====================
  
  /**
   * 设置主题
   * @param theme 主题类型
   * @param config 主题配置
   */
  setTheme(theme: ThemeType, config?: Partial<ThemeConfig>): void {
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;
    
    // 更新配置
    if (config) {
      this.currentConfig = { ...this.currentConfig, ...config, type: theme };
    } else {
      this.currentConfig.type = theme;
    }
    
    // 应用主题
    const actualTheme = this.resolveActualTheme(theme);
    this.applyTheme(actualTheme);
    
    // 触发主题变化事件
    this.eventManager.emit('themeChange', {
      theme,
      oldTheme,
      actualTheme,
      source: 'manual'
    });
  }
  
  /**
   * 获取当前主题
   * @returns 当前主题类型
   */
  getTheme(): ThemeType {
    return this.currentTheme;
  }
  
  /**
   * 获取实际应用的主题
   * @returns 实际主题类型
   */
  getActualTheme(): 'light' | 'dark' {
    return this.resolveActualTheme(this.currentTheme);
  }
  
  /**
   * 切换主题
   * @returns 切换后的主题
   */
  toggleTheme(): ThemeType {
    const currentActual = this.getActualTheme();
    const newTheme: ThemeType = currentActual === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }
  
  // ==================== 主题应用方法 ====================
  
  /**
   * 应用主题
   * @param theme 主题类型
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    // 获取主题变量
    const themeVariables = this.getThemeVariables(theme);
    
    // 应用CSS变量
    this.applyCSSVariables(themeVariables);
    
    // 设置主题类名
    this.setThemeClassName(theme);
    
    // 应用自定义配置
    this.applyCustomConfig();
  }
  
  /**
   * 获取主题变量
   * @param theme 主题类型
   * @returns 主题变量
   */
  private getThemeVariables(theme: 'light' | 'dark'): Partial<ThemeVariables> {
    const baseVariables = PREDEFINED_THEMES[theme];
    const customVariables = this.currentConfig.customVariables || {};
    
    return { ...baseVariables, ...customVariables };
  }
  
  /**
   * 应用CSS变量
   * @param variables CSS变量
   */
  private applyCSSVariables(variables: Record<string, string>): void {
    Object.entries(variables).forEach(([name, value]) => {
      this.container.style.setProperty(name, value);
    });
  }
  
  /**
   * 设置主题类名
   * @param theme 主题类型
   */
  private setThemeClassName(theme: 'light' | 'dark'): void {
    // 移除旧的主题类名
    DOMUtils.removeClass(this.container, 'ld-theme-light');
    DOMUtils.removeClass(this.container, 'ld-theme-dark');
    
    // 添加新的主题类名
    DOMUtils.addClass(this.container, `ld-theme-${theme}`);
  }
  
  /**
   * 应用自定义配置
   */
  private applyCustomConfig(): void {
    const config = this.currentConfig;
    
    // 应用主色调
    if (config.primaryColor) {
      this.container.style.setProperty('--ld-primary-color', config.primaryColor);
    }
    
    // 应用背景色
    if (config.backgroundColor) {
      this.container.style.setProperty('--ld-background-color', config.backgroundColor);
    }
    
    // 应用文本色
    if (config.textColor) {
      this.container.style.setProperty('--ld-text-color', config.textColor);
    }
    
    // 应用边框色
    if (config.borderColor) {
      this.container.style.setProperty('--ld-border-color', config.borderColor);
    }
    
    // 应用阴影
    if (config.boxShadow) {
      this.container.style.setProperty('--ld-box-shadow', config.boxShadow);
    }
    
    // 应用圆角
    if (config.borderRadius) {
      this.container.style.setProperty('--ld-border-radius', config.borderRadius);
    }
  }
  
  // ==================== 工具方法 ====================
  
  /**
   * 解析实际主题类型
   * @param theme 主题类型
   * @returns 实际主题类型
   */
  private resolveActualTheme(theme: ThemeType): 'light' | 'dark' {
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }
  
  /**
   * 获取系统主题
   * @returns 系统主题类型
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // ==================== 事件方法 ====================
  
  /**
   * 监听主题变化事件
   * @param listener 事件监听器
   * @returns 监听器ID
   */
  onThemeChange(listener: (data: any) => void): string {
    return this.eventManager.on('themeChange', listener);
  }
  
  /**
   * 移除主题变化事件监听器
   * @param listenerId 监听器ID
   */
  offThemeChange(listenerId: string): void {
    this.eventManager.off('themeChange', listenerId);
  }
  
  // ==================== 销毁方法 ====================
  
  /**
   * 销毁主题管理器
   */
  destroy(): void {
    // 移除系统主题监听
    if (this.systemThemeQuery) {
      // 兼容不同浏览器的事件移除方式
      if (this.systemThemeQuery.removeEventListener) {
        this.systemThemeQuery.removeEventListener('change', () => {});
      } else if (this.systemThemeQuery.removeListener) {
        this.systemThemeQuery.removeListener(() => {});
      }
    }
    
    // 清理事件管理器
    this.eventManager.removeAllListeners();
    
    // 重置状态
    this.initialized = false;
  }
}
