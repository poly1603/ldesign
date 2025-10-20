/**
 * 流式加密/解密处理
 * 支持大文件和流数据的加密处理，减少内存占用
 */

import type { AESOptions } from '../types'
import { aes } from '../algorithms'
import { RandomUtils } from '../utils'

/**
 * 流式加密选项
 */
export interface StreamOptions {
  /** 块大小（字节） */
  chunkSize?: number
  /** 算法 */
  algorithm?: 'AES' | 'ChaCha20'
  /** 加密选项 */
  encryptionOptions?: AESOptions
  /** 进度回调 */
  onProgress?: (progress: number) => void
  /** 是否启用并行处理 */
  parallel?: boolean
  /** 并行工作线程数 */
  workers?: number
}

/**
 * 流式处理结果
 */
export interface StreamResult {
  /** 是否成功 */
  success: boolean
  /** 处理的字节数 */
  bytesProcessed: number
  /** 总时间（毫秒） */
  timeMs: number
  /** 吞吐量（MB/s） */
  throughput: number
  /** 错误信息 */
  error?: string
}

/**
 * 流式加密器
 */
export class StreamCipher {
  private readonly defaultOptions: Required<StreamOptions> = {
    chunkSize: 64 * 1024, // 64KB chunks
    algorithm: 'AES',
    encryptionOptions: {},
    onProgress: () => {},
    parallel: false,
    workers: 4,
  }

