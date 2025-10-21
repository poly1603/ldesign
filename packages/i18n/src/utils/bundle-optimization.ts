/**
 * @ldesign/i18n - Bundle Size Optimization Utilities
 * Utilities for reducing bundle size and improving tree-shaking
 */

/**
 * Lazy load plugin with dynamic import
 * Reduces initial bundle size by loading plugins on demand
 */
export async function lazyLoadPlugin(pluginName: string): Promise<any> {
  // Plugins will be implemented in the future
  // For now, return a placeholder
  console.warn(`Plugin ${pluginName} is not yet implemented`);
  return Promise.resolve(null);
}

/**
 * Feature flags for conditional imports
 * Use with build-time dead code elimination
 */
export const FEATURES = {
  // Core features (always included)
  CORE: true,
  INTERPOLATION: true,
  PLURALIZATION: true,
  
  // Optional features (enabled by default in browser)
  CACHE: true,
  LAZY_LOADING: true,
  FORMATTING: true,
  PLUGINS: true,
  DETECTION: true,
  NAMESPACES: true,
  EVENTS: true,
  
  // Advanced features (can be enabled if needed)
  AB_TESTING: false,
  QUALITY_SCORING: false,
  COLLABORATIVE: false,
  OFFLINE_FIRST: false,
  PERFORMANCE_MONITOR: false,
  CONTEXT_AWARE: false,
  INTELLIGENT_PREHEATER: false,
  MEMORY_OPTIMIZER: false,
} as const;

/**
 * Conditional import helper
 * Only imports module if feature is enabled
 */
export async function conditionalImport<T>(
  feature: keyof typeof FEATURES,
  importFn: () => Promise<T>
): Promise<T | null> {
  if (FEATURES[feature]) {
    return importFn();
  }
  return null;
}

/**
 * Create minimal i18n instance for production
 * Excludes development-only features
 */
export function createMinimalI18n(config: any) {
  // Remove development-only config
  const productionConfig = {
    ...config,
    debug: false,
    warnOnMissing: false,
    devtools: false,
  };
  
  // Only include essential plugins
  if (productionConfig.plugins) {
    productionConfig.plugins = productionConfig.plugins.filter(
      (plugin: any) => !plugin.isDevelopmentOnly
    );
  }
  
  return productionConfig;
}

// Export cache features
export * from '../core/cache';
/**
 * Tree-shakeable exports
 * Each module can be imported separately to reduce bundle size
 */
export * from '../core/interpolation';

export * from '../core/pluralization';

// Export formatter features  
// export * from '../core/formatter'; // TODO: Add when formatter module is created

/**
 * Webpack/Rollup magic comments for code splitting
 * Use these when importing heavy modules
 */
export const CHUNK_NAMES = {
  PLUGINS: /* webpackChunkName: "i18n-plugins" */ 'plugins',
  FORMATTERS: /* webpackChunkName: "i18n-formatters" */ 'formatters',
  VUE_INTEGRATION: /* webpackChunkName: "i18n-vue" */ 'vue',
  LOCALES: /* webpackChunkName: "i18n-locales" */ 'locales',
  ADVANCED: /* webpackChunkName: "i18n-advanced" */ 'advanced',
} as const;

/**
 * Preload hints for critical resources
 */
export function generatePreloadHints(locales: string[]): string[] {
  const hints: string[] = [];
  
  // Add critical locale files
  locales.forEach(locale => {
    hints.push(`/locales/${locale}.json`);
  });
  
  // Add core bundles
  hints.push('/i18n-core.js');
  
  return hints;
}

/**
 * Module federation config for micro-frontends
 */
export const MODULE_FEDERATION_CONFIG = {
  name: '@ldesign/i18n',
  exposes: {
    './I18n': './src/core/i18n',
    './Vue': './src/adapters/vue',
    './Utils': './src/utils/helpers',
  },
  shared: {
    vue: { singleton: true, requiredVersion: '^3.0.0' },
  },
};

/**
 * ESM-only exports for modern bundlers
 * Reduces polyfill overhead
 */
