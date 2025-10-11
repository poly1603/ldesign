/**
 * Stream Encryption Module
 * 流式加密模块
 * 
 * 提供大文件加密/解密支持，避免内存溢出
 * 
 * @example
 * ```typescript
 * import { encryptFile, decryptFile } from '@ldesign/crypto/stream'
 * 
 * // 加密大文件
 * const result = await encryptFile({
 *   inputPath: './large-file.dat',
 *   outputPath: './large-file.enc',
 *   algorithm: 'AES',
 *   key: 'my-secret-key',
 *   options: { keySize: 256, mode: 'CBC' },
 *   onProgress: (progress) => {
 *     console.log(`Progress: ${progress.percentage.toFixed(2)}%`)
 *     console.log(`Speed: ${(progress.speed / 1024 / 1024).toFixed(2)} MB/s`)
 *   }
 * })
 * 
 * console.log(`Encrypted ${result.bytesProcessed} bytes in ${result.duration}ms`)
 * 
 * // 解密文件
 * const decResult = await decryptFile({
 *   inputPath: './large-file.enc',
 *   outputPath: './large-file-decrypted.dat',
 *   algorithm: 'AES',
 *   key: 'my-secret-key',
 *   options: { keySize: 256, mode: 'CBC' },
 * })
 * ```
 */

// 导出类型
export type {
  StreamEncryptionOptions,
  StreamDecryptionOptions,
  StreamProgress,
  StreamEncryptionResult,
  StreamDecryptionResult,
  FileEncryptionOptions,
  FileDecryptionOptions,
  IStreamProcessor,
  IStreamEncryptor,
  IStreamDecryptor,
} from './types'

// 导出处理器
export { ChunkEncryptor, ChunkDecryptor } from './chunk-processor'

// 导出文件加密/解密函数
export { encryptFile, decryptFile } from './file-crypto'
