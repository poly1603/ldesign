/**
 * Vue 3 适配器模块
 *
 * 为 Vue 3 应用提供深度集成的加密功能，包括：
 * - Composition API Hooks
 * - Vue 插件
 * - 响应式状态管理
 * - 类型安全的 API
 */

// === Vue Composables ===
// useCrypto 在下面的 Composition API Hooks 部分导出

// === 核心功能重新导出 ===
// 为 Vue 环境提供便捷的核心功能访问
export {
  // 算法实现
  aes,
  base64,
  blowfish,
  // 管理器
  cryptoManager,
  CryptoManager,
  decrypt,
  des,
  des3,
  digitalSignature,
  // 编码工具
  encoding,
  // 核心功能实例
  encrypt,
  hash,
  hex,
  hmac,
  keyGenerator,
  rsa,
  tripledes,
} from '../../core'

// 管理器类型
export type { CryptoConfig } from '../../core'

// === 类型定义重新导出 ===
export type {
  // 算法选项类型
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  EncodingType,
  // 其他类型
  EncryptionAlgorithm,
  // 核心结果类型
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  HMACOptions,
  KeyGenerationOptions,
  RSAKeyPair,
  RSAOptions,
  TripleDESOptions,
} from '../../types'

// === Composition API Hooks ===
export {
  type CryptoActions,
  type CryptoState,
  // 便捷的组合式函数
  type EncryptionActions,
  type EncryptionState,
  type HashActions,
  type HashState,
  type KeyManagerActions,
  type KeyManagerState,

  type SignatureActions,
  type SignatureState,
  // 加密相关 Hook
  useCrypto,
  type UseCryptoReturn,

  useEncryption,
  type UseEncryptionReturn,
  // 哈希相关 Hook
  useHash,
  type UseHashReturn,
  useKeyManager,
  type UseKeyManagerReturn,
  // 数字签名相关 Hook
  useSignature,
  type UseSignatureReturn,
} from './composables'

// === Vue 插件 ===
export {
  createCryptoPlugin,
  // 插件创建和安装
  CryptoPlugin,
  // 插件类型
  type CryptoPluginOptions,
  type GlobalCrypto,
  installCrypto,
} from './plugin'

// === 默认导出 ===
// 默认导出插件，保持向后兼容性
export { CryptoPlugin as default } from './plugin'
