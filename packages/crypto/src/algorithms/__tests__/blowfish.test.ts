import { describe, expect, it } from 'vitest'

import { blowfish, BlowfishEncryptor } from '../blowfish'

describe('blowfish 加密算法', () => {
  const testData = 'Hello, World!'
  const testKey = 'testkey123456789'

  describe('blowfishEncryptor 类', () => {
    const encryptor = new BlowfishEncryptor()

    it('应该能够加密数据', () => {
      const result = encryptor.encrypt(testData, testKey)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.algorithm).toBe('Blowfish')
      expect(result.iv).toBeDefined()
      expect(result.keySize).toBe(256) // 使用 AES 替代时的密钥大小
    })

    it('应该能够解密数据', () => {
      const encryptResult = encryptor.encrypt(testData, testKey)
      expect(encryptResult.success).toBe(true)

      const decryptResult = encryptor.decrypt(encryptResult.data!, testKey, {
        iv: encryptResult.iv,
      })

      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
      expect(decryptResult.algorithm).toBe('Blowfish')
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
      const modes = ['CBC', 'ECB'] as const

      modes.forEach((mode) => {
        const result = encryptor.encrypt(testData, testKey, { mode })
        expect(result.success).toBe(true)
        expect(result.mode).toBe(mode)
      })
    })
  })

  describe('blowfish 便捷函数', () => {
    it('应该能够加密和解密', () => {
      const encryptResult = blowfish.encrypt(testData, testKey)
      expect(encryptResult.success).toBe(true)

      const decryptResult = blowfish.decrypt(encryptResult.data!, testKey, {
        iv: encryptResult.iv,
      })

      expect(decryptResult.success).toBe(true)
      expect(decryptResult.data).toBe(testData)
    })

    it('应该能够生成密钥', () => {
      const key = blowfish.generateKey()
      expect(key).toBeDefined()
      expect(key.length).toBe(32) // 默认密钥长度
    })

    it('应该能够生成指定长度的密钥', () => {
      const key8 = blowfish.generateKey(8)
      expect(key8.length).toBe(16) // 8字节 = 16个十六进制字符

      const key32 = blowfish.generateKey(32)
      expect(key32.length).toBe(64) // 32字节 = 64个十六进制字符
    })
  })

  describe('密钥处理', () => {
    const encryptor = new BlowfishEncryptor()

    it('应该处理短密钥', () => {
      const shortKey = '123'
      const result = encryptor.encrypt(testData, shortKey)
      expect(result.success).toBe(true)
    })

    it('应该处理长密钥', () => {
      const longKey
        = 'this_is_a_very_long_key_for_testing_purposes_and_more_content'
      const result = encryptor.encrypt(testData, longKey)
      expect(result.success).toBe(true)
    })
  })

  describe('错误处理', () => {
    const encryptor = new BlowfishEncryptor()

    it('应该处理无效的加密数据', () => {
      const result = encryptor.decrypt('invalid_data', testKey, {
        iv: '1234567890abcdef1234567890abcdef',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('web 环境兼容性', () => {
    it('应该显示 Blowfish 替代方案的警告', () => {
      // 模拟 console.warn
      const originalWarn = console.warn
      const warnings: string[] = []
      console.warn = (message: string) => warnings.push(message)

      blowfish.encrypt(testData, testKey)

      expect(
        warnings.some(w =>
          w.includes('Blowfish algorithm is not natively supported'),
        ),
      ).toBe(true)

      // 恢复原始的 console.warn
      console.warn = originalWarn
    })
  })
})
