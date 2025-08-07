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
  // 核心功能实例
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,

  // 算法实现
  aes,
  rsa,
  des,
  des3,
  tripledes,
  blowfish,

  // 编码工具
  encoding,
  base64,
  hex,

  // 管理器
  cryptoManager,
  CryptoManager,
} from '../../core'

// === 类型定义重新导出 ===
export type {
  // 核心结果类型
  EncryptResult,
  DecryptResult,
  HashResult,

  // 算法选项类型
  AESOptions,
  RSAOptions,
  DESOptions,
  TripleDESOptions,
  BlowfishOptions,
  HashOptions,
  HMACOptions,

  // 其他类型
  EncryptionAlgorithm,
  HashAlgorithm,
  HMACAlgorithm,
  EncodingType,
  RSAKeyPair,
  KeyGenerationOptions,

} from '../../types'

// 管理器类型
export type { CryptoConfig } from '../../core'

// === Composition API Hooks ===
export {
  // 加密相关 Hook
  useCrypto,
  type UseCryptoReturn,
  type CryptoState,
  type CryptoActions,

  // 哈希相关 Hook
  useHash,
  type UseHashReturn,
  type HashState,
  type HashActions,

  // 数字签名相关 Hook
  useSignature,
  type UseSignatureReturn,
  type SignatureState,
  type SignatureActions,
} from './composables'

// === Vue 插件 ===
export {
  // 插件创建和安装
  CryptoPlugin,
  createCryptoPlugin,
  installCrypto,

  // 插件类型
  type CryptoPluginOptions,
  type GlobalCrypto,
} from './plugin'

// === 默认导出 ===
// 默认导出插件，保持向后兼容性
export { CryptoPlugin as default } from './plugin'