export const ESM_ONLY = {
  // Use native dynamic imports
  dynamicImport: (path: string) => import(/* @vite-ignore */ path),
  
  // Use native async/await
  asyncLoader: async (locale: string) => {
    // Dynamic import path - this is for documentation purposes
    // In actual usage, provide the full path from the consuming application
    // const module = await import(/* @vite-ignore */ `../locales/${locale}.js`);
    // return module.default;
    throw new Error('asyncLoader should be implemented by the consuming application with proper paths');
  },
  
  // Use native Proxy for reactive bindings
  createReactive: <T extends object>(target: T): T => {
    return new Proxy(target, {
      set(obj, prop, value) {
        Reflect.set(obj, prop, value);
        // Trigger updates
        return true;
      },
    });
  },
};

/**
 * Build-time constants for dead code elimination
 */
export const BUILD_FLAGS = {
  IS_PRODUCTION: typeof window !== 'undefined' && !(window as any).__DEV__,
  IS_DEVELOPMENT: typeof window !== 'undefined' && (window as any).__DEV__ === true,
  IS_TEST: false,
  VERSION: '2.0.0',
  BUILD_DATE: new Date().toISOString(),
} as const;

/**
 * SideEffects-free pure functions
 * Mark these as pure for better tree-shaking
 */
/*#__PURE__*/ export function pureFormatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/*#__PURE__*/ export function pureFormatDate(value: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale).format(value);
}

/*#__PURE__*/ export function pureCapitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Rollup plugin configuration for optimal bundling
 */
export const ROLLUP_OPTIMIZATION = {
  // External dependencies to exclude from bundle
  external: [
    'vue',
    'react',
    'angular',
    '@vue/reactivity',
    '@vue/runtime-core',
  ],
  
  // Modules to mark as side-effect free
  sideEffectsFreeModules: [
    './utils/helpers',
    './core/interpolation',
    './core/pluralization',
  ],
  
  // Output configuration for different formats
  output: {
    esm: {
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    cjs: {
      format: 'cjs',
      exports: 'named',
    },
    umd: {
      format: 'umd',
      name: 'LDesignI18n',
      globals: {
        vue: 'Vue',
      },
    },
  },
};

/**
 * Vite plugin configuration for optimal HMR and bundling
 */
export const VITE_OPTIMIZATION = {
  // Dependencies to pre-bundle
  optimizeDeps: {
    include: ['@ldesign/shared'],
    exclude: ['@ldesign/i18n/plugins/*'],
  },
  
  // Build configuration
  build: {
    rollupOptions: {
      output: {
        // Manual chunks for code splitting
        manualChunks: {
          'i18n-core': ['./src/core/i18n', './src/core/interpolation', './src/core/pluralization'],
          'i18n-vue': ['./src/adapters/vue'],
          'i18n-plugins': ['./src/plugins/index'],
        },
      },
    },
    
    // Library mode configuration
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format: any) => `i18n.${format}.js`,
    },
  },
};

/**
 * Export size analyzer
 * Helps identify large exports for optimization
 */
export function analyzeExportSizes(): Map<string, number> {
  const sizes = new Map<string, number>();
  
  // This would be populated by build tools
  // Example structure:
  sizes.set('I18n', 15000); // 15KB
  sizes.set('InterpolationEngine', 3000); // 3KB
  sizes.set('PluralizationEngine', 2000); // 2KB
  sizes.set('Cache', 4000); // 4KB
  sizes.set('Plugins', 50000); // 50KB total
  
  return sizes;
}

/**
 * Recommendations for bundle size reduction
 */
export function getBundleSizeRecommendations(currentSize: number): string[] {
  const recommendations: string[] = [];
  
  if (currentSize > 100000) { // > 100KB
    recommendations.push('Consider lazy loading plugins');
    recommendations.push('Use dynamic imports for locales');
    recommendations.push('Enable tree-shaking in your bundler');
  }
  
  if (currentSize > 50000) { // > 50KB
    recommendations.push('Remove unused features via feature flags');
    recommendations.push('Use production builds in production');
    recommendations.push('Consider code splitting for Vue components');
  }
  
  if (currentSize > 25000) { // > 25KB
    recommendations.push('Minimize the number of locales bundled');
    recommendations.push('Use CDN for locale data');
  }
  
  return recommendations;
}