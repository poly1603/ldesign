import {
  IHasher,
  HashAlgorithm,
  HashOptions,
  HashResult,
} from '../types/index.js'

/**
 * 哈希器
 */
declare class Hasher implements IHasher {
  private readonly defaultOptions
  /**
   * 计算哈希值
   */
  hash(
    data: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ): HashResult
  /**
   * 验证哈希值
   */
  verify(
    data: string,
    expectedHash: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ): boolean
  /**
   * 计算文件哈希（模拟，实际应用中需要处理文件流）
   */
  hashFile(
    fileContent: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ): HashResult
}
/**
 * HMAC 哈希器
 */
declare class HMACHasher {
  private readonly defaultOptions
  /**
   * 计算 HMAC
   */
  hmac(
    data: string,
    key: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ): HashResult
  /**
   * 验证 HMAC
   */
  verify(
    data: string,
    key: string,
    expectedHmac: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ): boolean
}
/**
 * 哈希便捷函数
 */
declare const hash: {
  /**
   * MD5 哈希
   */
  md5: (data: string, options?: HashOptions) => string
  /**
   * SHA1 哈希
   */
  sha1: (data: string, options?: HashOptions) => string
  /**
   * SHA224 哈希
   */
  sha224: (data: string, options?: HashOptions) => string
  /**
   * SHA256 哈希
   */
  sha256: (data: string, options?: HashOptions) => string
  /**
   * SHA384 哈希
   */
  sha384: (data: string, options?: HashOptions) => string
  /**
   * SHA512 哈希
   */
  sha512: (data: string, options?: HashOptions) => string
  /**
   * 验证哈希
   */
  verify: (
    data: string,
    expectedHash: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => boolean
}
/**
 * HMAC 便捷函数
 */
declare const hmac: {
  /**
   * HMAC-MD5
   */
  md5: (data: string, key: string, options?: HashOptions) => string
  /**
   * HMAC-SHA1
   */
  sha1: (data: string, key: string, options?: HashOptions) => string
  /**
   * HMAC-SHA256
   */
  sha256: (data: string, key: string, options?: HashOptions) => string
  /**
   * HMAC-SHA384
   */
  sha384: (data: string, key: string, options?: HashOptions) => string
  /**
   * HMAC-SHA512
   */
  sha512: (data: string, key: string, options?: HashOptions) => string
  /**
   * 验证 HMAC
   */
  verify: (
    data: string,
    key: string,
    expectedHmac: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => boolean
}

export { HMACHasher, Hasher, hash, hmac }
