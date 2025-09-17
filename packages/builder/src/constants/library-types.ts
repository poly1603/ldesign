/**
 * 库类型相关常量
 */

import { LibraryType } from '../types/library'

/**
 * 库类型检测模式
 */
export const LIBRARY_TYPE_PATTERNS = {
  [LibraryType.TYPESCRIPT]: {
    // TypeScript 库检测模式
    files: [
      'src/**/*.ts',
      'src/**/*.tsx',
      'lib/**/*.ts',
      'lib/**/*.tsx',
      'index.ts',
      'main.ts'
    ],
    dependencies: [
      'typescript',
      '@types/node'
    ],
    configs: [
      'tsconfig.json',
      'tsconfig.build.json'
    ],
    packageJsonFields: [
      'types',
      'typings'
    ],
    weight: 0.8
  },

  [LibraryType.STYLE]: {
    // 样式库检测模式
    files: [
      'src/**/*.css',
      'src/**/*.less',
      'src/**/*.scss',
      'src/**/*.sass',
      'src/**/*.styl',
      'lib/**/*.css',
      'styles/**/*'
    ],
    dependencies: [
      'less',
      'sass',
      'stylus',
      'postcss'
    ],
    configs: [
      'postcss.config.js',
      '.stylelintrc'
    ],
    packageJsonFields: [
      'style',
      'sass',
      'less'
    ],
    weight: 0.9
  },

  [LibraryType.VUE2]: {
    // Vue2 组件库检测模式
    files: [
      'src/**/*.vue',
      'lib/**/*.vue',
      'components/**/*.vue'
    ],
    dependencies: [
      'vue@^2',
      '@vue/composition-api',
      'vue-template-compiler'
    ],
    devDependencies: [
      '@vue/cli-service',
      'vue-loader'
    ],
    configs: [
      'vue.config.js'
    ],
    packageJsonFields: [],
    weight: 0.95
  },

  [LibraryType.VUE3]: {
    // Vue3 组件库检测模式
    files: [
      'src/**/*.vue',
      'lib/**/*.vue',
      'components/**/*.vue',
      'src/**/*.tsx',
      'lib/**/*.tsx',
      'components/**/*.tsx'
    ],
    dependencies: [
      'vue@^3',
      '@vue/runtime-core',
      '@vue/runtime-dom'
    ],
    devDependencies: [
      '@vitejs/plugin-vue',
      '@vue/compiler-sfc'
    ],
    configs: [
      'vite.config.ts',
      'vite.config.js'
    ],
    packageJsonFields: [],
    weight: 0.95
  },

  [LibraryType.REACT]: {
    // React 组件库检测模式
    files: [
      'src/**/*.tsx',
      'src/**/*.jsx',
      'lib/**/*.tsx',
      'components/**/*.tsx'
    ],
    dependencies: [
      'react',
      'react-dom'
    ],
    devDependencies: [
      '@vitejs/plugin-react'
    ],
    configs: [
      'vite.config.ts',
      'vite.config.js'
    ],
    packageJsonFields: [],
    weight: 0.95
  },

  [LibraryType.SVELTE]: {
    // Svelte 组件库检测模式
    files: [
      'src/**/*.svelte',
      'lib/**/*.svelte',
      'components/**/*.svelte'
    ],
    dependencies: [
      'svelte'
    ],
    devDependencies: [
      '@sveltejs/rollup-plugin-svelte'
    ],
    configs: [
      'svelte.config.js',
      'svelte.config.cjs'
    ],
    packageJsonFields: [
      'svelte'
    ],
    weight: 0.95
  },

  [LibraryType.SOLID]: {
    // Solid 组件库检测模式
    files: [
      'src/**/*.jsx',
      'src/**/*.tsx'
    ],
    dependencies: [
      'solid-js'
    ],
    devDependencies: [
      'rollup-plugin-solid',
      'vite-plugin-solid'
    ],
    configs: [
      'vite.config.ts',
      'vite.config.js'
    ],
    packageJsonFields: [],
    weight: 0.9
  },

  [LibraryType.PREACT]: {
    // Preact 组件库检测模式
    files: [
      'src/**/*.jsx',
      'src/**/*.tsx'
    ],
    dependencies: [
      'preact'
    ],
    devDependencies: [
      '@preact/preset-vite'
    ],
    configs: [
      'vite.config.ts',
      'vite.config.js'
    ],
    packageJsonFields: [],
    weight: 0.9
  },

  [LibraryType.LIT]: {
    // Lit / Web Components 检测模式
    files: [
      'src/**/*.ts',
      'src/**/*.js',
      'src/**/*.css'
    ],
    dependencies: [
      'lit'
    ],
    devDependencies: [],
    configs: [],
    packageJsonFields: [],
    weight: 0.85
  },

  [LibraryType.ANGULAR]: {
    // Angular 组件库检测模式（基础）
    files: [
      'projects/**/*.ts',
      'src/**/*.ts'
    ],
    dependencies: [
      '@angular/core',
      '@angular/common'
    ],
    devDependencies: [
      'ng-packagr'
    ],
    configs: [
      'ng-package.json',
      'angular.json'
    ],
    packageJsonFields: [],
    weight: 0.8
  },

  [LibraryType.MIXED]: {
    // 混合库检测模式（多种类型混合）
    files: [
      'src/**/*.{ts,tsx,vue,css,less,scss}'
    ],
    dependencies: [],
    configs: [],
    packageJsonFields: [],
    weight: 0.6 // 较低权重，作为兜底选项
  }
} as const

