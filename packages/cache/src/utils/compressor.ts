import { COMPRESSION, DATA_SIZE, PERFORMANCE_THRESHOLDS } from '../constants/performance'

/**
 * 压缩算法类型
 */
export type CompressionAlgorithm = 'gzip' | 'deflate' | 'brotli' | 'none'

/**
 * 压缩配置
 */
export interface CompressionOptions {
  /** 是否启用压缩 */
  enabled?: boolean
  /** 压缩算法 */
  algorithm?: CompressionAlgorithm
  /** 最小压缩大小（字节），小于此大小不压缩 */
  minSize?: number
  /** 压缩级别（1-9） */
  level?: number
  /** 自定义压缩函数 */
  customCompress?: (data: string) => Promise<string>
  /** 自定义解压函数 */
  customDecompress?: (data: string) => Promise<string>
}

/**
 * 压缩结果
 */
export interface CompressionResult {
  /** 压缩后的数据 */
  data: string
  /** 原始大小 */
  originalSize: number
  /** 压缩后大小 */
  compressedSize: number
  /** 压缩率 */
  ratio: number
  /** 使用的算法 */
  algorithm: CompressionAlgorithm
}

/**
 * 数据压缩器
 * 
 * 提供数据压缩和解压功能，减少存储占用
 */
export class Compressor {
  private readonly options: Required<CompressionOptions>

