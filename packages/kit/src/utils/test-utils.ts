/**
 * 测试工具类
 * 提供 Mock、Spy、Stub 等测试辅助功能
 * 
 * @example
 * ```typescript
 * import { MockBuilder, SpyManager, StubManager } from '@ldesign/kit'
 * 
 * // 创建 Mock 对象
 * const mockUser = MockBuilder.create({
 *   id: 1,
 *   name: 'John',
 *   email: 'john@example.com'
 * })
 * 
 * // 创建 Spy
 * const spy = SpyManager.spy(myFunction)
 * spy.callCount // 调用次数
 * spy.calls // 所有调用记录
 * 
 * // 创建 Stub
 * const stub = StubManager.stub()
 * stub.returns(42)
 * stub() // 42
 * ```
 */

/**
 * 函数调用记录
 */
export interface CallRecord {
  /**
   * 调用参数
   */
  args: any[]
  /**
   * 返回值
   */
  returnValue?: any
  /**
   * 抛出的错误
   */
  error?: Error
  /**
   * 调用时间
   */
  timestamp: Date
  /**
   * 执行时间（毫秒）
   */
  duration: number
  /**
   * this 上下文
   */
  context?: any
}

/**
 * Spy 对象
 */
export class Spy<T extends (...args: any[]) => any = any> {
  private original: T
  private calls: CallRecord[] = []
  private wrapped: T

  constructor(fn: T) {
    this.original = fn

    // 创建包装函数
    this.wrapped = ((...args: any[]) => {
      const startTime = Date.now()
      const callRecord: CallRecord = {
        args,
        timestamp: new Date(),
        duration: 0,
        context: this,
      }

      try {
        const result = this.original.apply(this, args)

        // 处理 Promise
        if (result && typeof result.then === 'function') {
          return result.then(
            (value: any) => {
              callRecord.returnValue = value
              callRecord.duration = Date.now() - startTime
              this.calls.push(callRecord)
              return value
            },
            (error: Error) => {
              callRecord.error = error
              callRecord.duration = Date.now() - startTime
              this.calls.push(callRecord)
              throw error
            },
          )
        }

        callRecord.returnValue = result
        callRecord.duration = Date.now() - startTime
        this.calls.push(callRecord)
        return result
      }
      catch (error) {
        callRecord.error = error as Error
        callRecord.duration = Date.now() - startTime
        this.calls.push(callRecord)
        throw error
      }
    }) as T
  }

  /**
   * 获取包装后的函数
   */
  get function(): T {
    return this.wrapped
  }

  /**
   * 获取调用次数
   */
  get callCount(): number {
    return this.calls.length
  }

  /**
   * 获取所有调用记录
   */
  get callRecords(): CallRecord[] {
    return [...this.calls]
  }

  /**
   * 获取第 n 次调用的参数
   */
  getCall(index: number): CallRecord | undefined {
    return this.calls[index]
  }

  /**
   * 获取第一次调用的参数
   */
  get firstCall(): CallRecord | undefined {
    return this.calls[0]
  }

  /**
   * 获取最后一次调用的参数
   */
  get lastCall(): CallRecord | undefined {
    return this.calls[this.calls.length - 1]
  }

  /**
   * 检查是否被调用过
   */
  get called(): boolean {
    return this.calls.length > 0
  }

  /**
   * 检查是否只被调用过一次
   */
  get calledOnce(): boolean {
    return this.calls.length === 1
  }

  /**
   * 检查是否被调用过两次
   */
  get calledTwice(): boolean {
    return this.calls.length === 2
  }

  /**
   * 检查是否被调用指定次数
   */
  calledTimes(times: number): boolean {
    return this.calls.length === times
  }

  /**
   * 检查是否以指定参数被调用过
   */
  calledWith(...args: any[]): boolean {
    return this.calls.some(call =>
      args.every((arg, index) => call.args[index] === arg),
    )
  }

  /**
   * 重置调用记录
   */
  reset(): void {
    this.calls = []
  }

  /**
   * 恢复原始函数
   */
  restore(): T {
    return this.original
  }
}

/**
 * Spy 管理器
 */
export class SpyManager {
  private static spies = new Map<any, Spy>()

  /**
   * 创建 Spy
   */
  static spy<T extends (...args: any[]) => any>(fn: T): Spy<T> {
    const spy = new Spy(fn)
    SpyManager.spies.set(fn, spy)
    return spy
  }

