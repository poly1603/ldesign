/**
 * @ldesign/size - A powerful size management system for web applications
 */

// Accessibility exports
export {
  a11y,
  AccessibilityEnhancer,
  type ColorBlindnessType,
  type ComplianceReport,
  type ContrastRatio,
  getAccessibilityEnhancer,
  type WCAGLevel
} from './core/AccessibilityEnhancer'

// AI Optimizer exports - 懒加载
export type { 
  AIOptimizerConfig,
  OptimizationSuggestion,
  PageContext,
  ReadabilityOptions
} from './core/AIOptimizer'

// 懒加载 AI 模块（通常较大）
export const ai = new Proxy({} as Record<string, (...args: unknown[]) => Promise<unknown>>, {
  get(_, prop: string) {
    return async (...args: unknown[]) => {
      const module = await import('./core/AIOptimizer');
      return (module.ai as Record<string, (...args: unknown[]) => unknown>)[prop](...args);
    };
  }
});

export const getAIOptimizer = async () => {
  const module = await import('./core/AIOptimizer');
  return module.getAIOptimizer();
};

export const AIOptimizer = new Proxy(class {} as new (...args: unknown[]) => unknown, {
  construct: async (_, args: unknown[]) => {
    const module = await import('./core/AIOptimizer');
    return new (module.AIOptimizer as new (...args: unknown[]) => unknown)(...args);
  }
})

// Animation exports
export { 
  animate,
  AnimationManager,
  type AnimationOptions,
  getAnimationManager
} from './core/AnimationManager'

// CSS Generator exports
export {
  generateCSS,
  generateCSSString,
  generateCSSVariables,
  injectCSS,
  removeCSS
} from './core/cssGenerator'

// Device Detection exports
export {
  DEFAULT_BREAKPOINTS,
  device,
  DeviceDetector,
  getDeviceDetector
} from './core/DeviceDetector'

// Fluid Size exports
export {
  fluid,
  FluidSizeCalculator,
  fluidTypographyPresets,
  getFluidSizeCalculator,
  modularScaleRatios
} from './core/FluidSize'

// Size class exports
export {
  em,
  percent,
  px,
  rem,
  Size,
  size,
  vh,
  vw
} from './core/Size'

// Size Analyzer exports - 懒加载（调试工具通常不需要立即加载）
export type {
  PerformanceMetrics,
  SizeSpecDoc,
  SizeUsageReport,
  ValidationReport
} from './core/SizeAnalyzer'

// 懒加载分析器模块
export const analyze = new Proxy({} as Record<string, (...args: unknown[]) => Promise<unknown>>, {
  get(_, prop: string) {
    return async (...args: unknown[]) => {
      const module = await import('./core/SizeAnalyzer');
      return (module.analyze as Record<string, (...args: unknown[]) => unknown>)[prop](...args);
    };
  }
});

export const getSizeAnalyzer = async () => {
  const module = await import('./core/SizeAnalyzer');
  return module.getSizeAnalyzer();
};

export const SizeAnalyzer = new Proxy(class {} as new (...args: unknown[]) => unknown, {
  construct: async (_, args: unknown[]) => {
    const module = await import('./core/SizeAnalyzer');
    return new (module.SizeAnalyzer as new (...args: unknown[]) => unknown)(...args);
  }
})

// Core exports
export { 
  type SizeChangeListener, 
  type SizeConfig, 
  SizeManager, 
  sizeManager, 
  type SizePreset 
} from './core/SizeManager'
// Migration Tool exports - 懒加载（迁移工具通常只在迁移时使用）
export type {
  Framework,
  MigrationConfig,
  MigrationReport
} from './core/SizeMigration'

// 懒加载迁移工具
export const createMigrationGuide = async (...args: unknown[]) => {
  const module = await import('./core/SizeMigration');
  return (module.createMigrationGuide as (...args: unknown[]) => unknown)(...args);
};

export const detectFramework = async (...args: unknown[]) => {
  const module = await import('./core/SizeMigration');
  return (module.detectFramework as (...args: unknown[]) => unknown)(...args);
};

export const migrateFrom = async (...args: unknown[]) => {
  const module = await import('./core/SizeMigration');
  return (module.migrateFrom as (...args: unknown[]) => unknown)(...args);
};

export const SizeMigration = new Proxy(class {} as new (...args: unknown[]) => unknown, {
  construct: async (_, args: unknown[]) => {
    const module = await import('./core/SizeMigration');
    return new (module.SizeMigration as new (...args: unknown[]) => unknown)(...args);
  }
})

// Theme exports
export {
  getThemeManager,
  theme,
  type Theme,
  type ThemeConfig,
  ThemeManager,
  type ThemeManagerOptions
} from './core/ThemeManager'
// Unit Strategy exports
export {
  getUnitStrategyManager,
  units,
  UnitStrategyManager
} from './core/UnitStrategy'

// Locale exports
export { 
  deDE, 
  enUS, 
  esES, 
  frFR, 
  getLocale, 
  itIT, 
  jaJP, 
  koKR, 
  locales, 
  ptBR, 
  ruRU,
  zhCN
} from './locales'

export type { LocaleKey, SizeLocale } from './locales'

// Plugin exports
export { createSizePlugin, SizePluginSymbol } from './plugin'

export type { SizePlugin, SizePluginOptions } from './plugin'

// Engine plugin integration
export { createSizeEnginePlugin, useSizeFromEngine } from './plugin/engine'
export type { SizeEnginePluginOptions } from './plugin/engine'

// Utility exports
export {
  batchProcessSizes,
  memoize,
  optimizeCSSVariables,
  requestIdleCallback
} from './utils'

// Version
export const version = '2.0.0'
