import type {
  DecryptResult,
  EncryptResult,
  IEncryptor,
  RSAKeyPair,
  RSAOptions,
} from '../types'
import forge from 'node-forge'
import { CONSTANTS, ErrorUtils, ValidationUtils } from '../utils'

/**
 * RSA 加密器
 */
export class RSAEncryptor implements IEncryptor {
  private readonly defaultOptions: Required<RSAOptions> = {
    keyFormat: 'pkcs1',
    keySize: CONSTANTS.RSA.DEFAULT_KEY_SIZE,
    padding: 'OAEP',
  }

  // 密钥对缓存，避免重复解析
  private keyPairCache = new Map<string, forge.pki.rsa.KeyPair>()
  private publicKeyCache = new Map<string, forge.pki.rsa.PublicKey>()
  private privateKeyCache = new Map<string, forge.pki.rsa.PrivateKey>()
  private maxKeyCacheSize = 50

  /**
   * 生成 RSA 密钥对
   */
  generateKeyPair(
    keySize: 1024 | 2048 | 3072 | 4096 = CONSTANTS.RSA.DEFAULT_KEY_SIZE,
  ): RSAKeyPair {
    try {
      if (!CONSTANTS.RSA.KEY_SIZES.includes(keySize)) {
        throw ErrorUtils.createEncryptionError(
          `Unsupported RSA key size: ${keySize}`,
          'RSA',
        )
      }

      const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize })

      return {
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createEncryptionError(
        'Failed to generate RSA key pair',
        'RSA',
      )
    }
  }

  /**
   * RSA 公钥加密
   */
  encrypt(
    data: string,
    publicKey: string,
    options: RSAOptions = {},
  ): EncryptResult {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError('Data cannot be empty', 'RSA')
      }

      if (ValidationUtils.isEmpty(publicKey)) {
        throw ErrorUtils.createEncryptionError(
          'Public key cannot be empty',
          'RSA',
        )
      }

      const opts = { ...this.defaultOptions, ...options }

      // 解析公钥
      const publicKeyObj = this.parsePublicKey(publicKey)

      // 选择填充方式
      const paddingScheme = this.getPaddingScheme(opts.padding)

      // 执行加密
      const encrypted = publicKeyObj.encrypt(data, paddingScheme)
      const encryptedBase64 = forge.util.encode64(encrypted)

      return {
        success: true,
        data: encryptedBase64,
        algorithm: `RSA-${opts.keySize}`,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createEncryptionError('Unknown encryption error', 'RSA')
    }
  }

  /**
   * RSA 私钥解密
   */
  decrypt(
    encryptedData: string | EncryptResult,
    privateKey: string,
    options: RSAOptions = {},
  ): DecryptResult {
    const opts = { ...this.defaultOptions, ...options }

    try {
      if (ValidationUtils.isEmpty(privateKey)) {
        throw ErrorUtils.createDecryptionError(
          'Private key cannot be empty',
          'RSA',
        )
      }
      let ciphertext: string

      // 处理输入数据
      if (typeof encryptedData === 'string') {
        ciphertext = encryptedData
      } else {
        ciphertext = encryptedData.data || ''
      }

      // 解析私钥
      const privateKeyObj = this.parsePrivateKey(privateKey)

      // 选择填充方式
      const paddingScheme = this.getPaddingScheme(opts.padding)

      // 解码 Base64
      const encryptedBytes = forge.util.decode64(ciphertext)

      // 执行解密
      const decrypted = privateKeyObj.decrypt(encryptedBytes, paddingScheme)

      return {
        success: true,
        data: decrypted,
        algorithm: `RSA-${opts.keySize}`,
      }
    } catch (error) {
      const algorithmName = `RSA-${opts.keySize}`
      if (error instanceof Error) {
        return {
          success: false,
          data: '',
          algorithm: algorithmName,
          error: error.message,
        }
      }
      return {
        success: false,
        data: '',
        algorithm: algorithmName,
        error: 'Unknown decryption error',
      }
    }
  }

  /**
   * RSA 签名
   */
  sign(data: string, privateKey: string, algorithm: string = 'sha256'): string {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError('Data cannot be empty', 'RSA')
      }

      if (ValidationUtils.isEmpty(privateKey)) {
        throw ErrorUtils.createEncryptionError(
          'Private key cannot be empty',
          'RSA',
        )
      }

      // 解析私钥
      const privateKeyObj = this.parsePrivateKey(privateKey)

      // 创建消息摘要
      const md = this.getMessageDigest(algorithm)
      md.update(data, 'utf8')

      // 生成签名
      const signature = privateKeyObj.sign(md)

      return forge.util.encode64(signature)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw ErrorUtils.createEncryptionError('Failed to sign data', 'RSA')
    }
  }

  /**
   * RSA 验证签名
   */
  verify(
    data: string,
    signature: string,
    publicKey: string,
    algorithm: string = 'sha256',
  ): boolean {
    try {
      if (
        ValidationUtils.isEmpty(data)
        || ValidationUtils.isEmpty(signature)
        || ValidationUtils.isEmpty(publicKey)
      ) {
        return false
      }

      // 解析公钥
      const publicKeyObj = this.parsePublicKey(publicKey)

      // 创建消息摘要
      const md = this.getMessageDigest(algorithm)
      md.update(data, 'utf8')

      // 解码签名
      const signatureBytes = forge.util.decode64(signature)

      // 验证签名
      return publicKeyObj.verify(md.digest().bytes(), signatureBytes)
    } catch {
      return false
    }
  }

  /**
   * 解析公钥
   */
  private parsePublicKey(publicKey: string): forge.pki.rsa.PublicKey {
    try {
      // 尝试解析 PEM 格式
      if (publicKey.includes('-----BEGIN')) {
        return forge.pki.publicKeyFromPem(publicKey)
      }

      // 尝试解析 Base64 格式
      const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`
      return forge.pki.publicKeyFromPem(pemKey)
    } catch {
      throw ErrorUtils.createEncryptionError('Invalid public key format', 'RSA')
    }
  }

  /**
   * 解析私钥
   */
  private parsePrivateKey(privateKey: string): forge.pki.rsa.PrivateKey {
    try {
      // 尝试解析 PEM 格式
      if (privateKey.includes('-----BEGIN')) {
        return forge.pki.privateKeyFromPem(privateKey)
      }

      // 尝试解析 Base64 格式
      const pemKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`
      return forge.pki.privateKeyFromPem(pemKey)
    } catch {
      throw ErrorUtils.createDecryptionError(
        'Invalid private key format',
        'RSA',
      )
    }
  }

  /**
   * 获取填充方案
   */
  private getPaddingScheme(padding: string): 'RSA-OAEP' | 'RSAES-PKCS1-V1_5' {
    switch (padding.toUpperCase()) {
      case 'OAEP':
        return 'RSA-OAEP'
      case 'PKCS1':
        return 'RSAES-PKCS1-V1_5'
      default:
        return 'RSA-OAEP'
    }
  }

  private getMessageDigest(algorithm: string): forge.md.MessageDigest {
    const alg = algorithm.toLowerCase()
    switch (alg) {
      case 'sha1':
        return forge.md.sha1.create()
      case 'sha256':
        return forge.md.sha256.create()
      case 'sha512':
        return forge.md.sha512.create()
      default:
        // 默认 sha256
        return forge.md.sha256.create()
    }
  }

  /**
   * 缓存公钥
   */
  private cachePublicKey(
    keyString: string,
    publicKey: forge.pki.rsa.PublicKey,
  ): void {
    if (this.publicKeyCache.size >= this.maxKeyCacheSize) {
      const firstKey = this.publicKeyCache.keys().next().value
      if (firstKey) {
        this.publicKeyCache.delete(firstKey)
      }
    }
    this.publicKeyCache.set(keyString, publicKey)
  }

  /**
   * 缓存私钥
   */
  private cachePrivateKey(
    keyString: string,
    privateKey: forge.pki.rsa.PrivateKey,
  ): void {
    if (this.privateKeyCache.size >= this.maxKeyCacheSize) {
      const firstKey = this.privateKeyCache.keys().next().value
      if (firstKey) {
        this.privateKeyCache.delete(firstKey)
      }
    }
    this.privateKeyCache.set(keyString, privateKey)
  }

  /**
   * 获取缓存的公钥或解析新的公钥
   */
  private getPublicKey(keyString: string): forge.pki.rsa.PublicKey {
    const cached = this.publicKeyCache.get(keyString)
    if (cached) {
      return cached
    }

    const publicKey = forge.pki.publicKeyFromPem(keyString)
    this.cachePublicKey(keyString, publicKey)
    return publicKey
  }

  /**
   * 获取缓存的私钥或解析新的私钥
   */
  private getPrivateKey(keyString: string): forge.pki.rsa.PrivateKey {
    const cached = this.privateKeyCache.get(keyString)
    if (cached) {
      return cached
    }

    const privateKey = forge.pki.privateKeyFromPem(keyString)
    this.cachePrivateKey(keyString, privateKey)
    return privateKey
  }

  /**
   * 清除密钥缓存
   */
  clearKeyCache(): void {
    this.keyPairCache.clear()
    this.publicKeyCache.clear()
    this.privateKeyCache.clear()
  }
}

