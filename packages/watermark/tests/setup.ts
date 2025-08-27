/**
 * 测试环境设置
 */

import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest'

// 全局测试设置
beforeAll(() => {
  // 设置全局测试环境
  global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  }

  // 模拟 IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
  }

  // 模拟 MutationObserver
  global.MutationObserver = class MutationObserver {
    constructor() { }
    observe() { }
    disconnect() { }
  }

  // 模拟 requestAnimationFrame
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16)
  }

  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id)
  }

  // 模拟 matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // 模拟 Canvas API
  const mockCanvas = {
    getContext: vi.fn(() => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      shadowColor: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(400),
      })),
    })),
    toDataURL: vi.fn(() => 'data:image/png;base64,test'),
    width: 0,
    height: 0,
    style: {},
  }

  // 模拟 createElement 对于 canvas
  const originalCreateElement = document.createElement
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas as any
    }
    return originalCreateElement.call(document, tagName)
  })

  // 模拟 Image 构造函数
  global.Image = class MockImage {
    onload: ((this: GlobalEventHandlers, ev: Event) => any) | null = null
    onerror: ((this: GlobalEventHandlers, ev: Event | string) => any) | null = null
    src: string = ''
    crossOrigin: string | null = null
    naturalWidth: number = 100
    naturalHeight: number = 100

    constructor() {
      setTimeout(() => {
        if (this.onload) {
          this.onload(new Event('load'))
        }
      }, 10)
    }
  } as any

  // 模拟 Web Animations API
  if (!Element.prototype.animate) {
    Element.prototype.animate = vi.fn(() => ({
      play: vi.fn(),
      pause: vi.fn(),
      cancel: vi.fn(),
      finish: vi.fn(),
      reverse: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      playState: 'running',
      playbackRate: 1,
      currentTime: 0,
      startTime: 0,
      timeline: null,
      effect: null,
      ready: Promise.resolve(),
      finished: Promise.resolve(),
    }))
  }

  // 模拟 getAnimations
  if (!Element.prototype.getAnimations) {
    Element.prototype.getAnimations = vi.fn(() => [])
  }

  if (!Document.prototype.getAnimations) {
    Document.prototype.getAnimations = vi.fn(() => [])
  }
})

beforeEach(() => {
  // 每个测试前的设置
  document.body.innerHTML = ''
})

afterEach(() => {
  // 每个测试后的清理
  document.body.innerHTML = ''
})

afterAll(() => {
  // 全局测试清理
})
