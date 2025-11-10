/**
 * Volta 管理器
 * @module managers/volta-manager
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
 * Volta 管理器实现
 * 
 * 封装 Volta (JavaScript Tool Manager) 的操作
 * 
 * @see https://volta.sh/
 */
export class VoltaManager extends BaseNodeManager {
  readonly type = ManagerType.VOLTA
  readonly name = 'Volta'
  private registry: VersionRegistry

  constructor(options: ManagerOptions = {}) {
    super()
    this.registry = new VersionRegistry(options.mirror)
  }

  async isInstalled(): Promise<boolean> {
    return ExecHelper.exists('volta')
  }

  async getCurrentVersion(): Promise<string | null> {
    if (!(await this.isInstalled())) {
      return null
    }

    try {
      // Volta 通过 node --version 获取当前版本
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

  async listVersions(): Promise<NodeVersion[]> {
    if (!(await this.isInstalled())) {
      return []
    }

    // Volta 没有直接的 list 命令，我们通过其他方式获取
    // 这里简化实现，只返回当前版本
    const currentVersion = await this.getCurrentVersion()
    
    if (currentVersion) {
      return [{
        version: currentVersion,
        installed: true,
        active: true,
      }]
    }

    return []
  }

  async installVersion(version: string): Promise<InstallResult> {
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'Volta 未安装',
      }
    }

    const normalizedVersion = this.normalizeVersion(version)

    try {
      console.log(`正在安装 Node.js ${normalizedVersion}...`)
      // Volta 使用 install 命令
      const result = await ExecHelper.exec('volta', ['install', `node@${normalizedVersion}`], {
        timeout: 300000,
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

  async switchVersion(version: string): Promise<SwitchResult> {
    // Volta 的切换实际上就是安装并设置为默认版本
    const result = await this.installVersion(version)
    
    if (result.success) {
      return {
        success: true,
        message: result.message,
        to: version,
      }
    }
    else {
      return {
        success: false,
        message: result.message,
      }
    }
  }

  async removeVersion(version: string): Promise<RemoveResult> {
    // Volta 使用 uninstall 命令
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'Volta 未安装',
      }
    }

    const normalizedVersion = this.normalizeVersion(version)

    try {
      const result = await ExecHelper.exec('volta', ['uninstall', `node@${normalizedVersion}`])

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

  async listAvailableVersions(): Promise<string[]> {
    return this.registry.getAllVersions()
  }

  async listLTSVersions(): Promise<string[]> {
    return this.registry.getLTSVersions()
  }

  async getLatestVersion(): Promise<string> {
    return this.registry.getLatestVersion()
  }

  async getManagerVersion(): Promise<string | null> {
    if (!(await this.isInstalled())) {
      return null
    }

    try {
      const result = await ExecHelper.exec('volta', ['--version'])
      if (result.success && result.stdout.trim()) {
        return result.stdout.trim()
      }
    }
    catch {
      // 忽略错误
    }

    return null
  }
}


