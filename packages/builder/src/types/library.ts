/**
 * 库类型相关定义
 */

/**
 * 库类型枚举
 */
export enum LibraryType {
  /** TypeScript 库 */
  TYPESCRIPT = 'typescript',
  /** 样式库 */
  STYLE = 'style',
  /** Vue2 组件库 */
  VUE2 = 'vue2',
  /** Vue3 组件库 */
  VUE3 = 'vue3',
  /** React 组件库 */
  REACT = 'react',
  /** Svelte 组件库 */
  SVELTE = 'svelte',
  /** Solid 组件库 */
  SOLID = 'solid',
  /** Preact 组件库 */
  PREACT = 'preact',
  /** Lit/Web Components 组件库 */
  LIT = 'lit',
  /** Angular 组件库（基础支持） */
  ANGULAR = 'angular',
  /** 混合库 */
  MIXED = 'mixed'
}

/**
 * 库检测结果
 */
export interface LibraryDetectionResult {
  /** 检测到的库类型 */
  type: LibraryType
  /** 置信度 (0-1) */
  confidence: number
  /** 检测依据 */
  evidence: DetectionEvidence[]
  /** 建议的配置 */
  suggestedConfig?: Partial<any>
}

/**
 * 检测依据
 */
export interface DetectionEvidence {
  /** 依据类型 */
  type: 'file' | 'dependency' | 'config' | 'content' | 'error'
  /** 依据描述 */
  description: string
  /** 权重 */
  weight: number
  /** 相关文件或配置 */
  source?: string
}

/**
 * TypeScript 库配置
 */
export interface TypeScriptLibraryConfig {
  /** tsconfig.json 路径 */
  tsconfig?: string
  /** 是否生成类型声明文件 */
  declaration?: boolean
  /** 类型声明文件输出目录 */
  declarationDir?: string
  /** 是否生成声明文件映射 */
  declarationMap?: boolean
  /** 是否启用 isolatedDeclarations */
  isolatedDeclarations?: boolean
  /** 是否跳过库检查 */
  skipLibCheck?: boolean
  /** 是否允许合成默认导入 */
  allowSyntheticDefaultImports?: boolean
  /** 是否启用严格模式 */
  strict?: boolean
  /** 目标 ES 版本 */
  target?: string
  /** 模块系统 */
  module?: string
  /** 模块解析策略 */
  moduleResolution?: string
  /** 基础 URL */
  baseUrl?: string
  /** 路径映射 */
  paths?: Record<string, string[]>
  /** 类型定义 */
  types?: string[]
  /** TypeScript 编译器选项 - 支持嵌套的 compilerOptions 格式 */
  compilerOptions?: {
    /** 是否生成类型声明文件 */
    declaration?: boolean
    /** 类型声明文件输出目录 */
    declarationDir?: string
    /** 是否生成声明文件映射 */
    declarationMap?: boolean
    /** 是否移除注释 */
    removeComments?: boolean
    /** 目标 ES 版本 */
    target?: string
    /** 模块系统 */
    module?: string
    /** 是否启用严格模式 */
    strict?: boolean
    /** 是否跳过库检查 */
    skipLibCheck?: boolean
    /** 其他编译器选项 */
    [key: string]: any
  }
}

/**
 * Vue 库配置
 */
export interface VueLibraryConfig {
  /** Vue 版本 */
  version?: 2 | 3
  /** 是否支持按需加载 */
  onDemand?: boolean
  /** 编译器选项 */
  compilerOptions?: {
    /** 自定义元素判断函数 */
    isCustomElement?: (tag: string) => boolean
    /** 是否保留空白字符 */
    whitespace?: 'preserve' | 'condense'
    /** 是否启用注释 */
    comments?: boolean
    /** 自定义指令前缀 */
    directiveTransforms?: Record<string, any>
  }
  /** JSX 配置 */
  jsx?: {
    /** JSX 工厂函数 */
    factory?: string
    /** JSX 片段 */
    fragment?: string
    /** 是否启用 JSX */
    enabled?: boolean
  }
  /** 模板配置 */
  template?: {
    /** 是否预编译模板 */
    precompile?: boolean
    /** 模板编译器选项 */
    compilerOptions?: Record<string, any>
  }
  /** 脚本配置 */
  script?: {
    /** 是否启用 defineModel */
    defineModel?: boolean
    /** 是否启用 props 解构 */
    propsDestructure?: boolean
    /** 其他脚本选项 */
    [key: string]: any
  }
  /** 样式配置 */
  style?: {
    /** CSS 模块配置 */
    modules?: boolean
    /** 其他样式选项 */
    [key: string]: any
  }
  /** 是否启用 CSS 模块 */
  cssModules?: boolean
}

/**
 * Vue JSX 配置
 */
export interface VueJsxConfig {
  /** 包含的文件模式 */
  include?: RegExp | string | (RegExp | string)[]
  /** 排除的文件模式 */
  exclude?: RegExp | string | (RegExp | string)[]
  /** 是否启用 TypeScript 支持 */
  typescript?: boolean
  /** 是否启用优化 */
  optimize?: boolean
  /** JSX 工厂函数 */
  factory?: string
  /** JSX 片段 */
  fragment?: string
  /** JSX 导入源 */
  jsxImportSource?: string
  /** 是否启用开发模式 */
  development?: boolean
  /** 其他选项 */
  [key: string]: any
  /** 样式配置 */
  style?: {
    /** 是否修剪样式 */
    trim?: boolean
    /** 其他样式选项 */
    [key: string]: any
  }
}

