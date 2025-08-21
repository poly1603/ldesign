import type { LogoOptions } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLogoProcessor, LogoProcessor } from '../src/core/logo'

describe('logoProcessor', () => {
  let processor: LogoProcessor
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    processor = new LogoProcessor()

    // Mock canvas and context
    mockCanvas = document.createElement('canvas')
    mockCanvas.width = 200
    mockCanvas.height = 200

    mockContext = {
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      clip: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
    } as any

    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext)
  })

  afterEach(() => {
    processor.destroy()
  })

  describe('constructor', () => {
    it('should create processor instance', () => {
      expect(processor).toBeInstanceOf(LogoProcessor)
    })
  })

  describe('addLogoToCanvas', () => {
    const mockLogoOptions: LogoOptions = {
      src: 'data:image/png;base64,test',
      size: 0.2,
      margin: 4,
    }

    it('should add logo to canvas', async () => {
      await processor.addLogoToCanvas(mockCanvas, mockLogoOptions)

      expect(mockContext.save).toHaveBeenCalled()
      expect(mockContext.restore).toHaveBeenCalled()
    })

    it('should add logo with background', async () => {
      const optionsWithBg: LogoOptions = {
        ...mockLogoOptions,
        background: '#ffffff',
      }

      await processor.addLogoToCanvas(mockCanvas, optionsWithBg)

      expect(mockContext.fillRect).toHaveBeenCalled()
    })

    it('should add logo with border', async () => {
      const optionsWithBorder: LogoOptions = {
        ...mockLogoOptions,
        border: {
          width: 2,
          color: '#000000',
        },
      }

      await processor.addLogoToCanvas(mockCanvas, optionsWithBorder)

      expect(mockContext.strokeRect).toHaveBeenCalled()
    })

    it('should add circular logo', async () => {
      const circularOptions: LogoOptions = {
        ...mockLogoOptions,
        shape: 'circle',
      }

      await processor.addLogoToCanvas(mockCanvas, circularOptions)

      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.arc).toHaveBeenCalled()
      expect(mockContext.clip).toHaveBeenCalled()
    })

    it('should handle different positions', async () => {
      const positions: Array<LogoOptions['position']> = [
        'center',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ]

      for (const position of positions) {
        const options: LogoOptions = {
          ...mockLogoOptions,
          position,
        }

        await processor.addLogoToCanvas(mockCanvas, options)
        expect(mockContext.drawImage).toHaveBeenCalled()
      }
    })

    it('should handle custom offset', async () => {
      const optionsWithOffset: LogoOptions = {
        ...mockLogoOptions,
        offset: { x: 10, y: 20 },
      }

      await processor.addLogoToCanvas(mockCanvas, optionsWithOffset)
      expect(mockContext.drawImage).toHaveBeenCalled()
    })

    it('should handle image loading errors', async () => {
      const invalidOptions: LogoOptions = {
        src: 'invalid-url',
        size: 0.2,
      }

      await expect(processor.addLogoToCanvas(mockCanvas, invalidOptions))
        .rejects
        .toThrow()
    })
  })

  describe('addLogoToSVG', () => {
    const mockSvg = '<svg width="200" height="200"><rect width="200" height="200" fill="black"/></svg>'
    const mockLogoOptions: LogoOptions = {
      src: 'data:image/png;base64,test',
      size: 0.2,
    }

    it('should add logo to SVG', async () => {
      const result = await processor.addLogoToSVG(mockSvg, mockLogoOptions)

      expect(typeof result).toBe('string')
      expect(result).toContain('<image')
      expect(result).toContain('data:image/png;base64,test')
    })

    it('should add logo with background to SVG', async () => {
      const optionsWithBg: LogoOptions = {
        ...mockLogoOptions,
        background: '#ffffff',
      }

      const result = await processor.addLogoToSVG(mockSvg, optionsWithBg)

      expect(result).toContain('<rect')
      expect(result).toContain('fill="#ffffff"')
    })

    it('should add logo with border to SVG', async () => {
      const optionsWithBorder: LogoOptions = {
        ...mockLogoOptions,
        border: {
          width: 2,
          color: '#000000',
        },
      }

      const result = await processor.addLogoToSVG(mockSvg, optionsWithBorder)

      expect(result).toContain('stroke="#000000"')
      expect(result).toContain('stroke-width="2"')
    })

    it('should add circular logo to SVG', async () => {
      const circularOptions: LogoOptions = {
        ...mockLogoOptions,
        shape: 'circle',
      }

      const result = await processor.addLogoToSVG(mockSvg, circularOptions)

      expect(result).toContain('<defs>')
      expect(result).toContain('<clipPath>')
      expect(result).toContain('<circle')
    })

    it('should handle invalid SVG input', async () => {
      const invalidSvg = 'not an svg'

      await expect(processor.addLogoToSVG(invalidSvg, mockLogoOptions))
        .rejects
        .toThrow()
    })
  })

  describe('calculateLogoPosition', () => {
    it('should calculate center position', () => {
      const position = processor.calculateLogoPosition(
        200,
        200,
        40,
        40,
        'center',
      )

      expect(position.x).toBe(80) // (200 - 40) / 2
      expect(position.y).toBe(80) // (200 - 40) / 2
    })

    it('should calculate top-left position', () => {
      const position = processor.calculateLogoPosition(
        200,
        200,
        40,
        40,
        'top-left',
      )

      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
    })

    it('should calculate top-right position', () => {
      const position = processor.calculateLogoPosition(
        200,
        200,
        40,
        40,
        'top-right',
      )

      expect(position.x).toBe(160) // 200 - 40
      expect(position.y).toBe(0)
    })

    it('should calculate bottom-left position', () => {
      const position = processor.calculateLogoPosition(
        200,
        200,
        40,
        40,
        'bottom-left',
      )

      expect(position.x).toBe(0)
      expect(position.y).toBe(160) // 200 - 40
    })

    it('should calculate bottom-right position', () => {
      const position = processor.calculateLogoPosition(
        200,
        200,
        40,
        40,
        'bottom-right',
      )

      expect(position.x).toBe(160) // 200 - 40
      expect(position.y).toBe(160) // 200 - 40
    })

    it('should apply offset', () => {
      const position = processor.calculateLogoPosition(
        200,
        200,
        40,
        40,
        'center',
        { x: 10, y: 20 },
      )

      expect(position.x).toBe(90) // 80 + 10
      expect(position.y).toBe(100) // 80 + 20
    })
  })

  describe('clearCache', () => {
    it('should clear image cache', () => {
      expect(() => processor.clearCache()).not.toThrow()
    })
  })

  describe('destroy', () => {
    it('should cleanup resources', () => {
      expect(() => processor.destroy()).not.toThrow()
    })
  })
})

describe('createLogoProcessor', () => {
  it('should create processor instance', () => {
    const processor = createLogoProcessor()
    expect(processor).toBeInstanceOf(LogoProcessor)

    processor.destroy()
  })
})
