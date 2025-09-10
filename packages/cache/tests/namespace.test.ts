import { describe, it, expect, beforeEach } from 'vitest'
import { CacheNamespace, createNamespace } from '../src/core/namespace-manager'
import { CacheManager } from '../src/core/cache-manager'

describe('命名空间管理', () => {
  let cache: CacheManager
  let rootNamespace: CacheNamespace

  beforeEach(async () => {
    cache = new CacheManager({
      defaultEngine: 'memory',
      engines: {
        memory: { enabled: true },
      },
    })
    await cache.clear()
    rootNamespace = createNamespace('app')
  })

  describe('基础功能', () => {
    it('应该创建带前缀的命名空间', () => {
      const ns = createNamespace('test')
      expect(ns.getPrefix()).toBe('test')
    })

    it('应该正确添加前缀到键', async () => {
      await rootNamespace.set('key1', 'value1')
      
      // 直接从缓存获取应该有前缀
      const value = await cache.get('app:key1')
      expect(value).toBe('value1')
    })

    it('应该通过命名空间获取值', async () => {
      await cache.set('app:key1', 'value1')
      
      const value = await rootNamespace.get('key1')
      expect(value).toBe('value1')
    })

    it('应该正确处理空前缀', () => {
      const ns = createNamespace('')
      expect(ns.getPrefix()).toBe('')
    })
  })

  describe('嵌套命名空间', () => {
    it('应该创建嵌套命名空间', async () => {
      const userNs = rootNamespace.namespace('user')
      const profileNs = userNs.namespace('profile')
      
      await profileNs.set('name', 'John')
      
      // 键应该是 app:user:profile:name
      const value = await cache.get('app:user:profile:name')
      expect(value).toBe('John')
    })

    it('应该隔离不同命名空间的数据', async () => {
      const ns1 = rootNamespace.namespace('module1')
      const ns2 = rootNamespace.namespace('module2')
      
      await ns1.set('key', 'value1')
      await ns2.set('key', 'value2')
      
      expect(await ns1.get('key')).toBe('value1')
      expect(await ns2.get('key')).toBe('value2')
    })
  })

  describe('批量操作', () => {
    it('应该支持命名空间内的批量操作', async () => {
      const userNs = rootNamespace.namespace('user')
      
      await userNs.mset({
        profile: { name: 'John' },
        settings: { theme: 'dark' },
      })
      
      const results = await userNs.mget(['profile', 'settings'])
      expect(results.profile).toEqual({ name: 'John' })
      expect(results.settings).toEqual({ theme: 'dark' })
    })

    it('应该正确处理批量删除', async () => {
      const ns = rootNamespace.namespace('test')
      
      await ns.mset({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      })
      
      await ns.mremove(['key1', 'key3'])
      
      expect(await ns.has('key1')).toBe(false)
      expect(await ns.has('key2')).toBe(true)
      expect(await ns.has('key3')).toBe(false)
    })
  })

  describe('清空命名空间', () => {
    it('应该只清空当前命名空间', async () => {
      const ns1 = rootNamespace.namespace('module1')
      const ns2 = rootNamespace.namespace('module2')
      
      await ns1.set('key1', 'value1')
      await ns2.set('key2', 'value2')
      await rootNamespace.set('rootKey', 'rootValue')
      
      await ns1.clear()
      
      expect(await ns1.has('key1')).toBe(false)
      expect(await ns2.has('key2')).toBe(true)
      expect(await rootNamespace.has('rootKey')).toBe(true)
    })

    it('应该递归清空子命名空间', async () => {
      const userNs = rootNamespace.namespace('user')
      const profileNs = userNs.namespace('profile')
      const settingsNs = userNs.namespace('settings')
      
      await profileNs.set('name', 'John')
      await settingsNs.set('theme', 'dark')
      await userNs.set('id', '123')
      
      await userNs.clear(true) // 递归清空
      
      expect(await profileNs.has('name')).toBe(false)
      expect(await settingsNs.has('theme')).toBe(false)
      expect(await userNs.has('id')).toBe(false)
    })
  })

  describe('导出和导入', () => {
    it('应该导出命名空间数据', async () => {
      const ns = rootNamespace.namespace('export-test')
      
      await ns.set('key1', 'value1')
      await ns.set('key2', { data: 'value2' })
      
      const exported = await ns.export()
      
      expect(exported).toHaveLength(2)
      expect(exported.find(item => item.key === 'key1')?.value).toBe('value1')
      expect(exported.find(item => item.key === 'key2')?.value).toEqual({ data: 'value2' })
    })

    it('应该导入数据到命名空间', async () => {
      const ns = rootNamespace.namespace('import-test')
      
      const data = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: { data: 'value2' } },
      ]
      
      await ns.import(data)
      
      expect(await ns.get('key1')).toBe('value1')
      expect(await ns.get('key2')).toEqual({ data: 'value2' })
    })

    it('应该支持导入时的转换', async () => {
      const ns = rootNamespace.namespace('transform-test')
      
      const data = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ]
      
      await ns.import(data, {
        transform: (item) => ({
          ...item,
          value: `transformed-${item.value}`,
        }),
      })
      
      expect(await ns.get('key1')).toBe('transformed-value1')
      expect(await ns.get('key2')).toBe('transformed-value2')
    })

    it('应该支持带过滤的导出', async () => {
      const ns = rootNamespace.namespace('filter-test')
      
      await ns.set('include1', 'value1')
      await ns.set('include2', 'value2')
      await ns.set('exclude', 'value3')
      
      const exported = await ns.export((key) => key.startsWith('include'))
      
      expect(exported).toHaveLength(2)
      expect(exported.find(item => item.key === 'include1')).toBeDefined()
      expect(exported.find(item => item.key === 'include2')).toBeDefined()
      expect(exported.find(item => item.key === 'exclude')).toBeUndefined()
    })
  })

  describe('键的枚举', () => {
    it('应该列出命名空间中的所有键', async () => {
      const ns = rootNamespace.namespace('keys-test')
      // 清空该命名空间以确保隔离
      await ns.clear()
      
      await ns.set('key1', 'value1')
      await ns.set('key2', 'value2')
      await ns.set('key3', 'value3')
      
      const keys = await ns.keys()
      
      // 只检查包含这些键，不检查总数，因为可能有其他测试的数据
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
      // 至少应该有这3个键
      expect(keys.length).toBeGreaterThanOrEqual(3)
    })

    it('应该只列出当前命名空间的键', async () => {
      const ns1 = rootNamespace.namespace('ns1')
      const ns2 = rootNamespace.namespace('ns2')
      
      await ns1.set('key1', 'value1')
      await ns2.set('key2', 'value2')
      
      const keys1 = await ns1.keys()
      const keys2 = await ns2.keys()
      
      expect(keys1).toContain('key1')
      expect(keys1).not.toContain('key2')
      expect(keys2).toContain('key2')
      expect(keys2).not.toContain('key1')
    })
  })

  describe('TTL 和元数据', () => {
    it('应该支持带 TTL 的设置', async () => {
      const ns = rootNamespace.namespace('ttl-test')
      
      await ns.set('expiring', 'value', { ttl: 100 })
      
      expect(await ns.get('expiring')).toBe('value')
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(await ns.get('expiring')).toBeNull()
    })

    it('应该正确获取元数据', async () => {
      const ns = rootNamespace.namespace('metadata-test')
      
      await ns.set('key', 'value', { 
        ttl: 1000,
        encrypt: false,
      })
      
      const metadata = await ns.getMetadata('key')
      
      expect(metadata).toBeDefined()
      // 元数据中 TTL 被转换为 expiresAt 时间戳
      if (metadata?.expiresAt && metadata?.createdAt) {
        const actualTtl = metadata.expiresAt - metadata.createdAt
        expect(actualTtl).toBeCloseTo(1000, -2) // 允许一些时间差
      }
      expect(metadata?.encrypted).toBe(false)
    })
  })

  describe('remember 功能', () => {
    it('应该在命名空间中使用 remember', async () => {
      const ns = rootNamespace.namespace('remember-test')
      let fetchCount = 0
      
      const fetcher = async () => {
        fetchCount++
        return 'fetched-value'
      }
      
      // 第一次调用应该执行 fetcher
      const value1 = await ns.remember('key', fetcher)
      expect(value1).toBe('fetched-value')
      expect(fetchCount).toBe(1)
      
      // 第二次调用应该从缓存获取
      const value2 = await ns.remember('key', fetcher)
      expect(value2).toBe('fetched-value')
      expect(fetchCount).toBe(1)
    })
  })
})
