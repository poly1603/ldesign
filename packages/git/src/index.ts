/**
 * @ldesign/git - Git 操作封装库
 * 
 * 一个功能完整的 Git 操作封装库，提供面向对象的 API 接口
 * 支持基础 Git 操作、分支管理、状态查询、远程仓库操作等功能
 * 
 * @author ldesign
 * @version 0.1.0
 */

// 核心类导出
export {
  GitRepository,
  GitBranch,
  GitStatus,
  GitRemote
} from './core/index.js'

// 类型定义导出
export type {
  GitRepositoryOptions,
  GitCommitInfo,
  GitBranchInfo,
  GitStatusInfo,
  GitRemoteInfo,
  GitDiffInfo,
  GitTagInfo,
  GitCloneOptions,
  GitPushOptions,
  GitPullOptions,
  GitLogOptions,
  GitOperationResult,
  GitInstance,
  GitEventType,
  GitEventListener,
  GitConfigItem
} from './types/index.js'

// 错误类导出
export {
  GitError,
  GitErrorType
} from './errors/index.js'

// 工具函数导出
export {
  validateRepositoryPath,
  validateBranchName,
  validateRemoteName,
  validateUrl,
  validateCommitMessage,
  validateTagName,
  validateFilePath,
  validateEmail,
  validateUsername,
  wrapGitOperation,
  handleSimpleGitError,
  parseGitLog,
  parseGitStatus,
  parseGitBranches,
  formatGitPath,
  isValidGitHash,
  isValidGitRef
} from './utils/index.js'

/**
 * Git 操作管理器类
 * 整合所有 Git 操作功能的主要入口类
 */
import { GitRepository } from './core/GitRepository.js'
import { GitBranch } from './core/GitBranch.js'
import { GitStatus } from './core/GitStatus.js'
import { GitRemote } from './core/GitRemote.js'
import type { GitRepositoryOptions } from './types/index.js'

export class Git {
  /** Git 仓库操作实例 */
  public readonly repository: GitRepository
  /** Git 分支操作实例 */
  public readonly branch: GitBranch
  /** Git 状态查询实例 */
  public readonly status: GitStatus
  /** Git 远程仓库操作实例 */
  public readonly remote: GitRemote

  /**
   * 构造函数
   * @param baseDir 仓库路径
   * @param options 配置选项
   */
  constructor(baseDir?: string, options?: GitRepositoryOptions) {
    this.repository = new GitRepository(baseDir, options)
    
    // 获取 Simple Git 实例（通过私有属性访问）
    const git = (this.repository as any).git
    const repoBaseDir = this.repository.getBaseDir()
    
    this.branch = new GitBranch(git, repoBaseDir)
    this.status = new GitStatus(git, repoBaseDir)
    this.remote = new GitRemote(git, repoBaseDir)
  }

  /**
   * 创建 Git 实例的静态工厂方法
   * @param baseDir 仓库路径
   * @param options 配置选项
   * @returns Git 实例
   */
  static create(baseDir?: string, options?: GitRepositoryOptions): Git {
    return new Git(baseDir, options)
  }

  /**
   * 获取仓库路径
   */
  public getBaseDir(): string {
    return this.repository.getBaseDir()
  }

  /**
   * 获取配置选项
   */
  public getOptions(): GitRepositoryOptions {
    return this.repository.getOptions()
  }

  /**
   * 检查是否为 Git 仓库
   * @returns 是否为 Git 仓库
   */
  public async isRepo(): Promise<boolean> {
    return this.repository.isRepo()
  }

  /**
   * 快速初始化仓库
   * @param bare 是否创建裸仓库
   */
  public async init(bare?: boolean) {
    return this.repository.init(bare)
  }

  /**
   * 快速克隆仓库
   * @param repoUrl 仓库 URL
   * @param targetDir 目标目录
   */
  public async clone(repoUrl: string, targetDir?: string) {
    return this.repository.clone(repoUrl, { targetDir })
  }

  /**
   * 快速添加文件
   * @param files 文件路径
   */
  public async add(files: string | string[]) {
    return this.repository.add(files)
  }

  /**
   * 快速提交
   * @param message 提交消息
   * @param files 文件列表
   */
  public async commit(message: string, files?: string[]) {
    return this.repository.commit(message, files)
  }

  /**
   * 快速推送
   * @param remote 远程仓库名称
   * @param branch 分支名称
   */
  public async push(remote?: string, branch?: string) {
    return this.repository.push({ remote, branch })
  }

  /**
   * 快速拉取
   * @param remote 远程仓库名称
   * @param branch 分支名称
   */
  public async pull(remote?: string, branch?: string) {
    return this.repository.pull({ remote, branch })
  }

  /**
   * 快速获取状态
   */
  public async getStatus() {
    return this.status.getStatus()
  }

  /**
   * 快速获取日志
   * @param maxCount 最大条数
   */
  public async getLog(maxCount?: number) {
    return this.status.getLog({ maxCount })
  }

  /**
   * 快速创建分支
   * @param branchName 分支名称
   */
  public async createBranch(branchName: string) {
    return this.branch.create(branchName)
  }

  /**
   * 快速切换分支
   * @param branchName 分支名称
   */
  public async checkoutBranch(branchName: string) {
    return this.branch.checkout(branchName)
  }

  /**
   * 快速列出分支
   * @param includeRemote 是否包含远程分支
   */
  public async listBranches(includeRemote?: boolean) {
    return this.branch.list(includeRemote)
  }

  /**
   * 快速添加远程仓库
   * @param name 远程仓库名称
   * @param url 远程仓库 URL
   */
  public async addRemote(name: string, url: string) {
    return this.remote.add(name, url)
  }

  /**
   * 快速列出远程仓库
   */
  public async listRemotes() {
    return this.remote.list(true)
  }
}

// 默认导出
export default Git
