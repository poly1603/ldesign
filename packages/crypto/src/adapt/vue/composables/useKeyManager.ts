import type { RSAKeyPair } from '../../../types'
import { computed, ref, type Ref } from 'vue'
import { keyGenerator } from '../../../core'

/**
 * 密钥管理状态接口
 */
export interface KeyManagerState {
  isGenerating: Ref<boolean>
  error: Ref<string | null>
  keys: Ref<Record<string, string | RSAKeyPair>>
}

/**
 * 密钥管理操作接口
 */
export interface KeyManagerActions {
  // 生成密钥
  generateAESKey: (keySize?: 128 | 192 | 256) => Promise<string | null>
  generateRSAKeyPair: (keySize?: 1024 | 2048 | 3072 | 4096) => Promise<RSAKeyPair | null>
  generateRandomKey: (length?: number) => Promise<string | null>

  // 密钥存储
  storeKey: (name: string, key: string | RSAKeyPair) => void
  getKey: (name: string) => string | RSAKeyPair | null
  removeKey: (name: string) => boolean

  // 密钥导出
  exportKeys: () => string
  importKeys: (keysData: string) => boolean

  // 清理
  clearError: () => void
  clearKeys: () => void
}

/**
 * useKeyManager 返回类型
 */
export interface UseKeyManagerReturn extends KeyManagerState, KeyManagerActions {
  // 计算属性
  hasError: Ref<boolean>
  keyCount: Ref<number>
  keyNames: Ref<string[]>
  isReady: Ref<boolean>
}

/**
 * 密钥管理 Hook
 *
 * 提供密钥生成、存储和管理功能
 *
 * @example
 * ```vue
 * <script setup>
 * import { useKeyManager } from '@ldesign/crypto/vue'
 *
 * const {
 *   generateAESKey,
 *   generateRSAKeyPair,
 *   storeKey,
 *   getKey,
 *   keys,
 *   isGenerating
 * } = useKeyManager()
 *
 * const handleGenerateKey = async () => {
 *   const aesKey = await generateAESKey(256)
 *   if (aesKey) {
 *     storeKey('myAESKey', aesKey)
 *   }
 * }
 * </script>
 * ```
 */
export function useKeyManager(): UseKeyManagerReturn {
  // 状态
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const keys = ref<Record<string, string | RSAKeyPair>>({})

  // 计算属性
  const hasError = computed(() => error.value !== null)
  const keyCount = computed(() => Object.keys(keys.value).length)
  const keyNames = computed(() => Object.keys(keys.value))
  const isReady = computed(() => !isGenerating.value)

  // 通用错误处理包装器
  const wrapAsync = async <T>(fn: () => T): Promise<T | null> => {
    try {
      isGenerating.value = true
      error.value = null
      return await fn()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return null
    } finally {
      isGenerating.value = false
    }
  }

  // 生成 AES 密钥
  const generateAESKey = async (keySize: 128 | 192 | 256 = 256): Promise<string | null> => {
    return wrapAsync(() => {
      // AES 密钥长度：128位=16字节，192位=24字节，256位=32字节
      const keyLength = keySize / 8
      return keyGenerator.generateKey(keyLength)
    })
  }

  // 生成 RSA 密钥对
  const generateRSAKeyPair = async (keySize: 1024 | 2048 | 3072 | 4096 = 2048): Promise<RSAKeyPair | null> => {
    return wrapAsync(() => {
      return keyGenerator.generateRSAKeyPair(keySize)
    })
  }

  // 生成随机密钥
  const generateRandomKey = async (length: number = 32): Promise<string | null> => {
    return wrapAsync(() => {
      return keyGenerator.generateRandomBytes(length)
    })
  }

  // 存储密钥
  const storeKey = (name: string, key: string | RSAKeyPair): void => {
    keys.value[name] = key
  }

  // 获取密钥
  const getKey = (name: string): string | RSAKeyPair | null => {
    return keys.value[name] || null
  }

  // 删除密钥
  const removeKey = (name: string): boolean => {
    if (name in keys.value) {
      delete keys.value[name]
      return true
    }
    return false
  }

  // 导出密钥
  const exportKeys = (): string => {
    try {
      return JSON.stringify(keys.value, null, 2)
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return ''
    }
  }

  // 导入密钥
  const importKeys = (keysData: string): boolean => {
    try {
      const importedKeys = JSON.parse(keysData)
      if (typeof importedKeys === 'object' && importedKeys !== null) {
        keys.value = { ...keys.value, ...importedKeys }
        return true
      }
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return false
    }
  }

  // 清除错误
  const clearError = (): void => {
    error.value = null
  }

  // 清除所有密钥
  const clearKeys = (): void => {
    keys.value = {}
  }

  return {
    // 状态
    isGenerating,
    error,
    keys,

    // 计算属性
    hasError,
    keyCount,
    keyNames,
    isReady,

    // 操作
    generateAESKey,
    generateRSAKeyPair,
    generateRandomKey,
    storeKey,
    getKey,
    removeKey,
    exportKeys,
    importKeys,
    clearError,
    clearKeys,
  }
}
