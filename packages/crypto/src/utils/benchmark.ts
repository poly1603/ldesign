/**
 * Performance Benchmark Utility
 * 
 * 提供算法性能基准测试工具
 * 
 * 特性：
 * - 多种算法性能测试
 * - 不同数据大小测试
 * - 自动生成性能报告
 * - 支持对比测试
 * 
 * @example
 * ```ts
 * import { Benchmark, createBenchmark } from '@ldesign/crypto'
 * 
 * const benchmark = createBenchmark()
 * const results = await benchmark.runAll()
 * )
 * ```
 */

import type { HashAlgorithm } from '../types'
import { aes, encoding, hash } from '../algorithms'

/**
 * 基准测试结果
 */
export interface BenchmarkResult {
  /** 算法名称 */
  algorithm: string
  /** 操作类型 */
  operation: string
  /** 数据大小（字节） */
  dataSize: number
  /** 迭代次数 */
  iterations: number
  /** 总耗时（毫秒） */
  totalTime: number
  /** 平均耗时（毫秒） */
  averageTime: number
  /** 每秒操作数 */
  operationsPerSecond: number
  /** 吞吐量（MB/s） */
  throughput: number
}

/**
 * 基准测试套件结果
 */
export interface BenchmarkSuite {
  /** 套件名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 总耗时 */
  duration: number
  /** 测试结果 */
  results: BenchmarkResult[]
}

/**
 * 基准测试配置
 */
export interface BenchmarkOptions {
  /** 迭代次数 */
  iterations?: number
  /** 预热次数 */
  warmupIterations?: number
  /** 测试数据大小（字节） */
  dataSizes?: number[]
  /** 要测试的算法 */
  algorithms?: string[]
  /** 是否输出详细信息 */
  verbose?: boolean
}

/**
 * 性能基准测试类
 */
export class Benchmark {
  private options: Required<BenchmarkOptions>

  constructor(options: BenchmarkOptions = {}) {
    this.options = {
      iterations: options.iterations ?? 100,
      warmupIterations: options.warmupIterations ?? 10,
      dataSizes: options.dataSizes ?? [100, 1024, 10240, 102400], // 100B, 1KB, 10KB, 100KB
      algorithms: options.algorithms ?? ['AES', 'SHA256', 'Base64'],
      verbose: options.verbose ?? false,
    }
  }

  /**
   * 运行所有基准测试
   */
  async runAll(): Promise<BenchmarkSuite> {
    const startTime = Date.now()
    const results: BenchmarkResult[] = []

    this.log('🚀 开始性能基准测试...\n')

    // 测试加密算法
    if (this.options.algorithms.includes('AES')) {
      results.push(...await this.benchmarkAES())
    }

    // 测试哈希算法
    if (this.options.algorithms.includes('SHA256')) {
      results.push(...await this.benchmarkHash('SHA256'))
    }
    if (this.options.algorithms.includes('MD5')) {
      results.push(...await this.benchmarkHash('MD5'))
    }

    // 测试编码
    if (this.options.algorithms.includes('Base64')) {
      results.push(...await this.benchmarkEncoding('base64'))
    }
    if (this.options.algorithms.includes('Hex')) {
      results.push(...await this.benchmarkEncoding('hex'))
    }

    const endTime = Date.now()

    this.log('\n✅ 基准测试完成！\n')

    return {
      name: 'Crypto Performance Benchmark',
      startTime,
      endTime,
      duration: endTime - startTime,
      results,
    }
  }

