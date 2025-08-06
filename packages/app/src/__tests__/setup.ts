import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 模拟全局对象
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

// 模拟 localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 配置 Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key, // 模拟国际化函数
}

// 模拟 CSS 模块
vi.mock('*.less', () => ({}))
vi.mock('*.css', () => ({}))

// 模拟图片和其他静态资源
vi.mock('*.svg', () => 'svg-mock')
vi.mock('*.png', () => 'png-mock')
vi.mock('*.jpg', () => 'jpg-mock')
vi.mock('*.jpeg', () => 'jpeg-mock')
vi.mock('*.gif', () => 'gif-mock')

// 模拟 @ldesign 包
vi.mock('@ldesign/engine', () => ({
  createApp: vi.fn(),
  useEngine: vi.fn(() => ({
    state: {
      get: vi.fn(),
      set: vi.fn(),
    },
    events: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    notifications: {
      show: vi.fn(),
      hide: vi.fn(),
      clear: vi.fn(),
    },
  })),
}))

vi.mock('@ldesign/router', () => ({
  createRouter: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: { value: { path: '/', query: {} } },
  })),
}))

vi.mock('@ldesign/store', () => ({
  createStore: vi.fn(),
}))

vi.mock('@ldesign/i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: 'zh-CN',
    setLocale: vi.fn(),
  })),
}))

vi.mock('@ldesign/template', () => ({
  useTemplate: vi.fn(() => ({
    availableTemplates: [],
    switchTemplate: vi.fn(),
    loading: false,
  })),
  TemplateRenderer: {
    name: 'TemplateRenderer',
    template: '<div>Template Renderer Mock</div>',
  },
}))

vi.mock('@ldesign/color', () => ({
  generatePalette: vi.fn(),
  hexToRgb: vi.fn(),
  rgbToHex: vi.fn(),
}))

vi.mock('@ldesign/crypto', () => ({
  md5: vi.fn(),
  sha256: vi.fn(),
  aesEncrypt: vi.fn(),
  aesDecrypt: vi.fn(),
  generateUUID: vi.fn(() => 'mock-uuid'),
}))

vi.mock('@ldesign/device', () => ({
  detectDevice: vi.fn(() => ({
    type: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })),
  isMobile: vi.fn(() => false),
  isTablet: vi.fn(() => false),
  isDesktop: vi.fn(() => true),
}))

vi.mock('@ldesign/http', () => ({
  createHttpClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  })),
}))

vi.mock('@ldesign/watermark', () => ({
  createWatermark: vi.fn(),
  WatermarkManager: vi.fn(),
}))

// 全局测试配置
beforeEach(() => {
  // 清除所有模拟调用
  vi.clearAllMocks()
  
  // 重置 localStorage
  localStorage.clear()
})
