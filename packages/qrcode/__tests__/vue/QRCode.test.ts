import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import QRCode from '../../src/vue/QRCode.vue'

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
    getPerformanceMetrics: vi.fn().mockReturnValue([]),
    destroy: vi.fn(),
  })),
}))

describe('qRCode Vue Component', () => {
  let wrapper: VueWrapper<any>

  const defaultProps = {
    data: 'test data',
    size: 200,
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('component mounting', () => {
    it('should mount successfully', () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should render with default props', () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      const container = wrapper.find('.qrcode-container')
      expect(container.exists()).toBe(true)
    })
  })

  describe('props validation', () => {
    it('should accept valid data prop', () => {
      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          data: 'https://example.com',
        },
      })

      expect(wrapper.props('data')).toBe('https://example.com')
    })

    it('should accept valid size prop', () => {
      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          size: 300,
        },
      })

      expect(wrapper.props('size')).toBe(300)
    })

    it('should accept format prop', () => {
      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          format: 'svg',
        },
      })

      expect(wrapper.props('format')).toBe('svg')
    })

    it('should accept style options', () => {
      const styleOptions = {
        foreground: '#000000',
        background: '#ffffff',
      }

      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          style: styleOptions,
        },
      })

      expect(wrapper.props('style')).toEqual(styleOptions)
    })

    it('should accept logo options', () => {
      const logoOptions = {
        src: 'logo.png',
        size: 0.2,
      }

      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          logo: logoOptions,
        },
      })

      expect(wrapper.props('logo')).toEqual(logoOptions)
    })
  })

  describe('rendering formats', () => {
    it('should render canvas format by default', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
    })

    it('should render SVG format when specified', async () => {
      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          format: 'svg',
        },
      })

      await nextTick()

      const svgContainer = wrapper.find('.qrcode-svg')
      expect(svgContainer.exists()).toBe(true)
    })

    it('should render image format when specified', async () => {
      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          format: 'image',
        },
      })

      await nextTick()

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
    })
  })

  describe('reactivity', () => {
    it('should regenerate QR code when data changes', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      // Change data prop
      await wrapper.setProps({ data: 'new data' })

      // Should trigger regeneration
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should regenerate QR code when size changes', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      // Change size prop
      await wrapper.setProps({ size: 300 })

      // Should trigger regeneration
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should regenerate QR code when options change', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      // Change style options
      await wrapper.setProps({
        style: {
          foreground: '#ff0000',
          background: '#00ff00',
        },
      })

      // Should trigger regeneration
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('events', () => {
    it('should emit generated event on successful generation', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      const generatedEvents = wrapper.emitted('generated')
      expect(generatedEvents).toBeTruthy()
      expect(generatedEvents![0]).toBeDefined()
    })

    it('should emit error event on generation failure', async () => {
      // Mock generator to throw error
      const { QRCodeGenerator } = await import('../../src/core/generator')
      const mockGenerator = QRCodeGenerator as any
      mockGenerator.mockImplementation(() => ({
        generate: vi.fn().mockRejectedValue(new Error('Generation failed')),
        updateOptions: vi.fn(),
        clearCache: vi.fn(),
        getMetrics: vi.fn().mockReturnValue([]),
        destroy: vi.fn(),
      }))

      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      const errorEvents = wrapper.emitted('error')
      expect(errorEvents).toBeTruthy()
    })
  })

  describe('loading state', () => {
    it('should show loading state during generation', async () => {
      // Mock generator with delayed response
      const { QRCodeGenerator } = await import('../../src/core/generator')
      const mockGenerator = QRCodeGenerator as any
      mockGenerator.mockImplementation(() => ({
        generate: vi.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(resolve, 100)),
        ),
        updateOptions: vi.fn(),
        clearCache: vi.fn(),
        getMetrics: vi.fn().mockReturnValue([]),
        destroy: vi.fn(),
      }))

      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      // Should be loading initially
      expect(wrapper.vm.isLoading).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle invalid data gracefully', async () => {
      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          data: '',
        },
      })

      await nextTick()

      expect(wrapper.vm.error).toBeTruthy()
    })

    it('should handle invalid size gracefully', async () => {
      wrapper = mount(QRCode, {
        props: {
          ...defaultProps,
          size: -1,
        },
      })

      await nextTick()

      expect(wrapper.vm.error).toBeTruthy()
    })
  })

  describe('methods', () => {
    it('should expose regenerate method', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      expect(typeof wrapper.vm.regenerate).toBe('function')

      // Should be able to call regenerate
      await wrapper.vm.regenerate()
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should expose download method', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      expect(typeof wrapper.vm.download).toBe('function')

      // Should be able to call download
      expect(() => wrapper.vm.download('test.png')).not.toThrow()
    })

    it('should expose getMetrics method', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      expect(typeof wrapper.vm.getMetrics).toBe('function')

      const metrics = wrapper.vm.getMetrics()
      expect(Array.isArray(metrics)).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should cleanup resources on unmount', async () => {
      wrapper = mount(QRCode, {
        props: defaultProps,
      })

      await nextTick()

      const destroySpy = vi.spyOn(wrapper.vm.generator, 'destroy')

      wrapper.unmount()

      expect(destroySpy).toHaveBeenCalled()
    })
  })
})
