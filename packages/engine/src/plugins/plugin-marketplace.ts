/**
 * 插件市场系统
 * 🛍️ 提供插件发现、安装、更新和管理功能
 */

import type { Engine } from '../types/engine'
import type { Plugin } from '../types/plugin'

export interface PluginMetadata {
  /** 插件ID */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description: string
  /** 插件作者 */
  author: string | { name: string; email?: string; url?: string }
  /** 插件许可证 */
  license?: string
  /** 插件主页 */
  homepage?: string
  /** 插件仓库 */
  repository?: string
  /** 插件标签 */
  tags?: string[]
  /** 插件分类 */
  category?: 'ui' | 'data' | 'dev-tools' | 'optimization' | 'utility' | 'theme' | 'other'
  /** 插件依赖 */
  dependencies?: Record<string, string>
  /** 引擎版本要求 */
  engineVersion?: string
  /** 插件大小(字节) */
  size?: number
  /** 下载次数 */
  downloads?: number
  /** 评分 */
  rating?: number
  /** 评论数 */
  reviews?: number
  /** 发布时间 */
  publishedAt?: Date
  /** 更新时间 */
  updatedAt?: Date
  /** 插件截图 */
  screenshots?: string[]
  /** 插件图标 */
  icon?: string
  /** 是否官方插件 */
  official?: boolean
  /** 是否推荐 */
  featured?: boolean
  /** 是否已验证 */
  verified?: boolean
}

export interface MarketplacePlugin extends PluginMetadata {
  /** 插件安装状态 */
  installed?: boolean
  /** 已安装版本 */
  installedVersion?: string
  /** 是否有更新 */
  hasUpdate?: boolean
  /** 最新版本 */
  latestVersion?: string
  /** 插件入口 */
  entry?: string
  /** CDN地址 */
  cdn?: string
  /** NPM包名 */
  npm?: string
}

export interface MarketplaceOptions {
  /** 市场API地址 */
  apiUrl?: string
  /** CDN地址 */
  cdnUrl?: string
  /** 是否启用缓存 */
  cache?: boolean
  /** 缓存时间(ms) */
  cacheTime?: number
  /** 是否自动检查更新 */
  autoUpdate?: boolean
  /** 更新检查间隔(ms) */
  updateInterval?: number
  /** 是否启用安全检查 */
  securityCheck?: boolean
  /** 代理配置 */
  proxy?: {
    host: string
    port: number
    auth?: {
      username: string
      password: string
    }
  }
}

export interface SearchOptions {
  /** 搜索关键词 */
  query?: string
  /** 分类过滤 */
  category?: string
  /** 标签过滤 */
  tags?: string[]
  /** 排序方式 */
  sort?: 'relevance' | 'downloads' | 'rating' | 'updated' | 'name'
  /** 排序方向 */
  order?: 'asc' | 'desc'
  /** 分页 - 页码 */
  page?: number
  /** 分页 - 每页数量 */
  pageSize?: number
  /** 只显示官方插件 */
  officialOnly?: boolean
  /** 只显示推荐插件 */
  featuredOnly?: boolean
  /** 只显示已验证插件 */
  verifiedOnly?: boolean
}

/**
 * 插件市场管理器
 */
export class PluginMarketplace {
  private engine: Engine
  private options: Required<MarketplaceOptions>
  private pluginCache: Map<string, MarketplacePlugin> = new Map()
  private installedPlugins: Map<string, { plugin: Plugin; metadata: PluginMetadata }> = new Map()
  private updateCheckTimer?: NodeJS.Timeout
  private lastUpdateCheck = 0
  private searchCache: Map<string, { results: MarketplacePlugin[]; timestamp: number }> = new Map()

