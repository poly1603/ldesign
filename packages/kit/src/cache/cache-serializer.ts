/**
 * 缓存序列化器
 * 提供多种序列化策略和数据压缩功能
 */

import { EventEmitter } from 'node:events'

/**
 * 序列化器接口
 */
export interface Serializer {
  serialize: (value: unknown) => string | Buffer
  deserialize: <T = unknown>(data: string | Buffer) => T
  name: string
}

/**
 * 序列化器选项
 */
export interface SerializerOptions {
  compress?: boolean
  compressionLevel?: number
  compressionThreshold?: number
  encoding?: BufferEncoding
}

/**
 * JSON序列化器
 */
export class JSONSerializer implements Serializer {
  readonly name = 'json'

  serialize(value: unknown): string {
    return JSON.stringify(value)
  }

  deserialize<T = unknown>(data: string | Buffer): T {
    const text = Buffer.isBuffer(data) ? data.toString('utf8') : data
    return JSON.parse(text) as T
  }
}

/**
 * MessagePack序列化器
 */
export class MessagePackSerializer implements Serializer {
  readonly name = 'msgpack'

  serialize(_value: unknown): Buffer {
    // 这里需要msgpack库，为了避免依赖，提供抽象实现
    throw new Error('MessagePack serializer requires msgpack library. Please install it.')
  }

  deserialize<T = unknown>(_data: string | Buffer): T {
    // 这里需要msgpack库，为了避免依赖，提供抽象实现
    throw new Error('MessagePack serializer requires msgpack library. Please install it.')
  }
}

/**
 * 原始序列化器（不进行序列化）
 */
export class RawSerializer implements Serializer {
  readonly name = 'raw'

  serialize(value: unknown): string {
    return String(value)
  }

  deserialize<T = unknown>(data: string | Buffer): T {
    const text = Buffer.isBuffer(data) ? data.toString('utf8') : data
    return text as unknown as T
  }
}

/**
 * 缓存序列化器类
 */
export class CacheSerializer extends EventEmitter {
  private serializers: Map<string, Serializer> = new Map()
  private defaultSerializer: string = 'json'
  private options: Required<SerializerOptions>

  constructor(options: SerializerOptions = {}) {
    super()

    this.options = {
      compress: options.compress !== false,
      compressionLevel: options.compressionLevel || 6,
      compressionThreshold: options.compressionThreshold || 1024,
      encoding: options.encoding || 'utf8',
    }

    // 注册默认序列化器
    this.registerSerializer(new JSONSerializer())
    this.registerSerializer(new RawSerializer())
    this.registerSerializer(new MessagePackSerializer())
  }

  /**
   * 注册序列化器
   */
  registerSerializer(serializer: Serializer): void {
    this.serializers.set(serializer.name, serializer)
    this.emit('serializerRegistered', serializer.name)
  }

  /**
   * 获取序列化器
   */
  getSerializer(name?: string): Serializer {
    const serializerName = name || this.defaultSerializer
    const serializer = this.serializers.get(serializerName)

    if (!serializer) {
      throw new Error(`Serializer '${serializerName}' not found`)
    }

    return serializer
  }

  /**
   * 设置默认序列化器
   */
  setDefaultSerializer(name: string): void {
    if (!this.serializers.has(name)) {
      throw new Error(`Serializer '${name}' not found`)
    }

    this.defaultSerializer = name
    this.emit('defaultSerializerChanged', name)
  }

  /**
   * 序列化数据
   */
  async serialize(value: unknown, serializerName?: string): Promise<string | Buffer> {
    try {
      const serializer = this.getSerializer(serializerName)
      let serialized = serializer.serialize(value)

      // 压缩处理
      if (this.options.compress && this.shouldCompress(serialized)) {
        serialized = await this.compress(serialized)
      }

      this.emit('serialized', { serializer: serializer.name, size: this.getSize(serialized) })
      return serialized
    }
    catch (error) {
      this.emit('serializeError', error)
      throw error
    }
  }

  /**
   * 反序列化数据
   */
  async deserialize<T = unknown>(data: string | Buffer, serializerName?: string): Promise<T> {
    try {
      let processedData = data

      // 检查是否是压缩数据
      if (this.isCompressed(data)) {
        processedData = await this.decompress(data)
      }

      const serializer = this.getSerializer(serializerName)
      const result = serializer.deserialize<T>(processedData)

      this.emit('deserialized', { serializer: serializer.name })
      return result
    }
    catch (error) {
      this.emit('deserializeError', error)
      throw error
    }
  }

  /**
   * 检查是否应该压缩
   */
  private shouldCompress(data: string | Buffer): boolean {
    const size = this.getSize(data)
    return size >= this.options.compressionThreshold
  }

  /**
   * 压缩数据
   */
  private async compress(data: string | Buffer): Promise<Buffer> {
    try {
      const { gzip } = await import('node:zlib')
      const { promisify } = await import('node:util')
      const gzipAsync = promisify(gzip)

      const input = Buffer.isBuffer(data) ? data : Buffer.from(data, this.options.encoding)
      const compressed = await gzipAsync(input, { level: this.options.compressionLevel })

      // 添加压缩标识
      const marker = Buffer.from('__GZIP__', 'utf8')
      return Buffer.concat([marker, compressed])
    }
    catch (error) {
      this.emit('compressionError', error)
      throw error
    }
  }

