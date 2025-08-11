import type { HttpClientConfig } from '../../types'
import { computed, ref } from 'vue'
import { createHttpClient } from '../../index'

/**
 * HTTP客户端组合式函数
 */
export function useHttp(config?: HttpClientConfig) {
  const client = createHttpClient(config)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<any>(null)

  // 计算属性
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 重置状态
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  // GET请求
  const get = async <T = any>(url: string, config?: any): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.get<T>(url, config)
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      loading.value = false
    }
  }

  // POST请求
  const post = async <T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.post<T>(url, data, config)
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      loading.value = false
    }
  }

  // PUT请求
  const put = async <T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.put<T>(url, data, config)
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      loading.value = false
    }
  }

  // DELETE请求
  const del = async <T = any>(url: string, config?: any): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.delete<T>(url, config)
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    loading: isLoading,
    error,
    data,
    hasError,

    // 方法
    get,
    post,
    put,
    delete: del,
    clearError,
    reset,

    // 客户端实例
    client,
  }
}
