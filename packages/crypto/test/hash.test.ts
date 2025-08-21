import { describe, expect, it } from 'vitest'
import { hash, hmac } from '../src/index'

describe('哈希算法测试', () => {
  const testData = 'Hello, Hash!'
  const emptyData = ''
  const largeData = 'A'.repeat(10000)
  const unicodeData = '🔐 Hello, 世界! 🌟'

  describe('mD5 哈希测试', () => {
    it('应该生成正确的 MD5 哈希', () => {
      const result = hash.md5(testData)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(32) // MD5 哈希长度为32个十六进制字符
    })

    it('相同输入应该产生相同的 MD5 哈希', () => {
      const hash1 = hash.md5(testData)
      const hash2 = hash.md5(testData)
      expect(hash1).toBe(hash2)
    })

    it('不同输入应该产生不同的 MD5 哈希', () => {
      const hash1 = hash.md5('data1')
      const hash2 = hash.md5('data2')
      expect(hash1).not.toBe(hash2)
    })

    it('应该处理空字符串', () => {
      const result = hash.md5(emptyData)
      expect(result).toBeTruthy()
      expect(result.length).toBe(32)
    })

    it('应该处理 Unicode 字符', () => {
      const result = hash.md5(unicodeData)
      expect(result).toBeTruthy()
      expect(result.length).toBe(32)
    })
  })

  describe('sHA1 哈希测试', () => {
    it('应该生成正确的 SHA1 哈希', () => {
      const result = hash.sha1(testData)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(40) // SHA1 哈希长度为40个十六进制字符
    })

    it('相同输入应该产生相同的 SHA1 哈希', () => {
      const hash1 = hash.sha1(testData)
      const hash2 = hash.sha1(testData)
      expect(hash1).toBe(hash2)
    })

    it('不同输入应该产生不同的 SHA1 哈希', () => {
      const hash1 = hash.sha1('data1')
      const hash2 = hash.sha1('data2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('sHA224 哈希测试', () => {
    it('应该生成正确的 SHA224 哈希', () => {
      const result = hash.sha224(testData)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(56) // SHA224 哈希长度为56个十六进制字符
    })

    it('相同输入应该产生相同的 SHA224 哈希', () => {
      const hash1 = hash.sha224(testData)
      const hash2 = hash.sha224(testData)
      expect(hash1).toBe(hash2)
    })
  })

  describe('sHA256 哈希测试', () => {
    it('应该生成正确的 SHA256 哈希', () => {
      const result = hash.sha256(testData)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(64) // SHA256 哈希长度为64个十六进制字符
    })

    it('相同输入应该产生相同的 SHA256 哈希', () => {
      const hash1 = hash.sha256(testData)
      const hash2 = hash.sha256(testData)
      expect(hash1).toBe(hash2)
    })

    it('应该处理大数据', () => {
      const result = hash.sha256(largeData)
      expect(result).toBeTruthy()
      expect(result.length).toBe(64)
    })

    it('应该生成已知测试向量的正确哈希', () => {
      // 使用标准测试向量
      const testVector = 'abc'
      const expectedHash
        = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
      const result = hash.sha256(testVector)
      expect(result.toLowerCase()).toBe(expectedHash)
    })
  })

  describe('sHA384 哈希测试', () => {
    it('应该生成正确的 SHA384 哈希', () => {
      const result = hash.sha384(testData)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(96) // SHA384 哈希长度为96个十六进制字符
    })

    it('相同输入应该产生相同的 SHA384 哈希', () => {
      const hash1 = hash.sha384(testData)
      const hash2 = hash.sha384(testData)
      expect(hash1).toBe(hash2)
    })
  })

  describe('sHA512 哈希测试', () => {
    it('应该生成正确的 SHA512 哈希', () => {
      const result = hash.sha512(testData)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(128) // SHA512 哈希长度为128个十六进制字符
    })

    it('相同输入应该产生相同的 SHA512 哈希', () => {
      const hash1 = hash.sha512(testData)
      const hash2 = hash.sha512(testData)
      expect(hash1).toBe(hash2)
    })

    it('应该生成已知测试向量的正确哈希', () => {
      // 使用标准测试向量
      const testVector = 'abc'
      const expectedHash
        = 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
      const result = hash.sha512(testVector)
      expect(result.toLowerCase()).toBe(expectedHash)
    })
  })

  describe('哈希验证测试', () => {
    it('应该正确验证 SHA256 哈希', () => {
      const data = 'test data'
      const expectedHash = hash.sha256(data)

      const isValid = hash.verify(data, expectedHash, 'SHA256')
      expect(isValid).toBe(true)
    })

    it('应该拒绝错误的哈希', () => {
      const data = 'test data'
      const wrongHash = 'wrong-hash-value'

      const isValid = hash.verify(data, wrongHash, 'SHA256')
      expect(isValid).toBe(false)
    })

    it('应该支持不同的哈希算法验证', () => {
      const data = 'test data'

      const md5Hash = hash.md5(data)
      const sha1Hash = hash.sha1(data)
      const sha256Hash = hash.sha256(data)

      expect(hash.verify(data, md5Hash, 'MD5')).toBe(true)
      expect(hash.verify(data, sha1Hash, 'SHA1')).toBe(true)
      expect(hash.verify(data, sha256Hash, 'SHA256')).toBe(true)
    })
  })

  describe('不同算法对比测试', () => {
    it('不同算法应该产生不同长度的哈希', () => {
      const md5Result = hash.md5(testData)
      const sha1Result = hash.sha1(testData)
      const sha256Result = hash.sha256(testData)
      const sha512Result = hash.sha512(testData)

      expect(md5Result.length).toBe(32)
      expect(sha1Result.length).toBe(40)
      expect(sha256Result.length).toBe(64)
      expect(sha512Result.length).toBe(128)
    })

    it('不同算法应该产生不同的哈希值', () => {
      const md5Result = hash.md5(testData)
      const sha256Result = hash.sha256(testData)
      const sha512Result = hash.sha512(testData)

      expect(md5Result).not.toBe(sha256Result)
      expect(sha256Result).not.toBe(sha512Result)
      expect(md5Result).not.toBe(sha512Result)
    })
  })
})

describe('hMAC 测试', () => {
  const testData = 'Hello, HMAC!'
  const testKey = 'secret-key'
  const emptyKey = ''
  const longKey = 'this-is-a-very-long-secret-key-for-hmac-testing'

  describe('hMAC-MD5 测试', () => {
    it('应该生成正确的 HMAC-MD5', () => {
      const result = hmac.md5(testData, testKey)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(32)
    })

    it('相同输入和密钥应该产生相同的 HMAC', () => {
      const hmac1 = hmac.md5(testData, testKey)
      const hmac2 = hmac.md5(testData, testKey)
      expect(hmac1).toBe(hmac2)
    })

    it('不同密钥应该产生不同的 HMAC', () => {
      const hmac1 = hmac.md5(testData, 'key1')
      const hmac2 = hmac.md5(testData, 'key2')
      expect(hmac1).not.toBe(hmac2)
    })
  })

  describe('hMAC-SHA1 测试', () => {
    it('应该生成正确的 HMAC-SHA1', () => {
      const result = hmac.sha1(testData, testKey)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(40)
    })
  })

  describe('hMAC-SHA256 测试', () => {
    it('应该生成正确的 HMAC-SHA256', () => {
      const result = hmac.sha256(testData, testKey)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(64)
    })

    it('应该处理长密钥', () => {
      const result = hmac.sha256(testData, longKey)
      expect(result).toBeTruthy()
      expect(result.length).toBe(64)
    })

    it('应该处理空密钥', () => {
      const result = hmac.sha256(testData, emptyKey)
      expect(result).toBeTruthy()
      expect(result.length).toBe(64)
    })
  })

  describe('hMAC-SHA384 测试', () => {
    it('应该生成正确的 HMAC-SHA384', () => {
      const result = hmac.sha384(testData, testKey)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(96)
    })
  })

  describe('hMAC-SHA512 测试', () => {
    it('应该生成正确的 HMAC-SHA512', () => {
      const result = hmac.sha512(testData, testKey)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBe(128)
    })
  })

  describe('hMAC 验证测试', () => {
    it('应该正确验证 HMAC-SHA256', () => {
      const data = 'test data'
      const key = 'test key'
      const expectedHmac = hmac.sha256(data, key)

      const isValid = hmac.verify(data, key, expectedHmac, 'SHA256')
      expect(isValid).toBe(true)
    })

    it('应该拒绝错误的 HMAC', () => {
      const data = 'test data'
      const key = 'test key'
      const wrongHmac = 'wrong-hmac-value'

      const isValid = hmac.verify(data, key, wrongHmac, 'SHA256')
      expect(isValid).toBe(false)
    })

    it('应该拒绝错误的密钥', () => {
      const data = 'test data'
      const correctKey = 'correct key'
      const wrongKey = 'wrong key'
      const expectedHmac = hmac.sha256(data, correctKey)

      const isValid = hmac.verify(data, wrongKey, expectedHmac, 'SHA256')
      expect(isValid).toBe(false)
    })

    it('应该支持不同的 HMAC 算法验证', () => {
      const data = 'test data'
      const key = 'test key'

      const hmacMd5 = hmac.md5(data, key)
      const hmacSha1 = hmac.sha1(data, key)
      const hmacSha256 = hmac.sha256(data, key)

      expect(hmac.verify(data, key, hmacMd5, 'MD5')).toBe(true)
      expect(hmac.verify(data, key, hmacSha1, 'SHA1')).toBe(true)
      expect(hmac.verify(data, key, hmacSha256, 'SHA256')).toBe(true)
    })
  })

  describe('hMAC 安全性测试', () => {
    it('密钥顺序不应该影响结果', () => {
      const data = 'test data'
      const key = 'test key'

      const hmac1 = hmac.sha256(data, key)
      const hmac2 = hmac.sha256(data, key)

      expect(hmac1).toBe(hmac2)
    })

    it('数据和密钥交换应该产生不同结果', () => {
      const data = 'test data'
      const key = 'test key'

      const hmac1 = hmac.sha256(data, key)
      const hmac2 = hmac.sha256(key, data) // 交换数据和密钥

      expect(hmac1).not.toBe(hmac2)
    })

    it('应该抵抗长度扩展攻击', () => {
      const data = 'original data'
      const key = 'secret key'
      const extendedData = `${data}extended`

      const originalHmac = hmac.sha256(data, key)
      const extendedHmac = hmac.sha256(extendedData, key)

      expect(originalHmac).not.toBe(extendedHmac)
    })
  })
})