  constructor(options: CompressionOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      algorithm: options.algorithm ?? 'gzip',
      minSize: options.minSize ?? DATA_SIZE.COMPRESSION_MIN_SIZE,
      level: options.level ?? COMPRESSION.DEFAULT_LEVEL,
      customCompress: options.customCompress,
      customDecompress: options.customDecompress,
    } as Required<CompressionOptions>
  }

  /**
   * 压缩数据
   */
  async compress(data: string): Promise<CompressionResult> {
    const originalSize = new Blob([data]).size

    // 不压缩小数据
    if (!this.options.enabled || originalSize < this.options.minSize) {
      return {
        data,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        algorithm: 'none',
      }
    }

    // 使用自定义压缩
    if (this.options.customCompress) {
      const compressed = await this.options.customCompress(data)
      const compressedSize = new Blob([compressed]).size
      return {
        data: compressed,
        originalSize,
        compressedSize,
        ratio: compressedSize / originalSize,
        algorithm: 'none',
      }
    }

    // 使用内置压缩
    let compressed: string
    let algorithm: CompressionAlgorithm = this.options.algorithm

    try {
      switch (algorithm) {
        case 'gzip':
          compressed = await this.gzipCompress(data)
          break
        case 'deflate':
          compressed = await this.deflateCompress(data)
          break
        case 'brotli':
          compressed = await this.brotliCompress(data)
          break
        default:
          compressed = data
          algorithm = 'none'
      }
    }
    catch (error) {
      console.warn('Compression failed, using original data:', error)
      compressed = data
      algorithm = 'none'
    }

    const compressedSize = new Blob([compressed]).size

    // 如果压缩后更大，使用原始数据
    if (compressedSize >= originalSize) {
      return {
        data,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        algorithm: 'none',
      }
    }

    return {
      data: compressed,
      originalSize,
      compressedSize,
      ratio: compressedSize / originalSize,
      algorithm,
    }
  }

  /**
   * 解压数据
   */
  async decompress(data: string, algorithm: CompressionAlgorithm): Promise<string> {
    // 使用自定义解压（无论算法是什么）
    if (this.options.customDecompress) {
      return this.options.customDecompress(data)
    }
    
    if (algorithm === 'none') {
      return data
    }

    try {
      switch (algorithm) {
        case 'gzip':
          return await this.gzipDecompress(data)
        case 'deflate':
          return await this.deflateDecompress(data)
        case 'brotli':
          return await this.brotliDecompress(data)
        default:
          return data
      }
    }
    catch (error) {
      console.error('Decompression failed:', error)
      throw new Error(`Failed to decompress data with ${algorithm}`)
    }
  }

  /**
   * GZIP 压缩（使用 CompressionStream）
   */
  private async gzipCompress(data: string): Promise<string> {
    if (typeof CompressionStream === 'undefined') {
      // 回退到简单的 LZ 压缩
      return this.lzCompress(data)
    }

    const encoder = new TextEncoder()

    const input = encoder.encode(data)
    const compressionStream = new CompressionStream('gzip')
    
    const writer = compressionStream.writable.getWriter()
    writer.write(input)
    writer.close()
    
    const compressed = await new Response(compressionStream.readable).arrayBuffer()
    return this.arrayBufferToBase64(compressed)
  }

  /**
   * GZIP 解压
   */
  private async gzipDecompress(data: string): Promise<string> {
    if (typeof DecompressionStream === 'undefined') {
      // 回退到简单的 LZ 解压
      return this.lzDecompress(data)
    }

    const compressed = this.base64ToArrayBuffer(data)
    const decompressionStream = new DecompressionStream('gzip')
    
    const writer = decompressionStream.writable.getWriter()
    writer.write(new Uint8Array(compressed))
    writer.close()
    
    const decompressed = await new Response(decompressionStream.readable).arrayBuffer()
    return new TextDecoder().decode(decompressed)
  }

  /**
   * Deflate 压缩
   */
  private async deflateCompress(data: string): Promise<string> {
    if (typeof CompressionStream === 'undefined') {
      return this.lzCompress(data)
    }

    const encoder = new TextEncoder()
    const input = encoder.encode(data)
    const compressionStream = new CompressionStream('deflate')
    
    const writer = compressionStream.writable.getWriter()
    writer.write(input)
    writer.close()
    
    const compressed = await new Response(compressionStream.readable).arrayBuffer()
    return this.arrayBufferToBase64(compressed)
  }

  /**
   * Deflate 解压
   */
  private async deflateDecompress(data: string): Promise<string> {
    if (typeof DecompressionStream === 'undefined') {
      return this.lzDecompress(data)
    }

    const compressed = this.base64ToArrayBuffer(data)
    const decompressionStream = new DecompressionStream('deflate')
    
    const writer = decompressionStream.writable.getWriter()
    writer.write(new Uint8Array(compressed))
    writer.close()
    
    const decompressed = await new Response(decompressionStream.readable).arrayBuffer()
    return new TextDecoder().decode(decompressed)
  }

  /**
   * Brotli 压缩（需要浏览器支持）
   */
  private async brotliCompress(data: string): Promise<string> {
    // Brotli 在浏览器中支持有限，回退到 LZ
    return this.lzCompress(data)
  }

  /**
   * Brotli 解压
   */
  private async brotliDecompress(data: string): Promise<string> {
    // Brotli 在浏览器中支持有限，回退到 LZ
    return this.lzDecompress(data)
  }

  /**
   * 简单的 LZ 压缩算法（作为后备方案）
   */
  private lzCompress(data: string): string {
    const dict: Record<string, number> = {}
    const result: string[] = []
    let dictSize = 256
    let w = ''

    for (let i = 0; i < data.length; i++) {
      const c = data.charAt(i)
      const wc = w + c
      
      if (dict[wc] !== undefined) {
        w = wc
      }
      else {
        result.push(dict[w] !== undefined ? String.fromCharCode(dict[w]) : w)
        dict[wc] = dictSize++
        w = c
      }
    }

    if (w) {
      result.push(dict[w] !== undefined ? String.fromCharCode(dict[w]) : w)
    }

    return btoa(result.join(''))
  }

  /**
   * 简单的 LZ 解压算法
   */
  private lzDecompress(data: string): string {
    try {
      const compressed = atob(data)
      const dict: Record<number, string> = {}
      let dictSize = 256
      let w = compressed.charAt(0)
      let result = w
      
      for (let i = 0; i < 256; i++) {
        dict[i] = String.fromCharCode(i)
      }

      for (let i = 1; i < compressed.length; i++) {
        const k = compressed.charCodeAt(i)
        const entry = dict[k] !== undefined ? dict[k] : (w + w.charAt(0))
        result += entry
        dict[dictSize++] = w + entry.charAt(0)
        w = entry
      }

      return result
    }
    catch {
      return data
    }
  }

  /**
   * ArrayBuffer 转 Base64（优化版本）
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    const chunkSize = DATA_SIZE.COMPRESSION_CHUNK_SIZE
    const chunks: string[] = []
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
      chunks.push(String.fromCharCode.apply(null, Array.from(chunk)))
    }
    
    return btoa(chunks.join(''))
  }

  /**
   * Base64 转 ArrayBuffer（优化版本）
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    
    // 批量处理以提高性能
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    
    return bytes.buffer
  }

  /**
   * 检测数据是否已压缩
   */
  isCompressed(data: string): boolean {
    // 检查常见的压缩格式魔术字节
    if (data.startsWith('H4sI')) { return true } // GZIP base64
    if (data.startsWith('eJ')) { return true } // Deflate base64
    
    // 检查熵值（压缩数据通常有较高的熵）
    const entropy = this.calculateEntropy(data)
    return entropy > DATA_SIZE.COMPRESSION_ENTROPY_THRESHOLD
  }

  /**
   * 计算数据熵值
   */
  private calculateEntropy(data: string): number {
    const frequencies: Record<string, number> = {}
    
    for (const char of data) {
      frequencies[char] = (frequencies[char] || 0) + 1
    }

    let entropy = 0
    const dataLength = data.length

    for (const freq of Object.values(frequencies)) {
      const p = freq / dataLength
      entropy -= p * Math.log2(p)
    }

    return entropy
  }

  /**
   * 获取压缩统计
   */
  getCompressionStats(data: string): {
    originalSize: number
    potentialSavings: number
    recommendedAlgorithm: CompressionAlgorithm
  } {
    const originalSize = new Blob([data]).size
    
    // 基于数据特征推荐算法
    let recommendedAlgorithm: CompressionAlgorithm = 'none'
    
    if (originalSize < this.options.minSize) {
      recommendedAlgorithm = 'none'
    }
    else if (this.isCompressed(data)) {
      recommendedAlgorithm = 'none'
    }
    else if (originalSize < PERFORMANCE_THRESHOLDS.SMALL_FILE_SIZE) {
      recommendedAlgorithm = 'deflate'
    }
    else {
      recommendedAlgorithm = 'gzip'
    }

    // 估算压缩后大小（基于典型压缩率）
    const estimatedRatio = recommendedAlgorithm === 'none' ? COMPRESSION.NO_COMPRESSION_RATIO : COMPRESSION.TYPICAL_RATIO
    const potentialSavings = originalSize * (1 - estimatedRatio)

    return {
      originalSize,
      potentialSavings,
      recommendedAlgorithm,
    }
  }
}

