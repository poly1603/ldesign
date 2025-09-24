import type { MaybeRef, Ref } from 'vue'
import type { HttpClientConfig, RequestConfig } from '../types'
import { computed, onUnmounted, ref, unref, watch } from 'vue'
import { createHttpClient } from '../factory'

/**
 * 资源操作选项
 */
export interface ResourceOptions<T> {
  /** 是否立即加载数据 */
  immediate?: boolean
  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean
  /** 数据转换函数 */
  transform?: (data: any) => T
  /** 成功回调 */
  onSuccess?: (data: T, operation: 'list' | 'get' | 'create' | 'update' | 'delete') => void
  /** 错误回调 */
  onError?: (error: Error, operation: 'list' | 'get' | 'create' | 'update' | 'delete') => void
  /** HTTP客户端配置 */
  clientConfig?: HttpClientConfig
}

/**
 * 资源操作返回值
 */
export interface ResourceReturn<T> {
  /** 数据列表 */
  items: Ref<T[]>
  /** 当前项 */
  current: Ref<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 是否有错误 */
  hasError: Ref<boolean>
  /** 获取列表 */
  list: (config?: RequestConfig) => Promise<T[]>
  /** 获取单个项 */
  get: (id: string | number, config?: RequestConfig) => Promise<T | null>
  /** 创建项 */
  create: (data: Partial<T>, config?: RequestConfig) => Promise<T | null>
  /** 更新项 */
  update: (id: string | number, data: Partial<T>, config?: RequestConfig) => Promise<T | null>
  /** 删除项 */
  remove: (id: string | number, config?: RequestConfig) => Promise<boolean>
  /** 重置状态 */
  reset: () => void
  /** 清除错误 */
  clearError: () => void
  /** 刷新列表 */
  refresh: () => Promise<T[]>
}

/**
 * 资源管理hook
 * 提供完整的CRUD操作
 *
 * @example
 * ```ts
 * const { items, current, loading, list, get, create, update, remove } = useResource<User>('/api/users')
 *
 * // 获取列表
 * await list()
 *
 * // 获取单个用户
 * await get(1)
 *
 * // 创建用户
 * await create({ name: 'John', email: 'john@example.com' })
 *
 * // 更新用户
 * await update(1, { name: 'Jane' })
 *
 * // 删除用户
 * await remove(1)
 * ```
 */
export function useResource<T = any>(
  baseUrl: MaybeRef<string>,
  options: ResourceOptions<T> = {},
): ResourceReturn<T> {
  const client = createHttpClient(options.clientConfig)

  // 响应式状态
  const items = ref<T[]>([])
  const current = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const hasError = computed(() => error.value !== null)

  let abortController: AbortController | null = null

  /**
   * 处理请求
   */
  const handleRequest = async <R>(
    operation: 'list' | 'get' | 'create' | 'update' | 'delete',
    requestFn: () => Promise<R>,
  ): Promise<R | null> => {
    try {
      loading.value = true
      error.value = null

      // 取消之前的请求
      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      const result = await requestFn()

      if (operation === 'list' || operation === 'get') {
        options.onSuccess?.(result as any, operation)
      }

      return result
    }
    catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj, operation)
      }
      return null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 获取列表
   */
  const list = async (config?: RequestConfig): Promise<T[]> => {
    const result = await handleRequest('list', async () => {
      const requestConfig = {
        ...config,
        signal: abortController?.signal,
      }

      const response = await client.get<T[]>(unref(baseUrl), requestConfig)
      let data = response.data

      if (options.transform) {
        data = Array.isArray(data) ? data.map(options.transform) : data
      }

      items.value = data
      return data
    })

    return result || []
  }

  /**
   * 获取单个项
   */
  const get = async (id: string | number, config?: RequestConfig): Promise<T | null> => {
    const result = await handleRequest('get', async () => {
      const url = `${unref(baseUrl)}/${id}`
      const requestConfig = {
        ...config,
        signal: abortController?.signal,
      }

      const response = await client.get<T>(url, requestConfig)
      let data = response.data

      if (options.transform) {
        data = options.transform(data)
      }

      current.value = data
      return data
    })

    return result
  }

  /**
   * 创建项
   */
  const create = async (data: Partial<T>, config?: RequestConfig): Promise<T | null> => {
    const result = await handleRequest('create', async () => {
      const requestConfig = {
        ...config,
        signal: abortController?.signal,
      }

      const response = await client.post<T>(unref(baseUrl), data, requestConfig)
      let responseData = response.data

      if (options.transform) {
        responseData = options.transform(responseData)
      }

      // 添加到列表中
      ;(items.value as any).push(responseData)
      current.value = responseData

      options.onSuccess?.(responseData, 'create')
      return responseData
    })

    return result
  }

  /**
   * 更新项
   */
  const update = async (id: string | number, data: Partial<T>, config?: RequestConfig): Promise<T | null> => {
    const result = await handleRequest('update', async () => {
      const url = `${unref(baseUrl)}/${id}`
      const requestConfig = {
        ...config,
        signal: abortController?.signal,
      }

      const response = await client.put<T>(url, data, requestConfig)
      let responseData = response.data

      if (options.transform) {
        responseData = options.transform(responseData)
      }

      // 更新列表中的项
      const index = items.value.findIndex((item: any) => item.id === id)
      if (index !== -1) {
        ;(items.value as any)[index] = responseData
      }

      current.value = responseData
      options.onSuccess?.(responseData, 'update')
      return responseData
    })

    return result
  }

  /**
   * 删除项
   */
  const remove = async (id: string | number, config?: RequestConfig): Promise<boolean> => {
    const result = await handleRequest('delete', async () => {
      const url = `${unref(baseUrl)}/${id}`
      const requestConfig = {
        ...config,
        signal: abortController?.signal,
      }

      await client.delete(url, requestConfig)

      // 从列表中移除
      const index = items.value.findIndex((item: any) => item.id === id)
      if (index !== -1) {
        items.value.splice(index, 1)
      }

      // 如果当前项被删除，清空当前项
      if (current.value && (current.value as any).id === id) {
        current.value = null
      }

      options.onSuccess?.(null as any, 'delete')
      return true
    })

    return result !== null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    items.value = []
    current.value = null
    loading.value = false
    error.value = null
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 刷新列表
   */
  const refresh = (): Promise<T[]> => {
    return list()
  }

  // 立即加载数据
  if (options.immediate !== false) {
    watch(() => unref(baseUrl), () => {
      list()
    }, { immediate: true })
  }

  // 组件卸载时取消请求
  if (options.cancelOnUnmount !== false) {
    onUnmounted(() => {
      if (abortController) {
        abortController.abort()
      }
    })
  }

  return {
    items: items as Ref<T[]>,
    current: current as Ref<T | null>,
    loading,
    error,
    hasError,
    list,
    get,
    create,
    update,
    remove,
    reset,
    clearError,
    refresh,
  }
}
