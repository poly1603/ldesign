import type { HashAlgorithm } from '../../types'
import { beforeEach, describe, expect, it } from 'vitest'
import { hash, Hasher, hmac, HMACHasher } from '../hash'

describe('hash Algorithms', () => {
  let hasher: Hasher
  let hmacHasher: HMACHasher
  const testData = 'Hello, World!'
  const testKey = 'secret-key'

  beforeEach(() => {
    hasher = new Hasher()
    hmacHasher = new HMACHasher()
  })

  describe('hasher Class', () => {
    it('should generate MD5 hash', () => {
      const result = hasher.hash(testData, 'MD5')
      expect(result.hash).toBeDefined()
      expect(result.algorithm).toBe('MD5')
      expect(result.encoding).toBe('hex')
      expect(result.hash).toHaveLength(32) // MD5 is 32 hex characters
    })

    it('should generate SHA256 hash', () => {
      const result = hasher.hash(testData, 'SHA256')
      expect(result.hash).toBeDefined()
      expect(result.algorithm).toBe('SHA256')
      expect(result.encoding).toBe('hex')
      expect(result.hash).toHaveLength(64) // SHA256 is 64 hex characters
    })

    it('should generate SHA512 hash', () => {
      const result = hasher.hash(testData, 'SHA512')
      expect(result.hash).toBeDefined()
      expect(result.algorithm).toBe('SHA512')
      expect(result.encoding).toBe('hex')
      expect(result.hash).toHaveLength(128) // SHA512 is 128 hex characters
    })

    it('should support different encodings', () => {
      const hexResult = hasher.hash(testData, 'SHA256', { encoding: 'hex' })
      const base64Result = hasher.hash(testData, 'SHA256', {
        encoding: 'base64',
      })

      expect(hexResult.encoding).toBe('hex')
      expect(base64Result.encoding).toBe('base64')
      expect(hexResult.hash).not.toBe(base64Result.hash)
      expect(hexResult.hash).toMatch(/^[0-9a-f]+$/)
      expect(base64Result.hash).toMatch(/^[A-Z0-9+/]+=*$/i)
    })

    it('should verify hash correctly', () => {
      const result = hasher.hash(testData, 'SHA256')
      expect(hasher.verify(testData, result.hash, 'SHA256')).toBe(true)
      expect(hasher.verify('wrong data', result.hash, 'SHA256')).toBe(false)
    })

    it('should handle all supported algorithms', () => {
      const algorithms: HashAlgorithm[] = [
        'MD5',
        'SHA1',
        'SHA224',
        'SHA256',
        'SHA384',
        'SHA512',
      ]

      algorithms.forEach((algorithm) => {
        const result = hasher.hash(testData, algorithm)
        expect(result.hash).toBeDefined()
        expect(result.algorithm).toBe(algorithm)
        expect(result.hash.length).toBeGreaterThan(0)
      })
    })

    it('should handle empty data', () => {
      const result = hasher.hash('', 'SHA256')
      expect(result.success).toBe(true)
      expect(result.hash).toBeDefined()
      expect(result.algorithm).toBe('SHA256')
    })
  })

  describe('hMACHasher Class', () => {
    it('should generate HMAC-SHA256', () => {
      const result = hmacHasher.hmac(testData, testKey, 'SHA256')
      expect(result.hash).toBeDefined()
      expect(result.algorithm).toBe('HMAC-SHA256')
      expect(result.encoding).toBe('hex')
      expect(result.hash).toHaveLength(64) // HMAC-SHA256 is 64 hex characters
    })

    it('should generate different HMACs with different keys', () => {
      const hmac1 = hmacHasher.hmac(testData, 'key1', 'SHA256')
      const hmac2 = hmacHasher.hmac(testData, 'key2', 'SHA256')

      expect(hmac1.hash).not.toBe(hmac2.hash)
    })

    it('should verify HMAC correctly', () => {
      const result = hmacHasher.hmac(testData, testKey, 'SHA256')
      expect(hmacHasher.verify(testData, testKey, result.hash, 'SHA256')).toBe(
        true,
      )
      expect(
        hmacHasher.verify(testData, 'wrong-key', result.hash, 'SHA256'),
      ).toBe(false)
      expect(
        hmacHasher.verify('wrong data', testKey, result.hash, 'SHA256'),
      ).toBe(false)
    })

    it('should support all HMAC algorithms', () => {
      const algorithms: HashAlgorithm[] = [
        'MD5',
        'SHA1',
        'SHA256',
        'SHA384',
        'SHA512',
      ]

      algorithms.forEach((algorithm) => {
        const result = hmacHasher.hmac(testData, testKey, algorithm)
        expect(result.hash).toBeDefined()
        expect(result.algorithm).toBe(`HMAC-${algorithm}`)
        expect(result.hash.length).toBeGreaterThan(0)
      })
    })

    it('should handle empty data and key', () => {
      const emptyDataResult = hmacHasher.hmac('', testKey, 'SHA256')
      expect(emptyDataResult.success).toBe(true)
      expect(emptyDataResult.hash).toBeDefined()

      const emptyKeyResult = hmacHasher.hmac(testData, '', 'SHA256')
      expect(emptyKeyResult.success).toBe(true)
      expect(emptyKeyResult.hash).toBeDefined()
    })
  })

  describe('hash Convenience Functions', () => {
    it('should work with hash convenience functions', () => {
      expect(hash.md5(testData)).toBeDefined()
      expect(hash.sha1(testData)).toBeDefined()
      expect(hash.sha224(testData)).toBeDefined()
      expect(hash.sha256(testData)).toBeDefined()
      expect(hash.sha384(testData)).toBeDefined()
      expect(hash.sha512(testData)).toBeDefined()
    })

    it('should work with hmac convenience functions', () => {
      expect(hmac.md5(testData, testKey)).toBeDefined()
      expect(hmac.sha1(testData, testKey)).toBeDefined()
      expect(hmac.sha256(testData, testKey)).toBeDefined()
      expect(hmac.sha384(testData, testKey)).toBeDefined()
      expect(hmac.sha512(testData, testKey)).toBeDefined()
    })

    it('should verify hashes with convenience functions', () => {
      const sha256Hash = hash.sha256(testData)
      expect(hash.verify(testData, sha256Hash, 'SHA256')).toBe(true)
      expect(hash.verify('wrong', sha256Hash, 'SHA256')).toBe(false)
    })

    it('should verify HMACs with convenience functions', () => {
      const hmacSha256 = hmac.sha256(testData, testKey)
      expect(hmac.verify(testData, testKey, hmacSha256, 'SHA256')).toBe(true)
      expect(hmac.verify(testData, 'wrong-key', hmacSha256, 'SHA256')).toBe(
        false,
      )
    })
  })

  describe('consistency Tests', () => {
    it('should produce consistent hashes', () => {
      const hash1 = hash.sha256(testData)
      const hash2 = hash.sha256(testData)
      expect(hash1).toBe(hash2)
    })

    it('should produce consistent HMACs', () => {
      const hmac1 = hmac.sha256(testData, testKey)
      const hmac2 = hmac.sha256(testData, testKey)
      expect(hmac1).toBe(hmac2)
    })

    it('should produce different hashes for different data', () => {
      const hash1 = hash.sha256('data1')
      const hash2 = hash.sha256('data2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('edge Cases', () => {
    it('should handle long text', () => {
      const longText = 'A'.repeat(10000)
      const result = hash.sha256(longText)
      expect(result).toBeDefined()
      expect(result).toHaveLength(64)
    })

    it('should handle special characters', () => {
      const specialText = '🔐 Hello, 世界! @#$%^&*()_+-=[]{}|;:,.<>?'
      const result = hash.sha256(specialText)
      expect(result).toBeDefined()
      expect(result).toHaveLength(64)
    })

    it('should handle empty string', () => {
      // Empty string should be supported
      const result = hash.sha256('')
      expect(result).toBeDefined()
      expect(result).toHaveLength(64) // SHA256 always produces 64 hex characters
    })
  })
})
