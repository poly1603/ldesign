// 核心加密类
import { Encrypt, Decrypt, Hash, HMAC, KeyGenerator, DigitalSignature } from './crypto'

// 导出类
export { Encrypt, Decrypt, Hash, HMAC, KeyGenerator, DigitalSignature }

// 创建实例
export const encrypt = new Encrypt()
export const decrypt = new Decrypt()
export const hash = new Hash()
export const hmac = new HMAC()
export const keyGenerator = new KeyGenerator()
export const digitalSignature = new DigitalSignature()

// 重新导出算法模块
export { aes, rsa, encoding, base64, hex } from '../algorithms'

// 重新导出类型
export type {
  AESOptions,
  RSAOptions,
  RSAKeyPair,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  EncodingType,
  EncryptResult,
  DecryptResult,
  KeyGenerationOptions,
} from '../types'
