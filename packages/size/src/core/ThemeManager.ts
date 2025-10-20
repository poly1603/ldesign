/**
 * @ldesign/size - Theme Manager
 * 
 * Manages theme-specific size adjustments
 */

export type Theme = 'light' | 'dark' | 'auto' | 'high-contrast' | string;

export interface ThemeConfig {
  name: string;
  baseSizeAdjustment?: number;
  spacingScale?: number;
  radiusScale?: number;
  lineHeightScale?: number;
  cssVariables?: Record<string, string>;
}

export interface ThemeManagerOptions {
  defaultTheme?: Theme;
  themes?: Record<string, ThemeConfig>;
  autoDetect?: boolean;
  storageKey?: string;
}

const DEFAULT_THEMES: Record<string, ThemeConfig> = {
  light: {
    name: 'Light',
    baseSizeAdjustment: 0,
    spacingScale: 1,
    radiusScale: 1,
    lineHeightScale: 1
  },
  dark: {
    name: 'Dark',
    baseSizeAdjustment: 0.5, // Slightly larger for better readability in dark mode
    spacingScale: 1.1,
    radiusScale: 1,
    lineHeightScale: 1.05,
    cssVariables: {
      '--size-shadow-strength': '0.2',
      '--size-border-strength': '0.8'
    }
  },
  'high-contrast': {
    name: 'High Contrast',
    baseSizeAdjustment: 1,
    spacingScale: 1.2,
    radiusScale: 0.5, // Sharper edges
    lineHeightScale: 1.2,
    cssVariables: {
      '--size-border-width-base': '2px',
      '--size-font-weight-base': '500'
    }
  }
};

export class ThemeManager {
  private currentTheme: Theme;
  private themes: Map<string, ThemeConfig>;
  private styleElement: HTMLStyleElement | null = null;
  private options: ThemeManagerOptions;
  private mediaQuery: MediaQueryList | null = null;
  private hcQuery: MediaQueryList | null = null;
  private listeners: Set<(theme: Theme) => void> = new Set();
  private mediaHandlers: Array<{ query: MediaQueryList; handler: (e: MediaQueryListEvent) => void }> = [];
  private isDestroyed = false;
  
  // CSS generation cache using WeakMap to auto-cleanup
  private cssCache = new WeakMap<ThemeConfig, string>();
  // Theme CSS string cache to avoid regeneration
  private generatedCSSCache = new Map<string, string>();
  private maxCacheSize = 20; // Limit cache size

  constructor(options: ThemeManagerOptions = {}) {
    this.options = {
      defaultTheme: 'light',
      autoDetect: true,
      storageKey: 'ldesign-theme',
      ...options
    };

    this.themes = new Map();
    
    // Load default themes - optimize with batch processing
    const defaultEntries = Object.entries(DEFAULT_THEMES);
    defaultEntries.forEach(([key, config]) => {
      this.themes.set(key, Object.freeze(config)); // Freeze to prevent accidental modifications
    });

    // Load custom themes
    if (options.themes) {
      const customEntries = Object.entries(options.themes);
      customEntries.forEach(([key, config]) => {
        this.themes.set(key, Object.freeze(config));
      });
    }

    // Initialize theme
    this.currentTheme = this.detectInitialTheme();
    this.applyTheme(this.currentTheme);
    
    // Setup auto detection if enabled
    if (this.options.autoDetect) {
      this.setupAutoDetection();
    }
  }

