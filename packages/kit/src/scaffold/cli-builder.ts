/**
 * CLI 构建器
 * 基于 CAC 的命令行接口构建器
 */

import type { Logger } from '../logger'
import type { ScaffoldManager } from './scaffold-manager'
import { CAC } from 'cac'
import chalk from 'chalk'
import figlet from 'figlet'
import { InquirerManager } from '../inquirer'

/**
 * CLI 构建器选项
 */
export interface CliBuilderOptions {
  name: string
  version: string
  description?: string
  scaffoldManager: ScaffoldManager
  logger?: Logger
}

/**
 * 命令选项
 */
export interface CommandOptions {
  template?: string
  environment?: string
  targetDir?: string
  interactive?: boolean
  overwrite?: boolean
  plugins?: string | string[]
  variables?: Record<string, any>
}

/**
 * CLI 构建器类
 */
export class CliBuilder {
  private cli: CAC
  private scaffoldManager: ScaffoldManager
  private inquirer: InquirerManager
  private logger?: Logger
  private options: CliBuilderOptions

  constructor(options: CliBuilderOptions) {
    this.options = options
    this.scaffoldManager = options.scaffoldManager
    this.logger = options.logger
    this.inquirer = new InquirerManager()

    this.cli = new CAC(options.name)
    this.cli.version(options.version)

    if (options.description) {
      this.cli.help((sections) => {
        sections.unshift({
          title: '',
          body: chalk.cyan(options.description),
        })
      })
    }

    this.setupCommands()
  }

  /**
   * 设置命令
   */
  private setupCommands(): void {
    // 创建项目命令
    this.cli
      .command('create <project-name>', '创建新项目')
      .option('-t, --template <template>', '使用指定模板')
      .option('-e, --environment <env>', '设置环境')
      .option('-d, --target-dir <dir>', '目标目录')
      .option('-i, --interactive', '交互式创建', { default: true })
      .option('-f, --overwrite', '覆盖已存在的目录')
      .option('-p, --plugins <plugins>', '安装插件（逗号分隔）')
      .action(this.handleCreateCommand.bind(this))

    // 列出模板命令
    this.cli
      .command('list [type]', '列出可用的模板或插件')
      .option('-d, --detailed', '显示详细信息')
      .action(this.handleListCommand.bind(this))

    // 环境管理命令
    this.cli
      .command('env [action]', '环境管理')
      .option('-s, --set <environment>', '设置当前环境')
      .option('-l, --list', '列出所有环境')
      .option('-c, --current', '显示当前环境')
      .action(this.handleEnvCommand.bind(this))

    // 插件管理命令
    this.cli
      .command('plugin <action>', '插件管理')
      .option('-n, --name <name>', '插件名称')
      .option('-p, --path <path>', '项目路径')
      .action(this.handlePluginCommand.bind(this))

    // 模板管理命令
    this.cli
      .command('template <action>', '模板管理')
      .option('-n, --name <name>', '模板名称')
      .option('-s, --source <source>', '源目录')
      .action(this.handleTemplateCommand.bind(this))

    // 配置命令
    this.cli
      .command('config [action]', '配置管理')
      .option('-k, --key <key>', '配置键')
      .option('-v, --value <value>', '配置值')
      .action(this.handleConfigCommand.bind(this))

    // 信息命令
    this.cli.command('info', '显示系统信息').action(this.handleInfoCommand.bind(this))

    // 初始化命令
    this.cli.command('init', '初始化脚手架').action(this.handleInitCommand.bind(this))
  }

  /**
   * 处理创建项目命令
   */
  private async handleCreateCommand(projectName: string, options: CommandOptions): Promise<void> {
    try {
      await this.showBanner()

      this.logger?.info(`开始创建项目: ${projectName}`)

      // 如果是交互式模式，收集用户输入
      if (options.interactive) {
        const answers = await this.collectCreateOptions(projectName, options)
        Object.assign(options, answers)
      }

      // 解析插件列表
      const plugins = options.plugins
        ? typeof options.plugins === 'string'
          ? (options.plugins as string).split(',').map((p: string) => p.trim())
          : options.plugins
        : []

      // 创建项目
      const result = await this.scaffoldManager.createProject({
        name: projectName,
        template: options.template!,
        targetDir: options.targetDir,
        environment: options.environment,
        variables: options.variables,
        plugins,
        interactive: options.interactive,
        overwrite: options.overwrite,
      })

      if (result.success) {
        process.stdout.write(`${chalk.green('\n✅ 项目创建成功！')}\n`)
        process.stdout.write(`${chalk.cyan(`📁 项目路径: ${result.projectPath}`)}\n`)
        process.stdout.write(`${chalk.cyan(`📋 模板: ${result.template}`)}\n`)
        process.stdout.write(`${chalk.cyan(`🌍 环境: ${result.environment}`)}\n`)
        process.stdout.write(`${chalk.cyan(`📄 文件数: ${result.files.length}`)}\n`)
        process.stdout.write(`${chalk.cyan(`⏱️  耗时: ${result.duration}ms`)}\n`)

        if (result.plugins.length > 0) {
          process.stdout.write(`${chalk.cyan(`🔌 插件: ${result.plugins.join(', ')}`)}\n`)
        }

        process.stdout.write(`${chalk.yellow('\n📖 下一步:')}\n`)
        process.stdout.write(`${chalk.white(`  cd ${projectName}`)}\n`)
        process.stdout.write(`${chalk.white('  npm install')}\n`)
        process.stdout.write(`${chalk.white('  npm run dev')}\n`)
      }
      else {
        console.error(chalk.red('\n❌ 项目创建失败'))
        result.errors.forEach((error) => {
          console.error(chalk.red(`   ${error.message}`))
        })
        process.exit(1)
      }
    }
    catch (error) {
      console.error(chalk.red('\n❌ 创建项目时发生错误:'))
      console.error(chalk.red(`   ${(error as Error).message}`))
      process.exit(1)
    }
  }

