/**
 * 品牌类型系统测试
 */

import { describe, expect, it } from 'vitest'
import {
  createCacheKey,
  createHexColor,
  createHslString,
  createRgbString,
  createThemeName,
  failure,
  isColorValue,
  isHexColor,
  isHslString,
  isRgbString,
  isThemeName,
  success,
  TypedCache,
} from '../branded'

import type { CacheKey, HexColor, HslString, RgbString, ThemeName } from '../branded'

describe('branded types', () => {
  describe('HexColor', () => {
    it('should create valid hex color', () => {
      const hex = createHexColor('#ff0000')
      expect(hex).toBe('#ff0000')
      expect(isHexColor(hex)).toBe(true)
    })

    it('should handle 3-digit hex colors', () => {
      const hex = createHexColor('#f00')
      expect(hex).toBe('#ff0000')
    })

    it('should normalize to lowercase', () => {
      const hex = createHexColor('#FF0000')
      expect(hex).toBe('#ff0000')
    })

    it('should reject invalid hex colors', () => {
      expect(createHexColor('invalid')).toBeNull()
      expect(createHexColor('#gggggg')).toBeNull()
      expect(createHexColor('#12345')).toBeNull()
    })

    it('should work with type guards', () => {
      const maybeHex: unknown = '#ff0000'
      if (isHexColor(maybeHex)) {
        // TypeScript knows maybeHex is HexColor here
        const hex: HexColor = maybeHex
        expect(hex).toBe('#ff0000')
      }
    })
  })

  describe('RgbString', () => {
    it('should create valid RGB string', () => {
      const rgb = createRgbString(255, 0, 0)
      expect(rgb).toBe('rgb(255, 0, 0)')
      expect(isRgbString(rgb)).toBe(true)
    })

    it('should round values', () => {
      const rgb = createRgbString(254.6, 128.4, 64.1)
      expect(rgb).toBe('rgb(255, 128, 64)')
    })

    it('should reject out-of-range values', () => {
      expect(createRgbString(-1, 0, 0)).toBeNull()
      expect(createRgbString(256, 0, 0)).toBeNull()
      expect(createRgbString(0, -1, 0)).toBeNull()
      expect(createRgbString(0, 256, 0)).toBeNull()
    })
  })

  describe('HslString', () => {
    it('should create valid HSL string', () => {
      const hsl = createHslString(180, 50, 50)
      expect(hsl).toBe('hsl(180, 50%, 50%)')
      expect(isHslString(hsl)).toBe(true)
    })

    it('should round values', () => {
      const hsl = createHslString(180.6, 50.4, 50.1)
      expect(hsl).toBe('hsl(181, 50%, 50%)')
    })

    it('should reject out-of-range values', () => {
      expect(createHslString(-1, 50, 50)).toBeNull()
      expect(createHslString(361, 50, 50)).toBeNull()
      expect(createHslString(180, -1, 50)).toBeNull()
      expect(createHslString(180, 101, 50)).toBeNull()
    })
  })

  describe('ThemeName', () => {
    it('should create valid theme name', () => {
      const name = createThemeName('dark-theme')
      expect(name).toBe('dark-theme')
      expect(isThemeName(name)).toBe(true)
    })

    it('should trim whitespace', () => {
      const name = createThemeName('  light  ')
      expect(name).toBe('light')
    })

    it('should reject invalid names', () => {
      expect(createThemeName('')).toBeNull()
      expect(createThemeName('   ')).toBeNull()
      expect(createThemeName('invalid theme')).toBeNull() // 包含空格
      expect(createThemeName('invalid@theme')).toBeNull() // 包含特殊字符
    })
  })

  describe('CacheKey', () => {
    it('should create cache key from parts', () => {
      const key = createCacheKey('theme', 'dark', 'primary')
      expect(key).toBe('theme:dark:primary')
    })

    it('should handle numbers', () => {
      const key = createCacheKey('user', 123, 'settings')
      expect(key).toBe('user:123:settings')
    })
  })

  describe('TypedCache', () => {
    interface TestCache {
      colors: HexColor
      themes: ThemeName
    }

    it('should store and retrieve typed values', () => {
      const cache = new TypedCache<TestCache>()
      const key = createCacheKey('test')
      const hex = createHexColor('#ff0000')!

      cache.set(key, hex)
      expect(cache.get(key)).toBe(hex)
    })

    it('should handle cache operations', () => {
      const cache = new TypedCache<TestCache>()
      const key1 = createCacheKey('key1')
      const key2 = createCacheKey('key2')

      expect(cache.size).toBe(0)
      expect(cache.has(key1)).toBe(false)

      cache.set(key1, createHexColor('#ff0000')!)
      expect(cache.size).toBe(1)
      expect(cache.has(key1)).toBe(true)

      cache.set(key2, createThemeName('dark')!)
      expect(cache.size).toBe(2)

      cache.delete(key1)
      expect(cache.size).toBe(1)
      expect(cache.has(key1)).toBe(false)

      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('ColorValue', () => {
    it('should recognize all color value types', () => {
      const hex = createHexColor('#ff0000')
      const rgb = createRgbString(255, 0, 0)
      const hsl = createHslString(0, 100, 50)

      expect(isColorValue(hex)).toBe(true)
      expect(isColorValue(rgb)).toBe(true)
      expect(isColorValue(hsl)).toBe(true)
      expect(isColorValue('invalid')).toBe(false)
    })
  })

  describe('SafeConversionResult', () => {
    it('should create success result', () => {
      const hex = createHexColor('#ff0000')!
      const result = success(hex)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBe(hex)
      }
    })

    it('should create failure result', () => {
      const result = failure<HexColor>('Invalid color format')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Invalid color format')
      }
    })

    it('should provide type-safe branching', () => {
      function convertColor(input: string): string {
        const hex = createHexColor(input)
        const result = hex ? success(hex) : failure<HexColor>('Invalid hex color')

        if (result.success) {
          // TypeScript knows result.value is HexColor
          return result.value.toUpperCase()
        }
        else {
          // TypeScript knows result.error is string
          return `Error: ${result.error}`
        }
      }

      expect(convertColor('#ff0000')).toBe('#FF0000')
      expect(convertColor('invalid')).toBe('Error: Invalid hex color')
    })
  })

  describe('type safety', () => {
    it('should prevent mixing different branded types', () => {
      const hex = createHexColor('#ff0000')!
      const rgb = createRgbString(255, 0, 0)!

      // This should cause a TypeScript error in strict mode
      // const wrongAssignment: HexColor = rgb

      // But this should work
      const correctHex: HexColor = hex
      const correctRgb: RgbString = rgb

      expect(correctHex).toBe('#ff0000')
      expect(correctRgb).toBe('rgb(255, 0, 0)')
    })

    it('should enforce cache key types', () => {
      interface ColorCache {
        primary: HexColor
      }

      const cache = new TypedCache<ColorCache>()
      const key = createCacheKey('primary')
      const hex = createHexColor('#ff0000')!

      // This should work
      cache.set(key, hex)

      // This should cause a TypeScript error
      // cache.set(key, 'not a hex color')

      expect(cache.get(key)).toBe(hex)
    })
  })
})
