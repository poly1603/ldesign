import type { AESOptions } from '../../types'
import { beforeEach, describe, expect, it } from 'vitest'
import { aes, AESEncryptor } from '../aes'

describe('aES Encryption', () => {
  let encryptor: AESEncryptor
  const testData = 'Hello, World!'
  const testKey = 'my-secret-key-32-characters-long'

  beforeEach(() => {
    encryptor = new AESEncryptor()
  })

  describe('aESEncryptor Class', () => {
    it('should encrypt and decrypt data successfully', () => {
      const encrypted = encryptor.encrypt(testData, testKey)
      expect(encrypted.data).toBeDefined()
      expect(encrypted.algorithm).toContain('AES')
      expect(encrypted.iv).toBeDefined()

      const decrypted = encryptor.decrypt(encrypted, testKey)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('should encrypt with different key sizes', () => {
      const options128: AESOptions = { keySize: 128 }
      const options192: AESOptions = { keySize: 192 }
      const options256: AESOptions = { keySize: 256 }

      const encrypted128 = encryptor.encrypt(testData, testKey, options128)
      const encrypted192 = encryptor.encrypt(testData, testKey, options192)
      const encrypted256 = encryptor.encrypt(testData, testKey, options256)

      expect(encrypted128.algorithm).toBe('AES')
      expect(encrypted128.keySize).toBe(128)
      expect(encrypted128.mode).toBe('CBC')

      expect(encrypted192.algorithm).toBe('AES')
      expect(encrypted192.keySize).toBe(192)
      expect(encrypted192.mode).toBe('CBC')

      expect(encrypted256.algorithm).toBe('AES')
      expect(encrypted256.keySize).toBe(256)
      expect(encrypted256.mode).toBe('CBC')

      // Verify decryption works
      expect(encryptor.decrypt(encrypted128, testKey, options128).data).toBe(
        testData,
      )
      expect(encryptor.decrypt(encrypted192, testKey, options192).data).toBe(
        testData,
      )
      expect(encryptor.decrypt(encrypted256, testKey, options256).data).toBe(
        testData,
      )
    })

    it('should encrypt with different modes', () => {
      const modes = ['CBC', 'ECB', 'CFB', 'OFB', 'CTR'] as const

      modes.forEach((mode) => {
        const options: AESOptions = { mode }
        const encrypted = encryptor.encrypt(testData, testKey, options)
        expect(encrypted.algorithm).toBe('AES')
        expect(encrypted.mode).toBe(mode)
        expect(encrypted.keySize).toBe(256) // default key size

        const decrypted = encryptor.decrypt(encrypted, testKey, options)
        expect(decrypted.success).toBe(true)
        expect(decrypted.data).toBe(testData)
      })
    })

    it('should handle custom IV', () => {
      const customIV = '1234567890abcdef1234567890abcdef'
      const options: AESOptions = { iv: customIV }

      const encrypted = encryptor.encrypt(testData, testKey, options)
      expect(encrypted.iv).toBe(customIV)

      const decrypted = encryptor.decrypt(encrypted, testKey, options)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('should fail with wrong key', () => {
      const encrypted = encryptor.encrypt(testData, testKey)
      const wrongKey = 'wrong-key-32-characters-long-key'

      const decrypted = encryptor.decrypt(encrypted, wrongKey)
      expect(decrypted.success).toBe(false)
      expect(decrypted.error).toBeDefined()
    })

    it('should handle empty data', () => {
      const encrypted = encryptor.encrypt('', testKey)
      expect(encrypted.success).toBe(true)

      const decrypted = encryptor.decrypt(encrypted, testKey)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe('')
    })

    it('should throw error for empty key', () => {
      expect(() => encryptor.encrypt(testData, '')).toThrow(
        'Key cannot be empty',
      )
    })
  })

  describe('aES Convenience Functions', () => {
    it('should work with aes.encrypt and aes.decrypt', () => {
      const encrypted = aes.encrypt(testData, testKey)
      const decrypted = aes.decrypt(encrypted, testKey)

      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('should work with specific key size functions', () => {
      const encrypted128 = aes.encrypt128(testData, testKey)
      const encrypted192 = aes.encrypt192(testData, testKey)
      const encrypted256 = aes.encrypt256(testData, testKey)

      expect(encrypted128.algorithm).toBe('AES')
      expect(encrypted128.keySize).toBe(128)
      expect(encrypted192.algorithm).toBe('AES')
      expect(encrypted192.keySize).toBe(192)
      expect(encrypted256.algorithm).toBe('AES')
      expect(encrypted256.keySize).toBe(256)

      expect(aes.decrypt128(encrypted128, testKey).data).toBe(testData)
      expect(aes.decrypt192(encrypted192, testKey).data).toBe(testData)
      expect(aes.decrypt256(encrypted256, testKey).data).toBe(testData)
    })

    it('should handle string input for decryption', () => {
      const encrypted = aes.encrypt(testData, testKey)
      const decrypted = aes.decrypt(encrypted.data || '', testKey, {
        iv: encrypted.iv,
      })

      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('edge Cases', () => {
    it('should handle long text', () => {
      const longText = 'A'.repeat(10000)
      const encrypted = aes.encrypt(longText, testKey)
      const decrypted = aes.decrypt(encrypted, testKey)

      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(longText)
    })

    it('should handle special characters', () => {
      const specialText = '🔐 Hello, 世界! @#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = aes.encrypt(specialText, testKey)
      const decrypted = aes.decrypt(encrypted, testKey)

      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(specialText)
    })

    it('should generate different ciphertexts for same plaintext', () => {
      const encrypted1 = aes.encrypt(testData, testKey)
      const encrypted2 = aes.encrypt(testData, testKey)

      // Should be different due to random IV
      expect(encrypted1.data).not.toBe(encrypted2.data)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)

      // But both should decrypt to same plaintext
      expect(aes.decrypt(encrypted1, testKey).data).toBe(testData)
      expect(aes.decrypt(encrypted2, testKey).data).toBe(testData)
    })
  })
})
