/**
 * HTTP 请求封装 Hook
 * 
 * @description
 * 提供基于 fetch API 的 HTTP 请求功能，支持请求拦截、响应拦截、
 * 错误处理、重试机制、缓存等功能。
 */

import { ref, computed, watch, onUnmounted, type Ref } from 'vue'

/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * 请求配置
 */
export interface FetchConfig extends Omit<RequestInit, 'method' | 'body'> {
  /** HTTP 方法 */
  method?: HttpMethod
  /** 请求体 */
  body?: any
  /** 查询参数 */
  params?: Record<string, any>
  /** 超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retry?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 是否自动解析 JSON */
  parseJson?: boolean
  /** 基础 URL */
  baseURL?: string
  /** 请求拦截器 */
  beforeRequest?: (config: FetchConfig) => FetchConfig | Promise<FetchConfig>
  /** 响应拦截器 */
  afterResponse?: (response: Response) => Response | Promise<Response>
  /** 错误处理器 */
  onError?: (error: Error) => void
}

/**
 * 请求状态
 */
export interface FetchState<T = any> {
  /** 响应数据 */
  data: T | null
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 响应对象 */
  response: Response | null
  /** 是否已完成 */
  finished: boolean
  /** 是否被取消 */
  aborted: boolean
}

/**
 * 请求操作方法
 */
export interface FetchActions {
  /** 执行请求 */
  execute: () => Promise<void>
  /** 取消请求 */
  abort: () => void
  /** 重新请求 */
  refresh: () => Promise<void>
}

/**
 * 构建查询字符串
 */
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  }
  
  return searchParams.toString()
}

/**
 * 构建完整 URL
 */
const buildURL = (url: string, baseURL?: string, params?: Record<string, any>): string => {
  let fullURL = baseURL ? `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}` : url
  
  if (params && Object.keys(params).length > 0) {
    const queryString = buildQueryString(params)
    fullURL += (fullURL.includes('?') ? '&' : '?') + queryString
  }
  
  return fullURL
}

/**
 * HTTP 请求 Hook
 * 
 * @param url - 请求 URL
 * @param config - 请求配置
 * @returns 请求状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     // 基础用法
 *     const { state, execute } = useFetch('/api/users')
 *     
 *     // 带参数的 GET 请求
 *     const { state: userState } = useFetch('/api/user', {
 *       params: { id: 123 },
 *       immediate: true
 *     })
 *     
 *     // POST 请求
 *     const { state: createState, execute: createUser } = useFetch('/api/users', {
 *       method: 'POST',
 *       body: { name: 'John', email: 'john@example.com' }
 *     })
 *     
 *     // 带重试的请求
 *     const { state: retryState } = useFetch('/api/data', {
 *       retry: 3,
 *       retryDelay: 1000,
 *       onError: (error) => {
 *         console.error('请求失败:', error)
 *       }
 *     })
 *     
 *     return {
 *       state,
 *       execute,
 *       userState,
 *       createUser,
 *       retryState
 *     }
 *   }
 * })
 * ```
 */