/**
 * RSA 加密便捷函数
 */
export const rsa = {
  /**
   * 生成 RSA 密钥对
   */
  generateKeyPair: (keySize?: 1024 | 2048 | 3072 | 4096): RSAKeyPair => {
    const encryptor = new RSAEncryptor()
    return encryptor.generateKeyPair(keySize)
  },

  /**
   * RSA 公钥加密
   */
  encrypt: (
    data: string,
    publicKey: string,
    options?: RSAOptions,
  ): EncryptResult => {
    const encryptor = new RSAEncryptor()
    return encryptor.encrypt(data, publicKey, options)
  },

  /**
   * RSA 私钥解密
   */
  decrypt: (
    encryptedData: string | EncryptResult,
    privateKey: string,
    options?: RSAOptions,
  ): DecryptResult => {
    const encryptor = new RSAEncryptor()
    return encryptor.decrypt(encryptedData, privateKey, options)
  },

  /**
   * RSA 签名
   */
  sign: (data: string, privateKey: string, algorithm?: string): string => {
    const encryptor = new RSAEncryptor()
    return encryptor.sign(data, privateKey, algorithm)
  },

  /**
   * RSA 验证签名
   */
  verify: (
    data: string,
    signature: string,
    publicKey: string,
    algorithm?: string,
  ): boolean => {
    const encryptor = new RSAEncryptor()
    return encryptor.verify(data, signature, publicKey, algorithm)
  },
}