  /**
   * 流式加密文本
   */
  async encryptStream(
    input: ReadableStream<Uint8Array> | string,
    key: string,
    options: StreamOptions = {},
  ): Promise<{
      stream: ReadableStream<Uint8Array>
      metadata: {
        iv: string
        algorithm: string
        chunkSize: number
      }
    }> {
    const opts = { ...this.defaultOptions, ...options }
    const iv = RandomUtils.generateIV(16)

    // 如果输入是字符串，转换为流
    const inputStream = typeof input === 'string'
      ? new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(input))
          controller.close()
        },
      })
      : input

    // 创建转换流
    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        try {
          const encrypted = await encryptChunk(chunk, key, iv, opts.algorithm)
          controller.enqueue(encrypted)
        }
 catch (error) {
          controller.error(error)
        }
      },
    })

    // 连接流
    const outputStream = inputStream.pipeThrough(transformStream)

    return {
      stream: outputStream,
      metadata: {
        iv,
        algorithm: opts.algorithm,
        chunkSize: opts.chunkSize,
      },
    }
  }

  /**
   * 流式解密
   */
  async decryptStream(
    input: ReadableStream<Uint8Array>,
    key: string,
    iv: string,
    options: StreamOptions = {},
  ): Promise<ReadableStream<Uint8Array>> {
    const opts = { ...this.defaultOptions, ...options }

    // 创建转换流
    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        try {
          const decrypted = await decryptChunk(chunk, key, iv, opts.algorithm)
          controller.enqueue(decrypted)
        }
 catch (error) {
          controller.error(error)
        }
      },
    })

    return input.pipeThrough(transformStream)
  }

  /**
   * 处理大文件加密
   */
  async encryptLargeData(
    data: ArrayBuffer | Uint8Array,
    key: string,
    options: StreamOptions = {},
  ): Promise<{
      data: ArrayBuffer
      metadata: {
        iv: string
        algorithm: string
        originalSize: number
      }
    }> {
    const opts = { ...this.defaultOptions, ...options }
    // const _startTime = performance.now() // 未使用

    // 准备数据
    const uint8Data = data instanceof ArrayBuffer ? new Uint8Array(data) : data
    const totalSize = uint8Data.length
    const encryptedChunks: string[] = []
    const iv = RandomUtils.generateIV(16)

    // 分块处理
    let offset = 0
    let processedBytes = 0

    while (offset < totalSize) {
      const chunkSize = Math.min(opts.chunkSize, totalSize - offset)
      const chunk = uint8Data.slice(offset, offset + chunkSize)

      // 加密块
      const encryptedChunk = await this.processChunkEncrypt(
        chunk,
        key,
        iv,
        opts.algorithm,
      )

      encryptedChunks.push(encryptedChunk)

      // 更新进度
      processedBytes += chunkSize
      offset += chunkSize

      if (opts.onProgress) {
        opts.onProgress(processedBytes / totalSize)
      }
    }

    // 合并结果 - 将所有加密块连接成一个字符串，用分隔符分隔
    const combinedEncrypted = encryptedChunks.join('|')
    const result = new TextEncoder().encode(combinedEncrypted)

    // const _endTime = performance.now() // 未使用

    return {
      data: result.buffer,
      metadata: {
        iv,
        algorithm: opts.algorithm,
        originalSize: totalSize,
      },
    }
  }

  /**
   * 处理大文件解密
   */
  async decryptLargeData(
    encryptedData: ArrayBuffer | Uint8Array,
    key: string,
    iv: string,
    options: StreamOptions = {},
  ): Promise<ArrayBuffer> {
    const opts = { ...this.defaultOptions, ...options }
    // const _startTime = performance.now() // 未使用

    // 准备数据 - 将加密数据转换为字符串并分割
    const uint8Data = encryptedData instanceof ArrayBuffer
      ? new Uint8Array(encryptedData)
      : encryptedData
    const combinedEncrypted = new TextDecoder().decode(uint8Data)
    const encryptedChunks = combinedEncrypted.split('|')
    const decryptedChunks: Uint8Array[] = []

    // 分块处理
    let processedChunks = 0

    for (const encryptedChunk of encryptedChunks) {
      if (encryptedChunk.trim() === '') { continue }

      // 解密块
      const decryptedChunk = await this.processChunkDecrypt(
        encryptedChunk,
        key,
        iv,
        opts.algorithm,
      )

      decryptedChunks.push(decryptedChunk)

      // 更新进度
      processedChunks++
      if (opts.onProgress) {
        opts.onProgress(processedChunks / encryptedChunks.length)
      }
    }

    // 合并结果
    const totalLength = decryptedChunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let resultOffset = 0

    for (const chunk of decryptedChunks) {
      result.set(chunk, resultOffset)
      resultOffset += chunk.length
    }

    // const _endTime = performance.now() // 未使用

    return result.buffer
  }

  /**
   * 处理单个块
   */
  private async processChunkEncrypt(
    chunk: Uint8Array,
    key: string,
    iv: string,
    _algorithm: string,
  ): Promise<string> {
    // 将二进制数据转换为Base64字符串进行加密
    const chunkStr = btoa(String.fromCharCode(...chunk))
    const result = aes.encrypt(chunkStr, key, { iv })
    if (result.success && result.data) {
      return result.data
    }
    throw new Error(result.error || 'Encryption failed')
  }

  private async processChunkDecrypt(
    encryptedChunk: string,
    key: string,
    iv: string,
    _algorithm: string,
  ): Promise<Uint8Array> {
    const result = aes.decrypt(encryptedChunk, key, { iv })
    if (result.success && result.data) {
      // 将Base64字符串转换回二进制数据
      try {
        const binaryString = atob(result.data)
        return new Uint8Array(binaryString.split('').map(char => char.charCodeAt(0)))
      }
 catch {
        throw new Error('Failed to decode decrypted data')
      }
    }
    throw new Error(result.error || 'Decryption failed')
  }

  /**
   * 创建加密管道
   */
  createEncryptionPipeline(
    key: string,
    options: StreamOptions = {},
  ): TransformStream<Uint8Array, Uint8Array> {
    const opts = { ...this.defaultOptions, ...options }
    const iv = RandomUtils.generateIV(16)

    return new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        try {
          const encrypted = await encryptChunk(chunk, key, iv, opts.algorithm)
          controller.enqueue(encrypted)
        }
 catch (error) {
          controller.error(error)
        }
      },
    })
  }

  /**
   * 创建解密管道
   */
  createDecryptionPipeline(
    key: string,
    iv: string,
    options: StreamOptions = {},
  ): TransformStream<Uint8Array, Uint8Array> {
    const opts = { ...this.defaultOptions, ...options }

    return new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        try {
          const decrypted = await decryptChunk(chunk, key, iv, opts.algorithm)
          controller.enqueue(decrypted)
        }
 catch (error) {
          controller.error(error)
        }
      },
    })
  }
}

/**
 * 加密块（辅助函数）
 */
async function encryptChunk(
  chunk: Uint8Array,
  key: string,
  iv: string,
  _algorithm: string,
): Promise<Uint8Array> {
  const chunkStr = new TextDecoder().decode(chunk)
  const result = aes.encrypt(chunkStr, key, { iv })

  if (result.success && result.data) {
    return new TextEncoder().encode(result.data)
  }

  throw new Error(result.error || 'Encryption failed')
}

