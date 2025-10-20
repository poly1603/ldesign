/**
 * @ldesign/i18n - Framework-agnostic i18n solution
 * A powerful, extensible internationalization library for any JavaScript framework
 * 
 * @version 2.0.0
 * @author LDesign Team
 * @license MIT
 */

import type { I18nConfig, I18nInstance } from './types';
// Vue Adapter exports for convenience
import { useI18n as vueUseI18n } from './adapters/vue';

// Core exports
// Factory function to create i18n instance
import { createI18n, OptimizedI18n } from './core';

export {
  createVueI18n,
  I18nT,
  useCurrency,
  useDate,
  type UseI18nComposable,
  useNumber,
  usePlural,
  useRelativeTime,
  useTranslation,
  vI18n
} from './adapters/vue';
export {
  createCache,
  LRUCache,
  MultiTierCache,
  StorageCache,
  WeakCache
} from './core/cache';
export { OptimizedI18n as I18n, OptimizedI18n } from './core/i18n-optimized';
// Performance utilities
export { FastCacheKeyBuilder, ObjectPool } from './core/i18n-optimized';
export { InterpolationEngine } from './core/interpolation';

export { PluralizationEngine } from './core/pluralization';

export type { PluralCategory } from './core/pluralization';
// Engine Plugin Integration (for compatibility)
export {
  createDefaultI18nEnginePlugin,
  createI18nEnginePlugin,
  type I18nEnginePluginOptions,
  i18nPlugin
} from './engine';

// Advanced features (lazy-loadable)
export const LazyFeatures = {
  async loadOfflineFirst() {
    const module = await import('./core/offline-first');
    return module;
  },

  async loadPerformanceMonitor() {
    const module = await import('./core/performance-monitor');
    return module;
  },

  async loadContextAware() {
    const module = await import('./core/context-aware');
    return module;
  },

  async loadAdvancedFormatter() {
    const module = await import('./core/advanced-formatter');
    return module;
  },
};

// Plugin loader for lazy loading
export const PluginLoader = {
  async load(pluginName: string) {
    const { lazyLoadPlugin } = await import('./utils/bundle-optimization');
    return lazyLoadPlugin(pluginName);
  },
};

// Re-export createI18n from core
export { createI18n };

/**
 * Global i18n instance for convenience
 */
let globalI18n: I18nInstance | null = null;

/**
 * Get or create global i18n instance
 */
export function useI18n(config?: I18nConfig): I18nInstance {
  if (!globalI18n) {
    globalI18n = createI18n(config);
  }
  return globalI18n;
}

/**
 * Set global i18n instance
 */
export function setGlobalI18n(instance: I18nInstance): void {
  globalI18n = instance;
}

/**
 * Get global i18n instance (throws if not set)
 */
export function getGlobalI18n(): I18nInstance {
  if (!globalI18n) {
    throw new Error('Global i18n instance not initialized. Call useI18n() or setGlobalI18n() first.');
  }
  return globalI18n;
}

/**
 * Clear global i18n instance
 */
export function clearGlobalI18n(): void {
  if (globalI18n) {
    globalI18n.destroy();
    globalI18n = null;
  }
}

/**
 * Quick translation function using global instance
 */
export function t(key: string, params?: Record<string, any>): string {
  return useI18n().t(key, params);
}

/**
 * Version and build info
 */
export const VERSION = '2.0.0';
export const BUILD_DATE = new Date().toISOString();

// Framework-specific adapters (lazy-loadable)
export const Adapters = {
  async vue() {
    const module = await import('./adapters/vue');
    return module;
  },

  // Future framework support
  async react() {
    throw new Error('React adapter not yet implemented');
  },

  async angular() {
    throw new Error('Angular adapter not yet implemented');
  },

  async svelte() {
    throw new Error('Svelte adapter not yet implemented');
  },
};

// New optimized plugin
export {
  createI18nPlugin,
  type I18nPluginOptions,
  useI18n as useI18nPlugin
} from './plugin';

// Type exports - properly structured for build tools
export type {
  Cache,
  // Configuration
  CacheConfig,
  // Utility types
  DeepPartial,
  DetectionConfig,
  ErrorHandler,
  Formatter,

  // Framework
  FrameworkAdapter,
  I18nConfig,
  I18nContext,
  I18nEventData,
  I18nEventListener,
  // Events
  I18nEventType,
  // Core interfaces
  I18nInstance,
  I18nPlugin,

  InterpolationConfig,
  InterpolationOptions,
  InterpolationParams,
  LanguageDetector,
  LanguagePackage,

  // Basic types
  Locale,
  MessageKey,
  // Component interfaces
  MessageLoader,

  Messages,
  MessageStorage,
  MessageValue,

  // Error handling
  MissingKeyHandler,
  PluralRule,

  PromiseOr,

  TranslateOptions,
  TranslationFunction,
  ValueOf
} from './types';
export * from './utils/bundle-optimization';

// Export Vue's useI18n separately to avoid naming conflict
export { vueUseI18n as useVueI18n };

// Utility exports
export * from './utils/helpers';

// Type aliases for convenience (not re-exported to avoid conflicts)

// Default export
export default OptimizedI18n;