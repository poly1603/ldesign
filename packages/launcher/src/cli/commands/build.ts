/**
 * Build 命令实现
 * 
 * 执行生产构建命令
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { FileSystem } from '../../utils/file-system'
import { PathUtils } from '../../utils/path-utils'
import { ViteLauncher } from '../../core/ViteLauncher'
import type { CliCommandDefinition, CliContext } from '../../types'
import { DEFAULT_OUT_DIR, DEFAULT_BUILD_TARGET } from '../../constants'

/**
 * Build 命令类
 */
export class BuildCommand implements CliCommandDefinition {
  name = 'build'
  aliases = ['bundle']
  description = '执行生产构建'
  usage = 'launcher build [options]'

  options = [
    {
      name: 'outDir',
      alias: 'o',
      description: '指定输出目录',
      type: 'string' as const,
      default: DEFAULT_OUT_DIR
    },
    {
      name: 'sourcemap',
      alias: 's',
      description: '生成 sourcemap 文件',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'minify',
      alias: 'm',
      description: '压缩代码',
      type: 'boolean' as const,
      default: true
    },
    {
      name: 'watch',
      alias: 'w',
      description: '启用监听模式',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'target',
      alias: 't',
      description: '指定构建目标',
      type: 'string' as const,
      default: DEFAULT_BUILD_TARGET
    },
    {
      name: 'report',
      alias: 'r',
      description: '生成构建报告',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'emptyOutDir',
      description: '构建前清空输出目录',
      type: 'boolean' as const,
      default: true
    },
    {
      name: 'ssr',
      description: '启用服务端渲染构建',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'analyze',
      description: '分析构建产物',
      type: 'boolean' as const,
      default: false
    }
  ]

  examples = [
    {
      description: '执行生产构建',
      command: 'launcher build'
    },
    {
      description: '指定输出目录',
      command: 'launcher build --outDir build'
    },
    {
      description: '生成 sourcemap',
      command: 'launcher build --sourcemap'
    },
    {
      description: '启用监听模式',
      command: 'launcher build --watch'
    },
    {
      description: '生成构建报告',
      command: 'launcher build --report'
    },
    {
      description: '分析构建产物',
      command: 'launcher build --analyze'
    }
  ]

  /**
   * 验证命令参数
   * 
   * @param context - CLI 上下文
   * @returns 验证结果
   */
  validate(context: CliContext): boolean | string {
    const { options } = context

    // 验证输出目录
    if (options.outDir && typeof options.outDir !== 'string') {
      return '输出目录必须是字符串'
    }

    // 验证构建目标
    if (options.target && typeof options.target !== 'string') {
      return '构建目标必须是字符串'
    }

    return true
  }

