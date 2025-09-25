/**
 * 命令管理器
 */

import { Command as CommanderCommand } from 'commander';
import { Command, CLIContext, CommandOption } from '../types/index';

export class CommandManager {
  private context: CLIContext;
  private commands: Map<string, Command> = new Map();

  constructor(context: CLIContext) {
    this.context = context;
  }

  /**
   * 注册命令
   */
  register(command: Command): void {
    try {
      this.commands.set(command.name, command);
      this.context.logger.debug(`注册命令: ${command.name}`);
    } catch (error) {
      this.context.logger.error(`注册命令失败: ${command.name}`, error);
      throw error;
    }
  }

  /**
   * 获取命令
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * 获取所有命令
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * 创建 Commander 命令
   */
  createCommanderCommand(command: Command, program: CommanderCommand): CommanderCommand {
    const cmd = program
      .command(command.name)
      .description(command.description);

    // 添加别名
    if (command.aliases) {
      cmd.aliases(command.aliases);
    }

    // 添加选项
    if (command.options) {
      for (const option of command.options) {
        this.addOption(cmd, option);
      }
    }

    // 添加示例
    if (command.examples) {
      const examples = command.examples.join('\n  ');
      cmd.addHelpText('after', `\n示例:\n  ${examples}`);
    }

    // 设置动作
    cmd.action(async (...args) => {
      try {
        // 解析参数
        const parsedArgs = this.parseArguments(args, command);
        
        // 执行命令
        await command.action(parsedArgs, this.context);
      } catch (error) {
        this.context.logger.error(`命令执行失败: ${command.name}`, error);
        throw error;
      }
    });

    // 添加子命令
    if (command.subcommands) {
      for (const subcommand of command.subcommands) {
        this.createCommanderCommand(subcommand, cmd);
      }
    }

    return cmd;
  }

  /**
   * 添加选项到命令
   */
  private addOption(cmd: CommanderCommand, option: CommandOption): void {
    let flags = `--${option.name}`;
    
    if (option.alias) {
      flags = `-${option.alias}, ${flags}`;
    }

    switch (option.type) {
      case 'boolean':
        cmd.option(flags, option.description, option.default);
        break;
      case 'string':
        flags += ' <value>';
        cmd.option(flags, option.description, option.default);
        break;
      case 'number':
        flags += ' <number>';
        cmd.option(flags, option.description, option.default);
        break;
      case 'array':
        flags += ' <items...>';
        cmd.option(flags, option.description, option.default);
        break;
    }

    // 添加必需验证
    if (option.required) {
      cmd.requiredOption(flags, option.description);
    }
  }

  /**
   * 解析命令参数
   */
  private parseArguments(args: any[], command: Command): any {
    const [options, cmd] = args;
    
    // 基础参数对象
    const parsedArgs = {
      ...options,
      _command: command.name,
      _args: cmd.args || []
    };

    // 验证必需选项
    if (command.options) {
      for (const option of command.options) {
        if (option.required && parsedArgs[option.name] === undefined) {
          throw new Error(`缺少必需选项: --${option.name}`);
        }
      }
    }

    return parsedArgs;
  }

  /**
   * 验证命令
   */
  validate(command: Command): boolean {
    if (!command.name) {
      this.context.logger.error('命令名称不能为空');
      return false;
    }

    if (!command.description) {
      this.context.logger.error(`命令 ${command.name} 缺少描述`);
      return false;
    }

    if (!command.action) {
      this.context.logger.error(`命令 ${command.name} 缺少执行函数`);
      return false;
    }

    return true;
  }

  /**
   * 移除命令
   */
  unregister(name: string): boolean {
    const removed = this.commands.delete(name);
    if (removed) {
      this.context.logger.debug(`移除命令: ${name}`);
    }
    return removed;
  }

  /**
   * 清空所有命令
   */
  clear(): void {
    this.commands.clear();
    this.context.logger.debug('清空所有命令');
  }
}
