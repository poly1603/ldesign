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
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ width: 200, height: 100, top: 0, left: 0 })),
  }

  // 模拟 createElement 对于canvas
  const originalCreateElement = document.createElement
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas as any
    }
    return originalCreateElement.call(document, tagName)
  })
  
  // 模拟 SVG 支持
  const originalCreateElementNS = document.createElementNS
  if (!originalCreateElementNS) {
    document.createElementNS = vi.fn((namespace, tagName) => {
      if (namespace === 'http://www.w3.org/2000/svg' && tagName === 'svg') {
        const mockSVG = {
          createSVGRect: vi.fn(() => ({
            x: 0, y: 0, width: 0, height: 0
          })),
          getAttribute: vi.fn(),
          setAttribute: vi.fn(),
          appendChild: vi.fn(),
          removeChild: vi.fn(),
          style: {}
        }
        return mockSVG
      }
      return originalCreateElement.call(document, tagName)
    })
  } else {
    vi.spyOn(document, 'createElementNS').mockImplementation((namespace, tagName) => {
      if (namespace === 'http://www.w3.org/2000/svg' && tagName === 'svg') {
        const mockSVG = {
          createSVGRect: vi.fn(() => ({
            x: 0, y: 0, width: 0, height: 0
          })),
          getAttribute: vi.fn(),
          setAttribute: vi.fn(),
          appendChild: vi.fn(),
          removeChild: vi.fn(),
          style: {}
        }
        return mockSVG
      }
      return originalCreateElementNS.call(document, namespace, tagName)
    })
  }

  // 模拟 Image 构造函数
  global.Image = class MockImage {
    onload: ((this: GlobalEventHandlers, ev: Event) => any) | null = null
    onerror: ((this: GlobalEventHandlers, ev: Event | string) => any) | null = null
    src: string = ''
    crossOrigin: string | null = null
    naturalWidth: number = 100
    naturalHeight: number = 100
    width: number = 100
    height: number = 100
    complete: boolean = true
    style: any
    alt: string = ''
    id: string = ''
    className: string = ''
    tagName: string = 'IMG'
    nodeType: number = 1 // Element node
    nodeName: string = 'IMG'
    parentNode: any = null
    parentElement: any = null
    children: any[] = []
    childNodes: any[] = []
    firstChild: any = null
    lastChild: any = null
    nextSibling: any = null
    previousSibling: any = null

    private _initStyle() {
      // 创建一个类似 CSSStyleDeclaration 的对象
      const styleObj: any = {}
      const styleProperties = [
        'width', 'height', 'display', 'maxWidth', 'maxHeight', 'opacity',
        'position', 'left', 'top', 'zIndex', 'pointerEvents', 'userSelect',
        'webkitUserSelect', 'mozUserSelect', 'msUserSelect', 'webkitUserDrag',
        'mozUserDrag', 'msUserDrag', 'alignItems', 'justifyContent', 
        'whiteSpace', 'overflow', 'fontSize', 'fontFamily', 'fontWeight', 
        'fontStyle', 'color', 'backgroundColor', 'border', 'borderRadius',
        'textShadow', 'boxShadow', 'padding', 'mixBlendMode', 'filter', 
        'background', 'textDecoration', 'transform'
      ]
      
      styleProperties.forEach(prop => {
        styleObj[prop] = ''
      })
      
      return styleObj
    }

    constructor() {
      // 初始化 style 对象
      this.style = this._initStyle()
      
      // 同步触发 load 事件，避免异步问题
      Promise.resolve().then(() => {
        if (this.onload) {
          this.onload(new Event('load'))
        }
      })
    }

    cloneNode(deep?: boolean): MockImage {
      const clone = new MockImage()
      clone.src = this.src
      clone.crossOrigin = this.crossOrigin
      clone.naturalWidth = this.naturalWidth
      clone.naturalHeight = this.naturalHeight
      clone.width = this.width
      clone.height = this.height
      clone.complete = this.complete
      clone.style = clone._initStyle()
      // 复制已设置的样式属性
      Object.assign(clone.style, this.style)
      clone.alt = this.alt
      clone.id = this.id
      clone.className = this.className
      return clone
    }

    // DOM Node interface methods
    appendChild(child: any): any {
      this.children.push(child)
      this.childNodes.push(child)
      child.parentNode = this
      child.parentElement = this
      return child
    }

    removeChild(child: any): any {
      const index = this.children.indexOf(child)
      if (index > -1) {
        this.children.splice(index, 1)
        this.childNodes.splice(index, 1)
        child.parentNode = null
        child.parentElement = null
      }
      return child
    }

    insertBefore(newChild: any, referenceChild: any): any {
      if (!referenceChild) {
        return this.appendChild(newChild)
      }
      const index = this.children.indexOf(referenceChild)
      if (index > -1) {
        this.children.splice(index, 0, newChild)
        this.childNodes.splice(index, 0, newChild)
        newChild.parentNode = this
        newChild.parentElement = this
      }
      return newChild
    }

    contains(other: any): boolean {
      return this === other || this.children.includes(other)
    }

    setAttribute(name: string, value: string): void {
      if (name === 'src') {
        this.src = value
      } else if (name === 'crossOrigin') {
        this.crossOrigin = value
      } else if (name === 'alt') {
        this.alt = value
      } else if (name === 'id') {
        this.id = value
      } else if (name === 'class') {
        this.className = value
      }
    }

    getAttribute(name: string): string | null {
      if (name === 'src') {
        return this.src
      } else if (name === 'crossOrigin') {
        return this.crossOrigin
      } else if (name === 'alt') {
        return this.alt
      } else if (name === 'id') {
        return this.id
      } else if (name === 'class') {
        return this.className
      }
      return null
    }

    addEventListener(type: string, listener: EventListener): void {
      if (type === 'load') {
        this.onload = listener as any
      } else if (type === 'error') {
        this.onerror = listener as any
      }
    }

    removeEventListener(type: string, listener: EventListener): void {
      if (type === 'load') {
        this.onload = null
      } else if (type === 'error') {
        this.onerror = null
      }
    }

    getBoundingClientRect(): DOMRect {
      return {
        width: this.width,
        height: this.height,
        top: 0,
        left: 0,
        bottom: this.height,
        right: this.width,
        x: 0,
        y: 0
      } as DOMRect
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
