#!/usr/bin/env tsx

import { Command } from 'commander'
import { logger } from './utils/common.js'

const program = new Command()

program
  .name('ldesign-scripts')
  .description('LDesign 项目管理脚本集合')
  .version('1.0.0')

// Git 提交命令
program
  .command('commit [path]')
  .description('智能提交代码到 GitHub')
  .option('-m, --message <message>', '提交信息')
  .option('-d, --dry-run', '预览模式')
  .option('-f, --force', '强制执行')
  .action(async (path, options) => {
    const { execCommand } = await import('./utils/common.js')
    await execCommand(
      'tsx',
      ['scripts/git-commit.ts', path, ...formatOptions(options)],
      {
        stdio: 'inherit',
      }
    )
  })

// Git 更新命令
program
  .command('update [path]')
  .description('更新项目到最新代码')
  .option('-b, --branch <branch>', '目标分支')
  .option('-a, --all', '更新所有项目')
  .option('-d, --dry-run', '预览模式')
  .option('-f, --force', '强制更新')
  .action(async (path, options) => {
    const { execCommand } = await import('./utils/common.js')
    await execCommand(
      'tsx',
      ['scripts/git-update.ts', path, ...formatOptions(options)],
      {
        stdio: 'inherit',
      }
    )
  })

// Submodule 管理命令
program
  .command('submodule <action>')
  .description('管理 submodule (add|remove|list|modify)')
  .argument('[args...]', '命令参数')
  .option('-d, --dry-run', '预览模式')
  .action(async (action, args, options) => {
    const { execCommand } = await import('./utils/common.js')
    await execCommand(
      'tsx',
      [
        'scripts/submodule-manager.ts',
        action,
        ...args,
        ...formatOptions(options),
      ],
      {
        stdio: 'inherit',
      }
    )
  })

// 项目初始化命令
program
  .command('init')
  .description('初始化项目')
  .option('--skip-deps', '跳过依赖安装')
  .option('--skip-submodules', '跳过 submodule 初始化')
  .option('-d, --dry-run', '预览模式')
  .option('-f, --force', '强制执行')
  .action(async options => {
    const { execCommand } = await import('./utils/common.js')
    await execCommand(
      'tsx',
      ['scripts/init-project.ts', ...formatOptions(options)],
      {
        stdio: 'inherit',
      }
    )
  })

// 帮助命令
program
  .command('help [command]')
  .description('显示帮助信息')
  .action(command => {
    if (command) {
      program.commands.find(cmd => cmd.name() === command)?.help()
    } else {
      showMainHelp()
    }
  })

/**
 * 格式化选项为命令行参数
 */
function formatOptions(options: Record<string, any>): string[] {
  const args: string[] = []

  for (const [key, value] of Object.entries(options)) {
    if (value === true) {
      args.push(`--${key}`)
    } else if (value && value !== false) {
      args.push(`--${key}`, String(value))
    }
  }

  return args
}

/**
 * 显示主帮助信息
 */
function showMainHelp(): void {
  logger.title('🛠️ LDesign 脚本工具集')
  console.log()

  console.log('用法:')
  console.log('  pnpm script:<command> [options]')
  console.log()

  console.log('可用命令:')
  console.log('  commit [path]           - 智能提交代码')
  console.log('  update [path]           - 更新项目代码')
  console.log('  submodule <action>      - 管理 submodule')
  console.log('  init                    - 初始化项目')
  console.log()

  console.log('示例:')
  console.log('  pnpm script:commit                    # 提交当前目录')
  console.log('  pnpm script:commit packages/color     # 提交指定 submodule')
  console.log('  pnpm script:update --all              # 更新所有项目')
  console.log('  pnpm script:submodule add <url> <path> # 添加 submodule')
  console.log('  pnpm script:submodule list             # 列出所有 submodule')
  console.log('  pnpm script:init                       # 初始化项目')
  console.log()

  console.log('选项:')
  console.log('  -d, --dry-run          预览模式，不执行实际操作')
  console.log('  -f, --force            强制执行，跳过确认')
  console.log('  -h, --help             显示帮助信息')
  console.log()

  console.log('更多信息:')
  console.log('  pnpm script:help <command>  # 查看特定命令的帮助')
}

// 如果没有提供命令，显示帮助
if (process.argv.length <= 2) {
  showMainHelp()
  process.exit(0)
}

program.parse()
