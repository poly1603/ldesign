/**
 * 打包器相关常量
 */

import type { BundlerType } from '../types/bundler'
import { BundlerFeature } from '../types/bundler'

/**
 * 支持的打包器列表
 */
export const SUPPORTED_BUNDLERS: BundlerType[] = ['rollup', 'rolldown']

/**
 * 默认打包器
 */
export const DEFAULT_BUNDLER: BundlerType = 'rollup'

/**
 * 打包器信息
 */
export const BUNDLER_INFO = {
  rollup: {
    name: 'Rollup',
    description: '成熟稳定的 JavaScript 模块打包器，专注于 ES 模块',
    homepage: 'https://rollupjs.org',
    repository: 'https://github.com/rollup/rollup',
    minNodeVersion: '14.18.0',
    stableVersion: '^4.0.0',
    features: [
      BundlerFeature.TREE_SHAKING,
      BundlerFeature.CODE_SPLITTING,
      BundlerFeature.DYNAMIC_IMPORT,
      BundlerFeature.SOURCEMAP,
      BundlerFeature.PLUGIN_SYSTEM,
      BundlerFeature.CONFIG_FILE,
      BundlerFeature.CACHE_SUPPORT
    ]
  },
  
  rolldown: {
    name: 'Rolldown',
    description: '基于 Rust 的高性能 JavaScript 打包器，兼容 Rollup API',
    homepage: 'https://rolldown.rs',
    repository: 'https://github.com/rolldown/rolldown',
    minNodeVersion: '16.0.0',
    stableVersion: '^0.1.0',
    features: [
      BundlerFeature.TREE_SHAKING,
      BundlerFeature.CODE_SPLITTING,
      BundlerFeature.DYNAMIC_IMPORT,
      BundlerFeature.SOURCEMAP,
      BundlerFeature.MINIFICATION,
      BundlerFeature.PLUGIN_SYSTEM,
      BundlerFeature.CONFIG_FILE,
      BundlerFeature.CACHE_SUPPORT,
      BundlerFeature.PARALLEL_BUILD,
      BundlerFeature.INCREMENTAL_BUILD
    ]
  }
} as const

/**
 * 打包器性能特征
 */
export const BUNDLER_PERFORMANCE = {
  rollup: {
    buildSpeed: 'medium',
    memoryUsage: 'medium',
    startupTime: 'fast',
    incrementalBuild: 'fair',
    largeProjectSupport: 'good',
    parallelProcessing: 'poor'
  },
  
  rolldown: {
    buildSpeed: 'very-fast',
    memoryUsage: 'low',
    startupTime: 'fast',
    incrementalBuild: 'excellent',
    largeProjectSupport: 'excellent',
    parallelProcessing: 'excellent'
  }
} as const

/**
 * 打包器兼容性
 */
export const BUNDLER_COMPATIBILITY = {
  rollup: {
    nodeVersion: '>=14.18.0',
    platforms: ['win32', 'darwin', 'linux'],
    architectures: ['x64', 'arm64'],
    pluginCompatibility: {
      rollup: 'full',
      webpack: 'none',
      vite: 'partial'
    },
    configCompatibility: {
      rollup: true,
      webpack: false,
      vite: true
    }
  },
  
  rolldown: {
    nodeVersion: '>=16.0.0',
    platforms: ['win32', 'darwin', 'linux'],
    architectures: ['x64', 'arm64'],
    pluginCompatibility: {
      rollup: 'partial',
      webpack: 'none',
      vite: 'partial'
    },
    configCompatibility: {
      rollup: true,
      webpack: false,
      vite: false
    }
  }
} as const

/**
 * 打包器推荐使用场景
 */
export const BUNDLER_USE_CASES = {
  rollup: [
    '成熟的库项目',
    '需要稳定性的生产环境',
    '复杂的插件需求',
    '对构建速度要求不高的项目',
    '需要丰富插件生态的项目'
  ],
  
  rolldown: [
    '大型项目',
    '对构建速度有高要求的项目',
    '需要增量构建的项目',
    '内存敏感的环境',
    '现代化的新项目'
  ]
} as const

/**
 * 打包器优缺点
 */