  /**
   * 创建对象方法的 Spy
   */
  static spyOn<T extends object, K extends keyof T>(
    obj: T,
    method: K,
  ): T[K] extends (...args: any[]) => any ? Spy<T[K]> : never {
    const original = obj[method]
    if (typeof original !== 'function') {
      throw new Error(`${String(method)} is not a function`)
    }

    const spy = new Spy(original as any)
    obj[method] = spy.function as any
    SpyManager.spies.set(obj, spy)
    return spy as any
  }

  /**
   * 恢复所有 Spy
   */
  static restoreAll(): void {
    SpyManager.spies.clear()
  }

  /**
   * 重置所有 Spy
   */
  static resetAll(): void {
    for (const spy of SpyManager.spies.values()) {
      spy.reset()
    }
  }
}

/**
 * Stub 对象
 */
export class Stub<T = any> {
  private returnValue: T | undefined
  private returnValues: T[] = []
  private throwError: Error | undefined
  private implementation: ((...args: any[]) => T) | undefined
  private calls: CallRecord[] = []
  private callIndex = 0

  /**
   * 设置返回值
   */
  returns(value: T): this {
    this.returnValue = value
    return this
  }

  /**
   * 设置按顺序返回的值
   */
  returnsSequence(...values: T[]): this {
    this.returnValues = values
    return this
  }

  /**
   * 设置抛出错误
   */
  throws(error: Error | string): this {
    this.throwError = typeof error === 'string' ? new Error(error) : error
    return this
  }

  /**
   * 设置自定义实现
   */
  callsFake(fn: (...args: any[]) => T): this {
    this.implementation = fn
    return this
  }

  /**
   * 调用 Stub
   */
  call(...args: any[]): T {
    const startTime = Date.now()
    const callRecord: CallRecord = {
      args,
      timestamp: new Date(),
      duration: 0,
    }

    try {
      let result: T

      if (this.throwError) {
        throw this.throwError
      }

      if (this.implementation) {
        result = this.implementation(...args)
      }
      else if (this.returnValues.length > 0) {
        result = this.returnValues[this.callIndex % this.returnValues.length]!
        this.callIndex++
      }
      else {
        result = this.returnValue as T
      }

      callRecord.returnValue = result
      callRecord.duration = Date.now() - startTime
      this.calls.push(callRecord)
      return result
    }
    catch (error) {
      callRecord.error = error as Error
      callRecord.duration = Date.now() - startTime
      this.calls.push(callRecord)
      throw error
    }
  }

  /**
   * 获取调用次数
   */
  get callCount(): number {
    return this.calls.length
  }

  /**
   * 获取所有调用记录
   */
  get callRecords(): CallRecord[] {
    return [...this.calls]
  }

  /**
   * 重置 Stub
   */
  reset(): void {
    this.calls = []
    this.callIndex = 0
  }
}

/**
 * Stub 管理器
 */
export class StubManager {
  /**
   * 创建 Stub
   */
  static stub<T = any>(): Stub<T> {
    return new Stub<T>()
  }

  /**
   * 创建返回指定值的 Stub
   */
  static stubReturns<T = any>(value: T): Stub<T> {
    return new Stub<T>().returns(value)
  }

  /**
   * 创建抛出错误的 Stub
   */
  static stubThrows<T = any>(error: Error | string): Stub<T> {
    return new Stub<T>().throws(error)
  }

  /**
   * 创建使用自定义实现的 Stub
   */
  static stubCallsFake<T = any>(fn: (...args: any[]) => T): Stub<T> {
    return new Stub<T>().callsFake(fn)
  }
}

/**
 * Mock 构建器
 */
export class MockBuilder<T extends object = any> {
  private mockObj: Partial<T> = {}

  /**
   * 创建 Mock 对象
   */
  static create<T extends object>(template?: Partial<T>): T {
    return { ...template } as T
  }

  /**
   * 创建 Mock 函数
   */
  static mockFn<T extends (...args: any[]) => any>(): jest.Mock<ReturnType<T>, Parameters<T>> {
    // 简单的 Mock 函数实现
    const calls: Array<{ args: any[]; returnValue?: any }> = []
    let returnValue: any

    const mockFn = (...args: any[]) => {
      calls.push({ args, returnValue })
      return returnValue
    }

      ; (mockFn as any).mockReturnValue = (value: any) => {
        returnValue = value
        return mockFn
      }

      ; (mockFn as any).calls = calls
      ; (mockFn as any).callCount = () => calls.length
      ; (mockFn as any).reset = () => {
        calls.length = 0
        returnValue = undefined
      }

    return mockFn as any
  }

