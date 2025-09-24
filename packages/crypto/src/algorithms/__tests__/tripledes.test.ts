import { describe, expect, it } from 'vitest'

import { des3, tripledes, TripleDESEncryptor } from '../tripledes'

describe('3DES 加密算法', () => {
  const testData = 'Hello, World!'
  const testKey = 'testkey123testkey456test'

  describe('tripleDESEncryptor 类', () => {
    const encryptor = new TripleDESEncryptor()

    it('应该能够加密数据', () => {
      const result = encryptor.encrypt(testData, testKey)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.algorithm).toBe('3DES')
      expect(result.iv).toBeDefined()
      expect(result.keySize).toBe(192)
    })

    it('应该能够解密数据', () => {
      const encryptResult = encryptor.encrypt(testData, testKey)
      expect(encryptResult.success).toBe(true)

      const decryptResult = encryptor.decrypt(encryptResult.data!, testKey, {
        iv: encryptResult.iv,
      })

      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
      expect(decryptResult.algorithm).toBe('3DES')
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

  describe('tripledes 便捷函数', () => {
    it('应该能够加密和解密', () => {
      const encryptResult = tripledes.encrypt(testData, testKey)
      expect(encryptResult.success).toBe(true)

      const decryptResult = tripledes.decrypt(encryptResult.data!, testKey, {
        iv: encryptResult.iv,
      })

      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })

    it('应该能够生成密钥', () => {
      const key = tripledes.generateKey()
      expect(key).toBeDefined()
      expect(key.length).toBe(48) // 3DES 密钥长度为 24 字节 = 48个十六进制字符
    })
  })

  describe('des3 别名', () => {
    it('应该与 tripledes 功能相同', () => {
      const result1 = tripledes.encrypt(testData, testKey)
      const result2 = des3.encrypt(testData, testKey)

      expect(result1.success).toBe(result2.success)
      expect(result1.algorithm).toBe(result2.algorithm)
    })
  })

  describe('密钥处理', () => {
    const encryptor = new TripleDESEncryptor()

    it('应该处理短密钥', () => {
      const shortKey = '123'
      const result = encryptor.encrypt(testData, shortKey)
      expect(result.success).toBe(true)
    })

    it('应该处理长密钥', () => {
      const longKey = 'this_is_a_very_long_key_for_testing_purposes_and_more'
      const result = encryptor.encrypt(testData, longKey)
      expect(result.success).toBe(true)
    })
  })

  describe('错误处理', () => {
    const encryptor = new TripleDESEncryptor()

    it('应该处理无效的加密数据', () => {
      const result = encryptor.decrypt('invalid_data', testKey, {
        iv: '1234567890abcdef',
      })
      expect(result.success).toBe(false)
    })
  })
})
