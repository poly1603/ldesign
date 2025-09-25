/**
 * 自动补全工具
 */

import { writeFile, readFile } from './file';
import { resolve } from 'path';
import { homedir } from 'os';
import { CLIContext, Command } from '../types/index';

/**
 * 自动补全管理器
 */
export class CompletionManager {
  private context: CLIContext;
  private commands: Map<string, Command> = new Map();

  constructor(context: CLIContext) {
    this.context = context;
  }

  /**
   * 注册命令用于补全
   */
  registerCommand(command: Command): void {
    this.commands.set(command.name, command);
    
    // 注册别名
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.commands.set(alias, command);
      }
    }
  }

  /**
   * 生成 Bash 补全脚本
   */
  generateBashCompletion(): string {
    const commands = Array.from(this.commands.keys());
    const commandList = commands.join(' ');

    return `#!/bin/bash

# LDesign CLI 自动补全脚本

_ldesign_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    # 主命令补全
    if [[ \${COMP_CWORD} == 1 ]]; then
        opts="${commandList}"
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi

    # 子命令和选项补全
    case "\${prev}" in
        ${this.generateBashCommandCases()}
        *)
            ;;
    esac
}

complete -F _ldesign_completion ldesign
complete -F _ldesign_completion ld
`;
  }

  /**
   * 生成 Bash 命令案例
   */
  private generateBashCommandCases(): string {
    const cases: string[] = [];

    for (const [name, command] of this.commands) {
      if (command.options) {
        const options = command.options.map(opt => {
          const flags = [`--${opt.name}`];
          if (opt.alias) {
            flags.push(`-${opt.alias}`);
          }
          return flags.join(' ');
        }).join(' ');

        cases.push(`        ${name})
            opts="${options}"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            return 0
            ;;`);
      }
    }

    return cases.join('\n');
  }

  /**
   * 生成 Zsh 补全脚本
   */
  generateZshCompletion(): string {
    return `#compdef ldesign ld

# LDesign CLI Zsh 自动补全脚本

_ldesign() {
    local context curcontext="$curcontext" state line
    typeset -A opt_args

    _arguments -C \\
        '1: :_ldesign_commands' \\
        '*::arg:->args'

    case $state in
        args)
            case $line[1] in
                ${this.generateZshCommandCases()}
            esac
            ;;
    esac
}

_ldesign_commands() {
    local commands
    commands=(
        ${this.generateZshCommandList()}
    )
    _describe 'commands' commands
}

${this.generateZshCommandFunctions()}

_ldesign "$@"
`;
  }

  /**
   * 生成 Zsh 命令列表
   */
  private generateZshCommandList(): string {
    const commands: string[] = [];
    const processed = new Set<string>();

    for (const [name, command] of this.commands) {
      if (!processed.has(command.name)) {
        commands.push(`'${command.name}:${command.description}'`);
        processed.add(command.name);
      }
    }

    return commands.join('\n        ');
  }

  /**
   * 生成 Zsh 命令案例
   */
  private generateZshCommandCases(): string {
    const cases: string[] = [];
    const processed = new Set<string>();

    for (const [name, command] of this.commands) {
      if (!processed.has(command.name)) {
        cases.push(`                ${command.name})
                    _ldesign_${command.name.replace(/-/g, '_')}
                    ;;`);
        processed.add(command.name);
      }
    }

    return cases.join('\n');
  }

  /**
   * 生成 Zsh 命令函数
   */
  private generateZshCommandFunctions(): string {
    const functions: string[] = [];
    const processed = new Set<string>();

    for (const [name, command] of this.commands) {
      if (!processed.has(command.name) && command.options) {
        const functionName = `_ldesign_${command.name.replace(/-/g, '_')}`;
        const options = command.options.map(opt => {
          const flags = [`--${opt.name}`];
          if (opt.alias) {
            flags.push(`-${opt.alias}`);
          }
          const flagStr = flags.join(',');
          return `        '${flagStr}[${opt.description}]'`;
        }).join(' \\\\\n');

        functions.push(`${functionName}() {
    _arguments \\
${options}
}`);
        processed.add(command.name);
      }
    }

    return functions.join('\n\n');
  }

  /**
   * 生成 Fish 补全脚本
   */
  generateFishCompletion(): string {
    const completions: string[] = [];

    // 主命令补全
    for (const [name, command] of this.commands) {
      if (name === command.name) { // 避免重复别名
        completions.push(`complete -c ldesign -f -n "__fish_use_subcommand" -a "${name}" -d "${command.description}"`);
      }
    }

    // 选项补全
    for (const [name, command] of this.commands) {
      if (name === command.name && command.options) {
        for (const option of command.options) {
          const flags = [`--${option.name}`];
          if (option.alias) {
            flags.push(`-${option.alias}`);
          }
          
          completions.push(
            `complete -c ldesign -f -n "__fish_seen_subcommand_from ${name}" -l ${option.name}${
              option.alias ? ` -s ${option.alias}` : ''
            } -d "${option.description}"`
          );
        }
      }
    }

    return `# LDesign CLI Fish 自动补全脚本

${completions.join('\n')}
`;
  }

  /**
   * 安装补全脚本
   */
  async installCompletion(shell: string): Promise<void> {
    const homeDir = homedir();
    let scriptPath: string;
    let scriptContent: string;

    switch (shell) {
      case 'bash':
        scriptPath = resolve(homeDir, '.bash_completion.d', 'ldesign');
        scriptContent = this.generateBashCompletion();
        break;
        
      case 'zsh':
        scriptPath = resolve(homeDir, '.zsh', 'completions', '_ldesign');
        scriptContent = this.generateZshCompletion();
        break;
        
      case 'fish':
        scriptPath = resolve(homeDir, '.config', 'fish', 'completions', 'ldesign.fish');
        scriptContent = this.generateFishCompletion();
        break;
        
      default:
        throw new Error(`不支持的 shell: ${shell}`);
    }

    await writeFile(scriptPath, scriptContent);
    this.context.logger.success(`✅ ${shell} 补全脚本已安装到: ${scriptPath}`);
    
    // 提供使用说明
    this.showInstallationInstructions(shell, scriptPath);
  }

  /**
   * 显示安装说明
   */
  private showInstallationInstructions(shell: string, scriptPath: string): void {
    this.context.logger.info('\n📝 使用说明:');
    
    switch (shell) {
      case 'bash':
        this.context.logger.info('  将以下行添加到 ~/.bashrc:');
        this.context.logger.info(`  source ${scriptPath}`);
        break;
        
      case 'zsh':
        this.context.logger.info('  确保 ~/.zshrc 中包含:');
        this.context.logger.info('  autoload -U compinit && compinit');
        this.context.logger.info('  并将补全目录添加到 fpath');
        break;
        
      case 'fish':
        this.context.logger.info('  Fish 会自动加载补全脚本');
        this.context.logger.info('  重启终端或运行: source ~/.config/fish/config.fish');
        break;
    }
    
    this.context.logger.info('\n重启终端后即可使用 Tab 键自动补全！');
  }

  /**
   * 卸载补全脚本
   */
  async uninstallCompletion(shell: string): Promise<void> {
    const homeDir = homedir();
    let scriptPath: string;

    switch (shell) {
      case 'bash':
        scriptPath = resolve(homeDir, '.bash_completion.d', 'ldesign');
        break;
        
      case 'zsh':
        scriptPath = resolve(homeDir, '.zsh', 'completions', '_ldesign');
        break;
        
      case 'fish':
        scriptPath = resolve(homeDir, '.config', 'fish', 'completions', 'ldesign.fish');
        break;
        
      default:
        throw new Error(`不支持的 shell: ${shell}`);
    }

    try {
      const fs = await import('fs/promises');
      await fs.unlink(scriptPath);
      this.context.logger.success(`✅ ${shell} 补全脚本已卸载`);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        this.context.logger.warn(`⚠️  补全脚本不存在: ${scriptPath}`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * 创建补全管理器
 */
export function createCompletionManager(context: CLIContext): CompletionManager {
  return new CompletionManager(context);
}
