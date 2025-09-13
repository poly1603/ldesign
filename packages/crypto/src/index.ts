/**
 * @ldesign/crypto - 全面的加解密库
 *
 * 主要功能模块：
 * - 算法实现：AES、RSA、DES、3DES、Blowfish 等
 * - 哈希算法：MD5、SHA 系列、HMAC
 * - 编码算法：Base64、Hex
 * - 核心功能：统一的加解密接口
 * - 工具函数：验证、随机数生成等
 * - 性能优化：缓存、批量处理等
 */

// === 核心功能模块 ===
// === 默认导出 ===
/**
 * 默认导出对象，提供所有核心功能的便捷访问
 *
 * @example
 * ```typescript
 * import crypto from '@ldesign/crypto'
 *
 * // 使用加密功能
 * const encrypted = crypto.encrypt.aes('data', 'key')
 * const decrypted = crypto.decrypt.aes(encrypted, 'key')
 *
 * // 使用哈希功能
 * const hash = crypto.hash.sha256('data')
 *
 * // 使用算法实现
 * const result = crypto.aes.encrypt('data', 'key')
 * ```
 */
// 导入所需的实例和类
import {
  aes,
  base64,
  blowfish,
  cryptoManager,
  CryptoManager,
  decrypt,
  des,
  des3,
  digitalSignature,
  encoding,
  encrypt,
  hash,
  hex,
  hmac,
  keyGenerator,
  PerformanceOptimizer,
  rsa,
  tripledes,
} from './core'

import {
  CONSTANTS,
  ErrorUtils,
  RandomUtils,
  StringUtils,
  ValidationUtils,
} from './utils'

// Vue imports commented out due to build issues
// export {
//   useCrypto,
//   useHash,
//   useSignature,
// } from './adapt/vue/composables'

// === Vue 适配器模块 ===
// export {
//   createCryptoPlugin,
//   CryptoPlugin,
//   type CryptoPluginOptions,
//   type GlobalCrypto,
//   installCrypto,
// } from './adapt/vue/plugin'

// === 算法实现模块 ===
export {
  aes,
  // AES 算法
  AESEncryptor,
  base64,
  blowfish,

  // Blowfish 算法
  BlowfishEncryptor,
  des,
  des3,
  // DES 系列算法
  DESEncryptor,
  // 编码算法
  Encoder,
  encoding,
  // 哈希算法
  Hasher,
  hex,
  HMACHasher,
  rsa,
  // RSA 算法
  RSAEncryptor,
  tripledes,
  TripleDESEncryptor,
} from './algorithms'

export {
  // 核心管理器
  CryptoManager,
  cryptoManager,
  Decrypt,
  decrypt,
  DigitalSignature,
  digitalSignature,
  // 核心功能类
  Encrypt,
  // 核心功能实例
  encrypt,
  Hash,
  hash,
  HMAC,
  hmac,
  KeyGenerator,
  keyGenerator,

  // 性能优化
  PerformanceOptimizer,
} from './core'

// === 管理器相关类型 ===
export type {
  BatchOperation,
  BatchResult,
  CacheStats,
  CryptoConfig,
  MemoryPoolConfig,
  PerformanceMetrics,
} from './core'

// === Engine 插件模块 ===
export {
  createCryptoEnginePlugin,
  createDebugCryptoEnginePlugin,
  createDefaultCryptoEnginePlugin,
  createPerformanceCryptoEnginePlugin,
  cryptoEnginePlugin,
  type CryptoEnginePluginOptions,
} from './engine'

// === 类型定义模块 ===
export type {
  AESKeySize,
  AESMode,
  // 算法选项类型
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  // 编码类型
  EncodingType,
  // 核心类型
  EncryptionAlgorithm,
  EncryptResult,
  // 哈希相关类型
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  HMACOptions,
  IEncoder,
  // 接口类型
  IEncryptor,
  IHasher,
  IHMACer,
  IKeyGenerator,
  // 其他类型
  KeyGenerationOptions,
  RSAKeyFormat,
  RSAKeyPair,
  RSAOptions,
  TripleDESOptions,
} from './types'

// === 工具函数模块 ===
export {
  CONSTANTS,
  ErrorUtils,
  RandomUtils,
  StringUtils,
  ValidationUtils,
} from './utils'

const LDesignCrypto = {
  // === 核心功能 ===
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,

  // === 管理器 ===
  manager: cryptoManager,
  CryptoManager,
  PerformanceOptimizer,

  // === 算法实现 ===
  algorithms: {
    aes,
    rsa,
    des,
    des3,
    tripledes,
    blowfish,
  },

  // === 编码工具 ===
  encoding: {
    base64,
    hex,
    encoding,
  },

  // === 工具函数 ===
  utils: {
    StringUtils,
    RandomUtils,
    ValidationUtils,
    ErrorUtils,
  },

  // === 常量 ===
  constants: CONSTANTS,

  // === 版本信息 ===
  version: '0.1.0',
  name: '@ldesign/crypto',
}

export default LDesignCrypto
