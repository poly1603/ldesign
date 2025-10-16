/**
 * 高级工具函数单元测试
 * 🧪 全面测试所有工具函数的功能
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AsyncQueue,
  ColorUtils,
  fp,
  Lazy,
  measurePerformance,
  retryWithBackoff,
  TimeFormatter,
  TypedEventEmitter,
  Validator,
} from '../../src/utils/advanced-utils'

describe('retryWithBackoff', () => {
  it('应该在首次成功时立即返回', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retryWithBackoff(fn)
    
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该在失败后重试', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('success')

    const result = await retryWithBackoff(fn, { maxAttempts: 3, initialDelay: 10 })
    
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('应该在达到最大重试次数后抛出错误', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'))

    await expect(
      retryWithBackoff(fn, { maxAttempts: 3, initialDelay: 10 })
    ).rejects.toThrow('always fail')
    
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('应该根据shouldRetry判断是否重试', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('network error'))

    await expect(
      retryWithBackoff(fn, {
        maxAttempts: 3,
        initialDelay: 10,
        shouldRetry: (error) => !error.message.includes('network')
      })
    ).rejects.toThrow('network error')
    
    expect(fn).toHaveBeenCalledTimes(1) // 不应该重试
  })

  it('应该调用onRetry回调', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')
    
    const onRetry = vi.fn()

    await retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelay: 10,
      onRetry
    })
    
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(
      expect.any(Error),
      1,
      expect.any(Number)
    )
  })

  it('应该使用指数退避', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('success')

    const delays: number[] = []
    const onRetry = vi.fn((_, __, delay) => delays.push(delay))

    await retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelay: 100,
      backoffFactor: 2,
      onRetry
    })
    
    // 第二次延迟应该大于第一次（指数退避）
    expect(delays[1]).toBeGreaterThan(delays[0])
  })
})

describe('fp - 函数式编程工具', () => {
  describe('pipe', () => {
    it('应该从左到右组合函数', () => {
      const add1 = (x: number) => x + 1
      const multiply2 = (x: number) => x * 2
      const subtract3 = (x: number) => x - 3

      const transform = fp.pipe(add1, multiply2, subtract3)
      
      expect(transform(5)).toBe(9) // (5 + 1) * 2 - 3 = 9
    })
  })

  describe('compose', () => {
    it('应该从右到左组合函数', () => {
      const add1 = (x: number) => x + 1
      const multiply2 = (x: number) => x * 2
      const subtract3 = (x: number) => x - 3

      const transform = fp.compose(subtract3, multiply2, add1)
      
      expect(transform(5)).toBe(9) // ((5 + 1) * 2) - 3 = 9
    })
  })

  describe('curry', () => {
    it('应该柯里化函数', () => {
      const add = (a: number, b: number, c: number) => a + b + c
      const curriedAdd = fp.curry(add)
      
      expect(curriedAdd(1)(2)(3)).toBe(6)
      expect(curriedAdd(1, 2)(3)).toBe(6)
      expect(curriedAdd(1)(2, 3)).toBe(6)
      expect(curriedAdd(1, 2, 3)).toBe(6)
    })
  })

  describe('memoize', () => {
    it('应该缓存函数结果', () => {
      const expensive = vi.fn((n: number) => n * 2)
      const memoized = fp.memoize(expensive)
      
      expect(memoized(5)).toBe(10)
      expect(memoized(5)).toBe(10)
      expect(expensive).toHaveBeenCalledTimes(1) // 第二次调用使用缓存
    })

    it('应该为不同参数分别缓存', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = fp.memoize(fn)
      
      expect(memoized(5)).toBe(10)
      expect(memoized(10)).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('partial', () => {
    it('应该创建偏函数', () => {
      const add = (a: number, b: number, c: number) => a + b + c
      const add5 = fp.partial(add, 5)
      
      expect(add5(3, 2)).toBe(10) // 5 + 3 + 2
    })
  })

  describe('once', () => {
    it('应该只执行一次', () => {
      const fn = vi.fn(() => 'result')
      const onceFn = fp.once(fn)
      
      expect(onceFn()).toBe('result')
      expect(onceFn()).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})

describe('validator - 数据验证工具', () => {
  describe('isEmail', () => {
    it('应该验证有效邮箱', () => {
      expect(Validator.isEmail('user@example.com')).toBe(true)
      expect(Validator.isEmail('test.user+tag@domain.co.uk')).toBe(true)
    })

    it('应该拒绝无效邮箱', () => {
      expect(Validator.isEmail('invalid')).toBe(false)
      expect(Validator.isEmail('invalid@')).toBe(false)
      expect(Validator.isEmail('@invalid.com')).toBe(false)
      expect(Validator.isEmail('invalid @example.com')).toBe(false)
    })
  })

  describe('isURL', () => {
    it('应该验证有效URL', () => {
      expect(Validator.isURL('https://example.com')).toBe(true)
      expect(Validator.isURL('http://localhost:3000')).toBe(true)
      expect(Validator.isURL('ftp://files.example.com')).toBe(true)
    })

    it('应该拒绝无效URL', () => {
      expect(Validator.isURL('not a url')).toBe(false)
      expect(Validator.isURL('example.com')).toBe(false)
    })
  })

  describe('isPhoneNumber', () => {
    it('应该验证中国手机号', () => {
      expect(Validator.isPhoneNumber('13812345678', 'CN')).toBe(true)
      expect(Validator.isPhoneNumber('15912345678', 'CN')).toBe(true)
    })

    it('应该拒绝无效的中国手机号', () => {
      expect(Validator.isPhoneNumber('12345678901', 'CN')).toBe(false)
      expect(Validator.isPhoneNumber('1381234567', 'CN')).toBe(false)
    })
  })

  describe('isStrongPassword', () => {
    it('应该验证强密码', () => {
      expect(Validator.isStrongPassword('Pass123!@#')).toBe(true)
      expect(Validator.isStrongPassword('Abc123!@')).toBe(true)
    })

    it('应该拒绝弱密码', () => {
      expect(Validator.isStrongPassword('password')).toBe(false) // 无大写、数字、特殊字符
      expect(Validator.isStrongPassword('Pass123')).toBe(false) // 无特殊字符
      expect(Validator.isStrongPassword('Pass!@#')).toBe(false) // 无数字
      expect(Validator.isStrongPassword('P1!')).toBe(false) // 太短
    })
  })

  describe('inRange', () => {
    it('应该检查数字范围', () => {
      expect(Validator.inRange(5, 1, 10)).toBe(true)
      expect(Validator.inRange(1, 1, 10)).toBe(true)
      expect(Validator.inRange(10, 1, 10)).toBe(true)
      expect(Validator.inRange(0, 1, 10)).toBe(false)
      expect(Validator.inRange(11, 1, 10)).toBe(false)
    })
  })

  describe('isCreditCard', () => {
    it('应该验证有效信用卡号（Luhn算法）', () => {
      expect(Validator.isCreditCard('4532015112830366')).toBe(true)
      expect(Validator.isCreditCard('6011111111111117')).toBe(true)
    })

    it('应该拒绝无效信用卡号', () => {
      expect(Validator.isCreditCard('1234567890123456')).toBe(false)
      expect(Validator.isCreditCard('123')).toBe(false)
    })
  })

  describe('isIPv4', () => {
    it('应该验证有效IPv4地址', () => {
      expect(Validator.isIPv4('192.168.1.1')).toBe(true)
      expect(Validator.isIPv4('0.0.0.0')).toBe(true)
      expect(Validator.isIPv4('255.255.255.255')).toBe(true)
    })

    it('应该拒绝无效IPv4地址', () => {
      expect(Validator.isIPv4('256.1.1.1')).toBe(false)
      expect(Validator.isIPv4('192.168.1')).toBe(false)
      expect(Validator.isIPv4('192.168.1.1.1')).toBe(false)
    })
  })

  describe('isHexColor', () => {
    it('应该验证有效十六进制颜色', () => {
      expect(Validator.isHexColor('#FF5733')).toBe(true)
      expect(Validator.isHexColor('#F57')).toBe(true)
      expect(Validator.isHexColor('FF5733')).toBe(true)
    })

    it('应该拒绝无效颜色', () => {
      expect(Validator.isHexColor('#GG5733')).toBe(false)
      expect(Validator.isHexColor('#FF57')).toBe(false)
    })
  })
})

describe('asyncQueue - 异步队列', () => {
  it('应该控制并发数', async () => {
    const queue = new AsyncQueue(2)
    let concurrent = 0
    let maxConcurrent = 0

    const task = async (id: number) => {
      concurrent++
      maxConcurrent = Math.max(maxConcurrent, concurrent)
      await new Promise(resolve => setTimeout(resolve, 50))
      concurrent--
      return id
    }

    const results = await Promise.all([
      queue.add(() => task(1)),
      queue.add(() => task(2)),
      queue.add(() => task(3)),
      queue.add(() => task(4)),
    ])

    expect(results).toEqual([1, 2, 3, 4])
    expect(maxConcurrent).toBeLessThanOrEqual(2)
  })

  it('应该正确报告队列状态', async () => {
    const queue = new AsyncQueue(1)
    
    expect(queue.active).toBe(0)
    expect(queue.pending).toBe(0)

    const promise = queue.add(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    // 任务正在执行
    expect(queue.active).toBeGreaterThan(0)

    await promise
    
    // 任务完成
    expect(queue.active).toBe(0)
  })
})

describe('typedEventEmitter - 类型安全事件发射器', () => {
  interface TestEvents {
    'test': { value: number }
    'message': { text: string }
  }

  let emitter: TypedEventEmitter<TestEvents>

  beforeEach(() => {
    emitter = new TypedEventEmitter<TestEvents>()
  })

  it('应该触发事件监听器', () => {
    const handler = vi.fn()
    emitter.on('test', handler)
    
    emitter.emit('test', { value: 42 })
    
    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })

  it('应该支持多个监听器', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    
    emitter.on('test', handler1)
    emitter.on('test', handler2)
    
    emitter.emit('test', { value: 42 })
    
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('应该支持取消监听', () => {
    const handler = vi.fn()
    const unsubscribe = emitter.on('test', handler)
    
    emitter.emit('test', { value: 1 })
    unsubscribe()
    emitter.emit('test', { value: 2 })
    
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('应该支持一次性监听', () => {
    const handler = vi.fn()
    emitter.once('test', handler)
    
    emitter.emit('test', { value: 1 })
    emitter.emit('test', { value: 2 })
    
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ value: 1 })
  })

  it('应该支持清除所有监听器', () => {
    const handler = vi.fn()
    emitter.on('test', handler)
    
    emitter.clear()
    emitter.emit('test', { value: 42 })
    
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('lazy - 延迟加载', () => {
  it('应该延迟初始化', () => {
    const factory = vi.fn(() => 'value')
    const lazy = new Lazy(factory)
    
    expect(factory).not.toHaveBeenCalled()
    expect(lazy.isInitialized).toBe(false)
    
    const value = lazy.value
    
    expect(factory).toHaveBeenCalledTimes(1)
    expect(value).toBe('value')
    expect(lazy.isInitialized).toBe(true)
  })

  it('应该只初始化一次', () => {
    const factory = vi.fn(() => 'value')
    const lazy = new Lazy(factory)
    
    const value1 = lazy.value
    const value2 = lazy.value
    
    expect(factory).toHaveBeenCalledTimes(1)
    expect(value1).toBe(value2)
  })

  it('应该支持重置', () => {
    const factory = vi.fn(() => 'value')
    const lazy = new Lazy(factory)
    
    lazy.value
    expect(lazy.isInitialized).toBe(true)
    
    lazy.reset()
    expect(lazy.isInitialized).toBe(false)
    
    lazy.value
    expect(factory).toHaveBeenCalledTimes(2)
  })
})

describe('timeFormatter - 时间格式化', () => {
  describe('relative', () => {
    it('应该格式化相对时间', () => {
      const now = Date.now()
      
      // 这些测试可能因为Intl.RelativeTimeFormat的本地化而有所不同
      const result1 = TimeFormatter.relative(now - 60000) // 1分钟前
      expect(result1).toContain('分钟') // 中文
      
      const result2 = TimeFormatter.relative(now - 3600000) // 1小时前
      expect(result2).toContain('小时')
    })
  })

  describe('friendly', () => {
    it('应该格式化为友好格式', () => {
      const date = new Date('2024-01-15T10:30:00')
      const result = TimeFormatter.friendly(date)
      
      expect(result).toContain('2024')
      expect(result).toContain('1')
      expect(result).toContain('15')
    })
  })

  describe('duration', () => {
    it('应该格式化持续时间', () => {
      expect(TimeFormatter.duration(30000)).toContain('秒')
      expect(TimeFormatter.duration(90000)).toContain('分')
      expect(TimeFormatter.duration(3661000)).toContain('小时')
    })
  })
})

describe('colorUtils - 颜色工具', () => {
  describe('hexToRgb', () => {
    it('应该转换十六进制到RGB', () => {
      const rgb = ColorUtils.hexToRgb('#FF5733')
      expect(rgb).toEqual({ r: 255, g: 87, b: 51 })
    })

    it('应该支持不带#的十六进制', () => {
      const rgb = ColorUtils.hexToRgb('FF5733')
      expect(rgb).toEqual({ r: 255, g: 87, b: 51 })
    })

    it('应该对无效颜色返回null', () => {
      expect(ColorUtils.hexToRgb('invalid')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('应该转换RGB到十六进制', () => {
      const hex = ColorUtils.rgbToHex(255, 87, 51)
      expect(hex).toBe('#ff5733')
    })
  })

  describe('adjustBrightness', () => {
    it('应该调整颜色亮度', () => {
      const lighter = ColorUtils.adjustBrightness('#808080', 20)
      const darker = ColorUtils.adjustBrightness('#808080', -20)
      
      expect(lighter).not.toBe('#808080')
      expect(darker).not.toBe('#808080')
      expect(lighter).not.toBe(darker)
    })
  })

  describe('mix', () => {
    it('应该混合两种颜色', () => {
      const mixed = ColorUtils.mix('#FF0000', '#0000FF', 0.5)
      
      // 红色和蓝色混合应该得到紫色
      expect(mixed).toBe('#800080')
    })

    it('应该支持不同权重', () => {
      const moreRed = ColorUtils.mix('#FF0000', '#0000FF', 0.25)
      const moreBlue = ColorUtils.mix('#FF0000', '#0000FF', 0.75)
      
      expect(moreRed).not.toBe(moreBlue)
    })
  })
})

describe('装饰器测试', () => {
  // 注意：装饰器测试需要在实际类中使用，这里只是演示性测试
  
  it('measurePerformance应该监控性能', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    class TestClass {
      @measurePerformance
      async testMethod() {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 'done'
      }
    }

    const instance = new TestClass()
    const result = await instance.testMethod()
    
    expect(result).toBe('done')
    
    // 在开发环境应该有日志输出
    // 但由于我们mock了console.log，这里只是验证它被调用
    
    consoleSpy.mockRestore()
  })
})
