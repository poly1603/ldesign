/**
 * 性能基准测试脚本
 */

import { performance } from 'perf_hooks'

interface BenchmarkResult {
  name: string
  iterations: number
  totalTime: number
  averageTime: number
  opsPerSecond: number
}

/**
 * 运行性能基准测试
 */
export async function benchmark(
  name: string,
  fn: () => void | Promise<void>,
  iterations: number = 1000
): Promise<BenchmarkResult> {
  // 预热
  for (let i = 0; i < 10; i++) {
    await fn()
  }

  // 正式测试
  const start = performance.now()
  
  for (let i = 0; i < iterations; i++) {
    await fn()
  }
  
  const end = performance.now()
  const totalTime = end - start
  const averageTime = totalTime / iterations
  const opsPerSecond = 1000 / averageTime

  return {
    name,
    iterations,
    totalTime,
    averageTime,
    opsPerSecond
  }
}

/**
 * 格式化输出结果
 */
export function printResults(results: BenchmarkResult[]): void {
  console.log('\n📊 性能基准测试结果\n')
  console.log('='.repeat(80))
  
  results.forEach(result => {
    console.log(`\n🔍 ${result.name}`)
    console.log(`   迭代次数: ${result.iterations.toLocaleString()}`)
    console.log(`   总耗时: ${result.totalTime.toFixed(2)}ms`)
    console.log(`   平均耗时: ${result.averageTime.toFixed(4)}ms`)
    console.log(`   操作/秒: ${result.opsPerSecond.toFixed(0).toLocaleString()}`)
  })
  
  console.log('\n' + '='.repeat(80) + '\n')
}

/**
 * 对比两个实现的性能
 */
export async function compare(
  name1: string,
  fn1: () => void | Promise<void>,
  name2: string,
  fn2: () => void | Promise<void>,
  iterations: number = 1000
): Promise<void> {
  const result1 = await benchmark(name1, fn1, iterations)
  const result2 = await benchmark(name2, fn2, iterations)
  
  const faster = result1.averageTime < result2.averageTime ? result1 : result2
  const slower = result1.averageTime < result2.averageTime ? result2 : result1
  const speedup = (slower.averageTime / faster.averageTime).toFixed(2)
  
  printResults([result1, result2])
  
  console.log(`✅ ${faster.name} 快 ${speedup}x 倍\n`)
}

// 示例：测试循环优化
if (require.main === module) {
  const testData = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }))
  
  compare(
    'for...in 循环',
    () => {
      const result: any[] = []
      for (const key in testData) {
        if (Object.prototype.hasOwnProperty.call(testData, key)) {
          result.push(testData[key])
        }
      }
      return result
    },
    'Object.keys() + for 循环',
    () => {
      const result: any[] = []
      const keys = Object.keys(testData)
      for (let i = 0; i < keys.length; i++) {
        result.push(testData[keys[i]])
      }
      return result
    },
    10000
  ).then(() => {
    console.log('✨ 基准测试完成')
  })
}

