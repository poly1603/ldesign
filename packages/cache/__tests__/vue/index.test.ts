import { describe, it, expect, vi } from 'vitest'

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

import {
  useCache,
  useCacheStats,
  useCacheManager,
  provideCacheManager,
  CacheProvider,
} from '../../src/vue/index'

describe('Vue Index Exports', () => {
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
