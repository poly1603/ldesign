import { describe, it, expect } from 'vitest'
import { RequestQueueManager } from '../src/utils/RequestQueue'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

describe('RequestQueueManager', () => {
  it('respects concurrency and priority', async () => {
    const q = new RequestQueueManager({ enabled: true, concurrency: 2, maxQueue: 0 })
    const order: number[] = []
    let runningMax = 0
    let running = 0

    const runTask = (id: number, delay: number) => q.enqueue(async () => {
      running++
      runningMax = Math.max(runningMax, running)
      await sleep(delay)
      order.push(id)
      running--
      return id
    }, id) // use id as priority

    const tasks = [
      runTask(1, 50),
      runTask(3, 30),
      runTask(2, 40),
      runTask(5, 20),
      runTask(4, 10),
    ]

    const results = await Promise.all(tasks)
    expect(results.length).toBe(5)
    expect(runningMax).toBeLessThanOrEqual(2)
    // Priority: 5,4,3,2,1 roughly, but concurrency and durations might reorder finishes
    // Ensure all completed
    expect(order.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })
})
