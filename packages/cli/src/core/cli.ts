/**
 * CLI 核心类
 */

import { Command } from 'commander';
import { CLIContext, CLIConfig, Logger } from '../types/index';
import { CommandManager } from './command';
import { PluginManager } from './plugin';
import { MiddlewareManager } from './middleware';
import { createContext } from '../utils/context';

export interface CLIOptions {
  logger: Logger;
  config: CLIConfig;
}

export class CLI {
  private program: Command;
  private context: CLIContext;
  private commandManager: CommandManager;
  private pluginManager: PluginManager;
  private middlewareManager: MiddlewareManager;

  constructor(options: CLIOptions) {
    this.program = new Command();
    this.context = createContext(options.config, options.logger);
    this.commandManager = new CommandManager(this.context);
    this.pluginManager = new PluginManager(this.context);
    this.middlewareManager = new MiddlewareManager(this.context);
  }

  /**
   * 初始化 CLI
   */
  async init(): Promise<void> {
    try {
      // 设置基本信息
      this.setupProgram();

      // 注册内置命令
      await this.registerBuiltinCommands();

      this.context.logger.debug('CLI 初始化完成');
    } catch (error) {
      this.context.logger.error('CLI 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 运行 CLI
   */
  async run(): Promise<void> {
    try {
      // 执行中间件链和命令
      await this.middlewareManager.execute(async () => {
        await this.program.parseAsync();
      });
    } catch (error) {
      this.context.logger.error('命令执行失败:', error);
      process.exit(1);
    }
  }

  /**
   * 设置程序基本信息
   */
  private setupProgram(): void {
    this.program
      .name('ldesign')
      .description('LDesign CLI - 强大的脚手架工具')
      .version('1.0.0')
      .option('-c, --config <path>', '指定配置文件路径')
      .option('-e, --env <environment>', '指定环境', 'development')
      .option('-v, --verbose', '详细输出')
      .option('--debug', '调试模式');

    // 全局选项处理
    this.program.hook('preAction', async (thisCommand) => {
      const options = thisCommand.opts();

      // 加载配置
      if (options.config) {
        this.context.config = await this.loadConfig(options.config);
        this.context.logger.debug('配置加载完成:', this.context.config);

        // 重新加载插件和中间件
        await this.pluginManager.loadPlugins();
        await this.middlewareManager.registerMiddleware();
        await this.registerPluginCommands();
      }

      if (options.verbose) {
        this.context.logger.info('启用详细输出模式');
      }

      if (options.debug) {
        this.context.logger.info('启用调试模式');
      }

      if (options.env) {
        this.context.config.environment = options.env;
        this.context.logger.debug(`切换到环境: ${options.env}`);
      }
    });
  }

  /**
   * 注册内置命令
   */
  private async registerBuiltinCommands(): Promise<void> {
    // 动态导入内置命令
    const commands = [
      () => import('../commands/init'),
      () => import('../commands/build'),
      () => import('../commands/dev'),
      () => import('../commands/test'),
      () => import('../commands/ui'),
    ];

    for (const commandImport of commands) {
      try {
        const { default: command } = await commandImport();
        this.commandManager.register(command);
        this.commandManager.createCommanderCommand(command, this.program);
      } catch (error) {
        this.context.logger.warn(`加载内置命令失败:`, error);
      }
    }
  }

  /**
   * 注册插件命令
   */
  private async registerPluginCommands(): Promise<void> {
    for (const plugin of this.context.plugins.values()) {
      if (plugin.commands) {
        for (const command of plugin.commands) {
          this.commandManager.register(command);
          this.commandManager.createCommanderCommand(command, this.program);
        }
      }
    }
  }

  /**
   * 加载配置文件
   */
  private async loadConfig(configPath?: string): Promise<any> {
    const { ConfigLoader } = await import('../config/loader');
    const loader = new ConfigLoader();
    return await loader.load({ searchFrom: configPath });
  }

  /**
   * 获取 Commander 程序实例
   */
  getProgram(): Command {
    return this.program;
  }

  /**
   * 获取 CLI 上下文
   */
  getContext(): CLIContext {
    return this.context;
  }
}
