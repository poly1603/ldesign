/**
 * File Crypto - 文件加密/解密
 * 
 * 支持大文件的流式加密/解密，避免内存溢出
 * 仅在 Node.js 环境中可用
 */

import type {
  FileEncryptionOptions,
  FileDecryptionOptions,
  StreamEncryptionResult,
  StreamDecryptionResult,
  StreamProgress,
} from './types'
import { ChunkEncryptor, ChunkDecryptor } from './chunk-processor'

/**
 * 检查是否在 Node.js 环境
 */
function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined'
    && process.versions != null
    && process.versions.node != null
}

/**
 * 安全地提取错误消息
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return String(error)
}

/**
 * 加密文件
 * 
 * @param options 文件加密选项
 * @returns 加密结果
 */
export async function encryptFile(
  options: FileEncryptionOptions,
): Promise<StreamEncryptionResult> {
  if (!isNodeEnvironment()) {
    throw new Error('File encryption is only available in Node.js environment')
  }

  const fs = require('fs')
  const path = require('path')

  const {
    inputPath,
    outputPath,
    algorithm,
    key,
    options: cryptoOptions = {},
    chunkSize = 64 * 1024, // 64KB
    onProgress,
    overwrite = false,
  } = options

  const startTime = Date.now()
  let bytesProcessed = 0

  try {
    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`)
    }

    // 检查输出文件是否存在
    if (fs.existsSync(outputPath) && !overwrite) {
      throw new Error(`Output file already exists: ${outputPath}`)
    }

    // 获取文件大小
    const stats = fs.statSync(inputPath)
    const totalBytes = stats.size

    // 创建输出目录（如果不存在）
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 创建处理器
    const encryptor = new ChunkEncryptor(algorithm, key, {
      ...cryptoOptions,
      chunkSize,
    })

    // 创建读写流
    const readStream = fs.createReadStream(inputPath, { highWaterMark: chunkSize })
    const writeStream = fs.createWriteStream(outputPath)

    // 处理数据
    await new Promise<void>((resolve, reject) => {
      readStream.on('data', async (chunk: Buffer) => {
        try {
          readStream.pause()

          const encrypted = await encryptor.processChunk(chunk)
          bytesProcessed += chunk.length

          if (encrypted.length > 0) {
            writeStream.write(encrypted)
          }

          // 报告进度
          if (onProgress) {
            const elapsedTime = Date.now() - startTime
            const speed = bytesProcessed / (elapsedTime / 1000)
            const progress: StreamProgress = {
              processedBytes: bytesProcessed,
              totalBytes,
              percentage: (bytesProcessed / totalBytes) * 100,
              speed,
              estimatedTimeRemaining: totalBytes > bytesProcessed
                ? ((totalBytes - bytesProcessed) / speed) * 1000
                : 0,
              elapsedTime,
              status: 'processing',
            }
            onProgress(progress)
          }

          readStream.resume()
        }
        catch (error: unknown) {
          reject(error)
        }
      })

      readStream.on('end', async () => {
        try {
          // 处理剩余数据
          const final = await encryptor.finalize()
          if (final && final.length > 0) {
            writeStream.write(final)
          }

          writeStream.end()
        }
        catch (error) {
          reject(error)
        }
      })

      writeStream.on('finish', () => {
        resolve()
      })

      readStream.on('error', reject)
      writeStream.on('error', reject)
    })

    const duration = Date.now() - startTime
    const averageSpeed = bytesProcessed / (duration / 1000)

    // 最终进度回调
    if (onProgress) {
      onProgress({
        processedBytes: bytesProcessed,
        totalBytes,
        percentage: 100,
        speed: averageSpeed,
        estimatedTimeRemaining: 0,
        elapsedTime: duration,
        status: 'completed',
      })
    }

    return {
      success: true,
      algorithm,
      bytesProcessed,
      duration,
      averageSpeed,
      metadata: {
        inputPath,
        outputPath,
        inputSize: totalBytes,
        outputSize: fs.statSync(outputPath).size,
      },
    }
  }
  catch (error: unknown) {
    const duration = Date.now() - startTime
    const errorMessage = getErrorMessage(error)

    // 错误进度回调
    if (onProgress) {
      onProgress({
        processedBytes: bytesProcessed,
        elapsedTime: duration,
        status: 'error',
        error: errorMessage,
      })
    }

    return {
      success: false,
      algorithm,
      bytesProcessed,
      duration,
      averageSpeed: bytesProcessed / (duration / 1000),
      error: errorMessage,
    }
  }
}

/**
 * 解密文件
 * 
 * @param options 文件解密选项
 * @returns 解密结果
 */
export async function decryptFile(
  options: FileDecryptionOptions,
): Promise<StreamDecryptionResult> {
  if (!isNodeEnvironment()) {
    throw new Error('File decryption is only available in Node.js environment')
  }

  const fs = require('fs')
  const path = require('path')

  const {
    inputPath,
    outputPath,
    algorithm,
    key,
    options: cryptoOptions = {},
    chunkSize = 64 * 1024, // 64KB
    onProgress,
    overwrite = false,
  } = options

  const startTime = Date.now()
  let bytesProcessed = 0

  try {
    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`)
    }

    // 检查输出文件是否存在
    if (fs.existsSync(outputPath) && !overwrite) {
      throw new Error(`Output file already exists: ${outputPath}`)
    }

    // 获取文件大小
    const stats = fs.statSync(inputPath)
    const totalBytes = stats.size

    // 创建输出目录（如果不存在）
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 创建处理器
    const decryptor = new ChunkDecryptor(algorithm, key, {
      ...cryptoOptions,
      chunkSize,
    })

    // 创建读写流
    const readStream = fs.createReadStream(inputPath, { highWaterMark: chunkSize })
    const writeStream = fs.createWriteStream(outputPath)

    // 处理数据
    await new Promise<void>((resolve, reject) => {
      readStream.on('data', async (chunk: Buffer) => {
        try {
          readStream.pause()

          const decrypted = await decryptor.processChunk(chunk)
          bytesProcessed += chunk.length

          if (decrypted.length > 0) {
            writeStream.write(decrypted)
          }

          // 报告进度
          if (onProgress) {
            const elapsedTime = Date.now() - startTime
            const speed = bytesProcessed / (elapsedTime / 1000)
            const progress: StreamProgress = {
              processedBytes: bytesProcessed,
              totalBytes,
              percentage: (bytesProcessed / totalBytes) * 100,
              speed,
              estimatedTimeRemaining: totalBytes > bytesProcessed
                ? ((totalBytes - bytesProcessed) / speed) * 1000
                : 0,
              elapsedTime,
              status: 'processing',
            }
            onProgress(progress)
          }

          readStream.resume()
        }
        catch (error: unknown) {
          reject(error)
        }
      })

      readStream.on('end', async () => {
        try {
          // 处理剩余数据
          const final = await decryptor.finalize()
          if (final && final.length > 0) {
            writeStream.write(final)
          }

          writeStream.end()
        }
        catch (error) {
          reject(error)
        }
      })

      writeStream.on('finish', () => {
        resolve()
      })

      readStream.on('error', reject)
      writeStream.on('error', reject)
    })

    const duration = Date.now() - startTime
    const averageSpeed = bytesProcessed / (duration / 1000)

    // 最终进度回调
    if (onProgress) {
      onProgress({
        processedBytes: bytesProcessed,
        totalBytes,
        percentage: 100,
        speed: averageSpeed,
        estimatedTimeRemaining: 0,
        elapsedTime: duration,
        status: 'completed',
      })
    }

    return {
      success: true,
      algorithm,
      bytesProcessed,
      duration,
      averageSpeed,
      metadata: {
        inputPath,
        outputPath,
        inputSize: totalBytes,
        outputSize: fs.statSync(outputPath).size,
      },
    }
  }
  catch (error: unknown) {
    const duration = Date.now() - startTime
    const errorMessage = getErrorMessage(error)

    // 错误进度回调
    if (onProgress) {
      onProgress({
        processedBytes: bytesProcessed,
        elapsedTime: duration,
        status: 'error',
        error: errorMessage,
      })
    }

    return {
      success: false,
      algorithm,
      bytesProcessed,
      duration,
      averageSpeed: bytesProcessed / (duration / 1000),
      error: errorMessage,
    }
  }
}
