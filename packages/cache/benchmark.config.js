/**
 * 性能基准测试配置
 */

export default {
  // 基准测试套件
  suites: [
    {
      name: 'Cache Operations',
      tests: [
        {
          name: 'Set Operation',
          fn: 'benchmarks/cache-operations.js#set',
          iterations: 10000,
          warmup: 1000
        },
        {
          name: 'Get Operation',
          fn: 'benchmarks/cache-operations.js#get',
          iterations: 10000,
          warmup: 1000
        },
        {
          name: 'Remove Operation',
          fn: 'benchmarks/cache-operations.js#remove',
          iterations: 5000,
          warmup: 500
        },
        {
          name: 'Batch Operations',
          fn: 'benchmarks/cache-operations.js#batch',
          iterations: 1000,
          warmup: 100
        }
      ]
    },
    {
      name: 'Storage Engines',
      tests: [
        {
          name: 'Memory Engine',
          fn: 'benchmarks/storage-engines.js#memory',
          iterations: 50000,
          warmup: 5000
        },
        {
          name: 'LocalStorage Engine',
          fn: 'benchmarks/storage-engines.js#localStorage',
          iterations: 10000,
          warmup: 1000
        },
        {
          name: 'SessionStorage Engine',
          fn: 'benchmarks/storage-engines.js#sessionStorage',
          iterations: 10000,
          warmup: 1000
        },
        {
          name: 'IndexedDB Engine',
          fn: 'benchmarks/storage-engines.js#indexedDB',
          iterations: 2000,
          warmup: 200
        }
      ]
    },
    {
      name: 'Strategy Selection',
      tests: [
        {
          name: 'Smart Strategy',
          fn: 'benchmarks/strategy.js#smartStrategy',
          iterations: 5000,
          warmup: 500
        },
        {
          name: 'Size-based Selection',
          fn: 'benchmarks/strategy.js#sizeBasedSelection',
          iterations: 5000,
          warmup: 500
        },
        {
          name: 'TTL-based Selection',
          fn: 'benchmarks/strategy.js#ttlBasedSelection',
          iterations: 5000,
          warmup: 500
        }
      ]
    }
  ],

  // 性能阈值配置
  thresholds: {
    // 操作性能阈值 (ops/sec)
    operations: {
      memory: {
        set: 100000,
        get: 200000,
        remove: 150000
      },
      localStorage: {
        set: 5000,
        get: 10000,
        remove: 8000
      },
      sessionStorage: {
        set: 5000,
        get: 10000,
        remove: 8000
      },
      indexedDB: {
        set: 1000,
        get: 2000,
        remove: 1500
      }
    },

    // 内存使用阈值 (MB)
    memory: {
      maxHeapUsed: 100,
      maxRSS: 200
    },

    // 响应时间阈值 (ms)
    responseTime: {
      p50: 1,
      p95: 5,
      p99: 10
    }
  },

  // 报告配置
  reporting: {
    format: ['json', 'html', 'console'],
    outputDir: './performance-results',
    includeSystemInfo: true,
    includeGitInfo: true,
    compareWithBaseline: true,
    baselineFile: './performance-baseline.json'
  },

  // 环境配置
  environment: {
    node: {
      // eslint-disable-next-line node/prefer-global/process
      version: (typeof globalThis !== 'undefined' && globalThis.process?.version) || 'unknown',
      // eslint-disable-next-line node/prefer-global/process
      platform: (typeof globalThis !== 'undefined' && globalThis.process?.platform) || 'unknown',
      // eslint-disable-next-line node/prefer-global/process
      arch: (typeof globalThis !== 'undefined' && globalThis.process?.arch) || 'unknown'
    },
    warmupTime: 1000,
    cooldownTime: 500,
    gcBetweenTests: true
  }
}
