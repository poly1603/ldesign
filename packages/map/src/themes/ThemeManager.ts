/**
 * 主题管理器
 * 提供地图主题切换和样式管理功能
 */

import type { 
  ThemeConfig, 
  MapTheme, 
  StyleConfig,
  IStyleManager 
} from '../types';

/**
 * 预定义主题配置
 */
export const PREDEFINED_THEMES: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: '默认主题',
    colors: {
      primary: '#722ED1',
      secondary: '#8C5AD3',
      background: '#FFFFFF',
      text: '#000000',
      border: '#E5E5E5',
      accent: '#F0B80F'
    },
    styles: {
      map: {
        backgroundColor: '#F5F5F5'
      },
      marker: {
        fill: {
          color: 'rgba(114, 46, 209, 0.8)'
        },
        stroke: {
          color: '#722ED1',
          width: 2
        },
        image: {
          radius: 8,
          fill: {
            color: '#722ED1'
          },
          stroke: {
            color: '#FFFFFF',
            width: 2
          }
        }
      },
      popup: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E5E5',
        textColor: '#000000',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      },
      control: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E5E5',
        textColor: '#000000',
        hoverColor: '#F8F8F8'
      }
    }
  },
  
  dark: {
    name: 'dark',
    displayName: '深色主题',
    colors: {
      primary: '#8C5AD3',
      secondary: '#A67FDB',
      background: '#1A1A1A',
      text: '#FFFFFF',
      border: '#404040',
      accent: '#F5C538'
    },
    styles: {
      map: {
        backgroundColor: '#2A2A2A'
      },
      marker: {
        fill: {
          color: 'rgba(140, 90, 211, 0.8)'
        },
        stroke: {
          color: '#8C5AD3',
          width: 2
        },
        image: {
          radius: 8,
          fill: {
            color: '#8C5AD3'
          },
          stroke: {
            color: '#FFFFFF',
            width: 2
          }
        }
      },
      popup: {
        backgroundColor: '#2A2A2A',
        borderColor: '#404040',
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      control: {
        backgroundColor: '#2A2A2A',
        borderColor: '#404040',
        textColor: '#FFFFFF',
        hoverColor: '#3A3A3A'
      }
    }
  },
  
  light: {
    name: 'light',
    displayName: '浅色主题',
    colors: {
      primary: '#5E2AA7',
      secondary: '#7334CB',
      background: '#FAFAFA',
      text: '#333333',
      border: '#D9D9D9',
      accent: '#F0B80F'
    },
    styles: {
      map: {
        backgroundColor: '#FFFFFF'
      },
      marker: {
        fill: {
          color: 'rgba(94, 42, 167, 0.8)'
        },
        stroke: {
          color: '#5E2AA7',
          width: 2
        },
        image: {
          radius: 8,
          fill: {
            color: '#5E2AA7'
          },
          stroke: {
            color: '#FFFFFF',
            width: 2
          }
        }
      },
      popup: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D9D9D9',
        textColor: '#333333',
        shadowColor: 'rgba(0, 0, 0, 0.08)'
      },
      control: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D9D9D9',
        textColor: '#333333',
        hoverColor: '#F0F0F0'
      }
    }
  }
};

/**
 * 主题管理器实现类
 */
export class ThemeManager implements IStyleManager {
  private currentTheme: string = 'default';
  private themes: Map<string, ThemeConfig> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * 构造函数
   */
  constructor() {
    this.initializePredefinedThemes();
  }

  /**
   * 初始化预定义主题
   * @private
   */
  private initializePredefinedThemes(): void {
    Object.entries(PREDEFINED_THEMES).forEach(([name, theme]) => {
      this.themes.set(name, theme);
    });
  }

  /**
   * 设置主题
   * @param themeName 主题名称
   */
  setTheme(themeName: string): boolean {
    const theme = this.themes.get(themeName);
    if (!theme) {
      console.warn(`[ThemeManager] 主题不存在: ${themeName}`);
      return false;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = themeName;

    // 应用主题样式
    this.applyTheme(theme);

    // 分发主题变更事件
    this.dispatchEvent('themechange', {
      type: 'themechange',
      previousTheme,
      currentTheme: themeName,
      theme: theme,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * 获取主题配置
   * @param themeName 主题名称，不传则返回当前主题
   */
  getTheme(themeName?: string): ThemeConfig | null {
    const name = themeName || this.currentTheme;
    return this.themes.get(name) || null;
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): Array<{ name: string; displayName: string }> {
    return Array.from(this.themes.values()).map(theme => ({
      name: theme.name,
      displayName: theme.displayName
    }));
  }

  /**
   * 注册自定义主题
   * @param theme 主题配置
   */
  registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.name, theme);
    
    this.dispatchEvent('themeregister', {
      type: 'themeregister',
      theme: theme,
      timestamp: Date.now()
    });
  }

  /**
   * 移除主题
   * @param themeName 主题名称
   */
  removeTheme(themeName: string): boolean {
    if (themeName === this.currentTheme) {
      console.warn(`[ThemeManager] 不能删除当前使用的主题: ${themeName}`);
      return false;
    }

    const removed = this.themes.delete(themeName);
    if (removed) {
      this.dispatchEvent('themeremove', {
        type: 'themeremove',
        themeName: themeName,
        timestamp: Date.now()
      });
    }

    return removed;
  }

  /**
   * 应用主题样式
   * @param theme 主题配置
   * @private
   */
  private applyTheme(theme: ThemeConfig): void {
    // 应用 CSS 变量
    this.applyCSSVariables(theme);
    
    // 应用地图样式
    this.applyMapStyles(theme);
    
    console.log(`[ThemeManager] 主题已应用: ${theme.displayName}`);
  }

  /**
   * 应用 CSS 变量
   * @param theme 主题配置
   * @private
   */
  private applyCSSVariables(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    // 应用颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--ldesign-theme-${key}`, value);
    });
    
    // 应用样式变量
    if (theme.styles.map) {
      Object.entries(theme.styles.map).forEach(([key, value]) => {
        root.style.setProperty(`--ldesign-map-${key}`, String(value));
      });
    }
  }

  /**
   * 应用地图样式
   * @param theme 主题配置
   * @private
   */
  private applyMapStyles(theme: ThemeConfig): void {
    // 这里可以添加更多地图样式应用逻辑
    // 例如更新图层样式、控件样式等
  }

  /**
   * 获取主题颜色
   * @param colorKey 颜色键名
   * @param themeName 主题名称，不传则使用当前主题
   */
  getThemeColor(colorKey: string, themeName?: string): string | null {
    const theme = this.getTheme(themeName);
    return theme?.colors[colorKey] || null;
  }

  /**
   * 获取主题样式
   * @param styleKey 样式键名
   * @param themeName 主题名称，不传则使用当前主题
   */
  getThemeStyle(styleKey: string, themeName?: string): any {
    const theme = this.getTheme(themeName);
    return theme?.styles[styleKey] || null;
  }

  /**
   * 添加事件监听器
   */
  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 分发事件
   * @private
   */
  private dispatchEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[ThemeManager] 事件处理器错误:`, error);
        }
      });
    }
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    this.eventListeners.clear();
  }
}