/**
 * 样式库配置
 */
export interface StyleLibraryConfig {
  /** 预处理器类型 */
  preprocessor?: 'auto' | 'less' | 'scss' | 'sass' | 'stylus' | 'postcss' | {
    /** Less 配置 */
    less?: {
      enabled?: boolean
      options?: {
        javascriptEnabled?: boolean
        modifyVars?: Record<string, any>
        [key: string]: any
      }
    }
    /** Sass 配置 */
    sass?: {
      enabled?: boolean
      options?: {
        includePaths?: string[]
        [key: string]: any
      }
    }
  }
  /** 是否提取 CSS */
  extract?: boolean
  /** 是否压缩 CSS */
  minimize?: boolean
  /** 是否启用 autoprefixer */
  autoprefixer?: boolean
  /** 浏览器兼容性列表 */
  browserslist?: string[]
  /** 是否启用 CSS 模块 */
  modules?: boolean | {
    /** 类名生成模式 */
    generateScopedName?: string | ((name: string, filename: string, css: string) => string)
    /** 全局模式 */
    globalModulePaths?: string[]
    /** 导出全局变量 */
    exportGlobals?: boolean
  }
  /** PostCSS 插件 */
  postcssPlugins?: any[]
  /** 变量文件路径 */
  variablesFile?: string
  /** 主题配置 */
  theme?: Record<string, any>
}

/**
 * 混合库配置
 */
export interface MixedLibraryConfig {
  /** TypeScript 配置 */
  typescript?: TypeScriptLibraryConfig
  /** Vue 配置 */
  vue?: VueLibraryConfig
  /** 样式配置 */
  style?: StyleLibraryConfig
  /** 主要库类型 */
  primaryType?: LibraryType
  /** 次要库类型 */
  secondaryTypes?: LibraryType[]
}

/**
 * 库元数据
 */
export interface LibraryMetadata {
  /** 库名称 */
  name: string
  /** 库版本 */
  version: string
  /** 库描述 */
  description?: string
  /** 库类型 */
  type: LibraryType
  /** 入口文件 */
  entry: string | string[]
  /** 输出目录 */
  outputDir: string
  /** 依赖列表 */
  dependencies: string[]
  /** 开发依赖列表 */
  devDependencies: string[]
  /** 对等依赖列表 */
  peerDependencies: string[]
  /** 支持的环境 */
  environments: ('browser' | 'node' | 'worker')[]
  /** 支持的模块格式 */
  formats: ('esm' | 'cjs' | 'umd' | 'iife')[]
  /** 是否支持 Tree Shaking */
  treeshakable: boolean
  /** 是否支持按需加载 */
  sideEffects: boolean | string[]
}

/**
 * 库分析结果
 */
export interface LibraryAnalysisResult {
  /** 库元数据 */
  metadata: LibraryMetadata
  /** 检测结果 */
  detection: LibraryDetectionResult
  /** 文件统计 */
  fileStats: {
    total: number
    byType: Record<string, number>
    bySize: Record<string, number>
  }
  /** 依赖分析 */
  dependencyAnalysis: {
    total: number
    external: string[]
    internal: string[]
    circular: string[][]
  }
  /** 建议的优化 */
  optimizations: OptimizationSuggestion[]
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  /** 建议类型 */
  type: 'performance' | 'size' | 'compatibility' | 'maintainability'
  /** 建议标题 */
  title: string
  /** 建议描述 */
  description: string
  /** 影响程度 */
  impact: 'low' | 'medium' | 'high'
  /** 实施难度 */
  difficulty: 'easy' | 'medium' | 'hard'
  /** 相关配置 */
  config?: Record<string, any>
}

/**
 * 库构建选项
 */
export interface LibraryBuildOptions {
  /** 是否启用 bundleless 模式 */
  bundleless?: boolean
  /** 是否保留模块结构 */
  preserveModules?: boolean
  /** 是否生成类型声明 */
  generateTypes?: boolean
  /** 是否压缩代码 */
  minify?: boolean
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 外部依赖处理 */
  external?: string[] | ((id: string) => boolean)
  /** 全局变量映射 */
  globals?: Record<string, string>
  /** 输出格式 */
  formats?: ('esm' | 'cjs' | 'umd' | 'iife')[]
  /** 代码分割配置 */
  splitting?: boolean | {
    /** 手动分块 */
    manualChunks?: Record<string, string[]>
    /** 分块策略 */
    strategy?: 'default' | 'vendor' | 'component'
  }
}

/**
 * 库发布配置
 */
export interface LibraryPublishConfig {
  /** 发布注册表 */
  registry?: string
  /** 访问级别 */
  access?: 'public' | 'restricted'
  /** 标签 */
  tag?: string
  /** 是否干运行 */
  dryRun?: boolean
  /** 发布前钩子 */
  beforePublish?: () => Promise<void> | void
  /** 发布后钩子 */
  afterPublish?: () => Promise<void> | void
}
