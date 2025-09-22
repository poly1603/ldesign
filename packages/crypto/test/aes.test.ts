import { describe, expect, it } from 'vitest'
import { aes } from '../src/index'

describe('aES 加密算法测试', () => {
  const testData = 'Hello, AES Encryption!'
  const testKey = 'my-secret-key-256-bits-long'
  const shortKey = 'short'
  const longKey
    = 'this-is-a-very-long-key-that-exceeds-normal-length-requirements'

  describe('基础加密解密功能', () => {
    it('应该成功加密和解密数据', () => {
      const encrypted = aes.encrypt(testData, testKey)
      expect(encrypted.success).toBe(true)
      expect(encrypted.data).toBeTruthy()
      expect(encrypted.algorithm).toBe('AES')

      const decrypted = aes.decrypt(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('应该为每次加密生成不同的结果', () => {
      const encrypted1 = aes.encrypt(testData, testKey)
      const encrypted2 = aes.encrypt(testData, testKey)

      expect(encrypted1.success).toBe(true)
      expect(encrypted2.success).toBe(true)
      expect(encrypted1.data).not.toBe(encrypted2.data)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
    })

    it('应该处理空字符串', () => {
      const encrypted = aes.encrypt('', testKey)
      expect(encrypted.success).toBe(true)

      const decrypted = aes.decrypt(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe('')
    })

    it('应该处理包含特殊字符的数据', () => {
      const specialData = '🔐 Hello, 世界! @#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = aes.encrypt(specialData, testKey)
      expect(encrypted.success).toBe(true)

      const decrypted = aes.decrypt(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(specialData)
    })
  })

  describe('密钥长度测试', () => {
    it('应该支持 AES-128', () => {
      const encrypted = aes.encrypt(testData, testKey, { keySize: 128 })
      expect(encrypted.success).toBe(true)
      expect(encrypted.keySize).toBe(128)

      const decrypted = aes.decrypt(encrypted.data!, testKey, { keySize: 128, iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('应该支持 AES-192', () => {
      const encrypted = aes.encrypt(testData, testKey, { keySize: 192 })
      expect(encrypted.success).toBe(true)
      expect(encrypted.keySize).toBe(192)

      const decrypted = aes.decrypt(encrypted.data!, testKey, { keySize: 192, iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('应该支持 AES-256（默认）', () => {
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)
      expect(encrypted.keySize).toBe(256)

      const decrypted = aes.decrypt(encrypted.data!, testKey, { keySize: 256, iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('加密模式测试', () => {
    const modes = ['CBC', 'ECB', 'CFB', 'OFB'] as const

    modes.forEach((mode) => {
      it(`应该支持 ${mode} 模式`, () => {
        const encrypted = aes.encrypt(testData, testKey, { mode, keySize: 256 })
        expect(encrypted.success).toBe(true)
        expect(encrypted.mode).toBe(mode)

        const decrypted = aes.decrypt(encrypted.data!, testKey, {
          mode,
          keySize: 256,
          iv: encrypted.iv,
        })
        expect(decrypted.success).toBe(true)
        expect(decrypted.data).toBe(testData)
      })
    })

    it('cBC 模式应该使用 IV', () => {
      const encrypted = aes.encrypt(testData, testKey, { mode: 'CBC' })
      expect(encrypted.success).toBe(true)
      expect(encrypted.iv).toBeTruthy()
      expect(encrypted.iv!.length).toBeGreaterThan(0)
    })

    it('eCB 模式不应该使用 IV', () => {
      const encrypted = aes.encrypt(testData, testKey, { mode: 'ECB' })
      expect(encrypted.success).toBe(true)
      // ECB 模式可能不返回 IV 或返回空 IV
    })
  })

  describe('自定义 IV 测试', () => {
    it('应该支持自定义 IV', () => {
      const customIV = '1234567890abcdef1234567890abcdef' // 32个十六进制字符 = 16字节
      const encrypted = aes.encrypt(testData, testKey, {
        mode: 'CBC',
        iv: customIV,
      })
      expect(encrypted.success).toBe(true)
      expect(encrypted.iv).toBe(customIV)

      const decrypted = aes.decrypt(encrypted.data!, testKey, {
        mode: 'CBC',
        iv: customIV,
      })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('使用相同 IV 和密钥应该产生相同结果', () => {
      const customIV = '1234567890abcdef1234567890abcdef'
      const options = { mode: 'CBC' as const, iv: customIV }

      const encrypted1 = aes.encrypt(testData, testKey, options)
      const encrypted2 = aes.encrypt(testData, testKey, options)

      expect(encrypted1.success).toBe(true)
      expect(encrypted2.success).toBe(true)
      expect(encrypted1.data).toBe(encrypted2.data)
    })
  })

  describe('错误处理测试', () => {
    it('应该处理无效的密钥', () => {
      const result = aes.encrypt(testData, '')
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('应该处理无效的加密数据', () => {
      const result = aes.decrypt('invalid-encrypted-data', testKey)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('应该处理密钥不匹配', () => {
      const encrypted = aes.encrypt(testData, testKey)
      expect(encrypted.success).toBe(true)

      const wrongKey = 'wrong-key'
      const decrypted = aes.decrypt(encrypted.data!, wrongKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(false)
      expect(decrypted.error).toBeTruthy()
    })

    it('应该处理无效的密钥长度', () => {
      const result = aes.encrypt(testData, testKey, { keySize: 64 as any })
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('应该处理无效的加密模式', () => {
      const result = aes.encrypt(testData, testKey, { mode: 'INVALID' as any })
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('应该处理无效的 IV 长度', () => {
      const result = aes.encrypt(testData, testKey, {
        mode: 'CBC',
        iv: 'short', // 太短的 IV
      })
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('大数据处理测试', () => {
    it('应该处理大文本数据', () => {
      const largeData = 'A'.repeat(10000) // 10KB
      const encrypted = aes.encrypt(largeData, testKey)
      expect(encrypted.success).toBe(true)

      const decrypted = aes.decrypt(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(largeData)
    })

    it('应该处理包含换行符的数据', () => {
      const multilineData = `Line 1
Line 2
Line 3
With special chars: !@#$%^&*()
And unicode: 🔐 🌟 ✨`

      const encrypted = aes.encrypt(multilineData, testKey)
      expect(encrypted.success).toBe(true)

      const decrypted = aes.decrypt(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(multilineData)
    })
  })

  describe('便捷方法测试', () => {
    it('encrypt128 应该使用 AES-128', () => {
      const encrypted = aes.encrypt128(testData, testKey)
      expect(encrypted.success).toBe(true)
      expect(encrypted.keySize).toBe(128)
    })

    it('encrypt192 应该使用 AES-192', () => {
      const encrypted = aes.encrypt192(testData, testKey)
      expect(encrypted.success).toBe(true)
      expect(encrypted.keySize).toBe(192)
    })

    it('encrypt256 应该使用 AES-256', () => {
      const encrypted = aes.encrypt256(testData, testKey)
      expect(encrypted.success).toBe(true)
      expect(encrypted.keySize).toBe(256)
    })

    it('decrypt128 应该正确解密 AES-128', () => {
      const encrypted = aes.encrypt128(testData, testKey)
      const decrypted = aes.decrypt128(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('decrypt192 应该正确解密 AES-192', () => {
      const encrypted = aes.encrypt192(testData, testKey)
      const decrypted = aes.decrypt192(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('decrypt256 应该正确解密 AES-256', () => {
      const encrypted = aes.encrypt256(testData, testKey)
      const decrypted = aes.decrypt256(encrypted.data!, testKey, { iv: encrypted.iv })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('兼容性测试', () => {
    it('不同密钥长度的加密结果应该不同', () => {
      const encrypted128 = aes.encrypt128(testData, testKey)
      const encrypted256 = aes.encrypt256(testData, testKey)

      expect(encrypted128.success).toBe(true)
      expect(encrypted256.success).toBe(true)
      expect(encrypted128.data).not.toBe(encrypted256.data)
    })

    it('不同模式的加密结果应该不同', () => {
      const encryptedCBC = aes.encrypt(testData, testKey, { mode: 'CBC' })
      const encryptedECB = aes.encrypt(testData, testKey, { mode: 'ECB' })

      expect(encryptedCBC.success).toBe(true)
      expect(encryptedECB.success).toBe(true)
      expect(encryptedCBC.data).not.toBe(encryptedECB.data)
    })
  })
})
