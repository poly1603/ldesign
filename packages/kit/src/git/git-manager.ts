/**
 * Git 操作管理器
 */

import type {
  GitBranch,
  GitCommit,
  GitConfig,
  GitDiff,
  GitOptions,
  GitRemote,
  GitStatus,
  GitTag,
} from '../types'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Git 管理器
 */
export class GitManager {
  private cwd: string
  private options: Required<GitOptions>

  constructor(cwd: string = process.cwd(), options: GitOptions = {}) {
    this.cwd = cwd
    this.options = {
      timeout: options.timeout ?? 30000,
      encoding: options.encoding ?? 'utf8',
      maxBuffer: options.maxBuffer ?? 1024 * 1024, // 1MB
      ...options,
    }
  }

  /**
   * 执行 Git 命令
   */
  async exec(command: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`git ${command}`, {
        cwd: this.cwd,
        timeout: this.options.timeout,
        encoding: this.options.encoding,
        maxBuffer: this.options.maxBuffer,
      })
      return stdout.trim()
    }
    catch (error: any) {
      throw new Error(`Git command failed: ${error.message}`)
    }
  }

  /**
   * 检查是否为 Git 仓库
   */
  async isRepository(): Promise<boolean> {
    try {
      await this.exec('rev-parse --git-dir')
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 初始化 Git 仓库
   */
  async init(bare = false): Promise<void> {
    const command = bare ? 'init --bare' : 'init'
    await this.exec(command)
  }

  /**
   * 克隆仓库
   */
  async clone(
    url: string,
    directory?: string,
    options: {
      branch?: string
      depth?: number
      recursive?: boolean
    } = {},
  ): Promise<void> {
    let command = `clone ${url}`

    if (options.branch) {
      command += ` --branch ${options.branch}`
    }

    if (options.depth) {
      command += ` --depth ${options.depth}`
    }

    if (options.recursive) {
      command += ' --recursive'
    }

    if (directory) {
      command += ` ${directory}`
    }

    await this.exec(command)
  }

  /**
   * 获取仓库状态
   */
  async status(): Promise<GitStatus> {
    const output = await this.exec('status --porcelain=v1')
    const lines = output.split('\n').filter(line => line.trim())

    const status: GitStatus = {
      staged: [],
      unstaged: [],
      untracked: [],
      conflicted: [],
      clean: lines.length === 0,
    }

    for (const line of lines) {
      const statusCode = line.substring(0, 2)
      const filePath = line.substring(3)

      if (statusCode.includes('U') || (statusCode.includes('A') && statusCode.includes('A'))) {
        status.conflicted.push(filePath)
      }
      else if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
        status.staged.push(filePath)
      }
      else if (statusCode[1] !== ' ' && statusCode[1] !== '?') {
        status.unstaged.push(filePath)
      }
      else if (statusCode === '??') {
        status.untracked.push(filePath)
      }
    }

    return status
  }

  /**
   * 添加文件到暂存区
   */
  async add(files: string | string[] = '.'): Promise<void> {
    const fileList = Array.isArray(files) ? files.join(' ') : files
    await this.exec(`add ${fileList}`)
  }

  /**
   * 提交更改
   */
  async commit(
    message: string,
    options: {
      all?: boolean
      amend?: boolean
      author?: string
    } = {},
  ): Promise<string> {
    let command = `commit -m "${message}"`

    if (options.all) {
      command += ' -a'
    }

    if (options.amend) {
      command += ' --amend'
    }

    if (options.author) {
      command += ` --author="${options.author}"`
    }

    const output = await this.exec(command)

    // 提取提交哈希
    const match = output.match(/\[.+?\s([a-f0-9]+)\]/)
    return match?.[1] ?? ''
  }

  /**
   * 获取提交历史
   */
  async log(
    options: {
      limit?: number
      since?: string
      until?: string
      author?: string
      grep?: string
      oneline?: boolean
    } = {},
  ): Promise<GitCommit[]> {
    let command = 'log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso'

    if (options.limit) {
      command += ` -${options.limit}`
    }

    if (options.since) {
      command += ` --since="${options.since}"`
    }

    if (options.until) {
      command += ` --until="${options.until}"`
    }

    if (options.author) {
      command += ` --author="${options.author}"`
    }

    if (options.grep) {
      command += ` --grep="${options.grep}"`
    }

    const output = await this.exec(command)
    if (!output)
      return []

    return output.split('\n').map((line) => {
      const [hash = '', author = '', email = '', dateStr = '', message = ''] = line.split('|')
      return {
        hash,
        author,
        email,
        date: new Date(dateStr),
        message,
      }
    })
  }

  /**
   * 获取分支列表
   */
  async branches(
    options: {
      remote?: boolean
      all?: boolean
    } = {},
  ): Promise<GitBranch[]> {
    let command = 'branch'

    if (options.all) {
      command += ' -a'
    }
    else if (options.remote) {
      command += ' -r'
    }

    const output = await this.exec(command)
    if (!output)
      return []

    return output.split('\n').map((line) => {
      const trimmed = line.trim()
      const current = trimmed.startsWith('*')
      const name = current ? trimmed.substring(2) : trimmed

      return {
        name,
        current,
        remote: name.includes('origin/'),
      }
    })
  }

  /**
   * 创建分支
   */
  async createBranch(name: string, startPoint?: string): Promise<void> {
    let command = `branch ${name}`
    if (startPoint) {
      command += ` ${startPoint}`
    }
    await this.exec(command)
  }

  /**
   * 切换分支
   */
  async checkout(
    branch: string,
    options: {
      create?: boolean
      force?: boolean
    } = {},
  ): Promise<void> {
    let command = `checkout ${branch}`

    if (options.create) {
      command = `checkout -b ${branch}`
    }

    if (options.force) {
      command += ' -f'
    }

    await this.exec(command)
  }

  /**
   * 合并分支
   */
  async merge(
    branch: string,
    options: {
      noFf?: boolean
      squash?: boolean
      message?: string
    } = {},
  ): Promise<void> {
    let command = `merge ${branch}`

    if (options.noFf) {
      command += ' --no-ff'
    }

    if (options.squash) {
      command += ' --squash'
    }

    if (options.message) {
      command += ` -m "${options.message}"`
    }

    await this.exec(command)
  }

  /**
   * 删除分支
   */
  async deleteBranch(name: string, force = false): Promise<void> {
    const flag = force ? '-D' : '-d'
    await this.exec(`branch ${flag} ${name}`)
  }

  /**
   * 获取远程仓库列表
   */
  async remotes(verbose = false): Promise<GitRemote[]> {
    const command = verbose ? 'remote -v' : 'remote'
    const output = await this.exec(command)
    if (!output)
      return []

    if (verbose) {
      const lines = output.split('\n')
      const remotes = new Map<string, GitRemote>()

      for (const line of lines) {
        const [name, url, type] = line.split(/\s+/)
        if (!name || !url) {
          continue
        }
        if (!remotes.has(name)) {
          remotes.set(name, { name, url, type: type?.replace(/[()]/g, '') || '' })
        }
      }

      return Array.from(remotes.values())
    }
    else {
      return output.split('\n').map(name => ({ name, url: '', type: '' }))
    }
  }

  /**
   * 添加远程仓库
   */
  async addRemote(name: string, url: string): Promise<void> {
    await this.exec(`remote add ${name} ${url}`)
  }

  /**
   * 删除远程仓库
   */
  async removeRemote(name: string): Promise<void> {
    await this.exec(`remote remove ${name}`)
  }

  /**
   * 推送到远程仓库
   */
  async push(
    remote = 'origin',
    branch?: string,
    options: {
      force?: boolean
      setUpstream?: boolean
      tags?: boolean
    } = {},
  ): Promise<void> {
    let command = `push ${remote}`

    if (branch) {
      command += ` ${branch}`
    }

    if (options.force) {
      command += ' --force'
    }

    if (options.setUpstream) {
      command += ' --set-upstream'
    }

    if (options.tags) {
      command += ' --tags'
    }

    await this.exec(command)
  }

  /**
   * 从远程仓库拉取
   */
  async pull(
    remote = 'origin',
    branch?: string,
    options: {
      rebase?: boolean
      force?: boolean
    } = {},
  ): Promise<void> {
    let command = `pull ${remote}`

    if (branch) {
      command += ` ${branch}`
    }

    if (options.rebase) {
      command += ' --rebase'
    }

    if (options.force) {
      command += ' --force'
    }

    await this.exec(command)
  }

  /**
   * 获取标签列表
   */
  async tags(): Promise<GitTag[]> {
    const output = await this.exec('tag -l --sort=-version:refname')
    if (!output)
      return []

    return output.split('\n').map(name => ({ name }))
  }

  /**
   * 创建标签
   */
  async createTag(name: string, message?: string, commit?: string): Promise<void> {
    let command = `tag ${name}`

    if (message) {
      command += ` -m "${message}"`
    }

    if (commit) {
      command += ` ${commit}`
    }

    await this.exec(command)
  }

  /**
   * 删除标签
   */
  async deleteTag(name: string): Promise<void> {
    await this.exec(`tag -d ${name}`)
  }

  /**
   * 获取差异
   */
  async diff(
    options: {
      staged?: boolean
      commit1?: string
      commit2?: string
      file?: string
    } = {},
  ): Promise<GitDiff[]> {
    let command = 'diff'

    if (options.staged) {
      command += ' --staged'
    }

    if (options.commit1) {
      command += ` ${options.commit1}`
      if (options.commit2) {
        command += ` ${options.commit2}`
      }
    }

    if (options.file) {
      command += ` -- ${options.file}`
    }

    const output = await this.exec(command)

    // 简化的差异解析
    const diffs: GitDiff[] = []
    const lines = output.split('\n')

    let currentFile = ''
    let additions = 0
    let deletions = 0

    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        if (currentFile) {
          diffs.push({ file: currentFile, additions, deletions })
        }
        const parts = line.split(' ')
        const filePart = parts[3]?.substring(2) || ''
        currentFile = filePart
        additions = 0
        deletions = 0
      }
      else if (line.startsWith('+') && !line.startsWith('+++')) {
        additions++
      }
      else if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++
      }
    }

    if (currentFile) {
      diffs.push({ file: currentFile, additions, deletions })
    }

    return diffs
  }

  /**
   * 获取配置
   */
  async getConfig(key?: string): Promise<GitConfig | string> {
    if (key) {
      try {
        const value = await this.exec(`config ${key}`)
        return value
      }
      catch {
        return ''
      }
    }

    const output = await this.exec('config --list')
    const config: GitConfig = {}

    for (const line of output.split('\n')) {
      const [key, value] = line.split('=', 2)
      if (key && value) {
        config[key] = value
      }
    }

    return config
  }

  /**
   * 设置配置
   */
  async setConfig(key: string, value: string, global = false): Promise<void> {
    const scope = global ? '--global' : ''
    await this.exec(`config ${scope} ${key} "${value}"`)
  }

  /**
   * 获取当前分支
   */
  async getCurrentBranch(): Promise<string> {
    try {
      return await this.exec('branch --show-current')
    }
    catch {
      return 'HEAD'
    }
  }

  /**
   * 获取最新提交哈希
   */
  async getLatestCommit(): Promise<string> {
    return await this.exec('rev-parse HEAD')
  }

  /**
   * 检查工作目录是否干净
   */
  async isClean(): Promise<boolean> {
    const status = await this.status()
    return status.clean
  }

  /**
   * 创建 Git 管理器实例
   */
  static create(cwd?: string, options?: GitOptions): GitManager {
    return new GitManager(cwd, options)
  }
}
