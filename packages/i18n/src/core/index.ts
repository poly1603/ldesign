/**
 * Core module exports
 */

// Main i18n class
export * from './i18n-optimized'

// Core engines
export * from './interpolation'
export * from './pluralization'
export * from './cache'

// Commonly used features
export * from './advanced-formatter'
export * from './lazy-loader'

// Advanced features - Import separately when needed:
// import { PerformanceMonitor } from '@ldesign/i18n/es/core/performance-monitor'
// import { MemoryOptimizer } from '@ldesign/i18n/es/core/memory-optimizer'
// import { OfflineFirstPlugin } from '@ldesign/i18n/es/core/offline-first'
// import { ContextAwareTranslator } from '@ldesign/i18n/es/core/context-aware'
// import { TranslationQualityScorer } from '@ldesign/i18n/es/core/quality-scorer'
// import { ABTestingManager } from '@ldesign/i18n/es/core/ab-testing'
// import { IntelligentPreheater } from '@ldesign/i18n/es/core/intelligent-preheater'
// import { CollaborativeEditor } from '@ldesign/i18n/es/core/collaborative-editor'
