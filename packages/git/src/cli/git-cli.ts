#!/usr/bin/env node

/**
 * Git CLI 命令行工具
 * 提供完整的 Git 操作命令行界面
 */

import { Command } from 'commander'
import {
  Logger,
  ConsoleLogger,
  ConsoleTheme,
  PromptManager,
  ProgressBar,
  LoadingSpinner,
  MultiProgress
} from '@ldesign/kit'
import { GitOperations } from '../core/GitOperations'
import { SmartCommit, CommitType } from '../core/SmartCommit'
import { SmartSync } from '../core/SmartSync'
import { GitError } from '../errors'
import { version } from '../../package.json'
import chalk from 'chalk'
import Table from 'cli-table3'

/**
 * Git CLI 主类
 */
export class GitCLI {
  private program: Command
  private logger: Logger
  private theme: ConsoleTheme
  private promptManager: PromptManager
  private git?: GitOperations

  constructor() {
    this.program = new Command()
    this.logger = new ConsoleLogger({ level: 'info' })
    this.theme = new ConsoleTheme()
    this.promptManager = new PromptManager()
    
    this.setupCommands()
  }

  /**
   * 设置命令
   */
  private setupCommands(): void {
    this.program
      .name('lgit')
      .description('Enhanced Git CLI with smart features')
      .version(version)

    // 状态命令
    this.program
      .command('status')
      .alias('st')
      .description('Show working tree status with enhanced visualization')
      .option('-s, --short', 'Show short format')
      .action(async (options) => {
        await this.handleStatus(options)
      })

    // 智能提交命令
    this.program
      .command('commit')
      .alias('ci')
      .description('Smart commit with automatic message generation')
      .option('-m, --message <message>', 'Commit message')
      .option('-t, --type <type>', 'Commit type (feat, fix, docs, etc.)')
      .option('-s, --scope <scope>', 'Commit scope')
      .option('-b, --breaking', 'Mark as breaking change')
      .option('-i, --interactive', 'Interactive mode', true)
      .option('-a, --all', 'Stage all changes before commit')
      .option('--no-verify', 'Skip hooks')
      .action(async (options) => {
        await this.handleCommit(options)
      })

    // 批量提交命令
    this.program
      .command('batch-commit')
      .alias('bc')
      .description('Batch commit grouped changes')
      .option('-g, --group-by <type>', 'Group by: type, scope, directory', 'type')
      .option('-i, --interactive', 'Interactive mode for each group')
      .action(async (options) => {
        await this.handleBatchCommit(options)
      })

    // 智能同步命令
    this.program
      .command('sync')
      .description('Smart sync with remote repository')
      .option('-r, --remote <remote>', 'Remote name', 'origin')
      .option('-b, --branch <branch>', 'Branch name')
      .option('--rebase', 'Use rebase instead of merge')
      .option('--force', 'Force sync')
      .option('--auto-resolve', 'Auto resolve conflicts')
      .action(async (options) => {
        await this.handleSync(options)
      })

    // 分支管理命令
    this.program
      .command('branch [name]')
      .alias('br')
      .description('Enhanced branch management')
      .option('-l, --list', 'List branches')
      .option('-a, --all', 'Show all branches')
      .option('-r, --remote', 'Show remote branches')
      .option('-d, --delete <branch>', 'Delete branch')
      .option('-D, --force-delete <branch>', 'Force delete branch')
      .option('-c, --create', 'Create new branch')
      .option('--cleanup', 'Clean up merged branches')
      .action(async (name, options) => {
        await this.handleBranch(name, options)
      })

    // 交互式变基
    this.program
      .command('rebase')
      .alias('rb')
      .description('Interactive rebase with enhanced features')
      .option('-i, --interactive', 'Interactive mode')
      .option('-c, --continue', 'Continue rebase')
      .option('-a, --abort', 'Abort rebase')
      .option('-s, --skip', 'Skip current commit')
      .option('--onto <branch>', 'Rebase onto branch')
      .action(async (options) => {
        await this.handleRebase(options)
      })

    // 日志查看命令
    this.program
      .command('log')
      .alias('lg')
      .description('Enhanced log visualization')
      .option('-n, --number <count>', 'Number of commits to show', '10')
      .option('--graph', 'Show graph')
      .option('--oneline', 'Show oneline format')
      .option('--since <date>', 'Show commits since date')
      .option('--author <author>', 'Filter by author')
      .option('--grep <pattern>', 'Filter by message pattern')
      .action(async (options) => {
        await this.handleLog(options)
      })

    // 差异查看命令
    this.program
      .command('diff')
      .description('Enhanced diff visualization')
      .option('--cached', 'Show staged changes')
      .option('--name-only', 'Show only file names')
      .option('--stat', 'Show statistics')
      .option('--color', 'Show colored output', true)
      .action(async (options) => {
        await this.handleDiff(options)
      })

    // 储藏管理命令
    this.program
      .command('stash')
      .description('Enhanced stash management')
      .option('-l, --list', 'List stashes')
      .option('-s, --save <message>', 'Save stash with message')
      .option('-p, --pop [index]', 'Pop stash')
      .option('-a, --apply [index]', 'Apply stash')
      .option('-d, --drop [index]', 'Drop stash')
      .option('-c, --clear', 'Clear all stashes')
      .action(async (options) => {
        await this.handleStash(options)
      })

    // 标签管理命令
    this.program
      .command('tag [name]')
      .description('Enhanced tag management')
      .option('-l, --list [pattern]', 'List tags')
      .option('-a, --annotate', 'Create annotated tag')
      .option('-m, --message <message>', 'Tag message')
      .option('-d, --delete <tag>', 'Delete tag')
      .option('-f, --force', 'Force create/update tag')
      .action(async (name, options) => {
        await this.handleTag(name, options)
      })

    // 工作流命令
    this.program
      .command('workflow')
      .alias('wf')
      .description('Manage Git workflows')
      .option('--feature <name>', 'Start feature branch')
      .option('--hotfix <name>', 'Start hotfix branch')
      .option('--release <version>', 'Start release branch')
      .option('--finish', 'Finish current workflow')
      .action(async (options) => {
        await this.handleWorkflow(options)
      })

    // 统计命令
    this.program
      .command('stats')
      .description('Show repository statistics')
      .option('-a, --author <author>', 'Filter by author')
      .option('-s, --since <date>', 'Since date')
      .option('-u, --until <date>', 'Until date')
      .action(async (options) => {
        await this.handleStats(options)
      })

    // 配置管理命令
    this.program
      .command('config')
      .description('Manage Git configuration')
      .option('-l, --list', 'List all config')
      .option('-g, --global', 'Use global config')
      .option('-s, --set <key=value>', 'Set config value')
      .option('-u, --unset <key>', 'Unset config value')
      .action(async (options) => {
        await this.handleConfig(options)
      })
  }

