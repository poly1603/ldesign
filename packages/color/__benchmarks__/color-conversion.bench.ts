/**
 * 颜色转换性能基准测试
 * 
 * 运行: pnpm run bench
 */

import { bench, describe } from 'vitest'
import { hexToRgb, rgbToHsl, hslToHex, normalizeHex } from '../src/utils/color-converter'
import { generateColorScale } from '../src/utils/color-scale'

describe('Color Conversion Benchmarks', () => {
  describe('hexToRgb', () => {
    bench('single conversion', () => {
      hexToRgb('#ff0000')
    })

    bench('1000 conversions (different colors)', () => {
      for (let i = 0; i < 1000; i++) {
        const hex = `#${i.toString(16).padStart(6, '0')}`
        hexToRgb(hex)
      }
    })

    bench('1000 conversions (same color - cache hit)', () => {
      const hex = '#ff0000'
      for (let i = 0; i < 1000; i++) {
        hexToRgb(hex)
      }
    })

    bench('with normalization', () => {
      const hex = 'f00' // 3-digit format
      const normalized = normalizeHex(hex)
      if (normalized) {
        hexToRgb(normalized)
      }
    })
  })

  describe('rgbToHsl', () => {
    bench('single conversion', () => {
      rgbToHsl(255, 0, 0)
    })

    bench('1000 conversions', () => {
      for (let i = 0; i < 1000; i++) {
        rgbToHsl(i % 256, (i * 2) % 256, (i * 3) % 256)
      }
    })
  })

  describe('Color chain conversion', () => {
    bench('hex -> rgb -> hsl -> hex', () => {
      const hex = '#ff0000'
      const rgb = hexToRgb(hex)
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        if (hsl) {
          hslToHex(hsl.h, hsl.s, hsl.l)
        }
      }
    })

    bench('100 chain conversions', () => {
      for (let i = 0; i < 100; i++) {
        const hex = `#${i.toString(16).padStart(6, '0')}`
        const rgb = hexToRgb(hex)
        if (rgb) {
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
          if (hsl) {
            hslToHex(hsl.h, hsl.s, hsl.l)
          }
        }
      }
    })
  })

  describe('Color scale generation', () => {
    bench('generate 10-step scale', () => {
      generateColorScale('#165DFF', 10)
    })

    bench('generate 100-step scale', () => {
      generateColorScale('#165DFF', 100)
    })

    bench('generate 10 different scales', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#00ff88', '#ff0088']
      colors.forEach(color => {
        generateColorScale(color, 10)
      })
    })
  })
})
