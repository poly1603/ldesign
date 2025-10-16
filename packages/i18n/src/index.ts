/**
 * @ldesign/i18n - Framework-agnostic i18n solution
 * A powerful, extensible internationalization library for any JavaScript framework
 * 
 * @version 2.0.0
 * @author LDesign Team
 * @license MIT
 */

// Core exports
export { OptimizedI18n, OptimizedI18n as I18n } from './core/i18n-optimized';
export { InterpolationEngine } from './core/interpolation';
export { PluralizationEngine } from './core/pluralization';
export type { PluralCategory } from './core/pluralization';
export {
  LRUCache,
  WeakCache,
  StorageCache,
  MultiTierCache,
  createCache
} from './core/cache';

// Type exports - properly structured for build tools
export type {
  // Basic types
  Locale,
  MessageKey,
  MessageValue,
  Messages,
  InterpolationParams,
  PluralRule,

  // Core interfaces
  I18nInstance,
  I18nConfig,
  I18nContext,
  I18nPlugin,
  TranslationFunction,
  TranslateOptions,
  InterpolationOptions,
  LanguagePackage,

  // Component interfaces
  MessageLoader,
  MessageStorage,
  LanguageDetector,
  Cache,
  Formatter,

  // Configuration
  CacheConfig,
  DetectionConfig,
  InterpolationConfig,

  // Events
  I18nEventType,
  I18nEventData,
  I18nEventListener,

  // Error handling
  MissingKeyHandler,
  ErrorHandler,

  // Framework
  FrameworkAdapter,

  // Utility types
  DeepPartial,
  ValueOf,
  PromiseOr
} from './types';

// Utility exports
export * from './utils/helpers';
export * from './utils/bundle-optimization';

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

// Factory function to create i18n instance
import { OptimizedI18n } from './core/i18n-optimized';
import type { I18nConfig, I18nInstance } from './types';

/**
 * Create a new optimized i18n instance
 * @param config - Configuration options
 * @returns Configured i18n instance
 */
export function createI18n(config?: I18nConfig): I18nInstance {
  const instance = new OptimizedI18n(config || {});

  // Auto-initialize if messages are provided
  if (config?.messages) {
    instance.init().catch(err => {
    });
  }

  return instance;
}

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
export function t(key: MessageKey, params?: InterpolationParams): string {
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

// Engine Plugin Integration (for compatibility)
export {
  createI18nEnginePlugin,
  createDefaultI18nEnginePlugin,
  i18nPlugin,
  type I18nEnginePluginOptions
} from './engine';

// Vue Adapter exports for convenience
import { useI18n as vueUseI18n } from './adapters/vue';
export {
  createVueI18n,
  vI18n,
  I18nT,
  useTranslation,
  usePlural,
  useNumber,
  useDate,
  useCurrency,
  useRelativeTime,
  type UseI18nComposable
} from './adapters/vue';

// Export Vue's useI18n separately to avoid naming conflict
export { vueUseI18n as useVueI18n };

// Performance utilities
export { ObjectPool, FastCacheKeyBuilder } from './core/i18n-optimized';

// Type aliases for convenience (not re-exported to avoid conflicts)

// Default export
export default OptimizedI18n;