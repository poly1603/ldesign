import { computed, type Ref, ref } from 'vue'

import { digitalSignature } from '../../../core'

/**
 * 数字签名状态接口
 */
export interface SignatureState {
  isSigning: Ref<boolean>
  isVerifying: Ref<boolean>
  lastError: Ref<string | null>
  lastSignature: Ref<string | null>
  lastVerificationResult: Ref<boolean | null>
}

/**
 * 数字签名操作接口
 */
export interface SignatureActions {
  // RSA 签名
  sign: (
    data: string,
    privateKey: string,
    algorithm?: string
  ) => Promise<string>

  // RSA 验证签名
  verify: (
    data: string,
    signature: string,
    publicKey: string,
    algorithm?: string
  ) => Promise<boolean>

  // 批量签名
  signMultiple: (
    dataList: string[],
    privateKey: string,
    algorithm?: string
  ) => Promise<string[]>

  // 批量验证签名
  verifyMultiple: (
    verificationList: Array<{
      data: string
      signature: string
      publicKey: string
      algorithm?: string
    }>
  ) => Promise<boolean[]>

  // 签名文件（模拟）
  signFile: (
    fileContent: string,
    privateKey: string,
    algorithm?: string
  ) => Promise<string>

  // 验证文件签名（模拟）
  verifyFile: (
    fileContent: string,
    signature: string,
    publicKey: string,
    algorithm?: string
  ) => Promise<boolean>

  // 清除错误
  clearError: () => void

  // 重置状态
  reset: () => void
}

/**
 * useSignature 返回类型
 */
export interface UseSignatureReturn extends SignatureState, SignatureActions {
  // 便捷访问
  digitalSignature: typeof digitalSignature

  // 计算属性
  isLoading: Ref<boolean>
}

/**
 * 数字签名 Composition API Hook
 */
export function useSignature(): UseSignatureReturn {
  // 状态
  const isSigning = ref(false)
  const isVerifying = ref(false)
  const lastError = ref<string | null>(null)
  const lastSignature = ref<string | null>(null)
  const lastVerificationResult = ref<boolean | null>(null)

  // 计算属性
  const isLoading = computed(() => isSigning.value || isVerifying.value)

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

      // 更新相关状态
      if (typeof result === 'string' && loadingRef === isSigning) {
        lastSignature.value = result
      } else if (typeof result === 'boolean' && loadingRef === isVerifying) {
        lastVerificationResult.value = result
      }

      return result
    } catch (error) {
      handleError(error)
      throw error // 这行永远不会执行，但满足类型要求
    } finally {
      loadingRef.value = false
    }
  }

  // RSA 签名
  const sign = async (
    data: string,
    privateKey: string,
    algorithm: string = 'sha256',
  ): Promise<string> => {
    return wrapAsync(
      () => digitalSignature.sign(data, privateKey, algorithm),
      isSigning,
    )
  }

  // RSA 验证签名
  const verify = async (
    data: string,
    signature: string,
    publicKey: string,
    algorithm: string = 'sha256',
  ): Promise<boolean> => {
    return wrapAsync(
      () => digitalSignature.verify(data, signature, publicKey, algorithm),
      isVerifying,
    )
  }

  // 批量签名
  const signMultiple = async (
    dataList: string[],
    privateKey: string,
    algorithm: string = 'sha256',
  ): Promise<string[]> => {
    return wrapAsync(() => {
      return dataList.map(data =>
        digitalSignature.sign(data, privateKey, algorithm),
      )
    }, isSigning)
  }

  // 批量验证签名
  const verifyMultiple = async (
    verificationList: Array<{
      data: string
      signature: string
      publicKey: string
      algorithm?: string
    }>,
  ): Promise<boolean[]> => {
    return wrapAsync(() => {
      return verificationList.map(item =>
        digitalSignature.verify(
          item.data,
          item.signature,
          item.publicKey,
          item.algorithm || 'sha256',
        ),
      )
    }, isVerifying)
  }

  // 签名文件（模拟）
  const signFile = async (
    fileContent: string,
    privateKey: string,
    algorithm: string = 'sha256',
  ): Promise<string> => {
    return wrapAsync(
      () => digitalSignature.sign(fileContent, privateKey, algorithm),
      isSigning,
    )
  }

  // 验证文件签名（模拟）
  const verifyFile = async (
    fileContent: string,
    signature: string,
    publicKey: string,
    algorithm: string = 'sha256',
  ): Promise<boolean> => {
    return wrapAsync(
      () =>
        digitalSignature.verify(fileContent, signature, publicKey, algorithm),
      isVerifying,
    )
  }

  // 清除错误
  const clearError = (): void => {
    lastError.value = null
  }

  // 重置状态
  const reset = (): void => {
    isSigning.value = false
    isVerifying.value = false
    lastError.value = null
    lastSignature.value = null
    lastVerificationResult.value = null
  }

  return {
    // 状态
    isSigning,
    isVerifying,
    lastError,
    lastSignature,
    lastVerificationResult,
    isLoading,

    // 操作
    sign,
    verify,
    signMultiple,
    verifyMultiple,
    signFile,
    verifyFile,
    clearError,
    reset,

    // 便捷访问
    digitalSignature,
  }
}
