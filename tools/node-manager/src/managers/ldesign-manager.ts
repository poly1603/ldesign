/**
 * LDesign 自研 Node.js 版本管理器
 * @module managers/ldesign-manager
 */

import fs from 'fs-extra'
import path from 'node:path'
import { BaseNodeManager } from '../core/base-manager'
import { NodeDownloader } from '../downloaders/node-downloader'
import { VersionRegistry } from '../registry/version-registry'
import { PathHelper } from '../utils/path-helper'
import { ExecHelper } from '../utils/exec-helper'
import type {
  InstallResult,
  ManagerOptions,
  NodeVersion,
  RemoveResult,
  SwitchResult,
} from '../types'
import { ManagerType } from '../types'

/**
 * LDesign 自研管理器
 * 
 * 不依赖外部工具，直接下载和管理 Node.js 二进制文件
 * 
 * @example
 * ```typescript
 * const manager = new LDesignManager()
 * await manager.installVersion('20.10.0')
 * await manager.switchVersion('20.10.0')
 * ```
 */
export class LDesignManager extends BaseNodeManager {
  readonly type = ManagerType.LDESIGN
  readonly name = 'LDesign Manager'
  
  private installDir: string
  private downloader: NodeDownloader
  private registry: VersionRegistry
  private configFile: string

  constructor(options: ManagerOptions = {}) {
    super()
    
    this.installDir = options.installDir || PathHelper.getNodeInstallDir()
    this.downloader = new NodeDownloader(options.mirror, options.onProgress)
    this.registry = new VersionRegistry(options.mirror)
    this.configFile = path.join(PathHelper.getLDesignDir(), 'config.json')
  }

  /**
   * LDesign 管理器始终可用（不需要额外安装）
   */
  async isInstalled(): Promise<boolean> {
    return true
  }

  /**
   * 获取当前激活的版本
   */
  async getCurrentVersion(): Promise<string | null> {
    try {
      const config = await this.loadConfig()
      return config.currentVersion || null
    }
    catch {
      return null
    }
  }

  /**
   * 列出已安装的版本
   */
  async listVersions(): Promise<NodeVersion[]> {
    try {
      await PathHelper.ensureDir(this.installDir)
      const entries = await fs.readdir(this.installDir, { withFileTypes: true })
      const currentVersion = await this.getCurrentVersion()

      const versions: NodeVersion[] = []

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const version = entry.name
          // 验证是否为有效的版本目录（包含 node 可执行文件）
          const nodeExe = PathHelper.getNodeExecutable(version)
          const exists = await PathHelper.exists(nodeExe)

          if (exists) {
            versions.push({
              version,
              installed: true,
              active: version === currentVersion,
            })
          }
        }
      }

      // 按版本号降序排序
      versions.sort((a, b) => this.compareVersions(b.version, a.version))

