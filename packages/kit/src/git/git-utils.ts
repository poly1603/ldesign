/**
 * Git 工具函数
 */

import type { GitFileStatus, GitRepositoryInfo } from '../types'
import { join } from 'node:path'
import { FileSystem } from '../filesystem'
import { GitManager } from './git-manager'

/**
 * Git 工具类
 */
export class GitUtils {
  /**
   * 查找 Git 仓库根目录
   */
  static async findRepositoryRoot(startPath: string = process.cwd()): Promise<string | null> {
    let currentPath = startPath

    while (currentPath !== '/') {
      const gitPath = join(currentPath, '.git')

      if (await FileSystem.exists(gitPath)) {
        return currentPath
      }

      const parentPath = join(currentPath, '..')
      if (parentPath === currentPath) {
        break
      }
      currentPath = parentPath
    }

    return null
  }

  /**
   * 获取仓库信息
   */
  static async getRepositoryInfo(path?: string): Promise<GitRepositoryInfo | null> {
    const repoRoot = path || (await this.findRepositoryRoot())
    if (!repoRoot)
      return null

    const git = GitManager.create(repoRoot)

    try {
      const [currentBranch, latestCommit, status, remotes, tags] = await Promise.all([
        git.getCurrentBranch(),
        git.getLatestCommit(),
        git.status(),
        git.remotes(true),
        git.tags(),
      ])

      const config = (await git.getConfig()) as Record<string, string>

      return {
        root: repoRoot,
        currentBranch,
        latestCommit,
        status,
        remotes,
        tags,
        config,
        isClean: status.clean,
      }
    }
    catch {
      return null
    }
  }

  /**
   * 检查文件是否被 Git 跟踪
   */
  static async isFileTracked(filePath: string, repoPath?: string): Promise<boolean> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return false

    const git = GitManager.create(repoRoot)

    try {
      await git.exec(`ls-files --error-unmatch "${filePath}"`)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取文件状态
   */
  static async getFileStatus(filePath: string, repoPath?: string): Promise<GitFileStatus | null> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return null

    const git = GitManager.create(repoRoot)

    try {
      const output = await git.exec(`status --porcelain=v1 "${filePath}"`)
      if (!output)
        return { status: 'unmodified', staged: false }

      const statusCode = output.substring(0, 2)
      const staged = statusCode[0] !== ' ' && statusCode[0] !== '?'

      let status: GitFileStatus['status'] = 'unmodified'

      if (statusCode === '??') {
        status = 'untracked'
      }
      else if (statusCode.includes('M')) {
        status = 'modified'
      }
      else if (statusCode.includes('A')) {
        status = 'added'
      }
      else if (statusCode.includes('D')) {
        status = 'deleted'
      }
      else if (statusCode.includes('R')) {
        status = 'renamed'
      }
      else if (statusCode.includes('C')) {
        status = 'copied'
      }
      else if (statusCode.includes('U')) {
        status = 'conflicted'
      }

      return { status, staged }
    }
    catch {
      return null
    }
  }

  /**
   * 获取文件的最后修改提交
   */
  static async getFileLastCommit(
    filePath: string,
    repoPath?: string,
  ): Promise<{
    hash: string
    author: string
    date: Date
    message: string
  } | null> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return null

    const git = GitManager.create(repoRoot)

