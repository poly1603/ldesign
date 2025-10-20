import type { HttpClientConfig, RequestConfig } from '../types'
import { computed, ref } from 'vue'
import { createAdapter } from '../adapters'
import { HttpClientImpl } from '../client'

/**
 * HTTP客户端组合式函数
 */
export function useHttp(config?: HttpClientConfig) {
  const adapter = createAdapter(config?.adapter)
  const client = new HttpClientImpl(config || {}, adapter)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<unknown>(null)

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
  const get = async <T = unknown>(url: string, config?: RequestConfig): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.get<T>(url, config)
      data.value = response.data
      return response.data
    }
    catch (err) {
      error.value = err as Error
      return null
    }
    finally {
      loading.value = false
    }
  }

  // POST请求
  const post = async <T = unknown, D = unknown>(
    url: string,
    postData?: D,
    config?: RequestConfig,
  ): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.post<T>(url, postData, config)
      data.value = response.data
      return response.data
    }
    catch (err) {
      error.value = err as Error
      return null
    }
    finally {
      loading.value = false
    }
  }

  // PUT请求
  const put = async <T = unknown, D = unknown>(
    url: string,
    putData?: D,
    config?: RequestConfig,
  ): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.put<T>(url, putData, config)
      data.value = response.data
      return response.data
    }
    catch (err) {
      error.value = err as Error
      return null
    }
    finally {
      loading.value = false
    }
  }

  // DELETE请求
  const del = async <T = unknown>(url: string, config?: RequestConfig): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      const response = await client.delete<T>(url, config)
      data.value = response.data
      return response.data
    }
    catch (err) {
      error.value = err as Error
      return null
    }
    finally {
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
