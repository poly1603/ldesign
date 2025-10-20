/**
 * Core module exports
 */

import type { I18nConfig, I18nInstance } from '../types';
import { OptimizedI18n } from './i18n-optimized';

// Commonly used features
export * from './advanced-formatter';

export * from './cache';
// Main i18n class
export * from './i18n-optimized';
// Core engines
export * from './interpolation';

export * from './lazy-loader';
export * from './pluralization';

/**
 * Create a new optimized i18n instance
 * @param config - Configuration options
 * @returns Configured i18n instance
 */
export function createI18n(config?: I18nConfig): I18nInstance {
  const instance = new OptimizedI18n(config || {});

  // Auto-initialize if messages are provided
  if (config?.messages) {
    instance.init().catch((err: Error) => {
      console.error('Failed to initialize i18n:', err);
    });
  }

  return instance;
}

// Advanced features - Import separately when needed:
// import { PerformanceMonitor } from '@ldesign/i18n/es/core/performance-monitor'
// import { MemoryOptimizer } from '@ldesign/i18n/es/core/memory-optimizer'
// import { OfflineFirstPlugin } from '@ldesign/i18n/es/core/offline-first'
// import { ContextAwareTranslator } from '@ldesign/i18n/es/core/context-aware'
// import { TranslationQualityScorer } from '@ldesign/i18n/es/core/quality-scorer'
// import { ABTestingManager } from '@ldesign/i18n/es/core/ab-testing'
// import { IntelligentPreheater } from '@ldesign/i18n/es/core/intelligent-preheater'
// import { CollaborativeEditor } from '@ldesign/i18n/es/core/collaborative-editor'