/**
 * 库类型描述
 */
export const LIBRARY_TYPE_DESCRIPTIONS = {
  [LibraryType.TYPESCRIPT]: 'TypeScript 库 - 使用 TypeScript 编写的库，支持类型声明和现代 JavaScript 特性',
  [LibraryType.STYLE]: '样式库 - 包含 CSS、Less、Sass 等样式文件的库',
  [LibraryType.VUE2]: 'Vue2 组件库 - 基于 Vue 2.x 的组件库',
  [LibraryType.VUE3]: 'Vue3 组件库 - 基于 Vue 3.x 的组件库，支持 Composition API',
  [LibraryType.REACT]: 'React 组件库 - 基于 React 18+ 的组件库，支持 JSX/TSX 与 Hooks',
  [LibraryType.SVELTE]: 'Svelte 组件库 - 使用 Svelte 的库，零虚拟DOM，编译时优化',
  [LibraryType.SOLID]: 'Solid 组件库 - 使用 SolidJS 的库，细粒度响应式，JSX 支持',
  [LibraryType.PREACT]: 'Preact 组件库 - 小而快的 React 兼容库',
  [LibraryType.LIT]: 'Lit/Web Components 组件库 - 标准 Web Components，面向浏览器原生',
  [LibraryType.ANGULAR]: 'Angular 组件库（基础支持）- 建议使用 ng-packagr，但提供最小打包能力',
  [LibraryType.MIXED]: '混合库 - 包含多种类型文件的复合库'
} as const

/**
 * 库类型推荐配置
 */
export const LIBRARY_TYPE_RECOMMENDED_CONFIG = {
  [LibraryType.TYPESCRIPT]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    typescript: {
      declaration: true,
      isolatedDeclarations: true
    },
    external: [],
    bundleless: false
  },

  [LibraryType.STYLE]: {
    output: {
      format: ['esm'],
      sourcemap: false
    },
    style: {
      extract: true,
      minimize: true,
      autoprefixer: true
    },
    external: [],
    bundleless: true
  },

  [LibraryType.VUE2]: {
    output: {
      format: ['esm', 'cjs', 'umd'],
      sourcemap: true
    },
    vue: {
      version: 2,
      onDemand: true
    },
    external: ['vue'],
    globals: {
      vue: 'Vue'
    },
    bundleless: false
  },

  [LibraryType.VUE3]: {
    output: {
      format: ['esm', 'cjs', 'umd'],
      sourcemap: true
    },
    vue: {
      version: 3,
      onDemand: true
    },
    external: ['vue'],
    globals: {
      vue: 'Vue'
    },
    bundleless: false
  },

  [LibraryType.REACT]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    external: ['react', 'react-dom'],
    bundleless: false
  },

  [LibraryType.SVELTE]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    external: ['svelte'],
    bundleless: false
  },

  [LibraryType.SOLID]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    external: ['solid-js'],
    bundleless: false
  },

  [LibraryType.PREACT]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    external: ['preact'],
    bundleless: false
  },

  [LibraryType.LIT]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    external: ['lit'],
    bundleless: false
  },

  [LibraryType.ANGULAR]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    external: ['@angular/core', '@angular/common'],
    bundleless: false
  },

  [LibraryType.MIXED]: {
    output: {
      format: ['esm', 'cjs'],
      sourcemap: true
    },
    typescript: {
      declaration: true
    },
    style: {
      extract: true
    },
    external: [],
    bundleless: false
  }
} as const

/**
 * 库类型优先级
 */
export const LIBRARY_TYPE_PRIORITY = {
  [LibraryType.VUE2]: 10,
  [LibraryType.VUE3]: 10,
  [LibraryType.REACT]: 10,
  [LibraryType.SVELTE]: 9,
  [LibraryType.SOLID]: 9,
  [LibraryType.PREACT]: 9,
  [LibraryType.LIT]: 8,
  [LibraryType.ANGULAR]: 7,
  [LibraryType.STYLE]: 8,
  [LibraryType.TYPESCRIPT]: 6,
  [LibraryType.MIXED]: 2
} as const

/**
 * 库类型兼容性
 */