  /**
   * 初始化 Git 操作实例
   */
  private async initGit(): Promise<GitOperations> {
    if (!this.git) {
      this.git = new GitOperations(process.cwd(), this.logger)
    }
    return this.git
  }

  /**
   * 处理状态命令
   */
  private async handleStatus(options: any): Promise<void> {
    try {
      const git = await this.initGit()
      const status = await git.status({ short: options.short })

      if (options.short) {
        this.displayShortStatus(status)
      } else {
        this.displayFullStatus(status)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 显示完整状态
   */
  private displayFullStatus(status: any): void {
    console.log(this.theme.header('\n📊 Repository Status\n'))
    
    // 分支信息
    console.log(chalk.bold('Branch:'), chalk.cyan(status.branch))
    if (status.ahead > 0 || status.behind > 0) {
      const ahead = status.ahead > 0 ? chalk.green(`↑${status.ahead}`) : ''
      const behind = status.behind > 0 ? chalk.red(`↓${status.behind}`) : ''
      console.log(chalk.bold('Remote:'), `${ahead} ${behind}`.trim())
    }
    console.log()

    // 文件状态表格
    const table = new Table({
      head: ['Status', 'Files', 'Count'],
      style: { head: ['cyan'] }
    })

    if (status.staged.length > 0) {
      table.push(['Staged', chalk.green(status.staged.join(', ')), status.staged.length])
    }
    if (status.modified.length > 0) {
      table.push(['Modified', chalk.yellow(status.modified.join(', ')), status.modified.length])
    }
    if (status.untracked.length > 0) {
      table.push(['Untracked', chalk.gray(status.untracked.join(', ')), status.untracked.length])
    }
    if (status.deleted.length > 0) {
      table.push(['Deleted', chalk.red(status.deleted.join(', ')), status.deleted.length])
    }
    if (status.renamed.length > 0) {
      table.push(['Renamed', chalk.blue(status.renamed.join(', ')), status.renamed.length])
    }
    if (status.conflicted.length > 0) {
      table.push(['Conflicted', chalk.magenta(status.conflicted.join(', ')), status.conflicted.length])
    }

    if (table.length > 0) {
      console.log(table.toString())
    } else {
      console.log(chalk.green('✓ Working tree clean'))
    }
  }

  /**
   * 显示简短状态
   */
  private displayShortStatus(status: any): void {
    const files = [
      ...status.staged.map((f: string) => chalk.green(`A ${f}`)),
      ...status.modified.map((f: string) => chalk.yellow(`M ${f}`)),
      ...status.deleted.map((f: string) => chalk.red(`D ${f}`)),
      ...status.renamed.map((f: string) => chalk.blue(`R ${f}`)),
      ...status.untracked.map((f: string) => chalk.gray(`? ${f}`)),
      ...status.conflicted.map((f: string) => chalk.magenta(`U ${f}`))
    ]

    files.forEach(file => console.log(file))
  }

  /**
   * 处理提交命令
   */
  private async handleCommit(options: any): Promise<void> {
    try {
      const git = await this.initGit()
      
      // 如果指定了 --all，先添加所有更改
      if (options.all) {
        await git.add('.')
      }

      const smartCommit = new SmartCommit(git, {
        useEmoji: true,
        useConventional: true,
        autoAnalyze: true,
        validate: !options.noVerify
      }, this.logger)

      const hash = await smartCommit.commit({
        message: options.message,
        type: options.type as CommitType,
        scope: options.scope,
        breaking: options.breaking,
        interactive: options.interactive
      })

      this.logger.success(`✅ Commit created: ${chalk.cyan(hash)}`)
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理批量提交命令
   */
  private async handleBatchCommit(options: any): Promise<void> {
    try {
      const git = await this.initGit()
      const smartCommit = new SmartCommit(git, {}, this.logger)

      const commits = await smartCommit.batchCommit({
        groupBy: options.groupBy,
        interactive: options.interactive
      })

      this.logger.success(`✅ Created ${commits.length} commits`)
      commits.forEach((hash, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${hash}`))
      })
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理同步命令
   */
  private async handleSync(options: any): Promise<void> {
    try {
      const git = await this.initGit()
      const smartSync = new SmartSync(git, this.logger)

      await smartSync.sync({
        remote: options.remote,
        branch: options.branch,
        rebase: options.rebase,
        force: options.force,
        autoMerge: options.autoResolve
      })

      this.logger.success('✅ Sync completed successfully')
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理分支命令
   */
  private async handleBranch(name: string | undefined, options: any): Promise<void> {
    try {
      const git = await this.initGit()

      // 删除分支
      if (options.delete || options.forceDelete) {
        const branch = options.delete || options.forceDelete
        await git.deleteBranch(branch, { force: !!options.forceDelete })
        return
      }

      // 清理合并的分支
      if (options.cleanup) {
        await this.cleanupBranches(git)
        return
      }

      // 创建分支
      if (name && options.create) {
        await git.createBranch(name, { checkout: true })
        return
      }

      // 列出分支
      const branches = await git.branches({
        all: options.all,
        remote: options.remote
      })

      this.displayBranches(branches)
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 清理已合并的分支
   */
  private async cleanupBranches(git: GitOperations): Promise<void> {
    const branches = await git.branches({ merged: true })
    const currentBranch = await git.getCurrentBranch()
    
    const toDelete = branches.filter(b => 
      !b.current && 
      !b.remote && 
      b.name !== 'main' && 
      b.name !== 'master' &&
      b.name !== 'develop'
    )

    if (toDelete.length === 0) {
      this.logger.info('No branches to clean up')
      return
    }

    console.log('Branches to delete:')
    toDelete.forEach(b => console.log(chalk.red(`  - ${b.name}`)))

    const confirm = await this.promptManager.confirm({
      message: `Delete ${toDelete.length} branches?`,
      default: false
    })

    if (confirm) {
      for (const branch of toDelete) {
        await git.deleteBranch(branch.name)
      }
      this.logger.success(`Deleted ${toDelete.length} branches`)
    }
  }

  /**
   * 显示分支列表
   */
  private displayBranches(branches: any[]): void {
    console.log(this.theme.header('\n🌿 Branches\n'))

    const table = new Table({
      head: ['', 'Name', 'Type'],
      style: { head: ['cyan'] }
    })

    branches.forEach(branch => {
      const current = branch.current ? chalk.green('*') : ' '
      const name = branch.current ? chalk.green(branch.name) : branch.name
      const type = branch.remote ? chalk.yellow('remote') : chalk.blue('local')
      table.push([current, name, type])
    })

    console.log(table.toString())
  }

  /**
   * 处理变基命令
   */
  private async handleRebase(options: any): Promise<void> {
    try {
      const git = await this.initGit()

      await git.rebase({
        onto: options.onto,
        interactive: options.interactive,
        continue: options.continue,
        abort: options.abort,
        skip: options.skip
      })

      this.logger.success('✅ Rebase completed')
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理日志命令
   */
  private async handleLog(options: any): Promise<void> {
    try {
      const git = await this.initGit()

      const commits = await git.log({
        maxCount: parseInt(options.number),
        since: options.since,
        author: options.author,
        grep: options.grep,
        oneline: options.oneline
      })

      this.displayCommits(commits, options)
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 显示提交历史
   */
  private displayCommits(commits: any[], options: any): void {
    console.log(this.theme.header('\n📜 Commit History\n'))

    if (options.oneline) {
      commits.forEach(commit => {
        console.log(`${chalk.yellow(commit.hash.substring(0, 7))} ${commit.subject}`)
      })
    } else {
      commits.forEach(commit => {
        console.log(chalk.yellow(`commit ${commit.hash}`))
        console.log(`Author: ${commit.author} <${commit.email}>`)
        console.log(`Date:   ${commit.date}`)
        console.log(`\n    ${commit.subject}`)
        if (commit.body) {
          console.log(`\n    ${commit.body}`)
        }
        console.log()
      })
    }
  }

  /**
   * 处理差异命令
   */
  private async handleDiff(options: any): Promise<void> {
    try {
      const git = await this.initGit()

      const diff = await git.diff({
        cached: options.cached,
        nameOnly: options.nameOnly,
        stat: options.stat,
        color: options.color
      })

      console.log(diff)
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理储藏命令
   */
  private async handleStash(options: any): Promise<void> {
    try {
      const git = await this.initGit()

      if (options.list) {
        const stashes = await git.stashList()
        if (stashes.length === 0) {
          console.log('No stashes found')
        } else {
          console.log(this.theme.header('\n📦 Stashes\n'))
          stashes.forEach(stash => console.log(stash))
        }
      } else if (options.save) {
        await git.stash({ message: options.save })
      } else if (options.pop !== undefined) {
        const index = typeof options.pop === 'string' ? parseInt(options.pop) : 0
        await git.stashPop(index)
      } else if (options.clear) {
        // Clear all stashes
        const stashes = await git.stashList()
        for (let i = stashes.length - 1; i >= 0; i--) {
          await git.exec(['stash', 'drop', `stash@{0}`])
        }
        this.logger.success('All stashes cleared')
      } else {
        // Default: save current changes
        await git.stash()
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理标签命令
   */
  private async handleTag(name: string | undefined, options: any): Promise<void> {
    try {
      const git = await this.initGit()

      if (options.delete) {
        await git.deleteTag(options.delete)
      } else if (options.list !== undefined) {
        const pattern = typeof options.list === 'string' ? options.list : undefined
        const tags = await git.tags(pattern)
        if (tags.length === 0) {
          console.log('No tags found')
        } else {
          console.log(this.theme.header('\n🏷️  Tags\n'))
          tags.forEach(tag => console.log(tag))
        }
      } else if (name) {
        await git.createTag(name, {
          message: options.message,
          annotated: options.annotated,
          force: options.force
        })
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理工作流命令
   */
  private async handleWorkflow(options: any): Promise<void> {
    try {
      const git = await this.initGit()
      const currentBranch = await git.getCurrentBranch()

      if (options.feature) {
        const branchName = `feature/${options.feature}`
        await git.createBranch(branchName, { checkout: true })
        this.logger.success(`Started feature: ${branchName}`)
      } else if (options.hotfix) {
        const branchName = `hotfix/${options.hotfix}`
        await git.createBranch(branchName, { from: 'main', checkout: true })
        this.logger.success(`Started hotfix: ${branchName}`)
      } else if (options.release) {
        const branchName = `release/${options.release}`
        await git.createBranch(branchName, { from: 'develop', checkout: true })
        this.logger.success(`Started release: ${branchName}`)
      } else if (options.finish) {
        await this.finishWorkflow(git, currentBranch)
      } else {
        console.log('Please specify a workflow action')
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 完成工作流
   */
  private async finishWorkflow(git: GitOperations, branch: string): Promise<void> {
    if (branch.startsWith('feature/')) {
      // 合并到 develop
      await git.checkout('develop')
      await git.merge(branch)
      await git.deleteBranch(branch)
      this.logger.success(`Feature ${branch} finished and merged to develop`)
    } else if (branch.startsWith('hotfix/')) {
      // 合并到 main 和 develop
      await git.checkout('main')
      await git.merge(branch)
      await git.checkout('develop')
      await git.merge(branch)
      await git.deleteBranch(branch)
      this.logger.success(`Hotfix ${branch} finished and merged to main and develop`)
    } else if (branch.startsWith('release/')) {
      // 合并到 main 和 develop
      await git.checkout('main')
      await git.merge(branch)
      const version = branch.split('/')[1]
      await git.createTag(`v${version}`, { annotated: true, message: `Release version ${version}` })
      await git.checkout('develop')
      await git.merge(branch)
      await git.deleteBranch(branch)
      this.logger.success(`Release ${branch} finished, tagged, and merged to main and develop`)
    } else {
      throw new GitError('Not in a workflow branch')
    }
  }

  /**
   * 处理统计命令
   */
  private async handleStats(options: any): Promise<void> {
    try {
      const git = await this.initGit()

      const commits = await git.log({
        since: options.since,
        until: options.until,
        author: options.author
      })

      const stats = this.calculateStats(commits)
      this.displayStats(stats)
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 计算统计信息
   */
  private calculateStats(commits: any[]): any {
    const authors = new Map<string, number>()
    const dayOfWeek = new Array(7).fill(0)
    const hourOfDay = new Array(24).fill(0)

    commits.forEach(commit => {
      // 按作者统计
      const count = authors.get(commit.author) || 0
      authors.set(commit.author, count + 1)

      // 按星期统计
      const day = commit.date.getDay()
      dayOfWeek[day]++

      // 按小时统计
      const hour = commit.date.getHours()
      hourOfDay[hour]++
    })

    return {
      total: commits.length,
      authors: Array.from(authors.entries()).sort((a, b) => b[1] - a[1]),
      dayOfWeek,
      hourOfDay
    }
  }

  /**
   * 显示统计信息
   */
  private displayStats(stats: any): void {
    console.log(this.theme.header('\n📈 Repository Statistics\n'))

    console.log(chalk.bold('Total Commits:'), stats.total)
    console.log()

    // 作者统计
    if (stats.authors.length > 0) {
      console.log(chalk.bold('Top Contributors:'))
      const table = new Table({
        head: ['Author', 'Commits', 'Percentage'],
        style: { head: ['cyan'] }
      })

      stats.authors.slice(0, 10).forEach(([author, count]: [string, number]) => {
        const percentage = ((count / stats.total) * 100).toFixed(1)
        table.push([author, count, `${percentage}%`])
      })

      console.log(table.toString())
    }

    // 活跃时间
    console.log('\n' + chalk.bold('Most Active Day:'))
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const maxDay = Math.max(...stats.dayOfWeek)
    const maxDayIndex = stats.dayOfWeek.indexOf(maxDay)
    console.log(`  ${days[maxDayIndex]} (${maxDay} commits)`)

    console.log('\n' + chalk.bold('Most Active Hour:'))
    const maxHour = Math.max(...stats.hourOfDay)
    const maxHourIndex = stats.hourOfDay.indexOf(maxHour)
    console.log(`  ${maxHourIndex}:00 (${maxHour} commits)`)
  }

  /**
   * 处理配置命令
   */
  private async handleConfig(options: any): Promise<void> {
    try {
      const git = await this.initGit()

      if (options.list) {
        const output = await git.exec(['config', '--list'])
        console.log(output)
      } else if (options.set) {
        const [key, value] = options.set.split('=')
        await git.setConfig(key, value, { global: options.global })
      } else if (options.unset) {
        await git.exec(['config', '--unset', options.unset])
        this.logger.success(`Config '${options.unset}' unset`)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: any): void {
    if (error instanceof GitError) {
      this.logger.error(`Git Error: ${error.message}`)
    } else {
      this.logger.error(`Error: ${error.message || error}`)
    }
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }

  /**
   * 运行 CLI
   */
  run(argv: string[]): void {
    this.program.parse(argv)
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const cli = new GitCLI()
  cli.run(process.argv)
}
