/**
 * 插件生态导出
 */

// import type { Plugin } from 'vite'
// import type { FrameworkType } from '../types'

// 导入插件函数用于内部使用
import {
  createCodeSplittingPlugin,
  createReactCodeSplittingPlugin,
  createVueCodeSplittingPlugin,
  createSmartCodeSplittingPlugin,
} from './optimization/code-splitting'

import {
  createCompressionPlugin,
} from './optimization/compression'

import {
  createHMREnhancedPlugin,
  createReactHMREnhancedPlugin,
  createVueHMREnhancedPlugin,
} from './development/hmr-enhanced'

import {
  createBundleAnalyzerPlugin,
  createLightBundleAnalyzerPlugin,
} from './analysis/bundle-analyzer'

// 优化插件
export {
  createCompressionPlugin,
  createMultiCompressionPlugin,
  createCompressionPluginWithStats,
  defaultCompressionConfig,
} from './optimization/compression'

export {
  createCodeSplittingPlugin,
  createReactCodeSplittingPlugin,
  createVueCodeSplittingPlugin,
  createSmartCodeSplittingPlugin,
  createCodeSplittingPluginWithStats,
  defaultCodeSplittingConfig,
} from './optimization/code-splitting'

// 开发插件
export {
  createHMREnhancedPlugin,
  createReactHMREnhancedPlugin,
  createVueHMREnhancedPlugin,
  createHMREnhancedPluginWithStats,
  defaultHMREnhancedConfig,
} from './development/hmr-enhanced'

// 分析插件
export {
  createBundleAnalyzerPlugin,
  createLightBundleAnalyzerPlugin,
  defaultBundleAnalyzerConfig,
} from './analysis/bundle-analyzer'

// 插件预设
export const PluginPresets = {
  /**
   * React 开发预设
   */
  react: {
    development: [
      'createReactHMREnhancedPlugin',
    ],
    build: [
      'createReactCodeSplittingPlugin',
      'createCompressionPlugin',
    ],
    analysis: [
      'createBundleAnalyzerPlugin',
    ],
  },

  /**
   * Vue 开发预设
   */
  vue: {
    development: [
      'createVueHMREnhancedPlugin',
    ],
    build: [
      'createVueCodeSplittingPlugin',
      'createCompressionPlugin',
    ],
    analysis: [
      'createBundleAnalyzerPlugin',
    ],
  },

  /**
   * 通用预设
   */
  universal: {
    development: [
      'createHMREnhancedPlugin',
    ],
    build: [
      'createSmartCodeSplittingPlugin',
      'createMultiCompressionPlugin',
    ],
    analysis: [
      'createLightBundleAnalyzerPlugin',
    ],
  },

  /**
   * 性能优化预设
   */
  performance: {
    build: [
      'createCodeSplittingPlugin',
      'createCompressionPlugin',
    ],
    analysis: [
      'createBundleAnalyzerPlugin',
    ],
  },

  /**
   * 开发体验预设
   */
  devExperience: {
    development: [
      'createHMREnhancedPlugin',
    ],
  },
}

/**
 * 插件工厂函数
 */
export const PluginFactory = {
  /**
   * 创建优化插件集合
   */
  createOptimizationPlugins(options: {
    compression?: boolean
    codeSplitting?: boolean
    framework?: 'react' | 'vue' | 'universal'
  } = {}) {
    const { compression = true, codeSplitting = true, framework = 'universal' } = options
    const plugins: any[] = []

    if (codeSplitting) {
      switch (framework) {
        case 'react':
          plugins.push(createReactCodeSplittingPlugin())
          break
        case 'vue':
          plugins.push(createVueCodeSplittingPlugin())
          break
        default:
          plugins.push(createSmartCodeSplittingPlugin())
      }
    }

    if (compression) {
      plugins.push(createCompressionPlugin())
    }

    return plugins
  },

  /**
   * 创建开发插件集合
   */
  createDevelopmentPlugins(options: {
    hmrEnhanced?: boolean
    framework?: 'react' | 'vue' | 'universal'
  } = {}) {
    const { hmrEnhanced = true, framework = 'universal' } = options
    const plugins: any[] = []

    if (hmrEnhanced) {
      switch (framework) {
        case 'react':
          plugins.push(createReactHMREnhancedPlugin())
          break
        case 'vue':
          plugins.push(createVueHMREnhancedPlugin())
          break
        default:
          plugins.push(createHMREnhancedPlugin())
      }
    }

    return plugins
  },

  /**
   * 创建分析插件集合
   */
  createAnalysisPlugins(options: {
    bundleAnalyzer?: boolean
    lightweight?: boolean
  } = {}) {
    const { bundleAnalyzer = true, lightweight = false } = options
    const plugins: any[] = []

    if (bundleAnalyzer) {
      if (lightweight) {
        plugins.push(createLightBundleAnalyzerPlugin())
      } else {
        plugins.push(createBundleAnalyzerPlugin())
      }
    }

    return plugins
  },

  /**
   * 创建完整插件集合
   */
  createFullPluginSet(options: {
    mode?: 'development' | 'production'
    framework?: 'react' | 'vue' | 'universal'
    analysis?: boolean
  } = {}) {
    const { mode = 'development', framework = 'universal', analysis = false } = options
    const plugins: any[] = []

    if (mode === 'development') {
      plugins.push(...this.createDevelopmentPlugins({ framework }))
    } else {
      plugins.push(...this.createOptimizationPlugins({ framework }))
    }

    if (analysis) {
      plugins.push(...this.createAnalysisPlugins())
    }

    return plugins
  },
}

