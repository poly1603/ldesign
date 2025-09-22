import { beforeEach, describe, expect, it } from 'vitest'
import {
  aes,
  base64,
  cryptoManager,
  hash,
  hex,
  hmac,
  keyGenerator,
} from '../src/index'

describe('集成测试', () => {
  const testData = 'Hello, Integration Test!'
  const testKey = 'integration-test-key-256'

  beforeEach(() => {
    // 重置加密管理器状态
    cryptoManager.reset?.()
  })

  describe('端到端加密流程测试', () => {
    it('应该完成完整的加密-编码-解码-解密流程', () => {
      // 1. AES 加密
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)
      expect(encrypted.data).toBeTruthy()

      // 2. Base64 编码加密结果
      const encoded = base64.encode(encrypted.data!)
      expect(encoded).toBeTruthy()

      // 3. Base64 解码
      const decoded = base64.decode(encoded)
      expect(decoded).toBe(encrypted.data)

      // 4. AES 解密
      const decrypted = aes.decrypt(decoded, testKey, {
        keySize: 256,
        iv: encrypted.iv
      })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('应该支持多层加密', () => {
      const key1 = 'first-encryption-key'
      const key2 = 'second-encryption-key'

      // 第一层加密
      const firstEncryption = aes.encrypt(testData, key1, { keySize: 256 })
      expect(firstEncryption.success).toBe(true)

      // 第二层加密
      const secondEncryption = aes.encrypt(firstEncryption.data!, key2, {
        keySize: 256,
      })
      expect(secondEncryption.success).toBe(true)

      // 第二层解密
      const firstDecryption = aes.decrypt(secondEncryption.data!, key2, {
        keySize: 256,
        iv: secondEncryption.iv,
      })
      expect(firstDecryption.success).toBe(true)

      // 第一层解密
      const finalDecryption = aes.decrypt(firstDecryption.data!, key1, {
        keySize: 256,
        iv: firstEncryption.iv,
      })
      expect(finalDecryption.success).toBe(true)
      expect(finalDecryption.data).toBe(testData)
    })
  })

  describe('数据完整性验证流程测试', () => {
    it('应该完成加密+哈希验证流程', () => {
      // 1. 计算原始数据哈希
      const originalHash = hash.sha256(testData)

      // 2. 加密数据
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      // 3. 解密数据
      const decrypted = aes.decrypt(encrypted.data!, testKey, {
        keySize: 256,
        iv: encrypted.iv
      })
      expect(decrypted.success).toBe(true)

      // 4. 验证数据完整性
      const decryptedHash = hash.sha256(decrypted.data!)
      expect(decryptedHash).toBe(originalHash)
      expect(decrypted.data).toBe(testData)
    })

    it('应该支持 HMAC 消息认证', () => {
      const authKey = 'authentication-key'

      // 1. 加密数据
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      // 2. 生成 HMAC
      const messageHmac = hmac.sha256(encrypted.data!, authKey)

      // 3. 验证 HMAC
      const isValid = hmac.verify(
        encrypted.data!,
        authKey,
        messageHmac,
        'SHA256',
      )
      expect(isValid).toBe(true)

      // 4. 解密数据
      const decrypted = aes.decrypt(encrypted.data!, testKey, {
        keySize: 256,
        iv: encrypted.iv
      })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('密钥管理集成测试', () => {
    it('应该支持动态密钥生成和使用', () => {
      // 1. 生成随机密钥
      const generatedKey = keyGenerator.generateKey(32)
      expect(generatedKey).toBeTruthy()
      expect(generatedKey.length).toBe(64) // 32 bytes = 64 hex chars

      // 2. 使用生成的密钥加密
      const encrypted = aes.encrypt(testData, generatedKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      // 3. 使用相同密钥解密
      const decrypted = aes.decrypt(encrypted.data!, generatedKey, {
        keySize: 256,
        iv: encrypted.iv,
      })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('应该支持密钥派生', () => {
      const masterKey = 'master-key-for-derivation'
      const salt = 'unique-salt-value'

      // 1. 派生加密密钥
      const encryptionKey = hash.sha256(`${masterKey + salt}encryption`)

      // 2. 派生认证密钥
      const authKey = hash.sha256(`${masterKey + salt}authentication`)

      // 3. 使用派生的密钥
      const encrypted = aes.encrypt(testData, encryptionKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      const messageHmac = hmac.sha256(encrypted.data!, authKey)
      const isValid = hmac.verify(
        encrypted.data!,
        authKey,
        messageHmac,
        'SHA256',
      )
      expect(isValid).toBe(true)

      const decrypted = aes.decrypt(encrypted.data!, encryptionKey, {
        keySize: 256,
        iv: encrypted.iv,
      })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('不同算法组合测试', () => {
    it('应该支持 AES + SHA256 + Base64 组合', () => {
      // 1. AES 加密
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      // 2. 计算加密数据的哈希
      const encryptedHash = hash.sha256(encrypted.data!)

      // 3. Base64 编码
      const encodedData = base64.encode(encrypted.data!)
      const encodedHash = base64.encode(encryptedHash)

      // 4. Base64 解码
      const decodedData = base64.decode(encodedData)
      const decodedHash = base64.decode(encodedHash)

      // 5. 验证哈希
      const computedHash = hash.sha256(decodedData)
      expect(computedHash).toBe(decodedHash)

      // 6. AES 解密
      const decrypted = aes.decrypt(decodedData, testKey, {
        keySize: 256,
        iv: encrypted.iv
      })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })

    it('应该支持 AES + HMAC + Hex 组合', () => {
      const authKey = 'hmac-auth-key'

      // 1. AES 加密
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      // 2. 生成 HMAC
      const messageHmac = hmac.sha256(encrypted.data!, authKey)

      // 3. Hex 编码
      const encodedData = hex.encode(encrypted.data!)
      const encodedHmac = hex.encode(messageHmac)

      // 4. Hex 解码
      const decodedData = hex.decode(encodedData)
      const decodedHmac = hex.decode(encodedHmac)

      // 5. 验证 HMAC
      const isValid = hmac.verify(decodedData, authKey, decodedHmac, 'SHA256')
      expect(isValid).toBe(true)

      // 6. AES 解密
      const decrypted = aes.decrypt(decodedData, testKey, {
        keySize: 256,
        iv: encrypted.iv
      })
      expect(decrypted.success).toBe(true)
      expect(decrypted.data).toBe(testData)
    })
  })

  describe('错误恢复和容错测试', () => {
    it('应该正确处理部分损坏的数据', () => {
      // 1. 正常加密
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      // 2. 模拟数据损坏
      const corruptedData = `${encrypted.data!.substring(
        0,
        encrypted.data!.length - 5,
      )}XXXXX`

      // 3. 尝试解密损坏的数据
      const decrypted = aes.decrypt(corruptedData, testKey, {
        keySize: 256,
        iv: encrypted.iv
      })
      expect(decrypted.success).toBe(false)
      expect(decrypted.error).toBeTruthy()
    })

    it('应该检测到 HMAC 篡改', () => {
      const authKey = 'hmac-auth-key'

      // 1. 加密和生成 HMAC
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      const originalHmac = hmac.sha256(encrypted.data!, authKey)

      // 2. 模拟数据篡改
      const tamperedData = `${encrypted.data!.substring(
        0,
        encrypted.data!.length - 5,
      )}XXXXX`

      // 3. 验证 HMAC（应该失败）
      const isValid = hmac.verify(tamperedData, authKey, originalHmac, 'SHA256')
      expect(isValid).toBe(false)
    })

    it('应该处理编码错误', () => {
      // 1. 正常流程
      const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
      const encoded = base64.encode(encrypted.data!)

      // 2. 模拟编码损坏
      const corruptedEncoded = `${encoded.substring(0, encoded.length - 2)}@@`

      // 3. 尝试解码（应该抛出错误）
      expect(() => base64.decode(corruptedEncoded)).toThrow()
    })
  })

  describe('性能集成测试', () => {
    it('应该在合理时间内完成复杂操作', () => {
      const largeData = 'X'.repeat(10000) // 10KB
      const iterations = 10

      const start = performance.now()

      for (let i = 0; i < iterations; i++) {
        // 1. 加密
        const encrypted = aes.encrypt(largeData, testKey, { keySize: 256 })
        expect(encrypted.success).toBe(true)

        // 2. 哈希
        const dataHash = hash.sha256(encrypted.data!)

        // 3. HMAC
        const messageHmac = hmac.sha256(encrypted.data!, testKey)

        // 4. 编码
        const encoded = base64.encode(encrypted.data!)

        // 5. 解码
        const decoded = base64.decode(encoded)

        // 6. 验证
        const isValid = hmac.verify(decoded, testKey, messageHmac, 'SHA256')
        expect(isValid).toBe(true)

        // 7. 解密
        const decrypted = aes.decrypt(decoded, testKey, {
          keySize: 256,
          iv: encrypted.iv
        })
        expect(decrypted.success).toBe(true)
        expect(decrypted.data).toBe(largeData)
      }

      const end = performance.now()
      const totalTime = end - start

      console.log(
        `完成 ${iterations} 次复杂操作耗时: ${totalTime.toFixed(2)}ms`,
      )

      // 应该在合理时间内完成（10秒内）
      expect(totalTime).toBeLessThan(10000)
    })

    it('应该支持并发操作', async () => {
      const concurrency = 5
      const testCases = Array.from({ length: concurrency }, (_, i) => ({
        data: `Test data ${i}`,
        key: `test-key-${i}`,
      }))

      const start = performance.now()

      // 并发执行加密解密操作
      const promises = testCases.map(async ({ data, key }) => {
        const encrypted = aes.encrypt(data, key, { keySize: 256 })
        expect(encrypted.success).toBe(true)

        const encoded = base64.encode(encrypted.data!)
        const decoded = base64.decode(encoded)

        const decrypted = aes.decrypt(decoded, key, {
          keySize: 256,
          iv: encrypted.iv
        })
        expect(decrypted.success).toBe(true)
        expect(decrypted.data).toBe(data)

        return { data, encrypted: encrypted.data, decrypted: decrypted.data }
      })

      const results = await Promise.all(promises)
      const end = performance.now()

      // 验证所有结果
      results.forEach((result, index) => {
        expect(result.data).toBe(testCases[index].data)
        expect(result.decrypted).toBe(testCases[index].data)
      })

      console.log(
        `并发操作 (${concurrency} 个) 耗时: ${(end - start).toFixed(2)}ms`,
      )

      // 并发操作应该在合理时间内完成
      expect(end - start).toBeLessThan(5000)
    })
  })

  describe('实际应用场景测试', () => {
    it('应该支持密码管理器场景', () => {
      const masterPassword = 'user-master-password'
      const websites = [
        { url: 'example.com', username: 'user1', password: 'pass1' },
        { url: 'test.org', username: 'user2', password: 'pass2' },
        { url: 'demo.net', username: 'user3', password: 'pass3' },
      ]

      // 加密所有密码
      const encryptedPasswords = websites.map((site) => {
        const encrypted = aes.encrypt(site.password, masterPassword, {
          keySize: 256,
        })
        expect(encrypted.success).toBe(true)

        return {
          ...site,
          encryptedPassword: encrypted.data!,
          iv: encrypted.iv!,
        }
      })

      // 解密并验证所有密码
      encryptedPasswords.forEach((encryptedSite, index) => {
        const decrypted = aes.decrypt(
          encryptedSite.encryptedPassword,
          masterPassword,
          {
            keySize: 256,
            iv: encryptedSite.iv,
          },
        )
        expect(decrypted.success).toBe(true)
        expect(decrypted.data).toBe(websites[index].password)
      })
    })

    it('应该支持文件加密场景', () => {
      const fileContent = `
        This is a test file content.
        It contains multiple lines.
        And some special characters: !@#$%^&*()
        Unicode: 🔐 🌟 ✨
      `
      const filePassword = 'file-encryption-password'

      // 1. 计算文件哈希（用于完整性验证）
      const originalHash = hash.sha256(fileContent)

      // 2. 加密文件内容
      const encrypted = aes.encrypt(fileContent, filePassword, { keySize: 256 })
      expect(encrypted.success).toBe(true)

      // 3. 生成文件元数据
      const metadata = {
        originalHash,
        algorithm: 'AES-256-CBC',
        iv: encrypted.iv,
        timestamp: new Date().toISOString(),
      }

      // 4. 编码加密数据和元数据
      const encodedData = base64.encode(encrypted.data!)
      const encodedMetadata = base64.encode(JSON.stringify(metadata))

      // 5. 模拟存储和读取
      const storedData = encodedData
      const storedMetadata = encodedMetadata

      // 6. 解码
      const decodedData = base64.decode(storedData)
      const decodedMetadata = JSON.parse(base64.decode(storedMetadata))

      // 7. 解密文件
      const decrypted = aes.decrypt(decodedData, filePassword, {
        keySize: 256,
        iv: decodedMetadata.iv,
      })
      expect(decrypted.success).toBe(true)

      // 8. 验证文件完整性
      const decryptedHash = hash.sha256(decrypted.data!)
      expect(decryptedHash).toBe(decodedMetadata.originalHash)
      expect(decrypted.data).toBe(fileContent)
    })

    it('应该支持 API 签名验证场景', () => {
      const apiKey = 'api-secret-key'
      const requestData = {
        method: 'POST',
        url: '/api/users',
        body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
        timestamp: Date.now(),
      }

      // 1. 构建签名字符串
      const signatureString = [
        requestData.method,
        requestData.url,
        requestData.body,
        requestData.timestamp.toString(),
      ].join('\n')

      // 2. 生成签名
      const signature = hmac.sha256(signatureString, apiKey)

      // 3. 验证签名（服务端）
      const isValid = hmac.verify(signatureString, apiKey, signature, 'SHA256')
      expect(isValid).toBe(true)

      // 4. 测试篡改检测
      const tamperedString = signatureString.replace('John', 'Jane')
      const isTamperedValid = hmac.verify(
        tamperedString,
        apiKey,
        signature,
        'SHA256',
      )
      expect(isTamperedValid).toBe(false)
    })
  })
})
