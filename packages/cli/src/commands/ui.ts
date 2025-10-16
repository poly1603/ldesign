/**
 * UI 命令实现
 * 启动 Web UI 管理界面
 */

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import open from 'open'
import { logger } from '../utils/logger.js'
import { getAvailablePort, formatPortInfo } from '../utils/port.js'
import { createServer } from '../server/app.js'
import { configManager } from '../server/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * UI 命令选项
 */
export interface UICommandOptions {
  port?: number
  host?: string
  open?: boolean
  debug?: boolean
  silent?: boolean
}

/**
 * UI 命令处理器
 */
export async function uiCommand(options: UICommandOptions = {}): Promise<void> {
  // 获取保存的配置
  const savedConfig = configManager.getConfig()

  const {
    port: preferredPort = options.port || savedConfig.defaultPort,
    host = options.host || savedConfig.defaultHost,
    open: shouldOpen = options.open !== undefined ? options.open : savedConfig.autoOpen,
    debug = options.debug !== undefined ? options.debug : savedConfig.debug,
    silent = false
  } = options

  // 设置日志级别
  if (silent) {
    logger.setLevel('silent')
  } else if (debug) {
    logger.setLevel('debug')
  }

  const uiLogger = logger.withPrefix('UI')

  try {
    uiLogger.info('正在启动 LDesign UI 管理界面...')

    // 获取可用端口
    const availablePort = await getAvailablePort(preferredPort)
    const portInfo = formatPortInfo(availablePort, host)

    if (availablePort !== preferredPort) {
      uiLogger.warn(`端口 ${preferredPort} 已被占用，使用端口 ${availablePort}`)
    }

    // 保存运行时配置
    configManager.setRuntimeConfig(availablePort, host)

    // 创建服务器
    const { server } = await createServer({
      port: availablePort,
      host,
      debug
    })

    // 启动服务器
    await new Promise<void>((resolve, reject) => {
      server.listen(availablePort, host, () => {
        resolve()
      })

      server.on('error', (error) => {
        reject(error)
      })
    })

    // 显示启动信息
    uiLogger.success('LDesign UI 管理界面已启动')
            if (host !== 'localhost') {
          }
            
    // 自动打开浏览器
    if (shouldOpen) {
      try {
        await open(portInfo.localUrl)
        uiLogger.info('已在默认浏览器中打开 UI 界面')
      } catch (error) {
        uiLogger.warn('无法自动打开浏览器，请手动访问上述地址')
      }
    }

    // 处理进程退出
    const gracefulShutdown = () => {
      uiLogger.info('正在关闭服务器...')
      server.close(() => {
        uiLogger.success('服务器已关闭')
        process.exit(0)
      })
    }

    process.on('SIGINT', gracefulShutdown)
    process.on('SIGTERM', gracefulShutdown)

  } catch (error) {
    uiLogger.error('启动 UI 管理界面失败:', error)
    throw error
  }
}
