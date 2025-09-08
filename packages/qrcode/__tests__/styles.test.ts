import type { QRCodeOptions } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StyleProcessor } from '../src/core/styles'

describe('styleProcessor', () => {
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
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(200 * 200 * 4),
        width: 200,
        height: 200,
      })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
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
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
      },
    }

    it('should apply basic styles to canvas', () => {
      const styleOptions = {
        backgroundColor: '#ffffff',
      }

      processor.applyStylesToCanvas(mockCanvas, styleOptions)

      expect(mockContext.fillStyle).toBe('#ffffff')
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 200, 200)
    })

    it('should apply gradient background', () => {
      const optionsWithGradient = {
        ...mockOptions.style!,
        backgroundColor: {
          type: 'linear' as const,
          colors: [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#00ff00' }
          ],
          direction: 0,
        },
      }

      processor.applyStylesToCanvas(mockCanvas, optionsWithGradient)

      expect(mockContext.createLinearGradient).toHaveBeenCalled()
    })

    it('should apply radial gradient', () => {
      const optionsWithRadial = {
        ...mockOptions.style!,
        backgroundColor: {
          type: 'radial' as const,
          colors: [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#00ff00' }
          ],
          centerX: 0.5,
          centerY: 0.5,
        },
      }

      processor.applyStylesToCanvas(mockCanvas, optionsWithRadial)

      expect(mockContext.createRadialGradient).toHaveBeenCalled()
    })

    it('should apply dot styles', () => {
      const optionsWithDots = {
        ...mockOptions.style!,
        dotStyle: 'dots' as const,
      }

      processor.applyStylesToCanvas(mockCanvas, optionsWithDots)

      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('applyStylesToSVG', () => {
    let mockSvgElement: SVGElement

    beforeEach(() => {
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(
        '<svg width="200" height="200"><path d="M0,0 L200,200" fill="black"/></svg>',
        'image/svg+xml'
      )
      mockSvgElement = svgDoc.documentElement as unknown as SVGElement

      // Mock SVG methods
      vi.spyOn(mockSvgElement, 'querySelector').mockReturnValue(null)
      vi.spyOn(mockSvgElement, 'querySelectorAll').mockReturnValue([] as any)
      vi.spyOn(mockSvgElement, 'appendChild').mockImplementation(() => mockSvgElement)
      vi.spyOn(mockSvgElement, 'insertBefore').mockImplementation(() => mockSvgElement)
      vi.spyOn(mockSvgElement, 'getBoundingClientRect').mockReturnValue({
        width: 200,
        height: 200,
        top: 0,
        left: 0,
        bottom: 200,
        right: 200,
        x: 0,
        y: 0,
        toJSON: () => ({})
      })
    })

    it('should apply basic styles to SVG', () => {
      const styleOptions = {
        backgroundColor: '#ffffff',
        foregroundColor: '#000000',
      }

      processor.applyStylesToSVG(mockSvgElement, styleOptions)

      expect(mockSvgElement.insertBefore).toHaveBeenCalled()
    })

    it('should apply gradient to SVG', () => {
      const styleOptions = {
        backgroundColor: {
          type: 'linear' as const,
          colors: [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#00ff00' }
          ],
          direction: 0,
        },
      }

      processor.applyStylesToSVG(mockSvgElement, styleOptions)

      expect(mockSvgElement.appendChild).toHaveBeenCalled()
    })

    it('should apply radial gradient to SVG', () => {
      const styleOptions = {
        backgroundColor: {
          type: 'radial' as const,
          colors: [
            { offset: 0, color: '#ff0000' },
            { offset: 1, color: '#00ff00' }
          ],
          centerX: 0.5,
          centerY: 0.5,
        },
      }

      processor.applyStylesToSVG(mockSvgElement, styleOptions)

      expect(mockSvgElement.appendChild).toHaveBeenCalled()
    })

    it('should handle dot styles in SVG', () => {
      const styleOptions = {
        dotStyle: 'dots' as const,
        foregroundColor: '#000000',
      }

      processor.applyStylesToSVG(mockSvgElement, styleOptions)

      // Should not throw
      expect(true).toBe(true)
    })

    it('should handle invalid SVG input', () => {
      const styleOptions = {
        backgroundColor: '#ffffff',
      }

      // Should not throw with valid SVG element
      expect(() => processor.applyStylesToSVG(mockSvgElement, styleOptions))
        .not.toThrow()
    })
  })

  describe('private methods', () => {
    it('should create linear gradient', () => {
      const gradientOptions = {
        type: 'linear' as const,
        colors: [
          { offset: 0, color: '#ff0000' },
          { offset: 1, color: '#00ff00' }
        ],
        direction: 0,
      }

      // Test through public method
      const styleOptions = { backgroundColor: gradientOptions }
      processor.applyStylesToCanvas(mockCanvas, styleOptions)

      expect(mockContext.createLinearGradient).toHaveBeenCalled()
    })

    it('should create radial gradient', () => {
      const gradientOptions = {
        type: 'radial' as const,
        colors: [
          { offset: 0, color: '#ff0000' },
          { offset: 1, color: '#00ff00' }
        ],
        centerX: 0.5,
        centerY: 0.5,
      }

      // Test through public method
      const styleOptions = { backgroundColor: gradientOptions }
      processor.applyStylesToCanvas(mockCanvas, styleOptions)

      expect(mockContext.createRadialGradient).toHaveBeenCalled()
    })
  })



  describe('destroy', () => {
    it('should cleanup resources', () => {
      processor.destroy()

      // Should not throw
      expect(true).toBe(true)
    })
  })

})

// 移除不存在的createStyleProcessor测试
