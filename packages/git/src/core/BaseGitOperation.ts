import { EventEmitter } from 'events'
import { simpleGit, SimpleGit } from 'simple-git'
import { GitRepositoryOptions, GitOperationResult } from '../types/index.js'

/**
 * Git 操作基类
 * 提供通用的 Git 操作功能和事件处理
 */
export abstract class BaseGitOperation extends EventEmitter {
  protected git: SimpleGit
  protected baseDir: string
  protected options: GitRepositoryOptions

  constructor(baseDir?: string, options?: GitRepositoryOptions) {
    super()

    this.baseDir = baseDir || process.cwd()
    this.options = options || {}

    // 创建 simple-git 实例
    this.git = simpleGit({
      baseDir: this.baseDir,
      binary: this.options.binary || 'git',
      maxConcurrentProcesses: this.options.maxConcurrentProcesses || 5,
      timeout: {
        block: this.options.timeout || 30000
      }
    })
  }

  /**
   * 执行 Git 命令
   * @param args - Git 命令参数
   * @returns 操作结果
   */
  protected async executeGitCommand(args: string[]): Promise<GitOperationResult<any>> {
    try {
      const result = await this.git.raw(args)

      return {
        success: true,
        data: result,
        output: result
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || error,
        output: error?.message || error
      }
    }
  }

  /**
   * 获取基础目录
   */
  getBaseDir(): string {
    return this.baseDir
  }

  /**
   * 获取配置选项
   */
  getOptions(): GitRepositoryOptions {
    return { ...this.options }
  }
}
