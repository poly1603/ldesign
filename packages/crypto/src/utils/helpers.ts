import CryptoJS from 'crypto-js'
import type {
  Base64Config,
  RandomConfig,
  KeyDerivationConfig,
  EncodingFormat
} from '../types'
import { validateBase64Config, validateRandomConfig, validateKeyDerivationConfig } from './validators'

/**
 * Base64编码
 */
export function encodeBase64(data: string, config: Base64Config = {}): string {
  validateBase64Config(config)
  
  let encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
  
  if (config.urlSafe) {
    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_')
  }
  
  if (config.padding === false) {
    encoded = encoded.replace(/=/g, '')
  }
  
  return encoded
}

/**
 * Base64解码
 */
export function decodeBase64(data: string, config: Base64Config = {}): string {
  validateBase64Config(config)
  
  let decoded = data
  
  if (config.urlSafe) {
    decoded = decoded.replace(/-/g, '+').replace(/_/g, '/')
  }
  
  // 添加填充
  const padding = decoded.length % 4
  if (padding) {
    decoded += '='.repeat(4 - padding)
  }
  
  try {
    return CryptoJS.enc.Base64.parse(decoded).toString(CryptoJS.enc.Utf8)
  } catch (error) {
    throw new Error(`Base64 decode failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 十六进制编码
 */
export function encodeHex(data: string): string {
  return CryptoJS.enc.Utf8.parse(data).toString(CryptoJS.enc.Hex)
}

/**
 * 十六进制解码
 */
export function decodeHex(hex: string): string {
  try {
    return CryptoJS.enc.Hex.parse(hex).toString(CryptoJS.enc.Utf8)
  } catch (error) {
    throw new Error(`Hex decode failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * URL编码
 */
export function encodeUrl(data: string): string {
  return encodeURIComponent(data)
}

/**
 * URL解码
 */
export function decodeUrl(data: string): string {
  try {
    return decodeURIComponent(data)
  } catch (error) {
    throw new Error(`URL decode failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 生成随机字符串
 */
export function generateRandom(config: RandomConfig): string {
  validateRandomConfig(config)
  
  const charset = config.charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < config.length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  if (config.format) {
    switch (config.format) {
      case EncodingFormat.HEX:
        return encodeHex(result)
      case EncodingFormat.BASE64:
        return encodeBase64(result)
      case EncodingFormat.BASE64URL:
        return encodeBase64(result, { urlSafe: true })
      default:
        return result
    }
  }
  
  return result
}

/**
 * 生成随机字节
 */
export function generateRandomBytes(length: number, format: EncodingFormat = EncodingFormat.HEX): string {
  const randomBytes = CryptoJS.lib.WordArray.random(length)
  
  switch (format) {
    case EncodingFormat.HEX:
      return randomBytes.toString(CryptoJS.enc.Hex)
    case EncodingFormat.BASE64:
      return randomBytes.toString(CryptoJS.enc.Base64)
    case EncodingFormat.BASE64URL:
      return randomBytes.toString(CryptoJS.enc.Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    default:
      return randomBytes.toString()
  }
}

/**
 * 密钥派生函数 (PBKDF2)
 */
export function deriveKey(config: KeyDerivationConfig): string {
  validateKeyDerivationConfig(config)
  
  const iterations = config.iterations || 10000
  const keySize = config.keySize || 32
  const hasher = config.hasher || CryptoJS.algo.SHA256
  
  const derived = CryptoJS.PBKDF2(config.password, config.salt, {
    keySize: keySize / 4, // CryptoJS uses words (4 bytes each)
    iterations,
    hasher
  })
  
  return derived.toString(CryptoJS.enc.Hex)
}

/**
 * 字符串转字节数组
 */
export function stringToBytes(str: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i))
  }
  return bytes
}

/**
 * 字节数组转字符串
 */
export function bytesToString(bytes: number[]): string {
  return String.fromCharCode(...bytes)
}

/**
 * 字符串转UTF-8字节数组
 */
export function stringToUtf8Bytes(str: string): number[] {
  const utf8 = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
  return stringToBytes(utf8)
}

/**
 * UTF-8字节数组转字符串
 */
export function utf8BytesToString(bytes: number[]): string {
  const str = bytesToString(bytes)
  return decodeURIComponent(str.split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

/**
 * 安全比较两个字符串（防止时序攻击）
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * 清除敏感数据（用零填充）
 */
export function clearSensitiveData(data: string): void {
  // 注意：在JavaScript中，字符串是不可变的，
  // 这个函数主要是为了API一致性，实际清除需要在更低层次实现
  if (typeof data === 'string') {
    // 尝试覆盖变量引用（虽然不能真正清除内存）
    data = '\0'.repeat(data.length)
  }
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 计算字符串的字节长度
 */
export function getByteLength(str: string): number {
  return new Blob([str]).size
}

/**
 * 生成UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}