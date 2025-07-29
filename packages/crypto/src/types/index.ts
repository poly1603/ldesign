/**
 * 加密算法类型
 */
export enum EncryptionAlgorithm {
  AES = 'AES',
  DES = 'DES',
  TRIPLE_DES = '3DES',
  RC4 = 'RC4',
  RABBIT = 'Rabbit'
}

/**
 * 哈希算法类型
 */
export enum HashAlgorithm {
  MD5 = 'MD5',
  SHA1 = 'SHA1',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
  SHA3 = 'SHA3',
  RIPEMD160 = 'RIPEMD160'
}

/**
 * HMAC算法类型
 */
export enum HMACAlgorithm {
  HMAC_MD5 = 'HmacMD5',
  HMAC_SHA1 = 'HmacSHA1',
  HMAC_SHA256 = 'HmacSHA256',
  HMAC_SHA512 = 'HmacSHA512'
}

/**
 * 编码格式
 */
export enum EncodingFormat {
  HEX = 'hex',
  BASE64 = 'base64',
  BASE64URL = 'base64url',
  UTF8 = 'utf8',
  LATIN1 = 'latin1'
}

/**
 * 加密配置
 */
export interface EncryptionConfig {
  /** 加密算法 */
  algorithm: EncryptionAlgorithm
  /** 密钥 */
  key: string
  /** 初始化向量 */
  iv?: string
  /** 输出格式 */
  outputFormat?: EncodingFormat
  /** 填充模式 */
  padding?: string
  /** 加密模式 */
  mode?: string
}

/**
 * 哈希配置
 */
export interface HashConfig {
  /** 哈希算法 */
  algorithm: HashAlgorithm
  /** 输出格式 */
  outputFormat?: EncodingFormat
  /** 是否输出大写 */
  uppercase?: boolean
}

/**
 * HMAC配置
 */
export interface HMACConfig {
  /** HMAC算法 */
  algorithm: HMACAlgorithm
  /** 密钥 */
  key: string
  /** 输出格式 */
  outputFormat?: EncodingFormat
  /** 是否输出大写 */
  uppercase?: boolean
}

/**
 * Base64配置
 */
export interface Base64Config {
  /** 是否使用URL安全编码 */
  urlSafe?: boolean
  /** 是否添加填充 */
  padding?: boolean
}

/**
 * 随机数生成配置
 */
export interface RandomConfig {
  /** 长度 */
  length: number
  /** 输出格式 */
  format?: EncodingFormat
  /** 字符集 */
  charset?: string
}

/**
 * 密钥派生配置
 */
export interface KeyDerivationConfig {
  /** 密码 */
  password: string
  /** 盐值 */
  salt: string
  /** 迭代次数 */
  iterations?: number
  /** 密钥长度 */
  keySize?: number
  /** 哈希算法 */
  hasher?: any
}

/**
 * 加密结果
 */
export interface EncryptionResult {
  /** 加密后的数据 */
  encrypted: string
  /** 使用的算法 */
  algorithm: EncryptionAlgorithm
  /** 初始化向量 */
  iv?: string
  /** 输出格式 */
  format: EncodingFormat
}

/**
 * 解密结果
 */
export interface DecryptionResult {
  /** 解密后的数据 */
  decrypted: string
  /** 使用的算法 */
  algorithm: EncryptionAlgorithm
  /** 是否成功 */
  success: boolean
}

/**
 * 哈希结果
 */
export interface HashResult {
  /** 哈希值 */
  hash: string
  /** 使用的算法 */
  algorithm: HashAlgorithm
  /** 输出格式 */
  format: EncodingFormat
}

/**
 * 数字签名配置
 */
export interface SignatureConfig {
  /** 私钥 */
  privateKey: string
  /** 哈希算法 */
  hashAlgorithm?: HashAlgorithm
  /** 输出格式 */
  outputFormat?: EncodingFormat
}

/**
 * 签名验证配置
 */
export interface VerificationConfig {
  /** 公钥 */
  publicKey: string
  /** 签名 */
  signature: string
  /** 哈希算法 */
  hashAlgorithm?: HashAlgorithm
  /** 签名格式 */
  signatureFormat?: EncodingFormat
}

/**
 * 加密插件配置
 */
export interface CryptoPluginConfig {
  /** 默认加密算法 */
  defaultEncryption?: EncryptionAlgorithm
  /** 默认哈希算法 */
  defaultHash?: HashAlgorithm
  /** 默认输出格式 */
  defaultFormat?: EncodingFormat
  /** 是否启用调试模式 */
  debug?: boolean
  /** 自定义算法 */
  customAlgorithms?: Record<string, any>
}