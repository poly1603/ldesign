/**
 * Workspace 依赖管理工具
 * 
 * 自动检测和构建 workspace 依赖包
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { PathUtils } from './path-utils'
import { FileSystem } from './file-system'
import { Logger } from './logger'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * 包信息接口
 */
export interface PackageInfo {
  /** 包名 */
  name: string
  /** 包路径 */
  path: string
  /** 是否已构建 */
  isBuilt: boolean
  /** 依赖的 workspace 包 */
  workspaceDeps: string[]
}

/**
 * Workspace 依赖管理器
 */
export class WorkspaceDepsManager {
  private logger: Logger
  private workspaceRoot: string
  private packagesCache: Map<string, PackageInfo> = new Map()

  constructor(cwd: string) {
    this.logger = new Logger('workspace-deps')
    this.workspaceRoot = this.findWorkspaceRoot(cwd)
  }

  /**
   * 查找 workspace 根目录
   */
  private findWorkspaceRoot(cwd: string): string {
    let current = cwd
    while (current !== PathUtils.dirname(current)) {
      const pnpmWorkspace = PathUtils.join(current, 'pnpm-workspace.yaml')
      const packageJson = PathUtils.join(current, 'package.json')

      try {
        const fs = require('fs')
        if (fs.existsSync(pnpmWorkspace) ||
          (fs.existsSync(packageJson) &&
            this.hasWorkspaces(packageJson))) {
          return current
        }
      } catch {
        // 继续查找
      }
      current = PathUtils.dirname(current)
    }
    return cwd
  }

  /**
   * 检查 package.json 是否包含 workspaces 配置
   */
  private hasWorkspaces(packageJsonPath: string): boolean {
    try {
      const fs = require('fs')
      const content = fs.readFileSync(packageJsonPath, 'utf-8')
      const pkg = JSON.parse(content)
      return !!pkg.workspaces
    } catch {
      return false
    }
  }

  /**
   * 获取所有 workspace 包
   */
  async getAllPackages(): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = []
    const packagesDir = PathUtils.join(this.workspaceRoot, 'packages')

    if (!await FileSystem.exists(packagesDir)) {
      return packages
    }

    const dirs = await FileSystem.readDir(packagesDir)

    for (const dir of dirs) {
      const pkgPath = PathUtils.join(packagesDir, dir)
      const packageJsonPath = PathUtils.join(pkgPath, 'package.json')

      if (await FileSystem.exists(packageJsonPath)) {
        const content = await FileSystem.readFile(packageJsonPath)
        const pkg = JSON.parse(content)

        const workspaceDeps = this.extractWorkspaceDeps(pkg)
        const isBuilt = await this.checkIfBuilt(pkgPath, pkg)

        const info: PackageInfo = {
          name: pkg.name,
          path: pkgPath,
          isBuilt,
          workspaceDeps
        }

        packages.push(info)
        this.packagesCache.set(pkg.name, info)
      }
    }

    return packages
  }

  /**
   * 提取 workspace 依赖
   */
  private extractWorkspaceDeps(pkg: any): string[] {
    const deps: string[] = []
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    }

    for (const [name, version] of Object.entries(allDeps)) {
      if (typeof version === 'string' && version.startsWith('workspace:')) {
        deps.push(name)
      }
    }

    return deps
  }

  /**
   * 检查包是否已构建
   */
  private async checkIfBuilt(pkgPath: string, pkg: any): Promise<boolean> {
    // 检查 exports 字段中的路径是否存在
    if (pkg.exports) {
      const mainExport = pkg.exports['.']
      if (mainExport) {
        const importPath = typeof mainExport === 'string'
          ? mainExport
          : mainExport.import || mainExport.default

        if (importPath) {
          const fullPath = PathUtils.join(pkgPath, importPath)
          return await FileSystem.exists(fullPath)
        }
      }
    }

    // 检查 main 字段
    if (pkg.main) {
      const mainPath = PathUtils.join(pkgPath, pkg.main)
      return await FileSystem.exists(mainPath)
    }

    // 检查常见的构建输出目录
    const commonDirs = ['dist', 'lib', 'es', 'esm', 'cjs']
    for (const dir of commonDirs) {
      const dirPath = PathUtils.join(pkgPath, dir)
      if (await FileSystem.exists(dirPath)) {
        const files = await FileSystem.readDir(dirPath)
        if (files.length > 0) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 检查项目的未构建依赖
   */
  async checkUnbuiltDeps(projectPath: string): Promise<string[]> {
    const packageJsonPath = PathUtils.join(projectPath, 'package.json')

    if (!await FileSystem.exists(packageJsonPath)) {
      return []
    }

    const content = await FileSystem.readFile(packageJsonPath)
    const pkg = JSON.parse(content)
    const workspaceDeps = this.extractWorkspaceDeps(pkg)

    if (workspaceDeps.length === 0) {
      return []
    }

    // 获取所有 workspace 包
    await this.getAllPackages()

    const unbuilt: string[] = []
    for (const dep of workspaceDeps) {
      const info = this.packagesCache.get(dep)
      if (info && !info.isBuilt) {
        unbuilt.push(dep)
      }
    }

    return unbuilt
  }

  /**
   * 构建指定的包
   */
  async buildPackage(packageName: string): Promise<boolean> {
    const info = this.packagesCache.get(packageName)
    if (!info) {
      this.logger.error(`包 ${packageName} 不存在`)
      return false
    }

    this.logger.info(`正在构建 ${packageName}...`)

    try {
      const { stdout, stderr } = await execAsync('pnpm run build', {
        cwd: info.path,
        env: { ...process.env }
      })

      if (stderr && !stderr.includes('WARN')) {
        this.logger.warn(`构建警告: ${stderr}`)
      }

      this.logger.success(`${packageName} 构建成功`)

      // 更新缓存
      info.isBuilt = true
      return true
    } catch (error) {
      this.logger.error(`${packageName} 构建失败: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 按依赖顺序构建多个包
   */
  async buildPackages(packageNames: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    const sorted = this.topologicalSort(packageNames)

    for (const name of sorted) {
      const success = await this.buildPackage(name)
      results.set(name, success)

      if (!success) {
        this.logger.warn(`${name} 构建失败，跳过后续依赖它的包`)
        break
      }
    }

    return results
  }

  /**
   * 拓扑排序（按依赖顺序）
   */
  private topologicalSort(packageNames: string[]): string[] {
    const sorted: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string) => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`检测到循环依赖: ${name}`)
      }

      visiting.add(name)
      const info = this.packagesCache.get(name)

      if (info) {
        for (const dep of info.workspaceDeps) {
          if (packageNames.includes(dep)) {
            visit(dep)
          }
        }
      }

      visiting.delete(name)
      visited.add(name)
      sorted.push(name)
    }

    for (const name of packageNames) {
      visit(name)
    }

    return sorted
  }
}

