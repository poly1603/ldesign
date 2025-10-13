/**
 * Utility functions for React i18n
 */

import type { I18nConfig, I18nInstance } from '../../../types';
import { OptimizedI18n } from '../../../core/i18n-optimized';

/**
 * Create i18n instance for React
 */
export function createI18n(config?: I18nConfig): I18nInstance {
  const i18n = new OptimizedI18n(config);
  
  // Initialize
  i18n.init().catch(console.error);
  
  return i18n;
}

/**
 * Define messages with type checking
 */
export function defineMessages<T extends Record<string, any>>(messages: T): T {
  return messages;
}