export const BUNDLER_PROS_CONS = {
  rollup: {
    pros: [
      '成熟稳定，生产环境验证',
      '丰富的插件生态系统',
      '优秀的 Tree Shaking 支持',
      '良好的文档和社区支持',
      '配置简单直观'
    ],
    cons: [
      '构建速度相对较慢',
      '大型项目性能有限',
      '内存使用较高',
      '缺乏内置的并行处理'
    ]
  },
  
  rolldown: {
    pros: [
      '极快的构建速度',
      '低内存使用',
      '优秀的增量构建',
      '内置并行处理',
      '兼容 Rollup API'
    ],
    cons: [
      '相对较新，生态系统有限',
      '插件兼容性不完整',
      '文档和社区支持有限',
      '可能存在稳定性问题'
    ]
  }
} as const

/**
 * 打包器选择建议
 */
export const BUNDLER_SELECTION_CRITERIA = {
  // 项目规模
  projectSize: {
    small: 'rollup',
    medium: 'rollup',
    large: 'rolldown',
    enterprise: 'rolldown'
  },
  
  // 构建速度要求
  buildSpeed: {
    low: 'rollup',
    medium: 'rollup',
    high: 'rolldown',
    critical: 'rolldown'
  },
  
  // 稳定性要求
  stability: {
    low: 'rolldown',
    medium: 'rollup',
    high: 'rollup',
    critical: 'rollup'
  },
  
  // 插件需求
  pluginNeeds: {
    minimal: 'rolldown',
    moderate: 'rollup',
    extensive: 'rollup',
    custom: 'rollup'
  }
} as const

/**
 * 打包器迁移难度
 */
export const MIGRATION_DIFFICULTY = {
  'rollup-to-rolldown': 'easy',
  'rolldown-to-rollup': 'easy'
} as const

/**
 * 打包器配置映射
 */
export const CONFIG_MAPPING = {
  // Rollup 到 Rolldown 的配置映射
  'rollup-to-rolldown': {
    input: 'input',
    output: 'output',
    external: 'external',
    plugins: 'plugins',
    treeshake: 'treeshake',
    // Rolldown 特有配置
    platform: 'browser' // 默认值
  },
  
  // Rolldown 到 Rollup 的配置映射
  'rolldown-to-rollup': {
    input: 'input',
    output: 'output',
    external: 'external',
    plugins: 'plugins',
    treeshake: 'treeshake'
    // 忽略 platform 等 Rolldown 特有配置
  }
} as const

/**
 * 打包器检测命令
 */
export const BUNDLER_DETECTION_COMMANDS = {
  rollup: {
    check: 'rollup --version',
    install: 'npm install rollup --save-dev'
  },
  
  rolldown: {
    check: 'rolldown --version',
    install: 'npm install rolldown --save-dev'
  }
} as const

/**
 * 打包器默认配置
 */
export const BUNDLER_DEFAULT_CONFIG = {
  rollup: {
    treeshake: true,
    output: {
      format: 'esm',
      sourcemap: true
    }
  },
  
  rolldown: {
    treeshake: true,
    platform: 'browser',
    output: {
      format: 'esm',
      sourcemap: true
    }
  }
} as const

/**
 * 打包器错误处理
 */
export const BUNDLER_ERROR_PATTERNS = {
  rollup: {
    notFound: /Cannot find module 'rollup'/,
    versionMismatch: /Rollup version .* is not supported/,
    configError: /Could not resolve config file/,
    buildError: /Build failed with \d+ error/
  },
  
  rolldown: {
    notFound: /Cannot find module 'rolldown'/,
    versionMismatch: /Rolldown version .* is not supported/,
    configError: /Could not resolve config file/,
    buildError: /Build failed with \d+ error/
  }
} as const

/**
 * 打包器性能基准
 */
export const PERFORMANCE_BENCHMARKS = {
  // 小型项目 (< 100 文件)
  small: {
    rollup: { buildTime: '2-5s', memoryUsage: '100-200MB' },
    rolldown: { buildTime: '0.5-1s', memoryUsage: '50-100MB' }
  },
  
  // 中型项目 (100-500 文件)
  medium: {
    rollup: { buildTime: '10-30s', memoryUsage: '300-500MB' },
    rolldown: { buildTime: '2-5s', memoryUsage: '100-200MB' }
  },
  
  // 大型项目 (> 500 文件)
  large: {
    rollup: { buildTime: '60-180s', memoryUsage: '500MB-1GB' },
    rolldown: { buildTime: '5-15s', memoryUsage: '200-400MB' }
  }
} as const
