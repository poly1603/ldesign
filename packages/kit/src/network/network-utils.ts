/**
 * 网络工具类
 * 提供网络相关的实用工具函数
 */

import { exec } from 'node:child_process'
import { lookup } from 'node:dns'
import { networkInterfaces, platform } from 'node:os'
import { promisify } from 'node:util'
import { NetworkError } from '../types'

const execAsync = promisify(exec)
const dnsLookup = promisify(lookup)

/**
 * 网络工具类
 */
export class NetworkUtils {
  /**
   * 检查端口是否可用
   * @param port 端口号
   * @param host 主机地址
   * @returns 是否可用
   */
  static async isPortAvailable(port: number, host = 'localhost'): Promise<boolean> {
    const { createServer } = await import('node:net')
    return new Promise((resolve) => {
      const server = createServer()

      server.listen(port, host, () => {
        server.close(() => resolve(true))
      })

      server.on('error', () => resolve(false))
    })
  }

  /**
   * 查找可用端口
   * @param startPort 起始端口
   * @param endPort 结束端口
   * @param host 主机地址
   * @returns 可用端口
   */
  static async findAvailablePort(
    startPort = 3000,
    endPort = 65535,
    host = 'localhost',
  ): Promise<number> {
    for (let port = startPort; port <= endPort; port++) {
      if (await NetworkUtils.isPortAvailable(port, host)) {
        return port
      }
    }

    throw new NetworkError(
      `No available port found between ${startPort} and ${endPort}`,
      undefined,
      undefined,
    )
  }

  /**
   * 检查主机是否可达
   * @param host 主机地址
   * @param timeout 超时时间（毫秒）
   * @returns 是否可达
   */
  static async isHostReachable(host: string, timeout = 5000): Promise<boolean> {
    try {
      const isWindows = platform() === 'win32'
      const command = isWindows
        ? `ping -n 1 -w ${timeout} ${host}`
        : `ping -c 1 -W ${Math.ceil(timeout / 1000)} ${host}`

      await execAsync(command)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取本机IP地址
   * @param family IP版本（4或6）
   * @returns IP地址数组
   */
  static getLocalIPs(family: 4 | 6 = 4): string[] {
    const interfaces = networkInterfaces()
    const ips: string[] = []

    for (const interfaceInfo of Object.values(interfaces)) {
      if (!interfaceInfo)
        continue

      for (const info of interfaceInfo) {
        if (!info.internal && info.family === `IPv${family}`) {
          ips.push(info.address)
        }
      }
    }

    return ips
  }

  /**
   * 获取公网IP地址
   * @returns 公网IP地址
   */
  static async getPublicIP(): Promise<string> {
    const services = [
      'https://api.ipify.org',
      'https://ipinfo.io/ip',
      'https://icanhazip.com',
      'https://ident.me',
    ]

    for (const service of services) {
      try {
        const response = await fetch(service, {
          signal: AbortSignal.timeout(5000),
        })
        const ip = (await response.text()).trim()

        if (NetworkUtils.isValidIP(ip)) {
          return ip
        }
      }
      catch {
        continue
      }
    }

    throw new NetworkError('Failed to get public IP address', undefined, undefined)
  }

  /**
   * DNS解析
   * @param hostname 主机名
   * @param family IP版本
   * @returns IP地址
   */
  static async resolveHostname(hostname: string, family: 4 | 6 = 4): Promise<string> {
    try {
      const result = await dnsLookup(hostname, { family })
      return result.address
    }
    catch (error) {
      throw new NetworkError(`Failed to resolve hostname: ${hostname}`, undefined, error as Error)
    }
  }

  /**
   * 反向DNS解析
   * @param ip IP地址
   * @returns 主机名数组
   */
  static async reverseResolve(ip: string): Promise<string[]> {
    try {
      const { reverse } = await import('node:dns')
      const reverseAsync = promisify(reverse as unknown as (ip: string, callback: (err: unknown, hostnames: string[]) => void) => void)
      return await reverseAsync(ip)
    }
    catch (error) {
      throw new NetworkError(`Failed to reverse resolve IP: ${ip}`, undefined, error as Error)
    }
  }

  /**
   * 验证IP地址格式
   * @param ip IP地址
   * @param version IP版本
   * @returns 是否有效
   */
  static isValidIP(ip: string, version?: 4 | 6): boolean {
    const ipv4Regex
      = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/
    const ipv6Regex = /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$|^::1$|^::$/i

    if (version === 4) {
      return ipv4Regex.test(ip)
    }
    else if (version === 6) {
      return ipv6Regex.test(ip)
    }
    else {
      return ipv4Regex.test(ip) || ipv6Regex.test(ip)
    }
  }

  /**
   * 验证端口号
   * @param port 端口号
   * @returns 是否有效
   */
  static isValidPort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535
  }

  /**
   * 验证URL格式
   * @param url URL字符串
   * @returns 是否有效
   */
  static isValidURL(url: string): boolean {
    try {
      const URLCtor = URL as unknown as { canParse?: (input: string) => boolean }
      const canParse = URLCtor.canParse?.(url)
      if (typeof canParse === 'boolean') {
        return canParse
      }

      const parsed = new URL(url)
      void parsed
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 解析URL
   * @param url URL字符串
   * @returns URL信息
   */
  static parseURL(url: string): URLInfo {
    try {
      const parsed = new URL(url)
      return {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port ? Number.parseInt(parsed.port) : undefined,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        origin: parsed.origin,
        href: parsed.href,
      }
    }
    catch (error) {
      throw new NetworkError(`Invalid URL: ${url}`, undefined, error as Error)
    }
  }

  /**
   * 构建URL
   * @param base 基础URL
   * @param path 路径
   * @param params 查询参数
   * @returns 完整URL
   */
  static buildURL(base: string, path?: string, params?: Record<string, any>): string {
    try {
      const url = new URL(path || '', base)

      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value))
          }
        }
      }

