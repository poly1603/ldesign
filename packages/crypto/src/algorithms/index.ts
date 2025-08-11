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
  // 算法选项类型
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  EncodingType,
  // 核心结果类型
  EncryptResult,
  // 其他类型
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  IEncoder,
  // 接口类型
  IEncryptor,
  IHasher,
  RSAKeyPair,
  RSAOptions,
  TripleDESOptions,
} from '../types'

// === 对称加密算法 ===
export {
  aes,
  // AES 算法
  AESEncryptor,
} from './aes'

export {
  blowfish,
  // Blowfish 算法
  BlowfishEncryptor,
} from './blowfish'

export {
  des,
  // DES 算法
  DESEncryptor,
} from './des'

// === 编码算法 ===
export {
  base64,
  // 编码器和便捷函数
  Encoder,
  encoding,
  hex,
} from './encoding'

// === 哈希算法 ===
export {
  hash,
  // 哈希和 HMAC
  Hasher,
  hmac,
  HMACHasher,
} from './hash'

// === 非对称加密算法 ===
export {
  rsa,
  // RSA 算法
  RSAEncryptor,
} from './rsa'

export {
  des3,
  tripledes,
  // 3DES 算法
  TripleDESEncryptor,
} from './tripledes'
