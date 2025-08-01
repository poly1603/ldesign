// 核心加密类
import { Decrypt, DigitalSignature, Encrypt, Hash, HMAC, KeyGenerator } from './crypto'

// 导出类
export { Decrypt, DigitalSignature, Encrypt, Hash, HMAC, KeyGenerator }

// 创建实例
export const encrypt = new Encrypt()
export const decrypt = new Decrypt()
export const hash = new Hash()
export const hmac = new HMAC()
export const keyGenerator = new KeyGenerator()
export const digitalSignature = new DigitalSignature()

// 重新导出算法模块
export { aes, base64, encoding, hex, rsa } from '../algorithms'

// 重新导出类型
export type {
  AESOptions,
  DecryptResult,
  EncodingType,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  KeyGenerationOptions,
  RSAKeyPair,
  RSAOptions,
} from '../types'
