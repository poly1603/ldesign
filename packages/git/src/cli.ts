/**
 * @ldesign/git CLI 工具
 * 提供命令行接口来使用 Git 功能
 */

import { Git } from './index.js'
import { GitError } from './errors/index.js'
import { ConflictResolver } from './utils/ConflictResolver.js'
import { SmartSyncOptions } from './core/SmartSync.js'

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
@ldesign/git CLI 工具

用法:
  ldesign-git <command> [options]

命令:
  init [--bare]                    初始化 Git 仓库
  status                          显示仓库状态
  add <files...>                  添加文件到暂存区
  commit <message> [files...]     提交更改
  push [remote] [branch]          推送到远程仓库
  pull [remote] [branch]          从远程仓库拉取
  log [--max-count=<n>]           显示提交日志
  
  branch list [--remote]          列出分支
  branch create <name> [start]    创建分支
  branch checkout <name>          切换分支
  branch delete <name> [--force]  删除分支
  branch current                  显示当前分支
  
  remote list                     列出远程仓库
  remote add <name> <url>         添加远程仓库
  remote remove <name>            删除远程仓库

  clone <url> [dir]               克隆仓库

  智能同步命令:
  sync-commit <message> [files...] 智能同步提交（自动处理冲突）
  rollback [stash-id]              回滚智能同步操作
  resolve [--ours|--theirs]        解决合并冲突
  
选项:
  --help, -h                      显示帮助信息
  --version, -v                   显示版本信息
  --cwd <path>                    指定工作目录

示例:
  ldesign-git init
  ldesign-git add .
  ldesign-git commit "Initial commit"
  ldesign-git branch create feature/new-feature
  ldesign-git push origin main

  智能同步示例:
  ldesign-git sync-commit "Add new feature"
  ldesign-git sync-commit "Fix bug" src/main.js
  ldesign-git resolve --ours
  ldesign-git rollback
