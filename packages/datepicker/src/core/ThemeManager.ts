/**
 * ThemeManager 主题管理器
 * 提供主题切换、CSS 变量管理等功能
 */

import type { ThemeType } from '../types';
import { EventManager } from './EventManager';

/**
 * 主题变量定义
 */
interface ThemeVariables {
  // 品牌色
  '--ldesign-brand-color': string;
  '--ldesign-brand-color-hover': string;
  '--ldesign-brand-color-active': string;
  '--ldesign-brand-color-disabled': string;

  // 背景色
  '--ldesign-bg-color-component': string;
  '--ldesign-bg-color-component-hover': string;
  '--ldesign-bg-color-component-active': string;
  '--ldesign-bg-color-component-disabled': string;

  // 边框色
  '--ldesign-border-color': string;
  '--ldesign-border-color-hover': string;
  '--ldesign-border-color-focus': string;

  // 文字色
  '--ldesign-text-color-primary': string;
  '--ldesign-text-color-secondary': string;
  '--ldesign-text-color-placeholder': string;
  '--ldesign-text-color-disabled': string;

  // 阴影
  '--ldesign-shadow-1': string;
  '--ldesign-shadow-2': string;
  '--ldesign-shadow-3': string;

  // 圆角
  '--ls-border-radius-base': string;
  '--ls-border-radius-sm': string;
  '--ls-border-radius-lg': string;

  // 间距
  '--ls-spacing-xs': string;
  '--ls-spacing-sm': string;
  '--ls-spacing-base': string;
  '--ls-spacing-lg': string;
  '--ls-spacing-xl': string;
}

/**
 * 内置主题配置
 */
const BUILT_IN_THEMES: Record<ThemeType, Partial<ThemeVariables>> = {
  light: {
    '--ldesign-brand-color': '#722ED1',
    '--ldesign-brand-color-hover': '#5e2aa7',
    '--ldesign-brand-color-active': '#491f84',
    '--ldesign-brand-color-disabled': '#bfa4e5',

    '--ldesign-bg-color-component': '#ffffff',
    '--ldesign-bg-color-component-hover': '#f8f8f8',
    '--ldesign-bg-color-component-active': '#f0f0f0',
    '--ldesign-bg-color-component-disabled': '#fafafa',

    '--ldesign-border-color': '#e5e5e5',
    '--ldesign-border-color-hover': '#d9d9d9',
    '--ldesign-border-color-focus': '#722ED1',

    '--ldesign-text-color-primary': 'rgba(0, 0, 0, 0.9)',
    '--ldesign-text-color-secondary': 'rgba(0, 0, 0, 0.7)',
    '--ldesign-text-color-placeholder': 'rgba(0, 0, 0, 0.5)',
    '--ldesign-text-color-disabled': 'rgba(0, 0, 0, 0.3)',

    '--ldesign-shadow-1': '0 1px 10px rgba(0, 0, 0, 0.05)',
    '--ldesign-shadow-2': '0 4px 20px rgba(0, 0, 0, 0.08)',
    '--ldesign-shadow-3': '0 8px 30px rgba(0, 0, 0, 0.12)'
  },

  dark: {
    '--ldesign-brand-color': '#8c5ad3',
    '--ldesign-brand-color-hover': '#a67fdb',
    '--ldesign-brand-color-active': '#bfa4e5',
    '--ldesign-brand-color-disabled': '#5e2aa7',

    '--ldesign-bg-color-component': '#1f1f1f',
    '--ldesign-bg-color-component-hover': '#2a2a2a',
    '--ldesign-bg-color-component-active': '#333333',
    '--ldesign-bg-color-component-disabled': '#1a1a1a',

    '--ldesign-border-color': '#404040',
    '--ldesign-border-color-hover': '#4a4a4a',
    '--ldesign-border-color-focus': '#8c5ad3',

    '--ldesign-text-color-primary': 'rgba(255, 255, 255, 0.9)',
    '--ldesign-text-color-secondary': 'rgba(255, 255, 255, 0.7)',
    '--ldesign-text-color-placeholder': 'rgba(255, 255, 255, 0.5)',
    '--ldesign-text-color-disabled': 'rgba(255, 255, 255, 0.3)',

    '--ldesign-shadow-1': '0 1px 10px rgba(0, 0, 0, 0.3)',
    '--ldesign-shadow-2': '0 4px 20px rgba(0, 0, 0, 0.4)',
    '--ldesign-shadow-3': '0 8px 30px rgba(0, 0, 0, 0.5)'
  },

  auto: {} // 自动模式会根据系统主题动态切换
};

/**
 * 主题管理器事件
 */
interface ThemeManagerEvents {
  'theme-change': (theme: ThemeType, variables: Partial<ThemeVariables>) => void;
  'variables-update': (variables: Partial<ThemeVariables>) => void;
  'system-theme-change': (isDark: boolean) => void;
}

/**
 * 主题管理器类
 */
export class ThemeManager {
  /** 事件管理器 */
  private eventManager = new EventManager();

  /** 当前主题 */
  private currentTheme: ThemeType = 'light';

  /** 自定义主题配置 */
  private customThemes: Map<string, Partial<ThemeVariables>> = new Map();

  /** 系统主题监听器 */
  private systemThemeMediaQuery?: MediaQueryList;

  /** 根元素 */
  private rootElement: HTMLElement;

