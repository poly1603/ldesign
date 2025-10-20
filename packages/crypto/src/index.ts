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

// 导入实用工具类
import { PasswordStrengthChecker } from './utils/password-strength'
import { PerformanceMonitor } from './utils/performance-monitor'

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
  // 认证加密
  AuthenticatedEncryption,
  authenticatedEncryption,
  chain,
  // 链式调用 API
  CryptoChain,
  // 核心管理器
  CryptoManager,
  cryptoManager,
  Decrypt,
  decrypt,
  decryptFromBase64,
  decryptJSON,
  decryptJSONWithAuth,
  decryptWithAuth,
  DigitalSignature,
  digitalSignature,

  // 核心功能类
  Encrypt,

  // 核心功能实例
  encrypt,
  encryptJSON,
  encryptJSONWithAuth,
  encryptToBase64,
  encryptWithAuth,
  Hash,
  hash,

  hashPassword,
  HMAC,
  hmac,
  KeyGenerator,
  keyGenerator,
  // 性能优化
  PerformanceOptimizer,
} from './core'

// === 管理器相关类型 ===
export type {
  AuthenticatedDecryptResult,
  AuthenticatedEncryptionOptions,
  // 认证加密类型
  AuthenticatedEncryptResult,
  BatchOperation,
  BatchResult,
  CacheStats,
  CryptoConfig,
  PerformanceMetrics,
  PerformanceOptimizerConfig,
} from './core'

// === Engine 插件模块（已移至独立入口，避免将可选依赖纳入基础构建）===
// 如需使用 Engine 插件，请从独立入口导入：
// import { createCryptoEnginePlugin } from '@ldesign/crypto/engine'

// === 流式加密 ===
export {
  type FileDecryptionOptions,
  type FileEncryptionOptions,
  type IStreamDecryptor,
  type IStreamEncryptor,
  type IStreamProcessor,
  type StreamDecryptionOptions,
  type StreamDecryptionResult,
  type StreamEncryptionOptions,
  type StreamEncryptionResult,
  type StreamProgress,
} from './stream'

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
  EncryptionOptions,
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
  LRUCache,
  type LRUCacheOptions,
  RandomUtils,
  StringUtils,
  ValidationUtils,
} from './utils'

// === 性能基准测试 ===
export {
  Benchmark,
  type BenchmarkOptions,
  type BenchmarkResult,
  type BenchmarkSuite,
  compareBenchmark,
  createBenchmark,
  quickBenchmark,
} from './utils/benchmark'

// === 数据压缩 ===
export {
  compress,
  type CompressionOptions,
  type CompressionResult,
  DataCompressor,
  decompress,
  type DecompressionResult,
} from './utils/compression'

// === 错误处理 ===
export {
  CryptoError,
  CryptoErrorCode,
  CryptoErrorFactory,
  DecryptionError,
  EncodingError,
  EncryptionError,
  ErrorHandler,
  HashError,
  KeyManagementError,
  RateLimitError,
  StorageError,
  ValidationError,
} from './utils/errors'

// === 密钥派生 ===
export {
  deriveKey,
  generateSalt,
  KeyDerivation,
  type KeyDerivationOptions,
  type KeyDerivationResult,
  verifyKey,
} from './utils/key-derivation'

// === 密钥轮换 ===
export {
  createKeyRotation,
  type EncryptedDataMetadata,
  type KeyInfo,
  KeyRotation,
  type ReencryptionResult,
} from './utils/key-rotation'

// === 对象池 ===
export {
  acquireDecryptResult,
  acquireEncryptResult,
  clearAllPools,
  createDecryptFailure,
  createDecryptSuccess,
  createEncryptFailure,
  createEncryptSuccess,
  DecryptResultPool,
  EncryptResultPool,
  getAllPoolStats,
  globalDecryptResultPool,
  globalEncryptResultPool,
  ObjectPool,
  type ObjectPoolOptions,
  type ObjectPoolStats,
  releaseDecryptResult,
  releaseEncryptResult,
} from './utils/object-pool'

// === 密码强度检测 ===
export {
  type PasswordAnalysis,
  PasswordStrength,
  PasswordStrengthChecker,
} from './utils/password-strength'

// === 性能监控 ===
export {
  type AlgorithmStats,
  type OperationStats,
  type PerformanceMetric,
  PerformanceMonitor,
  type PerformanceMonitorConfig,
  type PerformanceReport,
  type TimeSeriesData,
} from './utils/performance-monitor'

// === 限流器 ===
export {
  createFixedWindowLimiter,
  createSlidingWindowLimiter,
  createTokenBucketLimiter,
  RateLimiter,
  type RateLimiterOptions,
  type RateLimitStatus,
  type RateLimitStrategy,
} from './utils/rate-limiter'

// === 安全存储 ===
export {
  createSecureStorage,
  SecureStorage,
  type SecureStorageOptions,
} from './utils/secure-storage'

// === Worker 线程池 ===
export {
  destroyGlobalWorkerPool,
  getGlobalWorkerPool,
  type WorkerMessage,
  WorkerPool,
  type WorkerPoolOptions,
  type WorkerPoolStats,
  type WorkerResponse,
} from './workers'

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

// 添加到默认导出
Object.assign(LDesignCrypto, {
  // 密码强度检测
  PasswordStrengthChecker,
  // 性能监控
  PerformanceMonitor,
})

export default LDesignCrypto
