/**
 * 增强的 Git 操作核心模块
 * 提供完整的 Git 操作封装，利用 @ldesign/kit 的功能
 */

import { 
  CommandRunner, 
  ConsoleLogger,
  ProgressBar,
  LoadingSpinner,
  FileSystem,
  PathUtils
} from '@ldesign/kit'
import { GitError, GitErrorType } from '../errors'
import type { 
  GitStatus, 
  GitCommit, 
  GitBranch,
  GitRemote,
  GitLogOptions,
  GitDiffOptions,
  GitMergeOptions
} from '../types'

/**
 * Git 操作类 - 封装所有 Git 命令操作
 */
export class GitOperations {
  private commandRunner: any
  private logger: any
  private repoPath: string

  constructor(repoPath: string = process.cwd(), logger?: any) {
    this.repoPath = PathUtils.resolve(repoPath)
    this.commandRunner = new CommandRunner()
    this.logger = logger || new ConsoleLogger({ level: 'info' })
    
    // 验证是否为 Git 仓库
    this.validateRepository()
  }

  /**
   * 验证是否为有效的 Git 仓库
   */
  private async validateRepository(): Promise<void> {
    const gitDir = PathUtils.join(this.repoPath, '.git')
    if (!await FileSystem.exists(gitDir)) {
      throw GitError.repositoryNotFound(this.repoPath)
    }
  }

  /**
   * 执行 Git 命令
   */
  public async exec(args: string[], options: { silent?: boolean } = {}): Promise<string> {
    const command = `git ${args.join(' ')}`
    
    if (!options.silent) {
      this.logger.debug(`Executing: ${command}`)
    }

    try {
      const result = await this.commandRunner.run(command, {
        cwd: this.repoPath,
        timeout: 60000
      })

      if (result.exitCode !== 0) {
        throw new GitError(
          GitErrorType.COMMAND_FAILED,
          `Git command failed: ${command}`,
          undefined,
          result.stderr
        )
      }

      return result.stdout.trim()
    } catch (error) {
      if (error instanceof GitError) {
        throw error
      }
      throw new GitError(
        GitErrorType.COMMAND_FAILED,
        `Failed to execute git command: ${command}`,
        error as Error
      )
    }
  }