  /**
   * 构造函数
   * @param rootElement 根元素，默认为 document.documentElement
   */
  constructor(rootElement: HTMLElement = document.documentElement) {
    this.rootElement = rootElement;
    this.initSystemThemeListener();
  }

  /**
   * 初始化系统主题监听器
   */
  private initSystemThemeListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent): void => {
      this.eventManager.emit('system-theme-change', e.matches);

      // 如果当前是自动模式，更新主题
      if (this.currentTheme === 'auto') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    // 添加监听器
    if (this.systemThemeMediaQuery.addEventListener) {
      this.systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // 兼容旧版本浏览器
      this.systemThemeMediaQuery.addListener(handleSystemThemeChange);
    }
  }

  /**
   * 设置主题
   * @param theme 主题类型或自定义主题名称
   */
  setTheme(theme: ThemeType | string): void {
    let actualTheme: ThemeType;
    let variables: Partial<ThemeVariables>;

    if (theme === 'auto') {
      // 自动模式：根据系统主题决定
      const isDarkMode = this.systemThemeMediaQuery?.matches ?? false;
      actualTheme = isDarkMode ? 'dark' : 'light';
      variables = BUILT_IN_THEMES[actualTheme];
    } else if (theme === 'light' || theme === 'dark') {
      // 内置主题
      actualTheme = theme;
      variables = BUILT_IN_THEMES[theme];
    } else {
      // 自定义主题
      const customVariables = this.customThemes.get(theme);
      if (!customVariables) {
        console.warn(`[ThemeManager] Custom theme "${theme}" not found, falling back to light theme`);
        actualTheme = 'light';
        variables = BUILT_IN_THEMES.light;
      } else {
        actualTheme = 'light'; // 自定义主题基于 light 主题
        variables = { ...BUILT_IN_THEMES.light, ...customVariables };
      }
    }

    this.currentTheme = theme as ThemeType;
    this.applyTheme(actualTheme, variables);

    this.eventManager.emit('theme-change', this.currentTheme as any, variables as any);
  }

  /**
   * 应用主题变量
   * @param theme 主题类型
   * @param variables 主题变量
   */
  private applyTheme(theme: ThemeType, variables?: Partial<ThemeVariables>): void {
    const vars = variables || BUILT_IN_THEMES[theme];

    // 应用 CSS 变量
    for (const [property, value] of Object.entries(vars)) {
      this.rootElement.style.setProperty(property, value);
    }

    // 设置主题类名
    this.rootElement.classList.remove('ldesign-theme-light', 'ldesign-theme-dark');
    this.rootElement.classList.add(`ldesign-theme-${theme}`);
  }

  /**
   * 获取当前主题
   * @returns 当前主题
   */
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }

  /**
   * 注册自定义主题
   * @param name 主题名称
   * @param variables 主题变量
   */
  registerTheme(name: string, variables: Partial<ThemeVariables>): void {
    this.customThemes.set(name, variables);
  }

  /**
   * 移除自定义主题
   * @param name 主题名称
   */
  removeTheme(name: string): void {
    this.customThemes.delete(name);
  }

  /**
   * 获取所有可用主题
   * @returns 主题名称数组
   */
  getAvailableThemes(): string[] {
    return ['light', 'dark', 'auto', ...Array.from(this.customThemes.keys())];
  }

  /**
   * 更新主题变量
   * @param variables 要更新的变量
   */
  updateVariables(variables: Partial<ThemeVariables>): void {
    // 应用变量
    for (const [property, value] of Object.entries(variables)) {
      this.rootElement.style.setProperty(property, value);
    }

    this.eventManager.emit('variables-update', variables);
  }

  /**
   * 获取 CSS 变量值
   * @param property CSS 变量名
   * @returns 变量值
   */
  getVariable(property: keyof ThemeVariables): string {
    return getComputedStyle(this.rootElement).getPropertyValue(property).trim();
  }

  /**
   * 检查是否为深色主题
   * @returns 是否为深色主题
   */
  isDarkTheme(): boolean {
    if (this.currentTheme === 'dark') return true;
    if (this.currentTheme === 'light') return false;
    if (this.currentTheme === 'auto') {
      return this.systemThemeMediaQuery?.matches ?? false;
    }
    return false; // 自定义主题默认为浅色
  }

  /**
   * 切换主题（在 light 和 dark 之间切换）
   */
  toggleTheme(): void {
    const newTheme = this.isDarkTheme() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * 监听主题事件
   * @param event 事件名称
   * @param listener 监听器
   * @returns 监听器ID
   */
  on<K extends keyof ThemeManagerEvents>(
    event: K,
    listener: ThemeManagerEvents[K]
  ): string {
    return this.eventManager.on(event, listener as any);
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listenerOrId 监听器或ID
   */
  off<K extends keyof ThemeManagerEvents>(
    event: K,
    listenerOrId?: ThemeManagerEvents[K] | string
  ): void {
    this.eventManager.off(event, listenerOrId as any);
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    // 移除系统主题监听器
    if (this.systemThemeMediaQuery) {
      if (this.systemThemeMediaQuery.removeEventListener) {
        this.systemThemeMediaQuery.removeEventListener('change', () => { });
      } else {
        this.systemThemeMediaQuery.removeListener(() => { });
      }
    }

    // 清理事件管理器
    this.eventManager.destroy();

    // 清理自定义主题
    this.customThemes.clear();
  }
}
