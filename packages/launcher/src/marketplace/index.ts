/**
 * 插件市场模块
 * 
 * 提供插件市场功能的统一入口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

export { 
  pluginRegistry,
  PluginStatus,
  type PluginMetadata
} from './registry'

export {
  pluginManager,
  type InstallOptions,
  type PluginOperationResult
} from './manager'

export { PluginMarketplace, marketplace } from './marketplace'

// Re-export types
export type {
  PluginManifest,
  PluginVersion,
  PluginSearchResult
} from '../types'

/**
 * 插件市场配置
 */
export interface MarketplaceConfig {
  /** 注册表URL */
  registryUrl?: string
  /** 缓存目录 */
  cacheDir?: string
  /** 自动更新 */
  autoUpdate?: boolean
  /** 更新间隔(小时) */
  updateInterval?: number
}