  /**
   * Detect initial theme
   */
  private detectInitialTheme(): Theme {
    // Check storage first
    if (typeof localStorage !== 'undefined' && this.options.storageKey) {
      const stored = localStorage.getItem(this.options.storageKey);
      if (stored && this.themes.has(stored)) {
        return stored as Theme;
      }
    }

    // Check system preference
    if (this.options.defaultTheme === 'auto' || this.options.autoDetect) {
      return this.getSystemTheme();
    }

    return this.options.defaultTheme || 'light';
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return 'high-contrast';
    }
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  /**
   * Setup auto detection for theme changes
   */
  private setupAutoDetection(): void {
    if (typeof window === 'undefined') return;

    // Listen for dark mode changes with optimized handler
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const darkModeHandler = (e: MediaQueryListEvent) => {
      if (!this.isDestroyed && (this.currentTheme === 'auto' || this.options.autoDetect)) {
        // Debounce theme changes to avoid rapid switching
        requestAnimationFrame(() => {
          if (!this.isDestroyed) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    };
    this.mediaQuery.addEventListener('change', darkModeHandler);
    this.mediaHandlers.push({ query: this.mediaQuery, handler: darkModeHandler });

    // Listen for high contrast changes
    this.hcQuery = window.matchMedia('(prefers-contrast: high)');
    const hcHandler = (e: MediaQueryListEvent) => {
      if (!this.isDestroyed && e.matches && (this.currentTheme === 'auto' || this.options.autoDetect)) {
        requestAnimationFrame(() => {
          if (!this.isDestroyed) {
            this.setTheme('high-contrast');
          }
        });
      }
    };
    this.hcQuery.addEventListener('change', hcHandler);
    this.mediaHandlers.push({ query: this.hcQuery, handler: hcHandler });
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    if (theme === 'auto') {
      theme = this.getSystemTheme();
    }

    if (!this.themes.has(theme)) {
      console.warn(`Theme '${theme}' not found, falling back to 'light'`);
      theme = 'light';
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveToStorage();
    this.notifyListeners(theme);
  }

  /**
   * Apply theme adjustments
   */
  private applyTheme(theme: Theme): void {
    const config = this.themes.get(theme);
    if (!config) return;

    // Check cache first
    let css = this.generatedCSSCache.get(theme);
    if (!css) {
      css = this.generateThemeCSS(config);
      // Limit cache size
      if (this.generatedCSSCache.size >= this.maxCacheSize) {
        const firstKey = this.generatedCSSCache.keys().next().value;
        if (firstKey) this.generatedCSSCache.delete(firstKey);
      }
      this.generatedCSSCache.set(theme, css);
    }
    
    if (typeof document === 'undefined') return;

    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'ldesign-theme-styles';
      document.head.appendChild(this.styleElement);
    }

    // Use textContent for better performance
    this.styleElement.textContent = css;
    
    // Batch DOM operations
    const themeClasses = Array.from(this.themes.keys()).map(k => `theme-${k}`);
    const classList = document.body.classList;
    
    // Remove all theme classes in one operation
    classList.remove(...themeClasses);
    // Add new theme class
    classList.add(`theme-${theme}`);
    document.body.setAttribute('data-theme', theme);
  }

  /**
   * Generate theme CSS
   */
  private generateThemeCSS(config: ThemeConfig): string {
    // Check WeakMap cache first
    const cached = this.cssCache.get(config);
    if (cached) return cached;
    
    // Use array for better performance
    const vars: string[] = [];

    // Apply base size adjustment
    if (config.baseSizeAdjustment) {
      vars.push(`--size-theme-adjustment: ${config.baseSizeAdjustment}`);
    }

    // Apply scales - combine checks for efficiency
    if (config.spacingScale && config.spacingScale !== 1) {
      vars.push(`--size-spacing-scale: ${config.spacingScale}`);
    }
    if (config.radiusScale && config.radiusScale !== 1) {
      vars.push(`--size-radius-scale: ${config.radiusScale}`);
    }
    if (config.lineHeightScale && config.lineHeightScale !== 1) {
      vars.push(`--size-line-scale: ${config.lineHeightScale}`);
    }

    // Apply custom CSS variables - optimize with entries
    if (config.cssVariables) {
      for (const [key, value] of Object.entries(config.cssVariables)) {
        vars.push(`${key}: ${value}`);
      }
    }

    // Build CSS string efficiently
    const cssVars = vars.map(v => `        ${v};`).join('\n');
    const css = `
      :root,
      [data-theme="${this.currentTheme}"] {
${cssVars}
      }
      
      /* Theme-specific adjustments */
      .theme-${this.currentTheme} {
        /* Adjusted base calculations */
        --size-base-adjusted: calc(var(--size-base) + var(--size-theme-adjustment, 0) * 1px);
        
        /* Adjusted spacing with scale */
        --size-spacing-adjusted: calc(var(--size-spacing-md) * var(--size-spacing-scale, 1));
        
        /* Adjusted radius with scale */
        --size-radius-adjusted: calc(var(--size-radius-md) * var(--size-radius-scale, 1));
      }
    `.trim();
    
    // Cache the result
    this.cssCache.set(config, css);
    return css;
  }

  /**
   * Save theme to storage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined' || !this.options.storageKey) return;

    try {
      localStorage.setItem(this.options.storageKey, this.currentTheme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Get theme config
   */
  getThemeConfig(theme?: Theme): ThemeConfig | undefined {
    return this.themes.get(theme || this.currentTheme);
  }

  /**
   * Register custom theme
   */
  registerTheme(name: string, config: ThemeConfig): void {
    this.themes.set(name, config);
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Subscribe to theme changes
   */
  onChange(listener: (theme: Theme) => void): () => void {
    if (this.isDestroyed) {
      console.warn('Cannot add listener to destroyed ThemeManager');
      return () => {};
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(theme: Theme): void {
    if (this.isDestroyed) return;
    // Use try-catch to prevent one listener error from affecting others
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (e) {
        console.error('Theme listener error:', e);
      }
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Destroy theme manager
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Remove style element
    if (this.styleElement?.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
    
    // Remove media query listeners
    this.mediaHandlers.forEach(({ query, handler }) => {
      try {
        query.removeEventListener('change', handler);
      } catch {
        // Ignore errors during cleanup
      }
    });
    this.mediaHandlers.length = 0; // More efficient than creating new array
    this.mediaQuery = null;
    this.hcQuery = null;
    
    // Clean up DOM
    if (typeof document !== 'undefined' && document.body) {
      const themeClasses = Array.from(this.themes.keys()).map(k => `theme-${k}`);
      document.body.classList.remove(...themeClasses);
      document.body.removeAttribute('data-theme');
    }
    
    // Clear all caches and collections
    this.listeners.clear();
    this.themes.clear();
    this.generatedCSSCache.clear();
    // WeakMap will auto-cleanup
  }
}

// Singleton instance
let themeManager: ThemeManager | null = null;

/**
 * Get theme manager instance
 */
export function getThemeManager(): ThemeManager {
  if (!themeManager) {
    themeManager = new ThemeManager();
  }
  return themeManager;
}

/**
 * Destroy theme manager singleton
 */
export function destroyThemeManager(): void {
  if (themeManager) {
    themeManager.destroy();
    themeManager = null;
  }
}

/**
 * Theme utilities
 */
export const theme = {
  /**
   * Set theme
   */
  set: (t: Theme) => getThemeManager().setTheme(t),
  
  /**
   * Get current theme
   */
  get: () => getThemeManager().getTheme(),
  
  /**
   * Toggle theme
   */
  toggle: () => getThemeManager().toggleTheme(),
  
  /**
   * Register custom theme
   */
  register: (name: string, config: ThemeConfig) => 
    getThemeManager().registerTheme(name, config),
  
  /**
   * Listen to theme changes
   */
  onChange: (fn: (theme: Theme) => void) => 
    getThemeManager().onChange(fn)
};