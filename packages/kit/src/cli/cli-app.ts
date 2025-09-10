/**
 * CLI 应用程序模块
 * 提供完整的命令行应用程序框架，支持命令解析、交互式提示、格式化输出等功能
 *
 * @example
 * ```typescript
 * import { CLIApp } from '@ldesign/kit'
 *
 * const app = new CLIApp({
 *   name: 'my-cli',
 *   version: '1.0.0',
 *   description: 'My CLI application'
 * })
 *
 * app.command('hello', {
 *   description: 'Say hello',
 *   options: [
 *     { name: 'name', type: 'string', description: 'Your name' }
 *   ],
 *   action: async (args) => {
 *     app.success(`Hello, ${args.name || 'World'}!`)
 *   }
 * })
 *
 * app.run()
 * ```
 */

import type {
  CLIAppOptions,
  CLIContext,
  CommandOptions,
  OptionDefinition,
  ParsedArgs,
  PromptOptions,
} from '../types'
import { EventEmitter } from 'node:events'
import { CommandParser } from './command-parser'
import { OutputFormatter } from './output-formatter'
import { PromptManager } from './prompt-manager'

/**
 * CLI 应用程序类
 * 继承自 EventEmitter，提供事件驱动的命令行应用程序框架
 *
 * 主要功能：
 * - 命令注册和解析
 * - 交互式用户输入
 * - 格式化输出和日志
 * - 中间件支持
 * - 错误处理
 *
 * @extends EventEmitter
 */
export class CLIApp extends EventEmitter {
  /** 命令解析器实例，负责解析命令行参数和选项 */
  private parser: CommandParser

  /** 提示管理器实例，负责处理用户交互输入 */
  private promptManager: PromptManager

  /** 输出格式化器实例，负责格式化控制台输出 */
  private formatter: OutputFormatter

  /** CLI 应用程序配置选项 */
  private options: Required<CLIAppOptions>

  /** 中间件数组，用于在命令执行前后进行处理 */
  private middlewares: Array<(context: CLIContext, next: () => Promise<void>) => Promise<void>> = []

  /**
   * 创建 CLI 应用程序实例
   *
   * @param options - CLI 应用程序配置选项
   * @param options.name - 应用程序名称，默认为 'cli-app'
   * @param options.version - 应用程序版本，默认为 '1.0.0'
   * @param options.description - 应用程序描述，默认为空字符串
   * @param options.exitOnError - 发生错误时是否退出程序，默认为 true
   * @param options.exitOnSuccess - 成功执行后是否退出程序，默认为 false
   * @param options.colors - 是否启用彩色输出，默认为 true
   * @param options.interactive - 是否启用交互模式，默认为 true
   *
   * @example
   * ```typescript
   * const app = new CLIApp({
   *   name: 'my-tool',
   *   version: '2.1.0',
   *   description: 'A powerful CLI tool',
   *   colors: true,
   *   interactive: true
   * })
   * ```
   */
  constructor(options: CLIAppOptions = {}) {
    // 调用父类构造函数，初始化 EventEmitter
    super()

    // 合并默认选项和用户提供的选项
    this.options = {
      name: options.name ?? 'cli-app',
      version: options.version ?? '1.0.0',
      description: options.description ?? '',
      exitOnError: options.exitOnError ?? true,
      exitOnSuccess: options.exitOnSuccess ?? false,
      colors: options.colors ?? true,
      interactive: options.interactive ?? true,
      ...options,
    }

    // 初始化命令解析器
    this.parser = new CommandParser({
      version: this.options.version,
      description: this.options.description,
      allowUnknownOptions: false, // 不允许未知选项
      caseSensitive: false, // 不区分大小写
    })

    // 初始化提示管理器
    this.promptManager = new PromptManager({
      enabled: this.options.interactive, // 根据配置启用/禁用交互模式
    })

    // 初始化输出格式化器
    this.formatter = new OutputFormatter({
      colors: this.options.colors, // 根据配置启用/禁用彩色输出
    })

    this.setupDefaultCommands()
  }

  /**
   * 设置默认命令
   */
  private setupDefaultCommands(): void {
    // 帮助命令
    this.command({
      name: 'help',
      description: '显示帮助信息',
      options: [
        {
          name: 'command',
          description: '显示特定命令的帮助',
          type: 'string',
        },
      ],
      action: async (args) => {
        const commandName = args.options.command as string
        const help = this.parser.generateHelp(commandName)
        this.formatter.info(help)
      },
    })
  }

  /**
   * 添加命令
   */
  command(command: CommandOptions): this {
    this.parser.addCommand(command)
    return this
  }

  /**
   * 添加全局选项
   */
  option(option: OptionDefinition): this {
    this.parser.addGlobalOption(option)
    return this
  }

  /**
   * 添加中间件
   */
  use(middleware: (context: CLIContext, next: () => Promise<void>) => Promise<void>): this {
    this.middlewares.push(middleware)
    return this
  }

