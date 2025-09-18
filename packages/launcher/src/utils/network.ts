/**
 * 网络相关工具函数
 *
 * 提供网络检测、请求处理等工具函数
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { networkInterfaces } from 'node:os'

/**
 * 检查网络连接
 * 
 * @param timeout - 超时时间（毫秒）
 * @returns 是否连接正常
 */
export async function checkNetworkConnection(timeout: number = 5000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * 获取公网 IP 地址
 * 
 * @returns 公网 IP 地址
 */
export async function getPublicIP(): Promise<string | null> {
  const services = [
    'https://api.ipify.org?format=json',
    'https://httpbin.org/ip',
    'https://api.ip.sb/ip'
  ]

  for (const service of services) {
    try {
      const response = await fetch(service, {
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        const data = await response.json()
        return data.ip || data.origin?.split(' ')[0] || null
      }
    } catch (error) {
      continue
    }
  }

  return null
}

/**
 * 获取本地 IP 地址列表
 * 
 * @returns IP 地址列表
 */
export function getLocalIPs(): string[] {
  try {
    const interfaces = networkInterfaces()
    const ips: string[] = []

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        // 跳过内部接口、非 IPv4 地址和回环地址
        if (!iface.internal && iface.family === 'IPv4') {
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
 * 获取首选的本地 IP 地址
 * 在多网络接口的情况下，优先选择常见的局域网地址段
 *
 * @returns 首选的本地 IP 地址
 */
export function getPreferredLocalIP(): string {
  try {
    const interfaces = networkInterfaces()
    const candidates: string[] = []

    // 收集所有可用的 IPv4 地址
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if ((iface as any).family === 'IPv4' && !(iface as any).internal) {
          candidates.push((iface as any).address as string)
        }
      }
    }

    if (candidates.length === 0) {
      return 'localhost'
    }

    // 优先选择常见的局域网地址段
    const preferredRanges = [
      /^192\.168\./,  // 192.168.x.x
      /^10\./,        // 10.x.x.x
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./  // 172.16.x.x - 172.31.x.x
    ]

    // 按优先级查找
    for (const range of preferredRanges) {
      const preferred = candidates.find(ip => range.test(ip))
      if (preferred) {
        return preferred
      }
    }

    // 如果没有找到常见局域网地址，返回第一个可用地址
    return candidates[0]
  } catch (error) {
    return 'localhost'
  }
}

/**
 * 检查端口是否开放
 * 
 * @param host - 主机地址
 * @param port - 端口号
 * @param timeout - 超时时间（毫秒）
 * @returns 是否开放
 */
export async function isPortOpen(host: string, port: number, timeout: number = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('net')
    const socket = new net.Socket()

    const timer = setTimeout(() => {
      socket.destroy()
      resolve(false)
    }, timeout)

    socket.connect(port, host, () => {
      clearTimeout(timer)
      socket.destroy()
      resolve(true)
    })

    socket.on('error', () => {
      clearTimeout(timer)
      resolve(false)
    })
  })
}

/**
 * 扫描端口范围
 * 
 * @param host - 主机地址
 * @param startPort - 起始端口
 * @param endPort - 结束端口
 * @param timeout - 每个端口的超时时间
 * @returns 开放的端口列表
 */
export async function scanPorts(
  host: string,
  startPort: number,
  endPort: number,
  timeout: number = 1000
): Promise<number[]> {
  const openPorts: number[] = []
  const promises: Promise<void>[] = []

  for (let port = startPort; port <= endPort; port++) {
    const promise = isPortOpen(host, port, timeout).then(isOpen => {
      if (isOpen) {
        openPorts.push(port)
      }
    })

    promises.push(promise)
  }

  await Promise.all(promises)
  return openPorts.sort((a, b) => a - b)
}

/**
 * 测试网络延迟
 * 
 * @param url - 测试 URL
 * @param count - 测试次数
 * @returns 延迟统计信息
 */
export async function measureLatency(url: string, count: number = 3): Promise<{
  min: number
  max: number
  avg: number
  results: number[]
}> {
  const results: number[] = []

  for (let i = 0; i < count; i++) {
    try {
      const start = Date.now()
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        const latency = Date.now() - start
        results.push(latency)
      }
    } catch (error) {
      // 忽略失败的请求
    }

    // 请求间隔
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  if (results.length === 0) {
    return { min: 0, max: 0, avg: 0, results: [] }
  }

  const min = Math.min(...results)
  const max = Math.max(...results)
  const avg = Math.round(results.reduce((sum, val) => sum + val, 0) / results.length)

  return { min, max, avg, results }
}

/**
 * 下载文件
 * 
 * @param url - 文件 URL
 * @param options - 下载选项
 * @returns 文件内容
 */
export async function downloadFile(url: string, options: {
  timeout?: number
  maxSize?: number
  onProgress?: (loaded: number, total: number) => void
} = {}): Promise<ArrayBuffer> {
  const {
    timeout = 30000,
    maxSize = 100 * 1024 * 1024, // 100MB
    onProgress
  } = options

  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeout)
  })

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status} ${response.statusText}`)
  }

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  if (total > maxSize) {
    throw new Error(`文件过大: ${total} 字节，最大允许 ${maxSize} 字节`)
  }

  if (!response.body) {
    throw new Error('响应体为空')
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      chunks.push(value)
      loaded += value.length

      if (loaded > maxSize) {
        throw new Error(`文件过大: ${loaded} 字节，最大允许 ${maxSize} 字节`)
      }

      if (onProgress) {
        onProgress(loaded, total)
      }
    }
  } finally {
    reader.releaseLock()
  }

  // 合并所有块
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result.buffer
}

/**
 * 检查 URL 是否可访问
 * 
 * @param url - URL 地址
 * @param timeout - 超时时间
 * @returns 访问结果
 */
export async function checkUrlAccessibility(url: string, timeout: number = 5000): Promise<{
  accessible: boolean
  status?: number
  statusText?: string
  responseTime?: number
  error?: string
}> {
  const start = Date.now()

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(timeout)
    })

    const responseTime = Date.now() - start

    return {
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseTime
    }
  } catch (error) {
    return {
      accessible: false,
      error: (error as Error).message
    }
  }
}

/**
 * 获取网络接口信息
 * 
 * @returns 网络接口信息
 */
export function getNetworkInterfaces(): Array<{
  name: string
  address: string
  family: string
  internal: boolean
  mac: string
}> {
  try {
    const interfaces = networkInterfaces()
    const result: Array<{
      name: string
      address: string
      family: string
      internal: boolean
      mac: string
    }> = []

    for (const [name, ifaces] of Object.entries(interfaces) as Array<[string, any[]]>) {
      for (const iface of ifaces || []) {
        result.push({
          name,
          address: iface.address,
          family: iface.family,
          internal: iface.internal,
          mac: iface.mac
        })
      }
    }

    return result
  } catch (error) {
    return []
  }
}

/**
 * 解析 URL
 * 
 * @param url - URL 字符串
 * @returns 解析后的 URL 信息
 */
export function parseUrl(url: string): {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
} | null {
  try {
    const parsed = new URL(url)

    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      origin: parsed.origin
    }
  } catch (error) {
    return null
  }
}

/**
 * 构建 URL
 * 
 * @param base - 基础 URL
 * @param params - 查询参数
 * @returns 构建后的 URL
 */
export function buildUrl(base: string, params: Record<string, any> = {}): string {
  try {
    const url = new URL(base)

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }

    return url.toString()
  } catch (error) {
    return base
  }
}

/**
 * 检查是否为本地地址
 * 
 * @param address - IP 地址或主机名
 * @returns 是否为本地地址
 */
export function isLocalAddress(address: string): boolean {
  const localPatterns = [
    /^localhost$/i,
    /^127\./,
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^::1$/,
    /^fe80:/i
  ]

  return localPatterns.some(pattern => pattern.test(address))
}
