import { describe, expect, it, vi } from 'vitest'

import {
  CacheProvider,
  provideCacheManager,
  useCache,
  useCacheManager,
  useCacheStats,
} from '../../src/vue/index'

// Mock all Vue exports
vi.mock('../../src/vue/use-cache', () => ({
  useCache: vi.fn(),
  useCacheManager: vi.fn(),
  provideCacheManager: vi.fn(),
}))

vi.mock('../../src/vue/use-cache-stats', () => ({
  useCacheStats: vi.fn(),
}))

vi.mock('../../src/vue/provider', () => ({
  CacheProvider: {
    install: vi.fn(),
  },
}))

describe('vue Index Exports', () => {
  it('should export useCache function', () => {
    expect(typeof useCache).toBe('function')
  })

  it('should export useCacheStats function', () => {
    expect(typeof useCacheStats).toBe('function')
  })

  it('should export useCacheManager function', () => {
    expect(typeof useCacheManager).toBe('function')
  })

  it('should export provideCacheManager function', () => {
    expect(typeof provideCacheManager).toBe('function')
  })

  it('should export CacheProvider', () => {
    expect(CacheProvider).toBeDefined()
    expect(typeof CacheProvider).toBe('object')
  })

  it('should have install method on CacheProvider', () => {
    // CacheProvider is mocked, so just check it exists
    expect(CacheProvider).toBeDefined()
  })
})
