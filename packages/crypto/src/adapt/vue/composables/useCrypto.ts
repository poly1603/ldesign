import type {
  AESOptions,
  DecryptResult,
  EncryptResult,
  RSAKeyPair,
  RSAOptions,
} from '../../../types'
import { type Ref, ref } from 'vue'
import { decrypt, encrypt, keyGenerator } from '../../../core'

/**
 * 加密状态接口
 */
export interface CryptoState {
  isEncrypting: Ref<boolean>
  isDecrypting: Ref<boolean>
  lastError: Ref<string | null>
  lastResult: Ref<EncryptResult | DecryptResult | null>
}

/**
 * 加密操作接口
 */
export interface CryptoActions {
  // AES 加密
  encryptAES: (
    data: string,
    key: string,
    options?: AESOptions
  ) => Promise<EncryptResult>
  decryptAES: (
    encryptedData: string | EncryptResult,
    key: string,
    options?: AESOptions
  ) => Promise<DecryptResult>

  // RSA 加密
  encryptRSA: (
    data: string,
    publicKey: string,
    options?: RSAOptions
  ) => Promise<EncryptResult>
  decryptRSA: (
    encryptedData: string | EncryptResult,
    privateKey: string,
    options?: RSAOptions
  ) => Promise<DecryptResult>

  // Base64 编码
  encodeBase64: (data: string) => Promise<string>
  decodeBase64: (encodedData: string) => Promise<string>

  // Hex 编码
  encodeHex: (data: string) => Promise<string>
  decodeHex: (encodedData: string) => Promise<string>

  // 密钥生成
  generateRSAKeyPair: (keySize?: number) => Promise<RSAKeyPair>
  generateKey: (length?: number) => Promise<string>
  generateSalt: (length?: number) => Promise<string>
  generateIV: (length?: number) => Promise<string>

  // 清除错误
  clearError: () => void

  // 重置状态
  reset: () => void
}

/**
 * useCrypto 返回类型
 */
export interface UseCryptoReturn extends CryptoState, CryptoActions {
  // 便捷访问
  encrypt: typeof encrypt
  decrypt: typeof decrypt
  keyGenerator: typeof keyGenerator
}

/**
 * 加密 Composition API Hook
 */
export function useCrypto(): UseCryptoReturn {
  // 状态
  const isEncrypting = ref(false)
  const isDecrypting = ref(false)
  const lastError = ref<string | null>(null)
  const lastResult = ref<EncryptResult | DecryptResult | null>(null)

  // 计算属性
  // const _isLoading = computed(() => isEncrypting.value || isDecrypting.value)

  // 错误处理辅助函数
  const handleError = (error: unknown): never => {
    const errorMessage
      = error instanceof Error ? error.message : 'Unknown error'
    lastError.value = errorMessage
    throw new Error(errorMessage)
  }

  // 异步操作包装器
  const wrapAsync = async <T>(
    operation: () => T,
    loadingRef: Ref<boolean>,
  ): Promise<T> => {
    try {
      loadingRef.value = true
      lastError.value = null
      const result = operation()
      // 仅在结果为加/解密结果时记录到 lastResult
      if (typeof result === 'object' && result !== null && 'success' in (result as Record<string, unknown>)) {
        lastResult.value = result as unknown as EncryptResult | DecryptResult
      }
      return result
    } catch (error) {
      handleError(error)
      throw error // 这行永远不会执行，但满足类型要求
    } finally {
      loadingRef.value = false
    }
  }

  // AES 加密
  const encryptAES = async (
    data: string,
    key: string,
    options?: AESOptions,
  ): Promise<EncryptResult> => {
    return wrapAsync(() => encrypt.aes(data, key, options), isEncrypting)
  }

  // AES 解密
  const decryptAES = async (
    encryptedData: string | EncryptResult,
    key: string,
    options?: AESOptions,
  ): Promise<DecryptResult> => {
    return wrapAsync(
      () => decrypt.aes(encryptedData, key, options),
      isDecrypting,
    )
  }

  // RSA 加密
  const encryptRSA = async (
    data: string,
    publicKey: string,
    options?: RSAOptions,
  ): Promise<EncryptResult> => {
    return wrapAsync(() => encrypt.rsa(data, publicKey, options), isEncrypting)
  }

  // RSA 解密
  const decryptRSA = async (
    encryptedData: string | EncryptResult,
    privateKey: string,
    options?: RSAOptions,
  ): Promise<DecryptResult> => {
    return wrapAsync(
      () => decrypt.rsa(encryptedData, privateKey, options),
      isDecrypting,
    )
  }

  // Base64 编码
  const encodeBase64 = async (data: string): Promise<string> => {
    return wrapAsync(() => encrypt.base64(data), isEncrypting)
  }

  // Base64 解码
  const decodeBase64 = async (encodedData: string): Promise<string> => {
    return wrapAsync(() => decrypt.base64(encodedData), isDecrypting)
  }

  // Hex 编码
  const encodeHex = async (data: string): Promise<string> => {
    return wrapAsync(() => encrypt.hex(data), isEncrypting)
  }

  // Hex 解码
  const decodeHex = async (encodedData: string): Promise<string> => {
    return wrapAsync(() => decrypt.hex(encodedData), isDecrypting)
  }

  // 生成 RSA 密钥对
  const generateRSAKeyPair = async (keySize?: number): Promise<RSAKeyPair> => {
    return wrapAsync(
      () => keyGenerator.generateRSAKeyPair(keySize),
      isEncrypting,
    )
  }

  // 生成密钥
  const generateKey = async (length?: number): Promise<string> => {
    return wrapAsync(() => keyGenerator.generateKey(length), isEncrypting)
  }

  // 生成盐值
  const generateSalt = async (length?: number): Promise<string> => {
    return wrapAsync(() => keyGenerator.generateSalt(length), isEncrypting)
  }

  // 生成 IV
  const generateIV = async (length?: number): Promise<string> => {
    return wrapAsync(() => keyGenerator.generateIV(length), isEncrypting)
  }

  // 清除错误
  const clearError = (): void => {
    lastError.value = null
  }

  // 重置状态
  const reset = (): void => {
    isEncrypting.value = false
    isDecrypting.value = false
    lastError.value = null
    lastResult.value = null
  }

  return {
    // 状态
    isEncrypting,
    isDecrypting,
    lastError,
    lastResult,

    // 操作
    encryptAES,
    decryptAES,
    encryptRSA,
    decryptRSA,
    encodeBase64,
    decodeBase64,
    encodeHex,
    decodeHex,
    generateRSAKeyPair,
    generateKey,
    generateSalt,
    generateIV,
    clearError,
    reset,

    // 便捷访问
    encrypt,
    decrypt,
    keyGenerator,
  }
}
