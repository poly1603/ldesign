import { describe, expect, it } from 'vitest'

import { des, DESEncryptor } from '../des'

describe('dES 加密算法', () => {
  const testData = 'Hello, World!'
  const testKey = 'testkey1'

  describe('dESEncryptor 类', () => {
    const encryptor = new DESEncryptor()

    it('应该能够加密数据', () => {
      const result = encryptor.encrypt(testData, testKey)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.algorithm).toBe('DES')
      expect(result.iv).toBeDefined()
      expect(result.keySize).toBe(64)
    })

    it('应该能够解密数据', () => {
      const encryptResult = encryptor.encrypt(testData, testKey)
      expect(encryptResult.success).toBe(true)

      const decryptResult = encryptor.decrypt(encryptResult.data!, testKey, {
        iv: encryptResult.iv,
      })

      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
      expect(decryptResult.algorithm).toBe('DES')
    })

    it('应该处理空数据错误', () => {
      const result = encryptor.encrypt('', testKey)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Data cannot be empty')
    })

    it('应该处理空密钥错误', () => {
      const result = encryptor.encrypt(testData, '')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Key cannot be empty')
    })

    it('应该处理解密时缺少 IV 的错误', () => {
      const result = encryptor.decrypt('encrypted_data', testKey)

      expect(result.success).toBe(false)
      expect(result.error).toContain('IV is required')
    })

    it('应该处理不同的加密模式', () => {
      const modes = ['CBC', 'ECB', 'CFB', 'OFB'] as const

      modes.forEach((mode) => {
        const result = encryptor.encrypt(testData, testKey, { mode })
        expect(result.success).toBe(true)
        expect(result.mode).toBe(mode)
      })
    })
  })

  describe('des 便捷函数', () => {
    it('应该能够加密和解密', () => {
      const encryptResult = des.encrypt(testData, testKey)
      expect(encryptResult.success).toBe(true)

      const decryptResult = des.decrypt(encryptResult.data!, testKey, {
        iv: encryptResult.iv,
      })

      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })

    it('应该能够生成密钥', () => {
      const key = des.generateKey()
      expect(key).toBeDefined()
      expect(key.length).toBe(16) // DES 密钥长度为 8 字节 = 16个十六进制字符
    })
  })

  describe('密钥处理', () => {
    const encryptor = new DESEncryptor()

    it('应该处理短密钥', () => {
      const shortKey = '123'
      const result = encryptor.encrypt(testData, shortKey)
      expect(result.success).toBe(true)
    })

    it('应该处理长密钥', () => {
      const longKey = 'this_is_a_very_long_key_for_testing'
      const result = encryptor.encrypt(testData, longKey)
      expect(result.success).toBe(true)
    })
  })

  describe('错误处理', () => {
    const encryptor = new DESEncryptor()

    it('应该处理无效的加密数据', () => {
      const result = encryptor.decrypt('invalid_data', testKey, {
        iv: '1234567890abcdef',
      })
      expect(result.success).toBe(false)
    })
  })
})
