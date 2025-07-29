import type { EncryptionAlgorithm, HashAlgorithm, HMACAlgorithm, EncodingFormat } from '../types'

/**
 * 支持的加密算法列表
 */
export const SUPPORTED_ENCRYPTION_ALGORITHMS: EncryptionAlgorithm[] = [
  'AES',
  'DES',
  '3DES',
  'RC4',
  'Rabbit'
]

/**
 * 支持的哈希算法列表
 */
export const SUPPORTED_HASH_ALGORITHMS: HashAlgorithm[] = [
  'MD5',
  'SHA1',
  'SHA256',
  'SHA512',
  'SHA3',
  'RIPEMD160'
]

/**
 * 支持的HMAC算法列表
 */
export const SUPPORTED_HMAC_ALGORITHMS: HMACAlgorithm[] = [
  'HmacMD5',
  'HmacSHA1',
  'HmacSHA256',
  'HmacSHA512'
]

/**
 * 支持的编码格式列表
 */
export const SUPPORTED_ENCODING_FORMATS: EncodingFormat[] = [
  'hex',
  'base64',
  'base64url',
  'utf8',
  'latin1'
]

/**
 * 默认密钥长度配置
 */
export const DEFAULT_KEY_LENGTHS = {
  AES: [16, 24, 32],
  DES: [8],
  '3DES': [16, 24],
  RC4: [5, 256], // 范围：5-256字节
  Rabbit: [16]
} as const

/**
 * 默认IV长度配置
 */
export const DEFAULT_IV_LENGTHS = {
  AES: 16,
  DES: 8,
  '3DES': 8
} as const

/**
 * 哈希算法输出长度（字节）
 */
export const HASH_OUTPUT_LENGTHS = {
  MD5: 16,
  SHA1: 20,
  SHA256: 32,
  SHA512: 64,
  SHA3: 32,
  RIPEMD160: 20
} as const

/**
 * 默认PBKDF2迭代次数
 */
export const DEFAULT_PBKDF2_ITERATIONS = 10000

/**
 * 最小安全迭代次数
 */
export const MIN_SECURE_ITERATIONS = 1000

/**
 * 推荐的迭代次数
 */
export const RECOMMENDED_ITERATIONS = 100000

/**
 * 常用字符集
 */
export const CHARSETS = {
  NUMERIC: '0123456789',
  ALPHA_LOWER: 'abcdefghijklmnopqrstuvwxyz',
  ALPHA_UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ALL: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  HEX: '0123456789abcdef',
  HEX_UPPER: '0123456789ABCDEF',
  BASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  BASE64_URL: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
} as const

/**
 * 加密模式
 */
export const ENCRYPTION_MODES = {
  CBC: 'CBC',
  ECB: 'ECB',
  CFB: 'CFB',
  OFB: 'OFB',
  CTR: 'CTR'
} as const

/**
 * 填充模式
 */
export const PADDING_MODES = {
  PKCS7: 'Pkcs7',
  NO_PADDING: 'NoPadding',
  ZERO_PADDING: 'ZeroPadding',
  ISO10126: 'Iso10126',
  ISO97971: 'Iso97971',
  ANSI_X923: 'AnsiX923'
} as const

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  INVALID_ALGORITHM: 'Invalid or unsupported algorithm',
  INVALID_KEY: 'Invalid encryption key',
  INVALID_KEY_LENGTH: 'Invalid key length for the specified algorithm',
  INVALID_IV: 'Invalid initialization vector',
  INVALID_IV_LENGTH: 'Invalid IV length for the specified algorithm',
  INVALID_DATA: 'Invalid input data',
  INVALID_FORMAT: 'Invalid encoding format',
  ENCRYPTION_FAILED: 'Encryption operation failed',
  DECRYPTION_FAILED: 'Decryption operation failed',
  HASH_FAILED: 'Hash calculation failed',
  HMAC_FAILED: 'HMAC calculation failed',
  INVALID_CONFIG: 'Invalid configuration',
  MISSING_KEY: 'Encryption key is required',
  MISSING_ALGORITHM: 'Algorithm is required',
  WEAK_KEY: 'Key strength is too weak',
  INVALID_ITERATIONS: 'Invalid iteration count',
  INVALID_SALT: 'Invalid salt value'
} as const

/**
 * 性能基准配置
 */
export const PERFORMANCE_BENCHMARKS = {
  SMALL_DATA_SIZE: 1024, // 1KB
  MEDIUM_DATA_SIZE: 1024 * 1024, // 1MB
  LARGE_DATA_SIZE: 10 * 1024 * 1024, // 10MB
  BENCHMARK_ITERATIONS: 1000,
  TIMEOUT_MS: 30000 // 30秒超时
} as const

/**
 * 安全配置
 */
export const SECURITY_CONFIG = {
  MIN_KEY_LENGTH: 8,
  RECOMMENDED_KEY_LENGTH: 32,
  MIN_SALT_LENGTH: 8,
  RECOMMENDED_SALT_LENGTH: 32,
  MIN_PASSWORD_LENGTH: 8,
  MAX_DATA_SIZE: 100 * 1024 * 1024, // 100MB
  SECURE_RANDOM_BYTES: 32
} as const

/**
 * 版本信息
 */
export const VERSION_INFO = {
  PACKAGE_VERSION: '1.0.0',
  API_VERSION: 'v1',
  CRYPTO_JS_VERSION: '^4.2.0'
} as const