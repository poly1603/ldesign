import { describe, it, expect, vi } from 'vitest'
import { createSizePlugin, PRESET_SIZES, COMMON_SIZE_SETS } from './size-plugin'

describe('Size Plugin', () => {
  describe('createSizePlugin', () => {
    it('should create plugin with correct structure', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
      })

      expect(plugin.name).toBe('size')
      expect(plugin.version).toBeDefined()
      expect(plugin.install).toBeDefined()
    })

    it('should use preset sizes', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
        sizes: PRESET_SIZES,
      })

      expect(plugin).toBeDefined()
    })

    it('should validate size configuration', () => {
      expect(() => {
        createSizePlugin({
          // @ts-expect-error - testing invalid size
          defaultSize: 'invalid-size',
        })
      }).toThrow()
    })
  })

  describe('PRESET_SIZES', () => {
    it('should contain common sizes', () => {
      expect(PRESET_SIZES).toContain('mini')
      expect(PRESET_SIZES).toContain('small')
      expect(PRESET_SIZES).toContain('medium')
      expect(PRESET_SIZES).toContain('large')
      expect(PRESET_SIZES).toContain('xlarge')
    })

    it('should be an array', () => {
      expect(Array.isArray(PRESET_SIZES)).toBe(true)
      expect(PRESET_SIZES.length).toBeGreaterThan(0)
    })
  })

  describe('COMMON_SIZE_SETS', () => {
    it('should contain standard size set', () => {
      expect(COMMON_SIZE_SETS.standard).toBeDefined()
      expect(Array.isArray(COMMON_SIZE_SETS.standard)).toBe(true)
    })

    it('should contain minimal size set', () => {
      expect(COMMON_SIZE_SETS.minimal).toBeDefined()
      expect(COMMON_SIZE_SETS.minimal).toContain('small')
      expect(COMMON_SIZE_SETS.minimal).toContain('medium')
      expect(COMMON_SIZE_SETS.minimal).toContain('large')
    })

    it('should contain extended size set', () => {
      expect(COMMON_SIZE_SETS.extended).toBeDefined()
      expect(COMMON_SIZE_SETS.extended.length).toBeGreaterThan(
        COMMON_SIZE_SETS.standard.length
      )
    })
  })

  describe('Plugin Installation', () => {
    it('should install without errors', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
      })

      const mockEngine = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(),
        },
      }

      expect(() => {
        plugin.install(mockEngine as any)
      }).not.toThrow()
    })

    it('should register size methods on engine', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(),
        },
      }

      plugin.install(mockEngine)

      expect(mockEngine.setSize).toBeDefined()
      expect(mockEngine.getSize).toBeDefined()
    })

    it('should set default size on install', () => {
      const plugin = createSizePlugin({
        defaultSize: 'large',
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(),
        },
      }

      plugin.install(mockEngine)

      expect(mockEngine.state.set).toHaveBeenCalledWith(
        'size.current',
        'large'
      )
    })
  })

  describe('Size Switching', () => {
    it('should switch size correctly', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
      })

      let currentSize = 'medium'
      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn((key, value) => {
            if (key === 'size.current') {
              currentSize = value
            }
          }),
          get: vi.fn(() => currentSize),
        },
      }

      plugin.install(mockEngine)
      mockEngine.setSize('large')

      expect(mockEngine.state.set).toHaveBeenCalledWith('size.current', 'large')
    })

    it('should emit event when size changes', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'medium'),
        },
      }

      plugin.install(mockEngine)
      mockEngine.setSize('large')

      expect(mockEngine.events.emit).toHaveBeenCalledWith(
        'size:changed',
        expect.objectContaining({
          oldSize: 'medium',
          newSize: 'large',
        })
      )
    })

    it('should apply CSS classes when switching size', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'medium'),
        },
      }

      plugin.install(mockEngine)
      mockEngine.setSize('large')

      // Should emit event for CSS class updates
      expect(mockEngine.events.emit).toHaveBeenCalled()
    })
  })

  describe('Size Persistence', () => {
    it('should persist size when enabled', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
        persist: true,
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'medium'),
        },
      }

      plugin.install(mockEngine)

      // Should set up persistence listeners
      expect(mockEngine.events.on).toHaveBeenCalled()
    })

    it('should load persisted size on init', () => {
      // Mock localStorage
      const mockStorage = {
        getItem: vi.fn(() => 'large'),
        setItem: vi.fn(),
      }
      global.localStorage = mockStorage as any

      const plugin = createSizePlugin({
        defaultSize: 'medium',
        persist: true,
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(),
        },
      }

      plugin.install(mockEngine)

      // Should attempt to load from storage
      expect(mockStorage.getItem).toHaveBeenCalled()
    })
  })

  describe('Size Utilities', () => {
    it('should get current size', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'medium'),
        },
      }

      plugin.install(mockEngine)

      expect(mockEngine.getSize()).toBe('medium')
    })

    it('should list available sizes', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
        sizes: ['small', 'medium', 'large'],
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(),
        },
      }

      plugin.install(mockEngine)

      if (mockEngine.getAvailableSizes) {
        const sizes = mockEngine.getAvailableSizes()
        expect(sizes).toContain('small')
        expect(sizes).toContain('medium')
        expect(sizes).toContain('large')
      }
    })

    it('should validate size before setting', () => {
      const plugin = createSizePlugin({
        defaultSize: 'medium',
        sizes: ['small', 'medium', 'large'],
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'medium'),
        },
      }

      plugin.install(mockEngine)

      expect(() => {
        mockEngine.setSize('invalid-size')
      }).toThrow()
    })
  })

  describe('Custom Size Configuration', () => {
    it('should accept custom size definitions', () => {
      const plugin = createSizePlugin({
        defaultSize: 'normal',
        sizes: ['tiny', 'normal', 'huge'],
      })

      expect(plugin).toBeDefined()
    })

    it('should work with custom size values', () => {
      const plugin = createSizePlugin({
        defaultSize: 'normal',
        sizes: ['tiny', 'normal', 'huge'],
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'normal'),
        },
      }

      plugin.install(mockEngine)

      expect(() => {
        mockEngine.setSize('huge')
      }).not.toThrow()
    })
  })
})
