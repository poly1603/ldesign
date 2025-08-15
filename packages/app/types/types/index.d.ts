export {
  CacheItem,
  CacheOptions,
  StorageEngine,
} from '../packages/cache/types/types/index.d.js'
export { CacheManager } from '../packages/cache/types/core/cache-manager.d.js'
export {
  ColorConfig,
  ColorMode,
  ThemeConfig,
  ThemeManager,
  ThemeType,
} from '../packages/color/dist/index.d.js'
export {
  CryptoManager,
  DecryptResult,
  EncryptResult,
  EncryptionAlgorithm,
  HashAlgorithm,
  HashResult,
} from '../packages/crypto/dist/index.d.js'
export {
  SizeConfig,
  SizeManager,
  SizeManagerOptions,
  SizeMode,
} from '../packages/size/types/types/index.d.js'
import '../packages/size/types/vue/plugin.d.js'
import '../packages/size/types/node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.d.js'
import '../packages/size/types/node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.d.js'
import '../packages/store/dist/index.d.js'
export { StoreDefinition, StoreFactory } from '@/types/provider'
export { StoreHookReturn, UseStoreOptions } from '@/types/hooks'

/**
 * 简化的类型定义
 */
/**
 * 应用配置接口
 */
interface AppConfig {
  name: string
  version: string
  debug: boolean
}
/**
 * 用户信息接口
 */
interface UserInfo {
  username: string
  loginTime: string
  device: string
}

export type { AppConfig, UserInfo }
