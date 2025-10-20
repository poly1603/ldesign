/**
 * Crypto Worker - 在 Worker 线程中执行加密/解密操作
 * Web Worker 专用
 */

import type { DecryptResult, EncryptResult } from '../types'
import type { CryptoJSCipherConfig } from '../types/cryptojs'
import CryptoJS from 'crypto-js'
import forge from 'node-forge'
import { createCryptoJSConfig, getErrorMessage } from '../utils/crypto-helpers'

/**
 * Worker 消息类型
 */
export interface WorkerMessage {
  id: string
  type: 'encrypt' | 'decrypt'
  algorithm: string
  data: string
  key: string
  options?: Record<string, unknown>
}

/**
 * Worker 响应类型
 */
export interface WorkerResponse {
  id: string
  result: EncryptResult | DecryptResult
  error?: string
}

/**
 * 执行加密操作
 */
function performEncryption(
  data: string,
  key: string,
  algorithm: string,
  options?: Record<string, unknown>,
): EncryptResult {
  try {
    switch (algorithm.toUpperCase()) {
      case 'AES': {

        const keySize = (options?.keySize as number) || 256
        const mode = (options?.mode as string) || 'CBC'

        // 生成密钥：使用密钥的SHA-256哈希作为确定性盐值（更安全）
        const salt = CryptoJS.SHA256(key)
        const derivedKey = CryptoJS.PBKDF2(key, salt, {
          keySize: keySize / 32,
          iterations: 100000, // OWASP 2023推荐
        })

        // 加密配置（类型安全）
        const config = createCryptoJSConfig({
          mode,
          padding: (options?.padding as string) || 'Pkcs7',
          iv: options?.iv as string | undefined,
        })

        const encrypted = CryptoJS.AES.encrypt(data, derivedKey, config as CryptoJSCipherConfig)

        return {
          success: true,
          data: encrypted.toString(),
          algorithm: 'AES',
          mode,
          keySize,
        }
      }
      
      case 'DES': {
        const mode = (options?.mode as string) || 'CBC'

        const config = createCryptoJSConfig({
          mode,
          iv: options?.iv as string | undefined,
        })

        const encrypted = CryptoJS.DES.encrypt(data, key, config as CryptoJSCipherConfig)

        return {
          success: true,
          data: encrypted.toString(),
          algorithm: 'DES',
          mode,
        }
      }

      case '3DES':
      case 'TRIPLEDES': {
        const mode = (options?.mode as string) || 'CBC'

        const config = createCryptoJSConfig({
          mode,
          iv: options?.iv as string | undefined,
        })

        const encrypted = CryptoJS.TripleDES.encrypt(data, key, config as CryptoJSCipherConfig)

        return {
          success: true,
          data: encrypted.toString(),
          algorithm: '3DES',
          mode,
        }
      }
      
      case 'RSA': {
        const publicKey = forge.pki.publicKeyFromPem(key)
        const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
        })
        
        return {
          success: true,
          data: forge.util.encode64(encrypted),
          algorithm: 'RSA',
        }
      }
      
      default:
        return {
          success: false,
          data: '',
          algorithm,
          error: `Unsupported algorithm: ${algorithm}`,
        }
    }
  }
  catch (error: unknown) {
    return {
      success: false,
      data: '',
      algorithm,
      error: getErrorMessage(error) || 'Encryption failed',
    }
  }
}

/**
 * 执行解密操作
 */
function performDecryption(
  data: string,
  key: string,
  algorithm: string,
  options?: Record<string, unknown>,
): DecryptResult {
  try {
    switch (algorithm.toUpperCase()) {
      case 'AES': {

        const keySize = (options?.keySize as number) || 256
        const mode = (options?.mode as string) || 'CBC'

        // 生成密钥：使用密钥的SHA-256哈希作为确定性盐值（更安全）
        const salt = CryptoJS.SHA256(key)
        const derivedKey = CryptoJS.PBKDF2(key, salt, {
          keySize: keySize / 32,
          iterations: 100000, // OWASP 2023推荐
        })

        // 解密配置（类型安全）
        const config = createCryptoJSConfig({
          mode,
          padding: (options?.padding as string) || 'Pkcs7',
          iv: options?.iv as string | undefined,
        })

        const decrypted = CryptoJS.AES.decrypt(data, derivedKey, config as CryptoJSCipherConfig)
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

        if (!decryptedStr) {
          return {
            success: false,
            data: '',
            algorithm: 'AES',
            mode,
            error: 'Decryption failed - invalid key or corrupted data',
          }
        }

        return {
          success: true,
          data: decryptedStr,
          algorithm: 'AES',
          mode,
        }
      }

      case 'DES': {
        const mode = (options?.mode as string) || 'CBC'

        const config = createCryptoJSConfig({
          mode,
          iv: options?.iv as string | undefined,
        })

        const decrypted = CryptoJS.DES.decrypt(data, key, config as CryptoJSCipherConfig)
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

        if (!decryptedStr) {
          return {
            success: false,
            data: '',
            algorithm: 'DES',
            mode,
            error: 'Decryption failed',
          }
        }

        return {
          success: true,
          data: decryptedStr,
          algorithm: 'DES',
          mode,
        }
      }

      case '3DES':
      case 'TRIPLEDES': {
        const mode = (options?.mode as string) || 'CBC'

        const config = createCryptoJSConfig({
          mode,
          iv: options?.iv as string | undefined,
        })

        const decrypted = CryptoJS.TripleDES.decrypt(data, key, config as CryptoJSCipherConfig)
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

        if (!decryptedStr) {
          return {
            success: false,
            data: '',
            algorithm: '3DES',
            mode,
            error: 'Decryption failed',
          }
        }

        return {
          success: true,
          data: decryptedStr,
          algorithm: '3DES',
          mode,
        }
      }
      
      case 'RSA': {
        const privateKey = forge.pki.privateKeyFromPem(key)
        const encrypted = forge.util.decode64(data)
        const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
        })
        
        return {
          success: true,
          data: decrypted,
          algorithm: 'RSA',
        }
      }
      
      default:
        return {
          success: false,
          data: '',
          algorithm,
          error: `Unsupported algorithm: ${algorithm}`,
        }
    }
  }
  catch (error: unknown) {
    return {
      success: false,
      data: '',
      algorithm,
      error: getErrorMessage(error) || 'Decryption failed',
    }
  }
}

/**
 * 处理 Worker 消息
 */
function handleMessage(message: WorkerMessage): WorkerResponse {
  const { id, type, algorithm, data, key, options } = message
  
  try {
    if (type === 'encrypt') {
      const result = performEncryption(data, key, algorithm, options)
      return { id, result }
    }
    else if (type === 'decrypt') {
      const result = performDecryption(data, key, algorithm, options)
      return { id, result }
    }
    else {
      return {
        id,
        result: {
          success: false,
          data: '',
          algorithm,
          error: `Unknown operation type: ${type}`,
        },
      }
    }
  }
  catch (error: unknown) {
    return {
      id,
      result: {
        success: false,
        data: '',
        algorithm,
        error: getErrorMessage(error) || 'Worker operation failed',
      },
    }
  }
}

// Web Worker 消息监听
if (typeof globalThis !== 'undefined' && 'postMessage' in globalThis) {
  globalThis.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    const response = handleMessage(event.data)
    globalThis.postMessage(response)
  })
}

// 导出处理函数（用于测试）
export { handleMessage, performDecryption, performEncryption }
