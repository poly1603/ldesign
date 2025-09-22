/**
 * 主题管理器实现
 * 提供主题的注册、加载、切换和管理功能
 */

import type {
  ThemeManager as IThemeManager,
  ThemeConfig,
  ThemeMetadata,
  ThemeContext,
  ThemeState,
  ThemeVariables
} from '../types/themes';

import { EventManager } from './EventManager';

/**
 * 主题管理器实现
 */
export class ThemeManager implements IThemeManager {
  private readonly eventManager: EventManager;
  private readonly themes: Map<string, ThemeContext>;
  private currentTheme: string | null = null;
  private readonly cssVariables: Map<string, string>;
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.eventManager = new EventManager();
    this.themes = new Map();
    this.cssVariables = new Map();
    this.initializeStyleElement();
  }

  // ==================== 主题注册 ====================

  register(name: string, config: ThemeConfig, metadata?: ThemeMetadata): void {
    const themeMetadata: ThemeMetadata = {
      name,
      version: '1.0.0',
      ...metadata
    };

    const context: ThemeContext = {
      name,
      config: { ...config },
      metadata: themeMetadata,
      state: ThemeState.UNLOADED,
      variables: this.mergeVariables(config.variables || {}),
      cssText: this.generateCSSText(config)
    };

    this.themes.set(name, context);
  }

  unregister(name: string): void {
    if (this.currentTheme === name) {
      this.currentTheme = null;
      this.removeCSSText();
    }
    this.themes.delete(name);
  }

  // ==================== 主题加载 ====================

  async load(name: string): Promise<void> {
    const context = this.themes.get(name);
    if (!context) {
      throw new Error(`Theme ${name} is not registered`);
    }

    if (context.state === ThemeState.LOADED) {
      return;
    }

    try {
      context.state = ThemeState.LOADING;

      // 加载主题依赖
      if (context.config.dependencies) {
        for (const dep of context.config.dependencies) {
          await this.load(dep);
        }
      }

      // 处理主题继承
      if (context.config.extends) {
        const parentContext = this.themes.get(context.config.extends);
        if (parentContext) {
          context.variables = this.mergeVariables(parentContext.variables, context.variables);
          context.cssText = this.generateCSSText(context.config, parentContext.cssText);
        }
      }

      context.state = ThemeState.LOADED;
      this.eventManager.emit('theme:load' as any, { themeName: name });

    } catch (error) {
      context.state = ThemeState.ERROR;
      this.eventManager.emit('theme:error' as any, { themeName: name, error });
      throw error;
    }
  }

  unload(name: string): void {
    const context = this.themes.get(name);
    if (context) {
      context.state = ThemeState.UNLOADED;
      if (this.currentTheme === name) {
        this.currentTheme = null;
        this.removeCSSText();
      }
    }
  }

  // ==================== 主题切换 ====================

  async setTheme(name: string): Promise<void> {
    if (this.currentTheme === name) {
      return;
    }

    const context = this.themes.get(name);
    if (!context) {
      throw new Error(`Theme ${name} is not registered`);
    }

    // 加载主题
    await this.load(name);

    const previousTheme = this.currentTheme;
    
    // 设置当前主题
    if (this.currentTheme) {
      const currentContext = this.themes.get(this.currentTheme);
      if (currentContext) {
        currentContext.state = ThemeState.LOADED;
      }
    }

    this.currentTheme = name;
    context.state = ThemeState.ACTIVE;

    // 应用主题样式
    this.applyCSSText(context.cssText || '');
    this.setVariables(this.flattenVariables(context.variables));

    this.eventManager.emit('theme:change' as any, { from: previousTheme, to: name });
  }

  getCurrentTheme(): string | null {
    return this.currentTheme;
  }

  // ==================== 主题查询 ====================

  has(name: string): boolean {
    return this.themes.has(name);
  }

  get(name: string): ThemeContext | null {
    const context = this.themes.get(name);
    return context ? { ...context } : null;
  }

  list(): string[] {
    return Array.from(this.themes.keys());
  }

  // ==================== 主题状态 ====================

  getState(name: string): ThemeState {
    const context = this.themes.get(name);
    return context ? context.state : ThemeState.UNLOADED;
  }

  isLoaded(name: string): boolean {
    return this.getState(name) === ThemeState.LOADED || this.getState(name) === ThemeState.ACTIVE;
  }

  isActive(name: string): boolean {
    return this.getState(name) === ThemeState.ACTIVE;
  }

  // ==================== 变量管理 ====================

  getVariable(name: string): string | null {
    return this.cssVariables.get(name) || null;
  }

  setVariable(name: string, value: string): void {
    this.cssVariables.set(name, value);
    if (this.styleElement) {
      this.styleElement.style.setProperty(`--${name}`, value);
    }
  }

  getVariables(): Record<string, string> {
    return Object.fromEntries(this.cssVariables);
  }

  setVariables(variables: Record<string, string>): void {
    for (const [name, value] of Object.entries(variables)) {
      this.setVariable(name, value);
    }
  }

  // ==================== CSS 管理 ====================

  getCSSText(name: string): string | null {
    const context = this.themes.get(name);
    return context ? context.cssText || null : null;
  }

  applyCSSText(cssText: string): void {
    if (this.styleElement) {
      this.styleElement.textContent = cssText;
    }
  }

  removeCSSText(): void {
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
    this.cssVariables.clear();
  }

  // ==================== 事件系统 ====================

  on(event: 'change', listener: (theme: string) => void): void;
  on(event: 'load', listener: (theme: string) => void): void;
  on(event: 'error', listener: (theme: string, error: Error) => void): void;
  on(event: string, listener: Function): void {
    this.eventManager.on(event as any, listener as any);
  }

  off(event: string, listener: Function): void {
    this.eventManager.off(event as any, listener as any);
  }

  // ==================== 清理 ====================

  clear(): void {
    this.themes.clear();
    this.currentTheme = null;
    this.cssVariables.clear();
    this.removeCSSText();
    this.eventManager.clear();
  }

  // ==================== 私有方法 ====================

  private initializeStyleElement(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'ldesign-video-theme';
    document.head.appendChild(this.styleElement);
  }

  private mergeVariables(...variableSets: Partial<ThemeVariables>[]): ThemeVariables {
    const merged: any = {
      colors: {},
      fonts: {},
      sizes: {},
      animations: {}
    };

    for (const variables of variableSets) {
      if (variables.colors) Object.assign(merged.colors, variables.colors);
      if (variables.fonts) Object.assign(merged.fonts, variables.fonts);
      if (variables.sizes) Object.assign(merged.sizes, variables.sizes);
      if (variables.animations) Object.assign(merged.animations, variables.animations);
    }

    return merged;
  }

  private flattenVariables(variables: ThemeVariables): Record<string, string> {
    const flattened: Record<string, string> = {};

    // 展平颜色变量
    if (variables.colors) {
      for (const [key, value] of Object.entries(variables.colors)) {
        flattened[`color-${key}`] = value;
      }
    }

    // 展平字体变量
    if (variables.fonts) {
      for (const [key, value] of Object.entries(variables.fonts)) {
        flattened[`font-${key}`] = value;
      }
    }

    // 展平尺寸变量
    if (variables.sizes) {
      for (const [key, value] of Object.entries(variables.sizes)) {
        flattened[`size-${key}`] = value;
      }
    }

    // 展平动画变量
    if (variables.animations) {
      for (const [key, value] of Object.entries(variables.animations)) {
        flattened[`animation-${key}`] = value;
      }
    }

    return flattened;
  }

  private generateCSSText(config: ThemeConfig, parentCSSText?: string): string {
    let cssText = parentCSSText || '';

    // 添加 CSS 变量
    if (config.variables) {
      const variables = this.flattenVariables(config.variables);
      const variableDeclarations = Object.entries(variables)
        .map(([name, value]) => `  --${name}: ${value};`)
        .join('\n');

      cssText += `
:root {
${variableDeclarations}
}
`;
    }

    // 添加自定义 CSS 变量
    if (config.customVariables) {
      const customDeclarations = Object.entries(config.customVariables)
        .map(([name, value]) => `  --${name}: ${value};`)
        .join('\n');

      cssText += `
:root {
${customDeclarations}
}
`;
    }

    // 添加自定义样式
    if (config.styles) {
      cssText += '\n' + config.styles;
    }

    // 添加组件样式
    if (config.components) {
      for (const [component, styles] of Object.entries(config.components)) {
        cssText += `
.ldesign-${component} {
${this.objectToCSS(styles)}
}
`;
      }
    }

    // 添加插件样式
    if (config.plugins) {
      for (const [plugin, styles] of Object.entries(config.plugins)) {
        cssText += `
.ldesign-plugin-${plugin} {
${this.objectToCSS(styles)}
}
`;
      }
    }

    // 添加媒体查询
    if (config.breakpoints) {
      for (const [breakpoint, query] of Object.entries(config.breakpoints)) {
        cssText += `
@media ${query} {
  .ldesign-video-player {
    /* 响应式样式 */
  }
}
`;
      }
    }

    return cssText;
  }

  private objectToCSS(obj: any): string {
    return Object.entries(obj)
      .map(([property, value]) => `  ${this.camelToKebab(property)}: ${value};`)
      .join('\n');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}

/**
 * 创建主题管理器实例
 */
export function createThemeManager(): ThemeManager {
  return new ThemeManager();
}
