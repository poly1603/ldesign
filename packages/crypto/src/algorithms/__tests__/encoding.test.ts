import type { EncodingType } from '../../types'
import { beforeEach, describe, expect, it } from 'vitest'
import { base64, Encoder, encoding, hex } from '../encoding'

describe('encoding Algorithms', () => {
  let encoder: Encoder
  const testData = 'Hello, World!'
  const testDataSpecial = '🔐 Hello, 世界! @#$%^&*()_+-=[]{}|;:,.<>?'

  beforeEach(() => {
    encoder = new Encoder()
  })

  describe('encoder Class', () => {
    it('should encode and decode Base64', () => {
      const encoded = encoder.encode(testData, 'base64')
      const decoded = encoder.decode(encoded, 'base64')

      expect(encoded).toBeDefined()
      expect(encoded).not.toBe(testData)
      expect(decoded).toBe(testData)
    })

    it('should encode and decode Hex', () => {
      const encoded = encoder.encode(testData, 'hex')
      const decoded = encoder.decode(encoded, 'hex')

      expect(encoded).toBeDefined()
      expect(encoded).not.toBe(testData)
      expect(encoded).toMatch(/^[0-9a-f]+$/)
      expect(decoded).toBe(testData)
    })

    it('should handle UTF-8 encoding (no-op)', () => {
      const encoded = encoder.encode(testData, 'utf8')
      const decoded = encoder.decode(encoded, 'utf8')

      expect(encoded).toBe(testData)
      expect(decoded).toBe(testData)
    })

    it('should handle special characters in Base64', () => {
      const encoded = encoder.encode(testDataSpecial, 'base64')
      const decoded = encoder.decode(encoded, 'base64')

      expect(decoded).toBe(testDataSpecial)
    })

    it('should handle special characters in Hex', () => {
      const encoded = encoder.encode(testDataSpecial, 'hex')
      const decoded = encoder.decode(encoded, 'hex')

      expect(decoded).toBe(testDataSpecial)
    })

    it('should handle URL-safe Base64', () => {
      const encoded = encoder.encodeBase64Url(testData)
      const decoded = encoder.decodeBase64Url(encoded)

      expect(encoded).toBeDefined()
      expect(encoded).not.toContain('+')
      expect(encoded).not.toContain('/')
      expect(encoded).not.toContain('=')
      expect(decoded).toBe(testData)
    })

    it('should handle empty data', () => {
      const encoded = encoder.encode('', 'base64')
      expect(encoded).toBe('')

      const decoded = encoder.decode('', 'base64')
      expect(decoded).toBe('')
    })

    it('should throw error for unsupported encoding', () => {
      expect(() => encoder.encode(testData, 'invalid' as EncodingType)).toThrow(
        'Unsupported encoding type',
      )
      expect(() => encoder.decode('data', 'invalid' as EncodingType)).toThrow(
        'Unsupported encoding type',
      )
    })
  })

  describe('base64 Encoding', () => {
    it('should work with base64 convenience functions', () => {
      const encoded = base64.encode(testData)
      const decoded = base64.decode(encoded)

      expect(decoded).toBe(testData)
    })

    it('should work with URL-safe base64', () => {
      const encoded = base64.encodeUrl(testData)
      const decoded = base64.decodeUrl(encoded)

      expect(decoded).toBe(testData)
    })

    it('should handle long text', () => {
      const longText = 'A'.repeat(10000)
      const encoded = base64.encode(longText)
      const decoded = base64.decode(encoded)

      expect(decoded).toBe(longText)
    })

    it('should produce valid Base64 format', () => {
      const encoded = base64.encode(testData)
      expect(encoded).toMatch(/^[A-Z0-9+/]+=*$/i)
    })
  })

  describe('hex Encoding', () => {
    it('should work with hex convenience functions', () => {
      const encoded = hex.encode(testData)
      const decoded = hex.decode(encoded)

      expect(decoded).toBe(testData)
    })

    it('should produce valid hex format', () => {
      const encoded = hex.encode(testData)
      expect(encoded).toMatch(/^[0-9a-f]+$/)
      expect(encoded.length % 2).toBe(0)
    })

    it('should handle long text', () => {
      const longText = 'A'.repeat(10000)
      const encoded = hex.encode(longText)
      const decoded = hex.decode(encoded)

      expect(decoded).toBe(longText)
    })
  })

  describe('general Encoding Functions', () => {
    it('should work with general encode/decode functions', () => {
      const base64Encoded = encoding.encode(testData, 'base64')
      const base64Decoded = encoding.decode(base64Encoded, 'base64')

      const hexEncoded = encoding.encode(testData, 'hex')
      const hexDecoded = encoding.decode(hexEncoded, 'hex')

      expect(base64Decoded).toBe(testData)
      expect(hexDecoded).toBe(testData)
    })

    it('should access specific encoders', () => {
      expect(encoding.base64.encode(testData)).toBe(base64.encode(testData))
      expect(encoding.hex.encode(testData)).toBe(hex.encode(testData))
    })
  })

  describe('edge Cases', () => {
    it('should handle empty string', () => {
      const encoded = encoding.encode('', 'base64')
      expect(encoded).toBe('')

      const decoded = encoding.decode('', 'base64')
      expect(decoded).toBe('')
    })

    it('should handle invalid Base64 input', () => {
      expect(() => base64.decode('invalid-base64!')).toThrow()
    })

    it('should handle invalid Hex input', () => {
      expect(() => hex.decode('invalid-hex-gg')).toThrow()
    })

    it('should handle odd-length hex strings', () => {
      expect(() => hex.decode('abc')).toThrow() // Odd length
    })
  })

  describe('consistency Tests', () => {
    it('should be consistent across multiple encode/decode cycles', () => {
      let data = testData

      // Multiple Base64 cycles
      for (let i = 0; i < 5; i++) {
        const encoded = base64.encode(data)
        data = base64.decode(encoded)
      }
      expect(data).toBe(testData)

      // Reset and test Hex
      data = testData
      for (let i = 0; i < 5; i++) {
        const encoded = hex.encode(data)
        data = hex.decode(encoded)
      }
      expect(data).toBe(testData)
    })

    it('should produce same output for same input', () => {
      const encoded1 = base64.encode(testData)
      const encoded2 = base64.encode(testData)
      expect(encoded1).toBe(encoded2)

      const hexEncoded1 = hex.encode(testData)
      const hexEncoded2 = hex.encode(testData)
      expect(hexEncoded1).toBe(hexEncoded2)
    })
  })

  describe('cross-platform Compatibility', () => {
    it('should work in different environments', () => {
      // Test with known values
      const knownText = 'Hello'
      const knownBase64 = 'SGVsbG8='
      const knownHex = '48656c6c6f'

      expect(base64.encode(knownText)).toBe(knownBase64)
      expect(base64.decode(knownBase64)).toBe(knownText)

      expect(hex.encode(knownText)).toBe(knownHex)
      expect(hex.decode(knownHex)).toBe(knownText)
    })
  })
})
