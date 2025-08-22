import type { HttpClient, RequestConfig } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useRequest } from '@/vue/useRequest'
import { createMockError, createMockResponse } from '../../setup'

// 创建模拟 HTTP 客户端
function createMockClient(): HttpClient {
  return {
    request: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      error: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    },
    cancelAll: vi.fn(),
    getActiveRequestCount: vi.fn().mockReturnValue(0),
    updateRetryConfig: vi.fn(),
    getConfig: vi.fn().mockReturnValue({}),
    clearCache: vi.fn(),
    getConcurrencyStatus: vi.fn().mockReturnValue({
      activeCount: 0,
      queuedCount: 0,
      maxConcurrent: 10,
      maxQueueSize: 100,
    }),
    cancelQueue: vi.fn(),
  }
}

describe('useRequest', () => {
  let mockClient: HttpClient

  beforeEach(() => {
    mockClient = createMockClient()
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { data, loading, error, finished } = useRequest(
      mockClient,
      ref(config),
      {
        immediate: false,
      },
    )

    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(finished.value).toBe(false)
  })

  it('should initialize with initial data', () => {
    const initialData = { id: 1, name: 'Test' }
    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { data } = useRequest(mockClient, ref(config), {
      immediate: false,
      initialData,
    })

    expect(data.value).toEqual(initialData)
  })

  it('should execute request successfully', async () => {
    const mockResponse = createMockResponse({ id: 1, name: 'Test User' })
    vi.mocked(mockClient.request).mockResolvedValue(mockResponse)

    const config: RequestConfig = { url: '/users/1', method: 'GET' }
    const { data, loading, error, finished, execute } = useRequest(
      mockClient,
      ref(config),
      {
        immediate: false,
      },
    )

    const promise = execute()

    // 检查加载状态
    expect(loading.value).toBe(true)
    expect(finished.value).toBe(false)

    const response = await promise

    // 检查完成状态
    expect(loading.value).toBe(false)
    expect(finished.value).toBe(true)
    expect(error.value).toBeNull()
    expect(data.value).toEqual({ id: 1, name: 'Test User' })
    expect(response).toBe(mockResponse)
  })

  it('should handle request errors', async () => {
    const mockError = createMockError('Request failed', 'NETWORK_ERROR', 500)
    vi.mocked(mockClient.request).mockRejectedValue(mockError)

    const config: RequestConfig = { url: '/users/1', method: 'GET' }
    const { data, loading, error, finished, execute } = useRequest(
      mockClient,
      ref(config),
      {
        immediate: false,
      },
    )

    await expect(execute()).rejects.toThrow('Request failed')

    expect(loading.value).toBe(false)
    expect(finished.value).toBe(true)
    expect(error.value).toBe(mockError)
    expect(data.value).toBeNull()
  })

  it('should call success callback', async () => {
    const mockResponse = createMockResponse({ success: true })
    vi.mocked(mockClient.request).mockResolvedValue(mockResponse)

    const onSuccess = vi.fn()
    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { execute } = useRequest(mockClient, ref(config), {
      immediate: false,
      onSuccess,
    })

    await execute()

    expect(onSuccess).toHaveBeenCalledWith({ success: true }, mockResponse)
  })

  it('should call error callback', async () => {
    const mockError = createMockError('Request failed')
    vi.mocked(mockClient.request).mockRejectedValue(mockError)

    const onError = vi.fn()
    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { execute } = useRequest(mockClient, ref(config), {
      immediate: false,
      onError,
    })

    await expect(execute()).rejects.toThrow()

    expect(onError).toHaveBeenCalledWith(mockError)
  })

  it('should call finally callback', async () => {
    const mockResponse = createMockResponse({ success: true })
    vi.mocked(mockClient.request).mockResolvedValue(mockResponse)

    const onFinally = vi.fn()
    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { execute } = useRequest(mockClient, ref(config), {
      immediate: false,
      onFinally,
    })

    await execute()

    expect(onFinally).toHaveBeenCalled()
  })

  it('should transform response data', async () => {
    const mockResponse = createMockResponse({ name: 'john' })
    vi.mocked(mockClient.request).mockResolvedValue(mockResponse)

    const transform = vi.fn(data => ({
      ...data,
      name: data.name.toUpperCase(),
    }))
    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { data, execute } = useRequest(mockClient, ref(config), {
      immediate: false,
      transform,
    })

    await execute()

    expect(transform).toHaveBeenCalledWith({ name: 'john' })
    expect(data.value).toEqual({ name: 'JOHN' })
  })

  it('should refresh request', async () => {
    const mockResponse = createMockResponse({ id: 1 })
    vi.mocked(mockClient.request).mockResolvedValue(mockResponse)

    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { refresh } = useRequest(mockClient, ref(config), {
      immediate: false,
    })

    await refresh()

    expect(mockClient.request).toHaveBeenCalledWith(
      expect.objectContaining(config),
    )
  })

  it('should reset state', () => {
    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { data, loading, error, finished, reset } = useRequest<{
      test: boolean
      changed?: boolean
    }>(mockClient, ref(config), {
      immediate: false,
      initialData: { test: true },
    })

    // 模拟一些状态变化
    data.value = { test: false, changed: true }
    loading.value = true
    error.value = createMockError('Test error')
    finished.value = true

    reset()

    expect(data.value).toEqual({ test: true })
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(finished.value).toBe(false)
  })

  it('should execute immediately by default', async () => {
    const mockResponse = createMockResponse({ success: true })
    vi.mocked(mockClient.request).mockResolvedValue(mockResponse)

    const config: RequestConfig = { url: '/test', method: 'GET' }

    useRequest(mockClient, ref(config))

    // 等待下一个 tick 让 watch 执行
    await nextTick()

    expect(mockClient.request).toHaveBeenCalled()
  })

  it('should watch config changes', async () => {
    const mockResponse = createMockResponse({ success: true })
    vi.mocked(mockClient.request).mockResolvedValue(mockResponse)

    const config = ref<RequestConfig>({ url: '/test1', method: 'GET' })

    useRequest(mockClient, config)

    await nextTick()
    expect(mockClient.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test1' }),
    )

    // 更改配置
    config.value = { url: '/test2', method: 'GET' }
    await nextTick()

    expect(mockClient.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test2' }),
    )
  })

  it('should handle cancellation', async () => {
    // 模拟长时间运行的请求
    vi.mocked(mockClient.request).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000)),
    )

    const config: RequestConfig = { url: '/test', method: 'GET' }
    const { execute, cancel, canCancel } = useRequest(mockClient, ref(config), {
      immediate: false,
    })

    const promise = execute()

    expect(canCancel.value).toBe(true)

    cancel()

    // 取消后应该能够处理
    await expect(promise).rejects.toThrow()
  })
})