  constructor(engine: Engine, options: MarketplaceOptions = {}) {
    this.engine = engine
    this.options = {
      apiUrl: options.apiUrl ?? 'https://api.ldesign.io/plugins',
      cdnUrl: options.cdnUrl ?? 'https://cdn.ldesign.io/plugins',
      cache: options.cache ?? true,
      cacheTime: options.cacheTime ?? 3600000, // 1小时
      autoUpdate: options.autoUpdate ?? true,
      updateInterval: options.updateInterval ?? 86400000, // 24小时
      securityCheck: options.securityCheck ?? true,
      proxy: options.proxy
    }

    this.initialize()
  }

  /**
   * 初始化市场
   */
  private initialize(): void {
    // 加载已安装的插件信息
    this.loadInstalledPlugins()

    // 启动自动更新检查
    if (this.options.autoUpdate) {
      this.startUpdateChecker()
    }

    this.engine.logger.info('Plugin Marketplace initialized', {
      apiUrl: this.options.apiUrl,
      autoUpdate: this.options.autoUpdate
    })
  }

  /**
   * 搜索插件
   */
  async search(options: SearchOptions = {}): Promise<MarketplacePlugin[]> {
    // 检查缓存
    const cacheKey = JSON.stringify(options)
    if (this.options.cache && this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey)!
      if (Date.now() - cached.timestamp < this.options.cacheTime) {
        return cached.results
      }
    }

    try {
      const params = new URLSearchParams()
      if (options.query) params.append('q', options.query)
      if (options.category) params.append('category', options.category)
      if (options.tags?.length) params.append('tags', options.tags.join(','))
      if (options.sort) params.append('sort', options.sort)
      if (options.order) params.append('order', options.order)
      if (options.page) params.append('page', String(options.page))
      if (options.pageSize) params.append('pageSize', String(options.pageSize))
      if (options.officialOnly) params.append('official', 'true')
      if (options.featuredOnly) params.append('featured', 'true')
      if (options.verifiedOnly) params.append('verified', 'true')

      const response = await fetch(`${this.options.apiUrl}/search?${params}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const results = await response.json() as MarketplacePlugin[]

      // 标记已安装的插件
      results.forEach(plugin => {
        if (this.installedPlugins.has(plugin.id)) {
          plugin.installed = true
          plugin.installedVersion = this.installedPlugins.get(plugin.id)!.metadata.version
          plugin.hasUpdate = this.hasUpdate(plugin)
        }
      })

      // 缓存结果
      if (this.options.cache) {
        this.searchCache.set(cacheKey, {
          results,
          timestamp: Date.now()
        })
      }

      return results
    } catch (error) {
      this.engine.logger.error('Plugin search failed', error)
      throw error
    }
  }

  /**
   * 获取插件详情
   */
  async getPlugin(pluginId: string): Promise<MarketplacePlugin | null> {
    // 检查缓存
    if (this.pluginCache.has(pluginId)) {
      const cached = this.pluginCache.get(pluginId)!
      // 如果缓存未过期，直接返回
      if (Date.now() - (cached.updatedAt?.getTime() ?? 0) < this.options.cacheTime) {
        return cached
      }
    }

    try {
      const response = await fetch(`${this.options.apiUrl}/plugins/${pluginId}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to get plugin: ${response.statusText}`)
      }

      const plugin = await response.json() as MarketplacePlugin

      // 标记安装状态
      if (this.installedPlugins.has(pluginId)) {
        plugin.installed = true
        plugin.installedVersion = this.installedPlugins.get(pluginId)!.metadata.version
        plugin.hasUpdate = this.hasUpdate(plugin)
      }

      // 缓存插件信息
      this.pluginCache.set(pluginId, plugin)

      return plugin
    } catch (error) {
      this.engine.logger.error(`Failed to get plugin ${pluginId}`, error)
      throw error
    }
  }

  /**
   * 安装插件
   */
  async install(pluginId: string, version?: string): Promise<void> {
    // 获取插件信息
    const pluginInfo = await this.getPlugin(pluginId)
    if (!pluginInfo) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    // 检查是否已安装
    if (this.installedPlugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already installed`)
    }

