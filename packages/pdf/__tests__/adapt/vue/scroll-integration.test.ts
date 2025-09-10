/**
 * PDF预览器滚动集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PdfViewer from '../../../src/adapt/vue/PdfViewer'

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: {
    workerSrc: '',
    workerPort: null,
  },
}))

// Mock file for testing
const createMockFile = () => {
  const content = new Uint8Array([1, 2, 3, 4]) // Minimal PDF-like content
  return new File([content], 'test.pdf', { type: 'application/pdf' })
}

// Mock PDF document
const createMockDocument = (numPages = 3) => ({
  numPages,
  fingerprint: 'test-fingerprint',
  getPage: vi.fn((pageNumber) => Promise.resolve({
    pageNumber,
    getViewport: vi.fn(({ scale = 1, rotation = 0 } = {}) => ({
      width: 595 * scale,
      height: 842 * scale,
      scale,
      rotation,
      transform: [scale, 0, 0, scale, 0, 0],
    })),
    render: vi.fn(() => ({
      promise: Promise.resolve(),
      cancel: vi.fn(),
    })),
    getTextContent: vi.fn(() => Promise.resolve({ items: [] })),
    getAnnotations: vi.fn(() => Promise.resolve([])),
  })),
  getMetadata: vi.fn(() => Promise.resolve({
    info: {
      Title: 'Test PDF',
      Author: 'Test Author',
    },
  })),
  destroy: vi.fn(() => Promise.resolve()),
})

describe('PDF Viewer Scroll Integration', () => {
  let wrapper: any
  let mockDocument: any

  beforeEach(async () => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>'

    // Create mock document
    mockDocument = createMockDocument(5) // 5 pages for testing

    // Mock PDF.js getDocument - use vi.mocked to properly mock the already mocked function
    const pdfjsLib = await import('pdfjs-dist')
    vi.mocked(pdfjsLib.getDocument).mockReturnValue({
      promise: Promise.resolve(mockDocument),
    } as any)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Height Mode Switching', () => {
    it('should switch between auto and custom height modes', async () => {
      wrapper = mount(PdfViewer, {
        props: {
          src: createMockFile(),
          heightMode: 'auto',
        },
        attachTo: '#app',
      })

      await nextTick()

      // Initially in auto mode
      expect(wrapper.props('heightMode')).toBe('auto')

      // Switch to custom mode
      await wrapper.setProps({ heightMode: 'custom', height: '600px' })
      await nextTick()

      expect(wrapper.props('heightMode')).toBe('custom')
      expect(wrapper.props('height')).toBe('600px')
    })

    it('should calculate auto height correctly', async () => {
      wrapper = mount(PdfViewer, {
        props: {
          src: createMockFile(),
          heightMode: 'auto',
        },
        attachTo: '#app',
      })

      await nextTick()

      // Wait for document to load
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = wrapper.find('.pdf-container')
      expect(container.exists()).toBe(true)

      // In auto mode, container should have calculated height
      const containerElement = container.element as HTMLElement
      expect(containerElement.style.height).toBeTruthy()
    })
  })

  describe('Scroll Event Handling', () => {
    it('should handle scroll events in custom height mode', async () => {
      const onVisiblePagesChanged = vi.fn()

      wrapper = mount(PdfViewer, {
        props: {
          src: createMockFile(),
          heightMode: 'custom',
          height: '600px',
        },
        listeners: {
          visiblePagesChanged: onVisiblePagesChanged,
        },
        attachTo: '#app',
      })

      await nextTick()

      // Wait for document to load and render
      await new Promise(resolve => setTimeout(resolve, 200))

      const container = wrapper.find('.pdf-container')
      const containerElement = container.element as HTMLElement

      // Simulate scroll event
      containerElement.scrollTop = 100
      containerElement.dispatchEvent(new Event('scroll'))

      // Wait for debounced scroll handler
      await new Promise(resolve => setTimeout(resolve, 200))

      // Should have triggered visible pages changed event
      expect(onVisiblePagesChanged).toHaveBeenCalled()
    })

    it('should not handle scroll events in auto mode', async () => {
      const onVisiblePagesChanged = vi.fn()

      wrapper = mount(PdfViewer, {
        props: {
          src: createMockFile(),
          heightMode: 'auto',
        },
        listeners: {
          visiblePagesChanged: onVisiblePagesChanged,
        },
        attachTo: '#app',
      })

      await nextTick()

      const container = wrapper.find('.pdf-container')
      const containerElement = container.element as HTMLElement

      // Simulate scroll event (should be ignored in auto mode)
      containerElement.scrollTop = 100
      containerElement.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 200))

      // Should not have triggered visible pages changed event
      expect(onVisiblePagesChanged).not.toHaveBeenCalled()
    })
  })

  describe('Thumbnail Interaction', () => {
    it('should scroll to page when thumbnail is clicked in custom mode', async () => {
      wrapper = mount(PdfViewer, {
        props: {
          src: createMockFile(),
          heightMode: 'custom',
          height: '600px',
          enableThumbnails: true,
        },
        attachTo: '#app',
      })

      await nextTick()

      // Wait for document to load and thumbnails to generate
      await new Promise(resolve => setTimeout(resolve, 300))

      const thumbnails = wrapper.findAll('.pdf-thumbnail')
      expect(thumbnails.length).toBeGreaterThan(0)

      // Mock scrollTo method
      const container = wrapper.find('.pdf-container')
      const containerElement = container.element as HTMLElement
      const scrollToSpy = vi.spyOn(containerElement, 'scrollTo').mockImplementation(() => { })

      // Click on second thumbnail
      if (thumbnails.length > 1) {
        await thumbnails[1].trigger('click')
        await nextTick()

        // Should have called scrollTo
        expect(scrollToSpy).toHaveBeenCalled()
      }
    })

    it('should update thumbnail active state on scroll', async () => {
      wrapper = mount(PdfViewer, {
        props: {
          src: createMockFile(),
          heightMode: 'custom',
          height: '600px',
          enableThumbnails: true,
        },
        attachTo: '#app',
      })

      await nextTick()

      // Wait for document to load and thumbnails to generate
      await new Promise(resolve => setTimeout(resolve, 300))

      const thumbnails = wrapper.findAll('.pdf-thumbnail')
      expect(thumbnails.length).toBeGreaterThan(0)

      // Initially first thumbnail should be active
      expect(thumbnails[0].classes()).toContain('active')

      // Simulate page change
      const container = wrapper.find('.pdf-container')
      const containerElement = container.element as HTMLElement

      // Simulate scroll to trigger page change
      containerElement.scrollTop = 500
      containerElement.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 200))

      // Active state should have updated
      const updatedThumbnails = wrapper.findAll('.pdf-thumbnail')
      const activeCount = updatedThumbnails.filter(thumb => thumb.classes().includes('active')).length
      expect(activeCount).toBe(1) // Only one thumbnail should be active
    })
  })

  describe('Exposed Methods', () => {
    it('should expose scroll-related methods', async () => {
      wrapper = mount(PdfViewer, {
        props: {
          src: createMockFile(),
          heightMode: 'custom',
          height: '600px',
        },
        attachTo: '#app',
      })

      await nextTick()

      // Wait for component to be ready
      await new Promise(resolve => setTimeout(resolve, 200))

      const vm = wrapper.vm

      // Check exposed methods exist
      expect(typeof vm.getPageRenderInfos).toBe('function')
      expect(typeof vm.calculateVisiblePages).toBe('function')
      expect(typeof vm.getPageScrollPosition).toBe('function')

      // Test methods return expected types
      const pageInfos = vm.getPageRenderInfos()
      expect(Array.isArray(pageInfos)).toBe(true)

      const visiblePages = vm.calculateVisiblePages(0, 600)
      expect(visiblePages).toHaveProperty('currentPage')
      expect(visiblePages).toHaveProperty('visiblePages')
      expect(Array.isArray(visiblePages.visiblePages)).toBe(true)

      const scrollPosition = vm.getPageScrollPosition(1)
      expect(typeof scrollPosition).toBe('number')
    })
  })
})
