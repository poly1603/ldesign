/**
 * 构建命令实现
 */

import { Command } from 'commander'
import chalk from 'chalk'
import { LibraryBuilder } from '../../core/LibraryBuilder'
import { logger } from '../../utils/logger'
import { formatFileSize, formatDuration } from '../../utils/format-utils'
import { ConfigLoader } from '../../utils/config/config-loader'
import type { BuilderConfig } from '../../types/config'

/**
 * 构建命令选项
 */
interface BuildOptions {
  config?: string
  bundler?: 'rollup' | 'rolldown'
  mode?: 'development' | 'production'
  input?: string
  output?: string
  format?: string
  minify?: boolean
  sourcemap?: boolean
  clean?: boolean
  analyze?: boolean
  watch?: boolean
}

/**
 * 创建构建命令
 */
export const buildCommand = new Command('build')
  .description('构建库文件')
  .option('-i, --input <path>', '指定入口文件')
  .option('-o, --output <dir>', '指定输出目录')
  .option('-f, --format <formats>', '指定输出格式 (esm,cjs,umd,iife)')
  .option('--minify', '启用代码压缩')
  .option('--no-minify', '禁用代码压缩')
  .option('--sourcemap', '生成 sourcemap')
  .option('--no-sourcemap', '不生成 sourcemap')
  .option('--clean', '构建前清理输出目录')
  .option('--no-clean', '构建前不清理输出目录')
  .option('--analyze', '分析打包结果')
  .option('-w, --watch', '监听文件变化')
  .action(async (options: BuildOptions, command: Command) => {
    try {
      await executeBuild(options, command.parent?.opts())
    } catch (error) {
      logger.error('构建失败:', error)
      process.exit(1)
    }
  })

/**
 * 执行构建
 */
async function executeBuild(options: BuildOptions, globalOptions: any = {}): Promise<void> {
  const startTime = Date.now()

  // 显示构建开始信息
  logger.start('开始构建...')

  try {
    // 创建构建器实例
    const builder = new LibraryBuilder({
      logger,
      autoDetect: true
    })

    // 初始化构建器
    await builder.initialize()

    // 构建配置
    const config = await buildConfig(options, globalOptions)

    // 显示配置信息
    showBuildInfo(config)

    // 执行构建
    let result
    if (options.watch) {
      logger.info('启动监听模式...')
      const watcher = await builder.buildWatch(config)

      // 监听构建事件
      watcher.on('change', (file) => {
        logger.info(`文件变化: ${file}`)
      })

      watcher.on('build', (result) => {
        showBuildResult(result, startTime)
      })

      // 保持进程运行
      process.on('SIGINT', async () => {
        logger.info('正在停止监听...')
        await watcher.close()
        await builder.dispose()
        process.exit(0)
      })

      logger.success('监听模式已启动，按 Ctrl+C 停止')
      return
    } else {
      result = await builder.build(config)
    }

    // 显示构建结果
    showBuildResult(result, startTime)

    // 分析打包结果
    if (options.analyze) {
      await analyzeBuildResult(result)
    }

    // 清理资源
    await builder.dispose()

    logger.complete('构建完成')

  } catch (error) {
    const duration = Date.now() - startTime
    logger.fail(`构建失败 (${formatDuration(duration)})`)
    throw error
  }
}

/**
 * 构建配置
 */
async function buildConfig(options: BuildOptions, globalOptions: any): Promise<BuilderConfig> {
  // 使用ConfigManager加载配置（包含默认配置合并）
  const { ConfigManager } = await import('../..')
  const configManager = new ConfigManager()
  let baseConfig: BuilderConfig = await configManager.loadConfig({})

  try {
    const configPath = options.config
    if (configPath) {
      logger.info(`加载配置文件: ${configPath}`)
      baseConfig = await configManager.loadConfig({ configFile: configPath })
    } else {
      // 查找配置文件
      const configLoader = new ConfigLoader()
      const foundConfigPath = await configLoader.findConfigFile()
      if (foundConfigPath) {
        logger.info(`加载配置文件: ${foundConfigPath}`)
        baseConfig = await configManager.loadConfig({ configFile: foundConfigPath })
      } else {
        logger.info('未找到配置文件，使用默认配置')
        baseConfig = await configManager.loadConfig({})
      }
    }
  } catch (error) {
    logger.warn('配置文件加载失败，使用默认配置:', (error as Error).message)
    baseConfig = await configManager.loadConfig({})
  }

  // 命令行选项覆盖配置文件
  const config: BuilderConfig = { ...baseConfig }

  // 基础配置
  if (options.input) {
    config.input = options.input
  }

  if (options.output) {
    config.output = { ...config.output, dir: options.output }
  }

  if (options.format) {
    const formats = options.format.split(',').map(f => f.trim())
    config.output = { ...config.output, format: formats as any }
  }

  // 构建选项
  if (options.minify !== undefined) {
    config.minify = options.minify
  }

  if (options.clean !== undefined) {
    config.clean = options.clean
  }

  // 输出选项
  if (options.sourcemap !== undefined) {
    config.output = { ...config.output, sourcemap: options.sourcemap }
  }

  // 全局选项
  if (globalOptions.bundler) {
    config.bundler = globalOptions.bundler
  }

  if (globalOptions.mode) {
    config.mode = globalOptions.mode
  }

  return config
}

/**
 * 显示构建信息
 */
function showBuildInfo(config: BuilderConfig): void {
  logger.info('构建配置:')

  if (config.input) {
    logger.info(`  入口: ${chalk.cyan(config.input)}`)
  }

  if (config.output?.dir) {
    logger.info(`  输出: ${chalk.cyan(config.output.dir)}`)
  }

  if (config.output?.format) {
    const formats = Array.isArray(config.output.format)
      ? config.output.format.join(', ')
      : config.output.format
    logger.info(`  格式: ${chalk.cyan(formats)}`)
  }

  if (config.bundler) {
    logger.info(`  打包器: ${chalk.cyan(config.bundler)}`)
  }

  if (config.mode) {
    logger.info(`  模式: ${chalk.cyan(config.mode)}`)
  }

  logger.newLine()
}

/**
 * 显示构建结果
 */
function showBuildResult(result: any, startTime: number): void {
  const duration = Date.now() - startTime

  logger.success(`构建成功 (${formatDuration(duration)})`)

  if (result.outputs && result.outputs.length > 0) {
    logger.info('输出文件:')

    for (const output of result.outputs) {
      const size = formatFileSize(output.size)
      const gzipSize = output.gzipSize ? ` (gzip: ${formatFileSize(output.gzipSize)})` : ''
      logger.info(`  ${chalk.cyan(output.fileName)} ${chalk.gray(size)}${chalk.gray(gzipSize)}`)
    }
  }

  if (result.warnings && result.warnings.length > 0) {
    logger.newLine()
    logger.warn(`发现 ${result.warnings.length} 个警告:`)
    for (const warning of result.warnings) {
      logger.warn(`  ${warning.message}`)
    }
  }

  logger.newLine()
}

/**
 * 分析构建结果
 */
async function analyzeBuildResult(result: any): Promise<void> {
  void result
  logger.info('正在分析打包结果...')

  // TODO: 实现打包分析功能
  // 可以显示：
  // - 模块依赖图
  // - 包大小分析
  // - 重复依赖检测
  // - 性能建议

  logger.info('分析完成')
}
