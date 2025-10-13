/**
 * @ldesign/i18n - Framework-agnostic i18n solution
 * A powerful, extensible internationalization library for any JavaScript framework
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

// Core exports
export { I18n } from './core/i18n';
export { InterpolationEngine } from './core/interpolation';
export { PluralizationEngine } from './core/pluralization';
// export type { PluralCategory } from './core/pluralization'; // Type export not supported by build tool
export { 
  LRUCache,
  WeakCache,
  StorageCache,
  MultiTierCache,
  createCache
} from './core/cache';

// Type exports - commented out due to build tool limitations
// export type {
//   // Basic types
//   Locale,
//   MessageKey,
//   MessageValue,
//   Messages,
//   InterpolationParams,
//   PluralRule,
//   
//   // Core interfaces
//   I18nInstance,
//   I18nConfig,
//   I18nContext,
//   I18nPlugin,
//   TranslationFunction,
//   TranslateOptions,
//   InterpolationOptions,
//   LanguagePackage,
//   
//   // Component interfaces
//   MessageLoader,
//   MessageStorage,
//   LanguageDetector,
//   Cache,
//   Formatter,
//   
//   // Configuration
//   CacheConfig,
//   DetectionConfig,
//   InterpolationConfig,
//   
//   // Events
//   I18nEventType,
//   I18nEventData,
//   I18nEventListener,
//   
//   // Error handling
//   MissingKeyHandler,
//   ErrorHandler,
//   
//   // Framework
//   FrameworkAdapter,
//   
//   // Utility types
//   DeepPartial,
//   ValueOf,
//   PromiseOr
// } from './types';

// Utility exports
export * from './utils/helpers';

// Factory function to create i18n instance
import { I18n } from './core/i18n';

/**
 * Create a new i18n instance
 */
export function createI18n(config) {
  const instance = new I18n(config);
  
  // Auto-initialize if messages are provided
  if (config?.messages) {
    instance.init().catch(err => {
      console.error('Failed to initialize i18n:', err);
    });
  }
  
  return instance;
}

/**
 * Global i18n instance for convenience
 */
let globalI18n = null;

/**
 * Get or create global i18n instance
 */
export function useI18n(config) {
  if (!globalI18n) {
    globalI18n = createI18n(config);
  }
  return globalI18n;
}

/**
 * Set global i18n instance
 */
export function setGlobalI18n(instance) {
  globalI18n = instance;
}

/**
 * Get global i18n instance (throws if not set)
 */
export function getGlobalI18n() {
  if (!globalI18n) {
    throw new Error('Global i18n instance not initialized. Call useI18n() or setGlobalI18n() first.');
  }
  return globalI18n;
}

/**
 * Clear global i18n instance
 */
export function clearGlobalI18n() {
  if (globalI18n) {
    globalI18n.destroy();
    globalI18n = null;
  }
}

/**
 * Quick translation function using global instance
 */
export function t(key, params) {
  return useI18n().t(key, params);
}

/**
 * Version and build info
 */
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Default export
export default I18n;