/**
 * 样式管理器
 * 负责管理地图的样式和主题系统
 */

import type { 
  StyleConfig, 
  ThemeConfig, 
  IStyleManager,
  MapTheme,
  StyleOperationOptions
} from '../types';

/**
 * 预定义主题配置
 */
const PREDEFINED_THEMES: Record<MapTheme, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: '默认主题',
    colors: {
      primary: '#722ED1',
      secondary: '#9254DE',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#666666',
      border: '#d9d9d9',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Monaco, Consolas, "Courier New", monospace'
    },
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      small: 2,
      medium: 4,
      large: 8
    },
    shadows: {
      small: '0 1px 3px rgba(0,0,0,0.12)',
      medium: '0 4px 6px rgba(0,0,0,0.16)',
      large: '0 10px 20px rgba(0,0,0,0.19)'
    }
  },
  
  dark: {
    name: 'dark',
    displayName: '深色主题',
    colors: {
      primary: '#722ED1',
      secondary: '#9254DE',
      background: '#1f1f1f',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#404040',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Monaco, Consolas, "Courier New", monospace'
    },
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      small: 2,
      medium: 4,
      large: 8
    },
    shadows: {
      small: '0 1px 3px rgba(0,0,0,0.24)',
      medium: '0 4px 6px rgba(0,0,0,0.32)',
      large: '0 10px 20px rgba(0,0,0,0.38)'
    }
  },

  light: {
    name: 'light',
    displayName: '浅色主题',
    colors: {
      primary: '#722ED1',
      secondary: '#9254DE',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#262626',
      textSecondary: '#8c8c8c',
      border: '#f0f0f0',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Monaco, Consolas, "Courier New", monospace'
    },
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      small: 2,
      medium: 4,
      large: 8
    },
    shadows: {
      small: '0 1px 3px rgba(0,0,0,0.08)',
      medium: '0 4px 6px rgba(0,0,0,0.12)',
      large: '0 10px 20px rgba(0,0,0,0.15)'
    }
  }
};

/**
 * 样式管理器实现类
 * 提供完整的样式和主题管理功能
 */
export class StyleManager implements IStyleManager {
  private currentTheme: MapTheme = 'default';
  private customThemes: Map<string, ThemeConfig> = new Map();
  private styleOverrides: Map<string, any> = new Map();
  private styleElement: HTMLStyleElement | null = null;

  /**
   * 构造函数
   */
  constructor() {
    this.initializeStyleElement();
    this.applyTheme('default');
  }

  /**
   * 设置主题
   * @param theme 主题名称或主题配置
   * @param options 操作选项
   */
  setTheme(theme: MapTheme | ThemeConfig, options?: StyleOperationOptions): void {
    try {
      let themeConfig: ThemeConfig;

      if (typeof theme === 'string') {
        // 预定义主题
        if (PREDEFINED_THEMES[theme]) {
          themeConfig = PREDEFINED_THEMES[theme];
          this.currentTheme = theme;
        } else {
          // 自定义主题
          const customTheme = this.customThemes.get(theme);
          if (!customTheme) {
            throw new Error(`主题 "${theme}" 不存在`);
          }
          themeConfig = customTheme;
          this.currentTheme = theme as MapTheme;
        }
      } else {
        // 主题配置对象
        themeConfig = theme;
        this.currentTheme = theme.name as MapTheme;
      }

      this.applyTheme(themeConfig, options);
    } catch (error) {
      console.error(`[StyleManager] 设置主题失败:`, error);
      throw error;
    }
  }

  /**
   * 获取当前主题
   * @returns 当前主题名称
   */
  getCurrentTheme(): MapTheme {
    return this.currentTheme;
  }

  /**
   * 获取主题配置
   * @param theme 主题名称
   * @returns 主题配置或 null
   */
  getThemeConfig(theme?: MapTheme | string): ThemeConfig | null {
    const themeName = theme || this.currentTheme;
    
    if (PREDEFINED_THEMES[themeName as MapTheme]) {
      return { ...PREDEFINED_THEMES[themeName as MapTheme] };
    }
    
    const customTheme = this.customThemes.get(themeName);
    return customTheme ? { ...customTheme } : null;
  }

  /**
   * 获取所有可用主题
   * @returns 主题列表
   */
  getAvailableThemes(): Array<{ name: string; displayName: string; isCustom: boolean }> {
    const themes: Array<{ name: string; displayName: string; isCustom: boolean }> = [];

    // 预定义主题
    Object.values(PREDEFINED_THEMES).forEach(theme => {
      themes.push({
        name: theme.name,
        displayName: theme.displayName,
        isCustom: false
      });
    });

    // 自定义主题
    this.customThemes.forEach(theme => {
      themes.push({
        name: theme.name,
        displayName: theme.displayName,
        isCustom: true
      });
    });

    return themes;
  }

  /**
   * 注册自定义主题
   * @param theme 主题配置
   */
  registerTheme(theme: ThemeConfig): void {
    this.customThemes.set(theme.name, { ...theme });
  }

  /**
   * 移除自定义主题
   * @param name 主题名称
   * @returns 是否移除成功
   */
  removeTheme(name: string): boolean {
    if (PREDEFINED_THEMES[name as MapTheme]) {
      console.warn(`[StyleManager] 无法移除预定义主题: ${name}`);
      return false;
    }

    return this.customThemes.delete(name);
  }

