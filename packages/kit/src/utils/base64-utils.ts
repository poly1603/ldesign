/**
 * Base64 编码解码工具类
 * 提供 Base64 编码、解码、URL安全编码等功能
 * 
 * @example
 * ```typescript
 * import { Base64Utils } from '@ldesign/kit'
 * 
 * // 编码
 * const encoded = Base64Utils.encode('Hello World')
 * 
 * // 解码
 * const decoded = Base64Utils.decode(encoded)
 * 
 * // URL 安全编码
 * const urlSafe = Base64Utils.encodeUrlSafe('Hello World')
 * ```
 */

/**
 * Base64 编码选项
 */
export interface Base64EncodeOptions {
  /**
   * 是否 URL 安全编码
   */
  urlSafe?: boolean
  /**
   * 是否添加填充
   */
  padding?: boolean
}

/**
 * Base64 解码选项
 */
export interface Base64DecodeOptions {
  /**
   * 是否 URL 安全解码
   */
  urlSafe?: boolean
  /**
   * 字符编码
   */
  encoding?: BufferEncoding
}

/**
 * Base64 工具类
 */
export class Base64Utils {
  /**
   * 编码字符串为 Base64
   * @param str 输入字符串
   * @param options 编码选项
   * @returns Base64 字符串
   */
  static encode(str: string, options: Base64EncodeOptions = {}): string {
    const { urlSafe = false, padding = true } = options

    const buffer = Buffer.from(str, 'utf-8')
    let encoded = buffer.toString('base64')

    if (urlSafe) {
      encoded = Base64Utils.toUrlSafe(encoded)
    }

    if (!padding) {
      encoded = encoded.replace(/=+$/, '')
    }

    return encoded
  }

  /**
   * 解码 Base64 字符串
   * @param str Base64 字符串
   * @param options 解码选项
   * @returns 解码后的字符串
   */
  static decode(str: string, options: Base64DecodeOptions = {}): string {
    const { urlSafe = false, encoding = 'utf-8' } = options

    let processedStr = str

    if (urlSafe) {
      processedStr = Base64Utils.fromUrlSafe(processedStr)
    }

    // 添加缺失的填充
    const padding = 4 - (processedStr.length % 4)
    if (padding !== 4) {
      processedStr += '='.repeat(padding)
    }

    try {
      const buffer = Buffer.from(processedStr, 'base64')
      return buffer.toString(encoding)
    }
    catch {
      throw new Error('Invalid Base64 string')
    }
  }

  /**
   * URL 安全的 Base64 编码
   * @param str 输入字符串
   * @returns URL 安全的 Base64 字符串
   */
  static encodeUrlSafe(str: string): string {
    return Base64Utils.encode(str, { urlSafe: true, padding: false })
  }

  /**
   * URL 安全的 Base64 解码
   * @param str URL 安全的 Base64 字符串
   * @returns 解码后的字符串
   */
  static decodeUrlSafe(str: string): string {
    return Base64Utils.decode(str, { urlSafe: true })
  }