  /**
   * 添加属性
   */
  add<K extends keyof T>(key: K, value: T[K]): this {
    this.mockObj[key] = value
    return this
  }

  /**
   * 添加方法
   */
  addMethod<K extends keyof T>(
    key: K,
    implementation: T[K],
  ): this {
    this.mockObj[key] = implementation
    return this
  }

  /**
   * 构建 Mock 对象
   */
  build(): T {
    return this.mockObj as T
  }

  /**
   * 创建部分 Mock
   */
  static partial<T extends object>(obj: T, overrides: Partial<T>): T {
    return { ...obj, ...overrides }
  }

  /**
   * 创建深度 Mock
   */
  static deep<T extends object>(template: any): T {
    const handler: ProxyHandler<any> = {
      get(target, prop) {
        if (!(prop in target)) {
          target[prop] = new Proxy({}, handler)
        }
        return target[prop]
      },
    }

    return new Proxy(template || {}, handler)
  }
}

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成随机字符串
   */
  static randomString(length = 10, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
  }

  /**
   * 生成随机数字
   */
  static randomNumber(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成随机布尔值
   */
  static randomBoolean(): boolean {
    return Math.random() < 0.5
  }

  /**
   * 生成随机日期
   */
  static randomDate(start?: Date, end?: Date): Date {
    const startTime = start ? start.getTime() : new Date(2000, 0, 1).getTime()
    const endTime = end ? end.getTime() : Date.now()
    return new Date(startTime + Math.random() * (endTime - startTime))
  }

  /**
   * 生成随机邮箱
   */
  static randomEmail(): string {
    const username = TestDataGenerator.randomString(8, 'abcdefghijklmnopqrstuvwxyz')
    const domain = TestDataGenerator.randomString(6, 'abcdefghijklmnopqrstuvwxyz')
    const tld = ['com', 'net', 'org', 'io'][TestDataGenerator.randomNumber(0, 3)]
    return `${username}@${domain}.${tld}`
  }

  /**
   * 生成随机 URL
   */
  static randomUrl(): string {
    const protocol = ['http', 'https'][TestDataGenerator.randomNumber(0, 1)]
    const domain = TestDataGenerator.randomString(10, 'abcdefghijklmnopqrstuvwxyz')
    const tld = ['com', 'net', 'org', 'io'][TestDataGenerator.randomNumber(0, 3)]
    return `${protocol}://${domain}.${tld}`
  }

  /**
   * 生成随机 UUID
   */
  static randomUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * 生成随机数组
   */
  static randomArray<T>(generator: () => T, length?: number): T[] {
    const len = length ?? TestDataGenerator.randomNumber(5, 10)
    return Array.from({ length: len }, () => generator())
  }

  /**
   * 从数组中随机选择
   */
  static randomChoice<T>(array: T[]): T {
    return array[TestDataGenerator.randomNumber(0, array.length - 1)]!
  }

  /**
   * 生成随机对象
   */
  static randomObject<T extends Record<string, any>>(schema: {
    [K in keyof T]: () => T[K]
  }): T {
    const obj: any = {}
    for (const key in schema) {
      obj[key] = schema[key]()
    }
    return obj
  }
}

/**
 * 时间相关的测试工具
 */
export class TimeUtils {
  private static originalDateNow: typeof Date.now
  private static currentTime: number | undefined

  /**
   * 冻结时间
   */
  static freeze(time?: Date | number): void {
    TimeUtils.originalDateNow = Date.now
    TimeUtils.currentTime = typeof time === 'number' ? time : time?.getTime() ?? Date.now()

    Date.now = () => TimeUtils.currentTime!
  }

  /**
   * 恢复时间
   */
  static restore(): void {
    if (TimeUtils.originalDateNow) {
      Date.now = TimeUtils.originalDateNow
      TimeUtils.currentTime = undefined
    }
  }

  /**
   * 前进时间
   */
  static advance(ms: number): void {
    if (TimeUtils.currentTime !== undefined) {
      TimeUtils.currentTime += ms
    }
  }

  /**
   * 等待指定时间
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 等待条件满足
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    options: { timeout?: number; interval?: number } = {},
  ): Promise<void> {
    const { timeout = 5000, interval = 100 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return
      }
      await TimeUtils.wait(interval)
    }

    throw new Error('Timeout waiting for condition')
  }
}

/**
 * Mock 类型定义（兼容 Jest）
 */
declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T
    mockReturnValue(value: T): this
    calls: Array<{ args: Y; returnValue?: T }>
    callCount(): number
    reset(): void
  }
}





