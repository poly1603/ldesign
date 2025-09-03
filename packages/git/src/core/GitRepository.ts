/**
 * Git 仓库操作核心类
 * 提供基础的 Git 操作功能，包括初始化、克隆、添加、提交、推送、拉取等
 */

import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import {
  wrapGitOperation,
  handleSimpleGitError,
  parseGitStatus,
  formatGitPath
} from '../utils/index.js'
import {
  validateRepositoryPath,
  validateCommitMessage,
  validateUrl,
  validateFilePath
} from '../utils/validation.js'
import type {
  GitRepositoryOptions,
  GitOperationResult,
  GitCommitInfo,
  GitStatusInfo,
  GitCloneOptions,
  GitPushOptions,
  GitPullOptions,
  GitLogOptions,
  GitEventType,
  GitEventListener
} from '../types/index.js'

/**
 * Git 仓库操作类
 */
export class GitRepository {
  /** Simple Git 实例 */
  private git: SimpleGit
  /** 仓库路径 */
  private readonly baseDir: string
  /** 配置选项 */
  private readonly options: GitRepositoryOptions
  /** 事件监听器 */
  private eventListeners: Map<GitEventType, GitEventListener[]> = new Map()

  /**
   * 构造函数
   * @param baseDir 仓库路径
   * @param options 配置选项
   */
  constructor(baseDir: string = process.cwd(), options: GitRepositoryOptions = {}) {
    validateRepositoryPath(baseDir)

    this.baseDir = baseDir
    this.options = { ...options }

    // 配置 Simple Git 选项
    const gitOptions: Partial<SimpleGitOptions> = {
      baseDir: this.baseDir,
      binary: this.options.binary || 'git',
      maxConcurrentProcesses: this.options.maxConcurrentProcesses || 5,
      timeout: {
        block: this.options.timeout || 30000
      }
    }

    this.git = simpleGit(gitOptions)
  }

  /**
   * 获取仓库路径
   */
  public getBaseDir(): string {
    return this.baseDir
  }

