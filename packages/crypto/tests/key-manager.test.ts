import type { KeyPermission } from '../src/core/key-manager'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { KeyManager } from '../src/core/key-manager'

describe('密钥管理系统', () => {
  let keyManager: KeyManager
  const testPassword = 'TestMasterPassword123!'

  beforeEach(() => {
    keyManager = new KeyManager({
      type: 'memory',
      encrypted: true,
      kdfAlgorithm: 'pbkdf2', // 使用更快的算法进行测试
      autoRotation: false,
    })
  })

  afterEach(() => {
    keyManager.destroy()
  })

  describe('主密钥管理', () => {
    it('应该初始化主密钥', async () => {
      await keyManager.initializeMasterKey(testPassword)
      // 初始化后应该能够生成密钥
      const keyId = await keyManager.generateKey({
        name: 'test-key',
        algorithm: 'AES',
        purpose: 'encryption',
      })
      expect(keyId).toBeTruthy()
      expect(keyId).toMatch(/^key_/)
    })
  })

  describe('密钥生成', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
    })

    it('应该生成 AES 密钥', async () => {
      const keyId = await keyManager.generateKey({
        name: 'aes-test',
        algorithm: 'AES',
        purpose: 'encryption',
        keySize: 256,
        tags: ['test', 'aes'],
      })

      expect(keyId).toBeTruthy()

      const keys = keyManager.listKeys()
      expect(keys).toHaveLength(1)
      expect(keys[0].name).toBe('aes-test')
      expect(keys[0].algorithm).toBe('AES')
    })

    it('应该生成 RSA 密钥', async () => {
      const keyId = await keyManager.generateKey({
        name: 'rsa-test',
        algorithm: 'RSA',
        purpose: 'signing',
        keySize: 2048,
      })

      expect(keyId).toBeTruthy()

      const key = await keyManager.getKey(keyId)
      expect(key).toBeTruthy()
    })

    it('应该生成带过期时间的密钥', async () => {
      const expires = new Date(Date.now() + 3600000) // 1小时后
      const _keyId = await keyManager.generateKey({
        name: 'expiring-key',
        algorithm: 'AES',
        purpose: 'encryption',
        expires,
      })

      const keys = keyManager.listKeys()
      expect(keys[0].expires).toEqual(expires)
    })

    it('应该生成带权限的密钥', async () => {
      const permissions: KeyPermission[] = [
        { operation: 'encrypt', allowed: true },
        { operation: 'decrypt', allowed: false },
      ]

      const keyId = await keyManager.generateKey({
        name: 'restricted-key',
        algorithm: 'AES',
        purpose: 'encryption',
        permissions,
      })

      // 应该允许加密
      const keyForEncrypt = await keyManager.getKey(keyId, 'encrypt')
      expect(keyForEncrypt).toBeTruthy()

      // 应该拒绝解密
      await expect(
        keyManager.getKey(keyId, 'decrypt'),
      ).rejects.toThrow(/not allowed/)
    })
  })

  describe('密钥获取', () => {
    let keyId: string

    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
      keyId = await keyManager.generateKey({
        name: 'test-key',
        algorithm: 'AES',
        purpose: 'encryption',
      })
    })

    it('应该获取存在的密钥', async () => {
      const key = await keyManager.getKey(keyId)
      expect(key).toBeTruthy()
      expect(typeof key).toBe('string')
    })

    it('应该返回 null 对于不存在的密钥', async () => {
      const key = await keyManager.getKey('non-existent')
      expect(key).toBeNull()
    })

    it('应该拒绝获取过期的密钥', async () => {
      const expires = new Date(Date.now() - 1000) // 已过期
      const expiredKeyId = await keyManager.generateKey({
        name: 'expired-key',
        algorithm: 'AES',
        purpose: 'encryption',
        expires,
      })

      await expect(
        keyManager.getKey(expiredKeyId),
      ).rejects.toThrow(/expired/)
    })
  })

  describe('密钥轮换', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
    })

    it('应该轮换密钥', async () => {
      const oldKeyId = await keyManager.generateKey({
        name: 'rotate-test',
        algorithm: 'AES',
        purpose: 'encryption',
      })

      const newKeyId = await keyManager.rotateKey(oldKeyId)

      expect(newKeyId).toBeTruthy()
      expect(newKeyId).not.toBe(oldKeyId)

      const keys = keyManager.listKeys()
      const newKey = keys.find(k => k.id === newKeyId)
      expect(newKey?.version).toBe(2)
      expect(newKey?.rotated).toBeTruthy()
    })

    it('应该保留旧密钥的元数据', async () => {
      const oldKeyId = await keyManager.generateKey({
        name: 'rotate-metadata',
        algorithm: 'AES',
        purpose: 'encryption',
        tags: ['important'],
      })

      const newKeyId = await keyManager.rotateKey(oldKeyId)

      const keys = keyManager.listKeys()
      const newKey = keys.find(k => k.id === newKeyId)
      expect(newKey?.name).toBe('rotate-metadata')
      expect(newKey?.tags).toContain('important')
    })
  })

  describe('密钥删除', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
    })

    it('应该删除密钥', async () => {
      const keyId = await keyManager.generateKey({
        name: 'delete-test',
        algorithm: 'AES',
        purpose: 'encryption',
      })

      const deleted = await keyManager.deleteKey(keyId)
      expect(deleted).toBe(true)

      const key = await keyManager.getKey(keyId)
      expect(key).toBeNull()
    })

    it('应该返回 false 对于不存在的密钥', async () => {
      const deleted = await keyManager.deleteKey('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('密钥列表和过滤', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)

      // 创建多个测试密钥
      await keyManager.generateKey({
        name: 'aes-encrypt',
        algorithm: 'AES',
        purpose: 'encryption',
        tags: ['production'],
      })

      await keyManager.generateKey({
        name: 'rsa-sign',
        algorithm: 'RSA',
        purpose: 'signing',
        tags: ['test'],
      })

      await keyManager.generateKey({
        name: 'aes-auth',
        algorithm: 'AES',
        purpose: 'authentication',
        tags: ['production', 'critical'],
      })
    })

    it('应该列出所有密钥', () => {
      const keys = keyManager.listKeys()
      expect(keys).toHaveLength(3)
    })

    it('应该按 purpose 过滤', () => {
      const encryptionKeys = keyManager.listKeys({ purpose: 'encryption' })
      expect(encryptionKeys).toHaveLength(1)
      expect(encryptionKeys[0].name).toBe('aes-encrypt')
    })

    it('应该按算法过滤', () => {
      const aesKeys = keyManager.listKeys({ algorithm: 'AES' })
      expect(aesKeys).toHaveLength(2)
    })

    it('应该按标签过滤', () => {
      const productionKeys = keyManager.listKeys({ tags: ['production'] })
      expect(productionKeys).toHaveLength(2)

      const criticalKeys = keyManager.listKeys({ tags: ['production', 'critical'] })
      expect(criticalKeys).toHaveLength(1)
      expect(criticalKeys[0].name).toBe('aes-auth')
    })

    it('应该过滤过期密钥', async () => {
      const expires = new Date(Date.now() - 1000)
      await keyManager.generateKey({
        name: 'expired',
        algorithm: 'AES',
        purpose: 'encryption',
        expires,
      })

      const activeKeys = keyManager.listKeys()
      expect(activeKeys).toHaveLength(3) // 不包括过期的

      const allKeys = keyManager.listKeys({ includeExpired: true })
      expect(allKeys).toHaveLength(4) // 包括过期的
    })
  })

  describe('密钥导入导出', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
    })

    it('应该导出原始格式密钥', async () => {
      const keyId = await keyManager.generateKey({
        name: 'export-test',
        algorithm: 'AES',
        purpose: 'encryption',
      })

      const exported = await keyManager.exportKey(keyId, 'raw')
      expect(exported).toBeTruthy()
      expect(typeof exported).toBe('string')
    })

    it('应该导出 JWK 格式密钥', async () => {
      const keyId = await keyManager.generateKey({
        name: 'jwk-test',
        algorithm: 'AES',
        purpose: 'encryption',
      })

      const exported = await keyManager.exportKey(keyId, 'jwk')
      const jwk = JSON.parse(exported)
      expect(jwk.kty).toBe('oct')
      expect(jwk.kid).toBe(keyId)
      expect(jwk.use).toBe('enc')
    })

    it('应该导出 PEM 格式密钥', async () => {
      const keyId = await keyManager.generateKey({
        name: 'pem-test',
        algorithm: 'RSA',
        purpose: 'signing',
      })

      const exported = await keyManager.exportKey(keyId, 'pem')
      expect(exported).toContain('-----BEGIN')
      expect(exported).toContain('-----END')
    })

    it('应该导入原始格式密钥', async () => {
      const rawKey = 'test-key-material'
      const keyId = await keyManager.importKey(rawKey, 'raw', {
        name: 'imported',
        algorithm: 'AES',
        purpose: 'encryption',
        tags: [],
        permissions: [],
      })

      expect(keyId).toBeTruthy()
      const key = await keyManager.getKey(keyId)
      expect(key).toBe(rawKey)
    })
  })

  describe('备份和恢复', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
    })

    it('应该备份所有密钥', async () => {
      // 创建一些密钥
      await keyManager.generateKey({
        name: 'key1',
        algorithm: 'AES',
        purpose: 'encryption',
      })

      await keyManager.generateKey({
        name: 'key2',
        algorithm: 'RSA',
        purpose: 'signing',
      })

      const backup = await keyManager.backup()
      const parsed = JSON.parse(backup)

      expect(parsed.version).toBe('1.0')
      expect(parsed.keys).toHaveLength(2)
    })

    it('应该备份和恢复密钥', async () => {
      // 创建密钥
      const _keyId = await keyManager.generateKey({
        name: 'backup-test',
        algorithm: 'AES',
        purpose: 'encryption',
        tags: ['important'],
      })

      // 备份
      const backup = await keyManager.backup()

      // 创建新的管理器
      const newManager = new KeyManager({ type: 'memory' })
      await newManager.initializeMasterKey(testPassword)

      // 恢复
      const restored = await newManager.restore(backup)
      expect(restored).toBe(1)

      // 验证密钥
      const keys = newManager.listKeys()
      expect(keys).toHaveLength(1)
      expect(keys[0].name).toBe('backup-test')
      expect(keys[0].tags).toContain('important')

      newManager.destroy()
    })

    it('应该使用密码加密备份', async () => {
      await keyManager.generateKey({
        name: 'encrypted-backup',
        algorithm: 'AES',
        purpose: 'encryption',
      })

      const backupPassword = 'BackupPassword123!'
      const encrypted = await keyManager.backup(backupPassword)

      // 不应该是明文 JSON
      expect(() => JSON.parse(encrypted)).toThrow()

      // 应该能够用密码恢复 - 使用同一个manager实例
      // 先清空当前密钥
      const keyIds = keyManager.listKeys().map(k => k.id)
      for (const keyId of keyIds) {
        await keyManager.deleteKey(keyId)
      }

      const restored = await keyManager.restore(encrypted, backupPassword)
      expect(restored).toBe(1)

      // 验证密钥已恢复
      const restoredKeys = keyManager.listKeys()
      expect(restoredKeys).toHaveLength(1)
      expect(restoredKeys[0].name).toBe('encrypted-backup')
    })
  })

  describe('过期密钥清理', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
    })

    it('应该清理过期密钥', async () => {
      // 创建过期密钥
      await keyManager.generateKey({
        name: 'expired1',
        algorithm: 'AES',
        purpose: 'encryption',
        expires: new Date(Date.now() - 1000),
      })

      await keyManager.generateKey({
        name: 'expired2',
        algorithm: 'AES',
        purpose: 'encryption',
        expires: new Date(Date.now() - 2000),
      })

      // 创建有效密钥
      await keyManager.generateKey({
        name: 'valid',
        algorithm: 'AES',
        purpose: 'encryption',
        expires: new Date(Date.now() + 3600000),
      })

      const cleaned = keyManager.cleanupExpiredKeys()
      expect(cleaned).toBe(2)

      const remaining = keyManager.listKeys({ includeExpired: true })
      expect(remaining).toHaveLength(1)
      expect(remaining[0].name).toBe('valid')
    })
  })

  describe('密钥权限管理', () => {
    beforeEach(async () => {
      await keyManager.initializeMasterKey(testPassword)
    })

    it('应该检查时间窗口权限', async () => {
      const now = new Date()
      const permissions: KeyPermission[] = [
        {
          operation: 'encrypt',
          allowed: true,
          conditions: {
            timeWindow: {
              start: new Date(now.getTime() - 3600000), // 1小时前
              end: new Date(now.getTime() + 3600000), // 1小时后
            },
          },
        },
      ]

      const keyId = await keyManager.generateKey({
        name: 'time-restricted',
        algorithm: 'AES',
        purpose: 'encryption',
        permissions,
      })

      // 在时间窗口内应该允许
      const key = await keyManager.getKey(keyId, 'encrypt')
      expect(key).toBeTruthy()
    })

    it('应该拒绝时间窗口外的操作', async () => {
      const permissions: KeyPermission[] = [
        {
          operation: 'encrypt',
          allowed: true,
          conditions: {
            timeWindow: {
              start: new Date(Date.now() - 7200000), // 2小时前
              end: new Date(Date.now() - 3600000), // 1小时前
            },
          },
        },
      ]

      const keyId = await keyManager.generateKey({
        name: 'expired-window',
        algorithm: 'AES',
        purpose: 'encryption',
        permissions,
      })

      // 时间窗口外应该拒绝
      await expect(
        keyManager.getKey(keyId, 'encrypt'),
      ).rejects.toThrow(/not allowed/)
    })
  })
})
