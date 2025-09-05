/**
 * 项目管理模块类型定义
 *
 * 定义了项目类型检测、依赖分析、构建工具等相关的类型接口
 *
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 前端项目类型枚举
 * 定义支持的前端项目类型
 */
export enum ProjectType {
  /** Vue.js 2.x 项目 */
  VUE2 = 'vue2',
  /** Vue.js 3.x 项目 */
  VUE3 = 'vue3',
  /** React 项目 */
  REACT = 'react',
  /** Next.js 项目 */
  NEXTJS = 'nextjs',
  /** Nuxt.js 项目 */
  NUXTJS = 'nuxtjs',
  /** Angular 项目 */
  ANGULAR = 'angular',
  /** Svelte 项目 */
  SVELTE = 'svelte',
  /** Vite 项目 */
  VITE = 'vite',
  /** Webpack 项目 */
  WEBPACK = 'webpack',
  /** 原生 JavaScript 项目 */
  VANILLA_JS = 'vanilla-js',
  /** TypeScript 项目 */
  TYPESCRIPT = 'typescript',
  /** Node.js 项目 */
  NODEJS = 'nodejs',
  /** Electron 项目 */
  ELECTRON = 'electron',
  /** Tauri 项目 */
  TAURI = 'tauri',
  /** 静态网站 */
  STATIC = 'static',
  /** 未知类型 */
  UNKNOWN = 'unknown',
}

/**
 * 包管理器类型枚举
 * 定义支持的包管理器
 */
export enum PackageManager {
  /** npm 包管理器 */
  NPM = 'npm',
  /** yarn 包管理器 */
  YARN = 'yarn',
  /** pnpm 包管理器 */
  PNPM = 'pnpm',
  /** bun 包管理器 */
  BUN = 'bun',
  /** 未知包管理器 */
  UNKNOWN = 'unknown',
}

/**
 * 构建工具类型枚举
 * 定义支持的构建工具
 */
export enum BuildTool {
  /** Vite 构建工具 */
  VITE = 'vite',
  /** Webpack 构建工具 */
  WEBPACK = 'webpack',
  /** Rollup 构建工具 */
  ROLLUP = 'rollup',
  /** esbuild 构建工具 */
  ESBUILD = 'esbuild',
  /** Turbopack 构建工具 */
  TURBOPACK = 'turbopack',
  /** Parcel 构建工具 */
  PARCEL = 'parcel',
  /** tsup 构建工具 */
  TSUP = 'tsup',
  /** unbuild 构建工具 */
  UNBUILD = 'unbuild',
  /** 未知构建工具 */
  UNKNOWN = 'unknown',
}

/**
 * 项目检测结果接口
 * 包含项目类型、框架版本、依赖信息等
 */
export interface ProjectDetectionResult {
  /** 项目类型 */
  projectType: ProjectType
  /** 框架名称 */
  framework?: string
  /** 框架版本 */
  frameworkVersion?: string
  /** 包管理器 */
  packageManager: PackageManager
  /** 构建工具列表 */
  buildTools: BuildTool[]
  /** TypeScript 支持 */
  hasTypeScript: boolean
  /** 项目根目录 */
  projectRoot: string
  /** 配置文件列表 */
  configFiles: string[]
  /** 主要依赖列表 */
  mainDependencies: string[]
  /** 开发依赖列表 */
  devDependencies: string[]
  /** 脚本命令列表 */
  scripts: Record<string, string>
  /** 检测置信度 (0-100) */
  confidence: number
  /** 检测详情和建议 */
  details?: string[]
}

/**
 * 依赖信息接口
 * 描述依赖的详细信息
 */
export interface DependencyInfo {
  /** 依赖名称 */
  name: string
  /** 依赖版本 */
  version: string
  /** 依赖类型 */
  type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency'
  /** 是否为框架核心依赖 */
  isFrameworkCore?: boolean
  /** 依赖描述 */
  description?: string
  /** 依赖大小 */
  size?: number
  /** 最后更新时间 */
  lastUpdated?: string
}

/**
 * 项目配置文件接口
 * 描述项目中的配置文件
 */
export interface ConfigFile {
  /** 文件名 */
  name: string
  /** 文件路径 */
  path: string
  /** 文件类型 */
  type: 'json' | 'js' | 'ts' | 'yaml' | 'toml' | 'other'
  /** 是否存在 */
  exists: boolean
  /** 配置内容（可选） */
  content?: any
}

/**
 * 项目分析选项接口
 * 配置项目检测的选项
 */
export interface ProjectAnalysisOptions {
  /** 项目根目录，默认为当前目录 */
  projectRoot?: string
  /** 是否深度分析依赖 */
  deepAnalyzeDependencies?: boolean
  /** 是否检测配置文件 */
  detectConfigFiles?: boolean
  /** 是否分析脚本命令 */
  analyzeScripts?: boolean
  /** 是否检测开发工具 */
  detectDevTools?: boolean
  /** 自定义检测规则 */
  customDetectionRules?: DetectionRule[]
}

/**
 * 自定义检测规则接口
 * 允许用户定义自定义的项目类型检测规则
 */
export interface DetectionRule {
  /** 规则名称 */
  name: string
  /** 项目类型 */
  projectType: ProjectType
  /** 检测条件 */
  conditions: DetectionCondition[]
  /** 权重分数 */
  weight: number
}

/**
 * 检测条件接口
 * 定义具体的检测条件
 */
export interface DetectionCondition {
  /** 条件类型 */
  type: 'file' | 'dependency' | 'script' | 'content'
  /** 目标文件/依赖/脚本名称 */
  target: string
  /** 检测模式 */
  mode: 'exists' | 'contains' | 'matches' | 'version'
  /** 期望值（可选） */
  value?: string | RegExp
}

/**
 * 开发服务器信息接口
 * 描述开发服务器的配置和状态
 */
export interface DevServerInfo {
  /** 服务器名称 */
  name: string
  /** 端口号 */
  port?: number
  /** 主机地址 */
  host?: string
  /** 是否使用HTTPS */
  https?: boolean
  /** 启动命令 */
  startCommand?: string
  /** 是否正在运行 */
  isRunning?: boolean
  /** 服务器URL */
  url?: string
}

/**
 * 项目统计信息接口
 * 提供项目的统计数据
 */
export interface ProjectStatistics {
  /** 总文件数 */
  totalFiles: number
  /** 代码文件数 */
  codeFiles: number
  /** 总代码行数 */
  linesOfCode: number
  /** 依赖数量 */
  dependencyCount: number
  /** 开发依赖数量 */
  devDependencyCount: number
  /** 配置文件数量 */
  configFileCount: number
  /** 测试文件数量 */
  testFileCount: number
  /** 项目大小（字节） */
  projectSize: number
}
