/**
 * 类型测试文件
 * 确保所有类型定义都正确工作
 */

import { describe, it, expectTypeOf } from 'vitest'
import type {
  // 基础类型
  EncryptionAlgorithm,
  EncryptResult,
  DecryptResult,
  HashResult,

  // 算法选项
  AESOptions,
  DESOptions,
  TripleDESOptions,
  BlowfishOptions,
  RSAOptions,
  HashOptions,

  // 接口
  IEncryptor,
  IHasher,
  IEncoder,

  // 其他类型
  RSAKeyPair,
  EncodingType,
  HashAlgorithm,
} from '../index'

import type {
  CryptoConfig,
  BatchOperation,
  BatchResult,
} from '../../core/manager'

import type { CacheStats } from '../../core/performance'

import {
  // 算法实现
  AESEncryptor,
  DESEncryptor,
  TripleDESEncryptor,
  BlowfishEncryptor,
  RSAEncryptor,

  // 管理器
  CryptoManager,
  PerformanceOptimizer,

  // 便捷函数
  aes,
  des,
  des3,
  blowfish,
  rsa,
} from '../../index'

describe('类型定义测试', () => {
  describe('基础类型', () => {
    it('EncryptionAlgorithm 应该包含所有支持的算法', () => {
      expectTypeOf<EncryptionAlgorithm>().toEqualTypeOf<
        'AES' | 'RSA' | 'DES' | '3DES' | 'Blowfish'
      >()
    })

    it('EncryptResult 应该有正确的结构', () => {
      expectTypeOf<EncryptResult>().toMatchTypeOf<{
        success: boolean
        data?: string
        algorithm: string
        mode?: string
        iv?: string
        salt?: string
        keySize?: number
        error?: string
      }>()
    })

    it('DecryptResult 应该有正确的结构', () => {
      expectTypeOf<DecryptResult>().toMatchTypeOf<{
        success: boolean
        data?: string
        algorithm: string
        mode?: string
        error?: string
      }>()
    })
  })

  describe('算法选项类型', () => {
    it('AESOptions 应该有正确的属性', () => {
      expectTypeOf<AESOptions>().toMatchTypeOf<{
        mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM'
        keySize?: 128 | 192 | 256
        iv?: string
        padding?: string
      }>()
    })

    it('DESOptions 应该有正确的属性', () => {
      expectTypeOf<DESOptions>().toMatchTypeOf<{
        mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB'
        iv?: string
        padding?: string
      }>()
    })

    it('BlowfishOptions 应该有正确的属性', () => {
      expectTypeOf<BlowfishOptions>().toMatchTypeOf<{
        mode?: 'CBC' | 'ECB'
        iv?: string
        padding?: boolean
      }>()
    })
  })

  describe('接口类型', () => {
    it('IEncryptor 应该有正确的方法签名', () => {
      expectTypeOf<IEncryptor>().toMatchTypeOf<{
        encrypt: (data: string, key: string, options?: any) => EncryptResult
        decrypt: (
          encryptedData: string | EncryptResult,
          key: string,
          options?: any
        ) => DecryptResult
      }>()
    })

    it('算法实现应该符合 IEncryptor 接口', () => {
      expectTypeOf<AESEncryptor>().toMatchTypeOf<IEncryptor>()
      expectTypeOf<DESEncryptor>().toMatchTypeOf<IEncryptor>()
      expectTypeOf<TripleDESEncryptor>().toMatchTypeOf<IEncryptor>()
      expectTypeOf<BlowfishEncryptor>().toMatchTypeOf<IEncryptor>()
      expectTypeOf<RSAEncryptor>().toMatchTypeOf<IEncryptor>()
    })
  })

  describe('管理器类型', () => {
    it('CryptoConfig 应该有正确的属性', () => {
      expectTypeOf<CryptoConfig>().toMatchTypeOf<{
        defaultAlgorithm?: EncryptionAlgorithm
        enableCache?: boolean
        maxCacheSize?: number
        enableParallel?: boolean
        autoGenerateIV?: boolean
        keyDerivation?: boolean
        debug?: boolean
        logLevel?: 'error' | 'warn' | 'info' | 'debug'
      }>()
    })

    it('BatchOperation 应该有正确的结构', () => {
      expectTypeOf<BatchOperation>().toMatchTypeOf<{
        id: string
        data: string
        key: string
        algorithm: EncryptionAlgorithm
        options?: any
      }>()
    })

    it('CacheStats 应该有正确的结构', () => {
      expectTypeOf<CacheStats>().toMatchTypeOf<{
        keyCache: number
        resultCache: number
        maxSize: number
      }>()
    })
  })

  describe('便捷函数类型', () => {
    it('aes 函数应该有正确的方法', () => {
      expectTypeOf(aes.encrypt).toBeFunction()
      expectTypeOf(aes.decrypt).toBeFunction()
      expectTypeOf(aes.encrypt128).toBeFunction()
      expectTypeOf(aes.decrypt256).toBeFunction()
    })

    it('des 函数应该有正确的方法', () => {
      expectTypeOf(des.encrypt).toBeFunction()
      expectTypeOf(des.decrypt).toBeFunction()
      expectTypeOf(des.generateKey).toBeFunction()
    })

    it('blowfish 函数应该有正确的方法', () => {
      expectTypeOf(blowfish.encrypt).toBeFunction()
      expectTypeOf(blowfish.decrypt).toBeFunction()
      expectTypeOf(blowfish.generateKey).toBeFunction()
    })
  })

  describe('类实例化', () => {
    it('CryptoManager 应该可以正确实例化', () => {
      const manager = new CryptoManager()
      expectTypeOf(manager.encryptData).toBeFunction()
      expectTypeOf(manager.decryptData).toBeFunction()
      expectTypeOf(manager.generateKey).toBeFunction()
    })

    it('PerformanceOptimizer 应该可以正确实例化', () => {
      const optimizer = new PerformanceOptimizer()
      expectTypeOf(optimizer.batchEncrypt).toBeFunction()
      expectTypeOf(optimizer.batchDecrypt).toBeFunction()
      expectTypeOf(optimizer.getCacheStats).toBeFunction()
    })
  })

  describe('返回类型验证', () => {
    it('加密方法应该返回 EncryptResult', () => {
      const result = aes.encrypt('test', 'key')
      expectTypeOf(result).toEqualTypeOf<EncryptResult>()
    })

    it('解密方法应该返回 DecryptResult', () => {
      const result = aes.decrypt('encrypted', 'key')
      expectTypeOf(result).toEqualTypeOf<DecryptResult>()
    })

    it('管理器方法应该返回 Promise', async () => {
      const manager = new CryptoManager()
      const encryptPromise = manager.encryptData('test', 'key')
      expectTypeOf(encryptPromise).toEqualTypeOf<Promise<EncryptResult>>()

      const decryptPromise = manager.decryptData('encrypted', 'key')
      expectTypeOf(decryptPromise).toEqualTypeOf<Promise<DecryptResult>>()
    })
  })
})
