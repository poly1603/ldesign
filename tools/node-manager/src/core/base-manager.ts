/**
 * Node 版本管理器基础接口
 * @module core/base-manager
 */

import type {
  InstallResult,
  ManagerType,
  NodeVersion,
  RemoveResult,
  SwitchResult,
} from '../types'

/**
 * Node 版本管理器接口
 * 
 * 所有版本管理器都必须实现此接口，提供统一的 API
 * 
 * @example
 * ```typescript
 * class MyManager implements INodeManager {
 *   readonly type = ManagerType.CUSTOM
 *   readonly name = 'My Manager'
 *   
 *   async getCurrentVersion() {
 *     // 实现逻辑
 *   }
 *   
 *   // 实现其他方法...
 * }
 * ```
 */
export interface INodeManager {
  /**
   * 管理器类型
   */
  readonly type: ManagerType

  /**
   * 管理器名称
   */
  readonly name: string

  /**
   * 检查管理器是否已安装
   * 
   * @returns 是否已安装
   * 
   * @example
   * ```typescript
   * const installed = await manager.isInstalled()
   * if (!installed) {
   *   console.log('管理器未安装')
   * }
   * ```
   */
  isInstalled(): Promise<boolean>

  /**
   * 获取当前激活的 Node.js 版本
   * 
   * @returns 当前版本号，如果未安装则返回 null
   * 
   * @example
   * ```typescript
   * const current = await manager.getCurrentVersion()
   * console.log('当前版本:', current) // "20.10.0"
   * ```
   */
  getCurrentVersion(): Promise<string | null>

  /**
   * 列出本地已安装的 Node.js 版本
   * 
   * @returns 已安装版本列表
   * 
   * @example
   * ```typescript
   * const versions = await manager.listVersions()
   * versions.forEach(v => {
   *   console.log(`${v.version} ${v.active ? '(当前)' : ''}`)
   * })
   * ```
   */
  listVersions(): Promise<NodeVersion[]>

  /**
   * 安装指定版本的 Node.js
   * 
   * @param version - 要安装的版本号（如 "20.10.0" 或 "latest"）
   * @returns 安装结果
   * 
   * @throws {VersionNotFoundError} 版本不存在
   * @throws {VersionAlreadyInstalledError} 版本已安装
   * @throws {InstallError} 安装失败
   * 
   * @example
   * ```typescript
   * const result = await manager.installVersion('20.10.0')
   * if (result.success) {
   *   console.log('安装成功:', result.message)
   * } else {
   *   console.error('安装失败:', result.message)
   * }
   * ```
   */
  installVersion(version: string): Promise<InstallResult>

  /**
   * 切换到指定版本的 Node.js
   * 
   * @param version - 要切换到的版本号
   * @returns 切换结果
   * 
   * @throws {VersionNotFoundError} 版本未安装
   * 
   * @example
   * ```typescript
   * const result = await manager.switchVersion('18.17.0')
   * if (result.success) {
   *   console.log(`已从 ${result.from} 切换到 ${result.to}`)
   * }
   * ```
   */
  switchVersion(version: string): Promise<SwitchResult>

  /**
   * 删除指定版本的 Node.js
   * 
   * @param version - 要删除的版本号
   * @returns 删除结果
   * 
   * @throws {VersionNotFoundError} 版本未安装
   * 
   * @example
   * ```typescript
   * const result = await manager.removeVersion('16.20.0')
   * if (result.success) {
   *   console.log('删除成功，释放空间:', result.freedSpace)
   * }
   * ```
   */
  removeVersion(version: string): Promise<RemoveResult>

  /**
   * 获取远程可用的 Node.js 版本列表
   * 
   * @returns 可用版本号列表
   * 
   * @example
   * ```typescript
   * const available = await manager.listAvailableVersions()
   * console.log('可用版本数量:', available.length)
   * ```
   */
  listAvailableVersions(): Promise<string[]>

  /**
   * 获取 LTS（长期支持）版本列表
   * 
   * @returns LTS 版本号列表
   * 
   * @example
   * ```typescript
   * const ltsVersions = await manager.listLTSVersions()
   * console.log('LTS 版本:', ltsVersions)
   * ```
   */
  listLTSVersions(): Promise<string[]>

  /**
   * 获取最新版本号
   * 
   * @returns 最新版本号
   * 
   * @example
   * ```typescript
   * const latest = await manager.getLatestVersion()
   * console.log('最新版本:', latest)
   * ```
   */
  getLatestVersion(): Promise<string>

  /**
   * 获取管理器版本号
   * 
   * @returns 管理器版本号
   * 
   * @example
   * ```typescript
   * const version = await manager.getManagerVersion()
   * console.log('管理器版本:', version)
   * ```
   */
  getManagerVersion?(): Promise<string | null>
}

/**
 * 抽象基类，提供通用实现
 */
export abstract class BaseNodeManager implements INodeManager {
  abstract readonly type: ManagerType
  abstract readonly name: string

  abstract isInstalled(): Promise<boolean>
  abstract getCurrentVersion(): Promise<string | null>
  abstract listVersions(): Promise<NodeVersion[]>
  abstract installVersion(version: string): Promise<InstallResult>
  abstract switchVersion(version: string): Promise<SwitchResult>
  abstract removeVersion(version: string): Promise<RemoveResult>
  abstract listAvailableVersions(): Promise<string[]>

  /**
   * 默认实现：从可用版本列表中过滤 LTS 版本
   */
  async listLTSVersions(): Promise<string[]> {
    const versions = await this.listAvailableVersions()
    // 这是一个简化实现，实际应该从 Node.js 官方 API 获取
    return versions.filter(v => {
      const major = Number.parseInt(v.split('.')[0])
      // LTS 版本通常是偶数主版本号
      return major % 2 === 0 && major >= 18
    })
  }

  /**
   * 默认实现：返回可用版本列表的第一个
   */
  async getLatestVersion(): Promise<string> {
    const versions = await this.listAvailableVersions()
    if (versions.length === 0) {
      throw new Error('无法获取可用版本列表')
    }
    return versions[0]
  }

  /**
   * 默认实现：返回 null
   */
  async getManagerVersion(): Promise<string | null> {
    return null
  }

  /**
   * 格式化版本号（移除 'v' 前缀）
   * 
   * @param version - 原始版本号
   * @returns 格式化后的版本号
   */
  protected normalizeVersion(version: string): string {
    return version.replace(/^v/, '')
  }

  /**
   * 添加 'v' 前缀到版本号
   * 
   * @param version - 版本号
   * @returns 带 'v' 前缀的版本号
   */
  protected addVersionPrefix(version: string): string {
    return version.startsWith('v') ? version : `v${version}`
  }
}


