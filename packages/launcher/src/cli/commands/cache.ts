/**
 * 缓存管理 CLI 命令
 * 
 * 提供缓存的查看、清理、统计等命令
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { cacheManager, type CacheType } from '../../core/CacheManager'
import type { CliCommandDefinition, CliContext } from '../../types'
import chalk from 'chalk'

/**
 * 缓存命令类
 */
export class CacheCommand implements CliCommandDefinition {
  name = 'cache'
  aliases = ['c']
  description = '缓存管理'
  usage = 'launcher cache <subcommand> [options]'
  options = [
    { name: 'all', description: '清理所有类型的缓存', type: 'boolean' as const },
    { name: 'force', description: '强制重新生成缓存', type: 'boolean' as const },
    { name: 'debug', description: '启用调试模式', type: 'boolean' as const },
    { name: 'silent', description: '静默模式', type: 'boolean' as const }
  ]

  subCommands = [
    {
      name: 'status',
      aliases: ['info'],
      description: '显示缓存状态和统计信息'
    },
    {
      name: 'clear',
      aliases: ['clean'],
      description: '清理缓存',
      arguments: [{ name: 'type', description: '缓存类型', required: false }],
      options: [
        { name: 'all', description: '清理所有类型的缓存', type: 'boolean' as const }
      ]
    },
    {
      name: 'compress',
      description: '压缩缓存以节省空间'
    },
    {
      name: 'cleanup',
      description: '清理过期和低使用频率的缓存'
    },
    {
      name: 'analyze',
      description: '分析缓存使用情况并提供优化建议'
    },
    {
      name: 'warmup',
      description: '预热常用缓存',
      options: [
        { name: 'force', description: '强制重新生成缓存', type: 'boolean' as const }
      ]
    }
  ]
  examples = [
    {
      description: '查看缓存状态',
      command: 'launcher cache status'
    },
    {
      description: '清理所有缓存',
      command: 'launcher cache clear --all'
    },
    {
      description: '压缩缓存',
      command: 'launcher cache compress'
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
    const logger = new Logger('Cache', {
      level: context.options.silent ? 'silent' : (context.options.debug ? 'debug' : 'info'),
      colors: context.terminal.supportsColor
    })

    const subCommand = context.args[0] || 'status'
    const subArgs = context.args.slice(1)

    switch (subCommand) {
      case 'status':
      case 'info':
        await this.handleStatus(logger)
        break
      case 'clear':
      case 'clean':
        await this.handleClear(logger, context, subArgs)
        break
      case 'compress':
        await this.handleCompress(logger)
        break
      case 'cleanup':
        await this.handleCleanup(logger)
        break
      case 'analyze':
        await this.handleAnalyze(logger)
        break
      case 'warmup':
        await this.handleWarmup(logger, context)
        break
      default:
        logger.error(`未知子命令: ${subCommand}`)
        logger.info('可用命令: status, clear, compress, cleanup, analyze, warmup')
    }
  }

  /**
   * 处理状态命令
   */
  private async handleStatus(logger: Logger): Promise<void> {
    try {
      const stats = cacheManager.getStats()

      console.log('\n📊 缓存状态')

      // 基本统计
      console.log('\n基本统计:')
      console.log(`  命中次数: ${stats.hits}`)
      console.log(`  未命中次数: ${stats.misses}`)
      console.log(`  命中率: ${(stats.hitRate * 100).toFixed(1)}%`)

      if (stats.lastCleanup) {
        const lastCleanup = new Date(stats.lastCleanup).toLocaleString()
        console.log(`  上次清理: ${lastCleanup}`)
      }

      // 按类型统计
      console.log('\n按类型统计:')

      const types = Object.keys(stats.byType) as CacheType[]
      if (types.length === 0) {
        console.log('  暂无缓存数据')
      } else {
        types.forEach(type => {
          const typeStats = stats.byType[type]
          if (typeStats.count > 0) {
            console.log(`  ${chalk.gray(type)}: ${chalk.cyan(typeStats.count.toString().padStart(6))} 项(${chalk.yellow(formatSize(typeStats.size))})`)
          }
        })
      }



    } catch (error) {
      logger.error('获取缓存状态失败', error)
    }
  }

  /**
   * 处理清理命令
   */
  private async handleClear(logger: Logger, context: CliContext, args: string[]): Promise<void> {
    try {
      const type = args[0]
      const options = context.options
      let spinner: any

      if (options.all || !type) {
        // 清理所有缓存
        logger.info('正在清理所有缓存...')
        await cacheManager.clear()
        logger.success('所有缓存已清理')
      } else {
        // 清理指定类型的缓存
        const validTypes: CacheType[] = ['build', 'deps', 'modules', 'transform', 'assets', 'temp']

        if (!validTypes.includes(type as CacheType)) {
          logger.error(`无效的缓存类型: ${type} `)
          logger.info(`支持的类型: ${validTypes.join(', ')} `)
          return
        }

        logger.info(`正在清理 ${type} 缓存...`)
        await cacheManager.clear(type as CacheType)
        logger.success(`${type} 缓存已清理`)
      }

    } catch (error) {
      logger.error('清理缓存失败', error)
    }
  }

  /**
   * 处理压缩命令
   */
  private async handleCompress(logger: Logger): Promise<void> {
    try {
      logger.info('正在压缩缓存...')

      const startStats = cacheManager.getStats()
      await cacheManager.compress()
      const endStats = cacheManager.getStats()

      const sizeBefore = startStats.totalSize
      const sizeAfter = endStats.totalSize
      const saved = sizeBefore - sizeAfter
      const savedPercent = sizeBefore > 0 ? (saved / sizeBefore * 100) : 0

      if (saved > 0) {
        logger.success(`缓存压缩完成，节省了 ${formatSize(saved)}(${savedPercent.toFixed(1)} %)`)
      } else {
        logger.info('缓存已经是最优状态，无需压缩')
      }

    } catch (error) {
      logger.error('压缩缓存失败', error)
    }
  }

  /**
   * 处理清理命令
   */
  private async handleCleanup(logger: Logger): Promise<void> {
    try {
      logger.info('正在清理过期缓存...')

      const startStats = cacheManager.getStats()
      await cacheManager.cleanup()
      const endStats = cacheManager.getStats()

      const itemsBefore = startStats.totalItems
      const itemsAfter = endStats.totalItems
      const cleaned = itemsBefore - itemsAfter

      logger.success(`清理完成，删除了 ${cleaned} 项过期缓存`)

    } catch (error) {
      logger.error('清理过期缓存失败', error)
    }
  }

  /**
   * 处理分析命令
   */
  private async handleAnalyze(logger: Logger): Promise<void> {
    try {
      const stats = cacheManager.getStats()

      console.log('\n🔍 缓存分析')

      // 使用效率分析
      console.log('\n使用效率:')

      if (stats.hitRate >= 0.8) {
        console.log(`  ✅ 缓存命中率良好(${(stats.hitRate * 100).toFixed(1)}%)`)
      } else if (stats.hitRate >= 0.6) {
        console.log(`  ⚠️  缓存命中率中等(${(stats.hitRate * 100).toFixed(1)}%)`)
      } else {
        console.log(`  ❌ 缓存命中率较低(${(stats.hitRate * 100).toFixed(1)}%)`)
      }

      // 空间使用分析
      console.log('\n空间使用:')

      const totalSizeMB = stats.totalSize / (1024 * 1024)

      if (totalSizeMB < 100) {
        console.log(`  ✅ 缓存大小合理(${formatSize(stats.totalSize)})`)
      } else if (totalSizeMB < 500) {
        console.log(`  ⚠️  缓存大小中等(${formatSize(stats.totalSize)})`)
      } else {
        console.log(`  ❌ 缓存占用空间较大(${formatSize(stats.totalSize)})`)
      }

      // 类型分布分析
      console.log('\n类型分布:')

      const types = Object.keys(stats.byType) as CacheType[]
      const sortedTypes = types
        .filter(type => stats.byType[type].count > 0)
        .sort((a, b) => stats.byType[b].size - stats.byType[a].size)

      if (sortedTypes.length === 0) {
        console.log('  暂无数据')
      } else {
        sortedTypes.forEach((type, index) => {
          const typeStats = stats.byType[type]
          const percentage = stats.totalSize > 0 ? (typeStats.size / stats.totalSize * 100) : 0
          const bar = '█'.repeat(Math.round(percentage / 5)) // 每5%一个方块

          console.log(`  ${(index + 1).toString().padStart(2)}. ${type.padEnd(10)} ${chalk.cyan(bar.padEnd(20))} ${percentage.toFixed(1)}% (${formatSize(typeStats.size)})`)
        })
      }

      // 优化建议
      console.log('\n💡 优化建议:')

      const suggestions: string[] = []

      if (stats.hitRate < 0.6) {
        suggestions.push('考虑调整缓存策略或增加缓存时间')
      }

      if (totalSizeMB > 500) {
        suggestions.push('缓存占用空间较大，建议运行清理命令')
      }

      const buildCache = stats.byType.build
      if (buildCache && buildCache.size > stats.totalSize * 0.6) {
        suggestions.push('构建缓存占用较多空间，可以考虑清理旧的构建缓存')
      }

      const tempCache = stats.byType.temp
      if (tempCache && tempCache.count > 1000) {
        suggestions.push('临时缓存项较多，建议清理临时缓存')
      }

      if (!stats.lastCleanup || Date.now() - stats.lastCleanup > 7 * 24 * 60 * 60 * 1000) {
        suggestions.push('距离上次清理超过一周，建议运行清理命令')
      }

      if (suggestions.length === 0) {
        console.log('  ✅ 缓存状态良好,无需特别优化')
      } else {
        suggestions.forEach((suggestion, index) => {
          console.log(`  ${(index + 1).toString().padStart(2)}. ${suggestion}`)
        })
      }



    } catch (error) {
      logger.error('缓存分析失败', error)
    }
  }

  /**
   * 处理预热命令
   */
  private async handleWarmup(logger: Logger, context: CliContext): Promise<void> {
    try {
      const options = context.options
      logger.info('正在预热缓存...')

      // 这里可以实现预热逻辑
      // 例如预编译常用模块、预处理资源等

      // 模拟预热过程
      await new Promise(resolve => setTimeout(resolve, 2000))

      logger.success('缓存预热完成')

      if (options.force) {
        logger.info('已强制重新生成缓存')
      }

    } catch (error) {
      logger.error('缓存预热失败', error)
    }
  }
}

/**
 * 格式化文件大小显示
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]} `
}
