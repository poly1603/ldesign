/**
 * 类型测试文件
 * 确保所有类型定义都正确工作
 */

import type {
  BatchOperation,
  CryptoConfig,
} from '../../core/manager'
import type { CacheStats } from '../../core/performance'
import type {
  // 算法实现
  AESEncryptor,
  BlowfishEncryptor,
  DESEncryptor,
  RSAEncryptor,
  TripleDESEncryptor,
} from '../../index'
import type {
  // 算法选项
  AESOptions,
  BlowfishOptions,
  DecryptResult,
  DESOptions,
  // 基础类型
  EncryptionAlgorithm,
  EncryptResult,
  // 接口
  IEncryptor,
} from '../index'
import { describe, expectTypeOf, it } from 'vitest'
import {

  // 便捷函数
  aes,
  blowfish,

  // 管理器
  CryptoManager,
  des,
  PerformanceOptimizer,
} from '../../index'

describe('类型定义测试', () => {
  describe('基础类型', () => {
    it('encryptionAlgorithm 应该包含所有支持的算法', () => {
      expectTypeOf<EncryptionAlgorithm>().toEqualTypeOf<
        'AES' | 'RSA' | 'DES' | '3DES' | 'Blowfish'
      >()
    })

    it('encryptResult 应该有正确的结构', () => {
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

    it('decryptResult 应该有正确的结构', () => {
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
    it('aESOptions 应该有正确的属性', () => {
      expectTypeOf<AESOptions>().toMatchTypeOf<{
        mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM'
        keySize?: 128 | 192 | 256
        iv?: string
        padding?: string
      }>()
    })

    it('dESOptions 应该有正确的属性', () => {
      expectTypeOf<DESOptions>().toMatchTypeOf<{
        mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB'
        iv?: string
        padding?: string
      }>()
    })

    it('blowfishOptions 应该有正确的属性', () => {
      expectTypeOf<BlowfishOptions>().toMatchTypeOf<{
        mode?: 'CBC' | 'ECB'
        iv?: string
        padding?: boolean
      }>()
    })
  })

  describe('接口类型', () => {
    it('iEncryptor 应该有正确的方法签名', () => {
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
    it('cryptoConfig 应该有正确的属性', () => {
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

    it('batchOperation 应该有正确的结构', () => {
      expectTypeOf<BatchOperation>().toMatchTypeOf<{
        id: string
        data: string
        key: string
        algorithm: EncryptionAlgorithm
        options?: any
      }>()
    })

    it('cacheStats 应该有正确的结构', () => {
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
    it('cryptoManager 应该可以正确实例化', () => {
      const manager = new CryptoManager()
      expectTypeOf(manager.encryptData).toBeFunction()
      expectTypeOf(manager.decryptData).toBeFunction()
      expectTypeOf(manager.generateKey).toBeFunction()
    })

    it('performanceOptimizer 应该可以正确实例化', () => {
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
