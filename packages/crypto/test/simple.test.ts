import { describe, it, expect } from 'vitest'
import { aes, rsa, hash, encoding, RandomUtils } from '../src'
import { chacha20, aesGcm } from '../src/algorithms/advanced'
import { performanceMonitor } from '../src/utils/performance-monitor'

describe('Crypto Library Tests', () => {
  describe('AES Encryption', () => {
    it('should encrypt and decrypt data with AES', () => {
      const data = 'Hello, World!'
      const key = 'my-secret-key-32-characters-long'
      
      const encrypted = aes.encrypt(data, key)
      expect(encrypted.success).toBe(true)
      expect(encrypted.data).toBeTruthy()
      
      const decrypted = aes.decrypt(encrypted, key)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(data)
    })

    it('should handle empty data', () => {
      const data = ''
      const key = 'my-secret-key-32-characters-long'
      
      const encrypted = aes.encrypt(data, key)
      expect(encrypted.success).toBe(true)
      
      const decrypted = aes.decrypt(encrypted, key)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(data)
    })

    it('should fail with incorrect key', () => {
      const data = 'Hello, World!'
      const key = 'my-secret-key-32-characters-long'
      const wrongKey = 'wrong-key-32-characters-long----'
      
      const encrypted = aes.encrypt(data, key)
      expect(encrypted.success).toBe(true)
      
      const decrypted = aes.decrypt(encrypted, wrongKey)
      expect(decrypted.success).toBe(false)
    })
  })

  describe('Hash Functions', () => {
    it('should generate MD5 hash', () => {
      const data = 'Hello, World!'
      const result = hash.md5(data)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(32) // MD5 hash length
    })

    it('should generate SHA256 hash', () => {
      const data = 'Hello, World!'
      const result = hash.sha256(data)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(64) // SHA256 hash length
    })

    it('should generate consistent hashes', () => {
      const data = 'Hello, World!'
      const hash1 = hash.sha256(data)
      const hash2 = hash.sha256(data)

      expect(hash1).toBe(hash2)
    })
  })

  describe('Encoding Functions', () => {
    it('should encode and decode Base64', () => {
      const data = 'Hello, World!'
      const encoded = encoding.base64.encode(data)
      expect(encoded).toBeTruthy()
      
      const decoded = encoding.base64.decode(encoded)
      expect(decoded).toBe(data)
    })

    it('should encode and decode Hex', () => {
      const data = 'Hello, World!'
      const encoded = encoding.hex.encode(data)
      expect(encoded).toBeTruthy()
      
      const decoded = encoding.hex.decode(encoded)
      expect(decoded).toBe(data)
    })
  })

  describe('Advanced Encryption', () => {
    it('should encrypt and decrypt with ChaCha20', () => {
      const data = 'Hello, World!'
      const key = RandomUtils.generateKey(32) // 32 bytes = 64 hex chars
      
      const encrypted = chacha20.encrypt(data, key)
      expect(encrypted.success).toBe(true)
      expect(encrypted.data).toBeTruthy()
      
      const decrypted = chacha20.decrypt(encrypted, key)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(data)
    })

    it('should support authenticated encryption with ChaCha20', () => {
      const data = 'Sensitive Information'
      const key = RandomUtils.generateKey(32)
      const aad = 'Additional Authenticated Data'
      
      const encrypted = chacha20.encrypt(data, key, { aad })
      expect(encrypted.success).toBe(true)
      expect(encrypted.aad).toBe(aad)
      
      const decrypted = chacha20.decrypt(encrypted, key)
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(data)
    })
  })

  describe('Random Utils', () => {
    it('should generate random keys', () => {
      const key1 = RandomUtils.generateKey(32)
      const key2 = RandomUtils.generateKey(32)
      
      expect(key1).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(key2).toHaveLength(64)
      expect(key1).not.toBe(key2)
    })

    it('should generate random IVs', () => {
      const iv1 = RandomUtils.generateIV(16)
      const iv2 = RandomUtils.generateIV(16)
      
      expect(iv1).toHaveLength(32) // 16 bytes = 32 hex chars
      expect(iv2).toHaveLength(32)
      expect(iv1).not.toBe(iv2)
    })

    it('should generate random salt', () => {
      const salt1 = RandomUtils.generateSalt()
      const salt2 = RandomUtils.generateSalt()
      
      expect(salt1).toBeTruthy()
      expect(salt2).toBeTruthy()
      expect(salt1).not.toBe(salt2)
    })
  })

  describe('Performance Monitoring', () => {
    it('should track encryption performance', async () => {
      const data = 'Test data for performance monitoring'
      const key = 'my-secret-key-32-characters-long'
      
      // Reset monitor
      performanceMonitor.reset()
      
      // Perform operations
      const operationId = 'test_encrypt'
      performanceMonitor.startOperation(operationId, 'AES')
      
      const encrypted = aes.encrypt(data, key)
      
      performanceMonitor.endOperation(
        operationId,
        'encrypt',
        encrypted.success,
        data.length,
        encrypted.error,
        'AES'
      )
      
      // Generate report
      const report = performanceMonitor.generateReport()
      
      expect(report.totalOperations).toBe(1)
      expect(report.successfulOperations).toBe(1)
      expect(report.averageDuration).toBeGreaterThan(0)
    })

    it('should generate performance statistics', () => {
      performanceMonitor.reset()
      
      // Simulate multiple operations
      for (let i = 0; i < 10; i++) {
        const opId = `op_${i}`
        performanceMonitor.startOperation(opId, 'AES')
        
        // Simulate some work
        const startTime = Date.now()
        while (Date.now() - startTime < 1) {
          // busy wait
        }
        
        performanceMonitor.endOperation(
          opId,
          'test',
          i % 2 === 0, // alternate success/failure
          100,
          i % 2 === 1 ? 'Test error' : undefined,
          'AES'
        )
      }
      
      const report = performanceMonitor.generateReport()
      
      expect(report.totalOperations).toBe(10)
      expect(report.successfulOperations).toBe(5)
      expect(report.failedOperations).toBe(5)
      expect(report.byAlgorithm.has('AES')).toBe(true)
      
      const aesStats = report.byAlgorithm.get('AES')
      expect(aesStats?.count).toBe(10)
      expect(aesStats?.successRate).toBe(0.5)
    })
  })
})
