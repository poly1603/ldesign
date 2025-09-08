/**
 * 系统信息工具
 * 提供系统信息获取、环境检测等功能
 */

import { execSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import * as net from 'node:net'
import {
  arch,
  cpus,
  freemem,
  hostname,
  networkInterfaces,
  platform,
  totalmem,
  uptime,
  userInfo,
} from 'node:os'

/**
 * 系统信息接口
 */
export interface SystemInfo {
  platform: string
  arch: string
  hostname: string
  uptime: number
  memory: {
    total: number
    free: number
    used: number
    percentage: number
  }
  cpu: {
    model: string
    cores: number
    speed: number
  }
  user: {
    username: string
    homedir: string
    shell?: string
  }
  network: NetworkInterface[]
  node: {
    version: string
    platform: string
    arch: string
  }
}

/**
 * 网络接口信息
 */
export interface NetworkInterface {
  name: string
  family: string
  address: string
  internal: boolean
  mac: string
}

/**
 * 磁盘使用信息
 */
export interface DiskUsage {
  filesystem: string
  size: number
  used: number
  available: number
  percentage: number
  mountpoint: string
}

/**
 * 系统工具类
 */
export class SystemUtils {
  /**
   * 获取系统信息
   */
  static getSystemInfo(): SystemInfo {
    const cpuList = cpus()
    const cpuInfo = cpuList[0]
    const userDetails = userInfo()
    const networks = networkInterfaces()

    const networkList: NetworkInterface[] = []
    for (const [name, interfaces] of Object.entries(networks)) {
      if (interfaces) {
        for (const iface of interfaces) {
          networkList.push({
            name,
            family: iface.family,
            address: iface.address,
            internal: iface.internal,
            mac: iface.mac,
          })
        }
      }
    }

    const totalMem = totalmem()
    const freeMem = freemem()
    const usedMem = totalMem - freeMem

    return {
      platform: platform(),
      arch: arch(),
      hostname: hostname(),
      uptime: uptime(),
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        percentage: (usedMem / totalMem) * 100,
      },
      cpu: {
        model: cpuInfo?.model || '',
        cores: cpus().length,
        speed: cpuInfo?.speed || 0,
      },
      user: {
        username: userDetails.username,
        homedir: userDetails.homedir,
        shell: userDetails.shell || undefined,
      },
      network: networkList,
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    }
  }

  /**
   * 获取内存使用情况
   */
  static getMemoryUsage(): {
    system: { total: number, free: number, used: number, percentage: number }
    process: NodeJS.MemoryUsage
  } {
    const total = totalmem()
    const free = freemem()
    const used = total - free

    return {
      system: {
        total,
        free,
        used,
        percentage: (used / total) * 100,
      },
      process: process.memoryUsage(),
    }
  }

  /**
   * 获取 CPU 使用率
   */
  static async getCpuUsage(): Promise<number> {
    const startUsage = process.cpuUsage()

    // 等待一段时间来计算使用率
    await new Promise(resolve => setTimeout(resolve, 100))

    const endUsage = process.cpuUsage(startUsage)
    const totalUsage = endUsage.user + endUsage.system

    // 转换为百分比
    return totalUsage / 100000 // 100ms = 100,000 microseconds
  }

  /**
   * 获取磁盘使用情况
   */
  static async getDiskUsage(path = '/'): Promise<DiskUsage | null> {
    try {
      if (platform() === 'win32') {
        // Windows 系统
        const drive = path.charAt(0).toUpperCase()
        const output = execSync(
          `wmic logicaldisk where caption="${drive}:" get size,freespace,caption /format:csv`,
          { encoding: 'utf8' },
        )
        const lines = output.split('\n').filter(line => line.includes(drive))

        if (lines.length > 0) {
          const firstLine = lines[0] ?? ''
          const parts = firstLine.split(',')
          const size = Number.parseInt(parts[2] || '0') || 0
          const free = Number.parseInt(parts[1] || '0') || 0
          const used = size - free

          return {
            filesystem: `${drive}:`,
            size,
            used,
            available: free,
            percentage: size > 0 ? (used / size) * 100 : 0,
            mountpoint: `${drive}:`,
          }
        }
      }
      else {
        // Unix-like 系统
        const output = execSync(`df -B1 "${path}"`, { encoding: 'utf8' })
        const lines = output.split('\n')

        if (lines.length > 1) {
          const line = lines[1] ?? ''
          const parts = line.split(/\s+/)
          const filesystem = parts[0] || path
          const size = Number.parseInt(parts[1] || '0') || 0
          const used = Number.parseInt(parts[2] || '0') || 0
          const available = Number.parseInt(parts[3] || '0') || 0
          const mountpoint = parts[5] || path

          return {
            filesystem,
            size,
            used,
            available,
            percentage: size > 0 ? (used / size) * 100 : 0,
            mountpoint,
          }
        }
      }
    }
    catch {
      // 忽略错误，返回 null
    }

    return null
  }

  /**
   * 检查是否为 Docker 环境
   */
  static async isDocker(): Promise<boolean> {
    try {
      // 检查 /.dockerenv 文件
      await fs.access('/.dockerenv')
      return true
    }
    catch {
      try {
        // 检查 /proc/1/cgroup
        const cgroup = await fs.readFile('/proc/1/cgroup', 'utf8')
        return cgroup.includes('docker') || cgroup.includes('containerd')
      }
      catch {
        return false
      }
    }
  }

  /**
   * 检查是否为 CI 环境
   */
  static isCI(): boolean {
    return !!(
      process.env.CI
      || process.env.CONTINUOUS_INTEGRATION
      || process.env.BUILD_NUMBER
      || process.env.GITHUB_ACTIONS
      || process.env.GITLAB_CI
      || process.env.CIRCLECI
      || process.env.TRAVIS
      || process.env.JENKINS_URL
    )
  }

  /**
   * 获取环境类型
   */
  static getEnvironment(): 'development' | 'production' | 'test' | 'staging' | 'unknown' {
    const env = process.env.NODE_ENV?.toLowerCase()

    switch (env) {
      case 'development':
      case 'dev':
        return 'development'
      case 'production':
      case 'prod':
        return 'production'
      case 'test':
      case 'testing':
        return 'test'
      case 'staging':
      case 'stage':
        return 'staging'
      default:
        return 'unknown'
    }
  }

  /**
   * 检查端口是否可用
   */
  static async isPortAvailable(port: number, host = 'localhost'): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer()

      server.listen(port, host, () => {
        server.close(() => resolve(true))
      })

      server.on('error', () => resolve(false))
    })
  }

  /**
   * 查找可用端口
   */
  static async findAvailablePort(startPort = 3000, endPort = 65535): Promise<number | null> {
    for (let port = startPort; port <= endPort; port++) {
      if (await this.isPortAvailable(port)) {
        return port
      }
    }
    return null
  }

  /**
   * 获取进程信息
   */
  static getProcessInfo(): {
    pid: number
    ppid: number
    platform: string
    arch: string
    version: string
    argv: string[]
    execPath: string
    cwd: string
    uptime: number
  } {
    return {
      pid: process.pid,
      ppid: process.ppid || 0,
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      argv: process.argv,
      execPath: process.execPath,
      cwd: process.cwd(),
      uptime: process.uptime(),
    }
  }

  /**
   * 格式化字节大小
   */
  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0)
      return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
  }

  /**
   * 格式化运行时间
   */
  static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const parts: string[] = []
    if (days > 0)
      parts.push(`${days}d`)
    if (hours > 0)
      parts.push(`${hours}h`)
    if (minutes > 0)
      parts.push(`${minutes}m`)
    if (secs > 0)
      parts.push(`${secs}s`)

    return parts.join(' ') || '0s'
  }
}
