import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createWebHistory } from '../src/history'

describe('history', () => {
  describe('createMemoryHistory', () => {
    let history: ReturnType<typeof createMemoryHistory>

    beforeEach(() => {
      history = createMemoryHistory()
    })

    it('should create memory history with initial location', () => {
      expect(history.location).toBe('/')
    })

    it('should create memory history with custom base', () => {
      const historyWithBase = createMemoryHistory('/app')
      expect(historyWithBase.location).toBe('/')
    })

    it('should push new location', () => {
      const listener = vi.fn()
      history.listen(listener)

      history.push('/about')
      expect(history.location).toBe('/about')
      expect(listener).toHaveBeenCalledWith('/about', '/about', expect.objectContaining({ type: 'push' }))
    })

    it('should replace current location', () => {
      const listener = vi.fn()
      history.listen(listener)

      history.push('/about')
      history.replace('/contact')

      expect(history.location).toBe('/contact')
    })

    it('should navigate with go', () => {
      history.push('/page1')
      history.push('/page2')
      history.push('/page3')

      history.go(-2)
      expect(history.location).toBe('/page1')
    })

    it('should navigate back', () => {
      history.push('/page1')
      history.push('/page2')

      history.back()
      expect(history.location).toBe('/page1')
    })

    it('should navigate forward', () => {
      history.push('/page1')
      history.push('/page2')
      history.back()

      history.forward()
      expect(history.location).toBe('/page2')
    })

    it('should handle query parameters', () => {
      history.push('/search?q=test&page=1')
      expect(history.location).toBe('/search?q=test&page=1')
    })

    it('should handle hash', () => {
      history.push('/page#section1')
      expect(history.location).toBe('/page#section1')
    })

    it('should handle complex URLs', () => {
      history.push('/search?q=test&page=1#results')
      expect(history.location).toBe('/search?q=test&page=1#results')
    })

    it('should remove listener', () => {
      const listener = vi.fn()
      const removeListener = history.listen(listener)

      history.push('/test1')
      expect(listener).toHaveBeenCalledTimes(1)

      removeListener()
      history.push('/test2')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      history.listen(listener1)
      history.listen(listener2)

      history.push('/test')

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })
  })

  describe('createWebHistory', () => {
    beforeEach(() => {
      // Mock window.history
      Object.defineProperty(window, 'history', {
        value: {
          pushState: vi.fn(),
          replaceState: vi.fn(),
          go: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
          state: null,
        },
        writable: true,
      })

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/',
          search: '',
          hash: '',
          href: 'http://localhost/',
        },
        writable: true,
      })

      // Mock addEventListener
      Object.defineProperty(window, 'addEventListener', {
        value: vi.fn(),
        writable: true,
      })

      Object.defineProperty(window, 'removeEventListener', {
        value: vi.fn(),
        writable: true,
      })
    })

    it('should create web history', () => {
      const history = createWebHistory()
      expect(history).toBeDefined()
      expect(typeof history.push).toBe('function')
      expect(typeof history.replace).toBe('function')
      expect(typeof history.go).toBe('function')
    })

    it('should create web history with base', () => {
      const history = createWebHistory('/app')
      expect(history).toBeDefined()
    })

    it('should call window.history.pushState on push', () => {
      const history = createWebHistory()
      const pushStateSpy = vi.spyOn(window.history, 'pushState')

      history.push('/about')
      expect(pushStateSpy).toHaveBeenCalled()
    })

    it('should call window.history.replaceState on replace', () => {
      const history = createWebHistory()
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

      history.replace('/about')
      expect(replaceStateSpy).toHaveBeenCalled()
    })

    it('should call window.history.go on go', () => {
      const history = createWebHistory()
      const goSpy = vi.spyOn(window.history, 'go')

      history.go(-1)
      expect(goSpy).toHaveBeenCalledWith(-1)
    })
  })
})
