// 核心类
export { Crypto } from './core/crypto'
export { Hash } from './core/hash'

// 类型定义
export * from './types'

// 工具函数
export * from './utils'

// 常量
export * from './utils/constants'

// LDesign Engine插件
export { default as CryptoPlugin, createCryptoPlugin } from './plugin'

// 便捷导出
export {
  encodeBase64,
  decodeBase64,
  encodeHex,
  decodeHex,
  encodeUrl,
  decodeUrl,
  generateRandom,
  generateRandomBytes,
  deriveKey,
  safeCompare,
  generateUUID
} from './utils/helpers'

export {
  validateEncryptionConfig,
  validateHashConfig,
  validateHMACConfig,
  isValidHex,
  isValidBase64,
  isValidBase64Url,
  validateKeyStrength
} from './utils/validators'