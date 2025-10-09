/**
 * API 调用组合式函数
 * 提供统一的 API 调用接口
 */

import { ref, reactive } from 'vue'

/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 请求选项
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any> // 添加 URL 查询参数支持
  timeout?: number
}

/**
 * API 状态
 */
export interface ApiState {
  loading: boolean
  error: string | null
}

/**
 * 默认请求选项
 */
const defaultOptions: RequestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30秒超时，因为npm命令可能较慢
}

/**
 * 长时间操作的请求选项
 */
const longOperationOptions: RequestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 600000 // 10分钟，用于下载和安装操作（网络慢时需要更长时间）
}

/**
 * API 基础 URL
 * 在开发模式下，Vite 会自动代理 /api 请求到后端服务器
 * 在生产模式下，前后端在同一个端口
 */
const getBaseUrl = (): string => {
  // 在开发模式和生产模式下都使用相对路径
  // Vite 会自动代理 /api 请求到 3000 端口
  return ''
}

/**
 * 发送请求
 */
async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const mergedOptions = { ...defaultOptions, ...options }
  
  // 处理 URL 查询参数
  let fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`
  if (mergedOptions.params && Object.keys(mergedOptions.params).length > 0) {
    const queryString = new URLSearchParams(
      Object.entries(mergedOptions.params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString()
    
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout)

    const fetchOptions: RequestInit = {
      method: mergedOptions.method,
      headers: mergedOptions.headers,
      signal: controller.signal
    }

    if (mergedOptions.body && mergedOptions.method !== 'GET') {
      fetchOptions.body = typeof mergedOptions.body === 'string'
        ? mergedOptions.body
        : JSON.stringify(mergedOptions.body)
    }

    const response = await fetch(fullUrl, fetchOptions)
    clearTimeout(timeoutId)

    // 检查响应是否为空
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    
    // 如果响应为空或不是 JSON
    if (!isJson || response.status === 204) {
      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          error: `服务器返回非 JSON 响应`
        } as ApiResponse<T>
      }
      // 204 No Content 或其他成功但无内容的响应
      return {
        success: true,
        data: undefined as T
      } as ApiResponse<T>
    }

    // 尝试解析 JSON
    let data: any
    try {
      const text = await response.text()
      if (!text || text.trim() === '') {
        return {
          success: false,
          message: '服务器返回空响应',
          error: 'Empty response body'
        } as ApiResponse<T>
      }
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError)
      return {
        success: false,
        message: '服务器返回无效的 JSON 数据',
        error: parseError instanceof Error ? parseError.message : 'JSON parse error'
      } as ApiResponse<T>
    }
    
    // 即使 HTTP 状态码不是 2xx，也返回响应体中的数据
    // 因为后端可能在 400/500 响应中包含有用的错误信息
    if (!response.ok && !data.success) {
      // 如果响应不成功，返回包含错误信息的响应对象
      return {
        success: false,
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        error: data.error
      } as ApiResponse<T>
    }

    return data as ApiResponse<T>

  } catch (error) {
    console.error('API 请求失败:', error)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    }

    throw new Error('未知错误')
  }
}

/**
 * API 组合式函数
 */
export function useApi() {
  const state = reactive<ApiState>({
    loading: false,
    error: null
  })

  /**
   * GET 请求
   */
  const get = async <T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> => {
    state.loading = true
    state.error = null

    try {
      const response = await request<T>(url, { ...options, method: 'GET' })
      return response
    } catch (error) {
      state.error = error instanceof Error ? error.message : '请求失败'
      throw error
    } finally {
      state.loading = false
    }
  }

  /**
   * POST 请求
   */
  const post = async <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> => {
    state.loading = true
    state.error = null

    try {
      const response = await request<T>(url, { ...options, method: 'POST', body })
      return response
    } catch (error) {
      state.error = error instanceof Error ? error.message : '请求失败'
      throw error
    } finally {
      state.loading = false
    }
  }

  /**
   * 长时间操作的 POST 请求（如下载、安装）
   */
  const postLongOperation = async <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> => {
    state.loading = true
    state.error = null

    try {
      const mergedOptions = { ...longOperationOptions, ...options, method: 'POST' as const, body }
      const response = await request<T>(url, mergedOptions)
      return response
    } catch (error) {
      state.error = error instanceof Error ? error.message : '请求失败'
      throw error
    } finally {
      state.loading = false
    }
  }

  /**
   * PUT 请求
   */
  const put = async <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> => {
    state.loading = true
    state.error = null

    try {
      const response = await request<T>(url, { ...options, method: 'PUT', body })
      return response
    } catch (error) {
      state.error = error instanceof Error ? error.message : '请求失败'
      throw error
    } finally {
      state.loading = false
    }
  }

  /**
   * DELETE 请求
   */
  const del = async <T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> => {
    state.loading = true
    state.error = null

    try {
      const response = await request<T>(url, { ...options, method: 'DELETE' })
      return response
    } catch (error) {
      state.error = error instanceof Error ? error.message : '请求失败'
      throw error
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    get,
    post,
    postLongOperation,
    put,
    delete: del,
    request
  }
}
