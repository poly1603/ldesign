/**
 * Git 状态查询类
 * 提供状态查询、日志查看、差异比较等功能
 */

import { SimpleGit } from 'simple-git'
import { GitError } from '../errors/index.js'
import {
  wrapGitOperation,
  handleSimpleGitError,
  parseGitStatus,
  isValidGitHash,
  isValidGitRef
} from '../utils/index.js'
import {
  validateFilePath
} from '../utils/validation.js'
import type {
  GitOperationResult,
  GitStatusInfo,
  GitCommitInfo,
  GitLogOptions,
  GitEventType,
  GitEventListener
} from '../types/index.js'

/**
 * Git 状态查询类
 */
export class GitStatus {
  /** Simple Git 实例 */
  private git: SimpleGit
  /** 事件监听器 */
  private eventListeners: Map<GitEventType, GitEventListener[]> = new Map()

  /**
   * 构造函数
   * @param git Simple Git 实例
   * @param baseDir 仓库路径
   */
  constructor(git: SimpleGit, _baseDir: string) {
    this.git = git
  }

  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  public on(event: GitEventType, listener: GitEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  public off(event: GitEventType, listener: GitEventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  private emit(event: GitEventType, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }

  /**
   * 获取仓库状态
   * @returns 操作结果
   */
  public async getStatus(): Promise<GitOperationResult<GitStatusInfo>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('status')

        const statusResult = await this.git.status()
        const statusInfo = parseGitStatus(statusResult)

        this.emit('status', { success: true, status: statusInfo })

        return statusInfo
      } catch (error) {
        this.emit('error', { operation: 'status', error })
        throw handleSimpleGitError(error, 'status')
      }
    })
  }

  /**
   * 获取提交日志
   * @param options 日志选项
   * @returns 操作结果
   */
  public async getLog(options: GitLogOptions = {}): Promise<GitOperationResult<GitCommitInfo[]>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('log', { options })

        const logOptions: any = {}

        if (options.maxCount) {
          logOptions.maxCount = options.maxCount
        }

        if (options.from) {
          if (!isValidGitRef(options.from)) {
            throw GitError.invalidArgument('from', options.from)
          }
          logOptions.from = options.from
        }

        if (options.to) {
          if (!isValidGitRef(options.to)) {
            throw GitError.invalidArgument('to', options.to)
          }
          logOptions.to = options.to
        }

        if (options.file) {
          validateFilePath(options.file)
          logOptions.file = options.file
        }

        if (options.author) {
          logOptions.author = options.author
        }

        if (options.since) {
          logOptions.since = options.since
        }

        if (options.until) {
          logOptions.until = options.until
        }

        const logResult = await this.git.log(logOptions)

        const commits: GitCommitInfo[] = logResult.all.map(commit => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
          author_email: commit.author_email,
          committer_name: commit.author_name,
          committer_email: commit.author_email
        }))

        this.emit('log', { success: true, commits, options })

        return commits
      } catch (error) {
        this.emit('error', { operation: 'log', error })
        throw handleSimpleGitError(error, 'log')
      }
    })
  }

  /**
   * 获取文件差异
   * @param file 文件路径（可选）
   * @param cached 是否查看暂存区差异
   * @returns 操作结果
   */
  public async getDiff(file?: string, cached: boolean = false): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        if (file) {
          validateFilePath(file)
        }

        this.emit('diff', { file, cached })

        const diffOptions: string[] = []

        if (cached) {
          diffOptions.push('--cached')
        }

        if (file) {
          diffOptions.push(file)
        }

        const diffResult = await this.git.diff(diffOptions)

        this.emit('diff', { success: true, file, cached, diff: diffResult })

        return diffResult
      } catch (error) {
        this.emit('error', { operation: 'diff', error })
        throw handleSimpleGitError(error, 'diff')
      }
    })
  }

  /**
   * 比较两个提交之间的差异
   * @param fromCommit 起始提交
   * @param toCommit 结束提交
   * @param file 文件路径（可选）
   * @returns 操作结果
   */
  public async getDiffBetweenCommits(
    fromCommit: string,
    toCommit: string,
    file?: string
  ): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        if (!isValidGitRef(fromCommit)) {
          throw GitError.invalidArgument('fromCommit', fromCommit)
        }

        if (!isValidGitRef(toCommit)) {
          throw GitError.invalidArgument('toCommit', toCommit)
        }

        if (file) {
          validateFilePath(file)
        }

        this.emit('diff', { fromCommit, toCommit, file })

        const diffOptions = [`${fromCommit}..${toCommit}`]

        if (file) {
          diffOptions.push('--', file)
        }

        const diffResult = await this.git.diff(diffOptions)

        this.emit('diff', {
          success: true,
          fromCommit,
          toCommit,
          file,
          diff: diffResult
        })

        return diffResult
      } catch (error) {
        this.emit('error', { operation: 'diff-commits', error })
        throw handleSimpleGitError(error, 'diff-commits')
      }
    })
  }

  /**
   * 显示提交详情
   * @param commitHash 提交哈希
   * @returns 操作结果
   */
  public async show(commitHash: string): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        if (!isValidGitHash(commitHash)) {
          throw GitError.invalidArgument('commitHash', commitHash)
        }

        this.emit('show', { commitHash })

        const showResult = await this.git.show([commitHash])

        this.emit('show', { success: true, commitHash, content: showResult })

        return showResult
      } catch (error) {
        this.emit('error', { operation: 'show', error })
        throw handleSimpleGitError(error, 'show')
      }
    })
  }

  /**
   * 获取文件的提交历史
   * @param filePath 文件路径
   * @param maxCount 最大条数
   * @returns 操作结果
   */
  public async getFileHistory(
    filePath: string,
    maxCount?: number
  ): Promise<GitOperationResult<GitCommitInfo[]>> {
    return wrapGitOperation(async () => {
      try {
        validateFilePath(filePath)

        this.emit('log', { file: filePath, maxCount })

        const logOptions: any = {
          file: filePath
        }

        if (maxCount) {
          logOptions.maxCount = maxCount
        }

        const logResult = await this.git.log(logOptions)

        const commits: GitCommitInfo[] = logResult.all.map(commit => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
          author_email: commit.author_email,
          committer_name: commit.author_name,
          committer_email: commit.author_email,
          files: [filePath]
        }))

        this.emit('log', {
          success: true,
          file: filePath,
          commits,
          maxCount
        })

        return commits
      } catch (error) {
        this.emit('error', { operation: 'file-history', error })
        throw handleSimpleGitError(error, 'file-history')
      }
    })
  }

  /**
   * 获取统计信息
   * @param fromCommit 起始提交（可选）
   * @param toCommit 结束提交（可选）
   * @returns 操作结果
   */
  public async getStats(
    fromCommit?: string,
    toCommit?: string
  ): Promise<GitOperationResult<import('../types').GitStatsResult>> {
    return wrapGitOperation(async () => {
      try {
        if (fromCommit && !isValidGitRef(fromCommit)) {
          throw GitError.invalidArgument('fromCommit', fromCommit)
        }

        if (toCommit && !isValidGitRef(toCommit)) {
          throw GitError.invalidArgument('toCommit', toCommit)
        }

        const diffArgs: string[] = []
        if (fromCommit && toCommit) {
          diffArgs.push(`${fromCommit}..${toCommit}`)
        } else if (fromCommit) {
          diffArgs.push(fromCommit)
        }
        diffArgs.push('--numstat')

        const numstat = await this.git.diff(diffArgs)

        const files: import('../types').GitStatsFile[] = []
        let insertions = 0
        let deletions = 0

        const lines = numstat.split('\n').filter(Boolean)
        for (const line of lines) {
          // numstat format: additions\tdeletions\tpath
          const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/)
          if (!match) continue
          const add = match[1] === '-' ? 0 : parseInt(match[1], 10)
          const del = match[2] === '-' ? 0 : parseInt(match[2], 10)
          const file = match[3]
          files.push({ file, additions: add, deletions: del })
          insertions += add
          deletions += del
        }

        const result: import('../types').GitStatsResult = {
          fromCommit,
          toCommit,
          files,
          summary: {
            filesChanged: files.length,
            insertions,
            deletions
          },
          raw: numstat
        }

        return result
      } catch (error) {
        this.emit('error', { operation: 'stats', error })
        throw handleSimpleGitError(error, 'stats')
      }
    })
  }

  /**
   * 检查工作目录是否干净
   * @returns 工作目录是否干净
   */
  public async isClean(): Promise<boolean> {
    try {
      const statusResult = await this.getStatus()

      if (!statusResult.success || !statusResult.data) {
        return false
      }

      const status = statusResult.data

      return (
        status.staged.length === 0 &&
        status.not_added.length === 0 &&
        status.modified.length === 0 &&
        status.deleted.length === 0 &&
        status.conflicted.length === 0 &&
        status.created.length === 0
      )
    } catch {
      return false
    }
  }

  /**
   * 获取当前 HEAD 指向的提交
   * @returns 操作结果
   */
  public async getHead(): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        const headCommit = await this.git.revparse(['HEAD'])

        return headCommit.trim()
      } catch (error) {
        throw handleSimpleGitError(error, 'get-head')
      }
    })
  }
}
