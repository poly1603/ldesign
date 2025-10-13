/**
 * Utility functions for Vue i18n
 */

import type { I18nConfig, I18nInstance } from '../../../types';
import { OptimizedI18n } from '../../../core/i18n-optimized';

/**
 * Create i18n instance for Vue
 */
export function createI18n(config?: I18nConfig): I18nInstance {
  const i18n = new OptimizedI18n(config);
  
  // Initialize
  i18n.init().catch(console.error);
  
  return i18n;
}

/**
 * Define i18n config with type checking
 */
export function defineI18nConfig<T extends I18nConfig>(config: T): T {
  return config;
}

/**
 * Load locale messages dynamically
 */
export async function loadLocaleMessages(
  locale: string,
  loader: () => Promise<any>
): Promise<Record<string, any>> {
  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error);
    return {};
  }
}