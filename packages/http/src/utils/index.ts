// HTTP工具函数

/**
 * URL参数序列化
 */
export function serializeParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

/**
 * 构建完整URL
 */
export function buildURL(baseURL: string, path: string, params?: Record<string, any>): string {
  let url = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  url += path.startsWith('/') ? path : `/${path}`
  
  if (params && Object.keys(params).length > 0) {
    const queryString = serializeParams(params)
    url += `?${queryString}`
  }
  
  return url
}

/**
 * 检查是否为绝对URL
 */
export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

/**
 * 合并URL
 */
export function combineURLs(baseURL: string, relativeURL: string): string {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL
}

/**
 * 检查HTTP状态码是否成功
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300
}

/**
 * 格式化错误信息
 */
export function formatError(error: any): string {
  if (error.response) {
    return `HTTP ${error.response.status}: ${error.response.statusText}`
  } else if (error.request) {
    return 'Network Error: No response received'
  } else {
    return `Request Error: ${error.message}`
  }
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs)
      return retry(fn, retries - 1, delayMs * 2) // 指数退避
    }
    throw error
  }
}