`)
}

/**
 * 显示版本信息
 */
function showVersion(): void {
  console.log(`@ldesign/git v0.1.0`)
}

/**
 * 解析命令行参数
 */
function parseArgs(args: string[]): {
  command: string
  subcommand?: string
  args: string[]
  options: Record<string, any>
} {
  const options: Record<string, any> = {}
  const positionalArgs: string[] = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      if (value !== undefined) {
        options[key] = value
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[key] = args[++i]
      } else {
        options[key] = true
      }
    } else if (arg.startsWith('-')) {
      const flags = arg.slice(1)
      for (const flag of flags) {
        options[flag] = true
      }
    } else {
      positionalArgs.push(arg)
    }
  }

  const [command, subcommand, ...restArgs] = positionalArgs

  return {
    command: command || 'help',
    subcommand,
    args: restArgs,
    options
  }
}

/**
 * 格式化输出结果
 */
function formatResult(result: any): void {
  if (result.success) {
    if (result.data) {
      if (Array.isArray(result.data)) {
        result.data.forEach((item: any) => {
          if (typeof item === 'object') {
            console.log(JSON.stringify(item, null, 2))
          } else {
            console.log(item)
          }
        })
      } else if (typeof result.data === 'object') {
        console.log(JSON.stringify(result.data, null, 2))
      } else {
        console.log(result.data)
      }
    } else {
      console.log('✅ 操作成功')
    }
  } else {
    console.error('❌ 操作失败:', result.error)
    process.exit(1)
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const { command, subcommand, args: cmdArgs, options } = parseArgs(args)

  // 处理帮助和版本
  if (options.help || options.h || command === 'help') {
    showHelp()
    return
  }

  if (options.version || options.v || command === 'version') {
    showVersion()
    return
  }

  // 设置工作目录
  const cwd = options.cwd || process.cwd()
  const git = Git.create(cwd)

  try {
    switch (command) {
      case 'init':
        {
          const result = await git.init(options.bare)
          formatResult(result)
        }
        break

      case 'status':
        {
          const result = await git.getStatus()
          formatResult(result)
        }
        break

      case 'add':
        {
          if (cmdArgs.length === 0) {
            console.error('❌ 请指定要添加的文件')
            process.exit(1)
          }
          const result = await git.add(cmdArgs)
          formatResult(result)
        }
        break

      case 'commit':
        {
          if (cmdArgs.length === 0) {
            console.error('❌ 请提供提交消息')
            process.exit(1)
          }
          const [message, ...files] = cmdArgs
          const result = await git.commit(message, files.length > 0 ? files : undefined)
          formatResult(result)
        }
        break

      case 'push':
        {
          const [remote, branch] = cmdArgs
          const result = await git.push(remote, branch)
          formatResult(result)
        }
        break

      case 'pull':
        {
          const [remote, branch] = cmdArgs
          const result = await git.pull(remote, branch)
          formatResult(result)
        }
        break

      case 'log':
        {
          const maxCount = options['max-count'] ? parseInt(options['max-count']) : undefined
          const result = await git.getLog(maxCount)
          formatResult(result)
        }
        break

      case 'branch':
        {
          switch (subcommand) {
            case 'list':
              {
                const result = await git.listBranches(options.remote)
                formatResult(result)
              }
              break

            case 'create':
              {
                if (cmdArgs.length === 0) {
                  console.error('❌ 请指定分支名称')
                  process.exit(1)
                }
                const [name, start] = cmdArgs
                const result = await git.branch.create(name, start)
                formatResult(result)
              }
              break

            case 'checkout':
              {
                if (cmdArgs.length === 0) {
                  console.error('❌ 请指定分支名称')
                  process.exit(1)
                }
                const result = await git.checkoutBranch(cmdArgs[0])
                formatResult(result)
              }
              break

            case 'delete':
              {
                if (cmdArgs.length === 0) {
                  console.error('❌ 请指定分支名称')
                  process.exit(1)
                }
                const result = await git.branch.delete(cmdArgs[0], options.force)
                formatResult(result)
              }
              break

            case 'current':
              {
                const result = await git.branch.current()
                formatResult(result)
              }
              break

            default:
              console.error('❌ 未知的分支命令:', subcommand)
              process.exit(1)
          }
        }
        break

      case 'remote':
        {
          switch (subcommand) {
            case 'list':
              {
                const result = await git.listRemotes()
                formatResult(result)
              }
              break

            case 'add':
              {
                if (cmdArgs.length < 2) {
                  console.error('❌ 请指定远程仓库名称和 URL')
                  process.exit(1)
                }
                const [name, url] = cmdArgs
                const result = await git.addRemote(name, url)
                formatResult(result)
              }
              break

            case 'remove':
              {
                if (cmdArgs.length === 0) {
                  console.error('❌ 请指定远程仓库名称')
                  process.exit(1)
                }
                const result = await git.remote.remove(cmdArgs[0])
                formatResult(result)
              }
              break

            default:
              console.error('❌ 未知的远程仓库命令:', subcommand)
              process.exit(1)
          }
        }
        break

      case 'clone':
        {
          if (cmdArgs.length === 0) {
            console.error('❌ 请指定仓库 URL')
            process.exit(1)
          }
          const [url, dir] = cmdArgs
          const result = await git.clone(url, dir)
          formatResult(result)
        }
        break

      case 'sync-commit':
        {
          if (cmdArgs.length === 0) {
            console.error('❌ 请指定提交消息')
            process.exit(1)
          }

          const [message, ...files] = cmdArgs

          // 解析选项
          const options: SmartSyncOptions = {
            showProgress: true,
            autoResolveConflicts: args.includes('--auto-resolve'),
            conflictStrategy: args.includes('--ours') ? 'ours' :
              args.includes('--theirs') ? 'theirs' : 'manual',
            confirmBeforeAction: !args.includes('--no-confirm')
          }

          console.log('🚀 开始智能同步提交...')
          const result = await git.syncCommit(message, files.length > 0 ? files : undefined, options)

          if (result.success) {
            console.log('\n✅ 智能同步提交成功!')
            console.log(`📝 ${result.message}`)

            if (result.steps.length > 0) {
              console.log('\n执行步骤:')
              result.steps.forEach(step => console.log(`  ${step}`))
            }
          } else {
            console.error('\n❌ 智能同步提交失败!')
            console.error(`📝 ${result.message}`)

            if (result.error) {
              console.error(`🔍 错误详情: ${result.error}`)
            }

            if (result.conflicts && !result.conflicts.resolved) {
              console.log('\n🔀 检测到合并冲突:')
              const resolver = new ConflictResolver(git)
              const suggestions = resolver.getResolutionSuggestions(result.conflicts.conflictFiles)
              suggestions.forEach(suggestion => console.log(suggestion))
            }

            if (result.rollbackAvailable) {
              console.log('\n💡 可以使用以下命令回滚:')
              console.log(`   ldesign-git rollback ${result.stashId || ''}`)
            }

            process.exit(1)
          }
        }
        break

      case 'rollback':
        {
          const stashId = cmdArgs[0]
          console.log('↩️ 开始回滚操作...')

          const result = await git.rollbackSync(stashId)

          if (result.success) {
            console.log('\n✅ 回滚成功!')
            console.log(`📝 ${result.message}`)

            if (result.steps.length > 0) {
              console.log('\n执行步骤:')
              result.steps.forEach(step => console.log(`  ${step}`))
            }
          } else {
            console.error('\n❌ 回滚失败!')
            console.error(`📝 ${result.message}`)
            if (result.error) {
              console.error(`🔍 错误详情: ${result.error}`)
            }
            process.exit(1)
          }
        }
        break

      case 'resolve':
        {
          const resolver = new ConflictResolver(git)

          // 检查是否有冲突
          const hasConflicts = await resolver.hasConflicts()
          if (!hasConflicts) {
            console.log('✅ 没有检测到合并冲突')
            break
          }

          // 获取冲突文件
          const conflictFiles = await resolver.getConflictFiles()
          if (!conflictFiles.success || !conflictFiles.data) {
            console.error('❌ 无法获取冲突文件信息')
            process.exit(1)
          }

          console.log('🔀 检测到以下冲突文件:')
          conflictFiles.data.forEach(file => {
            console.log(`  - ${file.path} (${file.status})`)
          })

          // 解析解决策略
          let strategy: 'ours' | 'theirs' | 'manual' = 'manual'
          if (args.includes('--ours')) {
            strategy = 'ours'
          } else if (args.includes('--theirs')) {
            strategy = 'theirs'
          }

          if (strategy !== 'manual') {
            console.log(`\n🔧 使用策略 "${strategy}" 自动解决冲突...`)

            const result = await resolver.resolveConflicts({
              strategy,
              autoResolve: true
            })

            if (result.resolved) {
              console.log('✅ 冲突已自动解决!')
              console.log('💡 请运行 git commit 完成合并')
            } else {
              console.error('❌ 自动解决冲突失败')
              console.log('💡 请手动解决剩余冲突:')
              result.unresolvedFiles.forEach(file => {
                console.log(`  - ${file}`)
              })
            }
          } else {
            // 手动解决模式，显示建议
            const suggestions = resolver.getResolutionSuggestions(conflictFiles.data)
            console.log('\n💡 解决建议:')
            suggestions.forEach(suggestion => console.log(suggestion))
          }
        }
        break

      default:
        console.error('❌ 未知命令:', command)
        console.log('使用 --help 查看可用命令')
        process.exit(1)
    }

  } catch (error) {
    if (error instanceof GitError) {
      console.error('❌ Git 错误:', error.getFormattedMessage())
    } else {
      console.error('❌ 未知错误:', error)
    }
    process.exit(1)
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 程序异常:', error)
  process.exit(1)
})