  /**
   * AES 加密基准测试
   */
  private async benchmarkAES(): Promise<BenchmarkResult[]> {
    this.log('📊 测试 AES 加密...')
    const results: BenchmarkResult[] = []
    const key = 'test-key-for-benchmark'

    for (const size of this.options.dataSizes) {
      const data = this.generateTestData(size)

      // 预热
      for (let i = 0; i < this.options.warmupIterations; i++) {
        aes.encrypt(data, key)
      }

      // 加密测试
      const encryptStart = performance.now()
      for (let i = 0; i < this.options.iterations; i++) {
        aes.encrypt(data, key)
      }
      const encryptEnd = performance.now()
      const encryptTime = encryptEnd - encryptStart

      results.push({
        algorithm: 'AES-256',
        operation: 'encrypt',
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: encryptTime,
        averageTime: encryptTime / this.options.iterations,
        operationsPerSecond: (this.options.iterations / encryptTime) * 1000,
        throughput: (size * this.options.iterations / encryptTime) / 1024, // KB/s
      })

      // 解密测试
      const encrypted = aes.encrypt(data, key)
      const decryptStart = performance.now()
      for (let i = 0; i < this.options.iterations; i++) {
        aes.decrypt(encrypted, key)
      }
      const decryptEnd = performance.now()
      const decryptTime = decryptEnd - decryptStart

      results.push({
        algorithm: 'AES-256',
        operation: 'decrypt',
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: decryptTime,
        averageTime: decryptTime / this.options.iterations,
        operationsPerSecond: (this.options.iterations / decryptTime) * 1000,
        throughput: (size * this.options.iterations / decryptTime) / 1024, // KB/s
      })

      this.log(`  ${this.formatSize(size)}: 加密 ${this.formatTime(encryptTime / this.options.iterations)}, 解密 ${this.formatTime(decryptTime / this.options.iterations)}`)
    }

    return results
  }

  /**
   * 哈希算法基准测试
   */
  private async benchmarkHash(algorithm: HashAlgorithm): Promise<BenchmarkResult[]> {
    this.log(`📊 测试 ${algorithm} 哈希...`)
    const results: BenchmarkResult[] = []

    for (const size of this.options.dataSizes) {
      const data = this.generateTestData(size)

      // 预热
      for (let i = 0; i < this.options.warmupIterations; i++) {
        hash.hash(data, algorithm)
      }

      // 测试
      const start = performance.now()
      for (let i = 0; i < this.options.iterations; i++) {
        hash.hash(data, algorithm)
      }
      const end = performance.now()
      const totalTime = end - start

      results.push({
        algorithm,
        operation: 'hash',
        dataSize: size,
        iterations: this.options.iterations,
        totalTime,
        averageTime: totalTime / this.options.iterations,
        operationsPerSecond: (this.options.iterations / totalTime) * 1000,
        throughput: (size * this.options.iterations / totalTime) / 1024, // KB/s
      })

      this.log(`  ${this.formatSize(size)}: ${this.formatTime(totalTime / this.options.iterations)}`)
    }

    return results
  }

  /**
   * 编码算法基准测试
   */
  private async benchmarkEncoding(type: 'base64' | 'hex'): Promise<BenchmarkResult[]> {
    this.log(`📊 测试 ${type.toUpperCase()} 编码...`)
    const results: BenchmarkResult[] = []

    for (const size of this.options.dataSizes) {
      const data = this.generateTestData(size)

      // 编码测试
      for (let i = 0; i < this.options.warmupIterations; i++) {
        encoding.encode(data, type)
      }

      const encodeStart = performance.now()
      for (let i = 0; i < this.options.iterations; i++) {
        encoding.encode(data, type)
      }
      const encodeEnd = performance.now()
      const encodeTime = encodeEnd - encodeStart

      results.push({
        algorithm: type.toUpperCase(),
        operation: 'encode',
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: encodeTime,
        averageTime: encodeTime / this.options.iterations,
        operationsPerSecond: (this.options.iterations / encodeTime) * 1000,
        throughput: (size * this.options.iterations / encodeTime) / 1024, // KB/s
      })

      // 解码测试
      const encoded = encoding.encode(data, type)
      for (let i = 0; i < this.options.warmupIterations; i++) {
        encoding.decode(encoded, type)
      }

      const decodeStart = performance.now()
      for (let i = 0; i < this.options.iterations; i++) {
        encoding.decode(encoded, type)
      }
      const decodeEnd = performance.now()
      const decodeTime = decodeEnd - decodeStart

      results.push({
        algorithm: type.toUpperCase(),
        operation: 'decode',
        dataSize: size,
        iterations: this.options.iterations,
        totalTime: decodeTime,
        averageTime: decodeTime / this.options.iterations,
        operationsPerSecond: (this.options.iterations / decodeTime) * 1000,
        throughput: (size * this.options.iterations / decodeTime) / 1024, // KB/s
      })

      this.log(`  ${this.formatSize(size)}: 编码 ${this.formatTime(encodeTime / this.options.iterations)}, 解码 ${this.formatTime(decodeTime / this.options.iterations)}`)
    }

    return results
  }