export function useFetch<T = any>(
  url: string,
  config: FetchConfig & { immediate?: boolean } = {}
): {
  state: Ref<FetchState<T>>
  execute: () => Promise<void>
  abort: () => void
  refresh: () => Promise<void>
} {
  const {
    immediate = false,
    method = 'GET',
    timeout = 10000,
    retry = 0,
    retryDelay = 1000,
    parseJson = true,
    baseURL,
    beforeRequest,
    afterResponse,
    onError,
    params,
    body,
    ...fetchOptions
  } = config

  // 状态
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const response = ref<Response | null>(null)
  const finished = ref(false)
  const aborted = ref(false)

  // 请求控制
  let abortController: AbortController | null = null

  /**
   * 执行请求
   */
  const execute = async (): Promise<void> => {
    if (loading.value) return

    // 重置状态
    loading.value = true
    error.value = null
    finished.value = false
    aborted.value = false

    // 创建新的 AbortController
    abortController = new AbortController()

    try {
      // 构建请求配置
      let requestConfig: FetchConfig = {
        method,
        params,
        body,
        timeout,
        baseURL,
        ...fetchOptions,
      }

      // 执行请求拦截器
      if (beforeRequest) {
        requestConfig = await beforeRequest(requestConfig)
      }

      // 构建 URL
      const fullURL = buildURL(url, requestConfig.baseURL, requestConfig.params)

      // 构建 fetch 选项
      const fetchInit: RequestInit = {
        method: requestConfig.method,
        signal: abortController.signal,
        ...requestConfig,
      }

      // 处理请求体
      if (requestConfig.body && requestConfig.method !== 'GET' && requestConfig.method !== 'HEAD') {
        if (typeof requestConfig.body === 'object') {
          fetchInit.body = JSON.stringify(requestConfig.body)
          fetchInit.headers = {
            'Content-Type': 'application/json',
            ...fetchInit.headers,
          }
        } else {
          fetchInit.body = requestConfig.body
        }
      }

      // 执行请求（带重试）
      let lastError: Error | null = null
      let attempt = 0

      while (attempt <= retry) {
        try {
          // 设置超时
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          })

          const fetchPromise = fetch(fullURL, fetchInit)
          const res = await Promise.race([fetchPromise, timeoutPromise])

          // 检查是否被取消
          if (abortController.signal.aborted) {
            aborted.value = true
            return
          }

          // 执行响应拦截器
          response.value = afterResponse ? await afterResponse(res) : res

          // 检查响应状态
          if (!response.value.ok) {
            throw new Error(`HTTP ${response.value.status}: ${response.value.statusText}`)
          }

          // 解析响应数据
          if (parseJson) {
            const contentType = response.value.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              data.value = await response.value.json()
            } else {
              data.value = await response.value.text() as any
            }
          } else {
            data.value = response.value as any
          }

          // 请求成功，跳出重试循环
          break
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err))
          
          // 如果是取消错误，直接返回
          if (lastError.name === 'AbortError') {
            aborted.value = true
            return
          }

          attempt++
          
          // 如果还有重试次数，等待后重试
          if (attempt <= retry) {
            await new Promise(resolve => setTimeout(resolve, retryDelay))
          }
        }
      }

      // 如果所有重试都失败了
      if (lastError) {
        throw lastError
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      onError?.(errorObj)
    } finally {
      loading.value = false
      finished.value = true
      abortController = null
    }
  }

  /**
   * 取消请求
   */
  const abort = (): void => {
    if (abortController) {
      abortController.abort()
      aborted.value = true
      loading.value = false
    }
  }

  /**
   * 重新请求
   */
  const refresh = async (): Promise<void> => {
    await execute()
  }

  // 组件卸载时取消请求
  onUnmounted(() => {
    abort()
  })

  // 立即执行
  if (immediate) {
    execute()
  }

  // 计算状态
  const state = computed<FetchState<T>>(() => ({
    data: data.value,
    loading: loading.value,
    error: error.value,
    response: response.value,
    finished: finished.value,
    aborted: aborted.value,
  }))

  return {
    state: state as Ref<FetchState<T>>,
    execute,
    abort,
    refresh,
  }
}

/**
 * GET 请求
 */
export const useGet = <T = any>(url: string, config?: Omit<FetchConfig, 'method'> & { immediate?: boolean }) => {
  return useFetch<T>(url, { ...config, method: 'GET' })
}

/**
 * POST 请求
 */
export const usePost = <T = any>(url: string, config?: Omit<FetchConfig, 'method'> & { immediate?: boolean }) => {
  return useFetch<T>(url, { ...config, method: 'POST' })
}

/**
 * PUT 请求
 */
export const usePut = <T = any>(url: string, config?: Omit<FetchConfig, 'method'> & { immediate?: boolean }) => {
  return useFetch<T>(url, { ...config, method: 'PUT' })
}

/**
 * DELETE 请求
 */
export const useDelete = <T = any>(url: string, config?: Omit<FetchConfig, 'method'> & { immediate?: boolean }) => {
  return useFetch<T>(url, { ...config, method: 'DELETE' })
}