  /**
   * 设置样式覆盖
   * @param selector CSS 选择器
   * @param styles 样式对象
   */
  setStyleOverride(selector: string, styles: Record<string, any>): void {
    this.styleOverrides.set(selector, styles);
    this.updateStyleElement();
  }

  /**
   * 移除样式覆盖
   * @param selector CSS 选择器
   * @returns 是否移除成功
   */
  removeStyleOverride(selector: string): boolean {
    const removed = this.styleOverrides.delete(selector);
    if (removed) {
      this.updateStyleElement();
    }
    return removed;
  }

  /**
   * 清空所有样式覆盖
   */
  clearStyleOverrides(): void {
    this.styleOverrides.clear();
    this.updateStyleElement();
  }

  /**
   * 获取计算后的样式值
   * @param property 样式属性路径，如 'colors.primary'
   * @returns 样式值
   */
  getComputedStyle(property: string): any {
    const themeConfig = this.getThemeConfig();
    if (!themeConfig) {
      return null;
    }

    const keys = property.split('.');
    let value: any = themeConfig;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * 生成 CSS 变量
   * @param theme 主题配置
   * @returns CSS 变量字符串
   */
  generateCSSVariables(theme?: ThemeConfig): string {
    const themeConfig = theme || this.getThemeConfig();
    if (!themeConfig) {
      return '';
    }

    const variables: string[] = [];

    // 颜色变量
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      variables.push(`--ldesign-color-${key}: ${value};`);
    });

    // 字体变量
    Object.entries(themeConfig.fonts).forEach(([key, value]) => {
      variables.push(`--ldesign-font-${key}: ${value};`);
    });

    // 尺寸变量
    Object.entries(themeConfig.sizes).forEach(([key, value]) => {
      variables.push(`--ldesign-size-${key}: ${value}px;`);
    });

    // 间距变量
    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      variables.push(`--ldesign-spacing-${key}: ${value}px;`);
    });

    // 圆角变量
    Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
      variables.push(`--ldesign-radius-${key}: ${value}px;`);
    });

    // 阴影变量
    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      variables.push(`--ldesign-shadow-${key}: ${value};`);
    });

    return `:root {\n  ${variables.join('\n  ')}\n}`;
  }

  /**
   * 销毁样式管理器
   */
  destroy(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
    this.styleElement = null;
    this.customThemes.clear();
    this.styleOverrides.clear();
  }

  /**
   * 初始化样式元素
   * @private
   */
  private initializeStyleElement(): void {
    if (typeof document === 'undefined') {
      return; // 服务端渲染环境
    }

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'ldesign-map-styles';
    document.head.appendChild(this.styleElement);
  }

  /**
   * 应用主题
   * @param theme 主题配置或主题名称
   * @param options 操作选项
   * @private
   */
  private applyTheme(theme: ThemeConfig | MapTheme, options?: StyleOperationOptions): void {
    let themeConfig: ThemeConfig;

    if (typeof theme === 'string') {
      themeConfig = PREDEFINED_THEMES[theme] || this.customThemes.get(theme)!;
    } else {
      themeConfig = theme;
    }

    if (!themeConfig) {
      throw new Error(`主题配置不存在`);
    }

    this.updateStyleElement(themeConfig);

    // 触发主题变更事件
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('ldesign-theme-changed', {
        detail: {
          theme: themeConfig.name,
          config: themeConfig
        }
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * 更新样式元素
   * @param theme 主题配置
   * @private
   */
  private updateStyleElement(theme?: ThemeConfig): void {
    if (!this.styleElement) {
      return;
    }

    const themeConfig = theme || this.getThemeConfig();
    if (!themeConfig) {
      return;
    }

    let css = this.generateCSSVariables(themeConfig);

    // 添加基础样式
    css += this.generateBaseStyles(themeConfig);

    // 添加样式覆盖
    for (const [selector, styles] of this.styleOverrides) {
      css += `\n${selector} {\n`;
      for (const [property, value] of Object.entries(styles)) {
        css += `  ${this.camelToKebab(property)}: ${value};\n`;
      }
      css += '}';
    }

    this.styleElement.textContent = css;
  }

  /**
   * 生成基础样式
   * @param theme 主题配置
   * @returns CSS 字符串
   * @private
   */
  private generateBaseStyles(theme: ThemeConfig): string {
    return `
.ldesign-map {
  font-family: var(--ldesign-font-primary);
  color: var(--ldesign-color-text);
  background-color: var(--ldesign-color-background);
}

.ldesign-map-control {
  background-color: var(--ldesign-color-surface);
  border: 1px solid var(--ldesign-color-border);
  border-radius: var(--ldesign-radius-medium);
  box-shadow: var(--ldesign-shadow-small);
  color: var(--ldesign-color-text);
}

.ldesign-map-control:hover {
  background-color: var(--ldesign-color-primary);
  color: var(--ldesign-color-background);
}

.ldesign-popup {
  background-color: var(--ldesign-color-surface);
  border: 1px solid var(--ldesign-color-border);
  border-radius: var(--ldesign-radius-medium);
  box-shadow: var(--ldesign-shadow-medium);
  color: var(--ldesign-color-text);
  padding: var(--ldesign-spacing-md);
}

.ldesign-marker {
  color: var(--ldesign-color-primary);
}
`;
  }

  /**
   * 将驼峰命名转换为短横线命名
   * @param str 驼峰命名字符串
   * @returns 短横线命名字符串
   * @private
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}
