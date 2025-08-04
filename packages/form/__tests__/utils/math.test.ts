import { describe, expect, it } from 'vitest'
import {
  allocateSizes,
  calculateBreakpoint,
  calculateCenterOffset,
  calculateDistance,
  calculateGridLayout,
  calculateItemPosition,
  calculateOptimalColumns,
  calculateScale,
  clamp,
  DEFAULT_BREAKPOINTS,
  getResponsiveColumns,
  lerp,
  roundToPrecision,
} from '../../src/utils/math'

describe('math Utils', () => {
  describe('calculateOptimalColumns', () => {
    it('should calculate optimal columns based on container width', () => {
      // 容器宽度800px，最小项目宽度200px，间距16px
      // 理论列数: (800 - 16 + 16) / (200 + 16) = 800 / 216 ≈ 3.7 -> 3列
      const columns = calculateOptimalColumns(800, 200, 6, 1, 16)
      expect(columns).toBe(3)
    })

    it('should respect minimum columns constraint', () => {
      const columns = calculateOptimalColumns(100, 200, 6, 2, 16)
      expect(columns).toBe(2)
    })

    it('should respect maximum columns constraint', () => {
      const columns = calculateOptimalColumns(2000, 100, 3, 1, 16)
      expect(columns).toBe(3)
    })

    it('should handle edge cases', () => {
      expect(calculateOptimalColumns(0, 200, 6, 1, 16)).toBe(1)
      expect(calculateOptimalColumns(800, 0, 6, 1, 16)).toBe(1)
      expect(calculateOptimalColumns(-100, 200, 6, 1, 16)).toBe(1)
    })
  })

  describe('calculateGridLayout', () => {
    it('should calculate grid layout correctly', () => {
      const result = calculateGridLayout(10, 800, 600, 4, 16)

      expect(result.columns).toBe(4)
      expect(result.rows).toBe(3) // Math.ceil(10 / 4) = 3
      expect(result.itemWidth).toBe((800 - 3 * 16) / 4) // (800 - 48) / 4 = 188
      expect(result.itemHeight).toBe((600 - 2 * 16) / 3) // (600 - 32) / 3 ≈ 189.33
      expect(result.totalWidth).toBe(800)
      expect(result.totalHeight).toBe(600)
    })

    it('should handle layout without container height', () => {
      const result = calculateGridLayout(8, 800, 0, 4, 16)

      expect(result.columns).toBe(4)
      expect(result.rows).toBe(2)
      expect(result.itemWidth).toBe(188)
      expect(result.itemHeight).toBe(0)
      expect(result.totalWidth).toBe(800)
    })

    it('should handle edge cases', () => {
      const result1 = calculateGridLayout(0, 800, 600, 4, 16)
      expect(result1.columns).toBe(0)
      expect(result1.rows).toBe(0)

      const result2 = calculateGridLayout(10, 800, 600, 0, 16)
      expect(result2.columns).toBe(0)
      expect(result2.rows).toBe(0)
    })
  })

  describe('calculateItemPosition', () => {
    it('should calculate item position correctly', () => {
      // 第5个项目（索引4），4列布局，项目尺寸100x50，间距16
      const position = calculateItemPosition(4, 4, 100, 50, 16)

      expect(position.row).toBe(1) // Math.floor(4 / 4) = 1
      expect(position.column).toBe(0) // 4 % 4 = 0
      expect(position.x).toBe(0) // 0 * (100 + 16) = 0
      expect(position.y).toBe(66) // 1 * (50 + 16) = 66
    })

    it('should handle first row items', () => {
      const position = calculateItemPosition(2, 4, 100, 50, 16)

      expect(position.row).toBe(0)
      expect(position.column).toBe(2)
      expect(position.x).toBe(232) // 2 * (100 + 16) = 232
      expect(position.y).toBe(0)
    })
  })

  describe('allocateSizes', () => {
    it('should allocate sizes evenly', () => {
      const result = allocateSizes(400, 4, 0, Infinity, [10, 10, 10])

      expect(result.sizes).toHaveLength(4)
      expect(result.sizes[0]).toBe(92.5) // (400 - 30) / 4 = 92.5
      expect(result.totalSize).toBe(400)
      expect(result.remainingSpace).toBe(0)
    })

    it('should respect size constraints', () => {
      const result = allocateSizes(400, 4, 50, 80, [])

      expect(result.sizes[0]).toBe(80) // 平均100，但限制在80
      expect(result.totalSize).toBe(320) // 4 * 80
      expect(result.remainingSpace).toBe(80) // 400 - 320
    })

    it('should handle edge cases', () => {
      const result1 = allocateSizes(0, 4, 0, Infinity, [])
      expect(result1.sizes).toHaveLength(0)
      expect(result1.remainingSpace).toBe(0)

      const result2 = allocateSizes(400, 0, 0, Infinity, [])
      expect(result2.sizes).toHaveLength(0)
      expect(result2.remainingSpace).toBe(400)
    })
  })

  describe('calculateBreakpoint', () => {
    it('should calculate breakpoint correctly', () => {
      expect(calculateBreakpoint(500)).toBe('xs')
      expect(calculateBreakpoint(600)).toBe('sm')
      expect(calculateBreakpoint(800)).toBe('md')
      expect(calculateBreakpoint(1000)).toBe('lg')
      expect(calculateBreakpoint(1300)).toBe('xl')
      expect(calculateBreakpoint(1700)).toBe('xxl')
    })

    it('should use custom breakpoints', () => {
      const customBreakpoints = {
        xs: 400,
        sm: 600,
        md: 800,
        lg: 1000,
        xl: 1200,
        xxl: Infinity,
      }

      expect(calculateBreakpoint(350, customBreakpoints)).toBe('xs')
      expect(calculateBreakpoint(500, customBreakpoints)).toBe('sm')
    })
  })

  describe('getResponsiveColumns', () => {
    it('should get responsive columns correctly', () => {
      const responsive = {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6,
      }

      expect(getResponsiveColumns(500, responsive)).toBe(1) // xs
      expect(getResponsiveColumns(700, responsive)).toBe(2) // sm
      expect(getResponsiveColumns(900, responsive)).toBe(3) // md
      expect(getResponsiveColumns(1100, responsive)).toBe(4) // lg
      expect(getResponsiveColumns(1400, responsive)).toBe(5) // xl
      expect(getResponsiveColumns(1700, responsive)).toBe(6) // xxl
    })

    it('should fallback to larger breakpoint config', () => {
      const responsive = {
        md: 3,
        xl: 5,
      }

      expect(getResponsiveColumns(500, responsive)).toBe(3) // xs -> md
      expect(getResponsiveColumns(700, responsive)).toBe(3) // sm -> md
      expect(getResponsiveColumns(1400, responsive)).toBe(5) // xl
    })

    it('should use default columns when no config found', () => {
      expect(getResponsiveColumns(500, {}, 4)).toBe(4)
    })
  })

  describe('calculateScale', () => {
    it('should calculate scale maintaining aspect ratio', () => {
      const result = calculateScale(
        { width: 200, height: 100 },
        { width: 400, height: 300 },
        true,
      )

      expect(result.scale).toBe(2) // min(400/200, 300/100) = min(2, 3) = 2
      expect(result.width).toBe(400) // 200 * 2
      expect(result.height).toBe(200) // 100 * 2
    })

    it('should calculate scale without maintaining aspect ratio', () => {
      const result = calculateScale(
        { width: 200, height: 100 },
        { width: 400, height: 300 },
        false,
      )

      expect(result.width).toBe(400)
      expect(result.height).toBe(300)
      expect(result.scale).toBe(2) // min(2, 3) = 2
    })

    it('should handle zero original size', () => {
      const result = calculateScale(
        { width: 0, height: 100 },
        { width: 400, height: 300 },
        true,
      )

      expect(result.width).toBe(400)
      expect(result.height).toBe(300)
      expect(result.scale).toBe(1)
    })
  })

  describe('calculateCenterOffset', () => {
    it('should calculate center offset correctly', () => {
      const offset = calculateCenterOffset(
        { width: 400, height: 300 },
        { width: 200, height: 100 },
      )

      expect(offset.x).toBe(100) // (400 - 200) / 2
      expect(offset.y).toBe(100) // (300 - 100) / 2
    })

    it('should handle content larger than container', () => {
      const offset = calculateCenterOffset(
        { width: 200, height: 100 },
        { width: 400, height: 300 },
      )

      expect(offset.x).toBe(0) // Math.max(0, (200 - 400) / 2)
      expect(offset.y).toBe(0) // Math.max(0, (100 - 300) / 2)
    })
  })

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
      expect(lerp(10, 20, 0.2)).toBe(12)
      expect(lerp(0, 10, 0)).toBe(0)
      expect(lerp(0, 10, 1)).toBe(10)
    })

    it('should clamp factor to 0-1 range', () => {
      expect(lerp(0, 10, -0.5)).toBe(0)
      expect(lerp(0, 10, 1.5)).toBe(10)
    })
  })

  describe('calculateDistance', () => {
    it('should calculate distance between points', () => {
      const distance = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })
      expect(distance).toBe(5) // 3-4-5 triangle
    })

    it('should handle same points', () => {
      const distance = calculateDistance({ x: 5, y: 5 }, { x: 5, y: 5 })
      expect(distance).toBe(0)
    })
  })

  describe('roundToPrecision', () => {
    it('should round to specified precision', () => {
      expect(roundToPrecision(3.14159, 2)).toBe(3.14)
      expect(roundToPrecision(3.14159, 3)).toBe(3.142)
      expect(roundToPrecision(3.14159, 0)).toBe(3)
    })

    it('should use default precision', () => {
      expect(roundToPrecision(3.14159)).toBe(3.14)
    })
  })

  describe('dEFAULT_BREAKPOINTS', () => {
    it('should have correct default breakpoints', () => {
      expect(DEFAULT_BREAKPOINTS.xs).toBe(576)
      expect(DEFAULT_BREAKPOINTS.sm).toBe(768)
      expect(DEFAULT_BREAKPOINTS.md).toBe(992)
      expect(DEFAULT_BREAKPOINTS.lg).toBe(1200)
      expect(DEFAULT_BREAKPOINTS.xl).toBe(1600)
      expect(DEFAULT_BREAKPOINTS.xxl).toBe(Infinity)
    })
  })
})
