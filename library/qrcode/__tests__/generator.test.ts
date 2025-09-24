import type { QRCodeOptions } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createQRCodeGenerator, QRCodeGenerator } from '../src/core/generator'

// Mock qrcode library
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
    toString: vi.fn().mockResolvedValue('<svg>test</svg>'),
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,test'),
  },
}))

// Mock LogoProcessor
vi.mock('../src/core/logo', () => ({
  LogoProcessor: vi.fn(() => ({
    addLogoToCanvas: vi.fn().mockResolvedValue(undefined),
    addLogoToSVG: vi.fn().mockResolvedValue('<svg>test with logo</svg>'),
    destroy: vi.fn(),
  })),
  createLogoProcessor: vi.fn(() => ({
    addLogoToCanvas: vi.fn().mockResolvedValue(undefined),
    addLogoToSVG: vi.fn().mockResolvedValue('<svg>test with logo</svg>'),
    destroy: vi.fn(),
  })),
}))

// Mock StyleProcessor
vi.mock('../src/core/styles', () => ({
  StyleProcessor: vi.fn(() => ({
    applyStylesToCanvas: vi.fn().mockResolvedValue(undefined),
    applyStylesToSVG: vi.fn().mockResolvedValue('<svg>styled</svg>'),
    destroy: vi.fn(),
  })),
  createStyleProcessor: vi.fn(() => ({
    applyStylesToCanvas: vi.fn().mockResolvedValue(undefined),
    applyStylesToSVG: vi.fn().mockResolvedValue('<svg>styled</svg>'),
    destroy: vi.fn(),
  })),
}))

describe('qRCodeGenerator', () => {
  let generator: QRCodeGenerator
  let mockOptions: QRCodeOptions

  beforeEach(() => {
    mockOptions = {
      data: 'test data',
      size: 200,
      margin: 4,
      errorCorrectionLevel: 'M',
      outputFormat: 'canvas',
    }
    generator = new QRCodeGenerator(mockOptions)
  })

  afterEach(() => {
    generator.destroy()
  })

  describe('constructor', () => {
    it('should create generator with options', () => {
      expect(generator).toBeInstanceOf(QRCodeGenerator)
      expect(generator.getOptions()).toEqual(expect.objectContaining(mockOptions))
    })

    it('should merge with default options', () => {
      const minimalOptions: QRCodeOptions = {
        data: 'test',
      }
      const gen = new QRCodeGenerator(minimalOptions)
      const options = gen.getOptions()

      expect(options.size).toBe(200) // default
      expect(options.margin).toBe(4) // default
      expect(options.data).toBe('test')

      gen.destroy()
    })
  })

  describe('generate', () => {
    it('should generate canvas output', async () => {
      const result = await generator.generate()

      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(HTMLCanvasElement)
      expect(result.format).toBe('canvas')
      expect(result.metrics).toBeDefined()
    })

    it('should generate SVG output', async () => {
      generator.updateOptions({ outputFormat: 'svg' })
      const result = await generator.generate()

      expect(result.success).toBe(true)
      expect(typeof result.data).toBe('string')
      expect(result.format).toBe('svg')
    })

    it('should generate image output', async () => {
      generator.updateOptions({ outputFormat: 'image' })
      const result = await generator.generate()

      expect(result.success).toBe(true)
      expect(typeof result.data).toBe('string')
      expect(result.format).toBe('image')
      expect(result.data.startsWith('data:image/')).toBe(true)
    })

    it('should handle generation errors', async () => {
      const QRCode = await import('qrcode')
      vi.mocked(QRCode.default.toCanvas).mockRejectedValueOnce(new Error('Generation failed'))

      const result = await generator.generate()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Generation failed')
    })

    it('should use cache when enabled', async () => {
      generator.updateOptions({ performance: { enableCache: true } })

      const result1 = await generator.generate()
      const result2 = await generator.generate()

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result2.fromCache).toBe(true)
    })

    it('should apply colors', async () => {
      generator.updateOptions({
        color: {
          foreground: '#ff0000',
          background: '#00ff00',
        },
      })

      const result = await generator.generate()
      expect(result.success).toBe(true)
    })

    it('should add logo when specified', async () => {
      generator.updateOptions({
        logo: {
          src: 'data:image/png;base64,test',
          size: 0.2,
        },
      })

      const result = await generator.generate()
      expect(result.success).toBe(true)
    })

    it('should record performance metrics', async () => {
      const result = await generator.generate()

      expect(result.metrics).toBeDefined()
      expect(result.metrics?.duration).toBeGreaterThanOrEqual(0)
      expect(result.metrics?.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('updateOptions', () => {
    it('should update options', () => {
      const newOptions = { size: 300, margin: 8 }
      generator.updateOptions(newOptions)

      const options = generator.getOptions()
      expect(options.size).toBe(300)
      expect(options.margin).toBe(8)
      expect(options.data).toBe('test data') // should keep existing
    })

    it('should clear cache when options change', async () => {
      generator.updateOptions({ performance: { enableCache: true } })

      await generator.generate() // populate cache
      generator.updateOptions({ size: 300 })

      const result = await generator.generate()
      expect(result.fromCache).toBeFalsy()
    })
  })

  describe('getOptions', () => {
    it('should return current options', () => {
      const options = generator.getOptions()
      expect(options).toEqual(expect.objectContaining(mockOptions))
    })
  })

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      generator.updateOptions({ performance: { enableCache: true } })

      await generator.generate() // populate cache
      generator.clearCache()

      const result = await generator.generate()
      expect(result.fromCache).toBeFalsy()
    })
  })

  describe('destroy', () => {
    it('should cleanup resources', () => {
      expect(() => generator.destroy()).not.toThrow()
    })
  })
})

describe('createQRCodeGenerator', () => {
  it('should create generator instance', () => {
    const options: QRCodeOptions = {
      data: 'test',
      size: 200,
    }

    const generator = createQRCodeGenerator(options)
    expect(generator).toBeInstanceOf(QRCodeGenerator)

    generator.destroy()
  })
})
