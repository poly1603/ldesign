/**
 * 引擎初始化性能基准测试
 */

import { bench, describe } from 'vitest'
import { createEngine } from '../../src/core/engine'

describe('Engine Initialization Benchmarks', () => {
  bench('创建引擎实例（最小配置）', () => {
    const engine = createEngine({})
    // 立即销毁以避免内存泄漏
    engine.destroy()
  })

  bench('创建引擎实例（完整配置）', () => {
    const engine = createEngine({
      debug: true,
      cache: { maxSize: 100 },
      performance: { enabled: true }
    })
    engine.destroy()
  })

  bench('懒加载管理器访问 - events', () => {
    const engine = createEngine({})
    const _ = engine.events // 触发懒加载
    engine.destroy()
  })

  bench('懒加载管理器访问 - state', () => {
    const engine = createEngine({})
    const _ = engine.state // 触发懒加载
    engine.destroy()
  })

  bench('懒加载管理器访问 - cache', () => {
    const engine = createEngine({})
    const _ = engine.cache // 触发懒加载
    engine.destroy()
  })

  bench('全部管理器访问（触发所有懒加载）', () => {
    const engine = createEngine({})
    const _ = engine.events
    const __ = engine.state
    const ___ = engine.cache
    const ____ = engine.performance
    const _____ = engine.security
    engine.destroy()
  })
})

export function createEngineInstance() {
  return createEngine({ debug: false })
}




