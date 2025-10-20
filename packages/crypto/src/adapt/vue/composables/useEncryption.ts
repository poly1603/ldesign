import { computed, ref, type Ref } from 'vue'

import { aes, base64, hex } from '../../../core'

/**
 * 简化的加密状态接口
 */
export interface EncryptionState {
  isLoading: Ref<boolean>
  error: Ref<string | null>
  result: Ref<string | null>
}

/**
 * 加密操作接口
 */
export interface EncryptionActions {
  // 简单的文本加密/解密
  encryptText: (text: string, password: string) => Promise<string | null>
  decryptText: (encryptedText: string, password: string) => Promise<string | null>

  // 文件加密/解密（Base64）
  encryptFile: (fileContent: string, password: string) => Promise<string | null>
  decryptFile: (encryptedContent: string, password: string) => Promise<string | null>

  // 清除状态
  clearError: () => void
  reset: () => void
}

/**
 * useEncryption 返回类型
 */
export interface UseEncryptionReturn extends EncryptionState, EncryptionActions {
  // 计算属性
  hasError: Ref<boolean>
  isReady: Ref<boolean>
}

/**
 * 简化的加密 Hook
 *
 * 提供最常用的加密功能，使用简单的密码进行加密/解密
 *
 * @example
 * ```vue
 * <script setup>
 * import { useEncryption } from '@ldesign/crypto/vue'
 *
 * const { encryptText, decryptText, isLoading, error, result } = useEncryption()
 *
 * const handleEncrypt = async () => {
 *   const encrypted = await encryptText('Hello World', 'mypassword')
 *    }
 * </script>
 * ```
 */
export function useEncryption(): UseEncryptionReturn {
  // 状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<string | null>(null)

  // 计算属性
  const hasError = computed(() => error.value !== null)
  const isReady = computed(() => !isLoading.value)

  // 通用错误处理包装器
  const wrapAsync = async <T>(fn: () => Promise<T> | T): Promise<T | null> => {
    try {
      isLoading.value = true
      error.value = null
      const res = await fn()
      result.value = typeof res === 'string' ? res : JSON.stringify(res)
      return res
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 简单的文本加密
  const encryptText = async (text: string, password: string): Promise<string | null> => {
    return wrapAsync(() => {
      const encrypted = aes.encrypt(text, password, { keySize: 256 })
      return base64.encode(JSON.stringify(encrypted))
    })
  }

  // 简单的文本解密
  const decryptText = async (encryptedText: string, password: string): Promise<string | null> => {
    return wrapAsync(() => {
      const encryptedData = JSON.parse(base64.decode(encryptedText))
      const decrypted = aes.decrypt(encryptedData, password, {
        keySize: 256,
        iv: encryptedData.iv,
      })
      return decrypted.data || ''
    })
  }

  // 文件加密（Base64 内容）
  const encryptFile = async (fileContent: string, password: string): Promise<string | null> => {
    return wrapAsync(() => {
      // 先进行 Base64 编码，然后加密
      const encoded = base64.encode(fileContent)
      const encrypted = aes.encrypt(encoded, password, { keySize: 256 })
      return hex.encode(JSON.stringify(encrypted))
    })
  }

  // 文件解密
  const decryptFile = async (encryptedContent: string, password: string): Promise<string | null> => {
    return wrapAsync(() => {
      const encryptedData = JSON.parse(hex.decode(encryptedContent))
      const decrypted = aes.decrypt(encryptedData, password, {
        keySize: 256,
        iv: encryptedData.iv,
      })
      return base64.decode(decrypted.data || '')
    })
  }

  // 清除错误
  const clearError = (): void => {
    error.value = null
  }

  // 重置状态
  const reset = (): void => {
    isLoading.value = false
    error.value = null
    result.value = null
  }

  return {
    // 状态
    isLoading,
    error,
    result,

    // 计算属性
    hasError,
    isReady,

    // 操作
    encryptText,
    decryptText,
    encryptFile,
    decryptFile,
    clearError,
    reset,
  }
}