/**
 * 插件配置助手
 */
export const PluginConfigHelper = {
  /**
   * 创建压缩配置
   */
  createCompressionConfig(options: {
    algorithm?: 'gzip' | 'brotli' | 'deflate'
    level?: number
    threshold?: number
  } = {}) {
    return {
      enabled: true,
      apply: 'build' as const,
      options: {
        algorithm: options.algorithm || 'gzip',
        level: options.level || 6,
        threshold: options.threshold || 1024,
        filter: /\.(js|css|html|svg)$/,
        deleteOriginalAssets: false,
      },
    }
  },

  /**
   * 创建代码分割配置
   */
  createCodeSplittingConfig(options: {
    strategy?: 'vendor' | 'async' | 'manual'
    framework?: 'react' | 'vue' | 'universal'
  } = {}) {
    const { strategy = 'vendor', framework = 'universal' } = options

    let chunks = {}
    if (strategy === 'manual') {
      switch (framework) {
        case 'react':
          chunks = {
            'react-vendor': ['react', 'react-dom', 'react-router'],
            'ui-vendor': ['antd', '@ant-design', '@mui'],
          }
          break
        case 'vue':
          chunks = {
            'vue-vendor': ['vue', 'vue-router', 'vuex', 'pinia'],
            'ui-vendor': ['element-plus', 'ant-design-vue'],
          }
          break
      }
    }

    return {
      enabled: true,
      apply: 'build' as const,
      options: {
        strategy,
        minSize: 20000,
        maxSize: 244000,
        chunks,
      },
    }
  },

  /**
   * 创建 HMR 增强配置
   */
  createHMREnhancedConfig(options: {
    fastRefresh?: boolean
    preserveState?: boolean
    framework?: 'react' | 'vue' | 'universal'
  } = {}) {
    const { fastRefresh = true, preserveState = true, framework = 'universal' } = options

    let customUpdateHandlers = {}
    switch (framework) {
      case 'react':
        customUpdateHandlers = {
          '.jsx': () => console.log('React component updated'),
          '.tsx': () => console.log('React TypeScript component updated'),
        }
        break
      case 'vue':
        customUpdateHandlers = {
          '.vue': () => console.log('Vue component updated'),
        }
        break
    }

    return {
      enabled: true,
      apply: 'serve' as const,
      options: {
        fastRefresh,
        preserveState,
        errorOverlay: true,
        customUpdateHandlers,
        ignored: ['node_modules', '.git', 'dist'],
      },
    }
  },

  /**
   * 创建构建分析配置
   */
  createBundleAnalyzerConfig(options: {
    mode?: 'server' | 'static' | 'json'
    openAnalyzer?: boolean
  } = {}) {
    return {
      enabled: true,
      apply: 'build' as const,
      options: {
        mode: options.mode || 'static',
        outputDir: 'dist/analysis',
        reportFilename: 'bundle-report.html',
        openAnalyzer: options.openAnalyzer || false,
        port: 8888,
        host: 'localhost',
      },
    }
  },
}

/**
 * 快速插件创建函数
 */
export const createQuickPlugins = {
  /**
   * 为 React 项目创建插件
   */
  forReact: (mode: 'development' | 'production' = 'development') => {
    return PluginFactory.createFullPluginSet({
      mode,
      framework: 'react',
      analysis: mode === 'production',
    })
  },

  /**
   * 为 Vue 项目创建插件
   */
  forVue: (mode: 'development' | 'production' = 'development') => {
    return PluginFactory.createFullPluginSet({
      mode,
      framework: 'vue',
      analysis: mode === 'production',
    })
  },

  /**
   * 为通用项目创建插件
   */
  forUniversal: (mode: 'development' | 'production' = 'development') => {
    return PluginFactory.createFullPluginSet({
      mode,
      framework: 'universal',
      analysis: mode === 'production',
    })
  },

  /**
   * 创建最小插件集
   */
  minimal: () => {
    return [
      createHMREnhancedPlugin({ enabled: true, apply: 'serve' }),
    ]
  },

  /**
   * 创建完整插件集
   */
  full: (mode: 'development' | 'production' = 'development') => {
    const plugins = []

    if (mode === 'development') {
      plugins.push(createHMREnhancedPlugin())
    } else {
      plugins.push(
        createCodeSplittingPlugin(),
        createCompressionPlugin(),
        createBundleAnalyzerPlugin()
      )
    }

    return plugins
  },
}