  /**
   * 获取配置选项
   */
  public getOptions(): GitRepositoryOptions {
    return { ...this.options }
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
   * 初始化 Git 仓库
   * @param bare 是否创建裸仓库
   * @returns 操作结果
   */
  public async init(bare: boolean = false): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('init', { baseDir: this.baseDir, bare })

        await this.git.init(bare)

        this.emit('init', { success: true, baseDir: this.baseDir, bare })
      } catch (error) {
        this.emit('error', { operation: 'init', error })
        throw handleSimpleGitError(error, 'init')
      }
    })
  }

  /**
   * 克隆远程仓库
   * @param repoUrl 仓库 URL
   * @param options 克隆选项
   * @returns 操作结果
   */
  public async clone(repoUrl: string, options: GitCloneOptions = {}): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateUrl(repoUrl)

        this.emit('clone', { repoUrl, options })

        const cloneOptions: string[] = []

        if (options.depth) {
          cloneOptions.push('--depth', options.depth.toString())
        }

        if (options.branch) {
          cloneOptions.push('--branch', options.branch)
        }

        if (options.singleBranch) {
          cloneOptions.push('--single-branch')
        }

        if (options.recursive) {
          cloneOptions.push('--recursive')
        }

        const targetDir = options.targetDir || this.baseDir
        await this.git.clone(repoUrl, targetDir, cloneOptions)

        this.emit('clone', { success: true, repoUrl, targetDir })
      } catch (error) {
        this.emit('error', { operation: 'clone', error })
        throw handleSimpleGitError(error, 'clone')
      }
    })
  }

  /**
   * 添加文件到暂存区
   * @param files 文件路径数组或单个文件路径
   * @returns 操作结果
   */
  public async add(files: string | string[]): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        const fileList = Array.isArray(files) ? files : [files]

        // 验证文件路径
        fileList.forEach(file => {
          if (file !== '.') {
            validateFilePath(file)
          }
        })

        this.emit('add', { files: fileList })

        // 格式化文件路径
        const formattedFiles = fileList.map(formatGitPath)
        await this.git.add(formattedFiles)

        this.emit('add', { success: true, files: fileList })
      } catch (error) {
        this.emit('error', { operation: 'add', error })
        throw handleSimpleGitError(error, 'add')
      }
    })
  }

  /**
   * 提交更改
   * @param message 提交消息
   * @param files 可选的文件列表
   * @returns 操作结果
   */
  public async commit(message: string, files?: string[]): Promise<GitOperationResult<GitCommitInfo>> {
    return wrapGitOperation(async () => {
      try {
        validateCommitMessage(message)

        this.emit('commit', { message, files })

        if (files && files.length > 0) {
          // 如果指定了文件，先添加到暂存区
          await this.add(files)
        }

        const result = await this.git.commit(message)

        const commitInfo: GitCommitInfo = {
          hash: result.commit,
          date: new Date().toISOString(),
          message: message,
          author_name: '',
          author_email: '',
          files: files || []
        }

        this.emit('commit', { success: true, commit: commitInfo })

        return commitInfo
      } catch (error) {
        this.emit('error', { operation: 'commit', error })
        throw handleSimpleGitError(error, 'commit')
      }
    })
  }

  /**
   * 推送到远程仓库
   * @param options 推送选项
   * @returns 操作结果
   */
  public async push(options: GitPushOptions = {}): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('push', { options })

        const remote = options.remote || 'origin'
        const branch = options.branch

        const pushOptions: any = {}

        if (options.force) {
          pushOptions['--force'] = null
        }

        if (options.setUpstream) {
          pushOptions['--set-upstream'] = null
        }

        if (options.tags) {
          pushOptions['--tags'] = null
        }

        if (branch) {
          await this.git.push(remote, branch, pushOptions)
        } else {
          await this.git.push(remote, pushOptions)
        }

        this.emit('push', { success: true, remote, branch })
      } catch (error) {
        this.emit('error', { operation: 'push', error })
        throw handleSimpleGitError(error, 'push')
      }
    })
  }

  /**
   * 从远程仓库拉取
   * @param options 拉取选项
   * @returns 操作结果
   */
  public async pull(options: GitPullOptions = {}): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('pull', { options })

        const remote = options.remote || 'origin'
        const branch = options.branch

        const pullOptions: any = {}

        if (options.rebase) {
          pullOptions['--rebase'] = null
        }

        if (options.force) {
          pullOptions['--force'] = null
        }

        if (branch) {
          await this.git.pull(remote, branch, pullOptions)
        } else {
          await this.git.pull(remote, pullOptions)
        }

        this.emit('pull', { success: true, remote, branch })
      } catch (error) {
        this.emit('error', { operation: 'pull', error })
        throw handleSimpleGitError(error, 'pull')
      }
    })
  }

  /**
   * 获取仓库状态
   * @returns 操作结果
   */
  public async status(): Promise<GitOperationResult<GitStatusInfo>> {
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
  public async log(options: GitLogOptions = {}): Promise<GitOperationResult<GitCommitInfo[]>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('log', { options })

        const logOptions: any = {}

        if (options.maxCount) {
          logOptions.maxCount = options.maxCount
        }

        if (options.from) {
          logOptions.from = options.from
        }

        if (options.to) {
          logOptions.to = options.to
        }

        if (options.file) {
          logOptions.file = options.file
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

        this.emit('log', { success: true, commits })

        return commits
      } catch (error) {
        this.emit('error', { operation: 'log', error })
        throw handleSimpleGitError(error, 'log')
      }
    })
  }

  /**
   * 检查是否为 Git 仓库
   * @returns 是否为 Git 仓库
   */
  public async isRepo(): Promise<boolean> {
    try {
      await this.git.checkIsRepo()
      return true
    } catch {
      return false
    }
  }

  /**
   * 执行原始 Git 命令
   * @param args Git 命令参数
   * @returns 操作结果
   */
  public async executeGitCommand(args: string[]): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        const result = await this.git.raw(args)
        return result
      } catch (error: any) {
        throw new Error(error?.message || error)
      }
    })
  }
}
