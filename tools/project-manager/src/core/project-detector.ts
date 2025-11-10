/**
 * 项目检测器
 * @module core/project-detector
 */

import fs from 'fs-extra'
import path from 'node:path'
import type { PackageJson, ProjectFramework, ProjectInfo, ProjectType, PackageManager, ProjectCategory, BuildTool } from '../types'

/**
 * 项目检测器
 * 
 * 用于检测项目类型和获取项目信息
 */
export class ProjectDetector {
  constructor(private projectPath: string) {}

  /**
   * 检测项目类型
   * 
   * @returns 项目类型
   * 
   * @example
   * ```typescript
   * const detector = new ProjectDetector('/path/to/project')
   * const type = await detector.detectType()
   * console.log(type) // 'vue'
   * ```
   */
  async detectType(): Promise<ProjectType> {
    const packageJson = await this.readPackageJson()
    
    if (!packageJson) {
      return 'unknown'
    }

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    // 检测 Monorepo
    if (await this.isMonorepo()) {
      return 'monorepo'
    }

    // 检测 Vue
    if (deps.vue || deps['@vue/cli-service'] || deps.vite) {
      if (deps.nuxt || deps.nuxt3) {
        return 'nuxt'
      }
      return 'vue'
    }

    // 检测 React
    if (deps.react) {
      if (deps.next) {
        return 'next'
      }
      return 'react'
    }

    // 检测 Angular
    if (deps['@angular/core']) {
      return 'angular'
    }

    // 检测 Svelte
    if (deps.svelte) {
      return 'svelte'
    }

    // 默认为 Node.js 项目
    return 'node'
  }

  /**
   * 检测包管理器
   * 
   * @returns 包管理器类型
   */
  async detectPackageManager(): Promise<PackageManager> {
    // 检查锁文件
    const lockFiles = {
      'pnpm-lock.yaml': 'pnpm' as PackageManager,
      'yarn.lock': 'yarn' as PackageManager,
      'package-lock.json': 'npm' as PackageManager,
      'bun.lockb': 'bun' as PackageManager,
    }

    for (const [file, manager] of Object.entries(lockFiles)) {
      const filePath = path.join(this.projectPath, file)
      if (await fs.pathExists(filePath)) {
        return manager
      }
    }

    // 检查 package.json 中的 packageManager 字段
    const packageJson = await this.readPackageJson()
    if (packageJson?.packageManager) {
      const managerName = packageJson.packageManager.split('@')[0]
      if (['pnpm', 'yarn', 'npm', 'bun'].includes(managerName)) {
        return managerName as PackageManager
      }
    }

    return 'unknown'
  }

  /**
   * 获取项目框架信息
   * 
   * @returns 框架列表
   */
  async detectFrameworks(): Promise<ProjectFramework[]> {
    const packageJson = await this.readPackageJson()
    
    if (!packageJson) {
      return []
    }

    const frameworks: ProjectFramework[] = []
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    // 主要框架
    const frameworkMap: Record<string, string> = {
      vue: 'Vue',
      react: 'React',
      '@angular/core': 'Angular',
      svelte: 'Svelte',
      next: 'Next.js',
      nuxt: 'Nuxt',
      express: 'Express',
      koa: 'Koa',
      nestjs: 'NestJS',
    }

    for (const [dep, name] of Object.entries(frameworkMap)) {
      if (deps[dep]) {
        frameworks.push({
          name,
          version: deps[dep],
          primary: frameworks.length === 0, // 第一个为主框架
        })
      }
    }

    return frameworks
  }

  /**
   * 检测构建工具
   */
  async detectBuildTool(): Promise<BuildTool> {
    const packageJson = await this.readPackageJson()
    if (!packageJson) return 'unknown'

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    if (deps.vite) return 'vite'
    if (deps.webpack) return 'webpack'
    if (deps.rollup) return 'rollup'
    if (deps.esbuild) return 'esbuild'
    if (deps.parcel) return 'parcel'
    if (deps.tsup) return 'tsup'

    return 'unknown'
  }

  /**
   * 检测是否使用 TypeScript
   */
  async detectTypeScript(): Promise<boolean> {
    // 检查是否有 tsconfig.json
    if (await fs.pathExists(path.join(this.projectPath, 'tsconfig.json'))) {
      return true
    }
    // 检查依赖
    const packageJson = await this.readPackageJson()
    if (!packageJson) return false

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    return !!deps.typescript
  }

  /**
   * 检测 LDesign 工具
   */
  async detectLDesignTools(): Promise<{ launcher: boolean; builder: boolean }> {
    const packageJson = await this.readPackageJson()
    if (!packageJson) {
      return { launcher: false, builder: false }
    }

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    return {
      launcher: !!deps['@ldesign/launcher'],
      builder: !!deps['@ldesign/builder'],
    }
  }