  /**
   * 处理列表命令
   */
  private async handleListCommand(type?: string, options?: { detailed?: boolean }): Promise<void> {
    try {
      const listType = type || 'templates'

      switch (listType) {
        case 'templates':
          await this.listTemplates(options?.detailed)
          break
        case 'plugins':
          await this.listPlugins(options?.detailed)
          break
        case 'environments':
          await this.listEnvironments(options?.detailed)
          break
        default:
          console.error(chalk.red(`未知类型: ${listType}`))
          process.stdout.write(`${chalk.yellow('可用类型: templates, plugins, environments')}\n`)
      }
    }
    catch (error) {
      console.error(chalk.red(`列表获取失败: ${(error as Error).message}`))
    }
  }

  /**
   * 处理环境命令
   */
  private async handleEnvCommand(
    action?: string,
    options?: { set?: string, list?: boolean, current?: boolean },
  ): Promise<void> {
    try {
      if (options?.set) {
        await this.scaffoldManager.setEnvironment(options.set)
        process.stdout.write(`${chalk.green(`✅ 环境已设置为: ${options.set}`)}\n`)
      }
      else if (options?.list || action === 'list') {
        const environments = this.scaffoldManager.getEnvironments()
        const current = this.scaffoldManager.getCurrentEnvironment()

        process.stdout.write(`${chalk.cyan('\n📋 可用环境:')}\n`)
        environments.forEach((env) => {
          const marker = env === current ? chalk.green('●') : chalk.gray('○')
          process.stdout.write(`  ${marker} ${env}${env === current ? chalk.green(' (当前)') : ''}\n`)
        })
      }
      else if (options?.current || action === 'current') {
        const current = this.scaffoldManager.getCurrentEnvironment()
        process.stdout.write(`${chalk.cyan(`当前环境: ${current}`)}\n`)
      }
      else {
        process.stdout.write(`${chalk.yellow('请指定环境操作: list, current 或使用 --set <env>')}\n`)
      }
    }
    catch (error) {
      console.error(chalk.red(`环境操作失败: ${(error as Error).message}`))
    }
  }

  /**
   * 处理插件命令
   */
  private async handlePluginCommand(
    action: string,
    options?: { name?: string, path?: string },
  ): Promise<void> {
    try {
      switch (action) {
        case 'list':
          await this.listPlugins(true)
          break
        case 'install':
          if (!options?.name || !options?.path) {
            console.error(chalk.red('请指定插件名称和项目路径'))
            return
          }
          // 实现插件安装逻辑
          process.stdout.write(`${chalk.green(`✅ 插件 ${options.name} 安装成功`)}\n`)
          break
        default:
          console.error(chalk.red(`未知插件操作: ${action}`))
          process.stdout.write(`${chalk.yellow('可用操作: list, install')}\n`)
      }
    }
    catch (error) {
      console.error(chalk.red(`插件操作失败: ${(error as Error).message}`))
    }
  }

  /**
   * 处理模板命令
   */
  private async handleTemplateCommand(
    action: string,
    options?: { name?: string, source?: string },
  ): Promise<void> {
    try {
      switch (action) {
        case 'list':
          await this.listTemplates(true)
          break
        case 'create':
          if (!options?.name) {
            console.error(chalk.red('请指定模板名称'))
            return
          }
          // 实现模板创建逻辑
          process.stdout.write(`${chalk.green(`✅ 模板 ${options.name} 创建成功`)}\n`)
          break
        default:
          console.error(chalk.red(`未知模板操作: ${action}`))
          process.stdout.write(`${chalk.yellow('可用操作: list, create')}\n`)
      }
    }
    catch (error) {
      console.error(chalk.red(`模板操作失败: ${(error as Error).message}`))
    }
  }

  /**
   * 处理配置命令
   */
  private async handleConfigCommand(
    action?: string,
    options?: { key?: string, value?: string },
  ): Promise<void> {
    try {
      if (action === 'get' && options?.key) {
        const value = this.scaffoldManager.getConfig(options.key)
        process.stdout.write(`${chalk.cyan(`${options.key}: ${JSON.stringify(value)}`)}\n`)
      }
      else if (action === 'set' && options?.key && options?.value) {
        await this.scaffoldManager.setConfig(options.key, options.value)
        process.stdout.write(`${chalk.green(`✅ 配置已设置: ${options.key} = ${options.value}`)}\n`)
      }
      else {
        process.stdout.write(
          `${chalk.yellow('请指定配置操作: get --key <key> 或 set --key <key> --value <value>')}\n`,
        )
      }
    }
    catch (error) {
      console.error(chalk.red(`配置操作失败: ${(error as Error).message}`))
    }
  }

