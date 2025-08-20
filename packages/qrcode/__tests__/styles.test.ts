import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StyleProcessor, createStyleProcessor } from '../src/core/styles'
import type { QRCodeOptions, StyleOptions } from '../src/types'

describe('StyleProcessor', () => {
  let processor: StyleProcessor
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    processor = new StyleProcessor()
    
    // Mock canvas and context
    mockCanvas = document.createElement('canvas')
    mockCanvas.width = 200
    mockCanvas.height = 200
    
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      }))
    } as any
    
    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext)
  })

  afterEach(() => {
    processor.destroy()
  })

  describe('constructor', () => {
    it('should create processor instance', () => {
      expect(processor).toBeInstanceOf(StyleProcessor)
    })
  })

  describe('applyStylesToCanvas', () => {
    const mockOptions: QRCodeOptions = {
      data: 'test',
      size: 200,
      style: {
        foreground: '#000000',
        background: '#ffffff'
      }
    }

    it('should apply basic styles to canvas', () => {
      processor.applyStylesToCanvas(mockCanvas, mockOptions)
      
      expect(mockContext.fillStyle).toBe('#ffffff')
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 200, 200)
    })

    it('should apply gradient background', () => {
      const optionsWithGradient: QRCodeOptions = {
        ...mockOptions,
        style: {
          ...mockOptions.style!,
          background: {
            type: 'linear',
            colors: ['#ff0000', '#00ff00'],
            direction: 'horizontal'
          }
        }
      }
      
      processor.applyStylesToCanvas(mockCanvas, optionsWithGradient)
      
      expect(mockContext.createLinearGradient).toHaveBeenCalled()
    })

    it('should apply radial gradient', () => {
      const optionsWithRadial: QRCodeOptions = {
        ...mockOptions,
        style: {
          ...mockOptions.style!,
          background: {
            type: 'radial',
            colors: ['#ff0000', '#00ff00'],
            center: { x: 0.5, y: 0.5 }
          }
        }
      }
      
      processor.applyStylesToCanvas(mockCanvas, optionsWithRadial)
      
      expect(mockContext.createRadialGradient).toHaveBeenCalled()
    })

    it('should apply dot styles', () => {
      const optionsWithDots: QRCodeOptions = {
        ...mockOptions,
        style: {
          ...mockOptions.style!,
          dotStyle: 'circle'
        }
      }
      
      processor.applyStylesToCanvas(mockCanvas, optionsWithDots)
      
      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('applyStylesToSVG', () => {
    const mockSvg = '<svg width="200" height="200"><rect width="200" height="200" fill="black"/></svg>'
    const mockOptions: QRCodeOptions = {
      data: 'test',
      size: 200,
      style: {
        foreground: '#000000',
        background: '#ffffff'
      }
    }

    it('should apply basic styles to SVG', () => {
      const result = processor.applyStylesToSVG(mockSvg, mockOptions)
      
      expect(typeof result).toBe('string')
      expect(result).toContain('fill="#ffffff"')
    })

    it('should apply gradient to SVG', () => {
      const optionsWithGradient: QRCodeOptions = {
        ...mockOptions,
        style: {
          ...mockOptions.style!,
          background: {
            type: 'linear',
            colors: ['#ff0000', '#00ff00'],
            direction: 'horizontal'
          }
        }
      }
      
      const result = processor.applyStylesToSVG(mockSvg, optionsWithGradient)
      
      expect(result).toContain('<defs>')
      expect(result).toContain('<linearGradient')
    })

    it('should apply radial gradient to SVG', () => {
      const optionsWithRadial: QRCodeOptions = {
        ...mockOptions,
        style: {
          ...mockOptions.style!,
          background: {
            type: 'radial',
            colors: ['#ff0000', '#00ff00'],
            center: { x: 0.5, y: 0.5 }
          }
        }
      }
      
      const result = processor.applyStylesToSVG(mockSvg, optionsWithRadial)
      
      expect(result).toContain('<defs>')
      expect(result).toContain('<radialGradient')
    })

    it('should handle dot styles in SVG', () => {
      const optionsWithDots: QRCodeOptions = {
        ...mockOptions,
        style: {
          ...mockOptions.style!,
          dotStyle: 'circle'
        }
      }
      
      const result = processor.applyStylesToSVG(mockSvg, optionsWithDots)
      
      expect(typeof result).toBe('string')
    })

    it('should handle invalid SVG input', () => {
      const invalidSvg = 'not an svg'
      
      expect(() => processor.applyStylesToSVG(invalidSvg, mockOptions))
        .toThrow()
    })
  })

  describe('createGradient', () => {
    it('should create linear gradient', () => {
      const gradient = {
        type: 'linear' as const,
        colors: ['#ff0000', '#00ff00'],
        direction: 'horizontal' as const
      }
      
      const result = processor.createGradient(mockContext, gradient, 200, 200)
      
      expect(mockContext.createLinearGradient).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should create radial gradient', () => {
      const gradient = {
        type: 'radial' as const,
        colors: ['#ff0000', '#00ff00'],
        center: { x: 0.5, y: 0.5 }
      }
      
      const result = processor.createGradient(mockContext, gradient, 200, 200)
      
      expect(mockContext.createRadialGradient).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('createSVGGradient', () => {
    it('should create SVG linear gradient', () => {
      const gradient = {
        type: 'linear' as const,
        colors: ['#ff0000', '#00ff00'],
        direction: 'horizontal' as const
      }
      
      const result = processor.createSVGGradient(gradient, 'test-id')
      
      expect(result).toContain('<linearGradient')
      expect(result).toContain('id="test-id"')
      expect(result).toContain('#ff0000')
      expect(result).toContain('#00ff00')
    })

    it('should create SVG radial gradient', () => {
      const gradient = {
        type: 'radial' as const,
        colors: ['#ff0000', '#00ff00'],
        center: { x: 0.5, y: 0.5 }
      }
      
      const result = processor.createSVGGradient(gradient, 'test-id')
      
      expect(result).toContain('<radialGradient')
      expect(result).toContain('id="test-id"')
      expect(result).toContain('cx="50%"')
      expect(result).toContain('cy="50%"')
    })
  })

  describe('drawDot', () => {
    it('should draw square dot', () => {
      processor.drawDot(mockContext, 10, 10, 5, 'square')
      
      expect(mockContext.fillRect).toHaveBeenCalledWith(10, 10, 5, 5)
    })

    it('should draw circle dot', () => {
      processor.drawDot(mockContext, 10, 10, 5, 'circle')
      
      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.arc).toHaveBeenCalled()
      expect(mockContext.fill).toHaveBeenCalled()
    })

    it('should draw rounded dot', () => {
      processor.drawDot(mockContext, 10, 10, 5, 'rounded')
      
      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.fill).toHaveBeenCalled()
    })
  })

  describe('createSVGDot', () => {
    it('should create SVG square dot', () => {
      const result = processor.createSVGDot(10, 10, 5, 'square', '#000000')
      
      expect(result).toContain('<rect')
      expect(result).toContain('x="10"')
      expect(result).toContain('y="10"')
      expect(result).toContain('width="5"')
      expect(result).toContain('height="5"')
      expect(result).toContain('fill="#000000"')
    })

    it('should create SVG circle dot', () => {
      const result = processor.createSVGDot(10, 10, 5, 'circle', '#000000')
      
      expect(result).toContain('<circle')
      expect(result).toContain('cx="12.5"') // 10 + 5/2
      expect(result).toContain('cy="12.5"') // 10 + 5/2
      expect(result).toContain('r="2.5"') // 5/2
      expect(result).toContain('fill="#000000"')
    })

    it('should create SVG rounded dot', () => {
      const result = processor.createSVGDot(10, 10, 5, 'rounded', '#000000')
      
      expect(result).toContain('<rect')
      expect(result).toContain('rx="1.25"') // 5/4
      expect(result).toContain('ry="1.25"') // 5/4
    })
  })

  describe('destroy', () => {
    it('should cleanup resources', () => {
      expect(() => processor.destroy()).not.toThrow()
    })
  })
})

describe('createStyleProcessor', () => {
  it('should create processor instance', () => {
    const processor = createStyleProcessor()
    expect(processor).toBeInstanceOf(StyleProcessor)
    
    processor.destroy()
  })
})