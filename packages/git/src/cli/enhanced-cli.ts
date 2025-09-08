#!/usr/bin/env node

/**
 * 增强版 Git CLI 工具
 * 提供交互式界面、美化输出和丰富功能
 */

import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import Table from 'cli-table3'
import boxen from 'boxen'
import gradient from 'gradient-string'
import figlet from 'figlet'
import { Git } from '../index.js'
import { ConflictResolver } from '../utils/ConflictResolver.js'
import { GitWorkflow } from '../core/GitWorkflow.js'
import { GitAnalyzer } from '../core/GitAnalyzer.js'
import { ConfigManager } from '../utils/ConfigManager.js'
import { GitHooksManager } from '../core/GitHooksManager.js'
import { BatchOperations } from '../core/BatchOperations.js'
import { InteractiveMode } from './InteractiveMode.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * CLI 配置接口
 */
interface CLIConfig {
  theme: {
    primary: string
    secondary: string
    success: string
    error: string
    warning: string
    info: string
  }
  aliases: Record<string, string>
  defaults: Record<string, any>
  features: {
    autoCorrect: boolean
    suggestions: boolean
    animations: boolean
    colors: boolean
    icons: boolean
  }
}

/**
 * 增强版 CLI 类
 */
export class EnhancedCLI {
  private program: Command
  private git: Git
  private config: ConfigManager
  private interactive: InteractiveMode
  private workflow: GitWorkflow
  private analyzer: GitAnalyzer
  private hooksManager: GitHooksManager
  private batchOps: BatchOperations
  private spinner?: ora.Ora
  private cliConfig: CLIConfig

  constructor() {
    this.program = new Command()
    const cwd = process.cwd()
    this.git = Git.create(cwd)
    this.config = new ConfigManager()
    this.interactive = new InteractiveMode(this.git)
    this.workflow = new GitWorkflow(this.git)
    this.analyzer = new GitAnalyzer(this.git)
    this.hooksManager = new GitHooksManager(this.git)
    this.batchOps = new BatchOperations(this.git)
    
    // 加载配置
    this.cliConfig = this.loadConfig()
    
    // 设置主题
    this.setupTheme()
    
    // 初始化命令
    this.setupCommands()
  }

  /**
   * 加载配置
   */
  private loadConfig(): CLIConfig {
    // Use sensible defaults for the CLI-specific appearance and features.
    return {
      theme: {
        primary: '#00bcd4',
        secondary: '#8bc34a',
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
      },
      aliases: {},
      defaults: {},
      features: {
        autoCorrect: true,
        suggestions: true,
        animations: true,
        colors: true,
        icons: true
      }
    }
  }

  /**
   * 设置主题
   */
  private setupTheme(): void {
    if (!this.cliConfig.features.colors) {
      chalk.level = 0
    }
  }

  /**
   * 显示 Logo
   */
  private async showLogo(): Promise<void> {
    if (!this.cliConfig.features.animations) return

    const logo = figlet.textSync('LDesign Git', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })

