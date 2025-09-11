/**
 * 插件市场 CLI 命令
 * 
 * 提供插件的搜索、安装、卸载、更新等命令
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { pluginMarket, type PluginSearchOptions, type PluginCategory, type PluginType } from '../../core/PluginMarket'
import type { CliCommandDefinition, CliContext } from '../../types'
import chalk from 'chalk'

/**
 * 插件命令类
 */
export class PluginCommand implements CliCommandDefinition {
  name = 'plugin'
  aliases = ['p']
  description = '插件管理'
  usage = 'launcher plugin <subcommand> [options]'
  options = [
    { name: 'category', alias: 'c', description: '按类别过滤', type: 'string' as const },
    { name: 'type', alias: 't', description: '按类型过滤', type: 'string' as const },
    { name: 'official', description: '仅显示官方插件', type: 'boolean' as const },
    { name: 'installed', description: '仅显示已安装插件', type: 'boolean' as const },
    { name: 'sort', description: '排序字段', type: 'string' as const },
    { name: 'order', description: '排序方向', type: 'string' as const },
    { name: 'limit', description: '结果数量限制', type: 'string' as const },
    { name: 'version', alias: 'v', description: '指定版本', type: 'string' as const },
    { name: 'dev', alias: 'D', description: '安装到开发依赖', type: 'boolean' as const },
    { name: 'pm', description: '包管理器', type: 'string' as const },
    { name: 'skip-deps', description: '跳过依赖安装', type: 'boolean' as const },
    { name: 'outdated', description: '显示过时的插件', type: 'boolean' as const },
    { name: 'debug', description: '启用调试模式', type: 'boolean' as const },
    { name: 'silent', description: '静默模式', type: 'boolean' as const }
  ]

  subCommands = [
    {
      name: 'search',
      aliases: ['s'],
      description: '搜索插件',
      arguments: [{ name: 'query', description: '搜索关键词', required: false }],
      options: [
        { name: 'category', alias: 'c', description: '按类别过滤', type: 'string' as const },
        { name: 'type', alias: 't', description: '按类型过滤', type: 'string' as const },
        { name: 'official', description: '仅显示官方插件', type: 'boolean' as const },
        { name: 'installed', description: '仅显示已安装插件', type: 'boolean' as const },
        { name: 'sort', description: '排序字段', type: 'string' as const, default: 'downloads' },
        { name: 'order', description: '排序方向', type: 'string' as const, default: 'desc' },
        { name: 'limit', description: '结果数量限制', type: 'string' as const, default: '10' }
      ]
    },
    {
      name: 'install',
      aliases: ['i'],
      description: '安装插件',
      arguments: [{ name: 'name', description: '插件名称', required: true }],
      options: [
        { name: 'version', alias: 'v', description: '指定版本', type: 'string' as const },
        { name: 'dev', alias: 'D', description: '安装到开发依赖', type: 'boolean' as const },
        { name: 'pm', description: '包管理器', type: 'string' as const, default: 'npm' },
        { name: 'skip-deps', description: '跳过依赖安装', type: 'boolean' as const }
      ]
    },
    {
      name: 'uninstall',
      aliases: ['remove'],
      description: '卸载插件',
      arguments: [{ name: 'name', description: '插件名称', required: true }]
    },
    {
      name: 'update',
      aliases: ['upgrade'],
      description: '更新插件',
      arguments: [{ name: 'name', description: '插件名称 (不指定则更新所有)', required: false }],
      options: [
        { name: 'version', alias: 'v', description: '指定版本', type: 'string' as const }
      ]
    },
    {
      name: 'list',
      aliases: ['ls'],
      description: '列出已安装的插件',
      options: [
        { name: 'outdated', description: '显示过时的插件', type: 'boolean' as const }
      ]
    },
    {
      name: 'info',
      description: '查看插件详细信息',
      arguments: [{ name: 'name', description: '插件名称', required: true }]
    }
  ]
  examples = [
    {
      description: '搜索插件',
      command: 'launcher plugin search vue'
    },
    {
      description: '安装插件',
      command: 'launcher plugin install @ldesign/plugin-vue-devtools'
    },
    {
      description: '列出已安装插件',
      command: 'launcher plugin list'
    }
  ]

  /**
   * 验证命令参数
   */
  validate(context: CliContext): boolean | string {
    return true
  }

