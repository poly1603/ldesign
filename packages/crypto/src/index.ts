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
export {
  // 核心管理器
  CryptoManager,
  cryptoManager,

  // 核心功能类
  Encrypt,
  Decrypt,
  Hash,
  HMAC,
  KeyGenerator,
  DigitalSignature,

  // 核心功能实例
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,

  // 性能优化
  PerformanceOptimizer,
} from './core'

// === 算法实现模块 ===
export {
  // AES 算法
  AESEncryptor,
  aes,

  // RSA 算法
  RSAEncryptor,
  rsa,

  // DES 系列算法
  DESEncryptor,
  des,
  TripleDESEncryptor,
  des3,
  tripledes,

  // Blowfish 算法
  BlowfishEncryptor,
  blowfish,

  // 哈希算法
  Hasher,
  HMACHasher,

  // 编码算法
  Encoder,
  encoding,
  base64,
  hex,
} from './algorithms'

// === 工具函数模块 ===
export {
  CONSTANTS,
  ErrorUtils,
  RandomUtils,
  StringUtils,
  ValidationUtils,
} from './utils'

// === 类型定义模块 ===
export type {
  // 核心类型
  EncryptionAlgorithm,
  EncryptResult,
  DecryptResult,

  // 算法选项类型
  AESOptions,
  AESMode,
  AESKeySize,
  RSAOptions,
  RSAKeyFormat,
  RSAKeyPair,
  DESOptions,
  TripleDESOptions,
  BlowfishOptions,

  // 哈希相关类型
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  HMACOptions,

  // 编码类型
  EncodingType,

  // 接口类型
  IEncryptor,
  IHasher,
  IEncoder,
  IHMACer,
  IKeyGenerator,

  // 其他类型
  KeyGenerationOptions,
} from './types'

// === 管理器相关类型 ===
export type {
  CryptoConfig,
  BatchOperation,
  BatchResult,
  CacheStats,
  PerformanceMetrics,
  MemoryPoolConfig,
} from './core'

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
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,
  cryptoManager,
  CryptoManager,
  PerformanceOptimizer,
  aes,
  rsa,
  des,
  des3,
  tripledes,
  blowfish,
  base64,
  hex,
  encoding,
} from './core'

import {
  CONSTANTS,
  StringUtils,
  RandomUtils,
  ValidationUtils,
  ErrorUtils,
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
