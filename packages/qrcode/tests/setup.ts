import { vi } from 'vitest'

// Mock qrcode library globally
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockImplementation(async (canvas, text, options) => {
      // Mock canvas drawing
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      return Promise.resolve()
    }),
    toString: vi.fn().mockResolvedValue('<svg width="200" height="200"><rect width="200" height="200" fill="#000"/></svg>'),
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,test'),
  },
}))

// Mock Canvas API
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  })),
})

// Mock HTMLCanvasElement.prototype.toDataURL
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: vi.fn(() => 'data:image/png;base64,test'),
})

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 0
  height = 0

  constructor() {
    setTimeout(() => {
      this.width = 100
      this.height = 100
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
} as any

// Mock DOMParser
global.DOMParser = class {
  parseFromString(str: string, type: string) {
    const doc = {
      documentElement: {
        outerHTML: str,
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        appendChild: vi.fn(),
        insertBefore: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({
          width: 200,
          height: 200,
          top: 0,
          left: 0,
          bottom: 200,
          right: 200,
          x: 0,
          y: 0,
        })),
      },
    }
    return doc
  }
} as any

// Mock XMLSerializer
global.XMLSerializer = class {
  serializeToString(node: any) {
    return node.outerHTML || '<svg></svg>'
  }
} as any

// Mock document.createElementNS for SVG
Object.defineProperty(document, 'createElementNS', {
  value: vi.fn((namespace: string, tagName: string) => {
    const element = {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      outerHTML: `<${tagName}></${tagName}>`,
      innerHTML: '',
      getBoundingClientRect: vi.fn(() => ({
        width: 200,
        height: 200,
        top: 0,
        left: 0,
        bottom: 200,
        right: 200,
        x: 0,
        y: 0,
      })),
    }
    return element
  }),
  writable: true,
})

// Mock document.body methods
Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
})

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
})

// Mock document.createElement for <a> tags
const originalCreateElement = document.createElement.bind(document)
Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    const element = originalCreateElement(tagName)

    if (tagName === 'a') {
      element.click = vi.fn()
      Object.defineProperty(element, 'download', {
        value: '',
        writable: true,
      })
      Object.defineProperty(element, 'href', {
        value: '',
        writable: true,
      })
    }

    return element
  }),
})
