import { describe, expect, it } from 'vitest'
import { base64, hex } from '../src/index'

describe('编码算法测试', () => {
  const testData = 'Hello, Encoding!'
  const emptyData = ''
  const unicodeData = '🔐 Hello, 世界! 🌟'
  const binaryData
    = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F'
  const largeData = 'A'.repeat(10000)

  describe('base64 编码测试', () => {
    it('应该正确编码基本字符串', () => {
      const encoded = base64.encode(testData)
      expect(encoded).toBeTruthy()
      expect(typeof encoded).toBe('string')

      // Base64 编码应该只包含有效字符
      expect(/^[A-Z0-9+/]*={0,2}$/i.test(encoded)).toBe(true)
    })

    it('应该正确解码 Base64 字符串', () => {
      const encoded = base64.encode(testData)
      const decoded = base64.decode(encoded)
      expect(decoded).toBe(testData)
    })

    it('应该处理空字符串', () => {
      const encoded = base64.encode(emptyData)
      expect(encoded).toBe('')

      const decoded = base64.decode(encoded)
      expect(decoded).toBe(emptyData)
    })

    it('应该处理 Unicode 字符', () => {
      const encoded = base64.encode(unicodeData)
      expect(encoded).toBeTruthy()

      const decoded = base64.decode(encoded)
      expect(decoded).toBe(unicodeData)
    })

    it('应该处理二进制数据', () => {
      const encoded = base64.encode(binaryData)
      expect(encoded).toBeTruthy()

      const decoded = base64.decode(encoded)
      expect(decoded).toBe(binaryData)
    })

    it('应该处理大数据', () => {
      const encoded = base64.encode(largeData)
      expect(encoded).toBeTruthy()

      const decoded = base64.decode(encoded)
      expect(decoded).toBe(largeData)
    })

    it('编码结果应该是可逆的', () => {
      const testCases = [
        'Hello',
        'Hello!',
        'Hello!!',
        'Hello!!!',
        '中文测试',
        '🔐🌟✨',
        'Line1\nLine2\nLine3',
      ]

      testCases.forEach((testCase) => {
        const encoded = base64.encode(testCase)
        const decoded = base64.decode(encoded)
        expect(decoded).toBe(testCase)
      })
    })

    it('应该生成标准的 Base64 输出', () => {
      // 使用已知的测试向量
      const testVector = 'Man'
      const expectedEncoded = 'TWFu'
      const encoded = base64.encode(testVector)
      expect(encoded).toBe(expectedEncoded)
    })

    it('应该正确处理填充', () => {
      // 测试不同长度的输入，验证填充是否正确
      const test1 = 'M' // 需要2个填充字符
      const test2 = 'Ma' // 需要1个填充字符
      const test3 = 'Man' // 不需要填充

      const encoded1 = base64.encode(test1)
      const encoded2 = base64.encode(test2)
      const encoded3 = base64.encode(test3)

      expect(encoded1.endsWith('==')).toBe(true)
      expect(encoded2.endsWith('=')).toBe(true)
      expect(encoded3.includes('=')).toBe(false)

      // 验证解码正确性
      expect(base64.decode(encoded1)).toBe(test1)
      expect(base64.decode(encoded2)).toBe(test2)
      expect(base64.decode(encoded3)).toBe(test3)
    })
  })

  describe('base64 错误处理测试', () => {
    it('应该处理无效的 Base64 字符串', () => {
      const invalidBase64 = 'Invalid@Base64#String!'
      expect(() => base64.decode(invalidBase64)).toThrow()
    })

    it('应该处理格式错误的 Base64 字符串', () => {
      const malformedBase64 = 'TWFu=' // 错误的填充
      expect(() => base64.decode(malformedBase64)).toThrow()
    })

    it('应该处理长度错误的 Base64 字符串', () => {
      const wrongLengthBase64 = 'TWF' // 长度不是4的倍数且没有正确填充
      expect(() => base64.decode(wrongLengthBase64)).toThrow()
    })
  })

  describe('hex 编码测试', () => {
    it('应该正确编码基本字符串', () => {
      const encoded = hex.encode(testData)
      expect(encoded).toBeTruthy()
      expect(typeof encoded).toBe('string')

      // Hex 编码应该只包含十六进制字符
      expect(/^[0-9a-f]*$/i.test(encoded)).toBe(true)
    })

    it('应该正确解码 Hex 字符串', () => {
      const encoded = hex.encode(testData)
      const decoded = hex.decode(encoded)
      expect(decoded).toBe(testData)
    })

    it('应该处理空字符串', () => {
      const encoded = hex.encode(emptyData)
      expect(encoded).toBe('')

      const decoded = hex.decode(encoded)
      expect(decoded).toBe(emptyData)
    })

    it('应该处理 Unicode 字符', () => {
      const encoded = hex.encode(unicodeData)
      expect(encoded).toBeTruthy()

      const decoded = hex.decode(encoded)
      expect(decoded).toBe(unicodeData)
    })

    it('应该处理二进制数据', () => {
      const encoded = hex.encode(binaryData)
      expect(encoded).toBeTruthy()

      const decoded = hex.decode(encoded)
      expect(decoded).toBe(binaryData)
    })

    it('应该处理大数据', () => {
      const encoded = hex.encode(largeData)
      expect(encoded).toBeTruthy()

      const decoded = hex.decode(encoded)
      expect(decoded).toBe(largeData)
    })

    it('编码结果应该是可逆的', () => {
      const testCases = [
        'Hello',
        'Hello World!',
        '中文测试',
        '🔐🌟✨',
        'Line1\nLine2\nLine3',
        '\x00\x01\x02\x03',
      ]

      testCases.forEach((testCase) => {
        const encoded = hex.encode(testCase)
        const decoded = hex.decode(encoded)
        expect(decoded).toBe(testCase)
      })
    })

    it('应该生成标准的 Hex 输出', () => {
      // 使用已知的测试向量
      const testVector = 'Hello'
      const expectedEncoded = '48656c6c6f' // "Hello" 的 Hex 编码
      const encoded = hex.encode(testVector)
      expect(encoded.toLowerCase()).toBe(expectedEncoded)
    })

    it('编码长度应该是原始数据的两倍', () => {
      const testCases = ['A', 'AB', 'ABC', 'ABCD']

      testCases.forEach((testCase) => {
        const encoded = hex.encode(testCase)
        // 每个字节编码为2个十六进制字符
        const expectedLength = new TextEncoder().encode(testCase).length * 2
        expect(encoded.length).toBe(expectedLength)
      })
    })
  })

  describe('hex 错误处理测试', () => {
    it('应该处理无效的 Hex 字符串', () => {
      const invalidHex = 'Invalid@Hex#String!'
      expect(() => hex.decode(invalidHex)).toThrow()
    })

    it('应该处理奇数长度的 Hex 字符串', () => {
      const oddLengthHex = '48656c6c6' // 奇数长度
      expect(() => hex.decode(oddLengthHex)).toThrow()
    })

    it('应该处理包含非十六进制字符的字符串', () => {
      const invalidChars = '48656c6g' // 包含 'g'
      expect(() => hex.decode(invalidChars)).toThrow()
    })
  })

  describe('编码算法对比测试', () => {
    it('base64 和 Hex 应该产生不同的编码结果', () => {
      const base64Encoded = base64.encode(testData)
      const hexEncoded = hex.encode(testData)

      expect(base64Encoded).not.toBe(hexEncoded)
    })

    it('base64 编码通常比 Hex 编码更紧凑', () => {
      const testCases = ['Hello', 'Hello World!', largeData.substring(0, 1000)]

      testCases.forEach((testCase) => {
        const base64Encoded = base64.encode(testCase)
        const hexEncoded = hex.encode(testCase)

        // Base64 通常比 Hex 更紧凑（除了很短的字符串）
        if (testCase.length > 10) {
          expect(base64Encoded.length).toBeLessThan(hexEncoded.length)
        }
      })
    })

    it('两种编码都应该正确处理相同的数据', () => {
      const testCases = [testData, unicodeData, binaryData]

      testCases.forEach((testCase) => {
        const base64Encoded = base64.encode(testCase)
        const base64Decoded = base64.decode(base64Encoded)

        const hexEncoded = hex.encode(testCase)
        const hexDecoded = hex.decode(hexEncoded)

        expect(base64Decoded).toBe(testCase)
        expect(hexDecoded).toBe(testCase)
        expect(base64Decoded).toBe(hexDecoded)
      })
    })
  })

  describe('性能和效率测试', () => {
    it('编码和解码应该在合理时间内完成', () => {
      const largeTestData = 'X'.repeat(50000) // 50KB

      const start1 = performance.now()
      const base64Encoded = base64.encode(largeTestData)
      const base64Decoded = base64.decode(base64Encoded)
      const end1 = performance.now()

      const start2 = performance.now()
      const hexEncoded = hex.encode(largeTestData)
      const hexDecoded = hex.decode(hexEncoded)
      const end2 = performance.now()

      // 验证正确性
      expect(base64Decoded).toBe(largeTestData)
      expect(hexDecoded).toBe(largeTestData)

      // 性能应该在合理范围内（1秒内）
      expect(end1 - start1).toBeLessThan(1000)
      expect(end2 - start2).toBeLessThan(1000)
    })

    it('重复编码应该产生相同结果', () => {
      const iterations = 100
      const firstBase64 = base64.encode(testData)
      const firstHex = hex.encode(testData)

      for (let i = 0; i < iterations; i++) {
        expect(base64.encode(testData)).toBe(firstBase64)
        expect(hex.encode(testData)).toBe(firstHex)
      }
    })
  })

  describe('边界条件测试', () => {
    it('应该处理单字符输入', () => {
      const singleChar = 'A'

      const base64Encoded = base64.encode(singleChar)
      const base64Decoded = base64.decode(base64Encoded)
      expect(base64Decoded).toBe(singleChar)

      const hexEncoded = hex.encode(singleChar)
      const hexDecoded = hex.decode(hexEncoded)
      expect(hexDecoded).toBe(singleChar)
    })

    it('应该处理所有 ASCII 字符', () => {
      // 测试所有可打印的 ASCII 字符
      let allAscii = ''
      for (let i = 32; i <= 126; i++) {
        allAscii += String.fromCharCode(i)
      }

      const base64Encoded = base64.encode(allAscii)
      const base64Decoded = base64.decode(base64Encoded)
      expect(base64Decoded).toBe(allAscii)

      const hexEncoded = hex.encode(allAscii)
      const hexDecoded = hex.decode(hexEncoded)
      expect(hexDecoded).toBe(allAscii)
    })

    it('应该处理控制字符', () => {
      const controlChars
        = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F'

      const base64Encoded = base64.encode(controlChars)
      const base64Decoded = base64.decode(base64Encoded)
      expect(base64Decoded).toBe(controlChars)

      const hexEncoded = hex.encode(controlChars)
      const hexDecoded = hex.decode(hexEncoded)
      expect(hexDecoded).toBe(controlChars)
    })
  })
})
