/**
 * Node.js 版本注册表
 * @module registry/version-registry
 */

import fetch from 'node-fetch'
import type { MirrorConfig, NodeRelease } from '../types'
import { Mirrors } from '../types'

/**
 * Node.js 版本注册表
 * 
 * 用于获取 Node.js 的可用版本列表
 */
export class VersionRegistry {
  private mirror: string
  private cache: Map<string, any> = new Map()
  private cacheTimeout = 3600000 // 1小时缓存

  constructor(mirror: string | MirrorConfig = Mirrors.OFFICIAL) {
    if (typeof mirror === 'string') {
      this.mirror = mirror
    }
    else {
      this.mirror = mirror.url
    }
  }

  /**
   * 获取所有可用版本
   * 
   * @returns 版本列表
   * 
   * @example
   * ```typescript
   * const registry = new VersionRegistry()
   * const versions = await registry.getAllVersions()
   * console.log('可用版本数:', versions.length)
   * ```
   */
  async getAllVersions(): Promise<string[]> {
    const releases = await this.fetchReleases()
    return releases.map(r => r.version.replace(/^v/, ''))
  }

  /**
   * 获取 LTS 版本列表
   * 
   * @returns LTS 版本列表
   * 
   * @example
   * ```typescript
   * const ltsVersions = await registry.getLTSVersions()
   * console.log('LTS 版本:', ltsVersions)
   * ```
   */
  async getLTSVersions(): Promise<string[]> {
    const releases = await this.fetchReleases()
    return releases
      .filter(r => r.lts !== false)
      .map(r => r.version.replace(/^v/, ''))
  }

  /**
   * 获取最新版本
   * 
   * @returns 最新版本号
   * 
   * @example
   * ```typescript
   * const latest = await registry.getLatestVersion()
   * console.log('最新版本:', latest)
   * ```
   */
  async getLatestVersion(): Promise<string> {
    const versions = await this.getAllVersions()
    if (versions.length === 0) {
      throw new Error('无法获取版本列表')
    }
    return versions[0]
  }

  /**
   * 获取最新的 LTS 版本
   * 
   * @returns 最新 LTS 版本号
   * 
   * @example
   * ```typescript
   * const latestLTS = await registry.getLatestLTSVersion()
   * console.log('最新 LTS 版本:', latestLTS)
   * ```
   */
  async getLatestLTSVersion(): Promise<string> {
    const ltsVersions = await this.getLTSVersions()
    if (ltsVersions.length === 0) {
      throw new Error('无法获取 LTS 版本列表')
    }
    return ltsVersions[0]
  }

  /**
   * 检查版本是否存在
   * 
   * @param version - 版本号
   * @returns 是否存在
   * 
   * @example
   * ```typescript
   * const exists = await registry.versionExists('20.10.0')
   * console.log('版本存在:', exists)
   * ```
   */
  async versionExists(version: string): Promise<boolean> {
    const normalizedVersion = version.replace(/^v/, '')
    const versions = await this.getAllVersions()
    return versions.includes(normalizedVersion)
  }

  /**
   * 获取版本详细信息
   * 
   * @param version - 版本号
   * @returns 版本详细信息
   * 
   * @example
   * ```typescript
   * const info = await registry.getVersionInfo('20.10.0')
   * console.log('版本信息:', info)
   * ```
   */
  async getVersionInfo(version: string): Promise<NodeRelease | null> {
    const normalizedVersion = version.replace(/^v/, '')
    const releases = await this.fetchReleases()
    
    return (
      releases.find(r =>
        r.version.replace(/^v/, '') === normalizedVersion,
      ) || null
    )
  }

  /**
   * 从远程获取版本信息
   * 
   * @returns 版本发布信息列表
   */
  private async fetchReleases(): Promise<NodeRelease[]> {
    const cacheKey = 'releases'
    const cached = this.cache.get(cacheKey)

    // 检查缓存
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      // 从 Node.js 官方 API 获取
      const indexUrl = 'https://nodejs.org/dist/index.json'
      const response = await fetch(indexUrl)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = (await response.json()) as NodeRelease[]

      // 缓存结果
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      return data
    }
    catch (error: any) {
      // 如果有缓存数据，返回缓存
      if (cached) {
        console.warn('获取版本列表失败，使用缓存数据:', error.message)
        return cached.data
      }

      throw new Error(`获取版本列表失败: ${error.message}`)
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 设置缓存超时时间
   * 
   * @param timeout - 超时时间（毫秒）
   */
  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout
  }
}


