/**
 * CryptoJS 类型定义增强
 * 用于提供更好的类型安全，避免使用 any
 */

import type CryptoJS from 'crypto-js'

/**
 * CryptoJS 加密模式类型
 */
export type CryptoJSMode = 
  | typeof CryptoJS.mode.CBC
  | typeof CryptoJS.mode.CFB
  | typeof CryptoJS.mode.CTR
  | typeof CryptoJS.mode.OFB
  | typeof CryptoJS.mode.ECB

/**
 * CryptoJS 填充类型
 */
export type CryptoJSPadding =
  | typeof CryptoJS.pad.Pkcs7
  | typeof CryptoJS.pad.AnsiX923
  | typeof CryptoJS.pad.Iso10126
  | typeof CryptoJS.pad.Iso97971
  | typeof CryptoJS.pad.ZeroPadding
  | typeof CryptoJS.pad.NoPadding

/**
 * CryptoJS 加密配置
 */
export interface CryptoJSCipherConfig {
  mode?: CryptoJSMode
  padding?: CryptoJSPadding
  iv?: CryptoJS.lib.WordArray
  format?: typeof CryptoJS.format.OpenSSL | typeof CryptoJS.format.Hex
}

/**
 * Worker Pool 方法签名
 */
export interface WorkerPoolMethods {
  batchEncrypt: (operations: unknown[]) => Promise<unknown[]>
  batchDecrypt: (operations: unknown[]) => Promise<unknown[]>
  terminate: () => Promise<void>
  getStats: () => Record<string, unknown>
}