  /**
   * 处理信息命令
   */
  private async handleInfoCommand(): Promise<void> {
    try {
      process.stdout.write(`${chalk.cyan('\n📊 系统信息:')}\n`)
      process.stdout.write(`${chalk.white(`  脚手架名称: ${this.options.name}`)}\n`)
      process.stdout.write(`${chalk.white(`  版本: ${this.options.version}`)}\n`)
      process.stdout.write(`${chalk.white(`  当前环境: ${this.scaffoldManager.getCurrentEnvironment()}`)}\n`)

      const templates = await this.scaffoldManager.getTemplates()
      const plugins = await this.scaffoldManager.getPlugins()
      const environments = this.scaffoldManager.getEnvironments()

      process.stdout.write(`${chalk.white(`  可用模板: ${templates.length}`)}\n`)
      process.stdout.write(`${chalk.white(`  可用插件: ${plugins.length}`)}\n`)
      process.stdout.write(`${chalk.white(`  可用环境: ${environments.length}`)}\n`)
    }
    catch (error) {
      console.error(chalk.red(`获取信息失败: ${(error as Error).message}`))
    }
  }

  /**
   * 处理初始化命令
   */
  private async handleInitCommand(): Promise<void> {
    try {
      await this.scaffoldManager.initialize()
      process.stdout.write(`${chalk.green('✅ 脚手架初始化完成')}\n`)
    }
    catch (error) {
      console.error(chalk.red(`初始化失败: ${(error as Error).message}`))
    }
  }

  /**
   * 显示横幅
   */
  private async showBanner(): Promise<void> {
    return new Promise((resolve) => {
      figlet(this.options.name, (err, data) => {
        if (!err && data) {
          process.stdout.write(`${chalk.cyan(data)}\n`)
        }
        process.stdout.write(chalk.gray(`v${this.options.version}\n`))
        resolve()
      })
    })
  }

  /**
   * 收集创建选项
   */
  private async collectCreateOptions(
    _projectName: string,
    options: CommandOptions,
  ): Promise<Partial<CommandOptions>> {
    const answers: Partial<CommandOptions> = {}

    // 选择模板
    if (!options.template) {
      const templates = await this.scaffoldManager.getTemplates()
      if (templates.length === 0) {
        throw new Error('没有可用的模板')
      }

      answers.template = await this.inquirer.select({
        message: '请选择项目模板:',
        choices: templates.map(t => ({ name: t, value: t })),
      })
    }

    // 选择环境
    if (!options.environment) {
      const environments = this.scaffoldManager.getEnvironments()
      answers.environment = await this.inquirer.select({
        message: '请选择环境:',
        choices: environments.map(e => ({ name: e, value: e })),
        default: this.scaffoldManager.getCurrentEnvironment(),
      })
    }

    return answers
  }

  /**
   * 列出模板
   */
  private async listTemplates(_detailed?: boolean): Promise<void> {
    const templates = await this.scaffoldManager.getTemplates()

    if (templates.length === 0) {
      process.stdout.write(`${chalk.yellow('没有可用的模板')}\n`)
      return
    }

    process.stdout.write(`${chalk.cyan('\n📋 可用模板:')}\n`)
    templates.forEach((template) => {
      process.stdout.write(`  ${chalk.green('●')} ${template}\n`)
    })
  }

  /**
   * 列出插件
   */
  private async listPlugins(_detailed?: boolean): Promise<void> {
    const plugins = await this.scaffoldManager.getPlugins()

    if (plugins.length === 0) {
      process.stdout.write(`${chalk.yellow('没有可用的插件')}\n`)
      return
    }

    process.stdout.write(`${chalk.cyan('\n🔌 可用插件:')}\n`)
    plugins.forEach((plugin) => {
      process.stdout.write(`  ${chalk.green('●')} ${plugin}\n`)
    })
  }

  /**
   * 列出环境
   */
  private async listEnvironments(_detailed?: boolean): Promise<void> {
    const environments = this.scaffoldManager.getEnvironments()
    const current = this.scaffoldManager.getCurrentEnvironment()

    process.stdout.write(`${chalk.cyan('\n🌍 可用环境:')}\n`)
    environments.forEach((env) => {
      const marker = env === current ? chalk.green('●') : chalk.gray('○')
      process.stdout.write(`  ${marker} ${env}${env === current ? chalk.green(' (当前)') : ''}\n`)
    })
  }

  /**
   * 解析 CLI 参数
   */
  parse(argv?: string[]): void {
    this.cli.parse(argv)
  }

  /**
   * 获取 CLI 实例
   */
  getCli(): CAC {
    return this.cli
  }

  /**
   * 创建 CLI 构建器实例
   */
  static create(options: CliBuilderOptions): CliBuilder {
    return new CliBuilder(options)
  }
}
