/**
 * 颜色转换工具测试
 */

import { describe, expect, it } from 'vitest'
import {
  clamp,
  hexToHsl,
  hexToRgb,
  hslToHex,
  hslToRgb,
  isValidHex,
  normalizeHex,
  normalizeHue,
  rgbToHex,
  rgbToHsl,
} from '../src/utils/color-converter'

describe('color-converter', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB correctly', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(hexToRgb('#gg0000')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('should convert RGB to hex correctly', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
    })

    it('should handle edge values', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
    })
  })

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL correctly', () => {
      const red = rgbToHsl(255, 0, 0)
      expect(red.h).toBe(0)
      expect(red.s).toBe(100)
      expect(red.l).toBe(50)

      const green = rgbToHsl(0, 255, 0)
      expect(green.h).toBe(120)
      expect(green.s).toBe(100)
      expect(green.l).toBe(50)

      const blue = rgbToHsl(0, 0, 255)
      expect(blue.h).toBe(240)
      expect(blue.s).toBe(100)
      expect(blue.l).toBe(50)
    })

    it('should handle grayscale colors', () => {
      const gray = rgbToHsl(128, 128, 128)
      expect(gray.h).toBe(0)
      expect(gray.s).toBe(0)
      expect(gray.l).toBe(50)
    })
  })

  describe('hslToRgb', () => {
    it('should convert HSL to RGB correctly', () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should handle grayscale colors', () => {
      expect(hslToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 })
    })
  })

  describe('hexToHsl', () => {
    it('should convert hex to HSL correctly', () => {
      const red = hexToHsl('#ff0000')
      expect(red).toEqual({ h: 0, s: 100, l: 50 })

      const green = hexToHsl('#00ff00')
      expect(green).toEqual({ h: 120, s: 100, l: 50 })
    })

    it('should return null for invalid hex', () => {
      expect(hexToHsl('invalid')).toBeNull()
    })
  })

  describe('hslToHex', () => {
    it('should convert HSL to hex correctly', () => {
      expect(hslToHex(0, 100, 50)).toBe('#ff0000')
      expect(hslToHex(120, 100, 50)).toBe('#00ff00')
      expect(hslToHex(240, 100, 50)).toBe('#0000ff')
    })
  })

  describe('normalizeHue', () => {
    it('should normalize hue to 0-360 range', () => {
      expect(normalizeHue(0)).toBe(0)
      expect(normalizeHue(360)).toBe(0)
      expect(normalizeHue(450)).toBe(90)
      expect(normalizeHue(-90)).toBe(270)
    })
  })

  describe('clamp', () => {
    it('should clamp values to range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('isValidHex', () => {
    it('should validate hex colors correctly', () => {
      expect(isValidHex('#ff0000')).toBe(true)
      expect(isValidHex('ff0000')).toBe(true)
      expect(isValidHex('#f00')).toBe(true)
      expect(isValidHex('f00')).toBe(true)
      expect(isValidHex('#gg0000')).toBe(false)
      expect(isValidHex('invalid')).toBe(false)
    })
  })

  describe('normalizeHex', () => {
    it('should normalize hex colors', () => {
      expect(normalizeHex('#ff0000')).toBe('#ff0000')
      expect(normalizeHex('ff0000')).toBe('#ff0000')
      expect(normalizeHex('#f00')).toBe('#ff0000')
      expect(normalizeHex('f00')).toBe('#ff0000')
      expect(normalizeHex('#FF0000')).toBe('#ff0000')
    })
  })
})
