/**
 * 服务器相关工具函数
 * 
 * 提供服务器启动、端口检测、URL 生成等工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from './logger'
import type { ViteDevServer, PreviewServer } from 'vite'
import type { Host, Port } from '../types'

/**
 * 检查端口是否可用
 * 
 * @param port - 端口号
 * @param host - 主机地址
 * @returns 是否可用
 */
export async function isPortAvailable(port: Port, host: Host = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('net')
    const server = net.createServer()

    server.listen(port, host, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })

    server.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * 查找可用端口
 * 
 * @param startPort - 起始端口
 * @param host - 主机地址
 * @param maxAttempts - 最大尝试次数
 * @returns 可用端口
 */
export async function findAvailablePort(
  startPort: Port,
  host: Host = 'localhost',
  maxAttempts: number = 100
): Promise<Port> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i

    if (port > 65535) {
      throw new Error('无法找到可用端口：端口号超出范围')
    }

    if (await isPortAvailable(port, host)) {
      return port
    }
  }

  throw new Error(`无法找到可用端口：已尝试 ${maxAttempts} 个端口`)
}

/**
 * 获取服务器 URL
 * 
 * @param server - 服务器实例
 * @param fallbackHost - 回退主机地址
 * @param fallbackPort - 回退端口
 * @returns 服务器 URL
 */
export function getServerUrl(
  server: ViteDevServer | PreviewServer,
  fallbackHost: Host = 'localhost',
  fallbackPort: Port = 3000
): string {
  try {
    // 尝试从服务器实例获取 URL
    if ('resolvedUrls' in server && server.resolvedUrls?.local?.[0]) {
      return server.resolvedUrls.local[0]
    }

    // 回退到手动构建 URL
    const config = 'config' in server ? server.config : undefined
    const host = config?.server?.host || fallbackHost
    const port = config?.server?.port || fallbackPort
    const https = config?.server?.https || false

    const protocol = https ? 'https' : 'http'
    return `${protocol}://${host}:${port}`

  } catch (error) {
    // 最终回退
    return `http://${fallbackHost}:${fallbackPort}`
  }
}

/**
 * 获取网络 URL
 * 
 * @param server - 服务器实例
 * @param fallbackHost - 回退主机地址
 * @param fallbackPort - 回退端口
 * @returns 网络 URL 列表
 */
export function getNetworkUrls(
  server: ViteDevServer | PreviewServer,
  _fallbackHost: Host = 'localhost',
  fallbackPort: Port = 3000
): string[] {
  try {
    // 尝试从服务器实例获取网络 URL
    if ('resolvedUrls' in server && server.resolvedUrls?.network) {
      return server.resolvedUrls.network
    }

    // 手动获取网络接口
    const networkInterfaces = getNetworkInterfaces()
    const config = 'config' in server ? server.config : undefined
    const port = config?.server?.port || fallbackPort
    const https = config?.server?.https || false
    const protocol = https ? 'https' : 'http'

    return networkInterfaces.map(ip => `${protocol}://${ip}:${port}`)

  } catch (error) {
    return []
  }
}

/**
 * 获取本地网络接口
 * 
 * @returns IP 地址列表
 */
export function getNetworkInterfaces(): string[] {
  try {
    const os = require('os')
    const interfaces = os.networkInterfaces()
    const ips: string[] = []

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        // 跳过内部接口和非 IPv4 地址
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address)
        }
      }
    }

    return ips
  } catch (error) {
    return []
  }
}

/**
 * 等待服务器就绪
 * 
 * @param url - 服务器 URL
 * @param timeout - 超时时间（毫秒）
 * @param interval - 检查间隔（毫秒）
 * @returns 是否就绪
 */
export async function waitForServer(
  url: string,
  timeout: number = 30000,
  interval: number = 1000
): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        return true
      }
    } catch (error) {
      // 继续尝试
    }

    await new Promise(resolve => setTimeout(resolve, interval))
  }

  return false
}

/**
 * 获取服务器状态
 * 
 * @param url - 服务器 URL
 * @returns 服务器状态信息
 */
export async function getServerStatus(url: string): Promise<{
  online: boolean
  responseTime?: number
  statusCode?: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    })

    const responseTime = Date.now() - startTime

    return {
      online: true,
      responseTime,
      statusCode: response.status
    }

  } catch (error) {
    return {
      online: false,
      error: (error as Error).message
    }
  }
}

/**
 * 打开浏览器
 * 
 * @param url - 要打开的 URL
 * @param browser - 浏览器名称（可选）
 * @returns 是否成功打开
 */
export async function openBrowser(url: string, browser?: string): Promise<boolean> {
  try {
    // 尝试使用 open 包 - 使用类型断言避免类型检查问题
    const openModule = await import('open' as any).catch(() => null)
    if (openModule) {
      const open = openModule.default || openModule
      const options: any = {}
      if (browser) {
        options.app = { name: browser }
      }
      await open(url, options)
      return true
    }
  } catch (error) {
    // 忽略错误，继续到系统命令
  }

  // 回退到系统命令
  try {
    const { exec } = await import('child_process')
    const platform = process.platform

    let command: string

    switch (platform) {
      case 'darwin':
        command = `open "${url}"`
        break
      case 'win32':
        command = `start "" "${url}"`
        break
      default:
        command = `xdg-open "${url}"`
        break
    }

    exec(command)
    return true

  } catch (fallbackError) {
    return false
  }
}

/**
 * 生成服务器配置摘要
 * 
 * @param server - 服务器实例
 * @returns 配置摘要
 */
export function getServerSummary(server: ViteDevServer | PreviewServer): {
  type: 'dev' | 'preview'
  url: string
  networkUrls: string[]
  host: string
  port: number
  https: boolean
  cors: boolean
} {
  const config = 'config' in server ? server.config : undefined
  const isDevServer = 'ws' in server

  return {
    type: isDevServer ? 'dev' : 'preview',
    url: getServerUrl(server),
    networkUrls: getNetworkUrls(server),
    host: typeof config?.server?.host === 'string' ? config.server.host : 'localhost',
    port: config?.server?.port || (isDevServer ? 3000 : 4173),
    https: Boolean(config?.server?.https),
    cors: Boolean(config?.server?.cors)
  }
}

/**
 * 验证 URL 格式
 * 
 * @param url - URL 字符串
 * @returns 是否为有效 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 解析主机地址
 * 
 * @param host - 主机地址
 * @returns 解析后的主机信息
 */
export function parseHost(host: string): {
  hostname: string
  isWildcard: boolean
  isLocalhost: boolean
  isIP: boolean
} {
  const isWildcard = host === '0.0.0.0' || host === '::'
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1'
  const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(host) || /^[0-9a-fA-F:]+$/.test(host)

  return {
    hostname: host,
    isWildcard,
    isLocalhost,
    isIP
  }
}

/**
 * 格式化服务器启动信息
 * 
 * @param server - 服务器实例
 * @param logger - 日志记录器
 */
export function logServerInfo(server: ViteDevServer | PreviewServer, logger: Logger): void {
  const summary = getServerSummary(server)
  const hostInfo = parseHost(summary.host)

  logger.success(`${summary.type === 'dev' ? '开发' : '预览'}服务器启动成功!`)
  logger.info(`本地访问: ${summary.url}`)

  if (hostInfo.isWildcard && summary.networkUrls.length > 0) {
    logger.info('网络访问:')
    summary.networkUrls.forEach(url => {
      logger.info(`  ${url}`)
    })
  }

  if (summary.https) {
    logger.info('HTTPS 已启用')
  }

  if (summary.cors) {
    logger.info('CORS 已启用')
  }
}