  /**
   * 执行命令
   */
  async handler(context: CliContext): Promise<void> {
    const logger = new Logger('Plugin', {
      level: context.options.silent ? 'silent' : (context.options.debug ? 'debug' : 'info'),
      colors: context.terminal.supportsColor
    })

    const subCommand = context.args[0] || 'search'
    const subArgs = context.args.slice(1)

    switch (subCommand) {
      case 'search':
      case 's':
        await this.handleSearch(logger, context, subArgs)
        break
      case 'install':
      case 'i':
        await this.handleInstall(logger, context, subArgs)
        break
      case 'uninstall':
      case 'remove':
        await this.handleUninstall(logger, context, subArgs)
        break
      case 'update':
      case 'upgrade':
        await this.handleUpdate(logger, context, subArgs)
        break
      case 'list':
      case 'ls':
        await this.handleList(logger, context)
        break
      case 'info':
        await this.handleInfo(logger, context, subArgs)
        break
      default:
        logger.error(`未知子命令: ${subCommand}`)
        logger.info('可用命令: search, install, uninstall, update, list, info')
    }
  }

  /**
   * 处理搜索命令
   */
  private async handleSearch(logger: Logger, context: CliContext, args: string[]): Promise<void> {
    try {
      const query = args[0]
      const options = context.options
      logger.info('正在搜索插件...')

      // 首次获取插件列表
      await pluginMarket.fetchPlugins()

      const searchOptions: PluginSearchOptions = {
        query,
        category: options.category as PluginCategory | undefined,
        type: options.type as PluginType | undefined,
        officialOnly: options.official,
        installedOnly: options.installed,
        sortBy: options.sort as 'name' | 'downloads' | 'rating' | 'updated' | undefined,
        sortOrder: options.order as 'asc' | 'desc' | undefined,
        limit: parseInt(options.limit || '10')
      }

      const results = pluginMarket.searchPlugins(searchOptions)
      logger.debug('搜索完成')

      if (results.length === 0) {
        logger.warn('未找到匹配的插件')
        return
      }

      // 显示搜索结果
      console.log(chalk.green(`\n找到 ${results.length} 个插件:\n`))
      
      results.forEach((plugin, index) => {
        const official = plugin.official ? chalk.blue('[官方]') : ''
        const installed = plugin.installed ? chalk.green('[已安装]') : ''
        const rating = '★'.repeat(Math.round(plugin.rating))
        
        console.log(`${chalk.cyan((index + 1).toString().padStart(2))}. ${chalk.bold(plugin.name)} ${official} ${installed}`)
        console.log(`    ${plugin.description}`)
        console.log(`    ${chalk.gray(`v${plugin.version} • ${plugin.downloads.toLocaleString()} 下载 • ${rating} (${plugin.reviewCount})`)}`)
        console.log(`    ${chalk.yellow(plugin.tags.join(', '))}`)
        console.log()
      })

    } catch (error) {
      logger.error('搜索插件失败', error)
    }
  }

  /**
   * 处理安装命令
   */
  private async handleInstall(logger: Logger, context: CliContext, args: string[]): Promise<void> {
    try {
      const name = args[0]
      if (!name) {
        logger.error('请指定要安装的插件名称')
        return
      }

      const options = context.options
      logger.info(`正在安装插件 ${name}...`)

      await pluginMarket.installPlugin(name, {
        version: options.version,
        dev: options.dev,
        packageManager: options.pm,
        skipDeps: options['skip-deps']
      })

      logger.success(`插件 ${name} 安装成功`)

    } catch (error) {
      logger.error('安装插件失败', error)
    }
  }

  /**
   * 处理卸载命令
   */
  private async handleUninstall(logger: Logger, context: CliContext, args: string[]): Promise<void> {
    try {
      const name = args[0]
      if (!name) {
        logger.error('请指定要卸载的插件名称')
        return
      }

      logger.info(`正在卸载插件 ${name}...`)
      
      await pluginMarket.uninstallPlugin(name)
      
      logger.success(`插件 ${name} 卸载成功`)

    } catch (error) {
      logger.error('卸载插件失败', error)
    }
  }

  /**
   * 处理更新命令
   */
  private async handleUpdate(logger: Logger, context: CliContext, args: string[]): Promise<void> {
    try {
      const name = args[0]
      const options = context.options

      if (name) {
        // 更新指定插件
        logger.info(`正在更新插件 ${name}...`)
        
        await pluginMarket.updatePlugin(name, options.version)
        
        logger.success(`插件 ${name} 更新成功`)
      } else {
        // 更新所有插件
        logger.info('正在检查插件更新...')
        
        const updates = await pluginMarket.checkUpdates()
        
        if (updates.length === 0) {
          logger.info('所有插件都是最新版本')
          return
        }

        logger.info(`发现 ${updates.length} 个插件有更新，正在更新...`)
        
        for (const update of updates) {
          logger.info(`正在更新 ${update.plugin.name}...`)
          await pluginMarket.updatePlugin(update.plugin.name)
        }
        
        logger.success(`成功更新 ${updates.length} 个插件`)
      }

    } catch (error) {
      logger.error('更新插件失败', error)
    }
  }