  /**
   * 解压数据
   */
  private async decompress(data: string | Buffer): Promise<string | Buffer> {
    try {
      const { gunzip } = await import('node:zlib')
      const { promisify } = await import('node:util')
      const gunzipAsync = promisify(gunzip)

      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, this.options.encoding)

      // 移除压缩标识
      const marker = Buffer.from('__GZIP__', 'utf8')
      const compressedData = buffer.slice(marker.length)

      const decompressed = await gunzipAsync(compressedData)
      return decompressed
    }
    catch (error) {
      this.emit('decompressionError', error)
      throw error
    }
  }

  /**
   * 检查是否是压缩数据
   */
  private isCompressed(data: string | Buffer): boolean {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, this.options.encoding)
    const marker = Buffer.from('__GZIP__', 'utf8')

    return buffer.length >= marker.length && buffer.subarray(0, marker.length).equals(marker)
  }

  /**
   * 获取数据大小
   */
  private getSize(data: string | Buffer): number {
    return Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data, this.options.encoding)
  }

  /**
   * 批量序列化
   */
  async serializeMany(values: unknown[], serializerName?: string): Promise<(string | Buffer)[]> {
    return Promise.all(values.map(value => this.serialize(value, serializerName)))
  }

  /**
   * 批量反序列化
   */
  async deserializeMany<T = unknown>(
    dataList: (string | Buffer)[],
    serializerName?: string,
  ): Promise<T[]> {
    return Promise.all(dataList.map(data => this.deserialize<T>(data, serializerName)))
  }

  /**
   * 获取序列化统计信息
   */
  getStats(): SerializerStats {
    return {
      availableSerializers: Array.from(this.serializers.keys()),
      defaultSerializer: this.defaultSerializer,
      compressionEnabled: this.options.compress,
      compressionThreshold: this.options.compressionThreshold,
      compressionLevel: this.options.compressionLevel,
    }
  }

  /**
   * 测试序列化性能
   */
  async benchmark(value: unknown, iterations = 1000): Promise<BenchmarkResult> {
    const results: BenchmarkResult = {
      serializers: {},
      testValue: typeof value,
      iterations,
    }

    for (const [name] of this.serializers) {
      try {
        const startTime = process.hrtime.bigint()

        for (let i = 0; i < iterations; i++) {
          const serialized = await this.serialize(value, name)
          await this.deserialize(serialized, name)
        }

        const endTime = process.hrtime.bigint()
        const duration = Number(endTime - startTime) / 1000000 // 转换为毫秒

        const serialized = await this.serialize(value, name)
        const size = this.getSize(serialized)

        results.serializers[name] = {
          duration,
          averageTime: duration / iterations,
          serializedSize: size,
          compressionRatio: this.getSize(JSON.stringify(value)) / size,
        }
      }
      catch (error) {
        results.serializers[name] = {
          duration: -1,
          averageTime: -1,
          serializedSize: -1,
          compressionRatio: -1,
          error: String(error),
        }
      }
    }

    return results
  }

  /**
   * 验证序列化器
   */
  async validateSerializer(
    name: string,
    testValue: unknown = { test: 'data', number: 42, array: [1, 2, 3] },
  ): Promise<boolean> {
    try {
      const serialized = await this.serialize(testValue, name)
      const deserialized = await this.deserialize(serialized, name)

      return JSON.stringify(testValue) === JSON.stringify(deserialized)
    }
    catch (error) {
      this.emit('validationError', { serializer: name, error })
      return false
    }
  }

  /**
   * 获取可用序列化器列表
   */
  getAvailableSerializers(): string[] {
    return Array.from(this.serializers.keys())
  }

  /**
   * 移除序列化器
   */
  removeSerializer(name: string): boolean {
    if (name === this.defaultSerializer) {
      throw new Error('Cannot remove default serializer')
    }

    const removed = this.serializers.delete(name)
    if (removed) {
      this.emit('serializerRemoved', name)
    }

    return removed
  }

  /**
   * 清空所有序列化器
   */
  clear(): void {
    this.serializers.clear()
    this.emit('cleared')
  }

  /**
   * 创建序列化器实例
   */
  static create(options?: SerializerOptions): CacheSerializer {
    return new CacheSerializer(options)
  }

  /**
   * 创建带自定义序列化器的实例
   */
  static createWithSerializers(
    serializers: Serializer[],
    options?: SerializerOptions,
  ): CacheSerializer {
    const instance = new CacheSerializer(options)

    for (const serializer of serializers) {
      instance.registerSerializer(serializer)
    }

    return instance
  }
}

/**
 * 序列化器统计信息
 */
export interface SerializerStats {
  availableSerializers: string[]
  defaultSerializer: string
  compressionEnabled: boolean
  compressionThreshold: number
  compressionLevel: number
}

/**
 * 基准测试结果
 */
export interface BenchmarkResult {
  serializers: Record<
    string,
    {
      duration: number
      averageTime: number
      serializedSize: number
      compressionRatio: number
      error?: string
    }
  >
  testValue: string
  iterations: number
}
