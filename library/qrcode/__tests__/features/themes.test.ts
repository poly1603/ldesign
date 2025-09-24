import { describe, expect, it, beforeEach } from 'vitest'
import { 
  ThemeManager, 
  themeManager, 
  presetThemes, 
  applyTheme, 
  getTheme, 
  registerTheme, 
  getAllThemes 
} from '../../src/features/themes'

describe('ThemeManager', () => {
  let manager: ThemeManager

  beforeEach(() => {
    manager = new ThemeManager()
  })

  describe('constructor', () => {
    it('should initialize with preset themes', () => {
      expect(manager.getThemeNames().length).toBeGreaterThan(0)
      expect(manager.getTheme('light')).toBeDefined()
      expect(manager.getTheme('dark')).toBeDefined()
    })
  })

  describe('preset themes', () => {
    it('should have all expected preset themes', () => {
      const expectedThemes = {
        'light': 'Light',
        'dark': 'Dark',
        'blue': 'Blue Ocean',
        'green': 'Forest Green',
        'purple': 'Royal Purple',
        'minimal': 'Minimal',
        'neon': 'Neon Glow',
        'sunset': 'Sunset'
      }
      Object.entries(expectedThemes).forEach(([key, expectedName]) => {
        const theme = manager.getTheme(key)
        expect(theme).toBeDefined()
        expect(theme?.name).toBe(expectedName)
        expect(theme?.colors.foreground).toBeDefined()
        expect(theme?.colors.background).toBeDefined()
      })
    })

    it('should have valid theme structure', () => {
      const lightTheme = manager.getTheme('light')
      expect(lightTheme).toBeDefined()
      expect(lightTheme?.colors.foreground).toBe('#000000')
      expect(lightTheme?.colors.background).toBe('#FFFFFF')
      expect(lightTheme?.style?.dotStyle).toBe('square')
    })
  })

  describe('registerTheme', () => {
    it('should register custom theme', () => {
      const customTheme = {
        name: 'custom',
        colors: {
          foreground: '#ff0000',
          background: '#00ff00'
        }
      }
      
      manager.registerTheme('custom', customTheme)
      const retrieved = manager.getTheme('custom')
      
      expect(retrieved).toBeDefined()
      expect(retrieved?.colors.foreground).toBe('#ff0000')
      expect(retrieved?.colors.background).toBe('#00ff00')
    })

    it('should override existing theme', () => {
      const newLightTheme = {
        name: 'Light Modified',
        colors: {
          foreground: '#333333',
          background: '#fafafa'
        }
      }
      
      manager.registerTheme('light', newLightTheme)
      const retrieved = manager.getTheme('light')
      
      expect(retrieved?.colors.foreground).toBe('#333333')
      expect(retrieved?.colors.background).toBe('#fafafa')
    })
  })

  describe('applyTheme', () => {
    it('should apply theme to QR code options', () => {
      const options = manager.applyTheme('dark', { data: 'test' })
      
      expect(options.data).toBe('test')
      expect(options.color?.foreground).toBe('#FFFFFF')
      expect(options.color?.background).toBe('#1a1a1a')
      expect(options.style?.backgroundColor).toBe('#1a1a1a')
    })

    it('should merge with existing options', () => {
      const baseOptions = { 
        data: 'test', 
        size: 300,
        color: { foreground: '#custom' }
      }
      
      const options = manager.applyTheme('light', baseOptions)
      
      expect(options.size).toBe(300)
      expect(options.color?.foreground).toBe('#custom') // should keep custom
      expect(options.color?.background).toBe('#FFFFFF') // from theme
    })

    it('should throw error for non-existent theme', () => {
      expect(() => {
        manager.applyTheme('nonexistent', { data: 'test' })
      }).toThrow('Theme \'nonexistent\' not found')
    })
  })

  describe('createVariant', () => {
    it('should create theme variant', () => {
      const variant = manager.createVariant('light', 'light-blue', {
        colors: {
          foreground: '#0066cc',
          background: '#f0f8ff',
          accent: '#cce5ff'
        }
      })
      
      expect(variant.name).toBe('light-blue')
      expect(variant.colors.foreground).toBe('#0066cc')
      expect(variant.colors.background).toBe('#f0f8ff')
      
      // Should be registered
      const retrieved = manager.getTheme('light-blue')
      expect(retrieved).toBeDefined()
    })

    it('should inherit properties from base theme', () => {
      const variant = manager.createVariant('dark', 'dark-variant', {
        colors: { foreground: '#ff6600' }
      })
      
      // Should inherit background from dark theme
      expect(variant.colors.background).toBe('#1a1a1a')
      expect(variant.colors.foreground).toBe('#ff6600') // modified
    })
  })

  describe('generateRandomTheme', () => {
    it('should generate random theme', () => {
      const theme = manager.generateRandomTheme('random1')
      
      expect(theme.name).toBe('random1')
      expect(theme.colors.foreground).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
      expect(theme.colors.background).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
      expect(theme.style).toBeDefined()
      
      // Should be registered
      const retrieved = manager.getTheme('random1')
      expect(retrieved).toBeDefined()
    })

    it('should generate different themes each time', () => {
      const theme1 = manager.generateRandomTheme('random1')
      const theme2 = manager.generateRandomTheme('random2')
      
      // Very unlikely to be exactly the same
      expect(theme1.colors.foreground).not.toBe(theme2.colors.foreground)
    })
  })

  describe('getPreviewData', () => {
    it('should return preview data for theme', () => {
      const preview = manager.getPreviewData('blue')
      
      expect(preview).toBeDefined()
      expect(preview?.theme.name).toBe('Blue Ocean')
      expect(preview?.previewOptions.data).toBe('https://example.com')
      expect(preview?.previewOptions.size).toBe(200)
    })

    it('should return null for non-existent theme', () => {
      const preview = manager.getPreviewData('nonexistent')
      expect(preview).toBeNull()
    })
  })

  describe('exportTheme', () => {
    it('should export theme as JSON', () => {
      const json = manager.exportTheme('light')
      const parsed = JSON.parse(json)
      
      expect(parsed.name).toBe('Light')
      expect(parsed.colors.foreground).toBe('#000000')
      expect(parsed.colors.background).toBe('#FFFFFF')
    })

    it('should throw error for non-existent theme', () => {
      expect(() => {
        manager.exportTheme('nonexistent')
      }).toThrow('Theme \'nonexistent\' not found')
    })
  })

  describe('importTheme', () => {
    it('should import theme from JSON', () => {
      const themeData = {
        name: 'imported',
        colors: {
          foreground: '#123456',
          background: '#abcdef'
        }
      }
      
      manager.importTheme(JSON.stringify(themeData))
      const retrieved = manager.getTheme('imported')
      
      expect(retrieved).toBeDefined()
      expect(retrieved?.colors.foreground).toBe('#123456')
    })

    it('should throw error for invalid JSON', () => {
      expect(() => {
        manager.importTheme('invalid json')
      }).toThrow('Failed to import theme')
    })

    it('should throw error for invalid theme format', () => {
      expect(() => {
        manager.importTheme('{"invalid": "theme"}')
      }).toThrow('Invalid theme format')
    })
  })

  describe('removeTheme', () => {
    it('should remove custom theme', () => {
      manager.registerTheme('custom', {
        name: 'custom',
        colors: { foreground: '#000', background: '#fff' }
      })
      
      expect(manager.getTheme('custom')).toBeDefined()
      
      const removed = manager.removeTheme('custom')
      expect(removed).toBe(true)
      expect(manager.getTheme('custom')).toBeNull()
    })

    it('should not remove preset themes', () => {
      expect(() => {
        manager.removeTheme('light')
      }).toThrow('Cannot remove preset theme')
    })
  })

  describe('getStats', () => {
    it('should return theme statistics', () => {
      manager.registerTheme('custom1', { name: 'custom1', colors: { foreground: '#000', background: '#fff' } })
      manager.registerTheme('custom2', { name: 'custom2', colors: { foreground: '#000', background: '#fff' } })
      
      const stats = manager.getStats()
      
      expect(stats.totalThemes).toBeGreaterThan(8) // presets + customs
      expect(stats.presetThemes).toBe(8)
      expect(stats.customThemes).toBe(2)
      expect(stats.currentTheme).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset to default state', () => {
      manager.registerTheme('custom', { name: 'custom', colors: { foreground: '#000', background: '#fff' } })
      manager.applyTheme('dark', { data: 'test' })
      
      manager.reset()
      
      expect(manager.getTheme('custom')).toBeNull()
      expect(manager.getCurrentTheme()).toBeNull()
      expect(manager.getTheme('light')).toBeDefined() // presets should remain
    })
  })
})

