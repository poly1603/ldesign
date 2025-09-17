/**
 * Preview 命令实现
 * 
 * 预览构建结果命令
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { FileSystem } from '../../utils/file-system'
import { PathUtils } from '../../utils/path-utils'
import { ViteLauncher } from '../../core/ViteLauncher'
import { networkInterfaces } from 'node:os'
import type { CliCommandDefinition, CliContext } from '../../types'
import { DEFAULT_HOST, DEFAULT_OUT_DIR } from '../../constants'
import pc from 'picocolors'

/**
 * Preview 命令类
 */
export class PreviewCommand implements CliCommandDefinition {
  name = 'preview'
  aliases = ['serve-build']
  description = '预览构建结果'
  usage = 'launcher preview [options]'

  options = [
    {
      name: 'port',
      alias: 'p',
      description: '指定端口号',
      type: 'number' as const,
      default: 4173
    },
    {
      name: 'host',
      alias: 'H',
      description: '指定主机地址',
      type: 'string' as const,
      default: DEFAULT_HOST
    },
    {
      name: 'open',
      alias: 'o',
      description: '自动打开浏览器',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'https',
      description: '启用 HTTPS',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'outDir',
      description: '指定构建输出目录',
      type: 'string' as const,
      default: DEFAULT_OUT_DIR
    },
    {
      name: 'cors',
      description: '启用 CORS',
      type: 'boolean' as const,
      default: true
    },
    {
      name: 'strictPort',
      description: '严格端口模式',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'environment',
      alias: 'e',
      description: '指定环境名称（development, production, test, staging, preview）',
      type: 'string' as const
    }
  ]

