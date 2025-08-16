/**
 * 全局类型声明文件
 * 确保所有类型在整个项目中都可用
 */

declare global {
  /**
   * Web Crypto API 扩展
   */
  interface Window {
    crypto: Crypto
  }

  /**
   * Web Workers 支持
   */
  interface Worker {
    postMessage(message: any, transfer?: Transferable[]): void
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null
    onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null
    terminate(): void
  }

  /**
   * 性能 API
   */
  interface Performance {
    now(): number
    mark(markName: string): void
    measure(measureName: string, startMark?: string, endMark?: string): void
  }
}

/**
 * 模块声明
 */
declare module 'crypto-js' {
  export interface WordArray {
    words: number[]
    sigBytes: number
    toString(encoder?: any): string
  }

  export interface CipherParams {
    ciphertext: WordArray
    key?: WordArray
    iv?: WordArray
    salt?: WordArray
    algorithm?: string
    mode?: any
    padding?: any
    blockSize?: number
    formatter?: any
  }

  export interface Cipher {
    encrypt(
      message: string | WordArray,
      key: string | WordArray,
      cfg?: object
    ): CipherParams
    decrypt(
      ciphertext: string | CipherParams,
      key: string | WordArray,
      cfg?: object
    ): WordArray
  }

  export const AES: Cipher
  export const DES: Cipher
  export const TripleDES: Cipher

  export namespace enc {
    export const Hex: {
      parse(hexStr: string): WordArray
      stringify(wordArray: WordArray): string
    }
    export const Base64: {
      parse(base64Str: string): WordArray
      stringify(wordArray: WordArray): string
    }
    export const Utf8: {
      parse(utf8Str: string): WordArray
      stringify(wordArray: WordArray): string
    }
  }

  export namespace mode {
    export const CBC: any
    export const ECB: any
    export const CFB: any
    export const OFB: any
    export const CTR: any
    export const GCM: any
  }

  export namespace pad {
    export const Pkcs7: any
    export const NoPadding: any
  }

  export function SHA256(message: string | WordArray): WordArray
  export function SHA1(message: string | WordArray): WordArray
  export function SHA512(message: string | WordArray): WordArray
  export function MD5(message: string | WordArray): WordArray

  export function HmacSHA256(
    message: string | WordArray,
    key: string | WordArray
  ): WordArray
  export function HmacSHA1(
    message: string | WordArray,
    key: string | WordArray
  ): WordArray
  export function HmacSHA512(
    message: string | WordArray,
    key: string | WordArray
  ): WordArray
  export function HmacMD5(
    message: string | WordArray,
    key: string | WordArray
  ): WordArray
}

/**
 * Node.js 环境类型声明
 */
declare module 'node-forge' {
  export namespace cipher {
    export function createCipher(algorithm: string, key: string): any
    export function createDecipher(algorithm: string, key: string): any
  }

  export namespace util {
    export function createBuffer(data: string, encoding?: string): any
    export function hexToBytes(hex: string): string
    export function bytesToHex(bytes: string): string
  }

  export namespace pki {
    export function rsa(): any
    export function publicKeyToPem(publicKey: any): string
    export function privateKeyToPem(privateKey: any): string
    export function publicKeyFromPem(pem: string): any
    export function privateKeyFromPem(pem: string): any
  }
}

/**
 * Vue 3 类型扩展
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $crypto?: import('../core/manager').CryptoManager
  }

  interface GlobalProperties {
    $crypto?: import('../core/manager').CryptoManager
  }
}

/**
 * 环境变量类型
 */
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    DEBUG?: string
  }
}

export {}
