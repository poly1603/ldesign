/**
 * ID 生成器测试
 */

import { describe, it, expect } from 'vitest'
import {
  generateId,
  generateUUID,
  generateShortId,
  generateNumericId,
  generateTimestampId,
} from '../../src/utils/id-generator'

describe('ID 生成器', () => {
  describe('generateId', () => {
    it('应该生成带前缀的 ID', () => {
      const id = generateId('test')
      expect(id).toMatch(/^test-/)
      expect(id.length).toBeGreaterThan(5)
    })

    it('应该生成唯一的 ID', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')
      expect(id1).not.toBe(id2)
    })

    it('应该处理空前缀', () => {
      const id = generateId('')
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('generateUUID', () => {
    it('应该生成标准 UUID 格式', () => {
      const uuid = generateUUID()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('应该生成唯一的 UUID', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
    })

    it('应该生成正确长度的 UUID', () => {
      const uuid = generateUUID()
      expect(uuid.length).toBe(36) // 32 字符 + 4 个连字符
    })
  })

  describe('generateShortId', () => {
    it('应该生成短 ID', () => {
      const shortId = generateShortId()
      expect(typeof shortId).toBe('string')
      expect(shortId.length).toBeLessThan(20)
      expect(shortId.length).toBeGreaterThan(5)
    })

    it('应该生成唯一的短 ID', () => {
      const id1 = generateShortId()
      const id2 = generateShortId()
      expect(id1).not.toBe(id2)
    })

    it('应该只包含字母数字字符', () => {
      const shortId = generateShortId()
      expect(shortId).toMatch(/^[a-zA-Z0-9]+$/)
    })
  })

  describe('generateNumericId', () => {
    it('应该生成数字字符串 ID', () => {
      const numericId = generateNumericId()
      expect(typeof numericId).toBe('string')
      expect(numericId).toMatch(/^\d+$/) // 只包含数字字符
    })

    it('应该生成唯一的数字 ID', () => {
      const id1 = generateNumericId()
      const id2 = generateNumericId()
      expect(id1).not.toBe(id2)
    })

    it('应该生成指定长度的数字字符串', () => {
      const numericId = generateNumericId(8)
      expect(numericId.length).toBe(8)
      expect(numericId).toMatch(/^\d{8}$/)
    })

    it('应该生成默认长度的数字字符串', () => {
      const numericId = generateNumericId()
      expect(numericId.length).toBe(10) // 默认长度
      expect(numericId).toMatch(/^\d{10}$/)
    })
  })

  describe('generateTimestampId', () => {
    it('应该生成基于时间戳的 ID', () => {
      const timestampId = generateTimestampId()
      expect(typeof timestampId).toBe('string')
      expect(timestampId.length).toBeGreaterThan(10)
    })

    it('应该包含时间戳信息', () => {
      const before = Date.now()
      const timestampId = generateTimestampId()
      const after = Date.now()

      // 提取时间戳部分（假设格式为 timestamp-random）
      const timestampPart = timestampId.split('-')[0]
      const timestamp = parseInt(timestampPart, 10)

      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('应该生成唯一的时间戳 ID', () => {
      const id1 = generateTimestampId()
      const id2 = generateTimestampId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('性能测试', () => {
    it('应该快速生成大量 ID', () => {
      const start = Date.now()
      const ids = new Set()

      for (let i = 0; i < 1000; i++) {
        ids.add(generateId('perf'))
      }

      const end = Date.now()
      const duration = end - start

      expect(duration).toBeLessThan(1000) // 应该在 1 秒内完成
      expect(ids.size).toBe(1000) // 所有 ID 都应该是唯一的
    })

    it('应该快速生成大量 UUID', () => {
      const start = Date.now()
      const uuids = new Set()

      for (let i = 0; i < 1000; i++) {
        uuids.add(generateUUID())
      }

      const end = Date.now()
      const duration = end - start

      expect(duration).toBeLessThan(1000) // 应该在 1 秒内完成
      expect(uuids.size).toBe(1000) // 所有 UUID 都应该是唯一的
    })
  })

  describe('边界情况', () => {
    it('应该处理特殊字符前缀', () => {
      const specialPrefixes = ['test-123', 'test_456', 'test.789', 'test@abc']

      specialPrefixes.forEach(prefix => {
        const id = generateId(prefix)
        expect(id).toContain(prefix)
        expect(typeof id).toBe('string')
      })
    })

    it('应该处理长前缀', () => {
      const longPrefix = 'a'.repeat(100)
      const id = generateId(longPrefix)
      expect(id).toContain(longPrefix)
      expect(typeof id).toBe('string')
    })

    it('应该处理 Unicode 前缀', () => {
      const unicodePrefixes = ['测试', '🚀', '水印']

      unicodePrefixes.forEach(prefix => {
        const id = generateId(prefix)
        expect(id).toContain(prefix)
        expect(typeof id).toBe('string')
      })
    })
  })

  describe('碰撞测试', () => {
    it('UUID 应该有极低的碰撞概率', () => {
      const uuids = new Set()
      const count = 10000

      for (let i = 0; i < count; i++) {
        uuids.add(generateUUID())
      }

      expect(uuids.size).toBe(count)
    })

    it('短 ID 在合理数量下应该无碰撞', () => {
      const shortIds = new Set()
      const count = 1000

      for (let i = 0; i < count; i++) {
        shortIds.add(generateShortId())
      }

      expect(shortIds.size).toBe(count)
    })

    it('数字 ID 应该无碰撞', () => {
      const numericIds = new Set()
      const count = 1000

      for (let i = 0; i < count; i++) {
        numericIds.add(generateNumericId(12)) // 使用更长的长度减少碰撞
      }

      // 由于是随机生成，可能会有少量碰撞，但应该很少
      expect(numericIds.size).toBeGreaterThan(count * 0.95) // 至少 95% 唯一
    })
  })
})