  /**
   * 检测项目分类（应用/库/应用+库）
   */
  async detectCategory(): Promise<ProjectCategory> {
    const packageJson = await this.readPackageJson()
    if (!packageJson) return 'unknown'

    const hasLDesign = await this.detectLDesignTools()
    const scripts = packageJson.scripts || {}

    // 检查是否有应用脚本
    const hasAppScripts = !!(scripts.dev || scripts.start || scripts.serve)
    // 检查是否有库配置
    const hasLibConfig = !!(packageJson.main || packageJson.module || packageJson.exports)
    const hasLibScripts = !!scripts.build && hasLibConfig

    // 如果有 LDesign launcher 和 builder，说明既是应用又是库
    if (hasLDesign.launcher && hasLDesign.builder) {
      return 'app-lib'
    }

    // 如果只有 launcher，说明是纯应用
    if (hasLDesign.launcher) {
      return 'app'
    }

    // 如果只有 builder，说明是纯库
    if (hasLDesign.builder) {
      return 'lib'
    }

    // 根据 scripts 和 package.json 配置判断
    if (hasAppScripts && hasLibScripts) {
      return 'app-lib'
    }
    if (hasAppScripts) {
      return 'app'
    }
    if (hasLibScripts) {
      return 'lib'
    }

    return 'unknown'
  }

  /**
   * 获取完整的项目信息
   * 
   * @returns 项目信息
   */
  async getProjectInfo(): Promise<ProjectInfo> {
    const packageJson = await this.readPackageJson()
    const type = await this.detectType()
    const category = await this.detectCategory()
    const packageManager = await this.detectPackageManager()
    const frameworks = await this.detectFrameworks()
    const buildTool = await this.detectBuildTool()
    const useTypeScript = await this.detectTypeScript()
    const hasLDesign = await this.detectLDesignTools()
    const isGitRepo = await this.isGitRepo()
    const stats = await fs.stat(this.projectPath)

    return {
      name: packageJson?.name || path.basename(this.projectPath),
      path: this.projectPath,
      type,
      category,
      version: packageJson?.version || '0.0.0',
      description: packageJson?.description,
      packageManager,
      frameworks,
      buildTool,
      useTypeScript,
      hasLDesign,
      scripts: packageJson?.scripts || {},
      dependencies: packageJson?.dependencies || {},
      devDependencies: packageJson?.devDependencies || {},
      isGitRepo,
      lastModified: stats.mtime,
    }
  }

  /**
   * 读取 package.json
   */
  async readPackageJson(): Promise<PackageJson | null> {
    const packageJsonPath = path.join(this.projectPath, 'package.json')
    
    if (!(await fs.pathExists(packageJsonPath))) {
      return null
    }

    try {
      return await fs.readJson(packageJsonPath)
    }
    catch (error) {
      console.error('读取 package.json 失败:', error)
      return null
    }
  }

  /**
   * 检查是否为 Monorepo
   */
  private async isMonorepo(): Promise<boolean> {
    // 检查 pnpm-workspace.yaml
    if (await fs.pathExists(path.join(this.projectPath, 'pnpm-workspace.yaml'))) {
      return true
    }

    // 检查 lerna.json
    if (await fs.pathExists(path.join(this.projectPath, 'lerna.json'))) {
      return true
    }

    // 检查 package.json 中的 workspaces 字段
    const packageJson = await this.readPackageJson()
    if (packageJson?.workspaces) {
      return true
    }

    return false
  }

  /**
   * 检查是否为 Git 仓库
   */
  private async isGitRepo(): Promise<boolean> {
    return fs.pathExists(path.join(this.projectPath, '.git'))
  }
}

/**
 * 获取项目类型的友好名称
 */
export function getProjectTypeLabel(type: ProjectType, category: ProjectCategory): string {
  const typeLabels: Record<ProjectType, string> = {
    vue: 'Vue',
    react: 'React',
    angular: 'Angular',
    svelte: 'Svelte',
    next: 'Next.js',
    nuxt: 'Nuxt',
    node: 'Node.js',
    monorepo: 'Monorepo',
    unknown: '',
  }

  const categoryLabels: Record<ProjectCategory, string> = {
    app: '项目',
    lib: '库',
    'app-lib': '项目/库',
    unknown: '未知',
  }

  const typeLabel = typeLabels[type]
  const categoryLabel = categoryLabels[category]

  return typeLabel ? `${typeLabel} ${categoryLabel}` : categoryLabel
}

