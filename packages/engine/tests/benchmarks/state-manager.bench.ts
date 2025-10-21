/**
 * 状态管理器性能基准测试
 */

import { bench, describe } from 'vitest'
import { createStateManager } from '../../src/state/state-manager'

describe('State Manager Benchmarks', () => {
  bench('设置简单值', () => {
    const state = createStateManager()
    for (let i = 0; i < 100; i++) {
      state.set(`key${i}`, i)
    }
    state.destroy()
  })

  bench('获取简单值（LRU缓存）', () => {
    const state = createStateManager()
    for (let i = 0; i < 100; i++) {
      state.set(`key${i}`, i)
    }
    for (let i = 0; i < 100; i++) {
      state.get(`key${i}`)
    }
    state.destroy()
  })

  bench('设置嵌套值', () => {
    const state = createStateManager()
    for (let i = 0; i < 50; i++) {
      state.set(`user.profile.data${i}`, { id: i, name: `User ${i}` })
    }
    state.destroy()
  })

  bench('深度克隆大对象', () => {
    const state = createStateManager()
    const largeObject = {
      users: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`
      }))
    }
    state.set('data', largeObject)
    state.getSnapshot()
    state.destroy()
  })

  bench('监听器触发（10个监听器）', () => {
    const state = createStateManager()
    for (let i = 0; i < 10; i++) {
      state.watch('testKey', () => { })
    }
    for (let i = 0; i < 50; i++) {
      state.set('testKey', i)
    }
    state.destroy()
  })

  bench('批量状态更新（50个键）', () => {
    const state = createStateManager()
    for (let i = 0; i < 50; i++) {
      state.set(`batch${i}`, i)
    }
    state.destroy()
  })
})




