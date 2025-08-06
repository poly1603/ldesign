import type { RequestInterceptor } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InterceptorManagerImpl } from '@/interceptors/manager'

describe('interceptorManagerImpl', () => {
  let manager: InterceptorManagerImpl<RequestInterceptor>

  beforeEach(() => {
    manager = new InterceptorManagerImpl<RequestInterceptor>()
  })

  describe('use', () => {
    it('should add interceptor and return id', () => {
      const interceptor = vi.fn(config => config)
      const id = manager.use(interceptor)

      expect(typeof id).toBe('number')
      expect(id).toBe(0)
    })

    it('should add multiple interceptors with incremental ids', () => {
      const interceptor1 = vi.fn(config => config)
      const interceptor2 = vi.fn(config => config)

      const id1 = manager.use(interceptor1)
      const id2 = manager.use(interceptor2)

      expect(id1).toBe(0)
      expect(id2).toBe(1)
    })

    it('should add interceptor with error handler', () => {
      const fulfilled = vi.fn(config => config)
      const rejected = vi.fn(error => error)

      const id = manager.use(fulfilled, rejected)

      expect(typeof id).toBe('number')
    })
  })

  describe('eject', () => {
    it('should remove interceptor by id', () => {
      const interceptor = vi.fn(config => config)
      const id = manager.use(interceptor)

      manager.eject(id)

      const interceptors = manager.getInterceptors()
      expect(interceptors).toHaveLength(0)
    })

    it('should handle invalid id gracefully', () => {
      manager.eject(999)
      // Should not throw
    })

    it('should not affect other interceptors', () => {
      const interceptor1 = vi.fn(config => config)
      const interceptor2 = vi.fn(config => config)
      const interceptor3 = vi.fn(config => config)

      manager.use(interceptor1)
      const id2 = manager.use(interceptor2)
      manager.use(interceptor3)

      manager.eject(id2)

      const interceptors = manager.getInterceptors()
      expect(interceptors).toHaveLength(2)
      expect(interceptors[0]!.fulfilled).toBe(interceptor1)
      expect(interceptors[1]!.fulfilled).toBe(interceptor3)
    })
  })

  describe('clear', () => {
    it('should remove all interceptors', () => {
      const interceptor1 = vi.fn(config => config)
      const interceptor2 = vi.fn(config => config)

      manager.use(interceptor1)
      manager.use(interceptor2)

      manager.clear()

      const interceptors = manager.getInterceptors()
      expect(interceptors).toHaveLength(0)
    })
  })

  describe('forEach', () => {
    it('should iterate over all interceptors', () => {
      const interceptor1 = vi.fn(config => config)
      const interceptor2 = vi.fn(config => config)

      manager.use(interceptor1)
      manager.use(interceptor2)

      const callback = vi.fn()
      manager.forEach(callback)

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenNthCalledWith(1, {
        fulfilled: interceptor1,
        rejected: undefined,
      })
      expect(callback).toHaveBeenNthCalledWith(2, {
        fulfilled: interceptor2,
        rejected: undefined,
      })
    })

    it('should skip ejected interceptors', () => {
      const interceptor1 = vi.fn(config => config)
      const interceptor2 = vi.fn(config => config)

      const id1 = manager.use(interceptor1)
      manager.use(interceptor2)
      manager.eject(id1)

      const callback = vi.fn()
      manager.forEach(callback)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({
        fulfilled: interceptor2,
        rejected: undefined,
      })
    })
  })

  describe('getInterceptors', () => {
    it('should return all active interceptors', () => {
      const interceptor1 = vi.fn(config => config)
      const interceptor2 = vi.fn(config => config)

      manager.use(interceptor1)
      manager.use(interceptor2)

      const interceptors = manager.getInterceptors()

      expect(interceptors).toHaveLength(2)
      expect(interceptors[0]!.fulfilled).toBe(interceptor1)
      expect(interceptors[1]!.fulfilled).toBe(interceptor2)
    })

    it('should exclude ejected interceptors', () => {
      const interceptor1 = vi.fn(config => config)
      const interceptor2 = vi.fn(config => config)
      const interceptor3 = vi.fn(config => config)

      const id1 = manager.use(interceptor1)
      manager.use(interceptor2)
      const id3 = manager.use(interceptor3)

      manager.eject(id1)
      manager.eject(id3)

      const interceptors = manager.getInterceptors()

      expect(interceptors).toHaveLength(1)
      expect(interceptors[0]!.fulfilled).toBe(interceptor2)
    })

    it('should return empty array when no interceptors', () => {
      const interceptors = manager.getInterceptors()
      expect(interceptors).toHaveLength(0)
    })
  })
})