  /**
   * 生成测试数据
   */
  private generateTestData(size: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < size; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 生成性能报告
   */
  generateReport(suite: BenchmarkSuite): string {
    let report = '\n'
    report += `${'═'.repeat(80)  }\n`
    report += '  性能基准测试报告\n'
    report += `${'═'.repeat(80)  }\n\n`

    report += `测试套件: ${suite.name}\n`
    report += `开始时间: ${new Date(suite.startTime).toLocaleString()}\n`
    report += `总耗时: ${this.formatTime(suite.duration)}\n`
    report += `测试数量: ${suite.results.length}\n\n`

    // 按算法分组
    const grouped = new Map<string, BenchmarkResult[]>()
    for (const result of suite.results) {
      const key = result.algorithm
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      const group = grouped.get(key)
      if (group) {
        group.push(result)
      }
    }

    // 输出每个算法的结果
    for (const [algorithm, results] of grouped) {
      report += `${`─`.repeat(80)  }\n`
      report += `算法: ${algorithm}\n`
      report += `${`─`.repeat(80)  }\n\n`

      report += '  数据大小    操作      迭代次数    平均耗时    吞吐量\n'
      report += `  ${  '─'.repeat(72)  }\n`

      for (const result of results) {
        report += `  ${this.formatSize(result.dataSize).padEnd(10)}  `
        report += `${result.operation.padEnd(8)}  `
        report += `${result.iterations.toString().padEnd(10)}  `
        report += `${this.formatTime(result.averageTime).padEnd(10)}  `
        report += `${this.formatThroughput(result.throughput)}\n`
      }

      report += '\n'
    }

    report += `${'═'.repeat(80)  }\n`

    return report
  }

  /**
   * 生成 JSON 报告
   */
  generateJSONReport(suite: BenchmarkSuite): string {
    return JSON.stringify(suite, null, 2)
  }

  /**
   * 格式化大小
   */
  public formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes}B`
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)}KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
  }

  /**
   * 格式化时间
   */
  private formatTime(ms: number): string {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(2)}μs`
    }
    if (ms < 1000) {
      return `${ms.toFixed(2)}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }

  /**
   * 格式化吞吐量
   */
  private formatThroughput(kbps: number): string {
    if (kbps < 1024) {
      return `${kbps.toFixed(2)} KB/s`
    }
    return `${(kbps / 1024).toFixed(2)} MB/s`
  }

  /**
   * 日志输出
   */
  private log(_message: string): void {
    // 日志功能已禁用，避免控制台输出
    // 如需启用，可以使用自定义日志处理器
  }
}

/**
 * 便捷函数：创建基准测试实例
 */
export function createBenchmark(options?: BenchmarkOptions): Benchmark {
  return new Benchmark(options)
}

/**
 * 便捷函数：运行快速基准测试
 */
export async function quickBenchmark(): Promise<BenchmarkSuite> {
  const benchmark = createBenchmark({
    iterations: 50,
    warmupIterations: 5,
    dataSizes: [100, 1024, 10240],
    verbose: true,
  })

  const results = await benchmark.runAll()
  return results
}

/**
 * 便捷函数：比较两个算法
 */
export async function compareBenchmark(
  algorithm1: string,
  algorithm2: string,
  options?: BenchmarkOptions,
): Promise<string> {
  const benchmark = createBenchmark({
    ...options,
    algorithms: [algorithm1, algorithm2],
    verbose: false,
  })

  const results = await benchmark.runAll()

  let report = '\n'
  report += `比较 ${algorithm1} vs ${algorithm2}\n`
  report += `${'─'.repeat(60)  }\n\n`

  const algo1Results = results.results.filter(r => r.algorithm === algorithm1)
  const algo2Results = results.results.filter(r => r.algorithm === algorithm2)

  for (let i = 0; i < Math.min(algo1Results.length, algo2Results.length); i++) {
    const r1 = algo1Results[i]
    const r2 = algo2Results[i]

    if (r1.operation === r2.operation && r1.dataSize === r2.dataSize) {
      const faster = r1.averageTime < r2.averageTime ? algorithm1 : algorithm2
      const speedup = Math.max(r1.averageTime, r2.averageTime) / Math.min(r1.averageTime, r2.averageTime)

      report += `${r1.operation} (${benchmark.formatSize(r1.dataSize)}): ${faster} 快 ${speedup.toFixed(2)}x\n`
    }
  }

  return report
}