  /**
   * 获取仓库状态
   */
  async status(options: { short?: boolean } = {}): Promise<GitStatus> {
    const args = ['status', '--porcelain=v1']
    if (!options.short) {
      args.push('-b')
    }

    const output = await this.exec(args)
    const lines = output.split('\n').filter(Boolean)
    
    const status: GitStatus = {
      branch: '',
      ahead: 0,
      behind: 0,
      staged: [],
      modified: [],
      untracked: [],
      deleted: [],
      renamed: [],
      conflicted: []
    }

    for (const line of lines) {
      if (line.startsWith('##')) {
        // 解析分支信息
        const match = line.match(/## (.+?)(?:\.{3}(.+?))?(?:\s+\[(.+?)\])?$/)
        if (match) {
          status.branch = match[1]
          if (match[3]) {
            const ahead = match[3].match(/ahead (\d+)/)
            const behind = match[3].match(/behind (\d+)/)
            if (ahead) status.ahead = parseInt(ahead[1])
            if (behind) status.behind = parseInt(behind[1])
          }
        }
      } else {
        const file = line.substring(3)
        const x = line[0]
        const y = line[1]

        // 解析文件状态
        if (x === 'A' || y === 'A') status.staged.push(file)
        if (x === 'M' || y === 'M') status.modified.push(file)
        if (x === 'D' || y === 'D') status.deleted.push(file)
        if (x === 'R' || y === 'R') status.renamed.push(file)
        if (x === '?' && y === '?') status.untracked.push(file)
        if (x === 'U' || y === 'U') status.conflicted.push(file)
      }
    }

    return status
  }

  /**
   * 添加文件到暂存区
   */
  async add(files: string | string[] = '.'): Promise<void> {
    const fileList = Array.isArray(files) ? files : [files]
    
    const spinner = new LoadingSpinner({
      text: 'Adding files to staging area...'
    })
    spinner.start()

    try {
      await this.exec(['add', ...fileList])
      spinner.succeed('Files added successfully')
    } catch (error) {
      spinner.fail('Failed to add files')
      throw error
    }
  }

  /**
   * 提交更改
   */
  async commit(message: string, options: {
    amend?: boolean
    noEdit?: boolean
    signoff?: boolean
    author?: string
    date?: string
    allowEmpty?: boolean
  } = {}): Promise<string> {
    const args = ['commit']

    if (options.amend) args.push('--amend')
    if (options.noEdit) args.push('--no-edit')
    if (options.signoff) args.push('--signoff')
    if (options.author) args.push('--author', options.author)
    if (options.date) args.push('--date', options.date)
    if (options.allowEmpty) args.push('--allow-empty')

    if (!options.amend || !options.noEdit) {
      args.push('-m', message)
    }

    const spinner = new LoadingSpinner({
      text: 'Committing changes...'
    })
    spinner.start()

    try {
      const output = await this.exec(args)
      const commitHash = output.match(/\[.+? ([a-f0-9]+)\]/)?.[1] || ''
      spinner.succeed(`Committed successfully: ${commitHash}`)
      return commitHash
    } catch (error) {
      spinner.fail('Failed to commit')
      throw error
    }
  }

  /**
   * 推送到远程仓库
   */
  async push(options: {
    remote?: string
    branch?: string
    force?: boolean
    setUpstream?: boolean
    tags?: boolean
    all?: boolean
  } = {}): Promise<void> {
    const args = ['push']

    if (options.force) args.push('--force')
    if (options.setUpstream) args.push('--set-upstream')
    if (options.tags) args.push('--tags')
    if (options.all) args.push('--all')

    if (options.remote) args.push(options.remote)
    if (options.branch) args.push(options.branch)

    const progressBar = new ProgressBar({
      total: 100,
      format: 'Pushing [{bar}] {percentage}% | {value}/{total}'
    })

    try {
      await this.exec(args, { silent: true })
      progressBar.update(100)
      progressBar.stop()
      this.logger.success('Push completed successfully')
    } catch (error) {
      progressBar.stop()
      throw error
    }
  }

  /**
   * 从远程仓库拉取
   */
  async pull(options: {
    remote?: string
    branch?: string
    rebase?: boolean
    noCommit?: boolean
    noFf?: boolean
    strategy?: string
  } = {}): Promise<void> {
    const args = ['pull']

    if (options.rebase) args.push('--rebase')
    if (options.noCommit) args.push('--no-commit')
    if (options.noFf) args.push('--no-ff')
    if (options.strategy) args.push('--strategy', options.strategy)

    if (options.remote) args.push(options.remote)
    if (options.branch) args.push(options.branch)

    const spinner = new LoadingSpinner({
      text: 'Pulling from remote...'
    })
    spinner.start()

    try {
      await this.exec(args)
      spinner.succeed('Pull completed successfully')
    } catch (error) {
      spinner.fail('Failed to pull')
      throw error
    }
  }

  /**
   * 获取提交日志
   */
  async log(options: GitLogOptions = {}): Promise<GitCommit[]> {
    const args = ['log', '--format=%H|%an|%ae|%at|%s|%b']

    if (options.maxCount) args.push('-n', options.maxCount.toString())
    if (options.since) args.push('--since', options.since)
    if (options.until) args.push('--until', options.until)
    if (options.author) args.push('--author', options.author)
    if (options.grep) args.push('--grep', options.grep)
    if (options.reverse) args.push('--reverse')
    if (options.oneline) args.push('--oneline')

    const output = await this.exec(args)
    const commits: GitCommit[] = []

    for (const line of output.split('\n').filter(Boolean)) {
      const [hash, author, email, timestamp, subject, body] = line.split('|')
      commits.push({
        hash,
        author,
        email,
        date: new Date(parseInt(timestamp) * 1000),
        subject,
        body: body || ''
      })
    }

    return commits
  }

  /**
   * 获取差异
   */
  async diff(options: GitDiffOptions = {}): Promise<string> {
    const args = ['diff']

    if (options.cached) args.push('--cached')
    if (options.nameOnly) args.push('--name-only')
    if (options.stat) args.push('--stat')
    if (options.numstat) args.push('--numstat')
    if (options.color) args.push('--color')
    if (options.noColor) args.push('--no-color')

    if (options.base) args.push(options.base)
    if (options.head) args.push(options.head)
    if (options.paths) args.push('--', ...options.paths)

    return await this.exec(args)
  }

  /**
   * 创建分支
   */
  async createBranch(name: string, options: {
    from?: string
    checkout?: boolean
    force?: boolean
  } = {}): Promise<void> {
    const args = options.checkout ? ['checkout', '-b'] : ['branch']

    if (options.force) args.push('-f')
    args.push(name)
    if (options.from) args.push(options.from)

    await this.exec(args)
    this.logger.success(`Branch '${name}' created successfully`)
  }

  /**
   * 切换分支
   */
  async checkout(target: string, options: {
    create?: boolean
    force?: boolean
    track?: boolean
  } = {}): Promise<void> {
    const args = ['checkout']

    if (options.create) args.push('-b')
    if (options.force) args.push('-f')
    if (options.track) args.push('--track')

    args.push(target)

    const spinner = new LoadingSpinner({
      text: `Switching to ${target}...`
    })
    spinner.start()

    try {
      await this.exec(args)
      spinner.succeed(`Switched to ${target}`)
    } catch (error) {
      spinner.fail(`Failed to switch to ${target}`)
      throw error
    }
  }

  /**
   * 合并分支
   */
  async merge(branch: string, options: GitMergeOptions = {}): Promise<void> {
    const args = ['merge']

    if (options.noCommit) args.push('--no-commit')
    if (options.noFf) args.push('--no-ff')
    if (options.ffOnly) args.push('--ff-only')
    if (options.squash) args.push('--squash')
    if (options.strategy) args.push('--strategy', options.strategy)
    if (options.message) args.push('-m', options.message)

    args.push(branch)

    const spinner = new LoadingSpinner({
      text: `Merging ${branch}...`
    })
    spinner.start()

    try {
      await this.exec(args)
      spinner.succeed(`Merged ${branch} successfully`)
    } catch (error) {
      spinner.fail(`Failed to merge ${branch}`)
      throw error
    }
  }

  /**
   * 变基操作
   */
  async rebase(options: {
    onto?: string
    interactive?: boolean
    continue?: boolean
    abort?: boolean
    skip?: boolean
  } = {}): Promise<void> {
    const args = ['rebase']

    if (options.interactive) args.push('-i')
    if (options.continue) args.push('--continue')
    if (options.abort) args.push('--abort')
    if (options.skip) args.push('--skip')
    if (options.onto) args.push(options.onto)

    await this.exec(args)
    this.logger.success('Rebase completed successfully')
  }

  /**
   * 获取所有分支
   */
  async branches(options: {
    all?: boolean
    remote?: boolean
    merged?: boolean
    noMerged?: boolean
  } = {}): Promise<GitBranch[]> {
    const args = ['branch']

    if (options.all) args.push('-a')
    if (options.remote) args.push('-r')
    if (options.merged) args.push('--merged')
    if (options.noMerged) args.push('--no-merged')

    args.push('-v')

    const output = await this.exec(args)
    const branches: GitBranch[] = []

    for (const line of output.split('\n').filter(Boolean)) {
      const current = line.startsWith('*')
      const name = line.substring(2).split(' ')[0]
      const remote = line.includes('remotes/')

      branches.push({
        name: name.replace('remotes/', ''),
        current,
        remote
      })
    }

    return branches
  }

  /**
   * 删除分支
   */
  async deleteBranch(name: string, options: {
    force?: boolean
    remote?: boolean
  } = {}): Promise<void> {
    if (options.remote) {
      const [remote, branch] = name.includes('/') ? name.split('/') : ['origin', name]
      await this.exec(['push', remote, '--delete', branch])
    } else {
      const args = ['branch', options.force ? '-D' : '-d', name]
      await this.exec(args)
    }
    
    this.logger.success(`Branch '${name}' deleted successfully`)
  }

  /**
   * 获取远程仓库列表
   */
  async remotes(): Promise<GitRemote[]> {
    const output = await this.exec(['remote', '-v'])
    const remotes: Map<string, GitRemote> = new Map()

    for (const line of output.split('\n').filter(Boolean)) {
      const [name, url, type] = line.split(/\s+/)
      
      if (!remotes.has(name)) {
        remotes.set(name, { name, fetchUrl: '', pushUrl: '' })
      }

      const remote = remotes.get(name)!
      if (type === '(fetch)') {
        remote.fetchUrl = url
      } else if (type === '(push)') {
        remote.pushUrl = url
      }
    }

    return Array.from(remotes.values())
  }

  /**
   * 添加远程仓库
   */
  async addRemote(name: string, url: string): Promise<void> {
    await this.exec(['remote', 'add', name, url])
    this.logger.success(`Remote '${name}' added successfully`)
  }

  /**
   * 删除远程仓库
   */
  async removeRemote(name: string): Promise<void> {
    await this.exec(['remote', 'remove', name])
    this.logger.success(`Remote '${name}' removed successfully`)
  }

  /**
   * 获取标签列表
   */
  async tags(pattern?: string): Promise<string[]> {
    const args = ['tag', '-l']
    if (pattern) args.push(pattern)

    const output = await this.exec(args)
    return output.split('\n').filter(Boolean)
  }

  /**
   * 创建标签
   */
  async createTag(name: string, options: {
    message?: string
    annotated?: boolean
    force?: boolean
    sign?: boolean
  } = {}): Promise<void> {
    const args = ['tag']

    if (options.annotated || options.message) args.push('-a')
    if (options.message) args.push('-m', options.message)
    if (options.force) args.push('-f')
    if (options.sign) args.push('-s')

    args.push(name)

    await this.exec(args)
    this.logger.success(`Tag '${name}' created successfully`)
  }

  /**
   * 删除标签
   */
  async deleteTag(name: string, options: {
    remote?: string
  } = {}): Promise<void> {
    await this.exec(['tag', '-d', name])
    
    if (options.remote) {
      await this.exec(['push', options.remote, '--delete', name])
    }
    
    this.logger.success(`Tag '${name}' deleted successfully`)
  }

  /**
   * 储藏工作区
   */
  async stash(options: {
    message?: string
    includeUntracked?: boolean
    keepIndex?: boolean
  } = {}): Promise<void> {
    const args = ['stash', 'push']

    if (options.message) args.push('-m', options.message)
    if (options.includeUntracked) args.push('-u')
    if (options.keepIndex) args.push('--keep-index')

    await this.exec(args)
    this.logger.success('Changes stashed successfully')
  }

  /**
   * 恢复储藏
   */
  async stashPop(index: number = 0): Promise<void> {
    await this.exec(['stash', 'pop', `stash@{${index}}`])
    this.logger.success('Stash applied successfully')
  }

  /**
   * 获取储藏列表
   */
  async stashList(): Promise<string[]> {
    const output = await this.exec(['stash', 'list'])
    return output.split('\n').filter(Boolean)
  }

  /**
   * 重置到指定提交
   */
  async reset(options: {
    mode?: 'soft' | 'mixed' | 'hard'
    target?: string
  } = {}): Promise<void> {
    const args = ['reset']

    if (options.mode) args.push(`--${options.mode}`)
    if (options.target) args.push(options.target)

    await this.exec(args)
    this.logger.success('Reset completed successfully')
  }

  /**
   * 清理工作区
   */
  async clean(options: {
    force?: boolean
    directories?: boolean
    ignored?: boolean
    dryRun?: boolean
  } = {}): Promise<void> {
    const args = ['clean']

    if (options.force) args.push('-f')
    if (options.directories) args.push('-d')
    if (options.ignored) args.push('-x')
    if (options.dryRun) args.push('-n')

    const output = await this.exec(args)
    
    if (options.dryRun) {
      this.logger.info('Files that would be removed:\n' + output)
    } else {
      this.logger.success('Working directory cleaned')
    }
  }

  /**
   * 获取配置
   */
  async getConfig(key: string, options: {
    global?: boolean
    local?: boolean
    system?: boolean
  } = {}): Promise<string> {
    const args = ['config']

    if (options.global) args.push('--global')
    if (options.local) args.push('--local')
    if (options.system) args.push('--system')

    args.push('--get', key)

    try {
      return await this.exec(args)
    } catch {
      return ''
    }
  }

  /**
   * 设置配置
   */
  async setConfig(key: string, value: string, options: {
    global?: boolean
    local?: boolean
    system?: boolean
  } = {}): Promise<void> {
    const args = ['config']

    if (options.global) args.push('--global')
    if (options.local) args.push('--local')
    if (options.system) args.push('--system')

    args.push(key, value)

    await this.exec(args)
    this.logger.success(`Config '${key}' set to '${value}'`)
  }

  /**
   * 克隆仓库
   */
  static async clone(url: string, destination?: string, options: {
    depth?: number
    branch?: string
    single?: boolean
    noCheckout?: boolean
    bare?: boolean
    mirror?: boolean
    recursive?: boolean
  } = {}): Promise<GitOperations> {
    const commandRunner = new CommandRunner()
    const spinner = new LoadingSpinner({
      text: `Cloning ${url}...`
    })
    spinner.start()

    const args = ['clone']

    if (options.depth) args.push('--depth', options.depth.toString())
    if (options.branch) args.push('--branch', options.branch)
    if (options.single) args.push('--single-branch')
    if (options.noCheckout) args.push('--no-checkout')
    if (options.bare) args.push('--bare')
    if (options.mirror) args.push('--mirror')
    if (options.recursive) args.push('--recursive')

    args.push(url)
    if (destination) args.push(destination)

    try {
      const result = await commandRunner.run(`git ${args.join(' ')}`, {
        timeout: 300000 // 5 minutes for clone
      })

      if (result.exitCode !== 0) {
        throw new GitError(
          GitErrorType.CLONE_FAILED,
          `Failed to clone repository: ${url}`,
          undefined,
          result.stderr
        )
      }

      spinner.succeed('Repository cloned successfully')

      const repoPath = destination || url.split('/').pop()?.replace('.git', '') || '.'
      return new GitOperations(repoPath)
    } catch (error) {
      spinner.fail('Failed to clone repository')
      throw error
    }
  }

  /**
   * 初始化仓库
   */
  static async init(path: string = '.', options: {
    bare?: boolean
    initialBranch?: string
  } = {}): Promise<GitOperations> {
    const commandRunner = new CommandRunner()
    const args = ['init']

    if (options.bare) args.push('--bare')
    if (options.initialBranch) args.push('--initial-branch', options.initialBranch)

    args.push(path)

    const result = await commandRunner.run(`git ${args.join(' ')}`, {
      cwd: path
    })

    if (result.exitCode !== 0) {
      throw new GitError(
        GitErrorType.COMMAND_FAILED,
        `Failed to initialize repository: ${path}`,
        undefined,
        result.stderr
      )
    }

    return new GitOperations(path)
  }

  /**
   * 获取当前分支名
   */
  async getCurrentBranch(): Promise<string> {
    return await this.exec(['rev-parse', '--abbrev-ref', 'HEAD'])
  }

  /**
   * 获取最新提交哈希
   */
  async getLatestCommit(): Promise<string> {
    return await this.exec(['rev-parse', 'HEAD'])
  }

  /**
   * 检查是否有未提交的更改
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.status()
    return status.staged.length > 0 || 
           status.modified.length > 0 || 
           status.deleted.length > 0 || 
           status.untracked.length > 0
  }

  /**
   * 获取文件的提交历史
   */
  async fileHistory(filePath: string, options: {
    maxCount?: number
    follow?: boolean
  } = {}): Promise<GitCommit[]> {

    const args = ['log', '--format=%H|%an|%ae|%at|%s|%b']
    if (options.follow) args.push('--follow')
    if (options.maxCount) args.push('-n', options.maxCount.toString())
    args.push('--', filePath)

    const output = await this.exec(args)
    const commits: GitCommit[] = []

    for (const line of output.split('\n').filter(Boolean)) {
      const [hash, author, email, timestamp, subject, body] = line.split('|')
      commits.push({
        hash,
        author,
        email,
        date: new Date(parseInt(timestamp) * 1000),
        subject,
        body: body || ''
      })
    }

    return commits
  }

  /**
   * 获取两个提交之间的差异文件列表
   */
  async getChangedFiles(from: string, to: string = 'HEAD'): Promise<string[]> {
    const output = await this.exec(['diff', '--name-only', from, to])
    return output.split('\n').filter(Boolean)
  }
}
