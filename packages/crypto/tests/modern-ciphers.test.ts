/**
 * Tests for Modern Cipher Implementations
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  BLAKE2b,
  ChaCha20,
  ChaCha20Poly1305,
  ModernCipherUtils,
  Poly1305,
  XSalsa20,
} from '../src/core/modern-ciphers'

describe('chaCha20', () => {
  it('should encrypt and decrypt correctly', () => {
    const key = new Uint8Array(32).fill(1)
    const nonce = new Uint8Array(12).fill(2)
    const plaintext = new TextEncoder().encode('Hello, ChaCha20!')

    const cipher = new ChaCha20(key, nonce)
    const ciphertext = cipher.encrypt(plaintext)

    // Create new cipher instance for decryption
    const decipher = new ChaCha20(key, nonce)
    const decrypted = decipher.decrypt(ciphertext)

    expect(decrypted).toEqual(plaintext)
    expect(new TextDecoder().decode(decrypted)).toBe('Hello, ChaCha20!')
  })

  it('should produce different ciphertexts with different nonces', () => {
    const key = new Uint8Array(32).fill(1)
    const nonce1 = new Uint8Array(12).fill(2)
    const nonce2 = new Uint8Array(12).fill(3)
    const plaintext = new TextEncoder().encode('Test message')

    const cipher1 = new ChaCha20(key, nonce1)
    const ciphertext1 = cipher1.encrypt(plaintext)

    const cipher2 = new ChaCha20(key, nonce2)
    const ciphertext2 = cipher2.encrypt(plaintext)

    expect(ciphertext1).not.toEqual(ciphertext2)
  })

  it('should handle empty plaintext', () => {
    const key = new Uint8Array(32).fill(1)
    const nonce = new Uint8Array(12).fill(2)
    const plaintext = new Uint8Array(0)

    const cipher = new ChaCha20(key, nonce)
    const ciphertext = cipher.encrypt(plaintext)

    expect(ciphertext.length).toBe(0)
  })

  it('should handle large data', () => {
    const key = new Uint8Array(32).fill(1)
    const nonce = new Uint8Array(12).fill(2)
    const plaintext = new Uint8Array(1000).fill(42)

    const cipher = new ChaCha20(key, nonce)
    const ciphertext = cipher.encrypt(plaintext)

    const decipher = new ChaCha20(key, nonce)
    const decrypted = decipher.decrypt(ciphertext)

    expect(decrypted).toEqual(plaintext)
  })

  it('should throw on invalid key length', () => {
    const invalidKey = new Uint8Array(16) // Wrong size
    const nonce = new Uint8Array(12)

    expect(() => new ChaCha20(invalidKey, nonce)).toThrow('256-bit key')
  })

  it('should throw on invalid nonce length', () => {
    const key = new Uint8Array(32)
    const invalidNonce = new Uint8Array(8) // Wrong size

    expect(() => new ChaCha20(key, invalidNonce)).toThrow('96-bit nonce')
  })
})

describe('poly1305', () => {
  it('should generate consistent MAC for same input', () => {
    const key = new Uint8Array(32).fill(1)
    const data = new TextEncoder().encode('Test message for Poly1305')

    const tag1 = Poly1305.auth(data, key)
    const tag2 = Poly1305.auth(data, key)

    expect(tag1).toEqual(tag2)
    expect(tag1.length).toBe(16)
  })

  it('should generate different MACs for different data', () => {
    const key = new Uint8Array(32).fill(1)
    const data1 = new TextEncoder().encode('Message 1')
    const data2 = new TextEncoder().encode('Message 2')

    const tag1 = Poly1305.auth(data1, key)
    const tag2 = Poly1305.auth(data2, key)

    expect(tag1).not.toEqual(tag2)
  })

  it('should generate different MACs for different keys', () => {
    const key1 = new Uint8Array(32).fill(1)
    const key2 = new Uint8Array(32).fill(2)
    const data = new TextEncoder().encode('Same message')

    const tag1 = Poly1305.auth(data, key1)
    const tag2 = Poly1305.auth(data, key2)

    expect(tag1).not.toEqual(tag2)
  })

  it('should verify matching tags', () => {
    const key = new Uint8Array(32).fill(1)
    const data = new TextEncoder().encode('Verify this')

    const tag = Poly1305.auth(data, key)
    const isValid = Poly1305.verify(tag, tag)

    expect(isValid).toBe(true)
  })

  it('should reject modified tags', () => {
    const key = new Uint8Array(32).fill(1)
    const data = new TextEncoder().encode('Verify this')

    const tag = Poly1305.auth(data, key)
    const modifiedTag = new Uint8Array(tag)
    modifiedTag[0] ^= 0xFF

    const isValid = Poly1305.verify(tag, modifiedTag)

    expect(isValid).toBe(false)
  })

  it('should handle incremental updates', () => {
    const key = new Uint8Array(32).fill(1)
    const part1 = new TextEncoder().encode('First part ')
    const part2 = new TextEncoder().encode('Second part')
    const combined = new Uint8Array(part1.length + part2.length)
    combined.set(part1)
    combined.set(part2, part1.length)

    // Single update
    const tag1 = Poly1305.auth(combined, key)

    // Multiple updates
    const poly = new Poly1305(key)
    poly.update(part1)
    poly.update(part2)
    const tag2 = poly.finish()

    expect(tag1).toEqual(tag2)
  })

  it('should throw on invalid key length', () => {
    const invalidKey = new Uint8Array(16)

    expect(() => new Poly1305(invalidKey)).toThrow('256-bit key')
  })
})

describe('chaCha20-Poly1305', () => {
  let cipher: ChaCha20Poly1305
  let key: Uint8Array
  let nonce: Uint8Array

  beforeEach(() => {
    cipher = new ChaCha20Poly1305()
    key = new Uint8Array(32).fill(1)
    nonce = new Uint8Array(12).fill(2)
  })

  it('should encrypt and decrypt with authentication', () => {
    const plaintext = new TextEncoder().encode('Authenticated encryption test')

    const result = cipher.encrypt(plaintext, key, nonce)
    expect(result.ciphertext).toBeDefined()
    expect(result.tag).toBeDefined()
    expect(result.tag.length).toBe(16)

    const decrypted = cipher.decrypt(result.ciphertext, result.tag, key, nonce)
    expect(decrypted).toEqual(plaintext)
    expect(new TextDecoder().decode(decrypted!)).toBe('Authenticated encryption test')
  })

  it('should encrypt and decrypt with additional authenticated data', () => {
    const plaintext = new TextEncoder().encode('Secret message')
    const aad = new TextEncoder().encode('Additional data')

    const result = cipher.encrypt(plaintext, key, nonce, aad)
    const decrypted = cipher.decrypt(result.ciphertext, result.tag, key, nonce, aad)

    expect(decrypted).toEqual(plaintext)
  })

  it('should fail decryption with wrong AAD', () => {
    const plaintext = new TextEncoder().encode('Secret message')
    const aad = new TextEncoder().encode('Correct AAD')
    const wrongAad = new TextEncoder().encode('Wrong AAD')

    const result = cipher.encrypt(plaintext, key, nonce, aad)
    const decrypted = cipher.decrypt(result.ciphertext, result.tag, key, nonce, wrongAad)

    expect(decrypted).toBeNull()
  })

  it('should fail decryption with modified ciphertext', () => {
    const plaintext = new TextEncoder().encode('Original message')

    const result = cipher.encrypt(plaintext, key, nonce)
    const modifiedCiphertext = new Uint8Array(result.ciphertext)
    modifiedCiphertext[0] ^= 0xFF

    const decrypted = cipher.decrypt(modifiedCiphertext, result.tag, key, nonce)

    expect(decrypted).toBeNull()
  })

  it('should fail decryption with modified tag', () => {
    const plaintext = new TextEncoder().encode('Original message')

    const result = cipher.encrypt(plaintext, key, nonce)
    const modifiedTag = new Uint8Array(result.tag)
    modifiedTag[0] ^= 0xFF

    const decrypted = cipher.decrypt(result.ciphertext, modifiedTag, key, nonce)

    expect(decrypted).toBeNull()
  })

  it('should handle empty plaintext', () => {
    const plaintext = new Uint8Array(0)

    const result = cipher.encrypt(plaintext, key, nonce)
    expect(result.ciphertext.length).toBe(0)
    expect(result.tag.length).toBe(16)

    const decrypted = cipher.decrypt(result.ciphertext, result.tag, key, nonce)
    expect(decrypted).toEqual(plaintext)
  })

  it('should handle empty AAD', () => {
    const plaintext = new TextEncoder().encode('Message without AAD')
    const emptyAad = new Uint8Array(0)

    const result = cipher.encrypt(plaintext, key, nonce, emptyAad)
    const decrypted = cipher.decrypt(result.ciphertext, result.tag, key, nonce, emptyAad)

    expect(decrypted).toEqual(plaintext)
  })

  it('should throw on invalid key length', () => {
    const invalidKey = new Uint8Array(16)
    const plaintext = new Uint8Array(10)

    expect(() => cipher.encrypt(plaintext, invalidKey, nonce)).toThrow('256-bit key')
  })

  it('should throw on invalid nonce length', () => {
    const invalidNonce = new Uint8Array(8)
    const plaintext = new Uint8Array(10)

    expect(() => cipher.encrypt(plaintext, key, invalidNonce)).toThrow('96-bit nonce')
  })

  it('should throw on invalid tag length during decryption', () => {
    const ciphertext = new Uint8Array(10)
    const invalidTag = new Uint8Array(8)

    expect(() => cipher.decrypt(ciphertext, invalidTag, key, nonce)).toThrow('128-bit tag')
  })
})

describe('xSalsa20', () => {
  it('should encrypt and decrypt correctly', () => {
    const key = new Uint8Array(32).fill(1)
    const nonce = new Uint8Array(24).fill(2)
    const plaintext = new TextEncoder().encode('Hello, XSalsa20!')

    const cipher = new XSalsa20(key, nonce)
    const ciphertext = cipher.encrypt(plaintext)

    const decipher = new XSalsa20(key, nonce)
    const decrypted = decipher.decrypt(ciphertext)

    expect(decrypted).toEqual(plaintext)
    expect(new TextDecoder().decode(decrypted)).toBe('Hello, XSalsa20!')
  })

  it('should produce different ciphertexts with different nonces', () => {
    const key = new Uint8Array(32).fill(1)
    const nonce1 = new Uint8Array(24).fill(2)
    const nonce2 = new Uint8Array(24).fill(3)
    const plaintext = new TextEncoder().encode('Test message')

    const cipher1 = new XSalsa20(key, nonce1)
    const ciphertext1 = cipher1.encrypt(plaintext)

    const cipher2 = new XSalsa20(key, nonce2)
    const ciphertext2 = cipher2.encrypt(plaintext)

    expect(ciphertext1).not.toEqual(ciphertext2)
  })

  it('should handle large data', () => {
    const key = new Uint8Array(32).fill(1)
    const nonce = new Uint8Array(24).fill(2)
    const plaintext = new Uint8Array(1000).fill(42)

    const cipher = new XSalsa20(key, nonce)
    const ciphertext = cipher.encrypt(plaintext)

    const decipher = new XSalsa20(key, nonce)
    const decrypted = decipher.decrypt(ciphertext)

    expect(decrypted).toEqual(plaintext)
  })

  it('should throw on invalid key length', () => {
    const invalidKey = new Uint8Array(16)
    const nonce = new Uint8Array(24)

    expect(() => new XSalsa20(invalidKey, nonce)).toThrow('256-bit key')
  })

  it('should throw on invalid nonce length', () => {
    const key = new Uint8Array(32)
    const invalidNonce = new Uint8Array(12)

    expect(() => new XSalsa20(key, invalidNonce)).toThrow('192-bit nonce')
  })
})

describe('bLAKE2b', () => {
  it('should generate consistent hash for same input', () => {
    const data = new TextEncoder().encode('Hello, BLAKE2b!')

    const hash1 = BLAKE2b.hash(data)
    const hash2 = BLAKE2b.hash(data)

    expect(hash1).toEqual(hash2)
    expect(hash1.length).toBe(64) // Default output length
  })

  it('should generate different hashes for different inputs', () => {
    const data1 = new TextEncoder().encode('Message 1')
    const data2 = new TextEncoder().encode('Message 2')

    const hash1 = BLAKE2b.hash(data1)
    const hash2 = BLAKE2b.hash(data2)

    expect(hash1).not.toEqual(hash2)
  })

  it('should support variable output lengths', () => {
    const data = new TextEncoder().encode('Test data')

    const hash32 = BLAKE2b.hash(data, 32)
    const hash48 = BLAKE2b.hash(data, 48)
    const hash64 = BLAKE2b.hash(data, 64)

    expect(hash32.length).toBe(32)
    expect(hash48.length).toBe(48)
    expect(hash64.length).toBe(64)

    // Different lengths should produce different outputs
    expect(hash32).not.toEqual(hash48.slice(0, 32))
  })

  it('should support keyed hashing', () => {
    const data = new TextEncoder().encode('Keyed hash test')
    const key1 = new Uint8Array(32).fill(1)
    const key2 = new Uint8Array(32).fill(2)

    const hash1 = BLAKE2b.hash(data, 64, key1)
    const hash2 = BLAKE2b.hash(data, 64, key2)
    const hashNoKey = BLAKE2b.hash(data, 64)

    expect(hash1).not.toEqual(hash2)
    expect(hash1).not.toEqual(hashNoKey)
  })

  it('should handle incremental updates', () => {
    const part1 = new TextEncoder().encode('First part ')
    const part2 = new TextEncoder().encode('Second part')
    const combined = new Uint8Array(part1.length + part2.length)
    combined.set(part1)
    combined.set(part2, part1.length)

    // Single update
    const hash1 = BLAKE2b.hash(combined)

    // Multiple updates
    const blake = new BLAKE2b()
    blake.update(part1)
    blake.update(part2)
    const hash2 = blake.digest()

    expect(hash1).toEqual(hash2)
  })

  it('should handle empty input', () => {
    const empty = new Uint8Array(0)

    const hash = BLAKE2b.hash(empty)

    expect(hash).toBeDefined()
    expect(hash.length).toBe(64)
  })

  it('should handle large input', () => {
    const largeData = new Uint8Array(10000).fill(42)

    const hash = BLAKE2b.hash(largeData)

    expect(hash).toBeDefined()
    expect(hash.length).toBe(64)
  })

  it('should throw on invalid output length', () => {
    const data = new Uint8Array(10)

    expect(() => BLAKE2b.hash(data, 0)).toThrow('between 1 and 64')
    expect(() => BLAKE2b.hash(data, 65)).toThrow('between 1 and 64')
    expect(() => new BLAKE2b(0)).toThrow('between 1 and 64')
    expect(() => new BLAKE2b(65)).toThrow('between 1 and 64')
  })

  it('should throw on key too long', () => {
    const key = new Uint8Array(65)

    expect(() => new BLAKE2b(64, key)).toThrow('must not exceed 64')
  })
})

describe('modernCipherUtils', () => {
  describe('key and nonce generation', () => {
    it('should generate keys of correct length', () => {
      const chachaKey = ModernCipherUtils.generateKey('chacha20')
      const xsalsaKey = ModernCipherUtils.generateKey('xsalsa20')
      const blake2Key = ModernCipherUtils.generateKey('blake2b')

      expect(chachaKey.length).toBe(32)
      expect(xsalsaKey.length).toBe(32)
      expect(blake2Key.length).toBe(32)
    })

    it('should generate nonces of correct length', () => {
      const chachaNonce = ModernCipherUtils.generateNonce('chacha20')
      const xsalsaNonce = ModernCipherUtils.generateNonce('xsalsa20')

      expect(chachaNonce.length).toBe(12)
      expect(xsalsaNonce.length).toBe(24)
    })

    it('should generate different keys each time', () => {
      const key1 = ModernCipherUtils.generateKey()
      const key2 = ModernCipherUtils.generateKey()

      expect(key1).not.toEqual(key2)
    })

    it('should generate different nonces each time', () => {
      const nonce1 = ModernCipherUtils.generateNonce()
      const nonce2 = ModernCipherUtils.generateNonce()

      expect(nonce1).not.toEqual(nonce2)
    })
  })

  describe('aEAD encryption', () => {
    it('should encrypt and decrypt string data', () => {
      const key = ModernCipherUtils.generateKey('chacha20')
      const plaintext = 'Secret message for AEAD'

      const encrypted = ModernCipherUtils.encryptAEAD(plaintext, key)

      expect(encrypted.ciphertext).toBeDefined()
      expect(encrypted.nonce).toBeDefined()
      expect(encrypted.tag).toBeDefined()

      const decrypted = ModernCipherUtils.decryptAEAD(
        encrypted.ciphertext,
        encrypted.tag,
        key,
        encrypted.nonce,
      )

      expect(decrypted).not.toBeNull()
      expect(new TextDecoder().decode(decrypted!)).toBe(plaintext)
    })

    it('should encrypt and decrypt binary data', () => {
      const key = ModernCipherUtils.generateKey('chacha20')
      const plaintext = new Uint8Array([1, 2, 3, 4, 5])

      const encrypted = ModernCipherUtils.encryptAEAD(plaintext, key)
      const decrypted = ModernCipherUtils.decryptAEAD(
        encrypted.ciphertext,
        encrypted.tag,
        key,
        encrypted.nonce,
      )

      expect(decrypted).toEqual(plaintext)
    })

    it('should support additional authenticated data', () => {
      const key = ModernCipherUtils.generateKey('chacha20')
      const plaintext = 'Secret'
      const aad = 'Public metadata'

      const encrypted = ModernCipherUtils.encryptAEAD(plaintext, key, aad)

      // Correct AAD should decrypt successfully
      const decrypted = ModernCipherUtils.decryptAEAD(
        encrypted.ciphertext,
        encrypted.tag,
        key,
        encrypted.nonce,
        aad,
      )

      expect(decrypted).not.toBeNull()
      expect(new TextDecoder().decode(decrypted!)).toBe(plaintext)

      // Wrong AAD should fail
      const wrongDecrypted = ModernCipherUtils.decryptAEAD(
        encrypted.ciphertext,
        encrypted.tag,
        key,
        encrypted.nonce,
        'Wrong metadata',
      )

      expect(wrongDecrypted).toBeNull()
    })

    it('should fail with tampered ciphertext', () => {
      const key = ModernCipherUtils.generateKey('chacha20')
      const plaintext = 'Original'

      const encrypted = ModernCipherUtils.encryptAEAD(plaintext, key)

      // Tamper with ciphertext
      encrypted.ciphertext[0] ^= 0xFF

      const decrypted = ModernCipherUtils.decryptAEAD(
        encrypted.ciphertext,
        encrypted.tag,
        key,
        encrypted.nonce,
      )

      expect(decrypted).toBeNull()
    })
  })

  describe('bLAKE2b hashing', () => {
    it('should hash string data', () => {
      const data = 'Hash this string'

      const hash = ModernCipherUtils.blake2bHash(data)

      expect(hash).toBeDefined()
      expect(hash.length).toBe(64)
    })

    it('should hash binary data', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])

      const hash = ModernCipherUtils.blake2bHash(data)

      expect(hash).toBeDefined()
      expect(hash.length).toBe(64)
    })

    it('should support custom output length', () => {
      const data = 'Test data'

      const hash32 = ModernCipherUtils.blake2bHash(data, 32)
      const hash48 = ModernCipherUtils.blake2bHash(data, 48)

      expect(hash32.length).toBe(32)
      expect(hash48.length).toBe(48)
    })

    it('should support keyed hashing (MAC)', () => {
      const data = 'Message to authenticate'
      const key = ModernCipherUtils.generateKey('blake2b')

      const mac1 = ModernCipherUtils.blake2bMAC(data, key)
      const mac2 = ModernCipherUtils.blake2bMAC(data, key)

      expect(mac1).toEqual(mac2)
      expect(mac1.length).toBe(32) // Default MAC length

      // Different key should produce different MAC
      const differentKey = ModernCipherUtils.generateKey('blake2b')
      const mac3 = ModernCipherUtils.blake2bMAC(data, differentKey)

      expect(mac3).not.toEqual(mac1)
    })

    it('should produce different MACs for different data', () => {
      const key = ModernCipherUtils.generateKey('blake2b')
      const data1 = 'Message 1'
      const data2 = 'Message 2'

      const mac1 = ModernCipherUtils.blake2bMAC(data1, key)
      const mac2 = ModernCipherUtils.blake2bMAC(data2, key)

      expect(mac1).not.toEqual(mac2)
    })
  })
})
