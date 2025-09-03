import { GitOperationResult } from '../types/index.js'
import { GitError, GitErrorType } from '../errors/index.js'
import { BaseGitOperation } from './BaseGitOperation.js'

/**
 * Git Stash 信息接口
 */
export interface GitStashInfo {
  index: number
  message: string
  branch: string
  hash: string
  date: string
}

/**
 * Git Stash 操作类
 * 提供完整的 stash 功能，包括保存、恢复、列表等操作
 */
export class GitStash extends BaseGitOperation {
  constructor(baseDir?: string, options?: any) {
    super(baseDir, options)
  }
  /**
   * 保存当前工作目录的更改到 stash
   * @param message - stash 消息
   * @param includeUntracked - 是否包含未跟踪的文件
   * @returns 操作结果
   */
  async save(message?: string, includeUntracked = false): Promise<GitOperationResult<GitStashInfo>> {
    try {
      const args = ['stash', 'push']

      if (message) {
        args.push('-m', message)
      }

      if (includeUntracked) {
        args.push('-u')
      }

      const result = await this.executeGitCommand(args)

      if (result.success) {
        // 获取最新的 stash 信息
        const stashList = await this.list()
        const latestStash = stashList.data?.[0]

        this.emit('stash-save', { message, includeUntracked, stash: latestStash })

        return {
          success: true,
          data: latestStash,
          output: result.output
        }
      }

      return result
    } catch (error: any) {
      const gitError = new GitError(
        GitErrorType.UNKNOWN,
        `Stash 保存失败: ${error?.message || error}`,
        error
      )
      this.emit('error', gitError)
      throw gitError
    }
  }

  /**
   * 恢复最新的 stash 并删除它
   * @param index - stash 索引，默认为 0（最新）
   * @returns 操作结果
   */
  async pop(index = 0): Promise<GitOperationResult<void>> {
    try {
      const stashRef = index === 0 ? 'stash@{0}' : `stash@{${index}}`
      const result = await this.executeGitCommand(['stash', 'pop', stashRef])

      if (result.success) {
        this.emit('stash-pop', { index })
      }

      return result
    } catch (error: any) {
      const gitError = new GitError(
        GitErrorType.UNKNOWN,
        `Stash 恢复失败: ${error?.message || error}`,
        error
      )
      this.emit('error', gitError)
      throw gitError
    }
  }

  /**
   * 应用 stash 但不删除它
   * @param index - stash 索引，默认为 0（最新）
   * @returns 操作结果
   */
  async apply(index = 0): Promise<GitOperationResult<void>> {
    try {
      const stashRef = index === 0 ? 'stash@{0}' : `stash@{${index}}`
      const result = await this.executeGitCommand(['stash', 'apply', stashRef])

      if (result.success) {
        this.emit('stash-apply', { index })
      }

      return result
    } catch (error: any) {
      const gitError = new GitError(
        GitErrorType.UNKNOWN,
        `Stash 应用失败: ${error?.message || error}`,
        error
      )
      this.emit('error', gitError)
      throw gitError
    }
  }

  /**
   * 列出所有 stash
   * @returns stash 列表
   */
  async list(): Promise<GitOperationResult<GitStashInfo[]>> {
    try {
      const result = await this.executeGitCommand(['stash', 'list', '--pretty=format:%gd|%s|%cr|%H'])

      if (result.success && result.output) {
        const stashes = result.output
          .split('\n')
          .filter(line => line.trim())
          .map((line, index) => {
            const [ref, message, date, hash] = line.split('|')
            return {
              index,
              message: message || 'WIP on branch',
              branch: ref.match(/stash@\{(\d+)\}/)?.[1] || '0',
              hash: hash || '',
              date: date || ''
            }
          })

        return {
          success: true,
          data: stashes,
          output: result.output
        }
      }

      return {
        success: true,
        data: [],
        output: result.output
      }
    } catch (error: any) {
      const gitError = new GitError(
        GitErrorType.UNKNOWN,
        `获取 stash 列表失败: ${error?.message || error}`,
        error
      )
      this.emit('error', gitError)
      throw gitError
    }
  }

  /**
   * 删除指定的 stash
   * @param index - stash 索引
   * @returns 操作结果
   */
  async drop(index = 0): Promise<GitOperationResult<void>> {
    try {
      const stashRef = index === 0 ? 'stash@{0}' : `stash@{${index}}`
      const result = await this.executeGitCommand(['stash', 'drop', stashRef])

      if (result.success) {
        this.emit('stash-drop', { index })
      }

      return result
    } catch (error: any) {
      const gitError = new GitError(
        GitErrorType.UNKNOWN,
        `删除 stash 失败: ${error?.message || error}`,
        error
      )
      this.emit('error', gitError)
      throw gitError
    }
  }

  /**
   * 清空所有 stash
   * @returns 操作结果
   */
  async clear(): Promise<GitOperationResult<void>> {
    try {
      const result = await this.executeGitCommand(['stash', 'clear'])

      if (result.success) {
        this.emit('stash-clear', {})
      }

      return result
    } catch (error: any) {
      const gitError = new GitError(
        GitErrorType.UNKNOWN,
        `清空 stash 失败: ${error?.message || error}`,
        error
      )
      this.emit('error', gitError)
      throw gitError
    }
  }

  /**
   * 检查是否有 stash
   * @returns 是否有 stash
   */
  async hasStash(): Promise<boolean> {
    try {
      const stashList = await this.list()
      return stashList.success && (stashList.data?.length || 0) > 0
    } catch (error: any) {
      return false
    }
  }

  /**
   * 显示 stash 的详细信息
   * @param index - stash 索引
   * @returns stash 详细信息
   */
  async show(index = 0): Promise<GitOperationResult<string>> {
    try {
      const stashRef = index === 0 ? 'stash@{0}' : `stash@{${index}}`
      const result = await this.executeGitCommand(['stash', 'show', '-p', stashRef])

      return result
    } catch (error: any) {
      const gitError = new GitError(
        GitErrorType.UNKNOWN,
        `显示 stash 详情失败: ${error?.message || error}`,
        error
      )
      this.emit('error', gitError)
      throw gitError
    }
  }
}
