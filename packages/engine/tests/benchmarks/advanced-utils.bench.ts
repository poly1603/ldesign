/**
 * 高级工具函数性能基准测试
 * 📊 测试各种工具函数的性能表现
 */

import { bench, describe } from 'vitest'
import {
  AsyncQueue,
  ColorUtils,
  fp,
  Lazy,
  retryWithBackoff,
  TimeFormatter,
  TypedEventEmitter,
  Validator,
} from '../../src/utils/advanced-utils'

describe('性能基准测试', () => {
  describe('fp.memoize - 记忆化性能', () => {
    // 斐波那契数列 - 经典的记忆化测试案例
    function fibonacci(n: number): number {
      if (n <= 1) return n
      return fibonacci(n - 1) + fibonacci(n - 2)
    }

    const memoizedFibonacci = fp.memoize((n: number): number => {
      if (n <= 1) return n
      return memoizedFibonacci(n - 1) + memoizedFibonacci(n - 2)
    })

    bench('fibonacci(30) - 无记忆化', () => {
      fibonacci(30)
    })

    bench('fibonacci(30) - 有记忆化 (首次)', () => {
      // 重置记忆化缓存
      const freshMemoized = fp.memoize((n: number): number => {
        if (n <= 1) return n
        return freshMemoized(n - 1) + freshMemoized(n - 2)
      })
      freshMemoized(30)
    })

    bench('fibonacci(30) - 有记忆化 (缓存)', () => {
      memoizedFibonacci(30)
    })
  })

  describe('fp.pipe vs 手动组合', () => {
    const add1 = (x: number) => x + 1
    const multiply2 = (x: number) => x * 2
    const subtract3 = (x: number) => x - 3

    const piped = fp.pipe(add1, multiply2, subtract3)

    bench('函数组合 - 使用 pipe', () => {
      piped(100)
    })

    bench('函数组合 - 手动调用', () => {
      subtract3(multiply2(add1(100)))
    })
  })

  describe('validator 性能', () => {
    const emails = [
      'user@example.com',
      'test@domain.co.uk',
      'invalid',
      'test+tag@domain.com',
    ]

    bench('邮箱验证 - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        emails.forEach(email => Validator.isEmail(email))
      }
    })

    const urls = [
      'https://example.com',
      'http://localhost:3000',
      'ftp://files.example.com',
      'invalid-url',
    ]

    bench('uRL验证 - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        urls.forEach(url => Validator.isURL(url))
      }
    })

    const passwords = [
      'Pass123!@#',
      'weak',
      'NoNumbers!',
      'NoSymbols123',
    ]

    bench('强密码验证 - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        passwords.forEach(pwd => Validator.isStrongPassword(pwd))
      }
    })

    const creditCards = [
      '4532015112830366',
      '6011111111111117',
      '1234567890123456',
    ]

    bench('信用卡验证 (Luhn算法) - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        creditCards.forEach(card => Validator.isCreditCard(card))
      }
    })
  })

  describe('asyncQueue 并发控制性能', () => {
    bench('asyncQueue(5) - 100个任务', async () => {
      const queue = new AsyncQueue(5)
      const tasks = Array.from({ length: 100 }, (_, i) => 
        queue.add(async () => {
          await new Promise(resolve => setTimeout(resolve, 1))
          return i
        })
      )
      await Promise.all(tasks)
    })

    bench('promise.all - 100个任务 (无限并发)', async () => {
      const tasks = Array.from({ length: 100 }, (_, i) => 
        (async () => {
          await new Promise(resolve => setTimeout(resolve, 1))
          return i
        })()
      )
      await Promise.all(tasks)
    })
  })

  describe('typedEventEmitter 性能', () => {
    interface TestEvents {
      'test': { value: number }
    }

    bench('事件发射 - 1000次 (1个监听器)', () => {
      const emitter = new TypedEventEmitter<TestEvents>()
      emitter.on('test', () => {})
      
      for (let i = 0; i < 1000; i++) {
        emitter.emit('test', { value: i })
      }
    })

    bench('事件发射 - 1000次 (10个监听器)', () => {
      const emitter = new TypedEventEmitter<TestEvents>()
      for (let j = 0; j < 10; j++) {
        emitter.on('test', () => {})
      }
      
      for (let i = 0; i < 1000; i++) {
        emitter.emit('test', { value: i })
      }
    })

    bench('事件发射 - 1000次 (100个监听器)', () => {
      const emitter = new TypedEventEmitter<TestEvents>()
      for (let j = 0; j < 100; j++) {
        emitter.on('test', () => {})
      }
      
      for (let i = 0; i < 1000; i++) {
        emitter.emit('test', { value: i })
      }
    })
  })

  describe('lazy 延迟加载性能', () => {
    function expensiveOperation() {
      let sum = 0
      for (let i = 0; i < 1000; i++) {
        sum += i
      }
      return sum
    }

    bench('直接初始化 - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        const value = expensiveOperation()
        // 使用 value
        void value
      }
    })

    bench('lazy 初始化 - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        const lazy = new Lazy(expensiveOperation)
        const value = lazy.value
        // 使用 value
        void value
      }
    })
  })

  describe('colorUtils 颜色处理性能', () => {
    bench('hexToRgb - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        ColorUtils.hexToRgb('#FF5733')
      }
    })

    bench('rgbToHex - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        ColorUtils.rgbToHex(255, 87, 51)
      }
    })

    bench('adjustBrightness - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        ColorUtils.adjustBrightness('#808080', 20)
      }
    })

    bench('mix - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        ColorUtils.mix('#FF0000', '#0000FF', 0.5)
      }
    })
  })

  describe('retryWithBackoff 重试性能', () => {
    bench('成功操作 (无重试)', async () => {
      await retryWithBackoff(
        async () => 'success',
        { maxAttempts: 3, initialDelay: 1 }
      )
    })

    bench('失败2次后成功', async () => {
      let attempts = 0
      await retryWithBackoff(
        async () => {
          attempts++
          if (attempts < 3) throw new Error('fail')
          return 'success'
        },
        { maxAttempts: 3, initialDelay: 1 }
      )
    })
  })

  describe('对象操作性能对比', () => {
    const testObject = {
      level1: {
        level2: {
          level3: {
            value: 42
          }
        }
      }
    }

    bench('深度访问 - 点号访问', () => {
      for (let i = 0; i < 1000; i++) {
        const value = testObject.level1.level2.level3.value
        void value
      }
    })

    bench('深度访问 - 可选链', () => {
      for (let i = 0; i < 1000; i++) {
        const value = testObject?.level1?.level2?.level3?.value
        void value
      }
    })
  })

  describe('timeFormatter 性能', () => {
    const now = Date.now()
    const pastDate = now - 3600000 // 1小时前

    bench('relative - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        TimeFormatter.relative(pastDate)
      }
    })

    bench('friendly - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        TimeFormatter.friendly(now)
      }
    })

    bench('duration - 1000次', () => {
      for (let i = 0; i < 1000; i++) {
        TimeFormatter.duration(3661000)
      }
    })
  })

  describe('数组操作性能对比', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i)

    bench('forEach - 10000项', () => {
      let sum = 0
      largeArray.forEach(n => { sum += n })
    })

    bench('for...of - 10000项', () => {
      let sum = 0
      for (const n of largeArray) {
        sum += n
      }
    })

    bench('for loop - 10000项', () => {
      let sum = 0
      for (let i = 0; i < largeArray.length; i++) {
        sum += largeArray[i]
      }
    })

    bench('reduce - 10000项', () => {
      largeArray.reduce((sum, n) => sum + n, 0)
    })
  })

  describe('函数调用开销', () => {
    const simpleFunction = (x: number) => x * 2
    const curriedFunction = fp.curry((a: number, b: number) => a + b)
    const memoizedFunction = fp.memoize((x: number) => x * 2)

    bench('普通函数调用 - 10000次', () => {
      for (let i = 0; i < 10000; i++) {
        simpleFunction(i)
      }
    })

    bench('柯里化函数调用 - 10000次', () => {
      for (let i = 0; i < 10000; i++) {
        curriedFunction(i, i)
      }
    })

    bench('记忆化函数调用 - 10000次', () => {
      for (let i = 0; i < 10000; i++) {
        memoizedFunction(i)
      }
    })
  })

  describe('字符串操作性能', () => {
    const testStrings = Array.from({ length: 1000 }, (_, i) => `test-string-${i}`)

    bench('字符串拼接 - 1000次', () => {
      testStrings.forEach(s => {
        const result = `${s  }-suffix`
        void result
      })
    })

    bench('模板字符串 - 1000次', () => {
      testStrings.forEach(s => {
        const result = `${s}-suffix`
        void result
      })
    })

    bench('数组join - 1000次', () => {
      testStrings.forEach(s => {
        const result = [s, 'suffix'].join('-')
        void result
      })
    })
  })
})

/**
 * 预期性能结果
 * 
 * 1. fp.memoize: 
 *    - fibonacci(30) 无记忆化: ~50-100ms
 *    - fibonacci(30) 有记忆化 (首次): ~10-20ms
 *    - fibonacci(30) 有记忆化 (缓存): <1ms
 *    - 性能提升: 50-100x+
 * 
 * 2. Validator:
 *    - 所有验证器都应该在 <10ms 完成1000次验证
 *    - isEmail 最快 (~2ms)
 *    - isCreditCard (Luhn) 稍慢 (~5ms) 但仍然很快
 * 
 * 3. AsyncQueue:
 *    - 并发控制会增加少量开销 (~10-20%)
 *    - 但在高并发场景下可以避免资源耗尽
 * 
 * 4. TypedEventEmitter:
 *    - 1个监听器: <1ms (1000次发射)
 *    - 10个监听器: ~5ms
 *    - 100个监听器: ~50ms
 *    - 线性扩展，性能优秀
 * 
 * 5. ColorUtils:
 *    - 所有操作都应该在 <5ms 完成1000次
 *    - 非常高效的字符串和数学运算
 */
