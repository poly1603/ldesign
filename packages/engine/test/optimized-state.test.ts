/**
 * Optimized State System Tests
 * 
 * 测试优化后的状态系统功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createOptimizedStateSystem } from '../src/state/optimized-state-system'

describe('Optimized State System', () => {
  let stateSystem: ReturnType<typeof createOptimizedStateSystem>
  
  beforeEach(() => {
    stateSystem = createOptimizedStateSystem({
      shardSize: 100,
      compressionThreshold: 50
    })
  })
  
  describe('State Sharding', () => {
    it('should automatically shard large state', async () => {
      // 添加大量状态数据
      const largeData: Record<string, unknown> = {}
      for (let i = 0; i < 200; i++) {
        largeData[`key_${i}`] = {
          id: i,
          data: `value_${i}`.repeat(10)
        }
      }
      
      await stateSystem.set('large', largeData)
      const retrieved = await stateSystem.get('large')
      
      expect(retrieved).toEqual(largeData)
      
      // 验证分片数量
      const stats = stateSystem.getShardStats()
      expect(stats.shardCount).toBeGreaterThan(1)
    })
    
    it('should handle cross-shard queries efficiently', async () => {
      // 设置跨多个分片的数据
      for (let i = 0; i < 150; i++) {
        await stateSystem.set(`item_${i}`, {
          id: i,
          category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'
        })
      }
      
      // 执行 GraphQL 风格查询
      const result = await stateSystem.query({
        query: `{
          id
          category
        } where: { category: "A" } orderBy: id_ASC limit: 10`
      })
      
      expect(result).toHaveLength(10)
      expect(result[0].category).toBe('A')
      expect(result[0].id).toBeLessThan(result[9].id)
    })
  })
  
  describe('State Compression', () => {
    it('should compress large state values', async () => {
      const largeString = 'This is a test string that will be repeated many times. '.repeat(100)
      const key = 'compressed-data'
      
      await stateSystem.set(key, largeString)
      
      // 验证数据被压缩
      const stats = stateSystem.getShardStats()
      expect(stats.compressedShards).toBeGreaterThan(0)
      
      // 验证数据可以正确解压
      const retrieved = await stateSystem.get(key)
      expect(retrieved).toBe(largeString)
    })
    
    it('should support multiple compression algorithms', async () => {
      const testData = { test: 'data'.repeat(50) }
      
      // 测试不同的压缩算法
      const algorithms = ['gzip', 'brotli', 'lz4', 'zstd'] as const
      
      for (const algorithm of algorithms) {
        const system = createOptimizedStateSystem({
          compressionAlgorithm: algorithm
        })
        
        await system.set('test', testData)
        const retrieved = await system.get('test')
        
        expect(retrieved).toEqual(testData)
      }
    })
  })
  
  describe('State Migration', () => {
    it('should handle version migrations', async () => {
      // 注册迁移
      stateSystem.registerMigration({
        version: '1.0.0',
        description: 'Initial version',
        up: async (state) => {
          // 升级逻辑
          for (const key in state) {
            if (state[key].oldField) {
              state[key].newField = state[key].oldField
              delete state[key].oldField
            }
          }
          return state
        },
        down: async (state) => {
          // 降级逻辑
          for (const key in state) {
            if (state[key].newField) {
              state[key].oldField = state[key].newField
              delete state[key].newField
            }
          }
          return state
        }
      })
      
      stateSystem.registerMigration({
        version: '2.0.0',
        description: 'Add metadata',
        up: async (state) => {
          for (const key in state) {
            state[key]._metadata = {
              version: '2.0.0',
              migrated: true
            }
          }
          return state
        },
        down: async (state) => {
          for (const key in state) {
            delete state[key]._metadata
          }
          return state
        }
      })
      
      // 设置初始状态
      await stateSystem.set('user', { oldField: 'value' })
      
      // 执行迁移到 2.0.0
      await stateSystem.migrate('2.0.0')
      
      const user = await stateSystem.get('user')
      expect(user).toHaveProperty('newField', 'value')
      expect(user).toHaveProperty('_metadata')
      expect(user._metadata.version).toBe('2.0.0')
      expect(user).not.toHaveProperty('oldField')
      
      // 回滚到 1.0.0
      await stateSystem.migrate('1.0.0')
      
      const rolledBack = await stateSystem.get('user')
      expect(rolledBack).toHaveProperty('oldField', 'value')
      expect(rolledBack).not.toHaveProperty('newField')
      expect(rolledBack).not.toHaveProperty('_metadata')
    })
    
    it('should create migration snapshots', async () => {
      await stateSystem.set('test', { value: 'original' })
      
      const snapshot = await stateSystem.createMigrationSnapshot()
      
      expect(snapshot).toHaveProperty('version')
      expect(snapshot).toHaveProperty('state')
      expect(snapshot).toHaveProperty('timestamp')
      expect(snapshot.state.test).toEqual({ value: 'original' })
    })
  })
  
  describe('GraphQL-style Queries', () => {
    beforeEach(async () => {
      // 设置测试数据
      const users = [
        { id: 1, name: 'Alice', age: 25, role: 'admin' },
        { id: 2, name: 'Bob', age: 30, role: 'user' },
        { id: 3, name: 'Charlie', age: 35, role: 'admin' },
        { id: 4, name: 'David', age: 28, role: 'user' },
        { id: 5, name: 'Eve', age: 32, role: 'moderator' }
      ]
      
      for (const user of users) {
        await stateSystem.set(`user_${user.id}`, user)
      }
    })
    
    it('should support field selection', async () => {
      const result = await stateSystem.query({
        query: `{
          id
          name
        }`
      })
      
      expect(result.length).toBeGreaterThan(0)
      result.forEach(item => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).not.toHaveProperty('age')
        expect(item).not.toHaveProperty('role')
      })
    })
    
    it('should support filtering', async () => {
      const result = await stateSystem.query({
        query: `{
          id
          name
          role
        } where: { role: "admin" }`
      })
      
      expect(result.length).toBe(2)
      result.forEach(item => {
        expect(item.role).toBe('admin')
      })
    })
    
    it('should support sorting', async () => {
      const result = await stateSystem.query({
        query: `{
          name
          age
        } orderBy: age_DESC`
      })
      
      expect(result[0].age).toBeGreaterThan(result[result.length - 1].age)
    })
    
    it('should support limiting results', async () => {
      const result = await stateSystem.query({
        query: `{
          id
          name
        } limit: 2`
      })
      
      expect(result.length).toBe(2)
    })
    
    it('should support variables in queries', async () => {
      const result = await stateSystem.query({
        query: `{
          id
          name
          role
        } where: { role: $roleFilter }`,
        variables: {
          roleFilter: 'user'
        }
      })
      
      expect(result.length).toBe(2)
      result.forEach(item => {
        expect(item.role).toBe('user')
      })
    })
  })
  
  describe('Performance Optimizations', () => {
    it('should handle concurrent operations efficiently', async () => {
      const operations = Array(100).fill(null).map((_, i) => 
        stateSystem.set(`concurrent_${i}`, { value: i })
      )
      
      await Promise.all(operations)
      
      // 验证所有数据都被正确存储
      for (let i = 0; i < 100; i++) {
        const value = await stateSystem.get(`concurrent_${i}`)
        expect(value).toEqual({ value: i })
      }
    })
    
    it('should optimize memory usage with compression', async () => {
      const largeArray = Array(1000).fill(null).map((_, i) => ({
        id: i,
        data: 'x'.repeat(100)
      }))
      
      await stateSystem.set('large_array', largeArray)
      
      const stats = stateSystem.getShardStats()
      expect(stats.compressedShards).toBeGreaterThan(0)
      expect(stats.compressionRatio).toBeLessThan(0.5) // 压缩率应该小于50%
    })
    
    it('should provide efficient bulk operations', async () => {
      const bulkData: Record<string, unknown> = {}
      for (let i = 0; i < 500; i++) {
        bulkData[`bulk_${i}`] = { id: i, value: `value_${i}` }
      }
      
      // 批量设置
      await stateSystem.bulkSet(bulkData)
      
      // 批量获取
      const keys = Object.keys(bulkData)
      const retrieved = await stateSystem.bulkGet(keys)
      
      expect(retrieved).toEqual(bulkData)
    })
  })
})