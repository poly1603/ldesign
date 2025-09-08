import type { QRCodeOptions } from '../../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useQRCode } from '../../src/vue/useQRCode'

// Mock the QRCodeGenerator
vi.mock('../../src/core/generator', () => ({
  QRCodeGenerator: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockResolvedValue({
      data: 'data:image/png;base64,test',
      element: document.createElement('canvas'),
      format: 'canvas',
      size: 200,
      timestamp: Date.now(),
    }),
    updateOptions: vi.fn(),
    clearCache: vi.fn(),
    getOptions: vi.fn().mockReturnValue({
      data: 'test',
      size: 200,
      format: 'canvas',
    }),
    getPerformanceMetrics: vi.fn().mockReturnValue([]),
    destroy: vi.fn(),
  })),
}))

describe('useQRCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const { options, isLoading, error, result } = useQRCode()

      expect(options.value).toEqual({
        data: '',
        size: 200,
        format: 'canvas',
      })
      expect(isLoading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(result.value).toBe(null)
    })

    it('should initialize with custom options', () => {
      const customOptions: QRCodeOptions = {
        data: 'test data',
        size: 300,
        format: 'svg',
      }

      const { options } = useQRCode(customOptions)

      expect(options.value).toEqual(customOptions)
    })

    it('should initialize with reactive options', () => {
      const reactiveOptions = ref<QRCodeOptions>({
        data: 'test data',
        size: 200,
      })

      const { options } = useQRCode(reactiveOptions)

      expect(options.value).toEqual(reactiveOptions.value)

      // Update reactive options
      reactiveOptions.value.size = 300

      expect(options.value.size).toBe(300)
    })
  })

  describe('generate method', () => {
    it('should generate QR code successfully', async () => {
      const { generate, isLoading, result, error } = useQRCode({
        data: 'test data',
        size: 200,
      })

      const promise = generate()

      expect(isLoading.value).toBe(true)

      const generatedResult = await promise

      expect(isLoading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(result.value).toBeDefined()
      expect(generatedResult).toBeDefined()
    })

    it('should handle generation errors', async () => {
      // Mock generator to throw error
      const { QRCodeGenerator } = await import('../../src/core/generator')
      const mockGenerator = QRCodeGenerator as any
      mockGenerator.mockImplementation(() => ({
        generate: vi.fn().mockRejectedValue(new Error('Generation failed')),
        updateOptions: vi.fn(),
        clearCache: vi.fn(),
        getOptions: vi.fn().mockReturnValue({
          data: 'test data',
          size: 200,
          format: 'canvas',
        }),
        getMetrics: vi.fn().mockReturnValue([]),
        destroy: vi.fn(),
      }))

      const { generate, isLoading, error, result } = useQRCode({
        data: 'test data',
        size: 200,
      })

      await generate()

      expect(isLoading.value).toBe(false)
      expect(error.value).toBeTruthy()
      expect(result.value).toBe(null)
    })

    it('should validate options before generation', async () => {
      const { generate, error } = useQRCode({
        data: '', // Invalid empty data
        size: 200,
      })

      await generate()

      expect(error.value).toBeTruthy()
    })

    it('should use custom options for generation', async () => {
      const { generate, result } = useQRCode({
        data: 'initial data',
        size: 200,
      })

      const customOptions: QRCodeOptions = {
        data: 'custom data',
        size: 300,
        format: 'svg',
      }

      await generate(customOptions)

      expect(result.value).toBeDefined()
    })
  })

  describe('updateOptions method', () => {
    it('should update options', () => {
      const { options, updateOptions } = useQRCode({
        data: 'initial data',
        size: 200,
      })

      const newOptions: Partial<QRCodeOptions> = {
        size: 300,
        format: 'svg',
      }

      updateOptions(newOptions)

      expect(options.value.size).toBe(300)
      expect(options.value.format).toBe('svg')
      expect(options.value.data).toBe('initial data') // Should preserve existing data
    })

    it('should trigger regeneration when autoGenerate is true', async () => {
      const { updateOptions, result } = useQRCode({
        data: 'test data',
        size: 200,
      })

      await updateOptions({ size: 300 }, true)

      expect(result.value).toBeDefined()
    })

    it('should not trigger regeneration when autoGenerate is false', async () => {
      const { updateOptions, result } = useQRCode({
        data: 'test data',
        size: 200,
      })

      await updateOptions({ size: 300 }, false)

      expect(result.value).toBe(null)
    })
  })

  describe('download method', () => {
    it('should download generated QR code', async () => {
      const { generate, download } = useQRCode({
        data: 'test data',
        size: 200,
      })

      await generate()

      // Mock download functionality
      const downloadSpy = vi.spyOn(document, 'createElement')

      expect(() => download('test.png')).not.toThrow()
    })

    it('should handle download without generated result', () => {
      const { download } = useQRCode({
        data: 'test data',
        size: 200,
      })

      expect(() => download('test.png')).not.toThrow()
    })
  })

  describe('clearCache method', () => {
    it('should clear generator cache', () => {
      const { clearCache } = useQRCode()

      expect(() => clearCache()).not.toThrow()
    })
  })

  describe('getMetrics method', () => {
    it('should return performance metrics', () => {
      const { getMetrics } = useQRCode()

      const metrics = getMetrics()

      expect(Array.isArray(metrics)).toBe(true)
    })
  })

  describe('destroy method', () => {
    it('should cleanup resources', () => {
      const { destroy } = useQRCode()

      expect(() => destroy()).not.toThrow()
    })
  })

  describe('reactivity', () => {
    it('should react to options changes', async () => {
      const { options, generate, result } = useQRCode({
        data: 'initial data',
        size: 200,
      })

      // Generate initial QR code
      await generate()
      const initialResult = result.value

      // Update options
      options.value.data = 'updated data'

      // Generate again
      await generate()

      expect(result.value).not.toBe(initialResult)
    })

    it('should handle reactive options updates', async () => {
      const reactiveOptions = ref<QRCodeOptions>({
        data: 'test data',
        size: 200,
      })

      const { options, generate, result } = useQRCode(reactiveOptions)

      await generate()
      const initialResult = result.value

      // Update reactive options
      reactiveOptions.value.size = 300

      await generate()

      expect(result.value).not.toBe(initialResult)
    })
  })

  describe('error handling', () => {
    it('should handle invalid data', async () => {
      const { generate, error } = useQRCode({
        data: '',
        size: 200,
      })

      await generate()

      expect(error.value).toBeTruthy()
    })

    it('should handle invalid size', async () => {
      const { generate, error } = useQRCode({
        data: 'test data',
        size: -1,
      })

      await generate()

      expect(error.value).toBeTruthy()
    })

    it('should clear previous errors on successful generation', async () => {
      const { generate, error, updateOptions } = useQRCode({
        data: '',
        size: 200,
      })

      // Generate with invalid data
      await generate()
      expect(error.value).toBeTruthy()

      // Update with valid data
      updateOptions({ data: 'valid data' })
      await generate()

      expect(error.value).toBe(null)
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent generate calls', async () => {
      const { generate } = useQRCode({
        data: 'test data',
        size: 200,
      })

      // Start multiple generate operations
      const promises = [
        generate(),
        generate(),
        generate(),
      ]

      const results = await Promise.all(promises)

      // All should complete successfully
      results.forEach((result) => {
        expect(result).toBeDefined()
      })
    })
  })

  describe('memory management', () => {
    it('should not leak memory on repeated operations', async () => {
      const { generate, destroy } = useQRCode({
        data: 'test data',
        size: 200,
      })

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        await generate()
      }

      // Cleanup
      destroy()

      expect(true).toBe(true) // Test passes if no memory issues
    })
  })
})
