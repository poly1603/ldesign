/**
 * NVM for Windows 管理器
 * @module managers/nvm-windows-manager
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
 * NVM-Windows 管理器实现
 * 
 * 封装 NVM for Windows 的操作
 * 
 * @see https://github.com/coreybutler/nvm-windows
 */
export class NvmWindowsManager extends BaseNodeManager {
  readonly type = ManagerType.NVM_WINDOWS
  readonly name = 'NVM for Windows'
  private registry: VersionRegistry

  constructor(options: ManagerOptions = {}) {
    super()
    this.registry = new VersionRegistry(options.mirror)
  }

  async isInstalled(): Promise<boolean> {
    return process.platform === 'win32' && await ExecHelper.exists('nvm')
  }

  async getCurrentVersion(): Promise<string | null> {
    if (!(await this.isInstalled())) {
      return null
    }

    try {
      const result = await ExecHelper.exec('nvm', ['current'])
      if (result.success && result.stdout.trim() && result.stdout.trim() !== 'none') {
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

    try {
      const result = await ExecHelper.exec('nvm', ['list'])
      if (!result.success) {
        return []
      }

      const versions: NodeVersion[] = []
      const lines = result.stdout.split('\n')
      const currentVersion = await this.getCurrentVersion()

      for (const line of lines) {
        // nvm list 输出格式: "  * 20.10.0 (Currently using 64-bit executable)"
        const match = line.match(/[*\s]*v?(\d+\.\d+\.\d+)/)
        if (match) {
          const version = match[1]
          const isActive = line.includes('*') || version === currentVersion

          versions.push({
            version,
            installed: true,
            active: isActive,
          })
        }
      }

      return versions
    }
    catch {
      return []
    }
  }

  async installVersion(version: string): Promise<InstallResult> {
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'NVM for Windows 未安装',
      }
    }

    const normalizedVersion = this.normalizeVersion(version)

    try {
      console.log(`正在安装 Node.js ${normalizedVersion}...`)
      const result = await ExecHelper.exec('nvm', ['install', normalizedVersion], {
        timeout: 300000,
      })

      if (result.success || result.stdout.includes('已安装') || result.stdout.includes('already installed')) {
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
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'NVM for Windows 未安装',
      }
    }

    const normalizedVersion = this.normalizeVersion(version)
    const currentVersion = await this.getCurrentVersion()

    try {
      // nvm 使用 use 命令切换版本
      const result = await ExecHelper.exec('nvm', ['use', normalizedVersion])

      if (result.success || result.stdout.includes('正在使用') || result.stdout.includes('Now using')) {
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

  async removeVersion(version: string): Promise<RemoveResult> {
    if (!(await this.isInstalled())) {
      return {
        success: false,
        message: 'NVM for Windows 未安装',
      }
    }

    const normalizedVersion = this.normalizeVersion(version)
    const currentVersion = await this.getCurrentVersion()

    if (currentVersion === normalizedVersion) {
      return {
        success: false,
        message: `无法删除当前正在使用的版本 ${normalizedVersion}`,
        version: normalizedVersion,
      }
    }

    try {
      const result = await ExecHelper.exec('nvm', ['uninstall', normalizedVersion])

      if (result.success || result.stdout.includes('已卸载') || result.stdout.includes('has been uninstalled')) {
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
    try {
      const result = await ExecHelper.exec('nvm', ['list', 'available'])
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
      // 降级到使用注册表
    }

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
      const result = await ExecHelper.exec('nvm', ['version'])
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