  /**
   * 解析并执行命令
   */
  async parse(args?: string[]): Promise<void> {
    try {
      const parsed = this.parser.parse(args)

      // 处理帮助和版本
      if (parsed.options.help) {
        const help = this.parser.generateHelp(parsed.command || undefined)
        this.formatter.info(help)
        if (this.options.exitOnSuccess)
          process.exit(0)
        return
      }

      if (parsed.options.version) {
        this.formatter.info(`${this.options.name} v${this.options.version}`)
        if (this.options.exitOnSuccess)
          process.exit(0)
        return
      }

      // 执行命令
      await this.executeCommand(parsed)

      if (this.options.exitOnSuccess) {
        process.exit(0)
      }
    }
    catch (error) {
      this.handleError(error as Error)
    }
  }

  /**
   * 执行命令
   */
  private async executeCommand(parsed: ParsedArgs): Promise<void> {
    if (!parsed.command) {
      // 没有命令，显示帮助
      const help = this.parser.generateHelp()
      this.formatter.info(help)
      return
    }

    const command = this.parser.getCommand(parsed.command)
    if (!command) {
      throw new Error(`未知命令: ${parsed.command}`)
    }

    // 创建上下文
    const context: CLIContext = {
      command: parsed.command,
      args: parsed.args,
      options: parsed.options,
      app: this,
      formatter: this.formatter,
      prompt: this.promptManager,
    }

    // 执行中间件链
    await this.executeMiddlewares(context, async () => {
      await command.action(parsed, context)
    })
  }

  /**
   * 执行中间件链
   */
  private async executeMiddlewares(
    context: CLIContext,
    finalHandler: () => Promise<void>,
  ): Promise<void> {
    let index = 0

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) {
        await finalHandler()
        return
      }

      const middleware = this.middlewares[index++]
      if (middleware) {
        await middleware(context, next)
      }
    }

    await next()
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.emit('error', error)
    this.formatter.error(error.message)

    if (this.options.exitOnError) {
      process.exit(1)
    }
  }

  /**
   * 显示信息
   */
  info(message: string): void {
    this.formatter.info(message)
  }

  /**
   * 显示成功信息
   */
  success(message: string): void {
    this.formatter.success(message)
  }

  /**
   * 显示警告信息
   */
  warn(message: string): void {
    this.formatter.warn(message)
  }

  /**
   * 显示错误信息
   */
  error(message: string): void {
    this.formatter.error(message)
  }

  /**
   * 显示调试信息
   */
  debug(message: string): void {
    this.formatter.debug(message)
  }

  /**
   * 询问用户输入
   */
  async prompt<T = unknown>(options: PromptOptions): Promise<T> {
    return this.promptManager.prompt<T>(options)
  }

  /**
   * 确认操作
   */
  async confirm(message: string, defaultValue = false): Promise<boolean> {
    return this.promptManager.confirm(message, defaultValue)
  }

  /**
   * 选择选项
   */
  async select<T = string>(
    message: string,
    choices: Array<{ title: string, value: T }>,
  ): Promise<T> {
    return this.promptManager.select(message, choices)
  }

  /**
   * 多选
   */
  async multiselect<T = string>(
    message: string,
    choices: Array<{ title: string, value: T }>,
  ): Promise<T[]> {
    return this.promptManager.multiselect(message, choices)
  }

  /**
   * 输入文本
   */
  async input(message: string, defaultValue?: string): Promise<string> {
    return this.promptManager.input(message, defaultValue)
  }

  /**
   * 输入密码
   */
  async password(message: string): Promise<string> {
    return this.promptManager.password(message)
  }

  /**
   * 输入数字
   */
  async number(message: string, defaultValue?: number): Promise<number> {
    return this.promptManager.number(message, defaultValue)
  }

  /**
   * 显示进度条
   */
  createProgressBar(total: number, options?: Record<string, unknown>): unknown {
    return this.formatter.createProgressBar(total, options)
  }

  /**
   * 显示加载动画
   */
  createSpinner(message?: string): unknown {
    return this.formatter.createSpinner(message)
  }

  /**
   * 显示表格
   */
  table(data: Record<string, unknown>[], options?: Record<string, unknown>): void {
    this.formatter.table(data, options)
  }

  /**
   * 显示列表
   */
  list(items: string[], options?: Record<string, unknown>): void {
    this.formatter.list(items, options)
  }

  /**
   * 显示 JSON
   */
  json(data: unknown, options?: Record<string, unknown>): void {
    this.formatter.json(data, options)
  }

  /**
   * 清屏
   */
  clear(): void {
    this.formatter.clear()
  }

  /**
   * 退出应用
   */
  exit(code = 0): void {
    process.exit(code)
  }

  /**
   * 获取应用信息
   */
  getInfo(): { name: string, version: string, description: string } {
    return {
      name: this.options.name,
      version: this.options.version,
      description: this.options.description,
    }
  }

  /**
   * 获取所有命令
   */
  getCommands(): Map<string, CommandOptions> {
    return this.parser.getCommands()
  }

  /**
   * 检查是否有命令
   */
  hasCommand(name: string): boolean {
    return this.parser.hasCommand(name)
  }

  /**
   * 创建 CLI 应用实例
   */
  static create(options?: CLIAppOptions): CLIApp {
    return new CLIApp(options)
  }
}