    try {
      const output = await git.exec(
        `log -1 --pretty=format:"%H|%an|%ad|%s" --date=iso -- "${filePath}"`,
      )
      if (!output)
        return null

      const [hash = '', author = '', dateStr = '', message = ''] = output.split('|')
      return {
        hash,
        author,
        date: new Date(dateStr),
        message,
      }
    }
    catch {
      return null
    }
  }

  /**
   * 获取两个提交之间的文件变更
   */
  static async getFileChanges(
    commit1: string,
    commit2: string,
    repoPath?: string,
  ): Promise<
      Array<{
        file: string
        status: 'added' | 'modified' | 'deleted' | 'renamed'
        oldFile?: string
      }>
    > {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return []

    const git = GitManager.create(repoRoot)

    try {
      const output = await git.exec(`diff --name-status ${commit1} ${commit2}`)
      if (!output)
        return []

      return output.split('\n').map((line) => {
        const parts = line.split('\t')
        const statusCode = parts[0] || ''
        const file = parts[1] || ''
        const oldFile = parts[2]

        let status: 'added' | 'modified' | 'deleted' | 'renamed'

        switch (statusCode[0]) {
          case 'A':
            status = 'added'
            break
          case 'M':
            status = 'modified'
            break
          case 'D':
            status = 'deleted'
            break
          case 'R':
            status = 'renamed'
            break
          default:
            status = 'modified'
        }

        return {
          file,
          status,
          oldFile: status === 'renamed' ? oldFile : undefined,
        }
      })
    }
    catch {
      return []
    }
  }

  /**
   * 检查是否有未提交的更改
   */
  static async hasUncommittedChanges(repoPath?: string): Promise<boolean> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return false

    const git = GitManager.create(repoRoot)

    try {
      const status = await git.status()
      return !status.clean
    }
    catch {
      return false
    }
  }

  /**
   * 获取分支的提交数量
   */
  static async getBranchCommitCount(branch: string, repoPath?: string): Promise<number> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return 0

    const git = GitManager.create(repoRoot)

    try {
      const output = await git.exec(`rev-list --count ${branch}`)
      return Number.parseInt(output) || 0
    }
    catch {
      return 0
    }
  }

  /**
   * 检查分支是否存在
   */
  static async branchExists(branch: string, repoPath?: string): Promise<boolean> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return false

    const git = GitManager.create(repoRoot)

    try {
      await git.exec(`rev-parse --verify ${branch}`)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取分支的上游分支
   */
  static async getUpstreamBranch(branch?: string, repoPath?: string): Promise<string | null> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return null

    const git = GitManager.create(repoRoot)

    try {
      const branchName = branch || (await git.getCurrentBranch())
      const output = await git.exec(`rev-parse --abbrev-ref ${branchName}@{upstream}`)
      return output || null
    }
    catch {
      return null
    }
  }

  /**
   * 检查是否需要推送
   */
  static async needsPush(branch?: string, repoPath?: string): Promise<boolean> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return false

    const git = GitManager.create(repoRoot)

    try {
      const branchName = branch || (await git.getCurrentBranch())
      const upstream = await this.getUpstreamBranch(branchName, repoRoot)

      if (!upstream)
        return false

      const output = await git.exec(`rev-list --count ${upstream}..${branchName}`)
      return Number.parseInt(output) > 0
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否需要拉取
   */
  static async needsPull(branch?: string, repoPath?: string): Promise<boolean> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return false

    const git = GitManager.create(repoRoot)

    try {
      const branchName = branch || (await git.getCurrentBranch())
      const upstream = await this.getUpstreamBranch(branchName, repoRoot)

      if (!upstream)
        return false

      // 先获取远程更新
      await git.exec('fetch')

      const output = await git.exec(`rev-list --count ${branchName}..${upstream}`)
      return Number.parseInt(output) > 0
    }
    catch {
      return false
    }
  }

  /**
   * 获取 .gitignore 规则
   */
  static async getGitignoreRules(repoPath?: string): Promise<string[]> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return []

    const gitignorePath = join(repoRoot, '.gitignore')

    try {
      if (await FileSystem.exists(gitignorePath)) {
        const content = await FileSystem.readFile(gitignorePath)
        return content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'))
      }
    }
    catch {
      // 忽略错误
    }

    return []
  }

  /**
   * 检查文件是否被 .gitignore 忽略
   */
  static async isFileIgnored(filePath: string, repoPath?: string): Promise<boolean> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return false

    const git = GitManager.create(repoRoot)

    try {
      await git.exec(`check-ignore "${filePath}"`)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取仓库大小信息
   */
  static async getRepositorySize(repoPath?: string): Promise<{
    total: number
    objects: number
    packfiles: number
  } | null> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return null

    try {
      const gitDir = join(repoRoot, '.git')
      const stats = await FileSystem.stat(gitDir)

      // 简化的大小计算
      const objectsDir = join(gitDir, 'objects')
      const packDir = join(objectsDir, 'pack')

      let objectsSize = 0
      let packfilesSize = 0

      if (await FileSystem.exists(objectsDir)) {
        const objectsStats = await FileSystem.stat(objectsDir)
        objectsSize = objectsStats.size
      }

      if (await FileSystem.exists(packDir)) {
        const packStats = await FileSystem.stat(packDir)
        packfilesSize = packStats.size
      }

      return {
        total: stats.size,
        objects: objectsSize,
        packfiles: packfilesSize,
      }
    }
    catch {
      return null
    }
  }

  /**
   * 清理仓库
   */
  static async cleanup(repoPath?: string): Promise<void> {
    const repoRoot = repoPath || (await this.findRepositoryRoot())
    if (!repoRoot)
      return

    const git = GitManager.create(repoRoot)

    try {
      await git.exec('gc --auto')
    }
    catch {
      // 忽略清理错误
    }
  }
}
