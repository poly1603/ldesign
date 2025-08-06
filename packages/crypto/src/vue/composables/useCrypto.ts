import { ref } from 'vue'
import { encrypt, decrypt, hash, hmac } from '../../core'
import type { EncryptResult, DecryptResult, HashResult } from '../../types'

/**
 * 加密解密组合式函数
 */
export function useCrypto() {
  const isEncrypting = ref(false)
  const isDecrypting = ref(false)
  const isHashing = ref(false)
  const lastError = ref<Error | null>(null)
  const lastResult = ref<any>(null)

  // 清除错误
  const clearError = () => {
    lastError.value = null
  }

  // 重置状态
  const reset = () => {
    isEncrypting.value = false
    isDecrypting.value = false
    isHashing.value = false
    lastError.value = null
    lastResult.value = null
  }

  // AES加密
  const encryptAES = async (data: string, key: string): Promise<EncryptResult | null> => {
    try {
      isEncrypting.value = true
      lastError.value = null
      const result = await encrypt.aes(data, key)
      lastResult.value = result
      return result
    } catch (error) {
      lastError.value = error as Error
      return null
    } finally {
      isEncrypting.value = false
    }
  }

  // AES解密
  const decryptAES = async (encryptedData: string, key: string): Promise<DecryptResult | null> => {
    try {
      isDecrypting.value = true
      lastError.value = null
      const result = await decrypt.aes(encryptedData, key)
      lastResult.value = result
      return result
    } catch (error) {
      lastError.value = error as Error
      return null
    } finally {
      isDecrypting.value = false
    }
  }

  // SHA256哈希
  const sha256 = async (data: string): Promise<HashResult | null> => {
    try {
      isHashing.value = true
      lastError.value = null
      const result = await hash.sha256(data)
      lastResult.value = result
      return result
    } catch (error) {
      lastError.value = error as Error
      return null
    } finally {
      isHashing.value = false
    }
  }

  // MD5哈希
  const md5 = async (data: string): Promise<HashResult | null> => {
    try {
      isHashing.value = true
      lastError.value = null
      const result = await hash.md5(data)
      lastResult.value = result
      return result
    } catch (error) {
      lastError.value = error as Error
      return null
    } finally {
      isHashing.value = false
    }
  }

  return {
    // 状态
    isEncrypting,
    isDecrypting,
    isHashing,
    lastError,
    lastResult,
    
    // 方法
    encryptAES,
    decryptAES,
    sha256,
    md5,
    clearError,
    reset
  }
}