  /**
   * 执行命令
   * 
   * @param context - CLI 上下文
   */
  async handler(context: CliContext): Promise<void> {
    const logger = new Logger('build', {
      level: context.options.debug ? 'debug' : 'info',
      colors: context.terminal.supportsColor
    })

    try {
      const startTime = Date.now()

      logger.info('正在执行生产构建...')

      // 解析输出目录
      const outDir = PathUtils.resolve(context.cwd, context.options.outDir || DEFAULT_OUT_DIR)

      // 检查输出目录
      if (context.options.emptyOutDir && await FileSystem.exists(outDir)) {
        logger.info('正在清空输出目录...', { outDir })
        await FileSystem.remove(outDir)
      }

      // 创建 ViteLauncher 实例
      const launcher = new ViteLauncher({
        cwd: context.cwd,
        config: {
          // 顶层 mode 仍保留，以便 Vite 正确识别
          mode: context.options.mode || 'production',
          build: {
            outDir,
            sourcemap: context.options.sourcemap || false,
            minify: context.options.minify !== false,
            target: context.options.target || DEFAULT_BUILD_TARGET,
            emptyOutDir: context.options.emptyOutDir !== false,
            reportCompressedSize: context.options.report || false,
            ssr: context.options.ssr || false,
            watch: context.options.watch ? {} : undefined
          },
          launcher: {
            logLevel: context.options.debug ? 'debug' : 'info',
            mode: context.options.mode || 'production',
            debug: context.options.debug || false,
            // 关键修复：将 CLI --config 映射到 launcher.configFile，供 ConfigManager 使用
            configFile: context.configFile
          }
        }
      })

      // 设置事件监听器
      launcher.on('buildStart', (data) => {
        logger.info('构建开始', { timestamp: new Date(data.timestamp).toLocaleTimeString() })
      })

      launcher.on('buildEnd', (data) => {
        const duration = data.duration
        logger.success('构建完成', {
          duration: `${duration}ms`,
          timestamp: new Date(data.timestamp).toLocaleTimeString()
        })

        // 显示构建统计信息
        if (data.result && 'output' in data.result) {
          const output = data.result.output
          if (Array.isArray(output)) {
            logger.info(`生成了 ${output.length} 个文件`)

            // 显示主要文件信息
            const jsFiles = output.filter(file => file.fileName.endsWith('.js'))
            const cssFiles = output.filter(file => file.fileName.endsWith('.css'))

            if (jsFiles.length > 0) {
              logger.info(`JavaScript 文件: ${jsFiles.length} 个`)
            }

            if (cssFiles.length > 0) {
              logger.info(`CSS 文件: ${cssFiles.length} 个`)
            }
          }
        }
      })

      launcher.onError((error) => {
        logger.error('构建错误', { error: error.message })
      })

      // 处理监听模式的退出
      if (context.options.watch) {
        process.on('SIGINT', async () => {
          logger.info('正在停止监听模式...')
          try {
            await launcher.destroy()
            logger.success('监听模式已停止')
            process.exit(0)
          } catch (error) {
            logger.error('停止监听模式失败', { error: (error as Error).message })
            process.exit(1)
          }
        })

        process.on('SIGTERM', async () => {
          logger.info('收到终止信号，正在停止监听模式...')
          try {
            await launcher.destroy()
            process.exit(0)
          } catch (error) {
            logger.error('停止监听模式失败', { error: (error as Error).message })
            process.exit(1)
          }
        })
      }

      // 执行构建
      if (context.options.watch) {
        logger.info('启动监听模式构建...')
        await launcher.buildWatch()

        logger.success('监听模式已启动，按 Ctrl+C 停止')

        // 保持进程运行
        await new Promise(() => { })
      } else {
        const result = await launcher.build()

        const duration = Date.now() - startTime

        // 显示构建结果
        logger.success('构建成功完成!', {
          duration: `${duration}ms`,
          outDir
        })

        // 显示输出目录信息
        if (await FileSystem.exists(outDir)) {
          const stats = await FileSystem.stat(outDir)
          logger.info('输出目录信息', {
            path: outDir,
            size: formatFileSize(await getDirectorySize(outDir))
          })
        }

        // 生成分析报告
        if (context.options.analyze) {
          logger.info('正在生成构建分析报告...')
          await generateAnalysisReport(result, outDir, logger)
        }

        // 清理资源
        await launcher.destroy()

        // 构建完成后确保退出进程，避免悬挂
        if (!context.options.watch) {
          process.exit(0)
        }
      }

    } catch (error) {
      logger.error('构建失败', { error: (error as Error).message })

      if (context.options.debug) {
        console.error((error as Error).stack)
      }

      // 提供一些常见错误的解决建议
      const errorMessage = (error as Error).message.toLowerCase()

      if (errorMessage.includes('out of memory') || errorMessage.includes('heap')) {
        logger.info('内存不足，请尝试：')
        logger.info('1. 增加 Node.js 内存限制: NODE_OPTIONS="--max-old-space-size=4096"')
        logger.info('2. 减少并发构建任务')
        logger.info('3. 优化代码和依赖')
      }

      if (errorMessage.includes('permission') || errorMessage.includes('eacces')) {
        logger.info('权限问题，请检查：')
        logger.info('1. 输出目录的写入权限')
        logger.info('2. 是否有其他进程占用文件')
        logger.info('3. 使用管理员权限运行')
      }

      if (errorMessage.includes('module not found') || errorMessage.includes('cannot resolve')) {
        logger.info('模块解析问题，请检查：')
        logger.info('1. 依赖是否正确安装')
        logger.info('2. 导入路径是否正确')
        logger.info('3. 配置文件中的别名设置')
      }

      process.exit(1)
    }
  }
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @returns 格式化后的大小
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * 获取目录大小
 * 
 * @param dirPath - 目录路径
 * @returns 目录大小（字节）
 */
async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const files = await FileSystem.readDir(dirPath)
    let totalSize = 0

    for (const file of files) {
      const filePath = PathUtils.join(dirPath, file)
      const stats = await FileSystem.stat(filePath)

      if (stats.isDirectory()) {
        totalSize += await getDirectorySize(filePath)
      } else {
        totalSize += stats.size
      }
    }

    return totalSize
  } catch (error) {
    return 0
  }
}

/**
 * 生成构建分析报告
 * 
 * @param result - 构建结果
 * @param outDir - 输出目录
 * @param logger - 日志记录器
 */
async function generateAnalysisReport(result: any, outDir: string, logger: Logger): Promise<void> {
  try {
    // 这里可以集成构建分析工具，如 rollup-plugin-analyzer
    // 目前只是简单的文件统计

    const reportPath = PathUtils.join(outDir, 'build-report.json')
    const report = {
      timestamp: new Date().toISOString(),
      files: [] as Array<{ fileName: any; size: any; type: string }>,
      summary: {
        totalFiles: 0,
        totalSize: 0,
        jsFiles: 0,
        cssFiles: 0,
        assetFiles: 0
      }
    }

    // 分析输出文件
    if (result && 'output' in result && Array.isArray(result.output)) {
      for (const file of result.output) {
        const fileInfo = {
          fileName: file.fileName,
          size: file.source ? file.source.length : 0,
          type: getFileType(file.fileName)
        }

        report.files.push(fileInfo)
        report.summary.totalFiles++
        report.summary.totalSize += fileInfo.size

        if (fileInfo.type === 'js') {
          report.summary.jsFiles++
        } else if (fileInfo.type === 'css') {
          report.summary.cssFiles++
        } else {
          report.summary.assetFiles++
        }
      }
    }

    // 保存报告
    await FileSystem.writeFile(reportPath, JSON.stringify(report, null, 2))

    logger.success('构建分析报告已生成', { path: reportPath })

  } catch (error) {
    logger.warn('生成构建分析报告失败', { error: (error as Error).message })
  }
}

/**
 * 获取文件类型
 * 
 * @param fileName - 文件名
 * @returns 文件类型
 */
function getFileType(fileName: string): string {
  const ext = PathUtils.extname(fileName).toLowerCase()

  if (['.js', '.mjs', '.cjs'].includes(ext)) {
    return 'js'
  } else if (ext === '.css') {
    return 'css'
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
    return 'image'
  } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
    return 'font'
  } else {
    return 'asset'
  }
}
