import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PdfPageRenderer } from '../../src/core/page-renderer'
import type { RenderOptions } from '../../src/core/types'

const createMockPage = () => ({
  pageNumber: 1,
  getViewport: vi.fn(({ scale = 1, rotation = 0 } = {}) => ({
    width: 595 * scale,
    height: 842 * scale,
    scale,
    rotation,
    transform: [scale, 0, 0, scale, 0, 0],
  })),
  render: vi.fn((context) => {
    // 模拟PDF.js渲染行为，检查上下文有效性
    if (!context || !context.canvasContext || !context.viewport) {
      return {
        promise: Promise.reject(new Error('Invalid render context')),
        cancel: vi.fn(),
      }
    }
    
    // 正常情况下返回成功的promise
    return {
      promise: Promise.resolve(),
      cancel: vi.fn(),
    }
  }),
})

describe('PdfPageRenderer - render cache', () => {
  let renderer: PdfPageRenderer
  let container: HTMLElement

  beforeEach(() => {
    renderer = new PdfPageRenderer()
    container = document.createElement('div')
  })

  it('reuses cached canvas for same document/page/scale/rotation', async () => {
    const page1 = createMockPage()
    const options: RenderOptions = { documentId: 'doc-1', scale: 1, rotation: 0 }

    await renderer.renderPage(page1 as any, container, options)
    expect(page1.render).toHaveBeenCalledTimes(1)

    // 第二次渲染新页面对象，但相同键，应命中缓存而不再调用 render
    const page2 = createMockPage()
    await renderer.renderPage(page2 as any, container, options)
    expect(page2.render).toHaveBeenCalledTimes(0)
  })

  it('misses cache when scale differs', async () => {
    const page1 = createMockPage()
    await renderer.renderPage(page1 as any, container, { documentId: 'doc-1', scale: 1 })
    expect(page1.render).toHaveBeenCalledTimes(1)

    const page2 = createMockPage()
    await renderer.renderPage(page2 as any, container, { documentId: 'doc-1', scale: 2 })
    expect(page2.render).toHaveBeenCalledTimes(1)
  })

  it('clears cache per document id', async () => {
    const page = createMockPage()
    await renderer.renderPage(page as any, container, { documentId: 'doc-1', scale: 1 })
    renderer.clearCacheForDocument('doc-1')

    const page2 = createMockPage()
    await renderer.renderPage(page2 as any, container, { documentId: 'doc-1', scale: 1 })
    expect(page2.render).toHaveBeenCalledTimes(1)
  })
})