/**
 * 解密块（辅助函数）
 */
async function decryptChunk(
  chunk: Uint8Array,
  key: string,
  iv: string,
  _algorithm: string,
): Promise<Uint8Array> {
  const chunkStr = new TextDecoder().decode(chunk)
  const result = aes.decrypt(chunkStr, key, { iv })

  if (result.success && result.data) {
    return new TextEncoder().encode(result.data)
  }

  throw new Error(result.error || 'Decryption failed')
}

/**
 * 文件加密器
 * 专门处理文件的流式加密
 */
export class FileEncryptor {
  private streamCipher = new StreamCipher()

  /**
   * 加密文件（浏览器环境）
   */
  async encryptFile(
    file: File,
    key: string,
    options: StreamOptions = {},
  ): Promise<{
      blob: Blob
      metadata: {
        originalName: string
        originalSize: number
        mimeType: string
        iv: string
        algorithm: string
        encryptedAt: number
      }
    }> {
    // const _startTime = performance.now() // 未使用

    // 读取文件为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // 加密数据
    const { data, metadata } = await this.streamCipher.encryptLargeData(
      arrayBuffer,
      key,
      options,
    )

    // 创建元数据
    const fullMetadata = {
      originalName: file.name,
      originalSize: file.size,
      mimeType: file.type,
      iv: metadata.iv,
      algorithm: metadata.algorithm,
      encryptedAt: Date.now(),
    }

    // 将元数据添加到加密数据前面
    const metadataStr = JSON.stringify(fullMetadata)
    const metadataBytes = new TextEncoder().encode(metadataStr)
    const metadataLength = new Uint32Array([metadataBytes.length])

    // 合并数据
    const totalLength = 4 + metadataBytes.length + data.byteLength
    const result = new Uint8Array(totalLength)

    result.set(new Uint8Array(metadataLength.buffer), 0)
    result.set(metadataBytes, 4)
    result.set(new Uint8Array(data), 4 + metadataBytes.length)

    // const _endTime = performance.now() // 未使用

    return {
      blob: new Blob([result], { type: 'application/octet-stream' }),
      metadata: fullMetadata,
    }
  }

  /**
   * 解密文件（浏览器环境）
   */
  async decryptFile(
    encryptedBlob: Blob,
    key: string,
    options: StreamOptions = {},
  ): Promise<{
      blob: Blob
      metadata: {
        originalName: string
        originalSize: number
        mimeType: string
        iv: string
        algorithm: string
        encryptedAt: number
      }
    }> {
    // const _startTime = performance.now() // 未使用

    // 读取加密数据
    const arrayBuffer = await encryptedBlob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // 读取元数据长度
    const metadataLength = new Uint32Array(uint8Array.slice(0, 4).buffer)[0]

    // 读取元数据
    const metadataBytes = uint8Array.slice(4, 4 + metadataLength)
    const metadataStr = new TextDecoder().decode(metadataBytes)
    const metadata = JSON.parse(metadataStr)

    // 获取加密数据
    const encryptedData = uint8Array.slice(4 + metadataLength)

    // 解密数据
    const decryptedData = await this.streamCipher.decryptLargeData(
      encryptedData,
      key,
      metadata.iv,
      options,
    )

    // const _endTime = performance.now() // 未使用

    return {
      blob: new Blob([decryptedData], { type: metadata.mimeType }),
      metadata,
    }
  }

  /**
   * 分块加密文件（用于超大文件）
   */
  async *encryptFileChunks(
    file: File,
    key: string,
    chunkSize: number = 1024 * 1024, // 1MB chunks
  ): AsyncGenerator<{
      chunk: Uint8Array
      index: number
      total: number
      progress: number
    }> {
    const iv = RandomUtils.generateIV(16)
    const totalChunks = Math.ceil(file.size / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min((i + 1) * chunkSize, file.size)
      const chunk = file.slice(start, end)

      // 读取块
      const arrayBuffer = await chunk.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // 加密块
      const encryptedChunk = await encryptChunk(uint8Array, key, iv, 'AES')

      yield {
        chunk: encryptedChunk,
        index: i,
        total: totalChunks,
        progress: (i + 1) / totalChunks,
      }
    }
  }
}

// 导出实例
export const streamCipher = new StreamCipher()
export const fileEncryptor = new FileEncryptor()
