/**
 * 版本管理器检测器
 * @module core/version-detector
 */

import { ExecHelper } from '../utils/exec-helper'
import type { ManagerInfo, ManagerType } from '../types'
import { ManagerType as MT } from '../types'

/**
 * 版本管理器检测器
 * 
 * 用于检测系统中已安装的 Node.js 版本管理器
 */
export class VersionDetector {
  /**
   * 检测所有已安装的版本管理器
   * 
   * @returns 管理器信息列表
   * 
   * @example
   * ```typescript
   * const managers = await VersionDetector.detectAll()
   * managers.forEach(m => {
   *   console.log(`${m.name}: ${m.installed ? '已安装' : '未安装'}`)
   * })
   * ```
   */
  static async detectAll(): Promise<ManagerInfo[]> {
    const managerTypes: ManagerType[] = [
      MT.NVM,
      MT.NVM_WINDOWS,
      MT.FNM,
      MT.VOLTA,
      MT.LDESIGN,
    ]

    const results = await Promise.all(
      managerTypes.map(type => this.detect(type)),
    )

    return results
  }

  /**
   * 检测指定的版本管理器
   * 
   * @param type - 管理器类型
   * @returns 管理器信息
   * 
   * @example
   * ```typescript
   * const fnm = await VersionDetector.detect(ManagerType.FNM)
   * if (fnm.installed) {
   *   console.log('fnm 版本:', fnm.version)
   * }
   * ```
   */
  static async detect(type: ManagerType): Promise<ManagerInfo> {
    switch (type) {
      case MT.NVM:
        return this.detectNvm()
      case MT.NVM_WINDOWS:
        return this.detectNvmWindows()
      case MT.FNM:
        return this.detectFnm()
      case MT.VOLTA:
        return this.detectVolta()
      case MT.LDESIGN:
        return this.detectLDesign()
      default:
        return {
          type,
          name: 'Unknown',
          installed: false,
        }
    }
  }

  /**
   * 检测 NVM (Unix/Linux/macOS)
   */
  private static async detectNvm(): Promise<ManagerInfo> {
    const info: ManagerInfo = {
      type: MT.NVM,
      name: 'NVM',
      installed: false,
    }

    // NVM 是 shell 函数，不是独立命令
    // 检查环境变量 NVM_DIR
    if (process.env.NVM_DIR) {
      info.installed = true
      info.path = process.env.NVM_DIR

      // 尝试获取版本
      const result = await ExecHelper.shell('nvm --version')
      if (result.success) {
        info.version = result.stdout.trim()
      }
    }

    return info
  }

  /**
   * 检测 NVM-Windows
   */
  private static async detectNvmWindows(): Promise<ManagerInfo> {
    const info: ManagerInfo = {
      type: MT.NVM_WINDOWS,
      name: 'NVM for Windows',
      installed: false,
    }

    // 检查 nvm 命令
    const exists = await ExecHelper.exists('nvm')
    if (exists && process.platform === 'win32') {
      info.installed = true

      // 获取版本
      const result = await ExecHelper.exec('nvm', ['version'])
      if (result.success) {
        info.version = result.stdout.trim()
      }

      // 获取路径
      const path = await ExecHelper.getCommandPath('nvm')
      if (path) {
        info.path = path
      }
    }

    return info
  }

  /**
   * 检测 fnm
   */
  private static async detectFnm(): Promise<ManagerInfo> {
    const info: ManagerInfo = {
      type: MT.FNM,
      name: 'fnm',
      installed: false,
    }

    const exists = await ExecHelper.exists('fnm')
    if (exists) {
      info.installed = true

      // 获取版本
      const result = await ExecHelper.exec('fnm', ['--version'])
      if (result.success) {
        // fnm 输出格式: "fnm 1.35.1"
        const match = result.stdout.match(/fnm\s+([\d.]+)/)
        if (match) {
          info.version = match[1]
        }
      }

      // 获取路径
      const path = await ExecHelper.getCommandPath('fnm')
      if (path) {
        info.path = path
      }
    }

    return info
  }

  /**
   * 检测 Volta
   */
  private static async detectVolta(): Promise<ManagerInfo> {
    const info: ManagerInfo = {
      type: MT.VOLTA,
      name: 'Volta',
      installed: false,
    }

    const exists = await ExecHelper.exists('volta')
    if (exists) {
      info.installed = true

      // 获取版本
      const result = await ExecHelper.exec('volta', ['--version'])
      if (result.success) {
        info.version = result.stdout.trim()
      }

      // 获取路径
      const path = await ExecHelper.getCommandPath('volta')
      if (path) {
        info.path = path
      }
    }

    return info
  }

  /**
   * 检测 LDesign 管理器
   */
  private static async detectLDesign(): Promise<ManagerInfo> {
    const info: ManagerInfo = {
      type: MT.LDESIGN,
      name: 'LDesign Manager',
      installed: false,
    }

    // 检查配置目录是否存在
    const { PathHelper } = await import('../utils/path-helper')
    const installDir = PathHelper.getNodeInstallDir()
    const exists = await PathHelper.exists(installDir)

    if (exists) {
      info.installed = true
      info.path = installDir
      info.version = '1.0.0' // 内置版本
    }

    return info
  }

  /**
   * 选择最佳的版本管理器
   * 
   * 按优先级选择：fnm > nvm-windows > nvm > volta > ldesign
   * 
   * @returns 管理器类型，如果没有找到则返回 null
   * 
   * @example
   * ```typescript
   * const best = await VersionDetector.selectBest()
   * console.log('最佳管理器:', best)
   * ```
   */
  static async selectBest(): Promise<ManagerType | null> {
    const all = await this.detectAll()
    const installed = all.filter(m => m.installed)

    if (installed.length === 0) {
      return null
    }

    // 优先级顺序
    const priority: ManagerType[] = [
      MT.FNM,
      MT.NVM_WINDOWS,
      MT.NVM,
      MT.VOLTA,
      MT.LDESIGN,
    ]

    for (const type of priority) {
      if (installed.some(m => m.type === type)) {
        return type
      }
    }

    // 返回第一个已安装的
    return installed[0].type
  }

  /**
   * 检测当前系统的 Node.js 版本（全局）
   * 
   * @returns Node.js 版本号，如果未安装则返回 null
   */
  static async detectNodeVersion(): Promise<string | null> {
    const result = await ExecHelper.exec('node', ['--version'])
    if (result.success && result.stdout) {
      return result.stdout.trim().replace(/^v/, '')
    }
    return null
  }

  /**
   * 检测当前系统的 npm 版本（全局）
   * 
   * @returns npm 版本号，如果未安装则返回 null
   */
  static async detectNpmVersion(): Promise<string | null> {
    const result = await ExecHelper.exec('npm', ['--version'])
    if (result.success && result.stdout) {
      return result.stdout.trim()
    }
    return null
  }
}