export const LIBRARY_TYPE_COMPATIBILITY = {
  [LibraryType.TYPESCRIPT]: {
    rollup: 'excellent',
    rolldown: 'excellent',
    treeshaking: true,
    codeSplitting: true,
    bundleless: true
  },

  [LibraryType.STYLE]: {
    rollup: 'good',
    rolldown: 'good',
    treeshaking: false,
    codeSplitting: false,
    bundleless: true
  },

  [LibraryType.VUE2]: {
    rollup: 'excellent',
    rolldown: 'good',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  },

  [LibraryType.VUE3]: {
    rollup: 'excellent',
    rolldown: 'excellent',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  },

  [LibraryType.MIXED]: {
    rollup: 'good',
    rolldown: 'good',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  },

  [LibraryType.SVELTE]: {
    rollup: 'excellent',
    rolldown: 'good',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  },

  [LibraryType.SOLID]: {
    rollup: 'good',
    rolldown: 'good',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  },

  [LibraryType.PREACT]: {
    rollup: 'excellent',
    rolldown: 'good',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  },

  [LibraryType.LIT]: {
    rollup: 'excellent',
    rolldown: 'good',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  },

  [LibraryType.ANGULAR]: {
    rollup: 'fair',
    rolldown: 'fair',
    treeshaking: true,
    codeSplitting: true,
    bundleless: false
  }
} as const

/**
 * 库类型所需插件
 */
export const LIBRARY_TYPE_PLUGINS = {
  [LibraryType.TYPESCRIPT]: [
    'typescript',
    'dts'
  ],

  [LibraryType.STYLE]: [
    'postcss',
    'less',
    'sass',
    'stylus'
  ],

  [LibraryType.VUE2]: [
    'vue2',
    'vue-jsx',
    'typescript',
    'postcss'
  ],

  [LibraryType.VUE3]: [
    'vue3',
    'vue-jsx',
    'typescript',
    'postcss'
  ],

  [LibraryType.MIXED]: [
    'typescript',
    'vue3',
    'postcss',
    'dts'
  ],

  [LibraryType.SVELTE]: [
    'svelte',
    'postcss',
    'dts'
  ],

  [LibraryType.SOLID]: [
    'solid',
    'typescript',
    'postcss',
    'dts'
  ],

  [LibraryType.PREACT]: [
    'preact',
    'typescript',
    'postcss',
    'dts'
  ],

  [LibraryType.LIT]: [
    'typescript',
    'postcss',
    'dts'
  ],

  [LibraryType.ANGULAR]: [
    'typescript',
    'dts'
  ]
} as const

/**
 * 库类型检测权重
 */
export const DETECTION_WEIGHTS = {
  // 文件模式权重
  files: 0.4,

  // 依赖权重
  dependencies: 0.3,

  // 配置文件权重
  configs: 0.2,

  // package.json 字段权重
  packageJsonFields: 0.1
} as const

/**
 * 最小置信度阈值
 */
export const MIN_CONFIDENCE_THRESHOLD = 0.6

/**
 * 库类型检测缓存配置
 */
export const DETECTION_CACHE_CONFIG = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
} as const

/**
 * 库类型特定的文件扩展名
 */
export const LIBRARY_TYPE_EXTENSIONS = {
  [LibraryType.TYPESCRIPT]: ['.ts', '.tsx', '.d.ts'],
  [LibraryType.STYLE]: ['.css', '.less', '.scss', '.sass', '.styl'],
  [LibraryType.VUE2]: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
  [LibraryType.VUE3]: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
  [LibraryType.REACT]: ['.ts', '.tsx', '.js', '.jsx'],
  [LibraryType.SVELTE]: ['.svelte', '.ts', '.js'],
  [LibraryType.SOLID]: ['.ts', '.tsx', '.js', '.jsx'],
  [LibraryType.PREACT]: ['.ts', '.tsx', '.js', '.jsx'],
  [LibraryType.LIT]: ['.ts', '.js', '.css'],
  [LibraryType.ANGULAR]: ['.ts', '.html', '.css', '.scss'],
  [LibraryType.MIXED]: ['.ts', '.tsx', '.vue', '.css', '.less', '.scss', '.sass']
} as const

/**
 * 库类型排除模式
 */
export const LIBRARY_TYPE_EXCLUDE_PATTERNS = {
  common: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.d.ts'
  ],

  [LibraryType.TYPESCRIPT]: [
    '**/*.js',
    '**/*.jsx'
  ],

  [LibraryType.STYLE]: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.vue'
  ],

  [LibraryType.VUE2]: [],

  [LibraryType.VUE3]: [],

  [LibraryType.MIXED]: [],

  [LibraryType.SVELTE]: [],
  [LibraryType.SOLID]: [],
  [LibraryType.PREACT]: [],
  [LibraryType.LIT]: [],
  [LibraryType.ANGULAR]: []
} as const