  /**
   * 转换为 URL 安全格式
   * @param str Base64 字符串
   * @returns URL 安全的 Base64 字符串
   */
  static toUrlSafe(str: string): string {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  /**
   * 从 URL 安全格式转换回来
   * @param str URL 安全的 Base64 字符串
   * @returns 标准 Base64 字符串
   */
  static fromUrlSafe(str: string): string {
    return str.replace(/-/g, '+').replace(/_/g, '/')
  }

  /**
   * 编码 Buffer 为 Base64
   * @param buffer Buffer 对象
   * @param options 编码选项
   * @returns Base64 字符串
   */
  static encodeBuffer(buffer: Buffer, options: Base64EncodeOptions = {}): string {
    const { urlSafe = false, padding = true } = options

    let encoded = buffer.toString('base64')

    if (urlSafe) {
      encoded = Base64Utils.toUrlSafe(encoded)
    }

    if (!padding) {
      encoded = encoded.replace(/=+$/, '')
    }

    return encoded
  }

  /**
   * 解码 Base64 为 Buffer
   * @param str Base64 字符串
   * @param options 解码选项
   * @returns Buffer 对象
   */
  static decodeBuffer(str: string, options: Base64DecodeOptions = {}): Buffer {
    const { urlSafe = false } = options

    let processedStr = str

    if (urlSafe) {
      processedStr = Base64Utils.fromUrlSafe(processedStr)
    }

    // 添加缺失的填充
    const padding = 4 - (processedStr.length % 4)
    if (padding !== 4) {
      processedStr += '='.repeat(padding)
    }

    return Buffer.from(processedStr, 'base64')
  }

  /**
   * 编码对象为 Base64 JSON
   * @param obj 对象
   * @param options 编码选项
   * @returns Base64 字符串
   */
  static encodeObject(obj: any, options: Base64EncodeOptions = {}): string {
    const json = JSON.stringify(obj)
    return Base64Utils.encode(json, options)
  }

  /**
   * 解码 Base64 JSON 为对象
   * @param str Base64 字符串
   * @param options 解码选项
   * @returns 对象
   */
  static decodeObject<T = any>(str: string, options: Base64DecodeOptions = {}): T {
    const json = Base64Utils.decode(str, options)
    return JSON.parse(json)
  }

  /**
   * 编码文件内容为 Base64
   * @param filePath 文件路径
   * @param options 编码选项
   * @returns Base64 字符串
   */
  static async encodeFile(filePath: string, options: Base64EncodeOptions = {}): Promise<string> {
    const { promises: fs } = await import('node:fs')
    const buffer = await fs.readFile(filePath)
    return Base64Utils.encodeBuffer(buffer, options)
  }

  /**
   * 解码 Base64 并写入文件
   * @param str Base64 字符串
   * @param filePath 文件路径
   * @param options 解码选项
   */
  static async decodeToFile(str: string, filePath: string, options: Base64DecodeOptions = {}): Promise<void> {
    const { promises: fs } = await import('node:fs')
    const { dirname } = await import('node:path')

    const buffer = Base64Utils.decodeBuffer(str, options)

    const dir = dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(filePath, buffer)
  }

  /**
   * 验证 Base64 字符串
   * @param str 字符串
   * @param urlSafe 是否 URL 安全格式
   * @returns 是否有效
   */
  static isValid(str: string, urlSafe = false): boolean {
    if (!str || typeof str !== 'string') {
      return false
    }

    try {
      let processedStr = str

      if (urlSafe) {
        processedStr = Base64Utils.fromUrlSafe(processedStr)
      }

      // 添加缺失的填充
      const padding = 4 - (processedStr.length % 4)
      if (padding !== 4) {
        processedStr += '='.repeat(padding)
      }

      // 尝试解码
      Buffer.from(processedStr, 'base64')

      // 验证格式
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
      return base64Regex.test(processedStr)
    }
    catch {
      return false
    }
  }

  /**
   * 计算 Base64 编码后的大小
   * @param size 原始大小（字节）
   * @param padding 是否包含填充
   * @returns 编码后的大小（字节）
   */
  static calculateEncodedSize(size: number, padding = true): number {
    const base = Math.ceil(size / 3) * 4
    return padding ? base : base - (3 - (size % 3)) % 3
  }

  /**
   * 计算 Base64 解码后的大小
   * @param str Base64 字符串
   * @returns 解码后的大小（字节）
   */
  static calculateDecodedSize(str: string): number {
    let len = str.length
    let padding = 0

    if (str.endsWith('==')) {
      padding = 2
    }
    else if (str.endsWith('=')) {
      padding = 1
    }

    return Math.floor(len / 4) * 3 - padding
  }

  /**
   * 流式编码（用于大文件）
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径
   * @param options 编码选项
   */
  static async encodeStream(
    inputPath: string,
    outputPath: string,
    options: Base64EncodeOptions = {},
  ): Promise<void> {
    const { createReadStream, createWriteStream } = await import('node:fs')
    const { Transform } = await import('node:stream')
    const { pipeline } = await import('node:stream/promises')

    const { urlSafe = false } = options

    const encoder = new Transform({
      transform(chunk: Buffer, _, callback) {
        let encoded = chunk.toString('base64')
        if (urlSafe) {
          encoded = Base64Utils.toUrlSafe(encoded)
        }
        callback(null, encoded)
      },
    })

    await pipeline(
      createReadStream(inputPath),
      encoder,
      createWriteStream(outputPath),
    )
  }

  /**
   * 流式解码（用于大文件）
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径
   * @param options 解码选项
   */
  static async decodeStream(
    inputPath: string,
    outputPath: string,
    options: Base64DecodeOptions = {},
  ): Promise<void> {
    const { createReadStream, createWriteStream } = await import('node:fs')
    const { Transform } = await import('node:stream')
    const { pipeline } = await import('node:stream/promises')

    const { urlSafe = false } = options

    const decoder = new Transform({
      transform(chunk: Buffer, _, callback) {
        let str = chunk.toString('utf-8')
        if (urlSafe) {
          str = Base64Utils.fromUrlSafe(str)
        }
        const buffer = Buffer.from(str, 'base64')
        callback(null, buffer)
      },
    })

    await pipeline(
      createReadStream(inputPath),
      decoder,
      createWriteStream(outputPath),
    )
  }

  /**
   * Data URL 编码
   * @param data 数据
   * @param mimeType MIME 类型
   * @returns Data URL
   */
  static encodeDataUrl(data: string | Buffer, mimeType = 'text/plain'): string {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
  }

  /**
   * Data URL 解码
   * @param dataUrl Data URL
   * @returns 解码后的数据和 MIME 类型
   */
  static decodeDataUrl(dataUrl: string): { data: Buffer; mimeType: string } {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!match || !match[1] || !match[2]) {
      throw new Error('Invalid Data URL')
    }

    const mimeType = match[1]
    const base64 = match[2]
    const data = Buffer.from(base64, 'base64')

    return { data, mimeType }
  }

  /**
   * 批量编码
   * @param items 项目数组
   * @param options 编码选项
   * @returns 编码后的数组
   */
  static encodeBatch(items: string[], options: Base64EncodeOptions = {}): string[] {
    return items.map(item => Base64Utils.encode(item, options))
  }

  /**
   * 批量解码
   * @param items Base64 字符串数组
   * @param options 解码选项
   * @returns 解码后的数组
   */
  static decodeBatch(items: string[], options: Base64DecodeOptions = {}): string[] {
    return items.map(item => Base64Utils.decode(item, options))
  }

  /**
   * 安全解码（不抛出异常）
   * @param str Base64 字符串
   * @param options 解码选项
   * @returns 解码后的字符串，失败返回 null
   */
  static safeDecode(str: string, options: Base64DecodeOptions = {}): string | null {
    try {
      return Base64Utils.decode(str, options)
    }
    catch {
      return null
    }
  }

  /**
   * 比较两个 Base64 字符串是否相等（解码后比较）
   * @param str1 Base64 字符串1
   * @param str2 Base64 字符串2
   * @returns 是否相等
   */
  static equals(str1: string, str2: string): boolean {
    try {
      const decoded1 = Base64Utils.decode(str1)
      const decoded2 = Base64Utils.decode(str2)
      return decoded1 === decoded2
    }
    catch {
      return false
    }
  }
}