  /**
   * 处理列表命令
   */
  private async handleList(logger: Logger, context: CliContext): Promise<void> {
    try {
      const options = context.options
      const installedPlugins = pluginMarket.getInstalledPlugins()

      if (installedPlugins.length === 0) {
        logger.info('未安装任何插件')
        return
      }

      if (options.outdated) {
        logger.info('正在检查插件更新...')
        const updates = await pluginMarket.checkUpdates()

        if (updates.length === 0) {
          logger.info('所有插件都是最新版本')
          return
        }

        console.log(chalk.yellow(`\n发现 ${updates.length} 个插件有更新:\n`))
        
        updates.forEach((update, index) => {
          console.log(`${chalk.cyan((index + 1).toString().padStart(2))}. ${chalk.bold(update.plugin.name)}`)
          console.log(`    ${chalk.gray(`当前版本: ${update.currentVersion}`)}`)
          console.log(`    ${chalk.green(`最新版本: ${update.latestVersion}`)}`)
          console.log()
        })

      } else {
        console.log(chalk.green(`\n已安装 ${installedPlugins.length} 个插件:\n`))
        
        installedPlugins.forEach((plugin, index) => {
          const official = plugin.official ? chalk.blue('[官方]') : ''
          
          console.log(`${chalk.cyan((index + 1).toString().padStart(2))}. ${chalk.bold(plugin.name)} ${official}`)
          console.log(`    ${plugin.description}`)
          console.log(`    ${chalk.gray(`v${plugin.installedVersion} • ${plugin.category}`)}`)
          console.log()
        })
      }

    } catch (error) {
      logger.error('获取插件列表失败', error)
    }
  }

  /**
   * 处理信息命令
   */
  private async handleInfo(logger: Logger, context: CliContext, args: string[]): Promise<void> {
    try {
      const name = args[0]
      if (!name) {
        logger.error('请指定要查看的插件名称')
        return
      }

      logger.info(`正在获取插件信息: ${name}...`)
      
      const plugin = await pluginMarket.getPluginInfo(name)
      

      if (!plugin) {
        logger.error(`插件不存在: ${name}`)
        return
      }

      // 显示插件详细信息
      console.log()
      console.log(chalk.bold.cyan(`${plugin.name}`))
      
      const badges = []
      if (plugin.official) badges.push(chalk.blue('[官方]'))
      if (plugin.installed) badges.push(chalk.green('[已安装]'))
      if (badges.length > 0) console.log(badges.join(' '))
      
      console.log()
      console.log(chalk.bold('描述:'))
      console.log(`  ${plugin.description}`)
      
      console.log()
      console.log(chalk.bold('基本信息:'))
      console.log(`  版本: ${plugin.version}`)
      console.log(`  作者: ${plugin.author.name}`)
      console.log(`  许可证: ${plugin.license}`)
      console.log(`  类别: ${plugin.category}`)
      console.log(`  类型: ${plugin.type}`)
      
      console.log()
      console.log(chalk.bold('统计信息:'))
      console.log(`  下载量: ${plugin.downloads.toLocaleString()}`)
      console.log(`  评分: ${'★'.repeat(Math.round(plugin.rating))} (${plugin.reviewCount} 评价)`)
      console.log(`  最后更新: ${new Date(plugin.lastUpdated).toLocaleDateString()}`)
      
      if (plugin.tags.length > 0) {
        console.log()
        console.log(chalk.bold('标签:'))
        console.log(`  ${plugin.tags.join(', ')}`)
      }
      
      if (plugin.repository || plugin.homepage || plugin.documentation) {
        console.log()
        console.log(chalk.bold('链接:'))
        if (plugin.repository) console.log(`  仓库: ${plugin.repository}`)
        if (plugin.homepage) console.log(`  主页: ${plugin.homepage}`)
        if (plugin.documentation) console.log(`  文档: ${plugin.documentation}`)
      }

      if (Object.keys(plugin.dependencies).length > 0) {
        console.log()
        console.log(chalk.bold('依赖:'))
        Object.entries(plugin.dependencies).forEach(([dep, version]) => {
          console.log(`  ${dep}: ${version}`)
        })
      }

      if (Object.keys(plugin.peerDependencies).length > 0) {
        console.log()
        console.log(chalk.bold('对等依赖:'))
        Object.entries(plugin.peerDependencies).forEach(([dep, version]) => {
          console.log(`  ${dep}: ${version}`)
        })
      }

      if (plugin.examples && plugin.examples.length > 0) {
        console.log()
        console.log(chalk.bold('使用示例:'))
        plugin.examples.forEach((example, index) => {
          console.log(`  ${index + 1}. ${example.title}`)
          console.log(`     ${example.description}`)
          console.log(`     ${chalk.gray(JSON.stringify(example.config, null, 6))}`)
        })
      }

      console.log()

    } catch (error) {
      logger.error('获取插件信息失败', error)
    }
  }
}
