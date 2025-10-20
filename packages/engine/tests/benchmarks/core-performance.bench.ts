/**
 * 核心性能基准测试
 */

import { describe, bench } from 'vitest'
import { createEventManager } from '../../src/events/event-manager'
import { createStateManager } from '../../src/state/state-manager'
import { createCacheManager } from '../../src/cache/cache-manager'
import { createMiddlewareManager } from '../../src/middleware/middleware-manager'
import { createPluginManager } from '../../src/plugins/plugin-manager'

describe('Event Manager Performance', () => {
  bench('事件注册 - 100次', () => {
    const em = createEventManager()
    for (let i = 0; i < 100; i++) {
      em.on(`event${i}`, () => {})
    }
  })

  bench('事件触发 - 无监听器', () => {
    const em = createEventManager()
    for (let i = 0; i < 1000; i++) {
      em.emit('test-event', { data: i })
    }
  })

  bench('事件触发 - 10个监听器', () => {
    const em = createEventManager()
    for (let i = 0; i < 10; i++) {
      em.on('test-event', () => {})
    }
    
    for (let i = 0; i < 1000; i++) {
      em.emit('test-event', { data: i })
    }
  })

  bench('事件注销 - 100次', () => {
    const em = createEventManager()
    const handlers: Array<() => void> = []
    
    for (let i = 0; i < 100; i++) {
      const handler = () => {}
      handlers.push(handler)
      em.on('test-event', handler)
    }
    
    for (const handler of handlers) {
      em.off('test-event', handler)
    }
  })
})

describe('State Manager Performance', () => {
  bench('状态设置 - 简单值', () => {
    const sm = createStateManager()
    for (let i = 0; i < 1000; i++) {
      sm.set(`key${i}`, i)
    }
  })

  bench('状态获取 - 1000次', () => {
    const sm = createStateManager()
    for (let i = 0; i < 100; i++) {
      sm.set(`key${i}`, i)
    }
    
    for (let i = 0; i < 1000; i++) {
      sm.get(`key${i % 100}`)
    }
  })

  bench('嵌套状态设置 - 3层深度', () => {
    const sm = createStateManager()
    for (let i = 0; i < 100; i++) {
      sm.set(`level1.level2.level3.key${i}`, { value: i })
    }
  })

  bench('状态监听器 - 100个', () => {
    const sm = createStateManager()
    for (let i = 0; i < 100; i++) {
      sm.watch(`key${i}`, () => {})
    }
    
    for (let i = 0; i < 100; i++) {
      sm.set(`key${i}`, i)
    }
  })

  bench('状态快照', () => {
    const sm = createStateManager()
    for (let i = 0; i < 100; i++) {
      sm.set(`key${i}`, { value: i, nested: { data: Array(10).fill(i) } })
    }
    
    sm.getSnapshot()
  })
})

describe('Cache Manager Performance', () => {
  bench('缓存设置 - 100次', async () => {
    const cm = createCacheManager({ maxSize: 200 })
    for (let i = 0; i < 100; i++) {
      await cm.set(`key${i}`, { data: i })
    }
  })

  bench('缓存获取 - 1000次', async () => {
    const cm = createCacheManager({ maxSize: 200 })
    for (let i = 0; i < 100; i++) {
      await cm.set(`key${i}`, { data: i })
    }
    
    for (let i = 0; i < 1000; i++) {
      await cm.get(`key${i % 100}`)
    }
  })

  bench('LRU淘汰 - 缓存满', async () => {
    const cm = createCacheManager({ maxSize: 50 })
    for (let i = 0; i < 100; i++) {
      await cm.set(`key${i}`, { data: Array(100).fill(i) })
    }
  })

  bench('TTL过期清理', async () => {
    const cm = createCacheManager({ 
      maxSize: 200,
      cleanupInterval: 1000 
    })
    
    for (let i = 0; i < 100; i++) {
      await cm.set(`key${i}`, { data: i }, 1) // 1ms TTL
    }
    
    // 等待清理
    await new Promise(resolve => setTimeout(resolve, 10))
  })
})

describe('Middleware Manager Performance', () => {
  bench('中间件注册 - 20个', () => {
    const mm = createMiddlewareManager()
    for (let i = 0; i < 20; i++) {
      mm.use({
        name: `middleware${i}`,
        handler: async (_, next) => await next(),
        priority: i
      })
    }
  })

  bench('中间件执行 - 10个', async () => {
    const mm = createMiddlewareManager()
    for (let i = 0; i < 10; i++) {
      mm.use({
        name: `middleware${i}`,
        handler: async (_, next) => await next(),
        priority: i
      })
    }
    
    await mm.execute({ data: 'test' } as any)
  })

  bench('中间件查找', () => {
    const mm = createMiddlewareManager()
    for (let i = 0; i < 50; i++) {
      mm.use({
        name: `middleware${i}`,
        handler: async (_, next) => await next()
      })
    }
    
    for (let i = 0; i < 100; i++) {
      mm.get(`middleware${i % 50}`)
    }
  })
})

describe('Plugin Manager Performance', () => {
  bench('插件注册 - 20个', async () => {
    const pm = createPluginManager()
    for (let i = 0; i < 20; i++) {
      await pm.register({
        name: `plugin${i}`,
        version: '1.0.0',
        install: async () => {}
      })
    }
  })

  bench('插件查询 - 100次', () => {
    const pm = createPluginManager()
    // 预先注册一些插件（同步）
    const plugins = Array.from({ length: 50 }, (_, i) => ({
      name: `plugin${i}`,
      version: '1.0.0',
      install: async () => {}
    }))
    
    for (const plugin of plugins) {
      // 使用同步方式添加到内部 Map
      ;(pm as any).plugins.set(plugin.name, plugin)
    }
    
    for (let i = 0; i < 100; i++) {
      pm.get(`plugin${i % 50}`)
    }
  })

  bench('依赖图生成', () => {
    const pm = createPluginManager()
    const plugins = Array.from({ length: 30 }, (_, i) => ({
      name: `plugin${i}`,
      version: '1.0.0',
      dependencies: i > 0 ? [`plugin${i - 1}`] : [],
      install: async () => {}
    }))
    
    for (const plugin of plugins) {
      ;(pm as any).plugins.set(plugin.name, plugin)
    }
    
    pm.getDependencyGraph()
  })
})

describe('综合性能测试', () => {
  bench('完整流程 - 引擎初始化', async () => {
    const { EngineImpl } = await import('../../src/core/engine')
    const engine = new EngineImpl({ debug: false })
    
    // 注册一些插件
    await engine.use({
      name: 'test-plugin',
      version: '1.0.0',
      install: async () => {}
    })
    
    // 设置一些状态
    engine.state.set('test', { value: 123 })
    
    // 触发一些事件
    engine.events.emit('test-event', { data: 'test' })
    
    // 清理
    await engine.destroy()
  })

  bench('大量数据处理', () => {
    const sm = createStateManager()
    const data = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }))
    
    for (const item of data) {
      sm.set(`items.${item.id}`, item)
    }
    
    // 批量查询
    for (let i = 0; i < 1000; i++) {
      sm.get(`items.${i}`)
    }
  })
})

