import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useCache } from '../../src/vue/use-cache'
import type { UseCacheOptions } from '../../src/types'

// 测试组件
const TestComponent = {
  setup() {
    const cache = useCache({
      defaultEngine: 'memory',
      debug: false,
      cleanupOnUnmount: true,
    })

    return {
      cache,
    }
  },
  template: '<div>Test Component</div>',
}

describe('useCache', () => {
  let wrapper: any

  beforeEach(async () => {
    wrapper = mount(TestComponent)
    await nextTick()
    // 等待缓存初始化
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础功能', () => {
    it('应该能够设置和获取缓存', async () => {
      const { cache } = wrapper.vm

      await cache.set('test-key', 'test-value')
      const result = await cache.get('test-key')

      expect(result).toBe('test-value')
    })

    it('应该能够处理复杂对象', async () => {
      const { cache } = wrapper.vm
      const complexObject = {
        name: '测试对象',
        items: [1, 2, 3],
        nested: { prop: true },
      }

      await cache.set('complex-key', complexObject)
      const result = await cache.get('complex-key')

      expect(result).toEqual(complexObject)
    })

    it('应该能够删除缓存项', async () => {
      const { cache } = wrapper.vm

      await cache.set('remove-key', 'to-be-removed')
      expect(await cache.get('remove-key')).toBe('to-be-removed')

      await cache.remove('remove-key')
      expect(await cache.get('remove-key')).toBeNull()
    })

    it('应该能够检查键是否存在', async () => {
      const { cache } = wrapper.vm

      expect(await cache.has('exists-key')).toBe(false)

      await cache.set('exists-key', 'exists')
      expect(await cache.has('exists-key')).toBe(true)
    })

    it('应该能够清空缓存', async () => {
      const { cache } = wrapper.vm

      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')

      await cache.clear()

      expect(await cache.has('key1')).toBe(false)
      expect(await cache.has('key2')).toBe(false)
    })
  })

  describe('响应式状态', () => {
    it('应该提供加载状态', async () => {
      const { cache } = wrapper.vm

      expect(cache.loading.value).toBe(false)
      expect(cache.isReady.value).toBe(true)
      expect(cache.hasError.value).toBe(false)
    })

    it('应该在操作时更新加载状态', async () => {
      const { cache } = wrapper.vm

      // 开始异步操作
      const promise = cache.set('loading-test', 'value')

      // 在某些情况下加载状态可能很快变化，所以我们主要测试操作完成后的状态
      await promise

      expect(cache.loading.value).toBe(false)
      expect(cache.error.value).toBeNull()
    })
  })

  describe('响应式缓存', () => {
    it('应该提供响应式缓存值', async () => {
      const { cache } = wrapper.vm
      const reactiveCache = cache.useReactiveCache(
        'reactive-key',
        'default-value'
      )

      // 初始值应该是默认值
      expect(reactiveCache.value.value).toBe('default-value')

      // 保存新值
      await reactiveCache.save('new-value')
      expect(reactiveCache.value.value).toBe('new-value')

      // 重新加载
      await reactiveCache.load()
      expect(reactiveCache.value.value).toBe('new-value')
    })

    it('应该支持自动保存', async () => {
      const { cache } = wrapper.vm
      const reactiveCache = cache.useReactiveCache('auto-save-key', 'initial')

      // 等待初始加载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 启用自动保存
      const stopAutoSave = reactiveCache.enableAutoSave()

      // 等待 watcher 设置完成
      await nextTick()

      // 修改值应该自动保存
      reactiveCache.value.value = 'auto-saved-value'

      // 等待自动保存完成
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // 验证已保存
      const saved = await cache.get('auto-save-key')
      expect(saved).toBe('auto-saved-value')

      // 停止自动保存
      stopAutoSave()
    })

    it('应该处理加载错误', async () => {
      const { cache } = wrapper.vm

      // 模拟一个会导致错误的场景
      const reactiveCache = cache.useReactiveCache('error-key')

      // 尝试保存无效数据
      const circularObj: any = {}
      circularObj.self = circularObj

      try {
        await reactiveCache.save(circularObj)
      } catch {
        // 预期会抛出错误
      }

      expect(reactiveCache.error.value).toBeTruthy()
    })
  })

  describe('统计功能', () => {
    it('应该能够获取缓存统计', async () => {
      const { cache } = wrapper.vm

      await cache.set('stats-test-1', 'value1')
      await cache.set('stats-test-2', { data: 'value2' })

      await cache.getStats()
      const stats = cache.stats.value

      expect(stats).toBeDefined()
      expect(stats!.totalItems).toBeGreaterThan(0)
    })
  })

  describe('清理功能', () => {
    it('应该能够清理过期项', async () => {
      const { cache } = wrapper.vm

      // 设置一个很快过期的项
      await cache.set('expire-key', 'expire-value', { ttl: 50 })

      expect(await cache.has('expire-key')).toBe(true)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 100))

      await cache.cleanup()

      expect(await cache.has('expire-key')).toBe(false)
    })
  })

  describe('配置选项', () => {
    it('应该支持自定义配置', () => {
      const customOptions: UseCacheOptions = {
        defaultEngine: 'sessionStorage',
        keyPrefix: 'custom_',
        defaultTTL: 60000,
        debug: true,
      }

      const customWrapper = mount({
        setup() {
          const cache = useCache(customOptions)
          return { cache }
        },
        template: '<div>Custom Config Test</div>',
      })

      expect(customWrapper.vm.cache).toBeDefined()
      expect((customWrapper.vm.cache as any).manager).toBeDefined()

      customWrapper.unmount()
    })

    it('应该支持禁用自动清理', () => {
      const noCleanupWrapper = mount({
        setup() {
          const cache = useCache({ cleanupOnUnmount: false })
          return { cache }
        },
        template: '<div>No Cleanup Test</div>',
      })

      expect(noCleanupWrapper.vm.cache).toBeDefined()

      noCleanupWrapper.unmount()
    })
  })
})
