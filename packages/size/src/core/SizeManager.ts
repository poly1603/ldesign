/**
 * @ldesign/size - Size Manager
 * 
 * Manages size schemes, persistence, and CSS injection
 */

import type {
  SizeScheme,
  PresetScheme,
  SizeManagerOptions,
  SizeManagerState,
  SizeChangeEvent,
  DeepPartial
} from '../types';
import { getPresetScheme, comfortableScheme } from './presets';
import { generateCSS, injectCSS, removeCSS, generateCSSVariables } from './cssGenerator';
import { deepMerge } from '../utils';

const DEFAULT_STORAGE_KEY = 'ldesign-size-scheme';
const DEFAULT_PREFIX = 'size';

export class SizeManager {
  private options: Required<SizeManagerOptions>;
  private state: SizeManagerState;
  private listeners: Set<(event: SizeChangeEvent) => void> = new Set();
  private styleId: string;

  constructor(options: SizeManagerOptions = {}) {
    this.options = {
      scheme: options.scheme || 'comfortable',
      prefix: options.prefix || DEFAULT_PREFIX,
      rootFontSize: options.rootFontSize || 16,
      autoInject: options.autoInject !== false,
      storageKey: options.storageKey || DEFAULT_STORAGE_KEY,
      responsive: options.responsive || false,
      customSchemes: options.customSchemes || {}
    };

    this.styleId = `ldesign-size-${this.options.prefix}`;
    
    // Initialize state
    const initialScheme = this.resolveScheme(this.options.scheme);
    this.state = {
      currentScheme: typeof this.options.scheme === 'string' ? this.options.scheme : 'custom',
      scheme: initialScheme,
      cssVariables: {},
      isDirty: false
    };

    // Restore from storage if available
    if (this.options.storageKey) {
      this.restore();
    }

    // Auto-inject CSS if enabled
    if (this.options.autoInject) {
      this.apply();
    }
  }

  /**
   * Get current scheme
   */
  getCurrentScheme(): SizeScheme {
    return this.state.scheme;
  }

  /**
   * Get current scheme name
   */
  getCurrentSchemeName(): string {
    return this.state.currentScheme;
  }

  /**
   * Set a new size scheme
   */
  setScheme(schemeOrName: PresetScheme | SizeScheme | string): void {
    const previousScheme = this.state.currentScheme;
    const newScheme = this.resolveScheme(schemeOrName);
    const newSchemeName = typeof schemeOrName === 'string' ? schemeOrName : 'custom';

    this.state.scheme = newScheme;
    this.state.currentScheme = newSchemeName;
    this.state.isDirty = true;

    // Apply changes
    if (this.options.autoInject) {
      this.apply();
    }

    // Save to storage
    this.save();

    // Notify listeners
    this.notifyListeners({
      previousScheme,
      currentScheme: newSchemeName,
      timestamp: Date.now(),
      source: 'api'
    });
  }

  /**
   * Apply a preset scheme
   */
  applyPreset(preset: PresetScheme): void {
    this.setScheme(preset);
  }

  /**
   * Merge partial scheme with current
   */
  mergeScheme(partial: DeepPartial<SizeScheme>): void {
    const merged = deepMerge(this.state.scheme, partial);
    this.state.scheme = merged;
    this.state.isDirty = true;

    if (this.options.autoInject) {
      this.apply();
    }

    this.save();
  }

  /**
   * Apply current scheme to DOM
   */
  apply(): void {
    const css = generateCSS(this.state.scheme, {
      prefix: this.options.prefix,
      selector: ':root',
      important: false
    });

    // Update CSS variables in state
    this.state.cssVariables = generateCSSVariables(this.state.scheme, {
      prefix: this.options.prefix
    });

    // Inject CSS
    injectCSS(css.full, this.styleId);
    
    this.state.isDirty = false;
  }

  /**
   * Remove injected CSS
   */
  remove(): void {
    removeCSS(this.styleId);
  }

  /**
   * Get CSS variables
   */
  getCSSVariables(): Record<string, string> {
    if (Object.keys(this.state.cssVariables).length === 0) {
      this.state.cssVariables = generateCSSVariables(this.state.scheme, {
        prefix: this.options.prefix
      });
    }
    return this.state.cssVariables;
  }

  /**
   * Get a specific CSS variable value
   */
  getCSSVariable(name: string): string | undefined {
    const vars = this.getCSSVariables();
    const varName = name.startsWith('--') ? name : `--${this.options.prefix}-${name}`;
    return vars[varName];
  }

  /**
   * Save current scheme to storage
   */
  save(): void {
    if (!this.options.storageKey || typeof window === 'undefined') return;

    try {
      const data = {
        scheme: this.state.currentScheme,
        custom: this.state.currentScheme === 'custom' ? this.state.scheme : null,
        timestamp: Date.now()
      };
      localStorage.setItem(this.options.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save size scheme:', error);
    }
  }

  /**
   * Restore scheme from storage
   */
  restore(): boolean {
    if (!this.options.storageKey || typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (!stored) return false;

      const data = JSON.parse(stored);
      
      if (data.scheme === 'custom' && data.custom) {
        this.setScheme(data.custom);
      } else if (data.scheme) {
        this.setScheme(data.scheme);
      }

      return true;
    } catch (error) {
      console.error('Failed to restore size scheme:', error);
      return false;
    }
  }

  /**
   * Clear stored scheme
   */
  clear(): void {
    if (!this.options.storageKey || typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.options.storageKey);
    } catch (error) {
      console.error('Failed to clear size scheme:', error);
    }
  }

  /**
   * Subscribe to scheme changes
   */
  onChange(listener: (event: SizeChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Reset to default scheme
   */
  reset(): void {
    this.setScheme('comfortable');
  }

  /**
   * Resolve scheme from input
   */
  private resolveScheme(schemeOrName: PresetScheme | SizeScheme | string): SizeScheme {
    if (typeof schemeOrName === 'string') {
      // Check custom schemes first
      if (this.options.customSchemes[schemeOrName]) {
        return this.options.customSchemes[schemeOrName];
      }
      // Then check presets
      return getPresetScheme(schemeOrName as PresetScheme);
    }
    return schemeOrName;
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(event: SizeChangeEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.remove();
    this.listeners.clear();
  }
}

// Create default instance
export const defaultSizeManager = new SizeManager();

/**
 * Quick access methods
 */
export function setScheme(scheme: PresetScheme | SizeScheme | string): void {
  defaultSizeManager.setScheme(scheme);
}

export function applyPreset(preset: PresetScheme): void {
  defaultSizeManager.applyPreset(preset);
}

export function getCurrentScheme(): SizeScheme {
  return defaultSizeManager.getCurrentScheme();
}

export function getCSSVariable(name: string): string | undefined {
  return defaultSizeManager.getCSSVariable(name);
}

export function restoreScheme(): boolean {
  return defaultSizeManager.restore();
}

export function resetScheme(): void {
  defaultSizeManager.reset();
}