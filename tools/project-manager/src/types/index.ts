/**
 * 项目管理器类型定义
 * @module types
 */

/**
 * 项目类型
 */
export type ProjectType = 'vue' | 'react' | 'node' | 'monorepo' | 'angular' | 'svelte' | 'next' | 'nuxt' | 'unknown'

/**
 * 包管理器类型
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'unknown'

/**
 * 项目框架
 */
export interface ProjectFramework {
  /** 框架名称 */
  name: string
  /** 框架版本 */
  version?: string
  /** 是否为主框架 */
  primary: boolean
}

/**
 * 项目分类
 */
export type ProjectCategory = 'app' | 'lib' | 'app-lib' | 'unknown'

/**
 * 构建工具
 */
export type BuildTool = 'vite' | 'webpack' | 'rollup' | 'esbuild' | 'parcel' | 'tsup' | 'unknown'

/**
 * 项目信息
 */
export interface ProjectInfo {
  /** 项目名称 */
  name: string
  /** 项目路径 */
  path: string
  /** 项目类型 */
  type: ProjectType
  /** 项目分类（应用/库/应用+库） */
  category: ProjectCategory
  /** 项目版本 */
  version: string
  /** 项目描述 */
  description?: string
  /** 包管理器 */
  packageManager: PackageManager
  /** 框架信息 */
  frameworks: ProjectFramework[]
  /** 构建工具 */
  buildTool: BuildTool
  /** 是否使用 TypeScript */
  useTypeScript: boolean
  /** 是否已安装 LDesign 工具 */
  hasLDesign: {
    launcher: boolean
    builder: boolean
  }
  /** 脚本列表 */
  scripts: Record<string, string>
  /** 依赖 */
  dependencies: Record<string, string>
  /** 开发依赖 */
  devDependencies: Record<string, string>
  /** 是否为 Git 仓库 */
  isGitRepo: boolean
  /** 最后修改时间 */
  lastModified: Date
  /** 项目大小（字节） */
  size?: number
}

/**
 * package.json 内容
 */
export interface PackageJson {
  name?: string
  version?: string
  description?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  [key: string]: any
}

/**
 * 依赖信息
 */
export interface DependencyInfo {
  /** 依赖名称 */
  name: string
  /** 当前版本 */
  version: string
  /** 最新版本 */
  latestVersion?: string
  /** 是否过期 */
  outdated: boolean
  /** 依赖类型 */
  type: 'dependencies' | 'devDependencies' | 'peerDependencies'
}

/**
 * 项目扫描选项
 */
export interface ScanOptions {
  /** 最大扫描深度 */
  maxDepth?: number
  /** 忽略目录 */
  ignore?: string[]
  /** 是否包含隐藏目录 */
  includeHidden?: boolean
  /** 是否分析依赖 */
  analyzeDependencies?: boolean
}

/**
 * 项目统计信息
 */
export interface ProjectStats {
  /** 总项目数 */
  total: number
  /** 按类型分组 */
  byType: Record<ProjectType, number>
  /** 按包管理器分组 */
  byPackageManager: Record<PackageManager, number>
  /** Git 仓库数量 */
  gitRepos: number
}

