/**
 * 算法模块导出
 *
 * 提供所有加密算法的实现，包括：
 * - 对称加密：AES、DES、3DES、Blowfish
 * - 非对称加密：RSA
 * - 哈希算法：MD5、SHA 系列、HMAC
 * - 编码算法：Base64、Hex
 */

// === 类型定义 ===
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

  // 其他类型
  HashAlgorithm,
  HMACAlgorithm,
  EncodingType,
  RSAKeyPair,

  // 接口类型
  IEncryptor,
  IHasher,
  IEncoder,
} from '../types'

// === 对称加密算法 ===
export {
  // AES 算法
  AESEncryptor,
  aes,
} from './aes'

export {
  // DES 算法
  DESEncryptor,
  des,
} from './des'

export {
  // 3DES 算法
  TripleDESEncryptor,
  des3,
  tripledes,
} from './tripledes'

export {
  // Blowfish 算法
  BlowfishEncryptor,
  blowfish,
} from './blowfish'

// === 非对称加密算法 ===
export {
  // RSA 算法
  RSAEncryptor,
  rsa,
} from './rsa'

// === 哈希算法 ===
export {
  // 哈希和 HMAC
  Hasher,
  HMACHasher,
  hash,
  hmac,
} from './hash'

// === 编码算法 ===
export {
  // 编码器和便捷函数
  Encoder,
  encoding,
  base64,
  hex,
} from './encoding'
