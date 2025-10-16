/**
 * 数据压缩工具
 * 提供加密前的数据压缩功能，减小加密数据体积
 */

import CryptoJS from 'crypto-js'

/**
 * 压缩选项
 */
export interface CompressionOptions {
  /** 压缩级别 (1-9, 默认6) */
  level?: number
  /** 是否使用Base64编码输出 */
  base64?: boolean
}

/**
 * 压缩结果
 */
export interface CompressionResult {
  /** 是否成功 */
  success: boolean
  /** 压缩后的数据 */
  data: string
  /** 原始大小（字节） */
  originalSize: number
  /** 压缩后大小（字节） */
  compressedSize: number
  /** 压缩率 */
  compressionRatio: number
  /** 错误信息 */
  error?: string
}

/**
 * 解压缩结果
 */
export interface DecompressionResult {
  /** 是否成功 */
  success: boolean
  /** 解压后的数据 */
  data: string
  /** 错误信息 */
  error?: string
}

/**
 * 数据压缩工具类
 * 
 * 使用简单的RLE（Run-Length Encoding）和字典压缩算法
 * 适用于文本数据的压缩
 */
export class DataCompressor {
  /**
   * 压缩数据
   * 
   * @param data 要压缩的数据
   * @param options 压缩选项
   * @returns 压缩结果
   * 
   * @example
   * ```typescript
   * const result = DataCompressor.compress('Hello World Hello World')
   *  // 压缩率
   * ```
   */
  static compress(data: string, options: CompressionOptions = {}): CompressionResult {
    try {
      const originalSize = new Blob([data]).size
      
      // 使用简单的字典压缩
      let compressed = this.dictionaryCompress(data)
      
      // 如果需要Base64编码
      if (options.base64) {
        compressed = CryptoJS.enc.Base64.stringify(
          CryptoJS.enc.Utf8.parse(compressed)
        )
      }
      
      const compressedSize = new Blob([compressed]).size
      const compressionRatio = originalSize > 0 
        ? ((originalSize - compressedSize) / originalSize) * 100 
        : 0

      return {
        success: true,
        data: compressed,
        originalSize,
        compressedSize,
        compressionRatio,
      }
    }
    catch (error) {
      return {
        success: false,
        data: '',
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * 解压缩数据
   * 
   * @param compressedData 压缩的数据
   * @param options 解压选项
   * @returns 解压结果
   * 
   * @example
   * ```typescript
   * const result = DataCompressor.decompress(compressed.data)
   *  // 原始数据
   * ```
   */
  static decompress(
    compressedData: string,
    options: CompressionOptions = {}
  ): DecompressionResult {
    try {
      let data = compressedData
      
      // 如果是Base64编码，先解码
      if (options.base64) {
        data = CryptoJS.enc.Utf8.stringify(
          CryptoJS.enc.Base64.parse(data)
        )
      }
      
      // 解压缩
      const decompressed = this.dictionaryDecompress(data)

      return {
        success: true,
        data: decompressed,
      }
    }
    catch (error) {
      return {
        success: false,
        data: '',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * 字典压缩算法
   * 查找重复的字符串模式并用较短的标记替换
   */
  private static dictionaryCompress(data: string): string {
    if (data.length < 10) {
      return data // 太短的数据不压缩
    }

    const dictionary: Map<string, string> = new Map()
    let dictIndex = 0
    let result = data
    
    // 查找重复的3-20字符的子串
    for (let len = 20; len >= 3; len--) {
      const patterns: Map<string, number> = new Map()
      
      for (let i = 0; i <= data.length - len; i++) {
        const pattern = data.substring(i, i + len)
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1)
      }
      
      // 只压缩出现2次以上的模式
      for (const [pattern, count] of patterns.entries()) {
        if (count >= 2 && pattern.length > 3) {
          const token = `\x00${dictIndex}\x00`
          if (token.length < pattern.length) {
            dictionary.set(token, pattern)
            result = result.split(pattern).join(token)
            dictIndex++
          }
        }
      }
    }
    
    // 如果有字典，添加字典头
    if (dictionary.size > 0) {
      const dictStr = JSON.stringify(Array.from(dictionary.entries()))
      return `\x01${dictStr}\x01${result}`
    }
    
    return result
  }

  /**
   * 字典解压缩算法
   */
  private static dictionaryDecompress(data: string): string {
    // 检查是否有字典头
    if (!data.startsWith('\x01')) {
      return data
    }
    
    const endOfDict = data.indexOf('\x01', 1)
    if (endOfDict === -1) {
      return data
    }
    
    const dictStr = data.substring(1, endOfDict)
    let result = data.substring(endOfDict + 1)
    
    try {
      const dictArray = JSON.parse(dictStr) as Array<[string, string]>
      const dictionary = new Map(dictArray)
      
      // 替换回原始字符串
      for (const [token, pattern] of dictionary.entries()) {
        result = result.split(token).join(pattern)
      }
      
      return result
    }
    catch {
      return data // 如果解析失败，返回原始数据
    }
  }

  /**
   * 估算压缩效果
   * 
   * @param data 要压缩的数据
   * @returns 预估的压缩率
   */
  static estimateCompressionRatio(data: string): number {
    if (data.length < 100) {
      return 0 // 太短的数据压缩效果不明显
    }
    
    // 计算重复字符的比例
    const charCount: Map<string, number> = new Map()
    for (const char of data) {
      charCount.set(char, (charCount.get(char) || 0) + 1)
    }
    
    let repetitions = 0
    for (const count of charCount.values()) {
      if (count > 1) {
        repetitions += count - 1
      }
    }
    
    return (repetitions / data.length) * 100
  }

  /**
   * 判断数据是否值得压缩
   * 
   * @param data 要检查的数据
   * @returns 是否建议压缩
   */
  static shouldCompress(data: string): boolean {
    // 小于100字节的数据不建议压缩
    if (data.length < 100) {
      return false
    }
    
    // 预估压缩率大于10%才建议压缩
    return this.estimateCompressionRatio(data) > 10
  }
}

/**
 * 便捷的压缩函数
 */
export function compress(data: string, options?: CompressionOptions): CompressionResult {
  return DataCompressor.compress(data, options)
}

/**
 * 便捷的解压缩函数
 */
export function decompress(data: string, options?: CompressionOptions): DecompressionResult {
  return DataCompressor.decompress(data, options)
}