    // 检查引擎版本兼容性
    if (pluginInfo.engineVersion) {
      const engineVersion = this.engine.getConfig('version', '0.0.0') as string
      if (!this.isVersionCompatible(engineVersion, pluginInfo.engineVersion)) {
        throw new Error(`Plugin requires engine version ${pluginInfo.engineVersion}, current is ${engineVersion}`)
      }
    }

    // 安全检查
    if (this.options.securityCheck) {
      await this.performSecurityCheck(pluginInfo)
    }

    try {
      // 下载插件
      const plugin = await this.downloadPlugin(pluginInfo, version)

      // 安装依赖
      if (pluginInfo.dependencies) {
        await this.installDependencies(pluginInfo.dependencies)
      }

      // 注册插件
      await this.engine.use(plugin)

      // 记录安装信息
      this.installedPlugins.set(pluginId, {
        plugin,
        metadata: pluginInfo
      })

      // 保存到本地存储
      this.saveInstalledPlugins()

      this.engine.logger.info(`Plugin ${pluginId} installed successfully`, {
        version: version ?? pluginInfo.version
      })

      // 触发安装事件
      this.engine.events.emit('plugin:installed', {
        pluginId,
        version: version ?? pluginInfo.version,
        metadata: pluginInfo
      })
    } catch (error) {
      this.engine.logger.error(`Failed to install plugin ${pluginId}`, error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginId: string): Promise<void> {
    if (!this.installedPlugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is not installed`)
    }

    const { plugin, metadata } = this.installedPlugins.get(pluginId)!

    try {
      // 调用插件的卸载方法
      if (typeof plugin.uninstall === 'function') {
        await plugin.uninstall(this.engine)
      }

      // 从引擎中移除
      await this.engine.plugins.unregister(pluginId)

      // 从已安装列表中移除
      this.installedPlugins.delete(pluginId)

      // 保存到本地存储
      this.saveInstalledPlugins()

      this.engine.logger.info(`Plugin ${pluginId} uninstalled successfully`)

      // 触发卸载事件
      this.engine.events.emit('plugin:uninstalled', {
        pluginId,
        metadata
      })
    } catch (error) {
      this.engine.logger.error(`Failed to uninstall plugin ${pluginId}`, error)
      throw error
    }
  }

  /**
   * 更新插件
   */
  async update(pluginId: string, version?: string): Promise<void> {
    if (!this.installedPlugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is not installed`)
    }

    const pluginInfo = await this.getPlugin(pluginId)
    if (!pluginInfo) {
      throw new Error(`Plugin ${pluginId} not found in marketplace`)
    }

    const targetVersion = version ?? pluginInfo.latestVersion ?? pluginInfo.version

    try {
      // 先卸载旧版本
      await this.uninstall(pluginId)

      // 安装新版本
      await this.install(pluginId, targetVersion)

      this.engine.logger.info(`Plugin ${pluginId} updated to version ${targetVersion}`)

      // 触发更新事件
      this.engine.events.emit('plugin:updated', {
        pluginId,
        version: targetVersion,
        metadata: pluginInfo
      })
    } catch (error) {
      this.engine.logger.error(`Failed to update plugin ${pluginId}`, error)
      // 尝试恢复旧版本
      try {
        const oldVersion = this.installedPlugins.get(pluginId)?.metadata.version
        if (oldVersion) {
          await this.install(pluginId, oldVersion)
        }
      } catch (restoreError) {
        this.engine.logger.error('Failed to restore old version', restoreError)
      }
      throw error
    }
  }

  /**
   * 检查更新
   */
  async checkUpdates(): Promise<MarketplacePlugin[]> {
    const updates: MarketplacePlugin[] = []

    for (const [pluginId, { metadata }] of this.installedPlugins) {
      const pluginInfo = await this.getPlugin(pluginId)
      if (pluginInfo && this.hasUpdate(pluginInfo)) {
        updates.push(pluginInfo)
      }
    }

    this.lastUpdateCheck = Date.now()

    if (updates.length > 0) {
      this.engine.logger.info(`Found ${updates.length} plugin updates`)
      this.engine.events.emit('plugins:updates-available', { updates })
    }

    return updates
  }

