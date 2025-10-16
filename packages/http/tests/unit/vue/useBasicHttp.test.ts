import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { useGet, usePost, usePut, useDelete, usePatch } from '../../../src/vue/useBasicHttp'

// Mock HTTP client
const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
}

vi.mock('../../../src/factory', () => ({
  createHttpClient: () => mockClient,
}))

describe('useBasicHttp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useGet', () => {
    it('should make GET request and update state', async () => {
      const mockData = { id: 1, name: 'test' }
      mockClient.get.mockResolvedValue({ data: mockData })

      const { data, loading, error, execute } = useGet('/api/test', undefined, { immediate: false })

      expect(data.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()

      const result = await execute()

      expect(mockClient.get).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        signal: expect.any(AbortSignal),
      }))
      expect(data.value).toEqual(mockData)
      expect(result).toEqual(mockData)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should handle errors', async () => {
      const mockError = new Error('Request failed')
      mockClient.get.mockRejectedValue(mockError)

      const { data, loading, error, execute } = useGet('/api/test', undefined, { immediate: false })

      await execute()

      expect(data.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBe(mockError)
    })

    it('should call success callback', async () => {
      const mockData = { id: 1, name: 'test' }
      const onSuccess = vi.fn()
      mockClient.get.mockResolvedValue({ data: mockData })

      const { execute } = useGet('/api/test', undefined, { immediate: false, onSuccess })

      await execute()

      expect(onSuccess).toHaveBeenCalledWith(mockData)
    })

    it('should call error callback', async () => {
      const mockError = new Error('Request failed')
      const onError = vi.fn()
      mockClient.get.mockRejectedValue(mockError)

      const { execute } = useGet('/api/test', undefined, { immediate: false, onError })

      await execute()

      expect(onError).toHaveBeenCalledWith(mockError)
    })

    it('should watch URL changes', async () => {
      const mockData = { id: 1, name: 'test' }
      mockClient.get.mockResolvedValue({ data: mockData })

      const url = ref('/api/test1')
      const { data } = useGet(url)

      await nextTick()
      expect(mockClient.get).toHaveBeenCalledWith('/api/test1', expect.any(Object))

      url.value = '/api/test2'
      await nextTick()
      expect(mockClient.get).toHaveBeenCalledWith('/api/test2', expect.any(Object))
    })
  })

  describe('usePost', () => {
    it('should make POST request with data', async () => {
      const mockData = { id: 1, name: 'test' }
      const postData = { name: 'test' }
      mockClient.post.mockResolvedValue({ data: mockData })

      const { data, loading, error, execute } = usePost('/api/test')

      expect(data.value).toBeNull()
      expect(loading.value).toBe(false)

      const result = await execute(postData)

      expect(mockClient.post).toHaveBeenCalledWith('/api/test', postData, expect.objectContaining({
        signal: expect.any(AbortSignal),
      }))
      expect(data.value).toEqual(mockData)
      expect(result).toEqual(mockData)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should handle POST errors', async () => {
      const mockError = new Error('Post failed')
      mockClient.post.mockRejectedValue(mockError)

      const { data, error, execute } = usePost('/api/test')

      await execute({ name: 'test' })

      expect(data.value).toBeNull()
      expect(error.value).toBe(mockError)
    })
  })

  describe('usePut', () => {
    it('should make PUT request with data', async () => {
      const mockData = { id: 1, name: 'updated' }
      const putData = { name: 'updated' }
      mockClient.put.mockResolvedValue({ data: mockData })

      const { data, execute } = usePut('/api/test/1')

      const result = await execute(putData)

      expect(mockClient.put).toHaveBeenCalledWith('/api/test/1', putData, expect.objectContaining({
        signal: expect.any(AbortSignal),
      }))
      expect(data.value).toEqual(mockData)
      expect(result).toEqual(mockData)
    })
  })

  describe('useDelete', () => {
    it('should make DELETE request', async () => {
      const mockData = { success: true }
      mockClient.delete.mockResolvedValue({ data: mockData })

      const { data, execute } = useDelete('/api/test/1')

      const result = await execute()

      expect(mockClient.delete).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
        signal: expect.any(AbortSignal),
      }))
      expect(data.value).toEqual(mockData)
      expect(result).toEqual(mockData)
    })
  })

  describe('usePatch', () => {
    it('should make PATCH request with data', async () => {
      const mockData = { id: 1, name: 'patched' }
      const patchData = { name: 'patched' }
      mockClient.patch.mockResolvedValue({ data: mockData })

      const { data, execute } = usePatch('/api/test/1')

      const result = await execute(patchData)

      expect(mockClient.patch).toHaveBeenCalledWith('/api/test/1', patchData, expect.objectContaining({
        signal: expect.any(AbortSignal),
      }))
      expect(data.value).toEqual(mockData)
      expect(result).toEqual(mockData)
    })
  })

  describe('common functionality', () => {
    it('should reset state', async () => {
      const mockData = { id: 1, name: 'test' }
      mockClient.get.mockResolvedValue({ data: mockData })

      const { data, loading, error, execute, reset } = useGet('/api/test', undefined, { immediate: false })

      await execute()
      expect(data.value).toEqual(mockData)

      reset()
      expect(data.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should clear error', async () => {
      const mockError = new Error('Request failed')
      mockClient.get.mockRejectedValue(mockError)

      const { error, execute, clearError } = useGet('/api/test', undefined, { immediate: false })

      await execute()
      expect(error.value).toBe(mockError)

      clearError()
      expect(error.value).toBeNull()
    })

    it('should have correct hasError computed property', async () => {
      const mockError = new Error('Request failed')
      mockClient.get.mockRejectedValue(mockError)

      const { hasError, execute, clearError } = useGet('/api/test', undefined, { immediate: false })

      expect(hasError.value).toBe(false)

      await execute()
      expect(hasError.value).toBe(true)

      clearError()
      expect(hasError.value).toBe(false)
    })
  })
})
