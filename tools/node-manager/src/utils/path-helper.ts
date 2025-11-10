/**
 * 路径辅助工具
 * @module utils/path-helper
 */

import path from 'node:path'
import os from 'node:os'
import fs from 'fs-extra'

/**
 * 路径辅助类
 */
export class PathHelper {
  /**
   * 获取用户主目录
   * 
   * @returns 用户主目录路径
   */
  static getHomeDir(): string {
    return os.homedir()
  }

  /**
   * 获取 LDesign 配置目录
   * 
   * @returns LDesign 配置目录路径
   */
  static getLDesignDir(): string {
    return path.join(this.getHomeDir(), '.ldesign')
  }

  /**
   * 获取 Node.js 安装目录
   * 
   * @returns Node.js 安装目录路径
   */
  static getNodeInstallDir(): string {
    return path.join(this.getLDesignDir(), 'nodejs')
  }

  /**
   * 获取指定版本的安装路径
   * 
   * @param version - 版本号
   * @returns 安装路径
   */
  static getVersionDir(version: string): string {
    return path.join(this.getNodeInstallDir(), version)
  }

  /**
   * 获取 Node.js 可执行文件路径
   * 
   * @param version - 版本号
   * @returns Node.js 可执行文件路径
   */
  static getNodeExecutable(version: string): string {
    const versionDir = this.getVersionDir(version)
    const isWindows = process.platform === 'win32'
    
    if (isWindows) {
      return path.join(versionDir, 'node.exe')
    }
    else {
      return path.join(versionDir, 'bin', 'node')
    }
  }

  /**
   * 获取 npm 可执行文件路径
   * 
   * @param version - Node.js 版本号
   * @returns npm 可执行文件路径
   */
  static getNpmExecutable(version: string): string {
    const versionDir = this.getVersionDir(version)
    const isWindows = process.platform === 'win32'
    
    if (isWindows) {
      return path.join(versionDir, 'npm.cmd')
    }
    else {
      return path.join(versionDir, 'bin', 'npm')
    }
  }

  /**
   * 获取下载缓存目录
   * 
   * @returns 缓存目录路径
   */
  static getCacheDir(): string {
    return path.join(this.getLDesignDir(), 'cache')
  }

  /**
   * 获取临时目录
   * 
   * @returns 临时目录路径
   */
  static getTempDir(): string {
    return path.join(os.tmpdir(), 'ldesign-node-manager')
  }

  /**
   * 确保目录存在
   * 
   * @param dirPath - 目录路径
   */
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath)
  }

  /**
   * 检查路径是否存在
   * 
   * @param filePath - 文件或目录路径
   * @returns 是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取目录大小（字节）
   * 
   * @param dirPath - 目录路径
   * @returns 目录大小
   */
  static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0

    const calculateSize = async (dir: string): Promise<void> => {
      const files = await fs.readdir(dir, { withFileTypes: true })

      for (const file of files) {
        const filePath = path.join(dir, file.name)

        if (file.isDirectory()) {
          await calculateSize(filePath)
        }
        else {
          const stats = await fs.stat(filePath)
          totalSize += stats.size
        }
      }
    }

    try {
      await calculateSize(dirPath)
    }
    catch {
      // 忽略错误
    }

    return totalSize
  }

  /**
   * 规范化版本号（移除 'v' 前缀）
   * 
   * @param version - 版本号
   * @returns 规范化后的版本号
   */
  static normalizeVersion(version: string): string {
    return version.replace(/^v/, '')
  }

  /**
   * 添加 'v' 前缀
   * 
   * @param version - 版本号
   * @returns 带 'v' 前缀的版本号
   */
  static addVersionPrefix(version: string): string {
    return version.startsWith('v') ? version : `v${version}`
  }

  /**
   * 获取平台特定的文件名
   * 
   * @param version - 版本号
   * @returns 文件名
   */
  static getNodeFilename(version: string): string {
    const platform = process.platform
    const arch = process.arch

    // 规范化架构名称
    let archName = arch
    if (arch === 'x64') {
      archName = 'x64'
    }
    else if (arch === 'x86' || arch === 'ia32') {
      archName = 'x86'
    }
    else if (arch === 'arm64') {
      archName = 'arm64'
    }

    const versionWithV = this.addVersionPrefix(version)

    if (platform === 'win32') {
      return `node-${versionWithV}-win-${archName}`
    }
    else if (platform === 'darwin') {
      return `node-${versionWithV}-darwin-${archName}`
    }
    else if (platform === 'linux') {
      return `node-${versionWithV}-linux-${archName}`
    }
    else {
      throw new Error(`不支持的平台: ${platform}`)
    }
  }

  /**
   * 获取下载文件扩展名
   * 
   * @returns 文件扩展名
   */
  static getDownloadExtension(): string {
    return process.platform === 'win32' ? '.zip' : '.tar.gz'
  }
}


