/**
 * Crypto Worker - 在 Worker 线程中执行加密/解密操作
 * 支持 Web Worker (浏览器) 和 Worker Threads (Node.js)
 */

import type { EncryptResult, DecryptResult } from '../types'

/**
 * Worker 消息类型
 */
export interface WorkerMessage {
  id: string
  type: 'encrypt' | 'decrypt'
  algorithm: string
  data: string
  key: string
  options?: Record<string, any>
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
  options?: Record<string, any>,
): EncryptResult {
  try {
    switch (algorithm.toUpperCase()) {
      case 'AES': {
        // 动态导入避免循环依赖
        const CryptoJS = require('crypto-js')
        
        const keySize = options?.keySize || 256
        const mode = options?.mode || 'CBC'
        const padding = options?.padding || 'Pkcs7'
        
        // 生成密钥
        const derivedKey = CryptoJS.PBKDF2(key, 'salt', {
          keySize: keySize / 32,
          iterations: 1000,
        })
        
        // 加密配置
        const config: any = {
          mode: (CryptoJS.mode as any)[mode],
          padding: (CryptoJS.pad as any)[padding],
        }
        
        if (mode !== 'ECB' && options?.iv) {
          config.iv = CryptoJS.enc.Utf8.parse(options.iv)
        }
        
        const encrypted = CryptoJS.AES.encrypt(data, derivedKey, config)
        
        return {
          success: true,
          data: encrypted.toString(),
          algorithm: 'AES',
          mode,
          keySize,
        }
      }
      
      case 'DES': {
        const CryptoJS = require('crypto-js')
        const mode = options?.mode || 'CBC'
        
        const config: any = {
          mode: (CryptoJS.mode as any)[mode],
        }
        
        const encrypted = CryptoJS.DES.encrypt(data, key, config)
        
        return {
          success: true,
          data: encrypted.toString(),
          algorithm: 'DES',
          mode,
        }
      }
      
      case '3DES':
      case 'TRIPLEDES': {
        const CryptoJS = require('crypto-js')
        const mode = options?.mode || 'CBC'
        
        const config: any = {
          mode: (CryptoJS.mode as any)[mode],
        }
        
        const encrypted = CryptoJS.TripleDES.encrypt(data, key, config)
        
        return {
          success: true,
          data: encrypted.toString(),
          algorithm: '3DES',
          mode,
        }
      }
      
      case 'RSA': {
        const forge = require('node-forge')
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
  catch (error: any) {
    return {
      success: false,
      data: '',
      algorithm,
      error: error.message || 'Encryption failed',
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
  options?: Record<string, any>,
): DecryptResult {
  try {
    switch (algorithm.toUpperCase()) {
      case 'AES': {
        const CryptoJS = require('crypto-js')
        
        const keySize = options?.keySize || 256
        const mode = options?.mode || 'CBC'
        const padding = options?.padding || 'Pkcs7'
        
        // 生成密钥
        const derivedKey = CryptoJS.PBKDF2(key, 'salt', {
          keySize: keySize / 32,
          iterations: 1000,
        })
        
        // 解密配置
        const config: any = {
          mode: (CryptoJS.mode as any)[mode],
          padding: (CryptoJS.pad as any)[padding],
        }
        
        if (mode !== 'ECB' && options?.iv) {
          config.iv = CryptoJS.enc.Utf8.parse(options.iv)
        }
        
        const decrypted = CryptoJS.AES.decrypt(data, derivedKey, config)
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
        const CryptoJS = require('crypto-js')
        const mode = options?.mode || 'CBC'
        
        const config: any = {
          mode: (CryptoJS.mode as any)[mode],
        }
        
        const decrypted = CryptoJS.DES.decrypt(data, key, config)
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
        const CryptoJS = require('crypto-js')
        const mode = options?.mode || 'CBC'
        
        const config: any = {
          mode: (CryptoJS.mode as any)[mode],
        }
        
        const decrypted = CryptoJS.TripleDES.decrypt(data, key, config)
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
        const forge = require('node-forge')
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
  catch (error: any) {
    return {
      success: false,
      data: '',
      algorithm,
      error: error.message || 'Decryption failed',
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
  catch (error: any) {
    return {
      id,
      result: {
        success: false,
        data: '',
        algorithm,
        error: error.message || 'Worker operation failed',
      },
    }
  }
}

// 环境检测和消息监听
if (typeof self !== 'undefined' && 'postMessage' in self) {
  // Web Worker 环境
  self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    const response = handleMessage(event.data)
    self.postMessage(response)
  })
}
else if (typeof module !== 'undefined' && typeof require !== 'undefined') {
  // Node.js Worker Threads 环境
  const { parentPort } = require('worker_threads')
  
  if (parentPort) {
    parentPort.on('message', (message: WorkerMessage) => {
      const response = handleMessage(message)
      parentPort.postMessage(response)
    })
  }
}

// 导出处理函数（用于测试）
export { handleMessage, performEncryption, performDecryption }
