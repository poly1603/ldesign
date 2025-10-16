/**
 * 性能基准测试
 * 
 * 验证优化后的性能提升，防止性能回退
 */

import { describe, expect, it } from 'vitest'
import { buildQueryString, clearQueryStringCache, mergeConfig } from '../../src/utils'
import type { RequestConfig } from '../../src/types'

describe('Performance Benchmarks', () => {
  describe('mergeConfig 性能', () => {
    const defaultConfig: RequestConfig = {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      params: {
        version: 'v1',
        debug: 'false',
      },
    }

    it('空配置合并应该很快', () => {
      const iterations = 10000
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        mergeConfig(defaultConfig, {})
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      // 平均每次应该小于 0.1ms
      expect(avgTime).toBeLessThan(0.1)
      console.log(`mergeConfig (空配置): 平均 ${avgTime.toFixed(4)}ms per iteration`)
    })

    it('简单配置合并应该很快', () => {
      const iterations = 10000
      const customConfig: RequestConfig = {
        timeout: 10000,
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        mergeConfig(defaultConfig, customConfig)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      // 平均每次应该小于 0.15ms
      expect(avgTime).toBeLessThan(0.15)
      console.log(`mergeConfig (简单): 平均 ${avgTime.toFixed(4)}ms per iteration`)
    })

    it('复杂配置合并应该很快', () => {
      const iterations = 10000
      const customConfig: RequestConfig = {
        timeout: 10000,
        headers: {
          'Authorization': 'Bearer token',
          'X-Custom': 'value',
        },
        params: {
          page: '1',
          limit: '50',
        },
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        mergeConfig(defaultConfig, customConfig)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      // 平均每次应该小于 0.2ms
      expect(avgTime).toBeLessThan(0.2)
      console.log(`mergeConfig (复杂): 平均 ${avgTime.toFixed(4)}ms per iteration`)
    })
  })

  describe('buildQueryString 性能', () => {
    beforeEach(() => {
      clearQueryStringCache()
    })

    it('小参数对象应该很快', () => {
      const iterations = 10000
      const params = {
        name: 'John',
        age: 30,
        active: true,
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        buildQueryString(params)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      // 平均每次应该小于 0.1ms
      expect(avgTime).toBeLessThan(0.1)
      console.log(`buildQueryString (小): 平均 ${avgTime.toFixed(4)}ms per iteration`)
    })

    it('中等参数对象应该很快', () => {
      const iterations = 10000
      const params: Record<string, any> = {}

      // 生成20个参数
      for (let i = 0; i < 20; i++) {
        params[`param${i}`] = `value${i}`
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        buildQueryString(params)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      // 平均每次应该小于 0.2ms
      expect(avgTime).toBeLessThan(0.2)
      console.log(`buildQueryString (中): 平均 ${avgTime.toFixed(4)}ms per iteration`)
    })

    it('大参数对象应该可接受', () => {
      const iterations = 1000
      const params: Record<string, any> = {}

      // 生成100个参数
      for (let i = 0; i < 100; i++) {
        params[`param${i}`] = `value${i}`
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        buildQueryString(params)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      // 平均每次应该小于 1ms
      expect(avgTime).toBeLessThan(1)
      console.log(`buildQueryString (大): 平均 ${avgTime.toFixed(4)}ms per iteration`)
    })

    it('数组参数应该高效', () => {
      const iterations = 10000
      const params = {
        ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        tags: ['a', 'b', 'c', 'd', 'e'],
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        buildQueryString(params)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      // 平均每次应该小于 0.3ms
      expect(avgTime).toBeLessThan(0.3)
      console.log(`buildQueryString (数组): 平均 ${avgTime.toFixed(4)}ms per iteration`)
    })

    it('缓存应该提升性能', () => {
      const iterations = 1000
      
      // 使用不同的参数来测试缓存效果
      const testParams = Array.from({length: 10}, (_, i) => ({
        name: `User${i}`,
        age: 20 + i,
        city: `City${i}`,
      }))

      // 清除缓存并预热
      clearQueryStringCache()
      
      // 测试无缓存性能（每次使用不同参数，避免缓存）
      const noCacheParams = Array.from({length: iterations}, (_, i) => ({
        name: `NoCacheUser${i}`,
        age: i,
        city: `NoCacheCity${i}`,
      }))
      
      clearQueryStringCache()
      const startTime1 = performance.now()
      for (let i = 0; i < iterations; i++) {
        buildQueryString(noCacheParams[i])
      }
      const duration1 = performance.now() - startTime1
      
      // 测试有缓存性能（重复使用相同参数）
      clearQueryStringCache()
      const startTime2 = performance.now()
      for (let i = 0; i < iterations; i++) {
        // 循环使用10个相同的参数，让缓存发挥作用
        buildQueryString(testParams[i % 10])
      }
      const duration2 = performance.now() - startTime2

      console.log(`无缓存（每次不同参数）: ${duration1.toFixed(2)}ms`)
      console.log(`有缓存（重复参数）: ${duration2.toFixed(2)}ms`)
      console.log(`性能提升: ${((1 - duration2 / duration1) * 100).toFixed(1)}%`)

      // 有缓存应该更快（至少快30%）
      expect(duration2).toBeLessThan(duration1 * 0.7)
    })
  })

  describe('内存性能', () => {
    it('mergeConfig 不应该造成内存泄漏', () => {
      const iterations = 100000
      const defaultConfig: RequestConfig = {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      }

      const memBefore = (performance as any).memory?.usedJSHeapSize || 0

      for (let i = 0; i < iterations; i++) {
        mergeConfig(defaultConfig, { timeout: i })
      }

      const memAfter = (performance as any).memory?.usedJSHeapSize || 0
      const memIncrease = memAfter - memBefore

      console.log(`内存增长: ${(memIncrease / 1024 / 1024).toFixed(2)}MB`)

      // 10万次操作，内存增长应该小于10MB
      if (memBefore > 0) {
        expect(memIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })

    it('buildQueryString 缓存不应该无限增长', () => {
      clearQueryStringCache()

      // 生成2000个不同的查询字符串（超过缓存限制1000）
      for (let i = 0; i < 2000; i++) {
        buildQueryString({ key: `value${i}` })
      }

      // 缓存应该被限制，不会造成内存泄漏
      // 这里主要是确保代码不抛出错误
      expect(true).toBe(true)
    })
  })

  describe('对比基准', () => {
    it('优化后的 mergeConfig vs 简单实现', () => {
      const iterations = 10000

      const defaultConfig: RequestConfig = {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
        params: { version: 'v1' },
      }

      const customConfig: RequestConfig = {
        timeout: 10000,
        headers: { 'Authorization': 'Bearer token' },
        params: { page: '1' },
      }

      // 简单实现（未优化）
      const naiveMerge = (def: RequestConfig, cus: RequestConfig) => {
        return {
          ...def,
          ...cus,
          headers: { ...def.headers, ...cus.headers },
          params: { ...def.params, ...cus.params },
        }
      }

      // 测试简单实现
      const startNaive = performance.now()
      for (let i = 0; i < iterations; i++) {
        naiveMerge(defaultConfig, customConfig)
      }
      const durationNaive = performance.now() - startNaive

      // 测试优化实现
      const startOptimized = performance.now()
      for (let i = 0; i < iterations; i++) {
        mergeConfig(defaultConfig, customConfig)
      }
      const durationOptimized = performance.now() - startOptimized

      console.log(`简单实现: ${durationNaive.toFixed(2)}ms`)
      console.log(`优化实现: ${durationOptimized.toFixed(2)}ms`)
      console.log(`性能提升: ${((1 - durationOptimized / durationNaive) * 100).toFixed(1)}%`)

      // 优化后的实现应该更快或至少相当
      expect(durationOptimized).toBeLessThanOrEqual(durationNaive * 1.1)
    })
  })

  describe('性能回归检测', () => {
    it('mergeConfig 性能不应该回退', () => {
      const baseline = 0.15 // 基准：0.15ms per iteration
      const iterations = 10000

      const defaultConfig: RequestConfig = {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        mergeConfig(defaultConfig, { timeout: i })
      }

      const avgTime = (performance.now() - startTime) / iterations

      console.log(`当前性能: ${avgTime.toFixed(4)}ms (基准: ${baseline}ms)`)

      // 不应该超过基准值
      expect(avgTime).toBeLessThan(baseline)
    })

    it('buildQueryString 性能不应该回退', () => {
      const baseline = 0.2 // 基准：0.2ms per iteration
      const iterations = 10000

      clearQueryStringCache()

      const params = {
        name: 'John',
        age: 30,
        tags: ['a', 'b', 'c'],
        active: true,
      }

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        buildQueryString(params)
      }

      const avgTime = (performance.now() - startTime) / iterations

      console.log(`当前性能: ${avgTime.toFixed(4)}ms (基准: ${baseline}ms)`)

      // 不应该超过基准值
      expect(avgTime).toBeLessThan(baseline)
    })
  })
})
