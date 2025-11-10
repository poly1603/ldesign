/**
 * 项目扫描器
 * @module core/project-scanner
 */

import fs from 'fs-extra'
import path from 'node:path'
import fg from 'fast-glob'
import { ProjectDetector } from './project-detector'
import type { ProjectInfo, ScanOptions, ProjectStats } from '../types'

/**
 * 项目扫描器
 * 
 * 用于扫描目录下的所有项目
 */
export class ProjectScanner {
  private readonly defaultIgnore = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.cache/**',
  ]

  /**
   * 扫描目录下的所有项目
   * 
   * @param directory - 要扫描的目录
   * @param options - 扫描选项
   * @returns 项目列表
   * 
   * @example
   * ```typescript
   * const scanner = new ProjectScanner()
   * const projects = await scanner.scan('/path/to/directory')
   * console.log(`找到 ${projects.length} 个项目`)
   * ```
   */
  async scan(directory: string, options: ScanOptions = {}): Promise<ProjectInfo[]> {
    const {
      maxDepth = 3,
      ignore = [],
      includeHidden = false,
    } = options

    console.log(`开始扫描目录: ${directory}`)

    // 查找所有 package.json 文件
    const packageJsonFiles = await fg('**/package.json', {
      cwd: directory,
      absolute: true,
      ignore: [...this.defaultIgnore, ...ignore],
      deep: maxDepth,
      dot: includeHidden,
    })

    console.log(`找到 ${packageJsonFiles.length} 个 package.json 文件`)

    // 获取每个项目的信息
    const projects: ProjectInfo[] = []

    for (const packageJsonFile of packageJsonFiles) {
      const projectPath = path.dirname(packageJsonFile)
      
      try {
        const detector = new ProjectDetector(projectPath)
        const info = await detector.getProjectInfo()
        projects.push(info)
      }
      catch (error) {
        console.error(`获取项目信息失败 (${projectPath}):`, error)
      }
    }

    // 按名称排序
    projects.sort((a, b) => a.name.localeCompare(b.name))

    return projects
  }

  /**
   * 扫描单个项目
   * 
   * @param projectPath - 项目路径
   * @returns 项目信息
   */
  async scanOne(projectPath: string): Promise<ProjectInfo | null> {
    try {
      const detector = new ProjectDetector(projectPath)
      return await detector.getProjectInfo()
    }
    catch (error) {
      console.error('扫描项目失败:', error)
      return null
    }
  }

  /**
   * 获取项目统计信息
   * 
   * @param projects - 项目列表
   * @returns 统计信息
   */
  getStats(projects: ProjectInfo[]): ProjectStats {
    const stats: ProjectStats = {
      total: projects.length,
      byType: {} as any,
      byPackageManager: {} as any,
      gitRepos: projects.filter(p => p.isGitRepo).length,
    }

    // 按类型统计
    for (const project of projects) {
      stats.byType[project.type] = (stats.byType[project.type] || 0) + 1
    }

    // 按包管理器统计
    for (const project of projects) {
      stats.byPackageManager[project.packageManager] =
        (stats.byPackageManager[project.packageManager] || 0) + 1
    }

    return stats
  }

  /**
   * 过滤项目
   * 
   * @param projects - 项目列表
   * @param filter - 过滤条件
   * @returns 过滤后的项目列表
   */
  filter(
    projects: ProjectInfo[],
    filter: {
      type?: ProjectType
      packageManager?: PackageManager
      hasGit?: boolean
      keyword?: string
    },
  ): ProjectInfo[] {
    return projects.filter((project) => {
      if (filter.type && project.type !== filter.type) {
        return false
      }

      if (filter.packageManager && project.packageManager !== filter.packageManager) {
        return false
      }

      if (filter.hasGit !== undefined && project.isGitRepo !== filter.hasGit) {
        return false
      }

      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        const searchText = `${project.name} ${project.description}`.toLowerCase()
        if (!searchText.includes(keyword)) {
          return false
        }
      }

      return true
    })
  }
}

