import { describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'

// Mock createCache
vi.mock('../../src/index', () => ({
  createCache: vi.fn().mockReturnValue({
    set: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    keys: vi.fn(),
    getStats: vi.fn(),
    getEngineStats: vi.fn(),
    isEngineAvailable: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }),
}))

// Mock CacheProvider
const mockCacheProvider = {
  install: vi.fn(),
}

vi.mock('../../src/vue/provider', () => ({
  CacheProvider: mockCacheProvider,
}))

describe('cacheProvider', () => {
  it('should have install method', () => {
    expect(typeof mockCacheProvider.install).toBe('function')
  })

  it('should install cache provider', () => {
    const app = createApp({})

    mockCacheProvider.install(app)

    expect(mockCacheProvider.install).toHaveBeenCalledWith(app)
  })
})