      return url.toString()
    }
    catch (error) {
      throw new NetworkError(`Failed to build URL: ${base}`, undefined, error as Error)
    }
  }

  /**
   * 获取网络接口信息
   * @returns 网络接口信息
   */
  static getNetworkInterfaces(): NetworkInterfaceInfo[] {
    const interfaces = networkInterfaces()
    const result: NetworkInterfaceInfo[] = []

    for (const [name, interfaceInfo] of Object.entries(interfaces)) {
      if (!interfaceInfo)
        continue

      for (const info of interfaceInfo) {
        result.push({
          name,
          address: info.address,
          netmask: info.netmask,
          family: info.family as 'IPv4' | 'IPv6',
          mac: info.mac,
          internal: info.internal,
          cidr: info.cidr || undefined,
        })
      }
    }

    return result
  }

  /**
   * 计算网络延迟
   * @param host 主机地址
   * @param count 测试次数
   * @returns 延迟统计
   */
  static async measureLatency(host: string, count = 4): Promise<LatencyStats> {
    const latencies: number[] = []

    for (let i = 0; i < count; i++) {
      const startTime = Date.now()

      try {
        const isReachable = await NetworkUtils.isHostReachable(host, 5000)
        if (isReachable) {
          latencies.push(Date.now() - startTime)
        }
      }
      catch {
        // 忽略失败的测试
      }
    }

    if (latencies.length === 0) {
      throw new NetworkError(`Host unreachable: ${host}`, undefined, undefined)
    }

    const min = Math.min(...latencies)
    const max = Math.max(...latencies)
    const avg = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
    const loss = ((count - latencies.length) / count) * 100

    return { min, max, avg, loss, count: latencies.length }
  }

  /**
   * 检查网络连接
   * @returns 是否有网络连接
   */
  static async isOnline(): Promise<boolean> {
    const testHosts = ['8.8.8.8', '1.1.1.1', 'google.com']

    for (const host of testHosts) {
      if (await NetworkUtils.isHostReachable(host, 3000)) {
        return true
      }
    }

    return false
  }

  /**
   * 获取MAC地址
   * @param interfaceName 网络接口名称
   * @returns MAC地址
   */
  static getMacAddress(interfaceName?: string): string | null {
    const interfaces = networkInterfaces()

    if (interfaceName) {
      const interfaceInfo = interfaces[interfaceName]
      if (interfaceInfo && interfaceInfo.length > 0) {
        return interfaceInfo[0]!.mac
      }
      return null
    }

    // 返回第一个非内部接口的MAC地址
    for (const interfaceInfo of Object.values(interfaces)) {
      if (!interfaceInfo)
        continue

      for (const info of interfaceInfo) {
        if (!info.internal && info.mac !== '00:00:00:00:00:00') {
          return info.mac
        }
      }
    }

    return null
  }

  /**
   * 端口扫描
   * @param host 主机地址
   * @param ports 端口数组
   * @param timeout 超时时间
   * @returns 开放的端口
   */
  static async scanPorts(host: string, ports: number[], timeout = 3000): Promise<number[]> {
    const openPorts: number[] = []

    const { createConnection } = await import('node:net')
    const scanPromises = ports.map(async (port) => {
      return new Promise<boolean>((resolve) => {
        const socket = createConnection({ port, host, timeout })

        socket.on('connect', () => {
          socket.destroy()
          resolve(true)
        })

        socket.on('timeout', () => {
          socket.destroy()
          resolve(false)
        })

        socket.on('error', () => {
          resolve(false)
        })
      })
    })

    const results = await Promise.all(scanPromises)

    for (let i = 0; i < ports.length; i++) {
      if (results[i]) {
        openPorts.push(ports[i]!)
      }
    }

    return openPorts
  }

  /**
   * 下载速度测试
   * @param url 测试URL
   * @param duration 测试时长（毫秒）
   * @returns 下载速度（字节/秒）
   */
  static async measureDownloadSpeed(url: string, duration = 10000): Promise<number> {
    const startTime = Date.now()
    let totalBytes = 0

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(duration),
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()

      while (Date.now() - startTime < duration) {
        const { done, value } = await reader.read()

        if (done)
          break

        totalBytes += value?.length || 0
      }

      reader.cancel()
    }
    catch (error) {
      if ((error as Error).name !== 'AbortError') {
        throw error
      }
    }

    const actualDuration = (Date.now() - startTime) / 1000
    return totalBytes / actualDuration
  }

  /**
   * 格式化字节大小
   * @param bytes 字节数
   * @param decimals 小数位数
   * @returns 格式化后的字符串
   */
  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0)
      return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`
  }

  /**
   * 格式化速度
   * @param bytesPerSecond 每秒字节数
   * @param decimals 小数位数
   * @returns 格式化后的字符串
   */
  static formatSpeed(bytesPerSecond: number, decimals = 2): string {
    return `${NetworkUtils.formatBytes(bytesPerSecond, decimals)}/s`
  }
}

// 类型定义
interface URLInfo {
  protocol: string
  hostname: string
  port?: number
  pathname: string
  search: string
  hash: string
  origin: string
  href: string
}

interface NetworkInterfaceInfo {
  name: string
  address: string
  netmask: string
  family: 'IPv4' | 'IPv6'
  mac: string
  internal: boolean
  cidr?: string
}

interface LatencyStats {
  min: number
  max: number
  avg: number
  loss: number
  count: number
}
