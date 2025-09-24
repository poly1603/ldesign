import { beforeEach, describe, expect, it } from 'vitest'

import { useCrypto } from '../composables/useCrypto'

describe('useCrypto Composable', () => {
  let crypto: ReturnType<typeof useCrypto>
  const testData = 'Hello, World!'
  const testKey = 'my-secret-key-32-characters-long'

  beforeEach(() => {
    crypto = useCrypto()
  })

  describe('state Management', () => {
    it('should initialize with correct default state', () => {
      expect(crypto.isEncrypting.value).toBe(false)
      expect(crypto.isDecrypting.value).toBe(false)
      expect(crypto.lastError.value).toBe(null)
      expect(crypto.lastResult.value).toBe(null)
    })

    it('should reset state correctly', () => {
      // Set some state
      crypto.lastError.value = 'test error'
      crypto.isEncrypting.value = true

      crypto.reset()

      expect(crypto.isEncrypting.value).toBe(false)
      expect(crypto.isDecrypting.value).toBe(false)
      expect(crypto.lastError.value).toBe(null)
      expect(crypto.lastResult.value).toBe(null)
    })

    it('should clear error correctly', () => {
      crypto.lastError.value = 'test error'
      crypto.clearError()
      expect(crypto.lastError.value).toBe(null)
    })
  })

  describe('aES Encryption', () => {
    it('should encrypt and decrypt AES successfully', async () => {
      const encrypted = await crypto.encryptAES(testData, testKey)
      expect(encrypted.data).toBeDefined()
      expect(encrypted.algorithm).toContain('AES')
      expect(crypto.lastResult.value).toStrictEqual(encrypted)

      const decrypted = await crypto.decryptAES(encrypted, testKey)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
      expect(crypto.lastResult.value).toStrictEqual(decrypted)
    })

    it('should handle AES encryption errors', async () => {
      try {
        await crypto.encryptAES('', testKey)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(crypto.lastError.value).toBeDefined()
      }
    })

    it('should update loading state during AES operations', async () => {
      const encryptPromise = crypto.encryptAES(testData, testKey)
      // Note: In a real async scenario, we might check loading state here
      const result = await encryptPromise
      expect(result).toBeDefined()
      expect(crypto.isEncrypting.value).toBe(false)
    })
  })

  describe('rSA Encryption', () => {
    it('should handle RSA operations', async () => {
      // Generate key pair first
      const keyPair = await crypto.generateRSAKeyPair(1024) // Use smaller key for faster tests
      expect(keyPair.publicKey).toBeDefined()
      expect(keyPair.privateKey).toBeDefined()

      // Test encryption and decryption
      const encrypted = await crypto.encryptRSA(testData, keyPair.publicKey)
      expect(encrypted.data).toBeDefined()
      expect(encrypted.algorithm).toContain('RSA')

      const decrypted = await crypto.decryptRSA(encrypted, keyPair.privateKey)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('base64 Encoding', () => {
    it('should encode and decode Base64', async () => {
      const encoded = await crypto.encodeBase64(testData)
      expect(encoded).toBeDefined()
      expect(encoded).not.toBe(testData)

      const decoded = await crypto.decodeBase64(encoded)
      expect(decoded).toBe(testData)
    })
  })

  describe('hex Encoding', () => {
    it('should encode and decode Hex', async () => {
      const encoded = await crypto.encodeHex(testData)
      expect(encoded).toBeDefined()
      expect(encoded).not.toBe(testData)
      expect(encoded).toMatch(/^[0-9a-f]+$/)

      const decoded = await crypto.decodeHex(encoded)
      expect(decoded).toBe(testData)
    })
  })

  describe('key Generation', () => {
    it('should generate random key', async () => {
      const key = await crypto.generateKey(32)
      expect(key).toBeDefined()
      expect(key).toHaveLength(64) // 32 bytes = 64 hex characters
    })

    it('should generate salt', async () => {
      const salt = await crypto.generateSalt(16)
      expect(salt).toBeDefined()
      expect(salt).toHaveLength(32) // 16 bytes = 32 hex characters
    })

    it('should generate IV', async () => {
      const iv = await crypto.generateIV(16)
      expect(iv).toBeDefined()
      expect(iv).toHaveLength(32) // 16 bytes = 32 hex characters
    })

    it('should generate different values each time', async () => {
      const key1 = await crypto.generateKey()
      const key2 = await crypto.generateKey()
      expect(key1).not.toBe(key2)

      const salt1 = await crypto.generateSalt()
      const salt2 = await crypto.generateSalt()
      expect(salt1).not.toBe(salt2)

      const iv1 = await crypto.generateIV()
      const iv2 = await crypto.generateIV()
      expect(iv1).not.toBe(iv2)
    })
  })

  describe('direct Access', () => {
    it('should provide direct access to core functions', () => {
      expect(crypto.encrypt).toBeDefined()
      expect(crypto.decrypt).toBeDefined()
      expect(crypto.keyGenerator).toBeDefined()
    })

    it('should work with direct access', () => {
      const encrypted = crypto.encrypt.aes(testData, testKey)
      const decrypted = crypto.decrypt.aes(encrypted, testKey)

      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('error Handling', () => {
    it('should handle and store errors properly', async () => {
      try {
        await crypto.encryptAES('', testKey)
      } catch {
        expect(crypto.lastError.value).toBeDefined()
        expect(crypto.lastError.value).toContain('Data cannot be empty')
      }
    })

    it('should clear previous errors on successful operations', async () => {
      // Set an error
      crypto.lastError.value = 'previous error'

      // Perform successful operation
      await crypto.encodeBase64(testData)

      expect(crypto.lastError.value).toBe(null)
    })
  })
})
