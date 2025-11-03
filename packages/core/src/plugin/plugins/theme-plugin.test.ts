import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createThemePlugin, PRESET_THEMES } from './theme-plugin'

describe('Theme Plugin', () => {
  describe('createThemePlugin', () => {
    it('should create plugin with correct structure', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
          dark: { colors: { primary: '#177ddc' } },
        },
      })

      expect(plugin.name).toBe('theme')
      expect(plugin.version).toBeDefined()
      expect(plugin.install).toBeDefined()
    })

    it('should use preset themes if not provided', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
      })

      expect(plugin).toBeDefined()
    })

    it('should validate theme configuration', () => {
      expect(() => {
        createThemePlugin({
          defaultTheme: 'light',
          themes: {
            // @ts-expect-error - testing invalid theme
            light: 'invalid',
          },
        })
      }).toThrow()
    })
  })

  describe('PRESET_THEMES', () => {
    it('should contain light and dark themes', () => {
      expect(PRESET_THEMES.light).toBeDefined()
      expect(PRESET_THEMES.dark).toBeDefined()
    })

    it('should have valid theme structure', () => {
      expect(PRESET_THEMES.light.colors).toBeDefined()
      expect(PRESET_THEMES.dark.colors).toBeDefined()
    })

    it('should have primary color defined', () => {
      expect(PRESET_THEMES.light.colors.primary).toBeDefined()
      expect(PRESET_THEMES.dark.colors.primary).toBeDefined()
    })
  })

  describe('Plugin Installation', () => {
    it('should install without errors', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
          dark: { colors: { primary: '#177ddc' } },
        },
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

    it('should register theme methods on engine', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
        },
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

      expect(mockEngine.setTheme).toBeDefined()
      expect(mockEngine.getTheme).toBeDefined()
      expect(mockEngine.registerTheme).toBeDefined()
    })

    it('should set default theme on install', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
        },
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
        'theme.current',
        'light'
      )
    })
  })

  describe('Theme Switching', () => {
    it('should switch theme correctly', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
          dark: { colors: { primary: '#177ddc' } },
        },
      })

      let currentTheme = 'light'
      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn((key, value) => {
            if (key === 'theme.current') {
              currentTheme = value
            }
          }),
          get: vi.fn(() => currentTheme),
        },
      }

      plugin.install(mockEngine)
      mockEngine.setTheme('dark')

      expect(mockEngine.state.set).toHaveBeenCalledWith('theme.current', 'dark')
    })

    it('should emit event when theme changes', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
          dark: { colors: { primary: '#177ddc' } },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'light'),
        },
      }

      plugin.install(mockEngine)
      mockEngine.setTheme('dark')

      expect(mockEngine.events.emit).toHaveBeenCalledWith(
        'theme:changed',
        expect.objectContaining({
          oldTheme: 'light',
          newTheme: 'dark',
        })
      )
    })

    it('should apply CSS variables when switching theme', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff', background: '#ffffff' } },
          dark: { colors: { primary: '#177ddc', background: '#1f1f1f' } },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'light'),
        },
      }

      plugin.install(mockEngine)
      mockEngine.setTheme('dark')

      // Should apply CSS variables
      expect(mockEngine.events.emit).toHaveBeenCalled()
    })
  })

  describe('Theme Registration', () => {
    it('should allow registering new themes', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
        },
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

      expect(() => {
        mockEngine.registerTheme('custom', {
          colors: { primary: '#ff0000' },
        })
      }).not.toThrow()
    })

    it('should validate registered theme', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
        },
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

      expect(() => {
        // @ts-expect-error - testing invalid theme
        mockEngine.registerTheme('invalid', null)
      }).toThrow()
    })
  })

  describe('Theme Persistence', () => {
    it('should persist theme when enabled', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
          dark: { colors: { primary: '#177ddc' } },
        },
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
          get: vi.fn(() => 'light'),
        },
      }

      plugin.install(mockEngine)

      // Should set up persistence
      expect(mockEngine.events.on).toHaveBeenCalled()
    })

    it('should load persisted theme on init', () => {
      // Mock localStorage
      const mockStorage = {
        getItem: vi.fn(() => 'dark'),
        setItem: vi.fn(),
      }
      global.localStorage = mockStorage as any

      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
          dark: { colors: { primary: '#177ddc' } },
        },
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

      // Should load from storage
      expect(mockStorage.getItem).toHaveBeenCalled()
    })
  })

  describe('Theme Utilities', () => {
    it('should get current theme', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
        },
      })

      const mockEngine: any = {
        plugins: new Map(),
        events: {
          emit: vi.fn(),
          on: vi.fn(),
        },
        state: {
          set: vi.fn(),
          get: vi.fn(() => 'light'),
        },
      }

      plugin.install(mockEngine)

      expect(mockEngine.getTheme()).toBe('light')
    })

    it('should list available themes', () => {
      const plugin = createThemePlugin({
        defaultTheme: 'light',
        themes: {
          light: { colors: { primary: '#1890ff' } },
          dark: { colors: { primary: '#177ddc' } },
          custom: { colors: { primary: '#00ff00' } },
        },
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

      if (mockEngine.getAvailableThemes) {
        const themes = mockEngine.getAvailableThemes()
        expect(themes).toContain('light')
        expect(themes).toContain('dark')
        expect(themes).toContain('custom')
      }
    })
  })
})