      return versions
    }
    catch {
      return []
    }
  }

  /**
   * 安装指定版本
   */
  async installVersion(version: string): Promise<InstallResult> {
    const normalizedVersion = this.normalizeVersion(version)

    try {
      // 检查版本是否存在
      const exists = await this.registry.versionExists(normalizedVersion)
      if (!exists) {
        return {
          success: false,
          message: `版本 ${normalizedVersion} 不存在`,
          version: normalizedVersion,
        }
      }

      // 检查是否已安装
      const installed = await this.listVersions()
      if (installed.some(v => v.version === normalizedVersion)) {
        return {
          success: false,
          message: `版本 ${normalizedVersion} 已经安装`,
          version: normalizedVersion,
        }
      }

      // 下载
      console.log(`正在下载 Node.js ${normalizedVersion}...`)
      const archivePath = await this.downloader.download(normalizedVersion)

      // 解压到安装目录
      const versionDir = PathHelper.getVersionDir(normalizedVersion)
      console.log(`正在解压到 ${versionDir}...`)
      await this.downloader.extract(archivePath, versionDir)

      // 验证安装
      const nodeExe = PathHelper.getNodeExecutable(normalizedVersion)
      const nodeExists = await PathHelper.exists(nodeExe)

      if (!nodeExists) {
        // 清理失败的安装
        await fs.remove(versionDir)
        return {
          success: false,
          message: `安装失败：未找到 Node.js 可执行文件`,
          version: normalizedVersion,
        }
      }

      // 设置可执行权限（Unix/Linux/macOS）
      if (process.platform !== 'win32') {
        try {
          await fs.chmod(nodeExe, 0o755)
          const npmExe = PathHelper.getNpmExecutable(normalizedVersion)
          if (await PathHelper.exists(npmExe)) {
            await fs.chmod(npmExe, 0o755)
          }
        }
        catch {
          // 忽略权限设置错误
        }
      }

      // 如果这是第一个安装的版本，自动设置为当前版本
      const allVersions = await this.listVersions()
      if (allVersions.length === 1) {
        await this.setCurrentVersion(normalizedVersion)
      }

      return {
        success: true,
        message: `成功安装 Node.js ${normalizedVersion}`,
        version: normalizedVersion,
        path: versionDir,
      }
    }
    catch (error: any) {
      return {
        success: false,
        message: `安装失败: ${error.message}`,
        version: normalizedVersion,
      }
    }
  }

  /**
   * 切换到指定版本
   */
  async switchVersion(version: string): Promise<SwitchResult> {
    const normalizedVersion = this.normalizeVersion(version)
    const currentVersion = await this.getCurrentVersion()

    // 检查版本是否已安装
    const installed = await this.listVersions()
    if (!installed.some(v => v.version === normalizedVersion)) {
      return {
        success: false,
        message: `版本 ${normalizedVersion} 未安装，请先安装`,
        from: currentVersion || undefined,
      }
    }

    try {
      await this.setCurrentVersion(normalizedVersion)

      return {
        success: true,
        message: `已切换到 Node.js ${normalizedVersion}`,
        from: currentVersion || undefined,
        to: normalizedVersion,
      }
    }
    catch (error: any) {
      return {
        success: false,
        message: `切换失败: ${error.message}`,
        from: currentVersion || undefined,
      }
    }
  }

  /**
   * 删除指定版本
   */
  async removeVersion(version: string): Promise<RemoveResult> {
    const normalizedVersion = this.normalizeVersion(version)

    // 检查版本是否已安装
    const installed = await this.listVersions()
    if (!installed.some(v => v.version === normalizedVersion)) {
      return {
        success: false,
        message: `版本 ${normalizedVersion} 未安装`,
        version: normalizedVersion,
      }
    }

    // 检查是否为当前版本
    const currentVersion = await this.getCurrentVersion()
    if (currentVersion === normalizedVersion) {
      return {
        success: false,
        message: `无法删除当前正在使用的版本 ${normalizedVersion}`,
        version: normalizedVersion,
      }
    }

    try {
      const versionDir = PathHelper.getVersionDir(normalizedVersion)
      
      // 计算释放的空间
      const freedSpace = await PathHelper.getDirectorySize(versionDir)

      // 删除版本目录
      await fs.remove(versionDir)

      return {
        success: true,
        message: `已删除 Node.js ${normalizedVersion}`,
        version: normalizedVersion,
        freedSpace,
      }
    }
    catch (error: any) {
      return {
        success: false,
        message: `删除失败: ${error.message}`,
        version: normalizedVersion,
      }
    }
  }

  /**
   * 获取远程可用版本
   */
  async listAvailableVersions(): Promise<string[]> {
    return this.registry.getAllVersions()
  }

  /**
   * 获取 LTS 版本列表
   */
  async listLTSVersions(): Promise<string[]> {
    return this.registry.getLTSVersions()
  }

  /**
   * 获取最新版本
   */
  async getLatestVersion(): Promise<string> {
    return this.registry.getLatestVersion()
  }

  /**
   * 获取管理器版本
   */
  async getManagerVersion(): Promise<string> {
    return '1.0.0'
  }

  /**
   * 获取指定版本的 Node.js 路径
   * 
   * @param version - 版本号
   * @returns Node.js 可执行文件路径
   */
  getNodePath(version: string): string {
    return PathHelper.getNodeExecutable(version)
  }

  /**
   * 获取指定版本的 npm 路径
   * 
   * @param version - 版本号
   * @returns npm 可执行文件路径
   */
  getNpmPath(version: string): string {
    return PathHelper.getNpmExecutable(version)
  }

  /**
   * 加载配置
   */
  private async loadConfig(): Promise<any> {
    try {
      if (await PathHelper.exists(this.configFile)) {
        const content = await fs.readFile(this.configFile, 'utf-8')
        return JSON.parse(content)
      }
    }
    catch {
      // 忽略错误
    }

    return {}
  }

  /**
   * 保存配置
   */
  private async saveConfig(config: any): Promise<void> {
    await PathHelper.ensureDir(path.dirname(this.configFile))
    await fs.writeFile(this.configFile, JSON.stringify(config, null, 2), 'utf-8')
  }

  /**
   * 设置当前版本
   */
  private async setCurrentVersion(version: string): Promise<void> {
    const config = await this.loadConfig()
    config.currentVersion = version
    await this.saveConfig(config)

    // TODO: 更新环境变量（这需要系统级权限）
    // 可以生成一个脚本让用户手动执行，或者提供说明
    const nodePath = this.getNodePath(version)
    console.log(`请将以下路径添加到 PATH 环境变量：`)
    console.log(path.dirname(nodePath))
  }

  /**
   * 比较版本号
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0

      if (part1 > part2) return 1
      if (part1 < part2) return -1
    }

    return 0
  }
}


