/**
 * 项目相关类型定义
 */

/**
 * 项目类型
 */
export type ProjectType =
  | 'vue'
  | 'react'
  | 'angular'
  | 'svelte'
  | 'solid'
  | 'node'
  | 'library'
  | 'monorepo'
  | 'unknown'

/**
 * 框架类型
 */
export type FrameworkType =
  | 'vue2'
  | 'vue3'
  | 'react'
  | 'next'
  | 'nuxt'
  | 'angular'
  | 'svelte'
  | 'sveltekit'
  | 'solid'
  | 'qwik'
  | 'none'
  | 'unknown'

/**
 * 包管理器类型
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

/**
 * 项目基本信息
 */
export interface Project {
  id: string
  name: string
  path: string
  type: ProjectType
  framework?: FrameworkType
  packageManager?: PackageManager
  nodeVersion?: string
  description?: string
  createdAt: number
  updatedAt: number
  lastOpenedAt?: number
  metadata?: ProjectMetadata
}

/**
 * 项目元数据
 */
export interface ProjectMetadata {
  /**
   * package.json 信息
   */
  packageJson?: {
    version?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    scripts?: Record<string, string>
  }

  /**
   * Git 信息
   */
  git?: {
    hasRepo: boolean
    branch?: string
    remote?: string
    lastCommit?: string
  }

  /**
   * 构建工具
   */
  buildTool?: 'vite' | 'webpack' | 'rollup' | 'esbuild' | 'parcel' | 'unknown'

  /**
   * TypeScript
   */
  typescript?: boolean

  /**
   * 测试框架
   */
  testFramework?: 'vitest' | 'jest' | 'mocha' | 'playwright' | 'cypress' | 'unknown'

  /**
   * 自定义数据
   */
  [key: string]: any
}

/**
 * 项目检测结果
 */
export interface ProjectDetectionResult {
  type: ProjectType
  framework: FrameworkType
  packageManager: PackageManager
  buildTool?: string
  hasTypeScript: boolean
  hasGit: boolean
  confidence: number // 0-1
}

/**
 * 项目创建选项
 */
export interface CreateProjectOptions {
  name: string
  path: string
  template?: string
  framework?: FrameworkType
  packageManager?: PackageManager
  typescript?: boolean
  git?: boolean
  install?: boolean
}

/**
 * 项目导入选项
 */
export interface ImportProjectOptions {
  path: string
  detect?: boolean
}

/**
 * 项目操作记录
 */
export interface ProjectOperation {
  id: string
  projectId: string
  operationType: 'build' | 'test' | 'deploy' | 'analyze' | 'docs' | 'security' | 'other'
  toolName: string
  status: 'pending' | 'running' | 'success' | 'failed'
  result?: any
  error?: string
  duration?: number
  createdAt: number
}

/**
 * 项目统计
 */
export interface ProjectStats {
  id: string
  projectId: string
  buildCount: number
  testCount: number
  deployCount: number
  lastBuildTime?: number
  lastTestTime?: number
  lastDeployTime?: number
  updatedAt: number
}