    console.log(gradient.rainbow(logo))
    console.log()
  }

  /**
   * 显示欢迎信息
   */
  private async showWelcome(): Promise<void> {
    await this.showLogo()

    const welcomeBox = boxen(
      chalk.cyan('🚀 欢迎使用 LDesign Git 增强版 CLI 工具 🚀\n\n') +
      chalk.gray('提供交互式界面、智能提示和丰富功能\n') +
      chalk.gray('使用 ') + chalk.yellow('lgit help') + chalk.gray(' 查看帮助信息\n') +
      chalk.gray('使用 ') + chalk.yellow('lgit interactive') + chalk.gray(' 进入交互模式\n') +
      chalk.gray('切换到经典模式： ') + chalk.yellow('lgit --classic ...') + chalk.gray(' 或 ') + chalk.yellow('LGIT_MODE=classic lgit ...'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#000000'
      }
    )

    console.log(welcomeBox)
  }

  /**
   * 设置命令
   */
  private setupCommands(): void {
    this.program
      .name('lgit')
      .description('增强版 Git CLI 工具')
      .version('2.0.0')
      .hook('preAction', async () => {
        // 在执行命令前显示欢迎信息
        if (process.argv.length === 2) {
          await this.showWelcome()
        }
      })

    // 交互模式
    this.program
      .command('interactive')
      .alias('i')
      .description('进入交互式模式')
      .action(async () => {
        await this.handleInteractive()
      })

    // 状态命令
    this.program
      .command('status')
      .alias('st')
      .description('显示增强版仓库状态')
      .option('-d, --detailed', '显示详细信息')
      .option('-b, --branch', '显示分支信息')
      .option('-r, --remote', '显示远程信息')
      .action(async (options) => {
        await this.handleStatus(options)
      })

    // 智能提交
    this.program
      .command('smart-commit [message]')
      .alias('sc')
      .description('智能提交（自动生成提交信息）')
      .option('-t, --type <type>', '提交类型')
      .option('-s, --scope <scope>', '影响范围')
      .option('-e, --emoji', '添加 emoji')
      .option('-a, --all', '提交所有更改')
      .option('-p, --push', '提交后自动推送')
      .action(async (message, options) => {
        await this.handleSmartCommit(message, options)
      })

    // 工作流管理
    this.program
      .command('workflow <action>')
      .alias('wf')
      .description('Git 工作流管理（GitFlow, GitHub Flow）')
      .option('-n, --name <name>', '分支名称')
      .option('-t, --type <type>', '工作流类型', 'gitflow')
      .action(async (action, options) => {
        await this.handleWorkflow(action, options)
      })

    // 分析命令
    this.program
      .command('analyze [type]')
      .alias('an')
      .description('仓库分析（统计、贡献者、热力图）')
      .option('-s, --since <date>', '开始日期')
      .option('-u, --until <date>', '结束日期')
      .option('-f, --format <format>', '输出格式', 'table')
      .action(async (type, options) => {
        await this.handleAnalyze(type, options)
      })

    // 批量操作
    this.program
      .command('batch <operation>')
      .alias('bt')
      .description('批量操作（cherry-pick, revert, branch）')
      .option('-c, --commits <commits...>', '提交列表')
      .option('-b, --branches <branches...>', '分支列表')
      .option('-f, --force', '强制执行')
      .action(async (operation, options) => {
        await this.handleBatch(operation, options)
      })

    // 冲突解决
    this.program
      .command('resolve-conflicts')
      .alias('rc')
      .description('智能冲突解决助手')
      .option('-s, --strategy <strategy>', '解决策略', 'interactive')
      .option('-v, --visual', '可视化模式')
      .action(async (options) => {
        await this.handleResolveConflicts(options)
      })

    // Git 钩子管理
    this.program
      .command('hooks <action>')
      .alias('hk')
      .description('Git 钩子管理')
      .option('-n, --name <name>', '钩子名称')
      .option('-s, --script <script>', '钩子脚本')
      .option('-l, --list', '列出所有钩子')
      .action(async (action, options) => {
        await this.handleHooks(action, options)
      })

    // 配置管理
    this.program
      .command('config <action> [key] [value]')
      .alias('cf')
      .description('CLI 配置管理')
      .action(async (action, key, value) => {
        await this.handleConfig(action, key, value)
      })

    // 快速操作
    this.program
      .command('quick <action>')
      .alias('q')
      .description('快速操作集合')
      .action(async (action) => {
        await this.handleQuick(action)
      })

    // 撤销操作
    this.program
      .command('undo [steps]')
      .alias('u')
      .description('撤销最近的操作')
      .option('-s, --soft', '软撤销')
      .option('-h, --hard', '硬撤销')
      .action(async (steps, options) => {
        await this.handleUndo(steps, options)
      })

    // 时光机
    this.program
      .command('timemachine')
      .alias('tm')
      .description('时光机 - 查看仓库历史变化')
      .option('-d, --date <date>', '指定日期')
      .option('-c, --commit <commit>', '指定提交')
      .action(async (options) => {
        await this.handleTimeMachine(options)
      })

    // 标签管理
    this.program
      .command('tags <action> [name]')
      .alias('tg')
      .description('增强版标签管理')
      .option('-m, --message <message>', '标签信息')
      .option('-f, --force', '强制操作')
      .option('-p, --push', '推送标签')
      .action(async (action, name, options) => {
        await this.handleTags(action, name, options)
      })

    // 别名管理
    this.program
      .command('alias <action> [name] [command]')
      .description('管理命令别名')
      .action(async (action, name, command) => {
        await this.handleAlias(action, name, command)
      })

    // 诊断命令
    this.program
      .command('doctor')
      .alias('dr')
      .description('诊断仓库问题')
      .action(async () => {
        await this.handleDoctor()
      })
  }

  /**
   * 处理交互模式
   */
  private async handleInteractive(): Promise<void> {
    await this.interactive.start()
  }

  /**
   * 处理状态命令
   */
  private async handleStatus(options: any): Promise<void> {
    this.spinner = ora('获取仓库状态...').start()

    try {
      const status = await this.git.getStatus()
      
      if (!status.success) {
        this.spinner.fail('获取状态失败')
        console.error(chalk.red(status.error))
        return
      }

      this.spinner.succeed('状态获取成功')

      // 创建状态表格
      const table = new Table({
        head: [
          chalk.cyan('类型'),
          chalk.cyan('文件'),
          chalk.cyan('状态')
        ],
        style: {
          head: [],
          border: ['cyan']
        }
      })

      // 添加已暂存文件
      status.data?.staged?.forEach((file: string) => {
        table.push([
          chalk.green('✓ 已暂存'),
          file,
          chalk.green('准备提交')
        ])
      })

      // 添加已修改文件
      status.data?.modified?.forEach((file: string) => {
        table.push([
          chalk.yellow('✎ 已修改'),
          file,
          chalk.yellow('未暂存')
        ])
      })

      // 添加未跟踪文件
      status.data?.not_added?.forEach((file: string) => {
        table.push([
          chalk.gray('? 未跟踪'),
          file,
          chalk.gray('新文件')
        ])
      })

      // 添加删除的文件
      status.data?.deleted?.forEach((file: string) => {
        table.push([
          chalk.red('✗ 已删除'),
          file,
          chalk.red('待确认')
        ])
      })

      // 添加冲突文件
      status.data?.conflicted?.forEach((file: string) => {
        table.push([
          chalk.red('⚠ 冲突'),
          file,
          chalk.red('需要解决')
        ])
      })

      if (table.length > 0) {
        console.log('\n' + table.toString())
      } else {
        console.log(chalk.green('\n✨ 工作目录干净，无待提交的更改'))
      }

      // 显示分支信息
      if (options.branch || options.detailed) {
        const branchInfo = await this.git.branch.current()
        if (branchInfo.success) {
          console.log(chalk.cyan(`\n📍 当前分支: ${branchInfo.data}`))
        }
      }

      // 显示远程信息
      if (options.remote || options.detailed) {
        const remotes = await this.git.listRemotes()
        if (remotes.success && (remotes.data?.length ?? 0) > 0) {
          console.log(chalk.cyan('\n🌐 远程仓库:'))
          remotes.data!.forEach((remote: any) => {
            console.log(`  ${chalk.yellow(remote.name)}: ${remote.refs?.fetch || 'N/A'}`)
          })
        }
      }

      // 显示统计信息
      if (options.detailed) {
        const stats = {
          staged: status.data?.staged?.length || 0,
          modified: status.data?.modified?.length || 0,
          untracked: status.data?.not_added?.length || 0,
          deleted: status.data?.deleted?.length || 0,
          conflicted: status.data?.conflicted?.length || 0
        }

        const statsBox = boxen(
          chalk.cyan('📊 统计信息\n\n') +
          `已暂存: ${chalk.green(stats.staged)}\n` +
          `已修改: ${chalk.yellow(stats.modified)}\n` +
          `未跟踪: ${chalk.gray(stats.untracked)}\n` +
          `已删除: ${chalk.red(stats.deleted)}\n` +
          `冲突: ${chalk.red(stats.conflicted)}`,
          {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'cyan'
          }
        )

        console.log('\n' + statsBox)
      }

    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 处理智能提交
   */
  private async handleSmartCommit(message?: string, options?: any): Promise<void> {
    try {
      // 如果没有提供消息，进入交互模式
      if (!message) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: '选择提交类型:',
            choices: [
              { name: '✨ feat: 新功能', value: 'feat' },
              { name: '🐛 fix: 修复bug', value: 'fix' },
              { name: '📝 docs: 文档更新', value: 'docs' },
              { name: '💄 style: 代码格式', value: 'style' },
              { name: '♻️ refactor: 重构', value: 'refactor' },
              { name: '⚡ perf: 性能优化', value: 'perf' },
              { name: '✅ test: 测试', value: 'test' },
              { name: '🔧 chore: 构建/工具', value: 'chore' }
            ]
          },
          {
            type: 'input',
            name: 'scope',
            message: '影响范围 (可选):',
            when: () => !options?.scope
          },
          {
            type: 'input',
            name: 'subject',
            message: '简短描述:',
            validate: (input) => input.length > 0 || '请输入描述'
          },
          {
            type: 'editor',
            name: 'body',
            message: '详细描述 (可选):'
          },
          {
            type: 'confirm',
            name: 'breaking',
            message: '是否包含破坏性变更?',
            default: false
          }
        ])

        // 构建提交消息
        const type = answers.type || options?.type
        const scope = answers.scope || options?.scope
        const emoji = this.getCommitEmoji(type)
        
        message = emoji + ' ' + type
        if (scope) {
          message += `(${scope})`
        }
        message += `: ${answers.subject}`
        
        if (answers.body) {
          message += `\n\n${answers.body}`
        }
        
        if (answers.breaking) {
          message += '\n\nBREAKING CHANGE: '
        }
      }

      // 如果需要添加所有文件
      if (options?.all) {
        await this.git.add('.')
      }

      // 执行提交
      this.spinner = ora('正在提交...').start()
      const result = await this.git.commit(message)

      if (result.success) {
        this.spinner.succeed('提交成功!')
        console.log(chalk.green(`✅ 提交哈希: ${result.data?.hash}`))

        // 如果需要推送
        if (options?.push) {
          this.spinner = ora('正在推送...').start()
          const pushResult = await this.git.push()
          if (pushResult.success) {
            this.spinner.succeed('推送成功!')
          } else {
            this.spinner.fail('推送失败')
            console.error(chalk.red(pushResult.error))
          }
        }
      } else {
        this.spinner.fail('提交失败')
        console.error(chalk.red(result.error))
      }

    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 获取提交类型对应的 emoji
   */
  private getCommitEmoji(type: string): string {
    const emojiMap: Record<string, string> = {
      feat: '✨',
      fix: '🐛',
      docs: '📝',
      style: '💄',
      refactor: '♻️',
      perf: '⚡',
      test: '✅',
      chore: '🔧',
      revert: '⏪',
      build: '📦',
      ci: '👷',
      wip: '🚧'
    }
    return emojiMap[type] || '📝'
  }

  /**
   * 处理工作流
   */
  private async handleWorkflow(action: string, options: any): Promise<void> {
    await this.workflow.handle(action, options)
  }

  /**
   * 处理分析
   */
  private async handleAnalyze(type: string = 'all', options: any): Promise<void> {
    await this.analyzer.analyze(type, options)
  }

  /**
   * 处理批量操作
   */
  private async handleBatch(operation: string, options: any): Promise<void> {
    await this.batchOps.execute(operation, options)
  }

  /**
   * 处理冲突解决
   */
  private async handleResolveConflicts(options: any): Promise<void> {
    const resolver = new ConflictResolver(this.git)
    
    if (options.visual) {
      // 启动可视化冲突解决界面
      await this.interactive.resolveConflictsVisual()
    } else {
      // 使用策略解决
      const result = await resolver.resolveConflicts({
        strategy: options.strategy || 'manual',
        autoResolve: options.strategy !== 'manual'
      })

      if (result.resolved) {
        console.log(chalk.green('✅ 所有冲突已解决'))
      } else {
        console.log(chalk.yellow('⚠️ 还有未解决的冲突:'))
        result.unresolvedFiles.forEach(file => {
          console.log(chalk.red(`  - ${file}`))
        })
      }
    }
  }

  /**
   * 处理钩子管理
   */
  private async handleHooks(action: string, options: any): Promise<void> {
    await this.hooksManager.manage(action, options)
  }

  /**
   * 处理配置
   */
  private async handleConfig(action: string, key?: string, value?: string): Promise<void> {
    switch (action) {
      case 'get':
        if (key) {
          const val = this.config.get(key)
          console.log(val || chalk.yellow('未设置'))
        } else {
          console.log(this.config.getAll())
        }
        break

      case 'set':
        if (key && value) {
          this.config.set(key, value)
          console.log(chalk.green(`✅ 已设置 ${key} = ${value}`))
        } else {
          console.error(chalk.red('请提供键和值'))
        }
        break

      case 'list':
        const all = this.config.getAll()
        console.log(chalk.cyan('当前配置:'))
        console.log(JSON.stringify(all, null, 2))
        break

      case 'reset':
        this.config.reset()
        console.log(chalk.green('✅ 配置已重置'))
        break

      default:
        console.error(chalk.red('未知操作'))
    }
  }

  /**
   * 处理快速操作
   */
  private async handleQuick(action: string): Promise<void> {
    const quickActions: Record<string, () => Promise<void>> = {
      'save': async () => {
        // 快速保存：添加所有文件并提交
        await this.git.add('.')
        const message = `Quick save at ${new Date().toLocaleString()}`
        await this.git.commit(message)
        console.log(chalk.green('✅ 快速保存完成'))
      },
      'sync': async () => {
        // 快速同步：拉取、合并、推送
        await this.git.pull()
        await this.git.push()
        console.log(chalk.green('✅ 快速同步完成'))
      },
      'clean': async () => {
        // 快速清理：删除未跟踪文件
        await execAsync('git clean -fd')
        console.log(chalk.green('✅ 清理完成'))
      },
      'amend': async () => {
        // 快速修改最后一次提交
        await execAsync('git commit --amend --no-edit')
        console.log(chalk.green('✅ 提交已修改'))
      }
    }

    const fn = quickActions[action]
    if (fn) {
      await fn()
    } else {
      console.error(chalk.red(`未知的快速操作: ${action}`))
      console.log(chalk.cyan('可用操作: save, sync, clean, amend'))
    }
  }

  /**
   * 处理撤销
   */
  private async handleUndo(steps: string = '1', options: any): Promise<void> {
    const numSteps = parseInt(steps)
    
    if (options.hard) {
      await execAsync(`git reset --hard HEAD~${numSteps}`)
      console.log(chalk.green(`✅ 已硬撤销 ${numSteps} 个提交`))
    } else if (options.soft) {
      await execAsync(`git reset --soft HEAD~${numSteps}`)
      console.log(chalk.green(`✅ 已软撤销 ${numSteps} 个提交`))
    } else {
      await execAsync(`git reset HEAD~${numSteps}`)
      console.log(chalk.green(`✅ 已撤销 ${numSteps} 个提交`))
    }
  }

  /**
   * 处理时光机
   */
  private async handleTimeMachine(options: any): Promise<void> {
    void options
    // 实现仓库历史浏览功能
    console.log(chalk.cyan('🕰️ 时光机功能开发中...'))
  }

  /**
   * 处理标签
   */
  private async handleTags(action: string, name?: string, options?: any): Promise<void> {
    switch (action) {
      case 'list':
        const tags = await execAsync('git tag -l')
        console.log(chalk.cyan('标签列表:'))
        console.log(tags.stdout)
        break

      case 'create':
        if (!name) {
          console.error(chalk.red('请提供标签名称'))
          return
        }
        const message = options?.message || `Tag ${name}`
        await execAsync(`git tag -a ${name} -m "${message}"`)
        console.log(chalk.green(`✅ 标签 ${name} 已创建`))
        
        if (options?.push) {
          await execAsync(`git push origin ${name}`)
          console.log(chalk.green('✅ 标签已推送'))
        }
        break

      case 'delete':
        if (!name) {
          console.error(chalk.red('请提供标签名称'))
          return
        }
        await execAsync(`git tag -d ${name}`)
        console.log(chalk.green(`✅ 标签 ${name} 已删除`))
        break

      default:
        console.error(chalk.red('未知操作'))
    }
  }

  /**
   * 处理别名
   */
  private async handleAlias(action: string, name?: string, command?: string): Promise<void> {
    switch (action) {
      case 'add':
        if (!name || !command) {
          console.error(chalk.red('请提供别名和命令'))
          return
        }
        this.config.setAlias(name, command)
        console.log(chalk.green(`✅ 别名 ${name} 已添加`))
        break

      case 'remove':
        if (!name) {
          console.error(chalk.red('请提供别名'))
          return
        }
        this.config.removeAlias(name)
        console.log(chalk.green(`✅ 别名 ${name} 已删除`))
        break

      case 'list':
        const aliases = this.config.getAliases()
        console.log(chalk.cyan('命令别名:'))
        Object.entries(aliases).forEach(([alias, cmd]) => {
          console.log(`  ${chalk.yellow(alias)} => ${cmd}`)
        })
        break

      default:
        console.error(chalk.red('未知操作'))
    }
  }

  /**
   * 处理诊断
   */
  private async handleDoctor(): Promise<void> {
    console.log(chalk.cyan('🔍 开始诊断仓库...'))
    
    const checks = [
      {
        name: 'Git 安装',
        check: async () => {
          try {
            await execAsync('git --version')
            return { ok: true, message: '已安装' }
          } catch {
            return { ok: false, message: '未安装' }
          }
        }
      },
      {
        name: '仓库状态',
        check: async () => {
          const isRepo = await this.git.isRepo()
          return { ok: isRepo, message: isRepo ? '正常' : '不是 Git 仓库' }
        }
      },
      {
        name: '远程连接',
        check: async () => {
          try {
            const remotes = await this.git.listRemotes()
            return { ok: remotes.success, message: '正常' }
          } catch {
            return { ok: false, message: '无法连接' }
          }
        }
      },
      {
        name: '工作目录',
        check: async () => {
          const status = await this.git.getStatus()
          const clean = status.data?.staged?.length === 0 && 
                       status.data?.modified?.length === 0
          return { ok: true, message: clean ? '干净' : '有未提交的更改' }
        }
      }
    ]

    const results = []
    for (const check of checks) {
      const spinner = ora(check.name).start()
      const result = await check.check()
      
      if (result.ok) {
        spinner.succeed(`${check.name}: ${chalk.green(result.message)}`)
      } else {
        spinner.fail(`${check.name}: ${chalk.red(result.message)}`)
      }
      
      results.push(result)
    }

    const allOk = results.every(r => r.ok)
    
    console.log()
    if (allOk) {
      console.log(chalk.green('✅ 所有检查通过！'))
    } else {
      console.log(chalk.yellow('⚠️ 发现一些问题，请检查上述红色项目'))
    }
  }

  /**
   * 运行 CLI
   */
  async run(): Promise<void> {
    try {
      await this.program.parseAsync(process.argv)
    } catch (error) {
      console.error(chalk.red('错误:'), error)
      process.exit(1)
    }
  }
}

// 导出并运行
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new EnhancedCLI()
  cli.run()
}
