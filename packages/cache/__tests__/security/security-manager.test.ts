import type { SecurityConfig } from '../../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { SecurityManager } from '../../src/security/security-manager'

describe('securityManager', () => {
  let securityManager: SecurityManager

  describe('加密功能', () => {
    beforeEach(() => {
      const config: Partial<SecurityConfig> = {
        encryption: {
          enabled: true,
          algorithm: 'AES',
          secretKey: 'test-secret-key-123',
        },
        obfuscation: {
          enabled: false,
        },
      }
      securityManager = new SecurityManager(config)
    })

    it('应该能够加密和解密数据', async () => {
      const originalData = 'sensitive data to encrypt'

      const encrypted = await securityManager.encrypt(originalData)
      expect(encrypted).not.toBe(originalData)
      expect(encrypted.length).toBeGreaterThan(0)

      const decrypted = await securityManager.decrypt(encrypted)
      expect(decrypted).toBe(originalData)
    })

    it('应该能够处理中文数据', async () => {
      const originalData = '这是一些需要加密的中文数据'

      const encrypted = await securityManager.encrypt(originalData)
      const decrypted = await securityManager.decrypt(encrypted)

      expect(decrypted).toBe(originalData)
    })

    it('应该能够处理复杂对象', async () => {
      const originalData = JSON.stringify({
        name: '测试用户',
        age: 25,
        hobbies: ['编程', '阅读'],
        profile: {
          email: 'test@example.com',
          active: true,
        },
      })

      const encrypted = await securityManager.encrypt(originalData)
      const decrypted = await securityManager.decrypt(encrypted)

      expect(decrypted).toBe(originalData)
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(originalData))
    })

    it('禁用加密时应该返回原始数据', async () => {
      const config: Partial<SecurityConfig> = {
        encryption: { enabled: false },
      }
      const manager = new SecurityManager(config)

      const data = 'unencrypted data'
      const encrypted = await manager.encrypt(data)
      const decrypted = await manager.decrypt(data)

      expect(encrypted).toBe(data)
      expect(decrypted).toBe(data)
    })
  })

  describe('键名混淆功能', () => {
    beforeEach(() => {
      const config: Partial<SecurityConfig> = {
        encryption: {
          enabled: false,
        },
        obfuscation: {
          enabled: true,
          prefix: 'test_',
          algorithm: 'hash',
        },
      }
      securityManager = new SecurityManager(config)
    })

    it('应该能够混淆和反混淆键名', async () => {
      const originalKey = 'user-profile-123'

      const obfuscated = await securityManager.obfuscateKey(originalKey)
      expect(obfuscated).not.toBe(originalKey)
      expect(obfuscated).toMatch(/^test_/)

      // 注意：哈希混淆是单向的，这里测试的是缓存机制
      const deobfuscated = await securityManager.deobfuscateKey(obfuscated)
      expect(deobfuscated).toBe(originalKey)
    })

    it('应该为相同的键生成相同的混淆结果', async () => {
      const key = 'consistent-key'

      const obfuscated1 = await securityManager.obfuscateKey(key)
      const obfuscated2 = await securityManager.obfuscateKey(key)

      expect(obfuscated1).toBe(obfuscated2)
    })

    it('禁用混淆时应该返回原始键名', async () => {
      const config: Partial<SecurityConfig> = {
        obfuscation: { enabled: false },
      }
      const manager = new SecurityManager(config)

      const key = 'normal-key'
      const obfuscated = await manager.obfuscateKey(key)
      const deobfuscated = await manager.deobfuscateKey(key)

      expect(obfuscated).toBe(key)
      expect(deobfuscated).toBe(key)
    })
  })

  describe('自定义算法', () => {
    it('应该支持自定义加密算法', async () => {
      const config: Partial<SecurityConfig> = {
        encryption: {
          enabled: true,
          algorithm: 'custom',
          customEncrypt: (data: string) => `custom_encrypted_${data}`,
          customDecrypt: (data: string) =>
            data.replace('custom_encrypted_', ''),
        },
      }
      const manager = new SecurityManager(config)

      const originalData = 'test data'
      const encrypted = await manager.encrypt(originalData)
      const decrypted = await manager.decrypt(encrypted)

      expect(encrypted).toBe(`custom_encrypted_${originalData}`)
      expect(decrypted).toBe(originalData)
    })

    it('应该支持自定义混淆算法', async () => {
      const config: Partial<SecurityConfig> = {
        obfuscation: {
          enabled: true,
          customObfuscate: (key: string) =>
            `obf_${key.split('').reverse().join('')}`,
          customDeobfuscate: (key: string) =>
            key.replace('obf_', '').split('').reverse().join(''),
        },
      }
      const manager = new SecurityManager(config)

      const originalKey = 'test-key'
      const obfuscated = await manager.obfuscateKey(originalKey)
      const deobfuscated = await manager.deobfuscateKey(obfuscated)

      expect(obfuscated).toBe('obf_yek-tset')
      expect(deobfuscated).toBe(originalKey)
    })
  })

  describe('安全检查', () => {
    beforeEach(() => {
      const config: Partial<SecurityConfig> = {
        encryption: { enabled: true },
        obfuscation: { enabled: true },
      }
      securityManager = new SecurityManager(config)
    })

    it('应该能够检查数据是否需要加密', () => {
      expect(securityManager.shouldEncrypt('data')).toBe(true)
      expect(securityManager.shouldEncrypt('data', { encrypt: false })).toBe(
        false,
      )
      expect(securityManager.shouldEncrypt('data', { encrypt: true })).toBe(
        true,
      )
    })

    it('应该能够检查键名是否需要混淆', () => {
      expect(securityManager.shouldObfuscateKey()).toBe(true)
      expect(securityManager.shouldObfuscateKey({ obfuscateKey: false })).toBe(
        false,
      )
      expect(securityManager.shouldObfuscateKey({ obfuscateKey: true })).toBe(
        true,
      )
    })

    it('应该能够生成安全的随机键', () => {
      const key1 = securityManager.generateSecureKey()
      const key2 = securityManager.generateSecureKey()

      expect(key1).toHaveLength(32)
      expect(key2).toHaveLength(32)
      expect(key1).not.toBe(key2)

      const customLengthKey = securityManager.generateSecureKey(16)
      expect(customLengthKey).toHaveLength(16)
    })

    it('应该能够验证数据完整性', async () => {
      const originalData = 'integrity test data'
      const encrypted = await securityManager.encrypt(originalData)

      const isValid = await securityManager.verifyIntegrity(
        originalData,
        encrypted,
      )
      expect(isValid).toBe(true)

      const isInvalid = await securityManager.verifyIntegrity(
        originalData,
        'tampered data',
      )
      expect(isInvalid).toBe(false)
    })
  })

  describe('配置管理', () => {
    it('应该能够获取和更新配置', () => {
      const initialConfig = securityManager.getConfig()
      expect(initialConfig).toBeDefined()

      securityManager.updateConfig({
        encryption: { enabled: false },
      })

      const updatedConfig = securityManager.getConfig()
      expect(updatedConfig.encryption.enabled).toBe(false)
    })

    it('应该能够检查安全功能可用性', () => {
      const availability = securityManager.isSecurityAvailable()

      expect(availability).toHaveProperty('encryption')
      expect(availability).toHaveProperty('obfuscation')
      expect(availability).toHaveProperty('webCrypto')
      expect(typeof availability.encryption).toBe('boolean')
      expect(typeof availability.obfuscation).toBe('boolean')
      expect(typeof availability.webCrypto).toBe('boolean')
    })
  })
})
