import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieEngine } from '../../src/engines/cookie-engine'
import { StorageEngineFactory } from '../../src/engines/factory'
import { IndexedDBEngine } from '../../src/engines/indexeddb-engine'
import { LocalStorageEngine } from '../../src/engines/local-storage-engine'
import { MemoryEngine } from '../../src/engines/memory-engine'
import { SessionStorageEngine } from '../../src/engines/session-storage-engine'

// Mock IndexedDBEngine.create
vi.mock('../../src/engines/indexeddb-engine', () => ({
  IndexedDBEngine: {
    create: vi.fn().mockResolvedValue(
      new (class MockIndexedDBEngine {
        async set() { }
        async get() {
          return null
        }

        async has() {
          return false
        }

        async remove() { }
        async clear() { }
        async keys() {
          return []
        }

        async getStats() {
          return { itemCount: 0, usedSize: 0 }
        }

        isAvailable() {
          return true
        }
      })(),
    ),
  },
}))

describe('storageEngineFactory', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create localStorage engine', async () => {
      const engine = await StorageEngineFactory.create('localStorage')
      expect(engine).toBeInstanceOf(LocalStorageEngine)
    })

    it('should create sessionStorage engine', async () => {
      const engine = await StorageEngineFactory.create('sessionStorage')
      expect(engine).toBeInstanceOf(SessionStorageEngine)
    })

    it('should create cookie engine', async () => {
      const engine = await StorageEngineFactory.create('cookie')
      expect(engine).toBeInstanceOf(CookieEngine)
    })

    it('should create indexedDB engine', async () => {
      const engine = await StorageEngineFactory.create('indexedDB')
      expect(IndexedDBEngine.create).toHaveBeenCalled()
      expect(engine).toBeDefined()
    })

    it('should create memory engine', async () => {
      const engine = await StorageEngineFactory.create('memory')
      expect(engine).toBeInstanceOf(MemoryEngine)
    })

    it('should create engines with config', async () => {
      const config = { enabled: true, maxSize: 1024 }

      const localEngine = await StorageEngineFactory.create(
        'localStorage',
        config,
      )
      expect(localEngine).toBeInstanceOf(LocalStorageEngine)

      const sessionEngine = await StorageEngineFactory.create(
        'sessionStorage',
        config,
      )
      expect(sessionEngine).toBeInstanceOf(SessionStorageEngine)

      const cookieEngine = await StorageEngineFactory.create('cookie', {
        domain: '.test.com',
      })
      expect(cookieEngine).toBeInstanceOf(CookieEngine)

      const memoryEngine = await StorageEngineFactory.create('memory', {
        maxSize: 100 * 1024, // 100KB
      })
      expect(memoryEngine).toBeInstanceOf(MemoryEngine)
    })

    it('should throw error for unsupported engine', async () => {
      await expect(
        StorageEngineFactory.create('unsupported' as any),
      ).rejects.toThrow('Unsupported storage engine: unsupported')
    })
  })

  describe('isAvailable', () => {
    it('should check localStorage availability', () => {
      // In test environment, localStorage is available
      expect(StorageEngineFactory.isAvailable('localStorage')).toBe(true)
    })

    it('should check sessionStorage availability', () => {
      // In test environment, sessionStorage is available
      expect(StorageEngineFactory.isAvailable('sessionStorage')).toBe(true)
    })

    it('should check cookie availability', () => {
      // In test environment, document.cookie is available
      expect(StorageEngineFactory.isAvailable('cookie')).toBe(true)
    })

    it('should check indexedDB availability', () => {
      // IndexedDB availability depends on test environment setup
      const result = StorageEngineFactory.isAvailable('indexedDB')
      expect(typeof result).toBe('boolean')
    })

    it('should check memory availability', () => {
      // Memory is always available
      expect(StorageEngineFactory.isAvailable('memory')).toBe(true)
    })

    it('should return false for unsupported engine', () => {
      expect(StorageEngineFactory.isAvailable('unsupported' as any)).toBe(false)
    })

    it('should handle errors gracefully', () => {
      // Mock window to be undefined to simulate server environment
      const originalWindow = globalThis.window
      delete (globalThis as any).window

      expect(StorageEngineFactory.isAvailable('localStorage')).toBe(false)
      expect(StorageEngineFactory.isAvailable('sessionStorage')).toBe(false)
      expect(StorageEngineFactory.isAvailable('indexedDB')).toBe(false)
      expect(StorageEngineFactory.isAvailable('memory')).toBe(true)

      // Restore window
      globalThis.window = originalWindow
    })

    it('should handle document being undefined', () => {
      const originalDocument = globalThis.document
      delete (globalThis as any).document

      expect(StorageEngineFactory.isAvailable('cookie')).toBe(false)

      // Restore document
      globalThis.document = originalDocument
    })

    it('should handle null storage objects', () => {
      const originalLocalStorage = globalThis.window.localStorage
      const originalSessionStorage = globalThis.window.sessionStorage
      const originalIndexedDB = globalThis.window.indexedDB

      // Mock null storage
      Object.defineProperty(globalThis.window, 'localStorage', {
        value: null,
        writable: true,
      })
      Object.defineProperty(globalThis.window, 'sessionStorage', {
        value: null,
        writable: true,
      })
      Object.defineProperty(globalThis.window, 'indexedDB', {
        value: null,
        writable: true,
      })

      expect(StorageEngineFactory.isAvailable('localStorage')).toBe(false)
      expect(StorageEngineFactory.isAvailable('sessionStorage')).toBe(false)
      expect(StorageEngineFactory.isAvailable('indexedDB')).toBe(false)

      // Restore storage objects
      Object.defineProperty(globalThis.window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      })
      Object.defineProperty(globalThis.window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
      })
      Object.defineProperty(globalThis.window, 'indexedDB', {
        value: originalIndexedDB,
        writable: true,
      })
    })
  })

  describe('getAvailableEngines', () => {
    it('should return all available engines', () => {
      const engines = StorageEngineFactory.getAvailableEngines()
      expect(engines).toBeInstanceOf(Array)
      expect(engines.length).toBeGreaterThan(0)
      expect(engines).toContain('memory') // Memory is always available
    })

    it('should filter out unavailable engines', () => {
      const engines = StorageEngineFactory.getAvailableEngines()
      expect(engines).toBeInstanceOf(Array)
      expect(engines).toContain('memory') // Memory is always available
    })
  })

  describe('getRecommendedEngine', () => {
    it('should return a valid engine as recommendation', () => {
      const recommended = StorageEngineFactory.getRecommendedEngine()
      const validEngines = [
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'memory',
        'cookie',
      ]
      expect(validEngines).toContain(recommended)
    })

    it('should fallback to next available engine', () => {
      // Mock localStorage as unavailable
      vi.spyOn(StorageEngineFactory, 'isAvailable').mockImplementation(
        (engine) => {
          if (engine === 'localStorage')
            return false
          if (engine === 'memory')
            return true
          return false
        },
      )

      const recommended = StorageEngineFactory.getRecommendedEngine()
      expect(recommended).toBe('memory')

      vi.restoreAllMocks()
    })

    it('should fallback to memory when no other engines available', () => {
      // Mock all engines as unavailable except memory
      vi.spyOn(StorageEngineFactory, 'isAvailable').mockImplementation(
        (engine) => {
          return engine === 'memory'
        },
      )

      const recommended = StorageEngineFactory.getRecommendedEngine()
      expect(recommended).toBe('memory')

      vi.restoreAllMocks()
    })

    it('should return memory as final fallback', () => {
      // Mock all engines as unavailable
      vi.spyOn(StorageEngineFactory, 'isAvailable').mockReturnValue(false)

      const recommended = StorageEngineFactory.getRecommendedEngine()
      expect(recommended).toBe('memory')

      vi.restoreAllMocks()
    })
  })
})
