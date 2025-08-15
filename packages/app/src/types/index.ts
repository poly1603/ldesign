/**
 * 简化的类型定义
 */

/**
 * 应用配置接口
 */
export interface AppConfig {
  name: string
  version: string
  debug: boolean
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  username: string
  loginTime: string
  device: string
}

// 导出集成包的类型定义
export type {
  CacheManager,
  CacheOptions,
  StorageEngine,
  CacheItem,
} from '@ldesign/cache'

export type {
  ThemeManager,
  ThemeConfig,
  ColorConfig,
  ThemeType,
  ColorMode,
} from '@ldesign/color'

export type {
  CryptoManager,
  EncryptionAlgorithm,
  HashAlgorithm,
  EncryptResult,
  DecryptResult,
  HashResult,
} from '@ldesign/crypto'

export type {
  SizeManager,
  SizeConfig,
  SizeMode,
  SizeManagerOptions,
} from '@ldesign/size'

export type {
  StoreDefinition,
  StoreFactory,
  UseStoreOptions,
  StoreHookReturn,
} from '@ldesign/store'
