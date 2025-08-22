/**
 * Worker系统测试用例
 * 测试PDF Worker的多线程处理功能
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { WorkerPool } from '../../src/worker/worker-pool'
import { WorkerManager } from '../../src/worker/worker-manager'
import type { WorkerConfig, WorkerTask } from '../../src/types'

// 模拟Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  
  postMessage = vi.fn((data: any) => {
    // 模拟异步响应
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: {
            id: data.id,
            type: 'success',
            data: { result: 'mocked' },
          },
        } as MessageEvent)
      }
    }, 10)
  })
  
  terminate = vi.fn()
}

// 模拟全局Worker构造函数
vi.stubGlobal('Worker', MockWorker)

describe('Worker系统测试', () => {
  let workerPool: WorkerPool
  let workerManager: WorkerManager
  
  const defaultConfig: WorkerConfig = {
    maxWorkers: 4,
    workerScript: '/pdf.worker.js',
    enableLogging: false,
    taskTimeout: 5000,
    maxRetries: 3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    workerPool = new WorkerPool(defaultConfig)
    workerManager = new WorkerManager(defaultConfig)
  })

  afterEach(() => {
    workerPool.destroy()
    workerManager.destroy()
  })

  describe('WorkerPool', () => {
    describe('初始化', () => {
      it('应该成功创建Worker池', () => {
        expect(workerPool).toBeDefined()
        expect(workerPool.size).toBe(0) // 初始时没有Worker
      })

      it('应该使用默认配置', () => {
        const defaultPool = new WorkerPool()
        expect(defaultPool).toBeDefined()
        defaultPool.destroy()
      })

      it('应该限制最大Worker数量', () => {
        const smallPool = new WorkerPool({ ...defaultConfig, maxWorkers: 2 })
        
        // 创建多个Worker
        smallPool.getWorker()
        smallPool.getWorker()
        smallPool.getWorker()
        
        expect(smallPool.size).toBeLessThanOrEqual(2)
        smallPool.destroy()
      })
    })

    describe('Worker管理', () => {
      it('应该能够获取Worker', () => {
        const worker = workerPool.getWorker()
        expect(worker).toBeDefined()
        expect(workerPool.size).toBe(1)
      })

      it('应该复用空闲的Worker', () => {
        const worker1 = workerPool.getWorker()
        workerPool.releaseWorker(worker1)
        
        const worker2 = workerPool.getWorker()
        expect(worker1).toBe(worker2)
        expect(workerPool.size).toBe(1)
      })

      it('应该在达到限制时等待Worker可用', async () => {
        const smallPool = new WorkerPool({ ...defaultConfig, maxWorkers: 1 })
        
        try {
          const worker1 = smallPool.getWorker()
          
          // 第二个请求应该等待
          const workerPromise = smallPool.getWorker()
          
          // 释放第一个Worker
          smallPool.releaseWorker(worker1)
          
          const worker2 = await workerPromise
          expect(worker2).toBeDefined()
        } finally {
          smallPool.destroy()
        }
      })

      it('应该清理销毁的Worker', () => {
        const worker = workerPool.getWorker()
        workerPool.removeWorker(worker)
        
        expect(workerPool.size).toBe(0)
      })
    })

    describe('统计信息', () => {
      it('应该提供Worker池统计信息', () => {
        workerPool.getWorker()
        workerPool.getWorker()
        
        const stats = workerPool.getStatistics()
        expect(stats).toBeDefined()
        expect(stats.totalWorkers).toBe(2)
        expect(stats.idleWorkers).toBe(2)
        expect(stats.busyWorkers).toBe(0)
      })
    })
  })

  describe('WorkerManager', () => {
    describe('任务管理', () => {
      it('应该执行简单任务', async () => {
        const result = await workerManager.execute({
          type: 'render',
          data: { pageNumber: 1 },
          priority: 'normal',
        })
        
        expect(result).toBeDefined()
        expect(result.result).toBe('mocked')
      })

      it('应该支持优先级任务', async () => {
        const highPriorityTask = workerManager.execute({
          type: 'render',
          data: { pageNumber: 1 },
          priority: 'high',
        })
        
        const normalPriorityTask = workerManager.execute({
          type: 'render',
          data: { pageNumber: 2 },
          priority: 'normal',
        })
        
        const results = await Promise.all([highPriorityTask, normalPriorityTask])
        expect(results).toHaveLength(2)
      })

      it('应该处理并发任务', async () => {
        const tasks = Array.from({ length: 5 }, (_, i) =>
          workerManager.execute({
            type: 'render',
            data: { pageNumber: i + 1 },
            priority: 'normal',
          })
        )
        
        const results = await Promise.all(tasks)
        expect(results).toHaveLength(5)
      })

      it('应该取消任务', async () => {
        const taskPromise = workerManager.execute({
          type: 'render',
          data: { pageNumber: 1 },
          priority: 'normal',
        })
        
        // 立即取消任务
        workerManager.cancelTask(await workerManager.getTaskId(taskPromise))
        
        await expect(taskPromise).rejects.toThrow()
      })
    })

    describe('错误处理', () => {
      it('应该处理Worker错误', async () => {
        // 模拟Worker错误
        const originalPostMessage = MockWorker.prototype.postMessage
        MockWorker.prototype.postMessage = vi.fn().mockImplementation(function(this: MockWorker, data: any) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({
                message: 'Worker error',
                filename: '',
                lineno: 0,
                colno: 0,
                error: new Error('Worker error'),
              } as ErrorEvent)
            }
          }, 10)
        })
        
        try {
          await expect(workerManager.execute({
            type: 'render',
            data: { pageNumber: 1 },
            priority: 'normal',
          })).rejects.toThrow()
        } finally {
          MockWorker.prototype.postMessage = originalPostMessage
        }
      })

      it('应该重试失败的任务', async () => {
        let attemptCount = 0
        
        // 模拟前两次失败，第三次成功
        const originalPostMessage = MockWorker.prototype.postMessage
        MockWorker.prototype.postMessage = vi.fn().mockImplementation(function(this: MockWorker, data: any) {
          attemptCount++
          setTimeout(() => {
            if (attemptCount < 3) {
              if (this.onerror) {
                this.onerror({
                  message: 'Worker error',
                  filename: '',
                  lineno: 0,
                  colno: 0,
                  error: new Error('Worker error'),
                } as ErrorEvent)
              }
            } else {
              if (this.onmessage) {
                this.onmessage({
                  data: {
                    id: data.id,
                    type: 'success',
                    data: { result: 'success after retry' },
                  },
                } as MessageEvent)
              }
            }
          }, 10)
        })
        
        try {
          const result = await workerManager.execute({
            type: 'render',
            data: { pageNumber: 1 },
            priority: 'normal',
          })
          
          expect(result.result).toBe('success after retry')
          expect(attemptCount).toBe(3)
        } finally {
          MockWorker.prototype.postMessage = originalPostMessage
        }
      })

      it('应该在达到最大重试次数后失败', async () => {
        // 模拟始终失败的Worker
        const originalPostMessage = MockWorker.prototype.postMessage
        MockWorker.prototype.postMessage = vi.fn().mockImplementation(function(this: MockWorker, data: any) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({
                message: 'Persistent error',
                filename: '',
                lineno: 0,
                colno: 0,
                error: new Error('Persistent error'),
              } as ErrorEvent)
            }
          }, 10)
        })
        
        try {
          await expect(workerManager.execute({
            type: 'render',
            data: { pageNumber: 1 },
            priority: 'normal',
          })).rejects.toThrow()
        } finally {
          MockWorker.prototype.postMessage = originalPostMessage
        }
      })
    })

    describe('超时处理', () => {
      it('应该处理任务超时', async () => {
        const shortTimeoutManager = new WorkerManager({
          ...defaultConfig,
          taskTimeout: 50, // 50ms超时
        })
        
        try {
          // 模拟长时间运行的任务
          const originalPostMessage = MockWorker.prototype.postMessage
          MockWorker.prototype.postMessage = vi.fn() // 不响应
          
          await expect(shortTimeoutManager.execute({
            type: 'render',
            data: { pageNumber: 1 },
            priority: 'normal',
          })).rejects.toThrow()
          
          MockWorker.prototype.postMessage = originalPostMessage
        } finally {
          shortTimeoutManager.destroy()
        }
      })
    })

    describe('统计信息', () => {
      it('应该提供任务统计信息', async () => {
        await workerManager.execute({
          type: 'render',
          data: { pageNumber: 1 },
          priority: 'normal',
        })
        
        const stats = workerManager.getStatistics()
        expect(stats).toBeDefined()
        expect(stats.totalTasks).toBe(1)
        expect(stats.completedTasks).toBe(1)
        expect(stats.failedTasks).toBe(0)
      })

      it('应该跟踪平均任务时间', async () => {
        await workerManager.execute({
          type: 'render',
          data: { pageNumber: 1 },
          priority: 'normal',
        })
        
        const stats = workerManager.getStatistics()
        expect(stats.averageTaskTime).toBeGreaterThan(0)
      })
    })
  })

  describe('集成测试', () => {
    it('应该正确协调Worker池和任务管理', async () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        workerManager.execute({
          type: 'render',
          data: { pageNumber: i + 1 },
          priority: i < 5 ? 'high' : 'normal',
        })
      )
      
      const results = await Promise.all(tasks)
      expect(results).toHaveLength(10)
      
      const stats = workerManager.getStatistics()
      expect(stats.totalTasks).toBe(10)
      expect(stats.completedTasks).toBe(10)
    })

    it('应该处理混合的成功和失败任务', async () => {
      let taskCount = 0
      
      // 模拟部分任务失败
      const originalPostMessage = MockWorker.prototype.postMessage
      MockWorker.prototype.postMessage = vi.fn().mockImplementation(function(this: MockWorker, data: any) {
        taskCount++
        setTimeout(() => {
          if (taskCount % 2 === 0) {
            // 偶数任务失败
            if (this.onerror) {
              this.onerror({
                message: 'Simulated error',
                filename: '',
                lineno: 0,
                colno: 0,
                error: new Error('Simulated error'),
              } as ErrorEvent)
            }
          } else {
            // 奇数任务成功
            if (this.onmessage) {
              this.onmessage({
                data: {
                  id: data.id,
                  type: 'success',
                  data: { result: 'success' },
                },
              } as MessageEvent)
            }
          }
        }, 10)
      })
      
      try {
        const tasks = Array.from({ length: 4 }, (_, i) =>
          workerManager.execute({
            type: 'render',
            data: { pageNumber: i + 1 },
            priority: 'normal',
          }).catch(() => null) // 捕获错误以继续统计
        )
        
        const results = await Promise.all(tasks)
        const successCount = results.filter(r => r !== null).length
        
        expect(successCount).toBe(2) // 2个成功，2个失败
      } finally {
        MockWorker.prototype.postMessage = originalPostMessage
      }
    })
  })

  describe('销毁和清理', () => {
    it('应该正确销毁Worker池', () => {
      const worker = workerPool.getWorker()
      expect(workerPool.size).toBe(1)
      
      workerPool.destroy()
      expect(workerPool.size).toBe(0)
    })

    it('应该取消所有进行中的任务', async () => {
      const tasks = Array.from({ length: 3 }, () =>
        workerManager.execute({
          type: 'render',
          data: { pageNumber: 1 },
          priority: 'normal',
        }).catch(() => null)
      )
      
      workerManager.destroy()
      
      const results = await Promise.all(tasks)
      expect(results.every(r => r === null)).toBe(true)
    })
  })
})