  examples = [
    {
      description: '预览构建结果',
      command: 'launcher preview'
    },
    {
      description: '在指定端口预览',
      command: 'launcher preview --port 8080'
    },
    {
      description: '允许外部访问',
      command: 'launcher preview --host 0.0.0.0'
    },
    {
      description: '启动后自动打开浏览器',
      command: 'launcher preview --open'
    },
    {
      description: '预览指定目录的构建结果',
      command: 'launcher preview --outDir build'
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

    // 验证端口号
    if (options.port) {
      const port = Number(options.port)
      if (isNaN(port) || port < 1 || port > 65535) {
        return '端口号必须是 1-65535 之间的数字'
      }
    }

    // 验证主机地址
    if (options.host && typeof options.host !== 'string') {
      return '主机地址必须是字符串'
    }

    // 验证输出目录
    if (options.outDir && typeof options.outDir !== 'string') {
      return '输出目录必须是字符串'
    }

    return true
  }

  /**
   * 执行命令
   * 
   * @param context - CLI 上下文
   */
  async handler(context: CliContext): Promise<void> {
    const logger = new Logger('preview', {
      level: context.options.debug ? 'debug' : 'info',
      colors: context.terminal.supportsColor
    })

    try {
      logger.info('正在启动预览服务器...')

      // 解析输出目录
      const outDir = PathUtils.resolve(context.cwd, context.options.outDir || DEFAULT_OUT_DIR)

      // 检查构建输出目录是否存在
      if (!(await FileSystem.exists(outDir))) {
        logger.error('构建输出目录不存在', { outDir })
        logger.info('请先执行构建命令: launcher build')
        process.exit(1)
      }

      // 检查是否有构建产物
      const files = await FileSystem.readDir(outDir)
      if (files.length === 0) {
        logger.error('构建输出目录为空', { outDir })
        logger.info('请先执行构建命令: launcher build')
        process.exit(1)
      }

      // 检查是否有 index.html
      const indexPath = PathUtils.join(outDir, 'index.html')
      if (!(await FileSystem.exists(indexPath))) {
        logger.warn('未找到 index.html 文件', { path: indexPath })
        logger.info('预览服务器将提供目录浏览功能')
      }

      // 创建 ViteLauncher 实例
      const launcher = new ViteLauncher({
        cwd: context.cwd,
        config: {
          configFile: context.configFile
        }
      })

      // 初始化以加载配置文件
      await launcher.initialize()

      // 获取配置文件中的preview配置
      const config = launcher.getConfig()
      const previewConfig = config.preview || {}

      // 合并命令行参数和配置文件中的preview配置（命令行参数优先）
      const finalPreviewConfig: any = {
        host: context.options.host || previewConfig.host || DEFAULT_HOST,
        port: context.options.port || previewConfig.port || 4173,
        open: context.options.open ?? previewConfig.open ?? false,
        cors: context.options.cors !== false && (previewConfig.cors !== false),
        strictPort: context.options.strictPort || false
      }

      // 处理HTTPS配置
      if (context.options.https) {
        finalPreviewConfig.https = true
      } else if (previewConfig.https) {
        finalPreviewConfig.https = previewConfig.https
      }

      // 合并配置到launcher
      const mergedConfig = launcher.mergeConfig(launcher.getConfig(), {
        build: {
          outDir
        },
        preview: finalPreviewConfig,
        launcher: {
          logLevel: context.options.debug ? 'debug' : 'info',
          debug: context.options.debug || false
        }
      })

      // 更新launcher的配置
      launcher['config'] = mergedConfig

      // 渲染服务器横幅的辅助函数
      function renderServerBanner(
        title: string,
        items: Array<{ label: string; value: string }>
      ): string[] {
        const leftPad = '  '
        const labelPad = 4
        const rows = [
          `${pc.green('✔')} ${pc.bold(title)}`,
          ...items.map(({ label, value }) => {
            const l = (label + ':').padEnd(labelPad, ' ')
            return `${pc.dim('•')} ${pc.bold(l)} ${pc.cyan(value)}`
          }),
          `${pc.dim('•')} 提示: 按 ${pc.yellow('Ctrl+C')} 停止服务器`
        ]

        // 根据内容计算盒宽度
        const contentWidth = rows.reduce((m, s) => Math.max(m, stripAnsi(s).length), 0)
        const width = Math.min(Math.max(contentWidth + 4, 38), 80)
        const top = pc.dim('┌' + '─'.repeat(width - 2) + '┐')
        const bottom = pc.dim('└' + '─'.repeat(width - 2) + '┘')

        const padded = rows.map(r => {
          const visible = stripAnsi(r)
          const space = width - 2 - visible.length
          return pc.dim('│') + leftPad + r + ' '.repeat(Math.max(0, space - leftPad.length)) + pc.dim('│')
        })

        return [top, ...padded, bottom]
      }

      // 去除 ANSI 颜色后的长度计算辅助
      function stripAnsi(str: string) {
        // eslint-disable-next-line no-control-regex
        const ansiRegex = /[\u001B\u009B][[\]()#;?]*(?:((?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g
        return str.replace(ansiRegex, '')
      }

      // 设置事件监听器
      launcher.onReady(async () => {
        logger.success('预览服务器启动成功!')

        const host = finalPreviewConfig.host
        const port = finalPreviewConfig.port
        const protocol = finalPreviewConfig.https ? 'https' : 'http'
        const localUrl = `${protocol}://${host}:${port}`

        // 构建网络 URL：如果 host 是 0.0.0.0，则替换为本地 IP
        let networkUrl: string | null = null
        if (host === '0.0.0.0') {
          const localIP = getLocalIP()
          networkUrl = localUrl.replace('0.0.0.0', localIP)
        }

        const title = '预览服务器已启动'
        const entries: Array<{ label: string; value: string }> = [
          { label: '本地', value: localUrl }
        ]
        if (networkUrl) entries.push({ label: '网络', value: networkUrl })
        entries.push({ label: '目录', value: outDir })

        const boxLines = renderServerBanner(title, entries)
        for (const line of boxLines) logger.info(line)

        // 生成二维码
        const qrTarget = (networkUrl || localUrl)
        try {
          if (!qrTarget) throw new Error('empty-url')

          // 优先尝试使用 'qrcode' 的 UTF-8 终端输出
          let printed = false
          try {
            const qrlib: any = await import('qrcode')
            const utf8 = await (qrlib?.default || qrlib).toString(qrTarget, { type: 'utf8' })
            if (utf8 && typeof utf8 === 'string') {
              logger.info(pc.dim('二维码（扫码在手机上打开）：'))
              console.log('\n' + utf8 + '\n')
              printed = true
            }
          } catch (e1) {
            logger.debug('尝试使用 qrcode 生成终端二维码失败', { error: (e1 as Error).message })
          }

          // 回退到 qrcode-terminal（如已安装）
          if (!printed) {
            try {
              const mod: any = await import('qrcode-terminal')
              const qrt = mod?.default || mod
              let qrOutput = ''
              qrt.generate(qrTarget, { small: true }, (q: string) => {
                qrOutput = q
              })
              if (qrOutput) {
                logger.info(pc.dim('二维码（扫码在手机上打开）：'))
                console.log('\n' + qrOutput + '\n')
                printed = true
              }
            } catch (e2) {
              logger.debug('尝试使用 qrcode-terminal 生成终端二维码失败', { error: (e2 as Error).message })
            }
          }
        } catch (e) {
          logger.debug('二维码生成失败', { error: (e as Error).message })
        }
      })

      launcher.onError((error) => {
        logger.error('预览服务器错误', { error: error.message })
      })

      // 处理进程退出
      process.on('SIGINT', async () => {
        logger.info('正在停止预览服务器...')
        try {
          await launcher.destroy()
          logger.success('预览服务器已停止')
          process.exit(0)
        } catch (error) {
          logger.error('停止预览服务器失败', { error: (error as Error).message })
          process.exit(1)
        }
      })

      process.on('SIGTERM', async () => {
        logger.info('收到终止信号，正在停止预览服务器...')
        try {
          await launcher.destroy()
          process.exit(0)
        } catch (error) {
          logger.error('停止预览服务器失败', { error: (error as Error).message })
          process.exit(1)
        }
      })

      // 启动预览服务器
      await launcher.preview()

      // 显示构建信息
      await showBuildInfo(outDir, logger)

      // 保持进程运行
      await new Promise(() => { }) // 永远等待，直到收到退出信号

    } catch (error) {
      logger.error('启动预览服务器失败', { error: (error as Error).message })

      if (context.options.debug) {
        console.error((error as Error).stack)
      }

      // 提供一些常见错误的解决建议
      const errorMessage = (error as Error).message.toLowerCase()

      if (errorMessage.includes('eaddrinuse') || errorMessage.includes('port')) {
        logger.info('端口可能被占用，请尝试：')
        logger.info('1. 使用不同的端口: launcher preview --port 8080')
        logger.info('2. 检查是否有其他服务占用该端口')
        logger.info('3. 使用 --strictPort 选项禁用自动端口选择')
      }

      if (errorMessage.includes('enoent') || errorMessage.includes('not found')) {
        logger.info('文件或目录不存在，请检查：')
        logger.info('1. 是否已执行构建命令')
        logger.info('2. 构建输出目录是否正确')
        logger.info('3. 使用 --outDir 指定正确的输出目录')
      }

      process.exit(1)
    }
  }
}

/**
 * 获取本地 IP 地址
 * 
 * @returns 本地 IP 地址
 */
function getLocalIP(): string {
  const interfaces = networkInterfaces()

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if ((iface as any).family === 'IPv4' && !(iface as any).internal) {
        return (iface as any).address as string
      }
    }
  }

