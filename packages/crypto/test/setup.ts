import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

// Mock crypto API for Node.js environment
beforeAll(async () => {
  console.log('🧪 开始运行 @ldesign/crypto 测试套件')

  // Setup global test environment
  if (typeof globalThis.crypto === 'undefined') {
    const { webcrypto } = await import('node:crypto')
    globalThis.crypto = webcrypto as Crypto
  }

  // Mock TextEncoder/TextDecoder if not available
  if (typeof globalThis.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = await import('node:util')
    globalThis.TextEncoder = TextEncoder
    globalThis.TextDecoder = TextDecoder
  }

  // 设置测试环境变量
  process.env.NODE_ENV = 'test'

  // 设置性能测试基准
  if (!globalThis.performance) {
    globalThis.performance = {
      now: () => Date.now()
    } as any
  }
})

beforeEach(() => {
  // 每个测试前的清理
})

afterEach(() => {
  // Clean up after each test
})

afterAll(() => {
  console.log('✅ @ldesign/crypto 测试套件运行完成')
})

// 测试工具函数
export const testUtils = {
  // 生成测试数据
  generateTestData: (size: number = 1024): string => {
    return 'A'.repeat(size)
  },

  // 生成随机字符串
  generateRandomString: (length: number = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // 测试性能
  measurePerformance: async (fn: () => void | Promise<void>, iterations: number = 1): Promise<{
    totalTime: number
    averageTime: number
    opsPerSecond: number
  }> => {
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      await fn()
    }

    const end = performance.now()
    const totalTime = end - start
    const averageTime = totalTime / iterations
    const opsPerSecond = 1000 / averageTime

    return {
      totalTime,
      averageTime,
      opsPerSecond
    }
  },

  // 创建测试用的二进制数据
  createBinaryData: (length: number = 256): string => {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(i % 256)
    }
    return result
  },

  // 创建 Unicode 测试数据
  createUnicodeData: (): string => {
    return '🔐 Hello, 世界! 🌟 ✨ 🚀 💎 🎯 🔥 ⚡ 🌈 🎨'
  }
}

// 测试常量
export const testConstants = {
  // 标准测试数据
  TEST_DATA: {
    SMALL: 'Hello, World!',
    MEDIUM: 'A'.repeat(1024), // 1KB
    LARGE: 'B'.repeat(10240), // 10KB
    UNICODE: '🔐 Hello, 世界! 🌟',
    BINARY: '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F',
    EMPTY: '',
    MULTILINE: `Line 1
Line 2
Line 3
With special chars: !@#$%^&*()`
  },

  // 标准测试密钥
  TEST_KEYS: {
    SHORT: 'short',
    MEDIUM: 'medium-length-key',
    LONG: 'this-is-a-very-long-key-for-testing-purposes-256-bits',
    AES_128: 'aes-128-test-key',
    AES_192: 'aes-192-test-key-longer',
    AES_256: 'aes-256-test-key-even-longer-32'
  },

  // 性能基准
  PERFORMANCE_THRESHOLDS: {
    FAST_OPERATION: 10, // ms
    MEDIUM_OPERATION: 100, // ms
    SLOW_OPERATION: 1000, // ms
    MIN_OPS_PER_SECOND: 10
  },

  // 已知测试向量
  TEST_VECTORS: {
    SHA256: {
      'abc': 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      '': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    SHA512: {
      'abc': 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
    },
    BASE64: {
      'Man': 'TWFu',
      'Ma': 'TWE=',
      'M': 'TQ=='
    }
  }
}
