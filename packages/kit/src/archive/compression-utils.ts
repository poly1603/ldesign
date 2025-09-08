/**
 * 压缩工具函数
 */

import type { CompressionAlgorithm, CompressionLevel } from '../types'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import {
  createBrotliCompress,
  createBrotliDecompress,
  createDeflate,
  createGunzip,
  createGzip,
  createInflate,
  constants as zlibConstants,
} from 'node:zlib'
import { FileSystem } from '../filesystem'

/**
 * 压缩工具类
 */
export class CompressionUtils {
  /**
   * 压缩数据
   */
  static async compress(
    data: Buffer | string,
    algorithm: CompressionAlgorithm = 'gzip',
    level: CompressionLevel = 6,
  ): Promise<Buffer> {
    const input = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8')

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      let compressor
      switch (algorithm) {
        case 'gzip':
          compressor = createGzip({ level })
          break
        case 'deflate':
          compressor = createDeflate({ level })
          break
        case 'brotli':
          compressor = createBrotliCompress({
            params: {
              [zlibConstants.BROTLI_PARAM_QUALITY]: level,
            },
          })
          break
        default:
          return reject(new Error(`Unsupported compression algorithm: ${algorithm}`))
      }

      compressor.on('data', chunk => chunks.push(chunk))
      compressor.on('end', () => resolve(Buffer.concat(chunks)))
      compressor.on('error', reject)

      compressor.write(input)
      compressor.end()
    })
  }

  /**
   * 解压数据
   */
  static async decompress(data: Buffer, algorithm: CompressionAlgorithm = 'gzip'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      let decompressor
      switch (algorithm) {
        case 'gzip':
          decompressor = createGunzip()
          break
        case 'deflate':
          decompressor = createInflate()
          break
        case 'brotli':
          decompressor = createBrotliDecompress()
          break
        default:
          return reject(new Error(`Unsupported compression algorithm: ${algorithm}`))
      }

      decompressor.on('data', chunk => chunks.push(chunk))
      decompressor.on('end', () => resolve(Buffer.concat(chunks)))
      decompressor.on('error', reject)

      decompressor.write(data)
      decompressor.end()
    })
  }

  /**
   * 压缩文件
   */
  static async compressFile(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm = 'gzip',
    level: CompressionLevel = 6,
  ): Promise<void> {
    const input = createReadStream(inputPath)
    const output = createWriteStream(outputPath)

    let compressor
    switch (algorithm) {
      case 'gzip':
        compressor = createGzip({ level })
        break
      case 'deflate':
        compressor = createDeflate({ level })
        break
      case 'brotli':
        compressor = createBrotliCompress({
          params: {
            [zlibConstants.BROTLI_PARAM_QUALITY]: level,
          },
        })
        break
      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`)
    }

    await pipeline(input, compressor, output)
  }

  /**
   * 解压文件
   */
  static async decompressFile(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm = 'gzip',
  ): Promise<void> {
    const input = createReadStream(inputPath)
    const output = createWriteStream(outputPath)

    let decompressor
    switch (algorithm) {
      case 'gzip':
        decompressor = createGunzip()
        break
      case 'deflate':
        decompressor = createInflate()
        break
      case 'brotli':
        decompressor = createBrotliDecompress()
        break
      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`)
    }

    await pipeline(input, decompressor, output)
  }

  /**
   * 计算压缩比
   */
  static calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0)
      return 0
    return ((originalSize - compressedSize) / originalSize) * 100
  }

  /**
   * 获取最佳压缩算法
   */
  static async getBestCompressionAlgorithm(
    data: Buffer,
    algorithms: CompressionAlgorithm[] = ['gzip', 'deflate', 'brotli'],
  ): Promise<{
      algorithm: CompressionAlgorithm
      compressedSize: number
      compressionRatio: number
      compressionTime: number
    }> {
    const results = []

    for (const algorithm of algorithms) {
      const startTime = Date.now()
      try {
        const compressed = await this.compress(data, algorithm)
        const compressionTime = Date.now() - startTime
        const compressionRatio = this.calculateCompressionRatio(data.length, compressed.length)

        results.push({
          algorithm,
          compressedSize: compressed.length,
          compressionRatio,
          compressionTime,
        })
      }
      catch {
        // 跳过不支持的算法
        continue
      }
    }

    if (results.length === 0) {
      throw new Error('No supported compression algorithms found')
    }

    // 选择压缩比最高的算法
    return results.reduce((best, current) =>
      current.compressionRatio > best.compressionRatio ? current : best,
    )
  }

  /**
   * 批量压缩文件
   */
  static async compressFiles(
    files: Array<{ input: string, output: string }>,
    algorithm: CompressionAlgorithm = 'gzip',
    level: CompressionLevel = 6,
    concurrency: number = 4,
  ): Promise<Array<{ input: string, output: string, success: boolean, error?: string }>> {
    const semaphore = Array.from({ length: concurrency }, () => null as number | null)

    const processFile = async (file: { input: string, output: string }) => {
      try {
        await this.compressFile(file.input, file.output, algorithm, level)
        return { ...file, success: true }
      }
      catch (error) {
        return {
          ...file,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    const promises = files.map(async (file, index) => {
      // 等待信号量
      await new Promise((resolve) => {
        const check = () => {
          const available = semaphore.findIndex(slot => slot === null)
          if (available !== -1) {
            semaphore[available] = index
            resolve(available)
          }
          else {
            setTimeout(check, 10)
          }
        }
        check()
      })

      try {
        const result = await processFile(file)
        // 释放信号量
        const slotIndex = semaphore.indexOf(index)
        if (slotIndex !== -1) {
          semaphore[slotIndex] = null
        }
        return result
      }
      catch (error) {
        // 释放信号量
        const slotIndex = semaphore.indexOf(index)
        if (slotIndex !== -1) {
          semaphore[slotIndex] = null
        }
        throw error
      }
    })

    return Promise.all(promises)
  }

  /**
   * 检测文件压缩类型
   */
  static async detectCompressionType(filePath: string): Promise<CompressionAlgorithm | null> {
    const buffer = Buffer.alloc(10)
    const file = await FileSystem.readFile(filePath)
    const fileBuf: Buffer = Buffer.isBuffer(file) ? (file as Buffer) : Buffer.from(file as string | Uint8Array)

    if (fileBuf.length < 10)
      return null

    // Copy first 10 bytes to buffer for magic number detection
    fileBuf.copy(buffer, 0, 0, 10)

    // GZIP 魔数: 1f 8b
    if (buffer[0] === 0x1F && buffer[1] === 0x8B) {
      return 'gzip'
    }

    // DEFLATE 通常没有固定魔数，但可以通过 zlib 头部检测
    if (buffer[0] === 0x78) {
      const check = buffer[1]
      if (check !== undefined && ((check & 0x9C) === 0x9C || (check & 0xDA) === 0xDA)) {
        return 'deflate'
      }
    }

    // Brotli 没有标准魔数，但可以尝试解压来检测
    try {
      const testData = fileBuf.slice(0, 100)
      await this.decompress(testData, 'brotli')
      return 'brotli'
    }
    catch {
      // 不是 Brotli 格式
    }

    return null
  }

  /**
   * 获取压缩文件信息
   */
  static async getCompressionInfo(filePath: string): Promise<{
    algorithm: CompressionAlgorithm | null
    originalSize?: number
    compressedSize: number
    compressionRatio?: number
  }> {
    const stats = await FileSystem.stat(filePath)
    const algorithm = await this.detectCompressionType(filePath)

    const info = {
      algorithm,
      compressedSize: stats.size,
      originalSize: undefined as number | undefined,
      compressionRatio: undefined as number | undefined,
    }

    if (algorithm) {
      try {
        const compressed = await FileSystem.readFile(filePath)
        const compressedBuffer = Buffer.isBuffer(compressed) ? compressed : Buffer.from(compressed)
        const decompressed = await this.decompress(compressedBuffer, algorithm)
        info.originalSize = decompressed.length
        info.compressionRatio = this.calculateCompressionRatio(
          decompressed.length,
          compressedBuffer.length,
        )
      }
      catch {
        // 无法解压，可能文件损坏
      }
    }

    return info
  }

  /**
   * 验证压缩文件完整性
   */
  static async validateCompressedFile(
    filePath: string,
    algorithm?: CompressionAlgorithm,
  ): Promise<boolean> {
    try {
      const detectedAlgorithm = algorithm || (await this.detectCompressionType(filePath))
      if (!detectedAlgorithm)
        return false

      const compressed = await FileSystem.readFile(filePath)
      const compressedBuffer = Buffer.isBuffer(compressed) ? compressed : Buffer.from(compressed)
      await this.decompress(compressedBuffer, detectedAlgorithm)

      return true
    }
    catch {
      return false
    }
  }
}
