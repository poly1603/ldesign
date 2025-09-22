/**
 * 插件市场主类
 * 
 * 整合插件注册表和管理器，提供完整的市场功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../utils/logger'
import { pluginRegistry } from './registry'
import { pluginManager } from './manager'
import type { 
  PluginManifest, 
  PluginSearchResult 
} from '../types'
import type { MarketplaceConfig } from './index'

/**
 * 插件市场类
 */
export class PluginMarketplace {
  private logger: Logger
  private config: MarketplaceConfig
  private updateTimer?: NodeJS.Timeout

  constructor(config: MarketplaceConfig = {}) {
    this.logger = new Logger('plugin-marketplace')
    this.config = {
      registryUrl: 'https://registry.ldesign.io/plugins',
      cacheDir: '.ldesign/cache',
      autoUpdate: true,
      updateInterval: 24,
      ...config
    }

    // 异步初始化，不阻塞构造函数
    this.initialize().catch(error => {
      this.logger.error('插件市场初始化失败', error)
    })
  }

  /**
   * 初始化市场
   */
  private async initialize(): Promise<void> {
    try {
      // 只在debug模式下输出详细信息
      if (this.logger.getLevel() === 'debug') {
        this.logger.debug('Initializing plugin marketplace...')
      }

      // 启动自动更新
      if (this.config.autoUpdate) {
        this.startAutoUpdate()
      }
    } catch (error) {
      this.logger.error('插件市场初始化失败', error)
    }
  }

  /**
   * 搜索插件
   */
  async search(query: string, options?: {
    category?: string
    tags?: string[]
    limit?: number
    offset?: number
  }): Promise<PluginSearchResult[]> {
    this.logger.debug(`Searching plugins: ${query}`)
    return pluginRegistry.search(query, options)
  }

  /**
   * 获取插件详情
   */
  async getPluginInfo(pluginId: string): Promise<any> {
    const metadata = await pluginRegistry.getPluginDetails(pluginId)
    const installed = await pluginManager.info(pluginId)

    return {
      ...metadata,
      installed: !!installed,
      installedVersion: installed?.version,
      enabled: installed?.enabled
    }
  }

  /**
   * 安装插件
   */
  async install(pluginId: string, options?: {
    version?: string
    force?: boolean
  }): Promise<{
    success: boolean
    message: string
  }> {
    this.logger.info(`Installing plugin: ${pluginId}`)
    return pluginManager.install(pluginId, options)
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginId: string, options?: {
    force?: boolean
  }): Promise<{
    success: boolean
    message: string
  }> {
    this.logger.info(`Uninstalling plugin: ${pluginId}`)
    return pluginManager.uninstall(pluginId, options)
  }

  /**
   * 更新插件
   */
  async update(pluginId: string, options?: {
    version?: string
  }): Promise<{
    success: boolean
    message: string
  }> {
    this.logger.info(`Updating plugin: ${pluginId}`)
    return pluginManager.update(pluginId, options)
  }

  /**
   * 更新所有插件
   */
  async updateAll(): Promise<{
    updated: string[]
    failed: string[]
  }> {
    const installed = await pluginManager.list()
    const updated: string[] = []
    const failed: string[] = []

    for (const plugin of installed) {
      const result = await this.update(plugin.id)
      if (result.success) {
        updated.push(plugin.id)
      } else {
        failed.push(plugin.id)
      }
    }

    return { updated, failed }
  }

  /**
   * 启用插件
   */
  async enable(pluginId: string): Promise<{
    success: boolean
    message: string
  }> {
    return pluginManager.enable(pluginId)
  }

  /**
   * 禁用插件
   */
  async disable(pluginId: string): Promise<{
    success: boolean
    message: string
  }> {
    return pluginManager.disable(pluginId)
  }

  /**
   * 获取已安装插件列表
   */
  async getInstalledPlugins(): Promise<PluginManifest[]> {
    return pluginManager.list()
  }

  /**
   * 获取推荐插件
   */
  async getRecommendedPlugins(projectType?: string): Promise<PluginSearchResult[]> {
    return pluginRegistry.getRecommendedPlugins(projectType)
  }

  /**
   * 获取热门插件
   */
  async getPopularPlugins(limit: number = 10): Promise<PluginSearchResult[]> {
    const all = await pluginRegistry.search('', { limit: 50 })
    return all.slice(0, limit)
  }

  /**
   * 获取最新插件
   */
  async getLatestPlugins(limit: number = 10): Promise<PluginSearchResult[]> {
    const all = await pluginRegistry.search('', { limit: 50 })
    // 按更新时间排序
    all.sort((a, b) => {
      // 简化处理，实际应该比较更新时间
      return 0
    })
    return all.slice(0, limit)
  }

  /**
   * 获取插件分类
   */
  async getCategories(): Promise<Array<{
    name: string
    count: number
  }>> {
    const stats = await pluginRegistry.getStatistics()
    return Object.entries(stats.categories).map(([name, count]) => ({
      name,
      count
    }))
  }

  /**
   * 获取热门标签
   */
  async getPopularTags(): Promise<Array<{
    tag: string
    count: number
  }>> {
    const stats = await pluginRegistry.getStatistics()
    return stats.popularTags
  }

  /**
   * 检查更新
   */
  async checkUpdates(): Promise<Array<{
    pluginId: string
    currentVersion: string
    latestVersion: string
  }>> {
    const installed = await pluginManager.list()
    const updates: Array<{
      pluginId: string
      currentVersion: string
      latestVersion: string
    }> = []

    for (const plugin of installed) {
      const metadata = await pluginRegistry.getPluginDetails(plugin.id)
      if (metadata) {
        const latestVersion = metadata.versions[0].version
        if (plugin.version !== latestVersion) {
          updates.push({
            pluginId: plugin.id,
            currentVersion: plugin.version,
            latestVersion
          })
        }
      }
    }

    return updates
  }

  /**
   * 验证插件
   */
  async verifyPlugin(pluginId: string): Promise<{
    valid: boolean
    issues: string[]
  }> {
    return pluginManager.verify(pluginId)
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    await pluginManager.clearCache()
  }

  /**
   * 导出插件配置
   */
  async exportConfig(): Promise<{
    version: string
    plugins: PluginManifest[]
  }> {
    const plugins = await pluginManager.list()
    return {
      version: '1.0.0',
      plugins
    }
  }

  /**
   * 导入插件配置
   */
  async importConfig(config: {
    plugins: Array<{
      id: string
      version?: string
    }>
  }): Promise<{
    installed: string[]
    failed: string[]
  }> {
    const installed: string[] = []
    const failed: string[] = []

    for (const plugin of config.plugins) {
      const result = await this.install(plugin.id, {
        version: plugin.version
      })
      
      if (result.success) {
        installed.push(plugin.id)
      } else {
        failed.push(plugin.id)
      }
    }

    return { installed, failed }
  }

  /**
   * 启动自动更新
   */
  private startAutoUpdate(): void {
    const interval = this.config.updateInterval! * 60 * 60 * 1000

    this.updateTimer = setInterval(async () => {
      this.logger.info('Checking for plugin updates...')
      const updates = await this.checkUpdates()
      
      if (updates.length > 0) {
        this.logger.info(`Found ${updates.length} plugin updates`)
        
        for (const update of updates) {
          await this.update(update.pluginId)
        }
      }
    }, interval)
  }

  /**
   * 停止自动更新
   */
  stopAutoUpdate(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = undefined
    }
  }

  /**
   * 销毁市场实例
   */
  destroy(): void {
    this.stopAutoUpdate()
  }
}

// 导出单例实例
export const marketplace = new PluginMarketplace()