describe('Global theme functions', () => {
  it('should work with global theme manager', () => {
    const theme = getTheme('light')
    expect(theme).toBeDefined()
    expect(theme?.name).toBe('Light')
  })

  it('should register theme globally', () => {
    registerTheme('global-test', {
      name: 'Global Test',
      colors: { foreground: '#000', background: '#fff' }
    })
    
    const theme = getTheme('global-test')
    expect(theme).toBeDefined()
    expect(theme?.name).toBe('global-test') // registerTheme uses the key as name if not overridden
  })

  it('should apply theme globally', () => {
    const options = applyTheme('dark', { data: 'global test' })
    expect(options.color?.foreground).toBe('#FFFFFF')
    expect(options.data).toBe('global test')
  })

  it('should get all themes', () => {
    const themes = getAllThemes()
    expect(Object.keys(themes)).toContain('light')
    expect(Object.keys(themes)).toContain('dark')
    expect(themes.light.colors.foreground).toBe('#000000')
  })
})

describe('Preset themes validation', () => {
  it('should have valid preset themes object', () => {
    expect(presetThemes).toBeDefined()
    expect(typeof presetThemes).toBe('object')
    
    Object.entries(presetThemes).forEach(([key, theme]) => {
      expect(theme.name).toBeDefined()
      expect(theme.colors.foreground).toBeDefined()
      expect(theme.colors.background).toBeDefined()
      expect(typeof theme.colors.foreground).toBe('string')
      expect(typeof theme.colors.background).toBe('string')
    })
  })

  it('should have gradient themes configured correctly', () => {
    const blueTheme = presetThemes.blue
    expect(blueTheme.style?.foregroundColor).toBeDefined()
    expect((blueTheme.style?.foregroundColor as any)?.type).toBe('linear')
    expect((blueTheme.style?.foregroundColor as any)?.colors).toHaveLength(2)
  })
})