  return 'localhost'
}

/**
 * 显示构建信息
 *
 * @param outDir - 输出目录
 * @param logger - 日志记录器
 */
async function showBuildInfo(outDir: string, logger: Logger): Promise<void> {
  try {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      jsFiles: 0,
      cssFiles: 0,
      htmlFiles: 0,
      assetFiles: 0
    }

    // 递归统计所有文件
    await collectFileStats(outDir, stats)

    logger.info('构建产物统计:')
    logger.info(`  总文件数: ${stats.totalFiles}`)
    logger.info(`  总大小: ${formatFileSize(stats.totalSize)}`)
    logger.info(`  HTML 文件: ${stats.htmlFiles}`)
    logger.info(`  JavaScript 文件: ${stats.jsFiles}`)
    logger.info(`  CSS 文件: ${stats.cssFiles}`)
    logger.info(`  资源文件: ${stats.assetFiles}`)

  } catch (error) {
    logger.debug('获取构建信息失败', { error: (error as Error).message })
  }
}

/**
 * 递归收集文件统计信息
 *
 * @param dir - 目录路径
 * @param stats - 统计信息对象
 */
async function collectFileStats(dir: string, stats: any): Promise<void> {
  try {
    const files = await FileSystem.readDir(dir)

    for (const file of files) {
      const filePath = PathUtils.join(dir, file)
      const fileStat = await FileSystem.stat(filePath)

      if (fileStat.isFile()) {
        stats.totalFiles++
        stats.totalSize += fileStat.size

        const ext = PathUtils.extname(file).toLowerCase()
        if (['.js', '.mjs', '.cjs'].includes(ext)) {
          stats.jsFiles++
        } else if (ext === '.css') {
          stats.cssFiles++
        } else if (ext === '.html') {
          stats.htmlFiles++
        } else {
          stats.assetFiles++
        }
      } else if (fileStat.isDirectory()) {
        // 递归处理子目录
        await collectFileStats(filePath, stats)
      }
    }
  } catch (error) {
    // 忽略无法访问的目录
    console.debug(`无法访问目录 ${dir}:`, error)
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
