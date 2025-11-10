/**
 * fnm (Fast Node Manager) 管理器
 * @module managers/fnm-manager
 */

import { BaseNodeManager } from '../core/base-manager'
import { ExecHelper } from '../utils/exec-helper'
import { VersionRegistry } from '../registry/version-registry'
import type {
  InstallResult,
  ManagerOptions,
  NodeVersion,
  RemoveResult,
  SwitchResult,
} from '../types'
import { ManagerType } from '../types'

/**
 * fnm 管理器实现
 * 
 * 封装 fnm (Fast Node Manager) 的操作
 * 
 * @see https://github.com/Schniz/fnm
 */
export class FnmManager extends BaseNodeManager {
  readonly type = ManagerType.FNM
  readonly name = 'fnm'
  private registry: VersionRegistry

  constructor(options: ManagerOptions = {}) {
    super()
    this.registry = new VersionRegistry(options.mirror)
  }

  /**
   * 检查 fnm 是否已安装
   */
  async isInstalled(): Promise<boolean> {
    return ExecHelper.exists('fnm')
  }

  /**
   * 获取当前激活的版本
   */
  async getCurrentVersion(): Promise<string | null> {
    if (!(await this.isInstalled())) {
      return null
    }

    try {
      const result = await ExecHelper.exec('fnm', ['current'])
      if (result.success && result.stdout.trim()) {
        return this.normalizeVersion(result.stdout.trim())
      }
    }
    catch {
      // 忽略错误
    }

    // 如果 fnm current 失败，尝试 node --version
    try {
      const result = await ExecHelper.exec('node', ['--version'])
      if (result.success && result.stdout.trim()) {
        return this.normalizeVersion(result.stdout.trim())
      }
    }
    catch {
      // 忽略错误
    }

    return null
  }

  /**
   * 列出已安装的版本
   */
  async listVersions(): Promise<NodeVersion[]> {
    if (!(await this.isInstalled())) {
      return []
    }

    try {
      const result = await ExecHelper.exec('fnm', ['list'])
      if (!result.success) {
        return []
      }

      const versions: NodeVersion[] = []
      const lines = result.stdout.split('\n')
      const currentVersion = await this.getCurrentVersion()

      for (const line of lines) {
        // fnm list 输出格式: "v20.10.0" 或 "v20.10.0 default" 或 "* v20.10.0"
        const match = line.match(/[*\s]*v?(\d+\.\d+\.\d+)/)
        if (match) {
          const version = match[1]
          const isActive = line.includes('*') || version === currentVersion
          const isDefault = line.includes('default')

          versions.push({
            version,
            installed: true,
            active: isActive || isDefault,
          })
        }
      }

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
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'fnm 未安装',
      }
    }

    const normalizedVersion = this.normalizeVersion(version)

    // 检查是否已安装
    const installed = await this.listVersions()
    if (installed.some(v => v.version === normalizedVersion)) {
      return {
        success: false,
        message: `版本 ${normalizedVersion} 已经安装`,
        version: normalizedVersion,
      }
    }

    try {
      console.log(`正在安装 Node.js ${normalizedVersion}...`)
      const result = await ExecHelper.exec('fnm', ['install', normalizedVersion], {
        timeout: 300000, // 5分钟超时
      })

      if (result.success) {
        return {
          success: true,
          message: `成功安装 Node.js ${normalizedVersion}`,
          version: normalizedVersion,
        }
      }
      else {
        return {
          success: false,
          message: `安装失败: ${result.stderr || result.stdout}`,
          version: normalizedVersion,
        }
      }
    }
    catch (error: any) {
      return {
        success: false,
        message: `安装过程中发生错误: ${error.message}`,
        version: normalizedVersion,
      }
    }
  }

  /**
   * 切换到指定版本
   */
  async switchVersion(version: string): Promise<SwitchResult> {
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'fnm 未安装',
      }
    }

    const normalizedVersion = this.normalizeVersion(version)
    const currentVersion = await this.getCurrentVersion()

    // 检查版本是否已安装
    const installed = await this.listVersions()
    if (!installed.some(v => v.version === normalizedVersion)) {
      return {
        success: false,
        message: `版本 ${normalizedVersion} 未安装`,
        from: currentVersion || undefined,
      }
    }

    try {
      // fnm 使用 use 命令切换版本
      const result = await ExecHelper.exec('fnm', ['use', normalizedVersion])

      if (result.success) {
        return {
          success: true,
          message: `已切换到 Node.js ${normalizedVersion}`,
          from: currentVersion || undefined,
          to: normalizedVersion,
        }
      }
      else {
        return {
          success: false,
          message: `切换失败: ${result.stderr || result.stdout}`,
          from: currentVersion || undefined,
        }
      }
    }
    catch (error: any) {
      return {
        success: false,
        message: `切换过程中发生错误: ${error.message}`,
        from: currentVersion || undefined,
      }
    }
  }

  /**
   * 删除指定版本
   */
  async removeVersion(version: string): Promise<RemoveResult> {
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'fnm 未安装',
      }
    }

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
      const result = await ExecHelper.exec('fnm', ['uninstall', normalizedVersion])

      if (result.success) {
        return {
          success: true,
          message: `已删除 Node.js ${normalizedVersion}`,
          version: normalizedVersion,
        }
      }
      else {
        return {
          success: false,
          message: `删除失败: ${result.stderr || result.stdout}`,
          version: normalizedVersion,
        }
      }
    }
    catch (error: any) {
      return {
        success: false,
        message: `删除过程中发生错误: ${error.message}`,
        version: normalizedVersion,
      }
    }
  }

  /**
   * 获取远程可用版本
   */
  async listAvailableVersions(): Promise<string[]> {
    // fnm 可以使用 list-remote 命令
    try {
      const result = await ExecHelper.exec('fnm', ['list-remote'])
      if (result.success) {
        const versions: string[] = []
        const lines = result.stdout.split('\n')

        for (const line of lines) {
          const match = line.match(/v?(\d+\.\d+\.\d+)/)
          if (match) {
            versions.push(match[1])
          }
        }

        if (versions.length > 0) {
          return versions
        }
      }
    }
    catch {
      // 如果 fnm list-remote 失败，降级到使用注册表
    }

    // 降级：使用版本注册表
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
   * 获取 fnm 版本
   */
  async getManagerVersion(): Promise<string | null> {
    if (!(await this.isInstalled())) {
      return null
    }

    try {
      const result = await ExecHelper.exec('fnm', ['--version'])
      if (result.success && result.stdout.trim()) {
        // fnm 输出格式: "fnm 1.35.1"
        const match = result.stdout.match(/fnm\s+([\d.]+)/)
        return match ? match[1] : result.stdout.trim()
      }
    }
    catch {
      // 忽略错误
    }

    return null
  }
}


