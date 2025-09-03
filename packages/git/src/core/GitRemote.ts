/**
 * Git 远程仓库操作类
 * 提供远程仓库的添加、删除、推送、拉取等功能
 */

import { SimpleGit } from 'simple-git'
import { GitError } from '../errors/index.js'
import {
  wrapGitOperation,
  handleSimpleGitError
} from '../utils/index.js'
import {
  validateRemoteName,
  validateUrl,
  validateBranchName
} from '../utils/validation.js'
import type {
  GitOperationResult,
  GitRemoteInfo,
  GitPushOptions,
  GitPullOptions,
  GitEventType,
  GitEventListener
} from '../types/index.js'

/**
 * Git 远程仓库操作类
 */
export class GitRemote {
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
   * 添加远程仓库
   * @param name 远程仓库名称
   * @param url 远程仓库 URL
   * @returns 操作结果
   */
  public async add(name: string, url: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name)
        validateUrl(url)

        this.emit('remote', { action: 'add', name, url })

        await this.git.addRemote(name, url)

        this.emit('remote', {
          action: 'add',
          success: true,
          name,
          url
        })
      } catch (error) {
        this.emit('error', { operation: 'remote-add', error })
        throw handleSimpleGitError(error, 'remote-add')
      }
    })
  }

  /**
   * 删除远程仓库
   * @param name 远程仓库名称
   * @returns 操作结果
   */
  public async remove(name: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name)

        this.emit('remote', { action: 'remove', name })

        await this.git.removeRemote(name)

        this.emit('remote', {
          action: 'remove',
          success: true,
          name
        })
      } catch (error) {
        this.emit('error', { operation: 'remote-remove', error })
        throw handleSimpleGitError(error, 'remote-remove')
      }
    })
  }

  /**
   * 列出所有远程仓库
   * @param verbose 是否显示详细信息
   * @returns 操作结果
   */
  public async list(verbose: boolean = false): Promise<GitOperationResult<GitRemoteInfo[]>> {
    return wrapGitOperation(async () => {
      try {
        this.emit('remote', { action: 'list', verbose })

        const remotes = verbose ? await this.git.getRemotes(true) : await this.git.getRemotes(false)

        const remoteInfos: GitRemoteInfo[] = remotes.map(remote => ({
          name: remote.name,
          refs: {
            fetch: (remote as any).refs?.fetch || '',
            push: (remote as any).refs?.push || ''
          }
        }))

        this.emit('remote', {
          action: 'list',
          success: true,
          remotes: remoteInfos,
          verbose
        })

        return remoteInfos
      } catch (error) {
        this.emit('error', { operation: 'remote-list', error })
        throw handleSimpleGitError(error, 'remote-list')
      }
    })
  }

  /**
   * 获取远程仓库 URL
   * @param name 远程仓库名称
   * @returns 操作结果
   */
  public async getUrl(name: string): Promise<GitOperationResult<string>> {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name)

        const remotes = await this.git.getRemotes(true)
        const remote = remotes.find(r => r.name === name)

        if (!remote) {
          throw GitError.remoteNotFound(name)
        }

        return remote.refs?.fetch || ''
      } catch (error) {
        this.emit('error', { operation: 'remote-get-url', error })
        throw handleSimpleGitError(error, 'remote-get-url')
      }
    })
  }

  /**
   * 设置远程仓库 URL
   * @param name 远程仓库名称
   * @param url 新的 URL
   * @returns 操作结果
   */
  public async setUrl(name: string, url: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(name)
        validateUrl(url)

        this.emit('remote', { action: 'set-url', name, url })

        await this.git.remote(['set-url', name, url])

        this.emit('remote', {
          action: 'set-url',
          success: true,
          name,
          url
        })
      } catch (error) {
        this.emit('error', { operation: 'remote-set-url', error })
        throw handleSimpleGitError(error, 'remote-set-url')
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
        const remote = options.remote || 'origin'
        const branch = options.branch

        if (options.remote) {
          validateRemoteName(options.remote)
        }

        if (options.branch) {
          validateBranchName(options.branch)
        }

        this.emit('push', { options })

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

        this.emit('push', { success: true, remote, branch, options })
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
        const remote = options.remote || 'origin'
        const branch = options.branch

        if (options.remote) {
          validateRemoteName(options.remote)
        }

        if (options.branch) {
          validateBranchName(options.branch)
        }

        this.emit('pull', { options })

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

        this.emit('pull', { success: true, remote, branch, options })
      } catch (error) {
        this.emit('error', { operation: 'pull', error })
        throw handleSimpleGitError(error, 'pull')
      }
    })
  }

  /**
   * 获取远程分支
   * @param remoteName 远程仓库名称
   * @returns 操作结果
   */
  public async fetch(remoteName?: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        if (remoteName) {
          validateRemoteName(remoteName)
        }

        this.emit('remote', { action: 'fetch', remoteName })

        if (remoteName) {
          await this.git.fetch(remoteName)
        } else {
          await this.git.fetch()
        }

        this.emit('remote', {
          action: 'fetch',
          success: true,
          remoteName
        })
      } catch (error) {
        this.emit('error', { operation: 'fetch', error })
        throw handleSimpleGitError(error, 'fetch')
      }
    })
  }

  /**
   * 检查远程仓库是否存在
   * @param name 远程仓库名称
   * @returns 远程仓库是否存在
   */
  public async exists(name: string): Promise<boolean> {
    try {
      const remotesResult = await this.list()

      if (!remotesResult.success || !remotesResult.data) {
        return false
      }

      return remotesResult.data.some(remote => remote.name === name)
    } catch {
      return false
    }
  }

  /**
   * 重命名远程仓库
   * @param oldName 旧名称
   * @param newName 新名称
   * @returns 操作结果
   */
  public async rename(oldName: string, newName: string): Promise<GitOperationResult<void>> {
    return wrapGitOperation(async () => {
      try {
        validateRemoteName(oldName)
        validateRemoteName(newName)

        this.emit('remote', { action: 'rename', oldName, newName })

        await this.git.remote(['rename', oldName, newName])

        this.emit('remote', {
          action: 'rename',
          success: true,
          oldName,
          newName
        })
      } catch (error) {
        this.emit('error', { operation: 'remote-rename', error })
        throw handleSimpleGitError(error, 'remote-rename')
      }
    })
  }
}
