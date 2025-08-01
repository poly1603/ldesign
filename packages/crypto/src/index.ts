// 导入算法实现
import {
  AESEncryptor,
  Encoder,
  Hasher,
  HMACHasher,
  RSAEncryptor,
} from './algorithms'

// 导入核心功能
import {
  aes,
  base64,
  Decrypt,
  decrypt,
  DigitalSignature,
  digitalSignature,
  encoding,
  Encrypt,
  encrypt,
  Hash,
  hash,
  hex,
  HMAC,
  hmac,
  KeyGenerator,
  keyGenerator,
  rsa,
} from './core'

// 导入工具函数
import {
  CONSTANTS,
  ErrorUtils,
  RandomUtils,
  StringUtils,
  ValidationUtils,
} from './utils'

// 导出核心功能
export {
  Decrypt,
  decrypt,
  DigitalSignature,
  digitalSignature,
  Encrypt,
  encrypt,
  Hash,
  hash,
  HMAC,
  hmac,
  KeyGenerator,
  keyGenerator,
}

// 导出算法实现
export {
  aes,
  AESEncryptor,
  base64,
  Encoder,
  encoding,
  Hasher,
  hex,
  HMACHasher,
  rsa,
  RSAEncryptor,
}

// 导出工具函数
export {
  CONSTANTS,
  ErrorUtils,
  RandomUtils,
  StringUtils,
  ValidationUtils,
}

// 类型定义
export type {
  AESKeySize,
  AESMode,
  AESOptions,
  DecryptResult,
  EncodingType,
  EncryptionAlgorithm,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  HMACOptions,
  IEncoder,
  IEncryptor,
  IHasher,
  IHMACer,
  IKeyGenerator,
  KeyGenerationOptions,
  RSAKeyFormat,
  RSAKeyPair,
  RSAOptions,
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
