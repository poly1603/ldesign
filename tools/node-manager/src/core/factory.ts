/**
 * Node 版本管理器工厂
 * @module core/factory
 */

import type { INodeManager } from './base-manager'
import { FnmManager } from '../managers/fnm-manager'
import { NvmWindowsManager } from '../managers/nvm-windows-manager'
import { VoltaManager } from '../managers/volta-manager'
import { LDesignManager } from '../managers/ldesign-manager'
import { VersionDetector } from './version-detector'
import type { ManagerOptions, ManagerType } from '../types'

/**
 * Node 版本管理器工厂
 * 
 * 用于创建合适的版本管理器实例
 * 
 * @example
 * ```typescript
 * // 自动检测并创建管理器
 * const manager = await NodeManagerFactory.create()
 * 
 * // 创建指定类型的管理器
 * const fnm = await NodeManagerFactory.create(ManagerType.FNM)
 * 
 * // 使用配置创建
 * const manager = await NodeManagerFactory.create({
 *   type: ManagerType.LDESIGN,
 *   mirror: Mirrors.TAOBAO,
 * })
 * ```
 */
export class NodeManagerFactory {
  /**
   * 创建版本管理器实例
   * 
   * @param typeOrOptions - 管理器类型或配置选项，如果不指定则自动检测
   * @returns 管理器实例
   * 
   * @throws {Error} 如果没有找到可用的管理器
   * 
   * @example
   * ```typescript
   * // 自动检测
   * const manager = await NodeManagerFactory.create()
   * 
   * // 指定类型
   * const fnm = await NodeManagerFactory.create(ManagerType.FNM)
   * 
   * // 使用配置
   * const manager = await NodeManagerFactory.create({
   *   mirror: Mirrors.TAOBAO,
   * })
   * ```
   */
  static async create(
    typeOrOptions?: ManagerType | (ManagerOptions & { type?: ManagerType }),
  ): Promise<INodeManager> {
    let managerType: ManagerType | undefined
    let options: ManagerOptions = {}

    // 解析参数
    if (typeof typeOrOptions === 'string') {
      managerType = typeOrOptions
    }
    else if (typeOrOptions) {
      managerType = typeOrOptions.type
      options = typeOrOptions
    }

    // 如果没有指定类型，自动检测
    if (!managerType) {
      managerType = await VersionDetector.selectBest()
      
      if (!managerType) {
        // 如果没有找到任何已安装的管理器，使用 LDesign 管理器
        console.warn('未找到已安装的版本管理器，将使用 LDesign 管理器')
        return new LDesignManager(options)
      }
    }

    // 创建对应的管理器实例
    return this.createByType(managerType, options)
  }

  /**
   * 根据类型创建管理器
   * 
   * @param type - 管理器类型
   * @param options - 配置选项
   * @returns 管理器实例
   * 
   * @example
   * ```typescript
   * const fnm = NodeManagerFactory.createByType(ManagerType.FNM)
   * ```
   */
  static createByType(
    type: ManagerType,
    options: ManagerOptions = {},
  ): INodeManager {
    switch (type) {
      case 'fnm':
        return new FnmManager(options)
      case 'nvm-windows':
        return new NvmWindowsManager(options)
      case 'volta':
        return new VoltaManager(options)
      case 'ldesign':
        return new LDesignManager(options)
      case 'nvm':
        // NVM (Unix) 暂时使用 LDesign 管理器作为替代
        console.warn('NVM (Unix) 支持尚未完全实现，使用 LDesign 管理器')
        return new LDesignManager(options)
      default:
        throw new Error(`不支持的管理器类型: ${type}`)
    }
  }

  /**
   * 获取所有支持的管理器类型
   * 
   * @returns 管理器类型列表
   */
  static getSupportedTypes(): ManagerType[] {
    return ['fnm', 'nvm-windows', 'volta', 'ldesign', 'nvm']
  }

  /**
   * 检测所有已安装的管理器
   * 
   * @returns 管理器信息列表
   * 
   * @example
   * ```typescript
   * const managers = await NodeManagerFactory.detectAll()
   * managers.forEach(m => {
   *   console.log(`${m.name}: ${m.installed ? '已安装' : '未安装'}`)
   * })
   * ```
   */
  static async detectAll() {
    return VersionDetector.detectAll()
  }

  /**
   * 创建所有已安装的管理器实例
   * 
   * @param options - 配置选项
   * @returns 管理器实例数组
   * 
   * @example
   * ```typescript
   * const managers = await NodeManagerFactory.createAll()
   * for (const manager of managers) {
   *   const versions = await manager.listVersions()
   *   console.log(`${manager.name}:`, versions)
   * }
   * ```
   */
  static async createAll(options: ManagerOptions = {}): Promise<INodeManager[]> {
    const detected = await VersionDetector.detectAll()
    const installed = detected.filter(m => m.installed)

    return installed.map(m => this.createByType(m.type, options))
  }
}


