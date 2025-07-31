// 导入核心功能
import {
  Encrypt,
  Decrypt,
  Hash,
  HMAC,
  KeyGenerator,
  DigitalSignature,
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,
  aes,
  rsa,
  encoding,
  base64,
  hex,
} from './core'

// 导入算法实现
import {
  AESEncryptor,
  RSAEncryptor,
  Hasher,
  HMACHasher,
  Encoder,
} from './algorithms'

// 导入工具函数
import {
  StringUtils,
  RandomUtils,
  ValidationUtils,
  ErrorUtils,
  CONSTANTS,
} from './utils'

// 导出核心功能
export {
  Encrypt,
  Decrypt,
  Hash,
  HMAC,
  KeyGenerator,
  DigitalSignature,
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,
}

// 导出算法实现
export {
  AESEncryptor,
  RSAEncryptor,
  Hasher,
  HMACHasher,
  Encoder,
  aes,
  rsa,
  encoding,
  base64,
  hex,
}

// 导出工具函数
export {
  StringUtils,
  RandomUtils,
  ValidationUtils,
  ErrorUtils,
  CONSTANTS,
}

// 类型定义
export type {
  EncryptionAlgorithm,
  AESMode,
  AESKeySize,
  HashAlgorithm,
  HMACAlgorithm,
  EncodingType,
  RSAKeyFormat,
  RSAKeyPair,
  AESOptions,
  RSAOptions,
  HashOptions,
  HMACOptions,
  EncryptResult,
  DecryptResult,
  HashResult,
  KeyGenerationOptions,
  IEncryptor,
  IHasher,
  IHMACer,
  IEncoder,
  IKeyGenerator,
} from './types'

// 默认导出
const cryptoDefault = {
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,
  aes,
  rsa,
  encoding,
  base64,
  hex,
  utils: {
    StringUtils,
    RandomUtils,
    ValidationUtils,
    ErrorUtils,
  },
  constants: CONSTANTS,
}

export default cryptoDefault
