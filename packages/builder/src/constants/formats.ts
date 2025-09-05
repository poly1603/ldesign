/**
 * 输出格式相关常量
 */

import type { OutputFormat } from '../types/output'

/**
 * 支持的输出格式
 */
export const OUTPUT_FORMATS: OutputFormat[] = ['esm', 'cjs', 'umd', 'iife']

/**
 * 格式别名映射
 */
export const FORMAT_ALIASES: Record<string, OutputFormat> = {
  'es': 'esm',
  'es6': 'esm',
  'module': 'esm',
  'commonjs': 'cjs',
  'common': 'cjs',
  'universal': 'umd',
  'browser': 'iife',
  'global': 'iife'
}

/**
 * 格式描述
 */
export const FORMAT_DESCRIPTIONS: Record<OutputFormat, string> = {
  esm: 'ES Module - 现代 JavaScript 模块格式，支持 Tree Shaking',
  cjs: 'CommonJS - Node.js 默认模块格式',
  umd: 'Universal Module Definition - 通用模块格式，支持多种环境',
  iife: 'Immediately Invoked Function Expression - 立即执行函数，适用于浏览器',
  css: 'Cascading Style Sheets - 样式表格式'
}

/**
 * 格式文件扩展名
 */
export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  esm: '.js',
  cjs: '.cjs',
  umd: '.umd.js',
  iife: '.iife.js',
  css: '.css'
}

/**
 * 格式默认文件名模式
 */
export const FORMAT_FILE_PATTERNS: Record<OutputFormat, string> = {
  esm: '[name].js',
  cjs: '[name].cjs',
  umd: '[name].umd.js',
  iife: '[name].iife.js',
  css: '[name].css'
}

/**
 * 格式兼容性
 */
export const FORMAT_COMPATIBILITY: Record<OutputFormat, {
  browser: boolean
  node: boolean
  requiresGlobals: boolean
  supportsTreeShaking: boolean
  supportsCodeSplitting: boolean
}> = {
  esm: {
    browser: true,
    node: true,
    requiresGlobals: false,
    supportsTreeShaking: true,
    supportsCodeSplitting: true
  },
  cjs: {
    browser: false,
    node: true,
    requiresGlobals: false,
    supportsTreeShaking: false,
    supportsCodeSplitting: false
  },
  umd: {
    browser: true,
    node: true,
    requiresGlobals: true,
    supportsTreeShaking: false,
    supportsCodeSplitting: false
  },
  iife: {
    browser: true,
    node: false,
    requiresGlobals: true,
    supportsTreeShaking: false,
    supportsCodeSplitting: false
  },
  css: {
    browser: true,
    node: false,
    requiresGlobals: false,
    supportsTreeShaking: false,
    supportsCodeSplitting: false
  }
}

/**
 * 格式推荐用途
 */
export const FORMAT_USE_CASES: Record<OutputFormat, string[]> = {
  esm: [
    '现代 JavaScript 库',
    '支持 Tree Shaking 的库',
    'Node.js 模块',
    '浏览器原生模块'
  ],
  cjs: [
    'Node.js 库',
    '传统 npm 包',
    '服务端应用',
    '构建工具插件'
  ],
  umd: [
    '通用库',
    '需要多环境支持的库',
    'CDN 分发的库',
    '向后兼容的库'
  ],
  iife: [
    '浏览器脚本',
    '内联脚本',
    '不支持模块的环境',
    '简单的工具脚本'
  ],
  css: [
    '样式库',
    '主题包',
    '组件样式',
    'CSS 框架'
  ]
}

/**
 * 格式优先级（用于自动选择）
 */
export const FORMAT_PRIORITY: Record<OutputFormat, number> = {
  esm: 4, // 最高优先级
  cjs: 3,
  umd: 2,
  iife: 1,
  css: 5 // CSS 样式库的最高优先级
}

/**
 * 格式组合建议
 */
export const FORMAT_COMBINATIONS = {
  // 现代库推荐组合
  modern: ['esm', 'cjs'] as OutputFormat[],

  // 通用库推荐组合
  universal: ['esm', 'cjs', 'umd'] as OutputFormat[],

  // 浏览器库推荐组合
  browser: ['esm', 'umd', 'iife'] as OutputFormat[],

  // Node.js 库推荐组合
  node: ['esm', 'cjs'] as OutputFormat[],

  // 最小组合
  minimal: ['esm'] as OutputFormat[],

  // 完整组合
  complete: ['esm', 'cjs', 'umd', 'iife'] as OutputFormat[]
}

/**
 * 根据库类型推荐的格式
 */
export const LIBRARY_TYPE_FORMATS = {
  typescript: ['esm', 'cjs'],
  style: ['esm'],
  vue2: ['esm', 'cjs', 'umd'],
  vue3: ['esm', 'cjs', 'umd'],
  mixed: ['esm', 'cjs']
} as const

/**
 * 格式特定的配置选项
 */
export const FORMAT_SPECIFIC_OPTIONS = {
  esm: {
    // ES Module 特定选项
    exports: 'named',
    interop: 'auto',
    strict: true
  },
  cjs: {
    // CommonJS 特定选项
    exports: 'auto',
    interop: 'auto',
    strict: false
  },
  umd: {
    // UMD 特定选项
    exports: 'auto',
    interop: 'auto',
    strict: false,
    // 需要全局变量名
    requiresName: true
  },
  iife: {
    // IIFE 特定选项
    exports: 'none',
    interop: false,
    strict: false,
    // 需要全局变量名
    requiresName: true
  }
} as const

/**
 * 格式验证规则
 */
export const FORMAT_VALIDATION_RULES = {
  esm: {
    // ES Module 验证规则
    allowedExports: ['named', 'default'],
    requiresModernNode: true,
    supportsTopLevelAwait: true
  },
  cjs: {
    // CommonJS 验证规则
    allowedExports: ['auto', 'default', 'named'],
    requiresModernNode: false,
    supportsTopLevelAwait: false
  },
  umd: {
    // UMD 验证规则
    allowedExports: ['auto', 'default'],
    requiresGlobalName: true,
    requiresGlobalsMapping: true
  },
  iife: {
    // IIFE 验证规则
    allowedExports: ['none'],
    requiresGlobalName: true,
    requiresGlobalsMapping: true
  }
} as const

/**
 * 格式性能特征
 */
export const FORMAT_PERFORMANCE = {
  esm: {
    bundleSize: 'small',
    loadTime: 'fast',
    treeShaking: 'excellent',
    caching: 'excellent'
  },
  cjs: {
    bundleSize: 'medium',
    loadTime: 'medium',
    treeShaking: 'none',
    caching: 'good'
  },
  umd: {
    bundleSize: 'large',
    loadTime: 'slow',
    treeShaking: 'none',
    caching: 'fair'
  },
  iife: {
    bundleSize: 'large',
    loadTime: 'slow',
    treeShaking: 'none',
    caching: 'poor'
  }
} as const
