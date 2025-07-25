import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 模拟工具函数测试
describe('color Utils', () => {
  // 模拟颜色转换函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  it('should convert hex to rgb correctly', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('should handle invalid hex colors', () => {
    expect(hexToRgb('invalid')).toBeNull()
    expect(hexToRgb('#gg0000')).toBeNull()
    expect(hexToRgb('#ff00')).toBeNull()
  })

  it('should convert rgb to hex correctly', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })
})

describe('device Utils', () => {
  // 模拟设备检测函数
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const getOS = () => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows'))
      return 'Windows'
    if (userAgent.includes('Mac'))
      return 'macOS'
    if (userAgent.includes('Linux'))
      return 'Linux'
    if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
      return 'iOS'
    if (userAgent.includes('Android'))
      return 'Android'
    return 'Unknown'
  }

  beforeEach(() => {
    // 重置 navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    })
  })

  it('should detect desktop correctly', () => {
    expect(isMobile()).toBe(false)
    expect(getOS()).toBe('Windows')
  })

  it('should detect mobile devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    })

    expect(isMobile()).toBe(true)
    expect(getOS()).toBe('iOS')
  })

  it('should detect Android devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
    })

    expect(isMobile()).toBe(true)
    expect(getOS()).toBe('Android')
  })
})

describe('hTTP Utils', () => {
  // 模拟 HTTP 客户端
  class HttpClient {
    private baseURL: string
    private timeout: number

    constructor(config: { baseURL?: string, timeout?: number } = {}) {
      this.baseURL = config.baseURL || ''
      this.timeout = config.timeout || 5000
    }

    async get(url: string) {
      return this.request('GET', url)
    }

    async post(url: string, data?: any) {
      return this.request('POST', url, data)
    }

    private async request(method: string, url: string, data?: any) {
      const fullUrl = this.baseURL + url
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      return fetch(fullUrl, options)
    }
  }

  beforeEach(() => {
    // Mock fetch
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create http client with default config', () => {
    const client = new HttpClient()
    expect(client).toBeInstanceOf(HttpClient)
  })

  it('should create http client with custom config', () => {
    const client = new HttpClient({
      baseURL: 'https://api.example.com',
      timeout: 10000,
    })
    expect(client).toBeInstanceOf(HttpClient)
  })

  it('should make GET request', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) }
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

    const client = new HttpClient({ baseURL: 'https://api.example.com' })
    const response = await client.get('/users')

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    expect(response).toBe(mockResponse)
  })

  it('should make POST request with data', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ id: 1 }) }
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

    const client = new HttpClient({ baseURL: 'https://api.example.com' })
    const data = { name: 'John', email: 'john@example.com' }
    const response = await client.post('/users', data)

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    expect(response).toBe(mockResponse)
  })
})

describe('size Utils', () => {
  // 模拟尺寸工具函数
  const px2rem = (px: number, rootFontSize = 16) => {
    return px / rootFontSize
  }

  const rem2px = (rem: number, rootFontSize = 16) => {
    return rem * rootFontSize
  }

  const getViewportSize = () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  it('should convert px to rem correctly', () => {
    expect(px2rem(16)).toBe(1)
    expect(px2rem(32)).toBe(2)
    expect(px2rem(8)).toBe(0.5)
    expect(px2rem(24, 12)).toBe(2)
  })

  it('should convert rem to px correctly', () => {
    expect(rem2px(1)).toBe(16)
    expect(rem2px(2)).toBe(32)
    expect(rem2px(0.5)).toBe(8)
    expect(rem2px(2, 12)).toBe(24)
  })

  it('should get viewport size correctly', () => {
    const size = getViewportSize()
    expect(size.width).toBe(1024)
    expect(size.height).toBe(768)
  })
})