/**
 * 创建带压缩的缓存装饰器
 */
export function withCompression<T extends { set: any, get: any, has?: any, remove?: any }>(
  cache: T,
  options?: CompressionOptions,
): T {
  const compressor = new Compressor(options)
  const compressionMap = new Map<string, CompressionAlgorithm>()

  // 创建代理对象以保留所有原始方法
  const proxy = Object.create(cache)
  
  // 复制所有属性和方法
  for (const key in cache) {
    if (typeof cache[key] === 'function') {
      proxy[key] = cache[key].bind(cache)
    }
    else {
      proxy[key] = cache[key]
    }
  }
  
  // 重写 set 和 get 方法
  proxy.set = async function (key: string, value: any, setOptions?: any) {
    const serialized = JSON.stringify(value)
    const result = await compressor.compress(serialized)
    
    // 记录使用的算法
    compressionMap.set(key, result.algorithm)
    
    // 存储压缩后的数据
    return cache.set(key, {
      compressed: true,
      algorithm: result.algorithm,
      data: result.data,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
    }, setOptions)
  }
  
  proxy.get = async function (key: string) {
    const stored = await cache.get(key)
    
    if (!stored) { return null }
    
    // 检查是否是压缩数据
    if (stored && typeof stored === 'object' && stored.compressed && stored.algorithm) {
      const decompressed = await compressor.decompress(stored.data, stored.algorithm)
      return JSON.parse(decompressed)
    }
    
    return stored
  }
  
  // 如果存在 has 方法，保留它
  if ('has' in cache && typeof cache.has === 'function') {
    proxy.has = cache.has.bind(cache)
  }
  
  // 如果存在 remove 方法，保留它
  if ('remove' in cache && typeof cache.remove === 'function') {
    proxy.remove = async function (key: string) {
      compressionMap.delete(key)
      return cache.remove(key)
    }
  }
  
  return proxy as T
}