  /**
   * 获取推荐插件
   */
  async getFeatured(): Promise<MarketplacePlugin[]> {
    return this.search({ featuredOnly: true, sort: 'rating', order: 'desc' })
  }

  /**
   * 获取热门插件
   */
  async getPopular(limit = 10): Promise<MarketplacePlugin[]> {
    const results = await this.search({ sort: 'downloads', order: 'desc', pageSize: limit })
    return results.slice(0, limit)
  }

  /**
   * 获取最新插件
   */
  async getLatest(limit = 10): Promise<MarketplacePlugin[]> {
    const results = await this.search({ sort: 'updated', order: 'desc', pageSize: limit })
    return results.slice(0, limit)
  }

  /**
   * 获取已安装插件
   */
  getInstalled(): Array<{ plugin: Plugin; metadata: PluginMetadata }> {
    return Array.from(this.installedPlugins.values())
  }

  /**
   * 下载插件
   */
  private async downloadPlugin(pluginInfo: MarketplacePlugin, version?: string): Promise<Plugin> {
    const targetVersion = version ?? pluginInfo.version
    let pluginUrl: string

    // 确定下载地址
    if (pluginInfo.cdn) {
      pluginUrl = pluginInfo.cdn.replace('{version}', targetVersion)
    } else if (pluginInfo.npm) {
      // 从NPM CDN下载
      pluginUrl = `https://unpkg.com/${pluginInfo.npm}@${targetVersion}`
    } else if (pluginInfo.entry) {
      pluginUrl = pluginInfo.entry
    } else {
      // 默认从市场CDN下载
      pluginUrl = `${this.options.cdnUrl}/${pluginInfo.id}/${targetVersion}/index.js`
    }

    try {
      // 动态导入插件模块
      const module = await import(/* @vite-ignore */ pluginUrl)

      // 获取插件导出
      const plugin = module.default || module

      // 验证插件结构
      if (!this.isValidPlugin(plugin)) {
        throw new Error('Invalid plugin structure')
      }

      return plugin as Plugin
    } catch (error) {
      this.engine.logger.error(`Failed to download plugin from ${pluginUrl}`, error)
      throw error
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(dependencies: Record<string, string>): Promise<void> {
    for (const [depId, depVersion] of Object.entries(dependencies)) {
      // 检查依赖是否已安装
      if (!this.installedPlugins.has(depId)) {
        await this.install(depId, depVersion)
      } else {
        // 检查版本兼容性
        const installed = this.installedPlugins.get(depId)!.metadata
        if (!this.isVersionCompatible(installed.version, depVersion)) {
          throw new Error(`Dependency ${depId} version conflict: required ${depVersion}, installed ${installed.version}`)
        }
      }
    }
  }

  /**
   * 执行安全检查
   */
  private async performSecurityCheck(plugin: MarketplacePlugin): Promise<void> {
    // 检查是否已验证
    if (!plugin.verified && !plugin.official) {
      const shouldContinue = await this.confirmInstall(plugin)
      if (!shouldContinue) {
        throw new Error('Installation cancelled by user')
      }
    }

    // 可以添加更多安全检查，如：
    // - 检查插件权限
    // - 扫描恶意代码
    // - 验证数字签名等
  }

  /**
   * 确认安装
   */
  private async confirmInstall(plugin: MarketplacePlugin): Promise<boolean> {
    // 在实际应用中，这里应该显示一个确认对话框
    this.engine.logger.warn(`Plugin ${plugin.id} is not verified. Installing unverified plugins may pose security risks.`)
    return true // 默认允许安装
  }

  /**
   * 检查版本兼容性
   */
  private isVersionCompatible(current: string, required: string): boolean {
    // 简单的版本比较，实际应用中应使用 semver
    const parseVersion = (v: string) => v.split('.').map(Number)
    const [curMajor, curMinor = 0, curPatch = 0] = parseVersion(current)

    // 处理版本范围
    if (required.startsWith('^')) {
      const [reqMajor] = parseVersion(required.substring(1))
      return curMajor === reqMajor
    }
    if (required.startsWith('~')) {
      const [reqMajor, reqMinor = 0] = parseVersion(required.substring(1))
      return curMajor === reqMajor && curMinor >= reqMinor
    }
    if (required.startsWith('>=')) {
      const [reqMajor, reqMinor = 0, reqPatch = 0] = parseVersion(required.substring(2))
      return curMajor > reqMajor ||
             (curMajor === reqMajor && curMinor > reqMinor) ||
             (curMajor === reqMajor && curMinor === reqMinor && curPatch >= reqPatch)
    }

    // 精确匹配
    return current === required
  }

  /**
   * 验证插件结构
   */
  private isValidPlugin(plugin: unknown): boolean {
    if (!plugin || typeof plugin !== 'object') {
      return false
    }

    const p = plugin as any
    return typeof p.install === 'function' ||
           typeof p.name === 'string' ||
           typeof p.version === 'string'
  }

  /**
   * 检查是否有更新
   */
  private hasUpdate(plugin: MarketplacePlugin): boolean {
    if (!plugin.installed || !plugin.installedVersion) {
      return false
    }

    const latestVersion = plugin.latestVersion ?? plugin.version
    return this.isNewerVersion(latestVersion, plugin.installedVersion)
  }

  /**
   * 比较版本号
   */
  private isNewerVersion(v1: string, v2: string): boolean {
    const parseVersion = (v: string) => v.split('.').map(Number)
    const [v1Major, v1Minor = 0, v1Patch = 0] = parseVersion(v1)
    const [v2Major, v2Minor = 0, v2Patch = 0] = parseVersion(v2)

    return v1Major > v2Major ||
           (v1Major === v2Major && v1Minor > v2Minor) ||
           (v1Major === v2Major && v1Minor === v2Minor && v1Patch > v2Patch)
  }

  /**
   * 启动自动更新检查
   */
  private startUpdateChecker(): void {
    this.updateCheckTimer = setInterval(async () => {
      try {
        await this.checkUpdates()
      } catch (error) {
        this.engine.logger.error('Auto update check failed', error)
      }
    }, this.options.updateInterval)

    // 立即检查一次
    this.checkUpdates().catch(error => {
      this.engine.logger.error('Initial update check failed', error)
    })
  }

  /**
   * 加载已安装的插件
   */
  private loadInstalledPlugins(): void {
    // 从本地存储加载
    const stored = localStorage.getItem('ldesign:installed-plugins')
    if (stored) {
      try {
        const plugins = JSON.parse(stored) as Array<{ id: string; metadata: PluginMetadata }>
        // 这里只恢复元数据，实际的插件实例需要重新加载
        plugins.forEach(({ id, metadata }) => {
          // 标记为已安装，但不设置plugin实例
          this.installedPlugins.set(id, {
            plugin: {} as Plugin, // 占位符，实际使用时需要重新加载
            metadata
          })
        })
      } catch (error) {
        this.engine.logger.error('Failed to load installed plugins', error)
      }
    }
  }

  /**
   * 保存已安装的插件
   */
  private saveInstalledPlugins(): void {
    const plugins = Array.from(this.installedPlugins.entries()).map(([id, { metadata }]) => ({
      id,
      metadata
    }))
    localStorage.setItem('ldesign:installed-plugins', JSON.stringify(plugins))
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.pluginCache.clear()
    this.searchCache.clear()
    this.engine.logger.info('Plugin marketplace cache cleared')
  }

  /**
   * 销毁市场管理器
   */
  destroy(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer)
      this.updateCheckTimer = undefined
    }

    this.pluginCache.clear()
    this.searchCache.clear()
    this.installedPlugins.clear()

    this.engine.logger.info('Plugin Marketplace destroyed')
  }
}

/**
 * 创建插件市场
 */
export function createPluginMarketplace(
  engine: Engine,
  options?: MarketplaceOptions
): PluginMarketplace {
  return new PluginMarketplace(engine, options)
}
