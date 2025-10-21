/**
 * Worker Pool 性能基准测试
 */

import { bench, describe } from 'vitest'
import { createWorkerPool } from '../../src/workers/worker-pool'

describe('Worker Pool Benchmarks', () => {
  bench('Worker池创建（启用预热）', async () => {
    const pool = createWorkerPool({
      minWorkers: 2,
      maxWorkers: 4,
      enablePreheating: true
    })
    await new Promise(resolve => setTimeout(resolve, 100)) // 等待预热完成
    pool.terminate()
  })

  bench('Worker池创建（禁用预热）', () => {
    const pool = createWorkerPool({
      minWorkers: 2,
      maxWorkers: 4,
      enablePreheating: false
    })
    pool.terminate()
  })

  bench('任务执行（简单计算）', async () => {
    const pool = createWorkerPool({
      minWorkers: 2,
      enablePreheating: false,
      enableSmartScheduling: false
    })

    await pool.execute({
      id: 'test-1',
      type: 'compute',
      data: { iterations: 1000 }
    })

    pool.terminate()
  }, { time: 5000 })

  bench('批量任务执行（10个任务）', async () => {
    const pool = createWorkerPool({
      minWorkers: 2,
      maxWorkers: 4,
      enableSmartScheduling: true
    })

    const tasks = Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i}`,
      type: 'compute',
      data: { iterations: 500 }
    }))

    await pool.executeBatch(tasks)
    pool.terminate()
  }, { time: 10000 })

  bench('智能调度 vs 普通调度', async () => {
    const smartPool = createWorkerPool({
      minWorkers: 2,
      enableSmartScheduling: true
    })

    // 执行不同类型的任务
    await Promise.all([
      smartPool.execute({ id: '1', type: 'compute', data: { iterations: 1000 } }),
      smartPool.execute({ id: '2', type: 'transform', data: { data: 'test' } }),
      smartPool.execute({ id: '3', type: 'compute', data: { iterations: 1000 } })
    ])

    smartPool.terminate()
  }, { time: 10000 })
})




