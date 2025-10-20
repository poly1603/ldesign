import type { HashAlgorithm, HashOptions } from '../../../types'
import { computed, type Ref, ref } from 'vue'
import { hash, hmacInstance as hmac } from '../../../core'

/**
 * 哈希状态接口
 */
export interface HashState {
  isHashing: Ref<boolean>
  lastError: Ref<string | null>
  lastHash: Ref<string | null>
}

/**
 * 哈希操作接口
 */
export interface HashActions {
  // 基础哈希函数
  md5: (data: string, options?: HashOptions) => Promise<string>
  sha1: (data: string, options?: HashOptions) => Promise<string>
  sha224: (data: string, options?: HashOptions) => Promise<string>
  sha256: (data: string, options?: HashOptions) => Promise<string>
  sha384: (data: string, options?: HashOptions) => Promise<string>
  sha512: (data: string, options?: HashOptions) => Promise<string>

  // 通用哈希函数
  hashData: (
    data: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => Promise<string>

  // 哈希验证
  verify: (
    data: string,
    expectedHash: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => Promise<boolean>

  // HMAC 函数
  hmacMd5: (data: string, key: string, options?: HashOptions) => Promise<string>
  hmacSha1: (
    data: string,
    key: string,
    options?: HashOptions
  ) => Promise<string>
  hmacSha256: (
    data: string,
    key: string,
    options?: HashOptions
  ) => Promise<string>
  hmacSha384: (
    data: string,
    key: string,
    options?: HashOptions
  ) => Promise<string>
  hmacSha512: (
    data: string,
    key: string,
    options?: HashOptions
  ) => Promise<string>

  // 通用 HMAC 函数
  hmacData: (
    data: string,
    key: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => Promise<string>

  // HMAC 验证
  verifyHmac: (
    data: string,
    key: string,
    expectedHmac: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => Promise<boolean>

  // 批量哈希
  hashMultiple: (
    dataList: string[],
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => Promise<string[]>

  // 文件哈希（模拟）
  hashFile: (
    fileContent: string,
    algorithm?: HashAlgorithm,
    options?: HashOptions
  ) => Promise<string>

  // 清除错误
  clearError: () => void

  // 重置状态
  reset: () => void
}

/**
 * useHash 返回类型
 */
export interface UseHashReturn extends HashState, HashActions {
  // 便捷访问
  hash: typeof hash
  hmac: typeof hmac

  // 计算属性
  isLoading: Ref<boolean>
}

/**
 * 哈希 Composition API Hook
 */
export function useHash(): UseHashReturn {
  // 状态
  const isHashing = ref(false)
  const lastError = ref<string | null>(null)
  const lastHash = ref<string | null>(null)

  // 计算属性
  const isLoading = computed(() => isHashing.value)

  // 错误处理辅助函数
  const handleError = (error: unknown): never => {
    const errorMessage
      = error instanceof Error ? error.message : 'Unknown error'
    lastError.value = errorMessage
    throw new Error(errorMessage)
  }

  // 异步操作包装器
  const wrapAsync = async <T>(operation: () => T): Promise<T> => {
    try {
      isHashing.value = true
      lastError.value = null
      const result = operation()
      if (typeof result === 'string') {
        lastHash.value = result
      }
      return result
    } catch (error) {
      handleError(error)
      throw error // 这行永远不会执行，但满足类型要求
    } finally {
      isHashing.value = false
    }
  }

  // MD5 哈希
  const md5 = async (data: string, options?: HashOptions): Promise<string> => {
    return wrapAsync(() => hash.md5(data, options))
  }

  // SHA1 哈希
  const sha1 = async (data: string, options?: HashOptions): Promise<string> => {
    return wrapAsync(() => hash.sha1(data, options))
  }

  // SHA224 哈希
  const sha224 = async (
    data: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hash.sha224(data, options))
  }

  // SHA256 哈希
  const sha256 = async (
    data: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hash.sha256(data, options))
  }

  // SHA384 哈希
  const sha384 = async (
    data: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hash.sha384(data, options))
  }

  // SHA512 哈希
  const sha512 = async (
    data: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hash.sha512(data, options))
  }

  // 通用哈希函数
  const hashData = async (
    data: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hash.hash(data, algorithm, options))
  }

  // 哈希验证
  const verify = async (
    data: string,
    expectedHash: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): Promise<boolean> => {
    return wrapAsync(() => hash.verify(data, expectedHash, algorithm, options))
  }

  // HMAC-MD5
  const hmacMd5 = async (
    data: string,
    key: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hmac.md5(data, key, options))
  }

  // HMAC-SHA1
  const hmacSha1 = async (
    data: string,
    key: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hmac.sha1(data, key, options))
  }

  // HMAC-SHA256
  const hmacSha256 = async (
    data: string,
    key: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hmac.sha256(data, key, options))
  }

  // HMAC-SHA384
  const hmacSha384 = async (
    data: string,
    key: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hmac.sha384(data, key, options))
  }

  // HMAC-SHA512
  const hmacSha512 = async (
    data: string,
    key: string,
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hmac.sha512(data, key, options))
  }

  // 通用 HMAC 函数
  const hmacData = async (
    data: string,
    key: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hmac.hmac(data, key, algorithm, options))
  }

  // HMAC 验证
  const verifyHmac = async (
    data: string,
    key: string,
    expectedHmac: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): Promise<boolean> => {
    return wrapAsync(() =>
      hmac.verify(data, key, expectedHmac, algorithm, options),
    )
  }

  // 批量哈希
  const hashMultiple = async (
    dataList: string[],
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): Promise<string[]> => {
    return wrapAsync(() => {
      return dataList.map(data => hash.hash(data, algorithm, options))
    })
  }

  // 文件哈希（模拟）
  const hashFile = async (
    fileContent: string,
    algorithm: HashAlgorithm = 'SHA256',
    options?: HashOptions,
  ): Promise<string> => {
    return wrapAsync(() => hash.hash(fileContent, algorithm, options))
  }

  // 清除错误
  const clearError = (): void => {
    lastError.value = null
  }

  // 重置状态
  const reset = (): void => {
    isHashing.value = false
    lastError.value = null
    lastHash.value = null
  }

  return {
    // 状态
    isHashing,
    lastError,
    lastHash,
    isLoading,

    // 基础哈希函数
    md5,
    sha1,
    sha224,
    sha256,
    sha384,
    sha512,
    hashData,
    verify,

    // HMAC 函数
    hmacMd5,
    hmacSha1,
    hmacSha256,
    hmacSha384,
    hmacSha512,
    hmacData,
    verifyHmac,

    // 高级功能
    hashMultiple,
    hashFile,

    // 工具函数
    clearError,
    reset,

    // 便捷访问
    hash,
    hmac,
  }
}
